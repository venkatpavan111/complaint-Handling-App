/**
 * Real-Time Socket.io Handler for ResolveQ
 * Handles live ticket tracking, chat messaging, and instant notification workflows:
 * 1. Student -> Admin: new_complaint / NEW_COMPLAINT_SUBMITTED (Status: Pending)
 * 2. Admin -> Student: NOTIFICATION_RECEIVED / complaint_updated (Status: Closed/Completed/Resolved)
 */

let ioInstance = null;

const initSocket = (server, io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room based on user role / userId
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket] User joined personal room: user_${userId}`);
    });

    // Admins join admin room for instant complaint alerts & notifications
    socket.on('join_admin_room', () => {
      socket.join('admin_room');
      console.log(`[Socket] Admin joined admin_room: ${socket.id}`);
    });

    // Join room for a specific complaint chat/tracking thread
    socket.on('join_complaint_room', (complaintId) => {
      socket.join(`complaint_${complaintId}`);
      console.log(`[Socket] Socket ${socket.id} joined complaint_${complaintId}`);
    });

    // Leave complaint room
    socket.on('leave_complaint_room', (complaintId) => {
      socket.leave(`complaint_${complaintId}`);
    });

    // Typing status indicator in chat
    socket.on('typing_start', ({ complaintId, userName }) => {
      socket.to(`complaint_${complaintId}`).emit('user_typing', { userName, isTyping: true });
    });

    socket.on('typing_stop', ({ complaintId }) => {
      socket.to(`complaint_${complaintId}`).emit('user_typing', { isTyping: false });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => ioInstance;

/**
 * 1. New Complaint Submitted (Student -> Admin)
 * Emits real-time notification to all connected Admins in admin_room
 */
const emitNewComplaintSubmitted = (complaint) => {
  if (ioInstance) {
    const studentName = complaint.studentName || complaint.student?.name || 'Student';
    const notificationPayload = {
      type: 'NEW_COMPLAINT',
      title: 'New Pending Complaint Submitted',
      message: `New Complaint Submitted: "${complaint.title}" by ${studentName}`,
      complaint,
      status: complaint.status || 'Pending',
      timestamp: new Date().toISOString()
    };

    ioInstance.to('admin_room').emit('NEW_COMPLAINT_SUBMITTED', notificationPayload);
    ioInstance.to('admin_room').emit('new_complaint', notificationPayload);
    console.log(`[Socket] Emitted new_complaint for ticket ${complaint.ticketId} to admin_room`);
  }
};

/**
 * Helper function to emit high-priority urgent alert to all connected Admins
 */
const emitUrgentAlert = (complaint) => {
  if (ioInstance) {
    ioInstance.to('admin_room').emit('URGENT_COMPLAINT_ALERT', {
      message: `URGENT HIGH PRIORITY COMPLAINT DETECTED! Score: ${complaint.priorityScore}`,
      complaint
    });
  }
};

/**
 * 2. Complaint Status Update / Resolved / Closed (Admin -> Student)
 * Emits real-time notification to specific student room & complaint thread
 */
const emitStatusUpdate = (complaint) => {
  if (ioInstance) {
    const studentId = complaint.student?._id || complaint.student;
    const isClosedOrResolved = ['Closed', 'Completed', 'Resolved'].includes(complaint.status);

    const updatePayload = {
      type: isClosedOrResolved ? 'COMPLAINT_RESOLVED' : 'STATUS_CHANGED',
      title: isClosedOrResolved ? `🎉 Complaint #${complaint.ticketId} Marked as ${complaint.status}` : `Ticket Status Updated: ${complaint.ticketId}`,
      message: isClosedOrResolved
        ? `Your complaint "${complaint.title}" has been marked as ${complaint.status}.`
        : `Your complaint "${complaint.title}" status is now ${complaint.status}.`,
      complaint,
      status: complaint.status,
      timestamp: new Date().toISOString()
    };

    // 1. Thread broadcast
    ioInstance.to(`complaint_${complaint._id}`).emit('COMPLAINT_STATUS_UPDATED', updatePayload);
    ioInstance.to(`complaint_${complaint._id}`).emit('complaint_updated', updatePayload);

    // 2. Direct student personal room emission
    ioInstance.to(`user_${studentId}`).emit('NOTIFICATION_RECEIVED', updatePayload);
    ioInstance.to(`user_${studentId}`).emit('complaint_updated', updatePayload);
    console.log(`[Socket] Emitted status update (${complaint.status}) for user_${studentId}`);
  }
};

/**
 * Helper function to emit new live chat message
 */
const emitChatMessage = (complaintId, messageObj) => {
  if (ioInstance) {
    ioInstance.to(`complaint_${complaintId}`).emit('NEW_CHAT_MESSAGE', messageObj);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitNewComplaintSubmitted,
  emitUrgentAlert,
  emitStatusUpdate,
  emitChatMessage
};
