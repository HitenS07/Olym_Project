import React, { useRef, useEffect, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import docco from 'react-syntax-highlighter/dist/esm/styles/hljs/docco';

SyntaxHighlighter.registerLanguage('python', python);

const PoseDetection = ({ exerciseType, onRepCountUpdate }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [counter, setCounter] = useState(0);
  const [stage, setStage] = useState('UP');
  const [angles, setAngles] = useState({ knee: 0, hip: 0 });
  const [minAngle, setMinAngle] = useState(180);
  const [bicepsCounter, setBicepsCounter] = useState(0);

  const pythonCode = `
import cv2
import mediapipe as mp
import numpy as np
from flask import Response
import json
import time

class PoseDetector:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7, model_complexity=2)
        self.mp_draw = mp.solutions.drawing_utils
        self.counter = 0
        self.stage = "UP"
        self.cooldown = 0.5
        self.KNEE_ANGLE_THRESHOLD = 130
        self.HIP_ANGLE_THRESHOLD = 140
        self.MIN_KNEE_ANGLE = 50
        self.MAX_KNEE_ANGLE = 170
        self.MIN_HIP_ANGLE = 50
        self.MAX_HIP_ANGLE = 170
        self.KNEE_ALIGNMENT_THRESHOLD = 0.2
        self.HIP_LEVEL_THRESHOLD = 0.15
        self.consecutive_frames = 0
        self.frames_required = 3
        self.angle_history = []
        self.history_size = 3
        self.min_angle = float('inf')

    def calculate_angle(self, a, b, c):
        a, b, c = np.array(a), np.array(b), np.array(c)
        radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        return 360 - angle if angle > 180 else angle

    def smooth_angle(self, new_angle):
        self.angle_history.append(new_angle)
        if len(self.angle_history) > self.history_size:
            self.angle_history.pop(0)
        return sum(self.angle_history) / len(self.angle_history)

    def validate_form(self, landmarks):
        l_knee = [landmarks[25].x, landmarks[25].y]
        l_ankle = [landmarks[27].x, landmarks[27].y]
        r_knee = [landmarks[26].x, landmarks[26].y]
        r_ankle = [landmarks[28].x, landmarks[28].y]
        l_hip = [landmarks[23].x, landmarks[23].y]
        r_hip = [landmarks[24].x, landmarks[24].y]
        return (abs(l_knee[0]-l_ankle[0]) < self.KNEE_ALIGNMENT_THRESHOLD and
                abs(r_knee[0]-r_ankle[0]) < self.KNEE_ALIGNMENT_THRESHOLD and
                abs(l_hip[1]-r_hip[1]) < self.HIP_LEVEL_THRESHOLD)

    def detect_squat(self, landmarks):
        l_hip = [landmarks[23].x, landmarks[23].y]
        l_knee = [landmarks[25].x, landmarks[25].y]
        l_ankle = [landmarks[27].x, landmarks[27].y]
        l_shoulder = [landmarks[11].x, landmarks[11].y]
        r_hip = [landmarks[24].x, landmarks[24].y]
        r_knee = [landmarks[26].x, landmarks[26].y]
        r_ankle = [landmarks[28].x, landmarks[28].y]
        r_shoulder = [landmarks[12].x, landmarks[12].y]

        k_angle = self.smooth_angle((self.calculate_angle(l_hip, l_knee, l_ankle) +
                                     self.calculate_angle(r_hip, r_knee, r_ankle)) / 2)
        h_angle = self.smooth_angle((self.calculate_angle(l_shoulder, l_hip, l_knee) +
                                     self.calculate_angle(r_shoulder, r_hip, r_knee)) / 2)

        self.min_angle = min(self.min_angle, k_angle)
        if (k_angle < self.MIN_KNEE_ANGLE or k_angle > self.MAX_KNEE_ANGLE or
            h_angle < self.MIN_HIP_ANGLE or h_angle > self.MAX_HIP_ANGLE):
            return False, k_angle, h_angle
        return (k_angle < self.KNEE_ANGLE_THRESHOLD and
                h_angle < self.HIP_ANGLE_THRESHOLD and
                self.validate_form(landmarks)), k_angle, h_angle
`;

  useEffect(() => {
    let camera = null;
    let pose = null;
    let lastSent = 0;

    const onResults = (results) => {
      const now = Date.now();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
      if (results.poseLandmarks) {
        drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
        drawLandmarks(ctx, results.poseLandmarks, { color: '#FF0000', lineWidth: 1 });
        if (exerciseType === 'squats' && now - lastSent > 300) {
          lastSent = now;
          const landmarks = results.poseLandmarks.map(l => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility }));
          fetch('http://localhost:5000/api/exercise/squats/process', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ landmarks })
          })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return res.json();
            })
            .then(data => {
              if (data.counter !== undefined) {
                setCounter(data.counter);
                if (onRepCountUpdate) onRepCountUpdate(data.counter);
              }
              if (data.stage) setStage(data.stage);
              if (data.angles) setAngles(data.angles);
            })
            .catch(err => {
              console.error('Error processing frame:', err);
            });
        }
        if (exerciseType === 'biceps' && now - lastSent > 300) {
          lastSent = now;
          const landmarks = results.poseLandmarks.map(l => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility }));
          fetch('http://localhost:5000/api/exercise/biceps/process', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ landmarks })
          })
            .then(res => {
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              return res.json();
            })
            .then(data => {
              if (data.counter !== undefined) {
                setBicepsCounter(data.counter);
                if (onRepCountUpdate) onRepCountUpdate(data.counter);
              }
            })
            .catch(err => {
              console.error('Error processing biceps frame:', err);
            });
        }
        // No overlay for reps, stage, or angles
      }
      ctx.restore();
    };

    if (videoRef.current && canvasRef.current) {
      pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });
      pose.setOptions({
        modelComplexity: 2,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });
      pose.onResults(onResults);

      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current });
        },
        width: 640,
        height: 480
      });
      camera.start();
    }

    return () => {
      if (camera) camera.stop();
      setCounter(0);
      setStage('UP');
      setAngles({ knee: 0, hip: 0 });
      setMinAngle(180);
    };
  }, [exerciseType, onRepCountUpdate]);

  return (
    <div>
      <div className="camera-feed" style={{ position: 'relative', width: 640, height: 480 }}>
        <video ref={videoRef} style={{ display: 'none' }} width={640} height={480} playsInline />
        <canvas ref={canvasRef} width={640} height={480} style={{ position: 'absolute', top: 0, left: 0 }} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>Backend Squat Detection Logic (Python)</h2>
        <SyntaxHighlighter language="python" style={docco} customStyle={{ maxHeight: '600px', overflowY: 'auto' }}>
          {pythonCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default PoseDetection;
