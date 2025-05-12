const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const multer = require('multer');
const path = require('path');

// Auth middleware
const isAuth = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect('/auth/login');
  }
  next();
};

// Multer configuration
const { storage } = require('../config/cloudinary'); // ⬅️ use this
const upload = multer({ storage });


// Admin routes (protected)
router.get('/add-product', isAuth, adminController.getAddProduct);
router.post('/add-product', isAuth, upload.single('image'), adminController.postAddProduct);

router.get('/products', isAuth, adminController.getProducts);
router.get('/edit-product/:id', isAuth, adminController.getEditProduct);
router.post('/edit-product/:id', isAuth, upload.single('image'), adminController.postEditProduct);
router.post('/delete-product/:id', isAuth, adminController.postDeleteProduct);

router.get('/orders', isAuth, adminController.getOrders);
router.get('/', isAuth, adminController.getDashboard);
router.post('/orders/:id/status', isAuth, adminController.updateOrderStatus);

module.exports = router;
