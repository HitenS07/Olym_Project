import cv2
import mediapipe as mp
import numpy as np
import time

class SquatDetector:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        )
        self.mp_drawing = mp.solutions.drawing_utils
        self.mp_drawing_styles = mp.solutions.drawing_styles
        self.counter = 0
        self.stage = None
        self.min_ang = 0
        self.min_ang_hip = 0
        self.last_squat_time = 0
        self.squat_cooldown = 1.0
        self.consecutive_frames = 0
        self.required_frames = 5  # Further reduced for more responsive counting
        self.hip_angles = []
        self.knee_angles = []
        self.angle_window = 3  # Reduced window for faster response

    def calculate_angle(self, a, b, c):
        """Calculate angle between three points"""
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians*180.0/np.pi)
        
        if angle > 180.0:
            angle = 360-angle
        return angle

    def smooth_angle(self, angles, new_angle):
        """Apply moving average to smooth angle measurements"""
        angles.append(new_angle)
        if len(angles) > self.angle_window:
            angles.pop(0)
        return sum(angles) / len(angles)

    def detect_squat(self, landmarks):
        """Enhanced squat detection with form validation"""
        try:
            # Convert landmarks to the correct format
            landmarks_dict = {i: landmark for i, landmark in enumerate(landmarks)}

            # Get key points
            left_hip = [landmarks_dict[23]['x'], landmarks_dict[23]['y']]
            left_knee = [landmarks_dict[25]['x'], landmarks_dict[25]['y']]
            left_ankle = [landmarks_dict[27]['x'], landmarks_dict[27]['y']]
            left_shoulder = [landmarks_dict[11]['x'], landmarks_dict[11]['y']]

            right_hip = [landmarks_dict[24]['x'], landmarks_dict[24]['y']]
            right_knee = [landmarks_dict[26]['x'], landmarks_dict[26]['y']]
            right_ankle = [landmarks_dict[28]['x'], landmarks_dict[28]['y']]
            right_shoulder = [landmarks_dict[12]['x'], landmarks_dict[12]['y']]

            # Calculate angles
            left_knee_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
            right_knee_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
            left_hip_angle = self.calculate_angle(left_shoulder, left_hip, left_knee)
            right_hip_angle = self.calculate_angle(right_shoulder, right_hip, right_knee)

            # Smooth angles
            left_knee_angle = self.smooth_angle(self.knee_angles, left_knee_angle)
            right_knee_angle = self.smooth_angle(self.knee_angles, right_knee_angle)
            left_hip_angle = self.smooth_angle(self.hip_angles, left_hip_angle)
            right_hip_angle = self.smooth_angle(self.hip_angles, right_hip_angle)

            # Form validation
            knee_threshold = 110  # Slightly increased for easier detection
            hip_threshold = 140   # Slightly increased for easier detection
            min_knee_angle = 60   # Allow deeper squats
            
            # Check if angles are within valid ranges
            if not all(0 <= angle <= 180 for angle in [left_knee_angle, right_knee_angle, left_hip_angle, right_hip_angle]):
                return False, None

            # Check for proper squat form
            knees_bent = (left_knee_angle < knee_threshold and right_knee_angle < knee_threshold)
            hips_proper = (left_hip_angle < hip_threshold and right_hip_angle < hip_threshold)
            not_too_deep = (left_knee_angle > min_knee_angle and right_knee_angle > min_knee_angle)
            
            # Check for knee alignment (knees shouldn't go too far forward)
            knee_alignment = (abs(left_knee[0] - left_ankle[0]) < 0.15 and 
                            abs(right_knee[0] - right_ankle[0]) < 0.15)  # Slightly relaxed alignment check

            is_squat = knees_bent and hips_proper and not_too_deep and knee_alignment

            return is_squat, {
                'left_knee': left_knee_angle,
                'right_knee': right_knee_angle,
                'left_hip': left_hip_angle,
                'right_hip': right_hip_angle
            }

        except Exception as e:
            print(f"Error in squat detection: {str(e)}")
            return False, None

    def process_frame(self, landmarks):
        """Process a single frame for squat detection"""
        try:
            # Detect squat and get angles
            is_squat, angles = self.detect_squat(landmarks)

            if angles:
                # Update consecutive frames counter
                if is_squat:
                    self.consecutive_frames += 1
                else:
                    self.consecutive_frames = 0

                # Update counter and stage with improved logic
                current_time = time.time()
                
                if (self.consecutive_frames >= self.required_frames and 
                    self.stage != "DOWN" and 
                    current_time - self.last_squat_time > self.squat_cooldown):
                    self.stage = "DOWN"
                    self.counter += 1
                    self.min_ang = min(angles['left_knee'], angles['right_knee'])
                    self.min_ang_hip = min(angles['left_hip'], angles['right_hip'])
                    self.last_squat_time = current_time
                elif not is_squat and self.consecutive_frames == 0:
                    self.stage = "UP"

            return {
                "counter": self.counter,
                "stage": self.stage,
                "angles": angles if angles else None
            }

        except Exception as e:
            print(f"Error processing frame: {str(e)}")
            return {
                "counter": self.counter,
                "stage": self.stage,
                "angles": None
            }

    def reset(self):
        """Reset all counters and state"""
        self.counter = 0
        self.stage = None
        self.min_ang = 0
        self.min_ang_hip = 0
        self.last_squat_time = 0
        self.consecutive_frames = 0
        self.hip_angles = []
        self.knee_angles = [] 