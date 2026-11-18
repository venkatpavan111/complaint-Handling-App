require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Category = require('./models/Category');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const { calculatePriority } = require('./utils/priorityEngine');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_complaint_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await Category.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('[Seed] Cleared existing collection data');

    // 1. Seed Categories
    const categoriesData = [
      { name: 'Academic', description: 'Grade discrepancies, hall tickets, lecture schedule, exam hall issues', defaultUrgencyWeight: 20, icon: 'BookOpen' },
      { name: 'Maintenance', description: 'Electrical short circuits, AC failure, water leaks, elevator stuck', defaultUrgencyWeight: 25, icon: 'Wrench' },
      { name: 'Facilities', description: 'Projectors, whiteboard, library WiFi, gym equipment', defaultUrgencyWeight: 20, icon: 'Building' },
      { name: 'Hostel', description: 'Hostel room repairs, mess hygiene, water heater, washroom blockage', defaultUrgencyWeight: 25, icon: 'Home' },
      { name: 'Security', description: 'CCTV offline, door lock broken, unauthorized access, theft', defaultUrgencyWeight: 35, icon: 'ShieldAlert' },
      { name: 'Emergency', description: 'Fire hazard, medical injury, gas leak, physical safety', defaultUrgencyWeight: 45, icon: 'AlertTriangle' }
    ];
    await Category.insertMany(categoriesData);
    console.log('[Seed] Inserted Categories');

    // 2. Seed Admins & Demo Primary Credentials
    const primaryAdmin = await User.create({
      name: 'Dr. Robert Vance (Chief Admin)',
      email: 'admin@college.com',
      password: 'Admin@123',
      role: 'ADMIN',
      department: 'Campus Administration',
      identifier: 'ADM-001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      phone: '+1-555-0199'
    });

    const secondAdmin = await User.create({
      name: 'Sarah Connor (Estate Officer)',
      email: 'estate.admin@college.com',
      password: 'Admin@123',
      role: 'ADMIN',
      department: 'Facilities & Maintenance',
      identifier: 'ADM-002',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      phone: '+1-555-0200'
    });

    const primaryStudent = await User.create({
      name: 'Alex Morgan (Primary Student)',
      email: 'student@college.com',
      password: 'Student@123',
      role: 'STUDENT',
      department: 'Computer Science',
      identifier: 'STU-2024-001',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      phone: '+1-555-0101'
    });

    // Seed 20 Demo Students
    const studentDepartments = ['Computer Science', 'Electrical Eng', 'Mechanical Eng', 'Civil Eng', 'Business Admin', 'BioTech'];
    const studentUsers = [primaryStudent];

    for (let i = 2; i <= 20; i++) {
      const dept = studentDepartments[i % studentDepartments.length];
      const student = await User.create({
        name: `Student Demo ${i}`,
        email: `student${i}@college.com`,
        password: 'Student@123',
        role: 'STUDENT',
        department: dept,
        identifier: `STU-2024-${i.toString().padStart(3, '0')}`,
        avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80`,
        phone: `+1-555-01${i.toString().padStart(2, '0')}`
      });
      studentUsers.push(student);
    }
    console.log(`[Seed] Created 2 Admins and ${studentUsers.length} Students`);

    // 3. Seed Sample Complaints with AI Priority Engine
    const rawComplaints = [
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
        status: 'Assigned',
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
      },
      {
        title: 'CCTV Camera Offline Near Girls Hostel Gate',
        description: 'Security camera 4 at east entrance gate is offline and door lock handle seems loose.',
        category: 'Security',
        location: 'Girls Hostel Main Gate',
        student: studentUsers[5]._id,
        status: 'Submitted'
      },
      {
        title: 'Air Conditioner Cooling Failure in Seminar Hall',
        description: 'AC unit in Seminar Hall 1 is blowing warm air. Room temperature is high during afternoon sessions.',
        category: 'Maintenance',
        location: 'Seminar Hall 1',
        student: studentUsers[6]._id,
        status: 'Resolved',
        assignedAdmin: secondAdmin._id
      },
      {
        title: 'Whiteboard Marker Dry & Broken Bench in Classroom 104',
        description: 'Two wooden benches are wobbly and whiteboards need fresh markers for daily lectures.',
        category: 'Facilities',
        location: 'Classroom 104 - Mechanical Block',
        student: studentUsers[7]._id,
        status: 'Closed',
        assignedAdmin: primaryAdmin._id
      },
      {
        title: 'Grade Discrepancy & Hall Ticket Download Error',
        description: 'Unable to download mid-term exam hall ticket from student portal due to re-evaluation status delay.',
        category: 'Academic',
        location: 'Academic Registrar Office',
        student: studentUsers[8]._id,
        status: 'Submitted'
      },
      {
        title: 'Fan Noise & Dust Accumulation in Study Hall',
        description: 'Ceiling fan makes loud grinding noise on high speed in 2nd floor reading hall.',
        category: 'Maintenance',
        location: 'Central Library - 2nd Floor',
        student: studentUsers[9]._id,
        status: 'Submitted'
      }
    ];

    let seededCount = 0;
    for (const item of rawComplaints) {
      const priorityAnalysis = calculatePriority({
        subject: item.title,
        description: item.description,
        category: item.category,
        location: item.location
      });

      const ticketId = `CMP-2026-${1000 + seededCount + 1}`;

      await Complaint.create({
        ticketId,
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
      seededCount++;
    }

    console.log(`[Seed] Successfully seeded ${seededCount} complaints across various categories and dynamic priorities!`);

    await mongoose.connection.close();
    console.log('[Seed] Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
