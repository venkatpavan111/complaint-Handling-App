/**
 * High-Speed Instant In-Memory Store Fallback for ResolveQ
 * Pre-seeded with single designated admin (admin.resolveq@saveetha.com)
 * and primary student (venkatapavanp2082.sse@saveetha.com)
 */

const { calculatePriority } = require('./utils/priorityEngine');

let mockUsers = [
  {
    _id: 'usr_admin_001',
    name: 'Admin User',
    email: 'admin@gmail.com',
    password: 'Admin@123',
    role: 'ADMIN',
    department: 'Campus Administration',
    identifier: 'ADM-001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    _id: 'usr_student_001',
    name: 'Student User',
    email: 'student@gmail.com',
    password: 'Student@123',
    role: 'STUDENT',
    department: 'Computer Science',
    identifier: 'STU-001',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80'
  }
];

let mockComplaints = [
  {
    _id: 'cmp_001',
    ticketId: 'CMP-2026-1001',
    title: 'Fume Sparking and Electrical Fire Hazard in Chemistry Lab',
    description: 'Dangerous spark and smoke coming out of main circuit switchboard in Chemistry Lab 302. High risk of electrical shock or explosion!',
    category: 'Emergency',
    location: 'Chemistry Lab - Room 302',
    priority: 'HIGH',
    priorityScore: 92,
    priorityReason: 'High urgency detected: Electrical fire hazard & smoke in lab',
    detectedKeywords: ['fire', 'spark', 'electrical', 'hazard', 'smoke'],
    status: 'Submitted',
    student: { _id: 'usr_student_001', name: 'Student User', email: 'student@gmail.com', identifier: 'STU-001' },
    studentName: 'Student User',
    studentEmail: 'student@gmail.com',
    assignedAdmin: null,
    createdAt: new Date().toISOString(),
    statusHistory: [{ status: 'Submitted', note: 'Initial registration' }]
  },
  {
    _id: 'cmp_002',
    ticketId: 'CMP-2026-1002',
    title: 'Elevator Stuck with Students Inside in Library Block',
    description: 'Main lift trapped between 2nd and 3rd floor in Central Library building. Urgent help needed immediately, elevator panic button triggered!',
    category: 'Maintenance',
    location: 'Central Library Lift 2',
    priority: 'HIGH',
    priorityScore: 88,
    priorityReason: 'Urgent maintenance issue: trapped students in elevator',
    detectedKeywords: ['stuck', 'elevator', 'trapped', 'panic'],
    status: 'In Progress',
    student: { _id: 'usr_student_001', name: 'Student User', email: 'student@gmail.com', identifier: 'STU-001' },
    studentName: 'Student User',
    studentEmail: 'student@gmail.com',
    assignedAdmin: { _id: 'usr_admin_001', name: 'Admin User', email: 'admin@gmail.com' },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    statusHistory: [{ status: 'In Progress', note: 'Technician dispatched' }]
  }
];

let mockMessages = [
  {
    _id: 'msg_001',
    complaint: 'cmp_002',
    sender: { _id: 'usr_admin_001', name: 'Admin User', role: 'ADMIN' },
    text: 'Our campus team has dispatched an engineer to Lift 2. Stand by.',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  }
];

let mockFeedbacks = [];

module.exports = {
  mockUsers,
  mockComplaints,
  mockMessages,
  mockFeedbacks
};
