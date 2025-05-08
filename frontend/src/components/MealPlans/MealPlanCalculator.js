import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Grid } from '@mui/material';
import axios from 'axios';

const MealPlanCalculator = () => {
  const [userData, setUserData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
    activityLevel: '',
    goal: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/mealplan/calculate', userData);
      console.log(data);
      // Handle the response data (meal plan)
    } catch (error) {
      console.error('Error calculating meal plan:', error);
    }
  };

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Calculate Your Meal Plan
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="weight"
              label="Weight (kg)"
              type="number"
              fullWidth
              value={userData.weight}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="height"
              label="Height (cm)"
              type="number"
              fullWidth
              value={userData.height}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="age"
              label="Age"
              type="number"
              fullWidth
              value={userData.age}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Calculate Meal Plan
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default MealPlanCalculator;