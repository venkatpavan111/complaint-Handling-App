/**
 * Automated Email Alert Service for ResolveQ
 * Uses Nodemailer to dispatch automated email notifications for:
 * 1. Student -> Admin: New Complaint Alert (Status: Pending)
 * 2. Admin -> Student: Complaint Resolution/Closure Confirmation (Status: Closed/Completed/Resolved)
 */

const nodemailer = require('nodemailer');

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();

// Initialize Nodemailer Transporter with fallback
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback json/stream transporter for development logging
  return nodemailer.createTransport({
    jsonTransport: true
  });
};

const transporter = createTransporter();

/**
 * 0. Send Automated Welcome & Confirmation Email to New User on Registration
 */
const sendRegistrationWelcomeEmail = async (user) => {
  const recipientEmail = user.email;
  const userName = user.name || 'Student';
  const department = user.department || 'General';
  const identifier = user.identifier || 'N/A';
  const role = user.role || 'STUDENT';
  const registrationDate = new Date().toLocaleString();

  const emailSubject = `🎓 [ResolveQ] Registration Successful! Welcome, ${userName}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #0f172a; color: #f8fafc;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px;">RESOLVEQ</h1>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Campus Grievance & Complaint Redressal System</p>
      </div>

      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
        <h2 style="color: #22c55e; margin-top: 0; font-size: 18px;">✅ Registration Successful!</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Hello <strong style="color: #ffffff;">${userName}</strong>, welcome to ResolveQ! Your account has been registered successfully.
        </p>
      </div>

      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #e2e8f0; font-size: 15px; border-bottom: 1px solid #334155; padding-bottom: 8px;">Your Account Profile</h3>
        <table style="width: 100%; font-size: 13px; color: #cbd5e1; line-height: 1.8;">
          <tr>
            <td style="color: #94a3b8; width: 40%;">Name:</td>
            <td style="color: #ffffff; font-weight: 600;">${userName}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Email:</td>
            <td style="color: #ffffff; font-weight: 600;">${recipientEmail}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Account Role:</td>
            <td style="color: #818cf8; font-weight: 600;">${role}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Department:</td>
            <td>${department}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Roll / ID Number:</td>
            <td>${identifier}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">Registered On:</td>
            <td>${registrationDate}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #1e293b; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin-bottom: 24px;">
        <h3 style="margin-top: 0; color: #e2e8f0; font-size: 15px;">Next Steps</h3>
        <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
          You can now log in to the ResolveQ portal to submit complaints, attach photos/GPS location, track real-time resolution updates, and chat with administration.
        </p>
        <div style="text-align: center;">
          <a href="http://localhost:5173" style="display: inline-block; padding: 12px 28px; background: linear-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; border-radius: 8px; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
            Sign In to Portal
          </a>
        </div>
      </div>

      <p style="font-size: 11px; color: #64748b; text-align: center; margin: 0;">
        This is an automated notification from ResolveQ Complaint Handling System.
      </p>
    </div>
  `;

  const textContent = `
======================================================
🎓 RESOLVEQ - REGISTRATION SUCCESSFUL
======================================================
Hello ${userName},

Your account has been created successfully in the ResolveQ Portal.

ACCOUNT SUMMARY:
------------------------------------------------------
• Name         : ${userName}
• Email        : ${recipientEmail}
• Role         : ${role}
• Department   : ${department}
• Roll / ID    : ${identifier}
• Registered At: ${registrationDate}

You can now sign in to ResolveQ to lodge campus grievances, track resolution progress, and receive real-time alerts.

Portal URL: http://localhost:5173
======================================================
`;

  try {
    const info = await transporter.sendMail({
      from: `"ResolveQ Campus System" <${process.env.SMTP_USER || 'notifications@resolveq.com'}>`,
      to: recipientEmail,
      subject: emailSubject,
      text: textContent,
      html: htmlContent
    });

    console.log(`\n📧 [NODEMAILER DISPATCH -> NEW USER WELCOME (${recipientEmail})]:`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Status: Registration email sent successfully`);

    return { success: true, recipient: recipientEmail, info };
  } catch (error) {
    console.error('Nodemailer Welcome Email Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 1. Send Automated Email Alert to Admin when a student submits a new complaint
 */
const sendAdminComplaintAlert = async (complaint) => {
  const studentName = complaint.studentName || complaint.student?.name || 'Student';
  const studentEmail = complaint.studentEmail || complaint.student?.email || 'student@saveetha.com';
  const studentDept = complaint.studentDepartment || complaint.student?.department || 'Saveetha Engineering Student';

  const emailSubject = `🚨 [ResolveQ Alert] New Pending Complaint Submitted: ${complaint.ticketId}`;
  const textContent = `
======================================================
🚨 RESOLVEQ AUTOMATED ADMIN COMPLAINT ALERT
======================================================
A new grievance ticket has been submitted to the ResolveQ portal.

TICKET SUMMARY:
------------------------------------------------------
• Ticket ID       : ${complaint.ticketId}
• Issue Title     : ${complaint.title}
• Category        : ${complaint.category}
• Location        : ${complaint.location}
• Status          : ${complaint.status || 'Pending'}
• AI Urgency Tier : ${complaint.priority} (Score: ${complaint.priorityScore}/100)

STUDENT DETAILS:
------------------------------------------------------
• Student Name    : ${studentName}
• College Email   : ${studentEmail}
• Department      : ${studentDept}

ISSUE DESCRIPTION:
------------------------------------------------------
"${complaint.description}"

• Submitted At    : ${new Date().toLocaleString()}
======================================================
Dispatch link: http://localhost:5173/admin
`;

  try {
    const info = await transporter.sendMail({
      from: `"ResolveQ Campus System" <${process.env.SMTP_USER || 'notifications@resolveq.saveetha.com'}>`,
      to: ADMIN_EMAIL,
      subject: emailSubject,
      text: textContent
    });

    console.log(`\n📧 [NODEMAILER DISPATCH -> ADMIN (${ADMIN_EMAIL})]:`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Status: Sent successfully`);

    return { success: true, recipient: ADMIN_EMAIL, info };
  } catch (error) {
    console.error('Nodemailer Admin Alert Error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * 2. Send Automated Confirmation/Resolution Email to Student when complaint is marked as Closed/Completed/Resolved
 */
const sendStudentResolutionConfirmation = async (complaint, customRemarks = '') => {
  const studentEmail = complaint.studentEmail || complaint.student?.email || 'student@saveetha.com';
  const studentName = complaint.studentName || complaint.student?.name || 'Student';
  const remarks = customRemarks || complaint.adminRemarks || complaint.resolutionNotes || 'The reported issue has been inspected and resolved by campus staff.';
  const resolvedAtStr = complaint.resolvedAt ? new Date(complaint.resolvedAt).toLocaleString() : new Date().toLocaleString();
  const statusStr = complaint.status || 'Closed';

  const emailSubject = `🎉 [ResolveQ Notice] Complaint #${complaint.ticketId} Marked as ${statusStr}`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #f8fafc;">
      <h2 style="color: #4f46e5; margin-top: 0;">🎉 ResolveQ Complaint Resolution Notice</h2>
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your submitted grievance ticket has been reviewed and marked as <strong>${statusStr}</strong> by campus administration.</p>
      
      <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #cbd5e1; margin: 15px 0;">
        <h3 style="margin-top: 0; color: #1e293b;">Ticket Summary</h3>
        <ul style="list-style: none; padding-left: 0; line-height: 1.8;">
          <li><strong>Complaint ID:</strong> ${complaint.ticketId}</li>
          <li><strong>Title / Category:</strong> ${complaint.title} (${complaint.category})</li>
          <li><strong>Location:</strong> ${complaint.location}</li>
          <li><strong>Current Status:</strong> <span style="color: #16a34a; font-weight: bold;">${statusStr} ✅</span></li>
          <li><strong>Resolved Timestamp:</strong> ${resolvedAtStr}</li>
        </ul>
      </div>

      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 15px 0;">
        <h4 style="margin-top: 0; color: #334155;">Admin Remarks / Resolution Details</h4>
        <p style="color: #1e293b; font-style: italic;">"${remarks}"</p>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        This is an automated confirmation email sent from Saveetha ResolveQ Campus Portal.
      </p>
    </div>
  `;

  const textContent = `
======================================================
🎉 RESOLVEQ COMPLAINT RESOLUTION CONFIRMATION
======================================================
Dear ${studentName},

Your complaint ticket has been marked as ${statusStr} by campus administration.

TICKET DETAILS:
------------------------------------------------------
• Complaint ID      : ${complaint.ticketId}
• Title / Category  : ${complaint.title} (${complaint.category})
• Location          : ${complaint.location}
• Status            : ${statusStr} ✅
• Resolved Timestamp: ${resolvedAtStr}

ADMIN REMARKS:
------------------------------------------------------
"${remarks}"

======================================================
Portal link: http://localhost:5173/dashboard
`;

  try {
    const info = await transporter.sendMail({
      from: `"ResolveQ Campus Administration" <${process.env.SMTP_USER || 'support@resolveq.saveetha.com'}>`,
      to: studentEmail,
      subject: emailSubject,
      text: textContent,
      html: htmlContent
    });

    console.log(`\n📧 [NODEMAILER DISPATCH -> STUDENT (${studentEmail})]:`);
    console.log(`Subject: ${emailSubject}`);
    console.log(`Status: Sent successfully to student`);

    return { success: true, recipient: studentEmail, info };
  } catch (error) {
    console.error('Nodemailer Student Resolution Alert Error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  ADMIN_EMAIL,
  sendRegistrationWelcomeEmail,
  sendAdminComplaintAlert,
  sendStudentResolutionConfirmation
};
