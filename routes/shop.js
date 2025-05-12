const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');

router.get('/', shopController.getIndex);
router.get('/product/:id', shopController.getProduct);
router.post('/add-to-cart', shopController.addToCart);
router.get('/cart', shopController.getCart);
router.get('/checkout', shopController.getCheckout); 
router.post('/checkout', shopController.postCheckout);
router.get('/products', shopController.getAllProducts);
router.get('/search', shopController.searchProducts);
router.get('/about', shopController.getAbout);
router.get('/order-success', shopController.getOrderSuccess)
router.get('/track', shopController.getTrack);
router.get('/track-orders', shopController.searchOrdersByPhone);

module.exports = router;
