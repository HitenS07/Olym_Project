class SquatDetector {
  constructor() {
    this.counter = 0;
    this.stage = null;
    this.min_ang = 0;
    this.min_ang_hip = 0;
    this.last_squat_time = 0;
    this.cooldown = 1000; // 1 second cooldown
    this.consecutive_frames = 0;
    this.frames_required = 3; // Reduced for more responsive detection
    this.angle_history = []; // For smoothing
    this.history_size = 5; // Number of frames to average
  }

  calculate_angle(p1, p2, p3) {
    if (!p1 || !p2 || !p3) return 0;
    
    const radians = Math.atan2(p3.y - p2.y, p3.x - p2.x) - 
                   Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  smooth_angle(new_angle) {
    this.angle_history.push(new_angle);
    if (this.angle_history.length > this.history_size) {
      this.angle_history.shift();
    }
    return this.angle_history.reduce((a, b) => a + b, 0) / this.angle_history.length;
  }

  validate_form(landmarks) {
    // Get key points
    const left_hip = landmarks[23];
    const left_knee = landmarks[25];
    const left_ankle = landmarks[27];
    const right_hip = landmarks[24];
    const right_knee = landmarks[26];
    const right_ankle = landmarks[28];

    // Check if knees are aligned with ankles (side view)
    const left_knee_aligned = Math.abs(left_knee.x - left_ankle.x) < 0.1;
    const right_knee_aligned = Math.abs(right_knee.x - right_ankle.x) < 0.1;

    // Check if hips are level
    const hips_level = Math.abs(left_hip.y - right_hip.y) < 0.1;

    return left_knee_aligned && right_knee_aligned && hips_level;
  }

  detect_squat(landmarks) {
    // Get coordinates for left leg
    const left_hip = landmarks[23];
    const left_knee = landmarks[25];
    const left_ankle = landmarks[27];
    const left_shoulder = landmarks[11];

    // Get coordinates for right leg
    const right_hip = landmarks[24];
    const right_knee = landmarks[26];
    const right_ankle = landmarks[28];
    const right_shoulder = landmarks[12];

    // Calculate angles for left leg
    const left_knee_angle = this.calculate_angle(left_hip, left_knee, left_ankle);
    const left_hip_angle = this.calculate_angle(left_shoulder, left_hip, left_knee);

    // Calculate angles for right leg
    const right_knee_angle = this.calculate_angle(right_hip, right_knee, right_ankle);
    const right_hip_angle = this.calculate_angle(right_shoulder, right_hip, right_knee);

    // Average the angles
    const knee_angle = this.smooth_angle((left_knee_angle + right_knee_angle) / 2);
    const hip_angle = this.smooth_angle((left_hip_angle + right_hip_angle) / 2);

    // Validate form
    const form_valid = this.validate_form(landmarks);

    // Check if angles are within valid ranges
    if (knee_angle < 60 || knee_angle > 170 || hip_angle < 60 || hip_angle > 170) {
      return false;
    }

    // Check if both knee and hip angles are below threshold and form is valid
    return knee_angle < 110 && hip_angle < 140 && form_valid;
  }

  process_frame(landmarks) {
    const current_time = Date.now();
    const is_squat = this.detect_squat(landmarks);

    // Update consecutive frames counter
    if (is_squat) {
      this.consecutive_frames++;
    } else {
      this.consecutive_frames = 0;
    }

    // Check if we have enough consecutive frames and cooldown has passed
    if (this.consecutive_frames >= this.frames_required && 
        current_time - this.last_squat_time > this.cooldown) {
      if (this.stage === 'UP') {
        this.counter++;
        this.last_squat_time = current_time;
      }
      this.stage = 'DOWN';
    } else if (!is_squat) {
      this.stage = 'UP';
    }

    // Calculate angles for display
    const left_hip = landmarks[23];
    const left_knee = landmarks[25];
    const left_ankle = landmarks[27];
    const left_shoulder = landmarks[11];
    const right_hip = landmarks[24];
    const right_knee = landmarks[26];
    const right_ankle = landmarks[28];
    const right_shoulder = landmarks[12];

    const left_knee_angle = this.calculate_angle(left_hip, left_knee, left_ankle);
    const left_hip_angle = this.calculate_angle(left_shoulder, left_hip, left_knee);
    const right_knee_angle = this.calculate_angle(right_hip, right_knee, right_ankle);
    const right_hip_angle = this.calculate_angle(right_shoulder, right_hip, right_knee);

    return {
      counter: this.counter,
      stage: this.stage,
      angles: {
        left_knee: left_knee_angle,
        left_hip: left_hip_angle,
        right_knee: right_knee_angle,
        right_hip: right_hip_angle
      }
    };
  }

  reset() {
    this.counter = 0;
    this.stage = null;
    this.min_ang = 0;
    this.min_ang_hip = 0;
    this.last_squat_time = 0;
    this.consecutive_frames = 0;
    this.angle_history = [];
  }
}

module.exports = { SquatDetector }; 