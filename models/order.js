const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
  customer: {
    name: String,
    phone: String,
    address: String
  },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      price: Number,
      quantity: Number
    }
  ],
  total: Number, // This should include item total + shippingCharge
  shippingCharge: Number, // 👈 NEW FIELD to store shipping separately
  status: {
    type: String,
   enum: ['Pending', 'Courier', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Order', orderSchema);



const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
