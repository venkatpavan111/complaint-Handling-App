const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Category = require('./models/Category');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const { calculatePriority } = require('./utils/priorityEngine');

const seedFunction = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Category.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    // 1. Categories
    await Category.insertMany([
      { name: 'Academic', description: 'Grade discrepancies, hall tickets, lecture schedule', defaultUrgencyWeight: 20 },
      { name: 'Maintenance', description: 'Electrical, AC failure, water leaks, elevator stuck', defaultUrgencyWeight: 25 },
      { name: 'Facilities', description: 'Projectors, whiteboard, library WiFi', defaultUrgencyWeight: 20 },
      { name: 'Hostel', description: 'Hostel room repairs, mess hygiene', defaultUrgencyWeight: 25 },
      { name: 'Security', description: 'CCTV offline, door lock broken', defaultUrgencyWeight: 35 },
      { name: 'Emergency', description: 'Fire hazard, medical injury', defaultUrgencyWeight: 45 }
    ]);

    // 2. Admins & Primary Demo Credentials
    const primaryAdmin = await User.create({
      name: 'Dr. Robert Vance (Chief Admin)',
      email: 'admin@college.com',
      password: 'Admin@123',
      role: 'ADMIN',
      department: 'Campus Administration',
      identifier: 'ADM-001'
    });

    const secondAdmin = await User.create({
      name: 'Sarah Connor (Estate Officer)',
      email: 'estate.admin@college.com',
      password: 'Admin@123',
      role: 'ADMIN',
      department: 'Facilities & Maintenance',
      identifier: 'ADM-002'
    });

    const primaryStudent = await User.create({
      name: 'Alex Morgan (Primary Student)',
      email: 'student@college.com',
      password: 'Student@123',
      role: 'STUDENT',
      department: 'Computer Science',
      identifier: 'STU-2024-001'
    });

    const studentUsers = [primaryStudent];
    for (let i = 2; i <= 10; i++) {
      const student = await User.create({
        name: `Student Demo ${i}`,
        email: `student${i}@college.com`,
        password: 'Student@123',
        role: 'STUDENT',
        department: 'Computer Science',
        identifier: `STU-2024-00${i}`
      });
      studentUsers.push(student);
    }

    // 3. Sample Complaints with AI Priority Calculation
    const sampleTickets = [
      {
        title: 'Fume Sparking and Electrical Fire Hazard in Chemistry Lab',
        description: 'Dangerous spark and smoke coming out of main circuit switchboard in Chemistry Lab 302. High risk of electrical shock or explosion!',
        category: 'Emergency',
        location: 'Chemistry Lab - Room 302',
        student: studentUsers[1]._id,
        status: 'Submitted'
      },
      {
        title: 'Elevator Stuck with Students Inside in Library Block',
        description: 'Main lift trapped between 2nd and 3rd floor in Central Library building. Urgent help needed immediately, elevator panic button triggered!',
        category: 'Emergency',
        location: 'Central Library Lift 2',
        student: studentUsers[2]._id,
        status: 'In Progress',
        assignedAdmin: primaryAdmin._id
      },
      {
        title: 'Server Down & WiFi Offline During Online Semester Exam',
        description: 'Main server down and wireless router disconnected in Computer Lab 1. Online lab exam is ongoing today, immediate fix required!',
        category: 'Academic',
        location: 'Main Lab - Computer Wing B',
        student: primaryStudent._id,
        status: 'In Progress',
        assignedAdmin: primaryAdmin._id
      },
      {
        title: 'Drinking Water Pipeline Leakage & Flooding in Boys Hostel B',
        description: 'Major water leakage overflowing near room 405 washroom area in Boys Hostel B. Floor completely flooded.',
        category: 'Hostel',
        location: 'Boys Hostel B - Floor 4',
        student: studentUsers[3]._id,
        status: 'In Progress',
        assignedAdmin: secondAdmin._id
      },
      {
        title: 'Projector Display Blinking & Sound System Noise in Auditorium',
        description: 'Ceiling projector blinks rapidly and audio speaker has loud static noise during ongoing guest lectures.',
        category: 'Facilities',
        location: 'Auditorium - Block A',
        student: studentUsers[4]._id,
        status: 'Submitted'
      }
    ];

    let count = 0;
    for (const item of sampleTickets) {
      const priorityAnalysis = calculatePriority({
        subject: item.title,
        description: item.description,
        category: item.category,
        location: item.location
      });

      count++;
      await Complaint.create({
        ticketId: `CMP-2026-100${count}`,
        title: item.title,
        description: item.description,
        category: item.category,
        location: item.location,
        priority: priorityAnalysis.priority,
        priorityScore: priorityAnalysis.priorityScore,
        priorityReason: priorityAnalysis.priorityReason,
        detectedKeywords: priorityAnalysis.detectedKeywords,
        status: item.status || 'Submitted',
        student: item.student,
        assignedAdmin: item.assignedAdmin || null,
        statusHistory: [{
          status: 'Submitted',
          updatedBy: item.student,
          note: 'Initial complaint registration'
        }]
      });
    }

    console.log(`[Auto-Seed] Successfully seeded ${count} sample complaints and demo accounts!`);
  } catch (err) {
    console.error('[Auto-Seed Error]', err.message);
  }
};

module.exports = seedFunction;
