import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Fade,
  useTheme,
  IconButton,
  Divider,
} from '@mui/material';
import {
  FitnessCenter,
  Restaurant,
  LocalDining,
  Timeline,
  TrendingUp,
  Favorite,
  DirectionsRun,
  EmojiEvents,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
  color: 'white',
  padding: theme.spacing(15, 2),
  textAlign: 'center',
  borderRadius: '0 0 50px 50px',
  marginBottom: theme.spacing(6),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  borderRadius: 16,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: theme.spacing(1.5, 4),
  textTransform: 'none',
  fontSize: '1.1rem',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #FF512F 0%, #F09819 100%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #F09819 0%, #FF512F 100%)',
  },
}));

const Home = () => {
  const theme = useTheme();
  const [fitnessFactIndex, setFitnessFactIndex] = useState(0);

  const fitnessFacts = [
    "Regular exercise can improve your memory and brain function.",
    "A pound of muscle burns 6 calories a day while a pound of fat burns 2.",
    "Exercise is as effective as antidepressants for mild depression.",
    "Music can improve your workout performance by up to 15%.",
    "The best time to exercise is when your body temperature is at its highest (4-5 PM).",
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFitnessFactIndex((prev) => (prev + 1) % fitnessFacts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <Restaurant sx={{ fontSize: 40, color: '#FF512F' }} />,
      title: 'Smart Meal Planning',
      description: 'Personalized meal plans based on your fitness goals and dietary preferences.',
    },
    {
      icon: <Timeline sx={{ fontSize: 40, color: '#0083B0' }} />,
      title: 'Progress Tracking',
      description: 'Track your nutrition, workouts, and body measurements in one place.',
    },
    {
      icon: <FitnessCenter sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Expert Workouts',
      description: 'Access to professional workout plans for all fitness levels.',
    },
    {
      icon: <Favorite sx={{ fontSize: 40, color: '#E91E63' }} />,
      title: 'Health Insights',
      description: 'Get detailed insights about your health and fitness journey.',
    },
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <HeroSection>
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              mb: 2,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Welcome to <span style={{ color: '#FF512F' }}>Olym+</span>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.9)',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            Your Personal Fitness & Nutrition Journey Starts Here
          </Typography>
          <StyledButton
            variant="contained"
            component={Link}
            to="/register"
            size="large"
          >
            Start Your Journey
          </StyledButton>
        </Container>
      </HeroSection>

      <Container maxWidth="lg">
        {/* Fitness Fact Card */}
        <Fade in={true} timeout={1000}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              mb: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <EmojiEvents sx={{ fontSize: 40 }} />
              <Typography variant="h6" sx={{ fontFamily: "'Roboto', sans-serif" }}>
                Did you know? {fitnessFacts[fitnessFactIndex]}
              </Typography>
            </Box>
          </Paper>
        </Fade>

        {/* Features Grid */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Fade in={true} timeout={(index + 1) * 500}>
                <FeatureCard>
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action Section */}
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            background: 'linear-gradient(135deg, #f6f9fc 0%, #f1f4f8 100%)',
            borderRadius: 4,
            mb: 6,
          }}
        >
          <Typography
            variant="h3"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: '#2c3e50',
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Transform Your Life Today
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 4,
              color: '#666',
              maxWidth: 600,
              mx: 'auto',
              fontFamily: "'Roboto', sans-serif",
            }}
          >
            Join thousands of others who have already started their journey to a
            healthier lifestyle with Olym+
          </Typography>
          <StyledButton
            variant="contained"
            component={Link}
            to="/register"
            size="large"
          >
            Get Started Now
          </StyledButton>
        </Box>

        {/* Stats Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {[
            { number: '10K+', label: 'Active Users', icon: <DirectionsRun /> },
            { number: '500+', label: 'Workout Plans', icon: <FitnessCenter /> },
            { number: '1000+', label: 'Healthy Recipes', icon: <LocalDining /> },
            { number: '89%', label: 'Success Rate', icon: <TrendingUp /> },
          ].map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <IconButton
                  sx={{
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </IconButton>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#2c3e50',
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography color="text.secondary">{stat.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home; 