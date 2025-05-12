require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const path = require('path');
const connectDB = require('./config/db');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const app = express();

// === Connect to MongoDB ===
connectDB();

// === View Engine Setup ===
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Default layout setup
app.set('layout', 'layout');
app.use(expressLayouts);

// === Middleware ===
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// === Multer & Cloudinary Setup ===
const { storage } = require('./config/cloudinary');
const upload = multer({ storage });

// === Session Setup ===
app.use(session({
  secret: process.env.SESSION_SECRET || 'yoursecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'
  })
}));

// === Authentication Helper for Views ===
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn || false;
  res.locals.logoUrl = '/images/logo.jpg';
  next();
});

// === Admin Routes (with custom layout) ===
app.use('/admin', (req, res, next) => {
  res.locals.layout = 'admin-layout';
  next();
}, adminRoutes);

// === Shop and Auth Routes ===
app.use(shopRoutes);
app.use('/auth', authRoutes);

// === 404 Page ===
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// === 500 Error Handler ===
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { title: 'Server Error' });
});

// === Start Server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
