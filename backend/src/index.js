require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes     = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes  = require('./routes/product.routes');
const cartRoutes     = require('./routes/cart.routes');
const orderRoutes    = require('./routes/order.routes');
const adminRoutes    = require('./routes/admin.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging
if (process.env.NODE_ENV !== 'test') app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Məktəb Ləvazimatları API' });
});

// Routes
app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/admin',      adminRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `${req.originalUrl} tapılmadı` });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
