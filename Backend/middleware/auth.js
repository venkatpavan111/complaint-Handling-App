const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { mockUsers } = require('../memoryStore');

// Initialize Firebase Admin (optional service account or default credentials)
let firebaseAdmin = null;
try {
  const admin = require('firebase-admin');
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  firebaseAdmin = admin;
} catch (err) {
  console.log('[Firebase Admin Notice] Using JWT verification fallback; firebase-admin service default not initialized.');
}

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // 1. Verify with Firebase Admin SDK if token is a Firebase ID Token
      if (firebaseAdmin) {
        try {
          const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
          const { uid, email, name, picture } = decodedToken;

          let user = null;
          if (mongoose.connection.readyState === 1) {
            user = await User.findOne({ email: email ? email.toLowerCase() : '' });
            if (!user) {
              user = await User.create({
                name: name || (email ? email.split('@')[0] : 'Campus Student'),
                email: email || `${uid}@firebase.user`,
                password: 'FirebaseAuthDefaultPass@2026',
                role: (email && email.toLowerCase().includes('admin')) ? 'ADMIN' : 'STUDENT',
                identifier: `STU-${uid.slice(0, 6).toUpperCase()}`,
                avatar: picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
              });
            }
          }
          if (user) {
            req.user = user;
            return next();
          }
        } catch (firebaseErr) {
          // Token was not a Firebase ID Token; proceed to JWT decode fallback
        }
      }

      // 2. Decode standard JWT token fallback
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'college_complaint_super_secret_jwt_key_2026');

      // Try MongoDB first
      if (mongoose.connection.readyState === 1) {
        req.user = await User.findById(decoded.id).select('-password');
      }

      // Fallback to memory store
      if (!req.user) {
        const mockUser = mockUsers.find(u => u._id === decoded.id);
        if (mockUser) {
          req.user = {
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
            department: mockUser.department,
            identifier: mockUser.identifier,
            avatar: mockUser.avatar
          };
        } else {
          req.user = { _id: decoded.id, role: 'STUDENT' };
        }
      }
      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

module.exports = { protect, adminOnly };
