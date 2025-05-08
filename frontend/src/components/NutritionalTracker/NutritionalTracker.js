import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  LinearProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import { styled } from '@mui/material/styles';
import axios from 'axios';

const StyledLinearProgress = styled(LinearProgress)(({ theme, value }) => ({
  height: 10,
  borderRadius: 5,
  [`&.MuiLinearProgress-root`]: {
    backgroundColor: theme.palette.grey[200],
  },
  [`& .MuiLinearProgress-bar`]: {
    borderRadius: 5,
    backgroundColor: value > 100 ? theme.palette.error.main : theme.palette.primary.main,
  },
}));

const NutritionalTracker = () => {
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
    fiber: 30,
    water: 8 // in glasses
  });

  const [consumed, setConsumed] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    foodName: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    mealType: 'breakfast'
  });

  const [mealHistory, setMealHistory] = useState([]);

  useEffect(() => {
    fetchTodayData();
  }, []);

  const fetchTodayData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/nutrition`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { dailyGoals, mealHistory, waterIntake } = response.data;
      setDailyGoals(dailyGoals);
      setMealHistory(mealHistory);
      setConsumed(prev => ({ ...prev, water: waterIntake }));
      calculateTotalNutrients(mealHistory);
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    }
  };

  const calculateTotalNutrients = (meals) => {
    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + meal.calories,
      protein: acc.protein + meal.protein,
      carbs: acc.carbs + meal.carbs,
      fat: acc.fat + meal.fat,
      fiber: acc.fiber + meal.fiber
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    });

    setConsumed(prev => ({
      ...prev,
      ...totals
    }));
  };

  const handleAddMeal = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/nutrition/meal`, newEntry, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchTodayData();
      setOpenDialog(false);
      setNewEntry({
        foodName: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        mealType: 'breakfast'
      });
    } catch (error) {
      console.error('Error adding meal:', error);
      alert('Error adding meal');
    }
  };

  const addWater = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/api/nutrition/water`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTodayData();
    } catch (error) {
      console.error('Error updating water intake:', error);
    }
  };

  const calculatePercentage = (consumed, goal) => {
    return (consumed / goal) * 100;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, backgroundColor: 'transparent' }}>
        <Typography variant="h4" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          color: '#2c3e50',
          mb: 4 
        }}>
          <TimelineIcon sx={{ mr: 2, color: '#3498db' }} />
          Daily Nutrition Tracker
        </Typography>

        <Grid container spacing={4}>
          {/* Main Nutrients Display */}
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f6f9fc 0%, #f1f4f8 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              borderRadius: 2
            }}>
              <CardContent>
                <Grid container spacing={3}>
                  {/* Calories */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6" gutterBottom color="primary">
                        Calories
                      </Typography>
                      <StyledLinearProgress 
                        variant="determinate" 
                        value={calculatePercentage(consumed.calories, dailyGoals.calories)}
                        value={Math.min(calculatePercentage(consumed.calories, dailyGoals.calories), 100)}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {consumed.calories} / {dailyGoals.calories} kcal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(calculatePercentage(consumed.calories, dailyGoals.calories))}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Macronutrients */}
                  {[
                    { name: 'Protein', key: 'protein', color: '#e74c3c' },
                    { name: 'Carbs', key: 'carbs', color: '#2ecc71' },
                    { name: 'Fat', key: 'fat', color: '#f1c40f' },
                    { name: 'Fiber', key: 'fiber', color: '#9b59b6' }
                  ].map((nutrient) => (
                    <Grid item xs={12} sm={6} key={nutrient.key}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {nutrient.name}
                        </Typography>
                        <StyledLinearProgress 
                          variant="determinate" 
                          value={Math.min(calculatePercentage(consumed[nutrient.key], dailyGoals[nutrient.key]), 100)}
                          sx={{
                            [`& .MuiLinearProgress-bar`]: {
                              backgroundColor: nutrient.color,
                            },
                          }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {consumed[nutrient.key]} / {dailyGoals[nutrient.key]}g
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(calculatePercentage(consumed[nutrient.key], dailyGoals[nutrient.key]))}%
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>

            {/* Water Tracker */}
            <Card sx={{ mt: 3, background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Water Intake
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {[...Array(8)].map((_, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 30,
                        height: 40,
                        borderRadius: 1,
                        backgroundColor: index < consumed.water ? '#03a9f4' : '#e0e0e0',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={addWater}
                    />
                  ))}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {consumed.water} / {dailyGoals.water} glasses
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Meal History */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              height: '100%' 
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Today's Meals</Typography>
                  <IconButton 
                    color="primary" 
                    onClick={() => setOpenDialog(true)}
                    sx={{ 
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.2)',
                      }
                    }}
                  >
                    <AddCircleIcon />
                  </IconButton>
                </Box>

                {mealHistory.map((meal) => (
                  <Card 
                    key={meal.id} 
                    sx={{ 
                      mb: 2, 
                      backgroundColor: 'rgba(0,0,0,0.02)',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.04)',
                      }
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1">{meal.foodName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {meal.mealType} - {meal.timestamp}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {meal.calories} kcal | {meal.protein}g protein
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Add Meal Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Meal</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Food Name"
                value={newEntry.foodName}
                onChange={(e) => setNewEntry({ ...newEntry, foodName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={newEntry.mealType}
                  label="Meal Type"
                  onChange={(e) => setNewEntry({ ...newEntry, mealType: e.target.value })}
                >
                  <MenuItem value="breakfast">Breakfast</MenuItem>
                  <MenuItem value="lunch">Lunch</MenuItem>
                  <MenuItem value="dinner">Dinner</MenuItem>
                  <MenuItem value="snack">Snack</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Calories"
                value={newEntry.calories}
                onChange={(e) => setNewEntry({ ...newEntry, calories: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Protein (g)"
                value={newEntry.protein}
                onChange={(e) => setNewEntry({ ...newEntry, protein: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Carbs (g)"
                value={newEntry.carbs}
                onChange={(e) => setNewEntry({ ...newEntry, carbs: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                type="number"
                label="Fat (g)"
                value={newEntry.fat}
                onChange={(e) => setNewEntry({ ...newEntry, fat: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="number"
                label="Fiber (g)"
                value={newEntry.fiber}
                onChange={(e) => setNewEntry({ ...newEntry, fiber: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddMeal} variant="contained" color="primary">
            Add Meal
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NutritionalTracker; 