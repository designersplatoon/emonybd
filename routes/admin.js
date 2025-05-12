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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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
