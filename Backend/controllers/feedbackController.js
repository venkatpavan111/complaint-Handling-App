const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');
const { mockFeedbacks } = require('../memoryStore');

const submitFeedback = async (req, res) => {
  try {
    const { complaintId, rating, comments } = req.body;

    if (!complaintId || !rating) {
      return res.status(400).json({ message: 'Complaint ID and rating are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const feedback = await Feedback.create({
        complaint: complaintId,
        student: req.user._id,
        rating,
        comments: comments || ''
      });
      return res.status(201).json(feedback);
    }

    const newFb = {
      _id: `fb_${Date.now()}`,
      complaint: complaintId,
      student: { _id: req.user._id, name: req.user.name },
      rating,
      comments: comments || '',
      createdAt: new Date().toISOString()
    };
    mockFeedbacks.push(newFb);
    res.status(201).json(newFb);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeedback = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const feedback = await Feedback.findOne({ complaint: req.params.complaintId })
        .populate('student', 'name avatar');
      return res.json(feedback);
    }

    const fb = mockFeedbacks.find(f => f.complaint === req.params.complaintId);
    res.json(fb || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitFeedback, getFeedback };
