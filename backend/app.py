from flask import Flask, Response, jsonify
from flask_cors import CORS
from fitness.exercises.squats import SquatDetector
import cv2
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

squat_detector = SquatDetector()

def generate_frames():
    camera = cv2.VideoCapture(0)
    
    while True:
        success, frame = camera.read()
        if not success:
            break
            
        # Process frame with squat detection
        output_frame, metrics = squat_detector.process_frame(frame)
        
        # Encode frame
        ret, buffer = cv2.imencode('.jpg', output_frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/api/exercise/squats/stream')
def video_feed():
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/exercise/squats/reset', methods=['POST'])
def reset_squats():
    squat_detector.reset()
    return jsonify({"status": "success"})

if __name__ == '__main__':
    # Get port from environment variable or use default
    port = int(os.getenv('PORT', 5000))
    # Disable debug mode to avoid the Windows error
    app.run(host='0.0.0.0', port=port, debug=False) 