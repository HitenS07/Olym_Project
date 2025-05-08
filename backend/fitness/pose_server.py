from flask import Flask, request, jsonify
from pose_detection import PoseDetector
import json

app = Flask(__name__)
pose_detector = PoseDetector()

@app.route('/process', methods=['POST'])
def process_frame():
    try:
        data = request.json
        landmarks = data.get('landmarks')
        
        if not landmarks:
            return jsonify({'error': 'No landmarks provided'}), 400

        # Convert landmarks to the format expected by PoseDetector
        converted_landmarks = []
        for landmark in landmarks:
            converted_landmarks.append(type('Landmark', (), {
                'x': landmark['x'],
                'y': landmark['y'],
                'z': landmark['z'],
                'visibility': landmark['visibility']
            }))

        # Process the frame
        is_squat, knee_angle, hip_angle = pose_detector.detect_squat(converted_landmarks)
        
        # Update counter and stage
        current_time = pose_detector.last_squat_time
        if is_squat:
            pose_detector.consecutive_frames += 1
            if (pose_detector.consecutive_frames >= pose_detector.frames_required and 
                current_time - pose_detector.last_squat_time > pose_detector.cooldown):
                if pose_detector.stage == "UP":
                    pose_detector.counter += 1
                    pose_detector.last_squat_time = current_time
                pose_detector.stage = "DOWN"
        else:
            if pose_detector.consecutive_frames > 0:
                pose_detector.consecutive_frames -= 1
            if pose_detector.consecutive_frames == 0:
                pose_detector.stage = "UP"

        return jsonify({
            'counter': pose_detector.counter,
            'stage': pose_detector.stage,
            'angles': {
                'knee': knee_angle,
                'hip': hip_angle
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reset', methods=['POST'])
def reset():
    try:
        pose_detector.reset()
        return jsonify({'message': 'Counter reset successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001) 