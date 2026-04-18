const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AppError } = require('../middleware/error.middleware');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email already registered.', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true }
    });

    // Create empty cart for user
    await prisma.cart.create({ data: { userId: user.id } });

    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      data: { user, token }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401);
    }

    const token = generateToken(user.id);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      data: { user: userWithoutPassword, token }
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, address: true, createdAt: true,
        _count: { select: { orders: true } }
      }
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, address },
      select: { id: true, name: true, email: true, role: true, phone: true, address: true }
    });

    res.json({ success: true, message: 'Profile updated.', data: user });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValid) {
      throw new AppError('Current password is incorrect.', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
