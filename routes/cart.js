import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

// Add item to cart
router.post('/', async (req, res) => {
  try {
    const { userId, product } = req.body;
    const cartItem = {
      productId: product.productId,
      title: product.title,
      price: product.price,
      quantity: product.quantity,
      image: product.image, // ✅ legacy
      images: product.images || [], // ✅ for new format
    };

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, products: [cartItem] });
    } else {
      const existingItem = cart.products.find(p => p.productId === product.productId);
      if (existingItem) {
        existingItem.quantity += product.quantity;
      } else {
        cart.products.push(cartItem);
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error adding to cart' });
  }
});

// Get cart items
router.get('/:userId', async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { userId: req.params.userId, products: [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// DELETE single product from cart
router.delete('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.products = cart.products.filter(p => p.productId !== productId);
    await cart.save();

    res.json({ message: 'Product removed', cart });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove product' });
  }
});

// Update quantity
router.put('/:userId/:productId', async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.products.find(p => p.productId === productId);
    if (item) {
      item.quantity = quantity;
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Product not found in cart' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update quantity' });
  }
});

// ✅ CLEAR ENTIRE CART (FIXED)
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log('🗑️ Attempting to clear cart for userId:', userId);
    
    // FIXED: Use 'userId' instead of 'user'
    const result = await Cart.findOneAndDelete({ userId: userId });
    
    if (!result) {
      console.log('⚠️ Cart not found for userId:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Cart not found' 
      });
    }
    
    console.log('✅ Cart cleared successfully for userId:', userId);
    
    res.json({ 
      success: true, 
      message: 'Cart cleared successfully' 
    });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;