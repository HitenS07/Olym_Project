import React from 'react';
import { Paper, Typography, Grid } from '@mui/material';

const ExerciseMetrics = ({ exercise }) => {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Performance Metrics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Exercise</Typography>
          <Typography variant="body1">{exercise.name}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="subtitle2">Difficulty</Typography>
          <Typography variant="body1">{exercise.difficulty}</Typography>
        </Grid>
        {/* Future: Add more metrics for biceps curl here */}
      </Grid>
    </Paper>
  );
};

export default ExerciseMetrics; 