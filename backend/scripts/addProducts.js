const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const products = [
  {
    name: "Avocado Toast with Eggs",
    category: "veg",
    price: 7.49,
    mealType: "breakfast",
    ingredients: ["Avocado", "Eggs", "Bread", "Salt", "Pepper"],
    description: "A hearty and healthy breakfast toast topped with mashed avocado and a poached egg.",
    image: "https://i.postimg.cc/FzHbh6wf/Avocado-Toast-with-Eggs.jpg",
    inStock: true,
    nutritionInfo: {}
  },
  {
    name: "Protein Breakfast Oats",
    category: "veg",
    price: 8.99,
    mealType: "breakfast",
    ingredients: ["Oats", "Milk", "Protein Powder", "Banana", "Berries"],
    description: "High-protein breakfast oats with fresh fruits.",
    image: "https://i.postimg.cc/d0c8h3zc/Protein-Breakfast-Oats.webp",
    inStock: true,
    nutritionInfo: {}
  },
  {
    name: "Chicken Quinoa Salad",
    category: "non-veg",
    price: 12.99,
    mealType: "lunch",
    ingredients: ["Chicken", "Quinoa", "Lettuce", "Tomatoes", "Cucumber", "Olive Oil", "Lemon"],
    description: "A protein-packed salad with grilled chicken and quinoa, perfect for a healthy lunch.",
    image: "https://i.postimg.cc/htdL4TZ0/Chicken-Quinoa-Salad.jpg",
    inStock: true,
    nutritionInfo: {}
  },
  {
    name: "Vegan Lentil Soup",
    category: "veg",
    price: 6.49,
    mealType: "lunch",
    ingredients: ["Lentils", "Carrots", "Celery", "Onions", "Garlic", "Spices"],
    description: "A nourishing, plant-based lentil soup with vegetables and spices.",
    image: "https://i.postimg.cc/QxPgr0mt/Vegan-Lentil-Soup.jpg",
    inStock: true,
    nutritionInfo: {}
  }
];

const addProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Product.insertMany(products);
    console.log('Products added successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error adding products:', error);
  }
};

addProducts(); 