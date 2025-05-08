import React from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8} lg={9}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Welcome to Your Fitness Dashboard
            </Typography>
            <Typography variant="body1">
              Track your fitness progress and access various features here.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} lg={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Quick Stats
            </Typography>
            {/* Add your stats here */}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 