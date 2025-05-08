const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

router.use(auth);

// Get cart
router.get('/', async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.item');
    
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Cart fetch error:', error);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// Add to cart
router.post('/add', async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    
    let cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [{ item: itemId, quantity }]
      });
    } else {
      const existingItem = cart.items.find(item => 
        item.item.toString() === itemId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ item: itemId, quantity });
      }
    }

    await cart.save();
    await cart.populate('items.item');
    
    res.json(cart);
  } catch (error) {
    console.error('Cart addition error:', error);
    res.status(500).json({ message: 'Error adding item to cart' });
  }
});

// Remove from cart
router.delete('/:itemId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => 
      item._id.toString() !== req.params.itemId
    );

    await cart.save();
    await cart.populate('items.item');
    
    res.json(cart);
  } catch (error) {
    console.error('Cart removal error:', error);
    res.status(500).json({ message: 'Error removing item from cart' });
  }
});

module.exports = router; 