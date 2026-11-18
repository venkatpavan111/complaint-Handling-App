const express = require('express');
const router = express.Router();
const {
  previewPriority,
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  getAnalytics
} = require('../controllers/complaintController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/preview-priority', protect, previewPriority);
router.post('/', protect, createComplaint);
router.get('/', protect, getComplaints);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/:id', protect, getComplaintById);
router.put('/:id/status', protect, adminOnly, updateComplaintStatus);

module.exports = router;
