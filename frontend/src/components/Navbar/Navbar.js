import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  FitnessCenter as FitnessCenterIcon,
  Timeline as TimelineIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  LocalDining as DiningIcon,
  SportsGymnastics as SportsGymnasticsIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('token');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    handleClose();
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Products', icon: <DiningIcon />, path: '/products' },
    { text: 'Nutrition Tracker', icon: <TimelineIcon />, path: '/nutrition-tracker' },
    { text: 'Exercise Detection', icon: <SportsGymnasticsIcon />, path: '/exercise' },
    { text: 'Nutrition Calculator', icon: <FitnessCenterIcon />, path: '/nutrition-calculator' },
  ];

  const renderMobileMenu = (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
    >
      <Box sx={{ width: 250 }} role="presentation">
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              component={Link}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'white', boxShadow: 2 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          FitMeal
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="primary"
              component={Link}
              to="/cart"
              sx={{ mr: 2 }}
            >
              <Badge badgeContent={0} color="secondary">
                <CartIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            {renderMobileMenu}
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="primary"
                component={Link}
                to={item.path}
                startIcon={item.icon}
              >
                {item.text}
              </Button>
            ))}
            <IconButton color="primary" component={Link} to="/cart">
              <Badge badgeContent={0} color="secondary">
                <CartIcon />
              </Badge>
            </IconButton>
            {isLoggedIn ? (
              <>
                <IconButton
                  color="primary"
                  onClick={handleMenu}
                >
                  <PersonIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="primary"
                variant="contained"
                component={Link}
                to="/login"
              >
                Login
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 