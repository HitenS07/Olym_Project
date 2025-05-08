import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import ExerciseForm from './ExerciseForm';
import ExerciseInstructions from './ExerciseInstructions';
import ExerciseMetrics from './ExerciseMetrics';
import PoseDetection from './PoseDetection';

const ExercisePage = () => {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [repCount, setRepCount] = useState(0);

  useEffect(() => {
    setIsActive(false); // Reset on exercise change
    setRepCount(0); // Reset reps on exercise change
  }, [selectedExercise]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handleStop = async () => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/exercise/squats/reset`, {
        method: 'POST'
      });
      setIsActive(false);
      setRepCount(0); // Reset reps on stop
    } catch (error) {
      console.error('Error resetting exercise:', error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI Exercise Form Analysis
        </Typography>
        <div className="exercise-container">
          <div className="exercise-left-panel">
            <ExerciseForm 
              onExerciseSelect={setSelectedExercise}
              onStart={handleStart}
              onStop={handleStop}
              isActive={isActive}
            />
            {selectedExercise && (
              <ExerciseInstructions exercise={selectedExercise} />
            )}
          </div>
          <div className="exercise-right-panel">
            {isActive && selectedExercise && (
              <>
                <div style={{ marginBottom: 24, padding: 16, background: '#222', color: '#FFD700', borderRadius: 8, textAlign: 'center', fontSize: 28 }}>
                  <span>Reps Counted (Backend): </span>
                  <span style={{ color: '#00FF00', fontWeight: 'bold', fontSize: 36 }}>{repCount}</span>
                  {selectedExercise && selectedExercise.id === 'biceps' && <span style={{ marginLeft: 16, color: '#FFD700', fontSize: 20 }}>(Biceps Curls)</span>}
                  {selectedExercise && selectedExercise.id === 'squats' && <span style={{ marginLeft: 16, color: '#FFD700', fontSize: 20 }}>(Squats)</span>}
                </div>
                <div className="camera-feed">
                  <PoseDetection exerciseType={selectedExercise.id} onRepCountUpdate={setRepCount} />
                </div>
                <ExerciseMetrics exercise={selectedExercise} />
              </>
            )}
          </div>
        </div>
      </Paper>
    </Container>
  );
};

export default ExercisePage; 