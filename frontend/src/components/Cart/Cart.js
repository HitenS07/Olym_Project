import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  IconButton, 
  Button, 
  Card,
  CardContent,
  Grid,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Payment from '../Payment/Payment';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCartItems(response.data.items || []);
      calculateTotal(response.data.items || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Error loading cart');
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const sum = items.reduce((acc, cartItem) => {
      return acc + (cartItem.item?.price || 0) * cartItem.quantity;
    }, 0);
    setTotal(sum);
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/cart/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCart();
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Error removing item from cart');
    }
  };

  const handlePaymentSuccess = () => {
    setCartItems([]);
    setTotal(0);
  };

  if (loading) return <Typography>Loading cart...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  if (showPayment) {
    return <Payment 
      total={total} 
      onSuccess={handlePaymentSuccess}
      onCancel={() => setShowPayment(false)}
    />;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ my: 4 }}>
        Shopping Cart
      </Typography>
      
      {cartItems.length === 0 ? (
        <Typography>Your cart is empty</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {cartItems.map((cartItem) => (
              <Card key={cartItem._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6">
                        {cartItem.item?.name || 'Product Not Found'}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Quantity: {cartItem.quantity}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="h6">
                        ₹{((cartItem.item?.price || 0) * cartItem.quantity).toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <Box display="flex" justifyContent="flex-end">
                        <IconButton 
                          onClick={() => handleRemoveItem(cartItem._id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Cart Summary
                </Typography>
                <Typography variant="h6">
                  Total: ₹{total.toFixed(2)}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => setShowPayment(true)}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart; 