const express = require('express');
const router = express.Router();
const NutritionTracker = require('../models/NutritionTracker');
const auth = require('../middleware/auth');

router.use(auth);

// Get today's tracking data
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tracker = await NutritionTracker.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!tracker) {
      tracker = new NutritionTracker({
        userId: req.user.id,
        mealHistory: [],
        waterIntake: 0,
        dailyGoals: {
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 70,
          fiber: 30,
          water: 8
        }
      });
      await tracker.save();
    }

    // Format response to match frontend expectations
    res.json({
      dailyGoals: tracker.dailyGoals,
      mealHistory: tracker.mealHistory,
      waterIntake: tracker.waterIntake
    });
  } catch (error) {
    console.error('Error fetching nutrition data:', error);
    res.status(500).json({ message: 'Error fetching nutrition data' });
  }
});

// Add meal entry
router.post('/meal', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tracker = await NutritionTracker.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!tracker) {
      tracker = new NutritionTracker({
        userId: req.user.id,
        mealHistory: [],
        waterIntake: 0
      });
    }

    tracker.mealHistory.push(req.body);
    await tracker.save();

    res.json(tracker);
  } catch (error) {
    console.error('Error adding meal:', error);
    res.status(500).json({ message: 'Error adding meal' });
  }
});

// Update water intake
router.post('/water', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tracker = await NutritionTracker.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!tracker) {
      tracker = new NutritionTracker({
        userId: req.user.id,
        mealHistory: [],
        waterIntake: 1
      });
    } else {
      tracker.waterIntake += 1;
    }

    await tracker.save();
    res.json(tracker);
  } catch (error) {
    console.error('Error updating water intake:', error);
    res.status(500).json({ message: 'Error updating water intake' });
  }
});

// Update daily goals
router.put('/goals', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tracker = await NutritionTracker.findOne({
      userId: req.user.id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!tracker) {
      tracker = new NutritionTracker({
        userId: req.user.id,
        dailyGoals: req.body,
        mealHistory: [],
        waterIntake: 0
      });
    } else {
      tracker.dailyGoals = req.body;
    }

    await tracker.save();
    res.json(tracker);
  } catch (error) {
    console.error('Error updating goals:', error);
    res.status(500).json({ message: 'Error updating goals' });
  }
});

// Get history
router.get('/history', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const history = await NutritionTracker.find({
      userId: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: -1 });

    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

module.exports = router; 