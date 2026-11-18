const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const mongoose = require('mongoose');
const { calculatePriority } = require('../utils/priorityEngine');
const { emitUrgentAlert, emitStatusUpdate, emitNewComplaintSubmitted } = require('../sockets/socketHandler');
const { mockComplaints, mockUsers } = require('../memoryStore');
const { sendAdminComplaintAlert, sendStudentResolutionConfirmation } = require('../utils/emailService');

const previewPriority = async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    const analysis = calculatePriority({ subject: title, description, category, location });
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, attachments, imageUrl } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ message: 'Please provide title, description, and location' });
    }

    const priorityAnalysis = calculatePriority({
      subject: title,
      description,
      category: category || 'Maintenance',
      location
    });

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `CMP-${Date.now().toString().slice(-4)}${randomSuffix}`;

    if (mongoose.connection.readyState === 1) {
      const complaint = await Complaint.create({
        ticketId,
        title,
        description,
        category: category || 'Maintenance',
        location,
        priority: priorityAnalysis.priority,
        priorityScore: priorityAnalysis.priorityScore,
        priorityReason: priorityAnalysis.priorityReason,
        detectedKeywords: priorityAnalysis.detectedKeywords,
        status: 'Pending',
        student: req.user._id,
        attachments: attachments || [],
        imageUrl: imageUrl || null,
        statusHistory: [{ status: 'Pending', updatedBy: req.user._id, note: 'Registered by student' }]
      });

      if (priorityAnalysis.priority === 'HIGH') {
        emitUrgentAlert(complaint);
      }

      const populated = await Complaint.findById(complaint._id)
        .populate('student', 'name email department identifier avatar')
        .populate('assignedAdmin', 'name email department avatar');

      // Trigger real-time Socket.io notification (new_complaint) to connected Admins & dispatch email
      emitNewComplaintSubmitted(populated);
      sendAdminComplaintAlert(populated);

      return res.status(201).json(populated);
    }

    // Memory Store Creation
    const newComplaint = {
      _id: `cmp_${Date.now()}`,
      ticketId,
      title,
      description,
      category: category || 'Maintenance',
      location,
      priority: priorityAnalysis.priority,
      priorityScore: priorityAnalysis.priorityScore,
      priorityReason: priorityAnalysis.priorityReason,
      detectedKeywords: priorityAnalysis.detectedKeywords,
      status: 'Pending',
      imageUrl: imageUrl || null,
      student: { _id: req.user._id, name: req.user.name, email: req.user.email, identifier: req.user.identifier },
      assignedAdmin: null,
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: 'Pending', note: 'Registered by student' }]
    };

    mockComplaints.unshift(newComplaint);

    if (priorityAnalysis.priority === 'HIGH') {
      emitUrgentAlert(newComplaint);
    }

    // Trigger real-time Socket.io notification (new_complaint) to connected Admins & dispatch email
    emitNewComplaintSubmitted(newComplaint);
    sendAdminComplaintAlert(newComplaint);

    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaints = async (req, res) => {
  try {
    const { priority, category, status, search } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (req.user.role === 'STUDENT') query.student = req.user._id;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { ticketId: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      const complaints = await Complaint.find(query)
        .populate('student', 'name email department identifier avatar')
        .populate('assignedAdmin', 'name email department avatar')
        .sort({ priorityScore: -1, createdAt: -1 });

      return res.json(complaints);
    }

    // Memory Store Filtering
    let list = [...mockComplaints];

    if (req.user.role === 'STUDENT') {
      list = list.filter(c => c.student?._id === req.user._id || c.student === req.user._id);
    }
    if (priority) list = list.filter(c => c.priority === priority);
    if (category) list = list.filter(c => c.category === category);
    if (status) list = list.filter(c => c.status === status);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        c.ticketId.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      );
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const complaint = await Complaint.findById(req.params.id)
        .populate('student', 'name email department identifier avatar phone')
        .populate('assignedAdmin', 'name email department avatar phone')
        .populate('statusHistory.updatedBy', 'name role');

      if (complaint) return res.json(complaint);
    }

    const item = mockComplaints.find(c => c._id === req.params.id);
    if (!item) return res.status(404).json({ message: 'Complaint ticket not found' });

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { status, assignedAdminId, note, resolutionNotes, adminRemarks } = req.body;
    const finalRemarks = adminRemarks || resolutionNotes || '';

    if (mongoose.connection.readyState === 1) {
      const complaint = await Complaint.findById(req.params.id);
      if (complaint) {
        if (status) complaint.status = status;
        if (finalRemarks) {
          complaint.resolutionNotes = finalRemarks;
          complaint.adminRemarks = finalRemarks;
        }
        if (assignedAdminId) complaint.assignedAdmin = assignedAdminId;

        // If status is Closed, Completed, or Resolved, set resolvedAt timestamp
        const isClosed = ['Closed', 'Completed', 'Resolved'].includes(status);
        if (isClosed) {
          complaint.resolvedAt = new Date();
        }

        complaint.statusHistory.push({
          status: status || complaint.status,
          updatedBy: req.user._id,
          note: note || `Status updated to ${status || complaint.status}`
        });
        await complaint.save();

        const updated = await Complaint.findById(complaint._id)
          .populate('student', 'name email department identifier avatar')
          .populate('assignedAdmin', 'name email department avatar');

        emitStatusUpdate(updated);

        // Send Nodemailer confirmation email to student on Closed / Completed / Resolved
        if (isClosed) {
          sendStudentResolutionConfirmation(updated, finalRemarks);
        }
        return res.json(updated);
      }
    }

    // Memory Store Status Update
    const item = mockComplaints.find(c => c._id === req.params.id);
    if (!item) return res.status(404).json({ message: 'Complaint not found' });

    if (status) item.status = status;
    if (finalRemarks) {
      item.resolutionNotes = finalRemarks;
      item.adminRemarks = finalRemarks;
    }
    if (assignedAdminId) item.assignedAdmin = { _id: req.user._id, name: req.user.name };

    const isClosed = ['Closed', 'Completed', 'Resolved'].includes(status);
    if (isClosed) {
      item.resolvedAt = new Date().toISOString();
    }

    item.statusHistory.push({
      status: status || item.status,
      note: note || `Status updated to ${status}`
    });

    emitStatusUpdate(item);
    if (isClosed) {
      sendStudentResolutionConfirmation(item, finalRemarks);
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const totalComplaints = await Complaint.countDocuments();
      const highPriorityCount = await Complaint.countDocuments({ priority: 'HIGH' });
      const submittedCount = await Complaint.countDocuments({ status: 'Submitted' });
      const inProgressCount = await Complaint.countDocuments({ status: 'In Progress' });
      const resolvedCount = await Complaint.countDocuments({ status: 'Resolved' });
      const closedCount = await Complaint.countDocuments({ status: 'Closed' });

      const categoryBreakdown = await Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      return res.json({
        metrics: {
          totalComplaints,
          highPriorityCount,
          submittedCount,
          inProgressCount,
          resolvedCount,
          closedCount,
          resolutionRate: totalComplaints > 0 ? Math.round(((resolvedCount + closedCount) / totalComplaints) * 100) : 0
        },
        categoryBreakdown,
        recentLogs: []
      });
    }

    // Memory Store Analytics
    const totalComplaints = mockComplaints.length;
    const highPriorityCount = mockComplaints.filter(c => c.priority === 'HIGH').length;
    const submittedCount = mockComplaints.filter(c => c.status === 'Submitted').length;
    const inProgressCount = mockComplaints.filter(c => c.status === 'In Progress').length;
    const resolvedCount = mockComplaints.filter(c => c.status === 'Resolved').length;
    const closedCount = mockComplaints.filter(c => c.status === 'Closed').length;

    const catMap = {};
    mockComplaints.forEach(c => {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
    });
    const categoryBreakdown = Object.keys(catMap).map(k => ({ _id: k, count: catMap[k] }));

    res.json({
      metrics: {
        totalComplaints,
        highPriorityCount,
        submittedCount,
        inProgressCount,
        resolvedCount,
        closedCount,
        resolutionRate: totalComplaints > 0 ? Math.round(((resolvedCount + closedCount) / totalComplaints) * 100) : 0
      },
      categoryBreakdown,
      recentLogs: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  previewPriority,
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAnalytics
};
