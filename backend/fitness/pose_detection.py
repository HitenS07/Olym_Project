import cv2
import mediapipe as mp
import numpy as np
from flask import Response
import json
import time

class PoseDetector:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7,
            model_complexity=2
        )
        self.mp_draw = mp.solutions.drawing_utils
        
        # Squat detection state
        self.counter = 0
        self.stage = "UP"
        self.last_stage = "UP"
        self.last_squat_time = 0
        self.cooldown = 0.5  # Reduced cooldown to 0.5 seconds
        
        # Angle thresholds - More lenient
        self.KNEE_ANGLE_THRESHOLD = 130  # More lenient knee angle
        self.HIP_ANGLE_THRESHOLD = 140   # More lenient hip angle
        self.MIN_KNEE_ANGLE = 50
        self.MAX_KNEE_ANGLE = 170
        self.MIN_HIP_ANGLE = 50
        self.MAX_HIP_ANGLE = 170
        
        # Form validation thresholds - More lenient
        self.KNEE_ALIGNMENT_THRESHOLD = 0.2
        self.HIP_LEVEL_THRESHOLD = 0.15
        
        # State tracking
        self.consecutive_frames = 0
        self.frames_required = 3  # Reduced frames required
        self.angle_history = []
        self.history_size = 3  # Reduced history size
        self.min_angle = float('inf')
        self.max_angle = float('-inf')

    def calculate_angle(self, a, b, c):
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360-angle
            
        return angle

    def smooth_angle(self, new_angle):
        self.angle_history.append(new_angle)
        if len(self.angle_history) > self.history_size:
            self.angle_history.pop(0)
        return sum(self.angle_history) / len(self.angle_history)

    def validate_form(self, landmarks):
        # Get key points
        left_knee = [landmarks[25].x, landmarks[25].y]
        left_ankle = [landmarks[27].x, landmarks[27].y]
        right_knee = [landmarks[26].x, landmarks[26].y]
        right_ankle = [landmarks[28].x, landmarks[28].y]
        left_hip = [landmarks[23].x, landmarks[23].y]
        right_hip = [landmarks[24].x, landmarks[24].y]

        # Check knee alignment (side view) - More lenient
        left_knee_aligned = abs(left_knee[0] - left_ankle[0]) < self.KNEE_ALIGNMENT_THRESHOLD
        right_knee_aligned = abs(right_knee[0] - right_ankle[0]) < self.KNEE_ALIGNMENT_THRESHOLD

        # Check hip level - More lenient
        hips_level = abs(left_hip[1] - right_hip[1]) < self.HIP_LEVEL_THRESHOLD

        # Simplified form check - only check alignment
        return left_knee_aligned and right_knee_aligned and hips_level

    def detect_squat(self, landmarks):
        # Get coordinates for left leg
        left_hip = [landmarks[23].x, landmarks[23].y]
        left_knee = [landmarks[25].x, landmarks[25].y]
        left_ankle = [landmarks[27].x, landmarks[27].y]
        left_shoulder = [landmarks[11].x, landmarks[11].y]

        # Get coordinates for right leg
        right_hip = [landmarks[24].x, landmarks[24].y]
        right_knee = [landmarks[26].x, landmarks[26].y]
        right_ankle = [landmarks[28].x, landmarks[28].y]
        right_shoulder = [landmarks[12].x, landmarks[12].y]

        # Calculate angles
        left_knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
        left_hip_angle = self.calculate_angle(left_shoulder, left_hip, left_knee)
        right_knee_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
        right_hip_angle = self.calculate_angle(right_shoulder, right_hip, right_knee)

        # Average the angles
        knee_angle = self.smooth_angle((left_knee_angle + right_knee_angle) / 2)
        hip_angle = self.smooth_angle((left_hip_angle + right_hip_angle) / 2)

        # Update min/max angles
        self.min_angle = min(self.min_angle, knee_angle)
        self.max_angle = max(self.max_angle, knee_angle)

        # Validate form
        form_valid = self.validate_form(landmarks)

        # Check if angles are within valid ranges
        if (knee_angle < self.MIN_KNEE_ANGLE or knee_angle > self.MAX_KNEE_ANGLE or 
            hip_angle < self.MIN_HIP_ANGLE or hip_angle > self.MAX_HIP_ANGLE):
            return False, knee_angle, hip_angle

        # Check if both knee and hip angles are below threshold and form is valid
        return (knee_angle < self.KNEE_ANGLE_THRESHOLD and 
                hip_angle < self.HIP_ANGLE_THRESHOLD and 
                form_valid), knee_angle, hip_angle

    def process_frame(self, frame):
        # Convert BGR to RGB
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        # Make detection
        results = self.pose.process(image)
        
        # Convert back to BGR for OpenCV
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        if results.pose_landmarks:
            # Draw pose landmarks
            self.mp_draw.draw_landmarks(
                image, 
                results.pose_landmarks,
                self.mp_pose.POSE_CONNECTIONS
            )
            
            # Detect squat
            is_squat, knee_angle, hip_angle = self.detect_squat(results.pose_landmarks.landmark)
            current_time = time.time()

            # State machine for squat detection
            if is_squat:
                self.consecutive_frames += 1
                if (self.consecutive_frames >= self.frames_required and 
                    current_time - self.last_squat_time > self.cooldown):
                    if self.stage == "UP":
                        self.counter += 1
                        self.last_squat_time = current_time
                        self.min_angle = float('inf')  # Reset min angle after counting
                    self.stage = "DOWN"
            else:
                if self.consecutive_frames > 0:
                    self.consecutive_frames -= 1  # Gradual decrease instead of reset
                if self.consecutive_frames == 0:
                    self.stage = "UP"

            # Draw counter and angles
            cv2.putText(image, f'Reps: {self.counter}', (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(image, f'Stage: {self.stage}', (10, 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(image, f'Knee: {int(knee_angle)}', (10, 90), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(image, f'Hip: {int(hip_angle)}', (10, 120), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            cv2.putText(image, f'Min: {int(self.min_angle)}', (10, 150), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
            
            # Extract landmarks
            landmarks = []
            for landmark in results.pose_landmarks.landmark:
                landmarks.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
                
            return image, landmarks, {
                'counter': self.counter,
                'stage': self.stage,
                'angles': {
                    'knee': knee_angle,
                    'hip': hip_angle
                }
            }
        return image, None, None

    def reset(self):
        self.counter = 0
        self.stage = "UP"
        self.last_stage = "UP"
        self.last_squat_time = 0
        self.consecutive_frames = 0
        self.angle_history = []
        self.min_angle = float('inf')
        self.max_angle = float('-inf')

def generate_frames():
    camera = cv2.VideoCapture(0)
    detector = PoseDetector()
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        
        # Process frame
        frame, landmarks, data = detector.process_frame(frame)
        
        # Encode frame to jpg
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')