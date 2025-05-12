const Product = require('../models/product');
const Order = require('../models/order');

exports.getIndex = async (req, res) => {
  const allProducts = await Product.find();
  const shuffled = allProducts.sort(() => 0.5 - Math.random());

  const newProducts = await Product.find().sort({ createdAt: -1 }).limit(5);

  const youtubeLinks = [
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/tgbNymZ7vqY',
    'https://www.youtube.com/embed/sBws8MSXN7A'
  ];

  res.render('shop/index', {
    logoUrl: '/images/logo/logo.jpg',
    banner1: '/images/banner/banner1.jpg',
    banner2: '/images/banner/banner2.jpg',
    featured1: shuffled.slice(0, 6),
    featured2: newProducts,
    youtubeLinks,
    title: 'emonyBD'
  });
};



exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('shop/product-detail', { product, title: req.params.id, });
};

exports.addToCart = (req, res) => {
  const { productId } = req.body;
  if (!req.session.cart) req.session.cart = [];
  req.session.cart.push(productId);
  res.redirect('/cart');
};

exports.getCart = async (req, res) => {
  const cart = req.session.cart || [];
  const products = await Product.find({ _id: { $in: cart } });
  res.render('shop/cart', { products ,title: "Cart",});
};

exports.getCheckout = async (req, res) => {
  const cart = req.session.cart || [];
  const products = await Product.find({ _id: { $in: cart } });
  res.render('shop/checkout', { products , title: "Checkout"});
};


exports.postCheckout = async (req, res) => {
  const { name, phone, address, cart, total } = req.body;

  try {
    const cartItems = JSON.parse(cart);

    if (cartItems.length === 0) {
      return res.status(400).send('Your cart is empty.');
    }

    // Validate each item in the cart
    const products = cartItems.map(item => ({
      productId: item._id,
      price: item.price || 0,
      quantity: item.quantity || 1
    }));

    // Total price validation
    const calculatedTotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
    if (parseFloat(total) !== calculatedTotal) {
      return res.status(400).send('Total amount mismatch');
    }

    const order = new Order({
      customer: { name, phone, address },
      products,
      total: parseFloat(total),
      status: 'Pending'
    });

    await order.save();

    // Clear cart after successful checkout
    res.clearCookie('cart');  // Optional: Clear cart from session or cookies

    res.redirect('/order-success'); // Redirect to the success page
  } catch (err) {
    console.error('Order Error:', err);
    res.status(500).send('Failed to process order');
  }
};


exports.getAllProducts = async (req, res) => {
  const perPage = 10;
  const page = parseInt(req.query.page) || 1;

  const total = await Product.countDocuments();
  const products = await Product.find()
    .skip((page - 1) * perPage)
    .limit(perPage);

  if (req.xhr) {
    return res.json({ products });
  }

  res.render('shop/products', {
    title: "All Products",
    products,
    hasMore: (page * perPage) < total,
    currentPage: page
  });
};

exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    const products = await Product.find({
      title: { $regex: query, $options: 'i' } // Case-insensitive search
    }).limit(5);  // Limit results to 5 for performance reasons

    res.json(products);  // Send JSON response with the products
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAbout = (req, res) => {
  res.render('shop/about', {
    title: 'আমাদের সম্পর্কে'
  });
};

exports.getOrderSuccess = (req, res) => {
  res.render('shop/order-success', { title: 'Order Successful' });
};

exports.getTrack = (req, res) => {
  // Render the initial tracking page with the phone input form
  res.render('shop/track', {
    title: 'Track Order',
    orders: null
  });
};

exports.searchOrdersByPhone = async (req, res) => {
  try {
    const { phone } = req.query;

    // Find orders where customer phone matches the query
    const orders = await Order.find({ 'customer.phone': phone });

    if (orders.length === 0) {
      return res.render('shop/track', {
        title: 'Track Order',
        orders: null,
        message: 'No orders found for this phone number.'
      });
    }

    res.render('shop/track', {
      title: 'Track Order',
      orders,
      message: `Orders for phone number: ${phone}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
