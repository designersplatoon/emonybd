const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../config/cloudinary'); 

exports.getAddProduct = (req, res) => {
  res.render('admin/add-product', { title: "Add Product" });
};

exports.postAddProduct = async (req, res) => {
  const { title, price, description } = req.body;
  const imageUrl = req.file?.path || '';
  const imagePublicId = req.file?.filename || '';

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    imagePublicId
  });

  await product.save();
  res.redirect('/admin/products');
};

exports.getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  const products = await Product.find()
    .skip(skip)
    .limit(limit);

  const count = await Product.countDocuments();
  const totalPages = Math.ceil(count / limit);

  res.render('admin/products', {
    products,
    title: "Products",
    currentPage: page,
    totalPages
  });
};

exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('products.productId'); // Fetch product details

    const count = await Order.countDocuments();
    const totalPages = Math.ceil(count / limit);

    res.render('admin/orders', {
      orders,
      title: "Orders",
      currentPage: page,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching orders');
  }
};


exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await Order.findByIdAndUpdate(id, { status });
    res.redirect('/admin/orders');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update status');
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const orders = await Order.find();

    const productOrderCount = {};

    orders.forEach(order => {
      order.products.forEach(p => {
        const productId = p._id.toString();
        if (!productOrderCount[productId]) {
          productOrderCount[productId] = { count: 0 };
        }
        productOrderCount[productId].count += p.quantity;
      });
    });

    const productIds = Object.keys(productOrderCount);
    const products = await Product.find({ _id: { $in: productIds } });

    const mostOrderedProducts = products.map(product => ({
      product,
      count: productOrderCount[product._id.toString()].count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

    res.render('admin/dashboard', {
      title: 'Dashboard',
      mostOrderedProducts
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load dashboard');
  }
};

exports.getEditProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.redirect('/admin/products');
  res.render('admin/edit-product', { product, title: "Edit Product" });
};

exports.postEditProduct = async (req, res) => {
  const { title, price, description } = req.body;
  const product = await Product.findById(req.params.id);

  product.title = title;
  product.price = price;
  product.description = description;

  if (req.file) {
    // Delete old Cloudinary image if exists
    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (err) {
        console.error('Failed to delete Cloudinary image:', err);
      }
    }

    product.imageUrl = req.file.path;
    product.imagePublicId = req.file.filename;
  }

  await product.save();
  res.redirect('/admin/products');
};

exports.postDeleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product?.imagePublicId) {
    try {
      await cloudinary.uploader.destroy(product.imagePublicId);
    } catch (err) {
      console.error('Failed to delete Cloudinary image:', err);
    }
  }

  await Product.findByIdAndDelete(req.params.id);
  res.redirect('/admin/products');
};


exports.getInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('products.productId');
    if (!order) return res.status(404).send('Order not found');

    res.render('admin/invoice', {
      order,
      title: `Invoice - ${order._id}` // ✅ this fixes the error
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to generate invoice');
  }
};

