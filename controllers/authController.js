const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const Admin = require('../models/Admin');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'designersplatoon@gmail.com',
    pass: 'mwwt symd nejy arab',
  },
});

exports.getRegister = (req, res) => {
  res.render('auth/register', {title: "Register"});
};

exports.postRegister = async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 12);
  const token = uuidv4();

  const admin = new Admin({ email, password: hashed, verificationToken: token });
  await admin.save();

  const verifyUrl = `http://localhost:3000/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email.</p>`,
  });

  res.send('Check your email to verify your account.');
};

exports.getVerifyEmail = async (req, res) => {
  const token = req.query.token;
  const admin = await Admin.findOne({ verificationToken: token });
  if (!admin) return res.send('Invalid token');
  admin.verified = true;
  admin.verificationToken = undefined;
  await admin.save();
  res.redirect('/auth/login');
};

exports.getLogin = (req, res) => {
  res.render('auth/login', {title: "Login"});
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (!admin || !admin.verified) return res.send('Email not verified or not registered');

  const match = await bcrypt.compare(password, admin.password);
  if (!match) return res.send('Incorrect credentials');

  req.session.isLoggedIn = true;
  req.session.admin = admin;
  res.redirect('/admin/products');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
