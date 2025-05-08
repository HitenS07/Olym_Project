import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

// Add auth header
API.interceptors.request.use((req) => {
  if (localStorage.getItem('profile')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`;
  }
  return req;
});

// Auth APIs
export const login = (formData) => API.post('/user/login', formData);
export const register = (formData) => API.post('/user/register', formData);

// Meal Plan APIs
export const calculateMealPlan = (userData) => API.post('/mealplan/calculate', userData);
export const getMealPlans = () => API.get('/mealplan');

// Product APIs
export const getProducts = () => API.get('/products');
export const getProduct = (id) => API.get(`/products/${id}`);

// Cart APIs
export const getCart = () => API.get('/cart');
export const addToCart = (productId) => API.post('/cart/add', { productId });
export const removeFromCart = (productId) => API.delete(`/cart/${productId}`);