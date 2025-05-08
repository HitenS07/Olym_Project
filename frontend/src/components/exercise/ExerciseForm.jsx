import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Button, Box } from '@mui/material';

const ExerciseForm = ({ onExerciseSelect, onStart, onStop, isActive }) => {
  const exercises = [
    { id: 'squats', name: 'Squats', difficulty: 'beginner' },
    { id: 'biceps', name: 'Biceps Curl', difficulty: 'beginner' }
  ];

  const handleExerciseChange = (event) => {
    const selected = exercises.find(ex => ex.id === event.target.value);
    onExerciseSelect(selected);
  };

  return (
    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Exercise</InputLabel>
        <Select
          label="Select Exercise"
          onChange={handleExerciseChange}
          disabled={isActive}
          defaultValue=""
        >
          {exercises.map(exercise => (
            <MenuItem key={exercise.id} value={exercise.id}>
              {exercise.name} ({exercise.difficulty})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        fullWidth
        color={isActive ? "error" : "success"}
        onClick={isActive ? onStop : onStart}
        sx={{ py: 1.5 }}
      >
        {isActive ? 'Stop Exercise' : 'Start Exercise'}
      </Button>
    </Box>
  );
};

export default ExerciseForm; 