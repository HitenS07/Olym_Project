const express = require('express');
const router = express.Router();

// State variables for squat detection
let counter = 0;
let stage = "UP";
let lastSquatTime = 0;
let consecutiveFrames = 0;
const FRAMES_REQUIRED = 3;
const COOLDOWN = 500; // 500ms cooldown

// Angle thresholds (lowered for testing)
const KNEE_ANGLE_THRESHOLD = 160;
const HIP_ANGLE_THRESHOLD = 160;
const MIN_KNEE_ANGLE = 50;
const MAX_KNEE_ANGLE = 170;
const MIN_HIP_ANGLE = 50;
const MAX_HIP_ANGLE = 170;

// --- Biceps Curl Detection State ---
let bicepsCounter = 0;
let bicepsStage = "DOWN";
let bicepsLastCurlTime = 0;
let bicepsConsecutiveFrames = 0;
const BICEPS_FRAMES_REQUIRED = 3;
const BICEPS_COOLDOWN = 500; // ms
const ELBOW_ANGLE_THRESHOLD = 50; // flexed
const ELBOW_ANGLE_UPPER = 160; // extended

// Calculate angle between three points
function calculateAngle(a, b, c) {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle;
}

// Validate form
function validateForm(landmarks) {
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];
  const leftHip = landmarks[23];
  const rightHip = landmarks[24];

  const leftKneeAligned = Math.abs(leftKnee.x - leftAnkle.x) < 0.2;
  const rightKneeAligned = Math.abs(rightKnee.x - rightAnkle.x) < 0.2;
  const hipsLevel = Math.abs(leftHip.y - rightHip.y) < 0.15;

  return leftKneeAligned && rightKneeAligned && hipsLevel;
}

// Detect squat
function detectSquat(landmarks) {
  // Get coordinates
  const leftHip = landmarks[23];
  const leftKnee = landmarks[25];
  const leftAnkle = landmarks[27];
  const leftShoulder = landmarks[11];
  const rightHip = landmarks[24];
  const rightKnee = landmarks[26];
  const rightAnkle = landmarks[28];
  const rightShoulder = landmarks[12];

  // Calculate angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const leftHipAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const rightHipAngle = calculateAngle(rightShoulder, rightHip, rightKnee);

  // Average the angles
  const kneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  const hipAngle = (leftHipAngle + rightHipAngle) / 2;

  // Validate form
  const formValid = validateForm(landmarks);

  // Check if angles are within valid ranges
  if (kneeAngle < MIN_KNEE_ANGLE || kneeAngle > MAX_KNEE_ANGLE ||
      hipAngle < MIN_HIP_ANGLE || hipAngle > MAX_HIP_ANGLE) {
    return { isSquat: false, kneeAngle, hipAngle };
  }

  // Check if both knee and hip angles are below threshold and form is valid
  return {
    isSquat: kneeAngle < KNEE_ANGLE_THRESHOLD && hipAngle < HIP_ANGLE_THRESHOLD && formValid,
    kneeAngle,
    hipAngle
  };
}

// Process frame for squat detection
router.post('/squats/process', (req, res) => {
  try {
    const { landmarks } = req.body;
    
    // Log the first few landmarks for debugging
    console.log('Received landmarks:', Array.isArray(landmarks) ? landmarks.slice(0, 5) : landmarks);
    if (!landmarks || !Array.isArray(landmarks)) {
      console.error('Invalid landmarks data received:', landmarks);
      return res.status(400).json({ error: 'Invalid landmarks data' });
    }

    // Detect squat
    const { isSquat, kneeAngle, hipAngle } = detectSquat(landmarks);
    const currentTime = Date.now();

    // Log angles and detection result for every frame
    console.log(`Angles: knee=${kneeAngle}, hip=${hipAngle}, isSquat=${isSquat}`);

    // State machine for squat detection
    if (isSquat) {
      consecutiveFrames++;
      console.log('Consecutive frames:', consecutiveFrames);
      
      if (consecutiveFrames >= FRAMES_REQUIRED && currentTime - lastSquatTime > COOLDOWN) {
        if (stage === "UP") {
          counter++;
          lastSquatTime = currentTime;
          console.log('Squat counted! Total:', counter);
        }
        stage = "DOWN";
        console.log('Stage changed to DOWN');
      }
    } else {
      if (consecutiveFrames > 0) {
        consecutiveFrames--;
      }
      if (consecutiveFrames === 0) {
        stage = "UP";
        console.log('Stage changed to UP');
      }
    }

    // Send back the results
    const response = {
      counter,
      stage,
      angles: {
        knee: kneeAngle,
        hip: hipAngle
      }
    };
    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error processing frame:', error);
    res.status(500).json({ error: 'Error processing frame' });
  }
});

// Reset squat counter
router.post('/squats/reset', (req, res) => {
  try {
    counter = 0;
    stage = "UP";
    lastSquatTime = 0;
    consecutiveFrames = 0;
    console.log('Counter reset');
    res.json({ message: 'Counter reset successfully' });
  } catch (error) {
    console.error('Error resetting counter:', error);
    res.status(500).json({ error: 'Error resetting counter' });
  }
});

function calculateElbowAngle(shoulder, elbow, wrist) {
  const radians = Math.atan2(wrist.y - elbow.y, wrist.x - elbow.x) - Math.atan2(shoulder.y - elbow.y, shoulder.x - elbow.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return angle;
}

// Biceps curl detection for right arm (can be extended for both arms)
function detectBicepsCurl(landmarks) {
  const rightShoulder = landmarks[12];
  const rightElbow = landmarks[14];
  const rightWrist = landmarks[16];
  const angle = calculateElbowAngle(rightShoulder, rightElbow, rightWrist);
  return angle;
}

router.post('/biceps/process', (req, res) => {
  try {
    const { landmarks } = req.body;
    if (!landmarks || !Array.isArray(landmarks)) {
      return res.status(400).json({ error: 'Invalid landmarks data' });
    }
    const elbowAngle = detectBicepsCurl(landmarks);
    const currentTime = Date.now();
    // State machine for biceps curl detection
    if (elbowAngle < ELBOW_ANGLE_THRESHOLD) {
      bicepsConsecutiveFrames++;
      if (bicepsConsecutiveFrames >= BICEPS_FRAMES_REQUIRED && currentTime - bicepsLastCurlTime > BICEPS_COOLDOWN) {
        if (bicepsStage === "DOWN") {
          bicepsCounter++;
          bicepsLastCurlTime = currentTime;
        }
        bicepsStage = "UP";
      }
    } else if (elbowAngle > ELBOW_ANGLE_UPPER) {
      bicepsConsecutiveFrames = 0;
      bicepsStage = "DOWN";
    }
    res.json({
      counter: bicepsCounter,
      stage: bicepsStage,
      angle: elbowAngle
    });
  } catch (error) {
    res.status(500).json({ error: 'Error processing frame' });
  }
});

// Reset biceps counter
router.post('/biceps/reset', (req, res) => {
  try {
    bicepsCounter = 0;
    bicepsStage = "DOWN";
    bicepsLastCurlTime = 0;
    bicepsConsecutiveFrames = 0;
    res.json({ message: 'Biceps counter reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error resetting biceps counter' });
  }
});

module.exports = router;
