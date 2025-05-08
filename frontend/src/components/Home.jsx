import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Fitness Tracker
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your one-stop destination for fitness and nutrition
        </Typography>
      </Box>
    </Container>
  );
};

export default Home; 