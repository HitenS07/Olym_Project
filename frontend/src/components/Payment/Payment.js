import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Box,
  Divider,
  Alert,
  Collapse,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as UPIIcon,
  LocalShipping as CODIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const Payment = ({ total, onSuccess, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Card Details
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  // UPI Details
  const [upiId, setUpiId] = useState('');

  // Delivery Address
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setError('');
  };

  const handleCardDetailsChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (paymentMethod === 'card') {
      if (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvv) {
        setError('Please fill all card details');
        return false;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        setError('Please enter UPI ID');
        return false;
      }
    }

    if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
      setError('Please fill all address details');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const paymentData = {
        method: paymentMethod,
        amount: total,
        address,
        ...(paymentMethod === 'card' && { cardDetails }),
        ...(paymentMethod === 'upi' && { upiId })
      };

      // Here you would normally make an API call to your payment processor
      // const response = await axios.post('http://localhost:5000/api/payment', paymentData);

      setSuccess(true);
      setTimeout(() => {
        onSuccess && onSuccess();
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    {
      value: 'card',
      label: 'Credit/Debit Card',
      icon: <CreditCardIcon />,
      color: '#2196f3'
    },
    {
      value: 'upi',
      label: 'UPI Payment',
      icon: <UPIIcon />,
      color: '#4caf50'
    },
    {
      value: 'cod',
      label: 'Cash on Delivery',
      icon: <CODIcon />,
      color: '#ff9800'
    }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Payment Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Payment Method
              </Typography>
              <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
                {paymentMethods.map((method) => (
                  <Paper
                    key={method.value}
                    elevation={paymentMethod === method.value ? 3 : 1}
                    sx={{
                      mb: 2,
                      p: 2,
                      border: 2,
                      borderColor: paymentMethod === method.value ? method.color : 'transparent',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <FormControlLabel
                      value={method.value}
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {React.cloneElement(method.icon, { sx: { mr: 1, color: method.color } })}
                          <Typography>{method.label}</Typography>
                        </Box>
                      }
                    />
                  </Paper>
                ))}
              </RadioGroup>

              <Collapse in={paymentMethod === 'card'}>
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Card Number"
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardDetailsChange}
                        placeholder="1234 5678 9012 3456"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Cardholder Name"
                        name="name"
                        value={cardDetails.name}
                        onChange={handleCardDetailsChange}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Expiry Date"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardDetailsChange}
                        placeholder="MM/YY"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="CVV"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardDetailsChange}
                        type="password"
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>

              <Collapse in={paymentMethod === 'upi'}>
                <Box sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="UPI ID"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi"
                  />
                </Box>
              </Collapse>

              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Delivery Address
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      name="street"
                      value={address.street}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="City"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="State"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="PIN Code"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 20 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Grid container justifyContent="space-between">
                  <Typography>Subtotal</Typography>
                  <Typography>₹{total.toFixed(2)}</Typography>
                </Grid>
                <Grid container justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Delivery Fee
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₹50.00
                  </Typography>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Grid container justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">₹{(total + 50).toFixed(2)}</Typography>
              </Grid>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {success ? (
                <Alert
                  icon={<CheckIcon fontSize="inherit" />}
                  severity="success"
                  sx={{ mb: 2 }}
                >
                  Payment successful! Redirecting...
                </Alert>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ 
                    height: 48,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    `Pay ₹${(total + 50).toFixed(2)}`
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Payment; 