import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const NutritionCalculator = () => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain'
  });

  const [results, setResults] = useState(null);

  const activityLevels = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };

  const goalMultipliers = {
    lose: 0.8,
    maintain: 1,
    gain: 1.2
  };

  const calculateNutrition = () => {
    // BMR calculation using Harris-Benedict equation
    const { weight, height, age, gender, activityLevel, goal } = formData;
    
    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
    }

    // Total Daily Energy Expenditure (TDEE)
    const tdee = bmr * activityLevels[activityLevel];
    
    // Adjust calories based on goal
    const targetCalories = tdee * goalMultipliers[goal];
    
    // Calculate macronutrients
    const protein = weight * 2.2; // 2.2g per kg of body weight
    const fat = (targetCalories * 0.25) / 9; // 25% of calories from fat
    const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;

    setResults({
      calories: Math.round(targetCalories),
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
        <Typography variant="h4" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: 'primary.main',
          mb: 4 
        }}>
          <FitnessCenterIcon sx={{ mr: 2 }} />
          Nutrition Calculator
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Weight (kg)"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Height (cm)"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        label="Gender"
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Activity Level</InputLabel>
                      <Select
                        name="activityLevel"
                        value={formData.activityLevel}
                        onChange={handleChange}
                        label="Activity Level"
                      >
                        <MenuItem value="sedentary">Sedentary</MenuItem>
                        <MenuItem value="light">Light Activity</MenuItem>
                        <MenuItem value="moderate">Moderate Activity</MenuItem>
                        <MenuItem value="active">Very Active</MenuItem>
                        <MenuItem value="veryActive">Extra Active</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Goal</InputLabel>
                      <Select
                        name="goal"
                        value={formData.goal}
                        onChange={handleChange}
                        label="Goal"
                      >
                        <MenuItem value="lose">Lose Weight</MenuItem>
                        <MenuItem value="maintain">Maintain Weight</MenuItem>
                        <MenuItem value="gain">Gain Weight</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={calculateNutrition}
                >
                  Calculate
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            {results && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Your Daily Nutrition Targets
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography color="primary" gutterBottom>
                      Daily Calories
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                      {results.calories} kcal
                    </Typography>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Protein
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {results.protein}g
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Carbs
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {results.carbs}g
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        Fat
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {results.fat}g
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default NutritionCalculator; 