const Message = require('../models/Message');
const Complaint = require('../models/Complaint');
const mongoose = require('mongoose');
const { emitChatMessage } = require('../sockets/socketHandler');
const { mockMessages } = require('../memoryStore');

const getMessages = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find({ complaint: req.params.complaintId })
        .populate('sender', 'name role avatar')
        .sort({ createdAt: 1 });
      return res.json(messages);
    }

    const list = mockMessages.filter(m => m.complaint === req.params.complaintId);
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { complaintId, text } = req.body;

    if (!text || !complaintId) {
      return res.status(400).json({ message: 'Text and complaint ID are required' });
    }

    if (mongoose.connection.readyState === 1) {
      const message = await Message.create({
        complaint: complaintId,
        sender: req.user._id,
        text
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name role avatar');

      emitChatMessage(complaintId, populatedMessage);
      return res.status(201).json(populatedMessage);
    }

    // Memory Store messaging
    const newMsg = {
      _id: `msg_${Date.now()}`,
      complaint: complaintId,
      sender: { _id: req.user._id, name: req.user.name, role: req.user.role },
      text,
      createdAt: new Date().toISOString()
    };
    mockMessages.push(newMsg);

    emitChatMessage(complaintId, newMsg);
    res.status(201).json(newMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMessages, sendMessage };
