import React from 'react';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

const ExerciseInstructions = ({ exercise }) => {
  const getInstructions = (exerciseId) => {
    const instructions = {
      squats: [
        "Stand with feet shoulder-width apart",
        "Keep your back straight and chest up",
        "Lower your body as if sitting back into a chair",
        "Keep your knees aligned with your toes",
        "Lower until thighs are parallel to the ground",
        "Push through your heels to return to standing"
      ],
      biceps: [
        "Stand straight with a dumbbell in each hand (or mimic the motion)",
        "Keep your elbows close to your torso",
        "Curl the weights while contracting your biceps",
        "Raise until your biceps are fully contracted and the dumbbells are at shoulder level",
        "Pause, then slowly lower the weights back to the starting position"
      ]
    };
    return instructions[exerciseId] || [];
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Exercise Instructions
      </Typography>
      <List dense>
        {getInstructions(exercise.id).map((instruction, index) => (
          <ListItem key={index}>
            <ListItemIcon sx={{ minWidth: '30px' }}>
              <FiberManualRecordIcon sx={{ fontSize: 8 }} />
            </ListItemIcon>
            <ListItemText primary={instruction} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default ExerciseInstructions; 