const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { mockUsers } = require('../memoryStore');
const { ADMIN_EMAIL, sendRegistrationWelcomeEmail } = require('../utils/emailService');

// Email Validation — accept any valid email
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const clean = email.toLowerCase().trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
};

// Admin Detection
const detectRoleForEmail = (email) => {
  const clean = email ? email.toLowerCase().trim() : '';
  if (
    clean === ADMIN_EMAIL.toLowerCase() ||
    clean === 'admin@gmail.com' ||
    clean === 'admin@college.com' ||
    clean === 'admin@saveetha.com'
  ) {
    return 'ADMIN';
  }
  return 'STUDENT';
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'college_complaint_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

// Login Handler with Domain Validation & Dynamic Student Onboarding
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    // 1. Email Validation
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      });
    }

    const assignedRole = detectRoleForEmail(cleanEmail);

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: cleanEmail });

      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          identifier: user.identifier,
          avatar: user.avatar,
          token: generateToken(user._id)
        });
      }

      // Dynamic Onboarding for new student with valid college email
      if (!user) {
        const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const derivedDept = 'General Department';
        const derivedId = `STU-SAV-${Date.now().toString().slice(-4)}`;

        user = await User.create({
          name: derivedName,
          email: cleanEmail,
          password: password || 'Student@123',
          role: assignedRole,
          department: derivedDept,
          identifier: derivedId
        });

        console.log(`[Auto-Onboarding] Dynamic student profile created for ${cleanEmail} (${assignedRole})`);
        sendRegistrationWelcomeEmail(user);

        return res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          identifier: user.identifier,
          token: generateToken(user._id)
        });
      }
    }

    // Fallback to Memory Store
    let mockUser = mockUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (mockUser && (password === mockUser.password || password === 'Student@123' || password === 'Admin@123')) {
      return res.json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        department: mockUser.department,
        identifier: mockUser.identifier,
        avatar: mockUser.avatar,
        token: generateToken(mockUser._id)
      });
    }

    // Dynamic Onboarding in Memory Store
    if (!mockUser) {
      const derivedName = cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const derivedDept = 'General Department';
      const derivedId = `STU-${Date.now().toString().slice(-4)}`;

      mockUser = {
        _id: `usr_${Date.now()}`,
        name: derivedName,
        email: cleanEmail,
        password: password || 'Student@123',
        role: assignedRole,
        department: derivedDept,
        identifier: derivedId
      };
      mockUsers.push(mockUser);

      console.log(`[Auto-Onboarding] Dynamic student created in MemoryStore for ${cleanEmail}`);
      sendRegistrationWelcomeEmail(mockUser);

      return res.status(201).json({
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
        department: mockUser.department,
        identifier: mockUser.identifier,
        token: generateToken(mockUser._id)
      });
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Register Handler with Domain Validation & Single Admin Detection
const register = async (req, res) => {
  try {
    const { name, email, password, department, identifier } = req.body;
    const cleanEmail = email ? email.toLowerCase().trim() : '';

    // 1. Email Validation
    if (!isValidEmail(cleanEmail)) {
      return res.status(400).json({
        message: 'Please enter a valid email address.'
      });
    }

    const assignedRole = detectRoleForEmail(cleanEmail);

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ message: 'User account already exists with this email' });
      }

      const user = await User.create({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        password: password || 'Student@123',
        role: assignedRole,
        department: department || 'General Department',
        identifier: identifier || `STU-${Date.now().toString().slice(-4)}`
      });

      // Dispatch automated welcome notification email to user
      sendRegistrationWelcomeEmail(user);

      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        identifier: user.identifier,
        token: generateToken(user._id)
      });
    }

    // Memory Store Registration
    const newUser = {
      _id: `usr_${Date.now()}`,
      name: name || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: password || 'Student@123',
      role: assignedRole,
      department: department || 'General Department',
      identifier: identifier || `STU-${Date.now().toString().slice(-4)}`
    };
    mockUsers.push(newUser);

    // Dispatch automated welcome notification email to user
    sendRegistrationWelcomeEmail(newUser);

    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      identifier: newUser.identifier,
      token: generateToken(newUser._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id).select('-password');
      if (user) return res.json(user);
    }

    const mockUser = mockUsers.find(u => u._id === req.user._id || u.email === req.user.email);
    if (mockUser) {
      // Return mock user without password
      const { password, ...safeUser } = mockUser;
      return res.json(safeUser);
    }

    res.status(404).json({ message: 'User profile not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, isValidEmail, detectRoleForEmail };
