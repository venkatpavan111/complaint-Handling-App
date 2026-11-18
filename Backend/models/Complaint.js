const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Academic', 'Maintenance', 'Facilities', 'Hostel', 'Security', 'Emergency', 'Other'],
    default: 'Maintenance'
  },
  location: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  priorityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 10
  },
  priorityReason: {
    type: String,
    default: ''
  },
  detectedKeywords: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Analyzed', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Completed'],
    default: 'Pending'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolutionNotes: {
    type: String,
    default: ''
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  attachments: [{
    type: String
  }],
  imageUrl: {
    type: String,
    default: null
  },
  statusHistory: [{
    status: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    note: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
