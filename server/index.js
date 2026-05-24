const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('✅ MongoDB connected successfully!'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// ── MongoDB Schemas ──────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String }, // Storing password (NIC for students)
  role: { type: String, enum: ['Admin', 'Faculty Dean', 'Lecturer', 'Assistant Lecturer', 'Instructor', 'Student'], default: 'Student' },
  facultyId: String,
  facultyIds: [String],
  studentId: String,
  universityEmail: String,
  createdAt: { type: Date, default: Date.now },
});

const studentRequestSchema = new mongoose.Schema({
  fullName: String,
  nic: String,
  referenceEmail: String,
  facultyId: String,
  degreeName: String,
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  advancedLevel: {
    stream: String,
    result: String,
    indexNumber: String,
    year: String,
  },
  ordinaryLevel: {
    grades: {
      A: Number,
      B: Number,
      C: Number,
      S: Number,
      F: Number,
    },
    indexNumber: String,
    year: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const StudentRequest = mongoose.model('StudentRequest', studentRequestSchema);

// Basic route to test the server
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// ── Email transporter (Gmail SMTP) ───────────────────────────────────────────
const mailSender = process.env.SMTP_USER || process.env.EMAIL_USER;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: mailSender,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP transporter verification failed:', error.message);
  } else {
    console.log('✅ SMTP transporter is ready to send emails using', mailSender);
  }
});

// ── POST /api/send-email ──────────────────────────────────────────────────────
// Body: { to, studentName, studentId, universityEmail, password, faculty, degree }
app.post('/api/send-email', async (req, res) => {
  const { to, studentName, studentId, universityEmail, password, faculty, degree } = req.body;
  console.log('POST /api/send-email', { to, studentId, universityEmail, faculty, degree });

  if (!to || !studentId || !universityEmail || !password) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  const mailOptions = {
    from: `"UniLMS Administration" <${mailSender}>`,
    to,
    subject: '🎓 Your UniLMS Admission Has Been Approved!',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.10);">
              <!-- Header -->
              <tr>
                <td style="background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);padding:40px 40px 32px;text-align:center;">
                  <div style="font-size:32px;font-weight:800;color:#ffffff;letter-spacing:-1px;">🎓 UniLMS</div>
                  <div style="color:#c7d2fe;font-size:14px;margin-top:4px;">University Learning Management System</div>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 40px 32px;">
                  <h2 style="margin:0 0 8px;color:#1e1b4b;font-size:22px;">Congratulations, ${studentName}! 🎉</h2>
                  <p style="color:#6b7280;margin:0 0 28px;font-size:15px;line-height:1.6;">
                    Your admission application has been reviewed and <strong style="color:#16a34a;">approved</strong> by the university administration.
                    Welcome to <strong>${faculty}</strong> — <em>${degree}</em>.
                  </p>

                  <!-- Credential Box -->
                  <div style="background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:12px;padding:24px 28px;margin-bottom:28px;">
                    <div style="font-size:13px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Your University Credentials</div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;width:160px;">Student ID</td>
                        <td style="padding:8px 0;font-family:monospace;font-size:15px;font-weight:700;color:#4f46e5;">${studentId}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">University Email</td>
                        <td style="padding:8px 0;font-family:monospace;font-size:15px;font-weight:700;color:#4f46e5;">${universityEmail}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;color:#6b7280;font-size:14px;">Password</td>
                        <td style="padding:8px 0;font-family:monospace;font-size:15px;font-weight:700;color:#4f46e5;">${password}</td>
                      </tr>
                    </table>
                  </div>

                  <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:12px 16px;font-size:13px;color:#854d0e;">
                    ⚠️ <strong>Security Notice:</strong> Please change your password after your first login. Do not share your credentials with anyone.
                  </div>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                  <p style="margin:0;color:#9ca3af;font-size:12px;">
                    This is an automated message from UniLMS. Please do not reply to this email.<br/>
                    © ${new Date().getFullYear()} University Learning Management System
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Welcome email sent to ${to}`);
    res.json({ success: true, message: `Email sent to ${to}` });
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    res.status(500).json({ error: 'Failed to send email.', details: err.message });
  }
});

// ── Helper: Generate Student ID ──────────────────────────────────────────────
const generateStudentId = async (facultyCode, facultyId) => {
  const prefix = (facultyCode || 'STU').toUpperCase();
  const yearSuffix = new Date().getFullYear().toString().slice(-2);
  const pattern = `${prefix}${yearSuffix}`;

  // Find all existing student IDs matching this prefix+year
  const existingStudents = await User.find({
    studentId: new RegExp(`^${pattern}`, 'i'),
  });

  const existingNumbers = existingStudents
    .map(u => {
      const numPart = u.studentId.slice(pattern.length);
      return parseInt(numPart, 10);
    })
    .filter(n => !isNaN(n));

  const nextNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
  return `${prefix}${yearSuffix}${nextNum.toString().padStart(3, '0')}`;
};

// ── POST /api/approve-request ────────────────────────────────────────────────
// Body: { requestId, facultyCode }
app.post('/api/approve-request', async (req, res) => {
  try {
    const { requestId, facultyCode } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: 'Missing requestId' });
    }

    // Find the request in MongoDB
    const studentRequest = await StudentRequest.findById(requestId);
    if (!studentRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Generate student ID
    const studentId = await generateStudentId(facultyCode, studentRequest.facultyId);
    const universityEmail = `${studentId}@unilms.lk`;

    // Create student user in MongoDB
    const newStudent = new User({
      name: studentRequest.fullName,
      email: studentRequest.referenceEmail,
      password: studentRequest.nic, // Setting password to their NIC
      role: 'Student',
      facultyId: studentRequest.facultyId,
      studentId,
      universityEmail,
    });
    await newStudent.save();

    // Update request status to Approved
    studentRequest.status = 'Approved';
    await studentRequest.save();

    // Send welcome email
    await transporter.sendMail({
      from: `"UniLMS Administration" <${mailSender}>`,
      to: studentRequest.referenceEmail,
      subject: '🎓 Your UniLMS Admission Has Been Approved!',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.10);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#4f46e5 0%,#6366f1 100%);padding:40px 40px 32px;text-align:center;">
                    <div style="font-size:32px;font-weight:800;color:#ffffff;letter-spacing:-1px;">🎓 UniLMS</div>
                    <div style="color:#c7d2fe;font-size:14px;margin-top:4px;">University Learning Management System</div>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 32px;">
                    <h2 style="margin:0 0 8px;color:#1e1b4b;font-size:22px;">Congratulations, ${studentRequest.fullName}! 🎉</h2>
                    <p style="color:#6b7280;margin:0 0 28px;font-size:15px;line-height:1.6;">
                      Your admission application has been reviewed and <strong style="color:#16a34a;">approved</strong> by the university administration.
                      Welcome to your program — <em>${studentRequest.degreeName}</em>.
                    </p>

                    <!-- Credential Box -->
                    <div style="background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:12px;padding:24px 28px;margin-bottom:28px;">
                      <div style="font-size:13px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Your University Credentials</div>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;font-size:14px;width:160px;">Student ID</td>
                          <td style="padding:8px 0;font-family:monospace;font-size:15px;font-weight:700;color:#4f46e5;">${studentId}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;font-size:14px;">University Email</td>
                          <td style="padding:8px 0;font-family:monospace;font-size:15px;font-weight:700;color:#4f46e5;">${universityEmail}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#6b7280;font-size:14px;">Password</td>
                          <td style="padding:8px 0;font-family:monospace;font-size:15px;font-weight:700;color:#4f46e5;">${studentRequest.nic}</td>
                        </tr>
                      </table>
                    </div>

                    <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:12px 16px;font-size:13px;color:#854d0e;">
                      ⚠️ <strong>Security Notice:</strong> Please change your password after your first login. Do not share your credentials with anyone.
                    </div>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">
                      This is an automated message from UniLMS. Please do not reply to this email.<br/>
                      © ${new Date().getFullYear()} University Learning Management System
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log(`✅ Request ${requestId} approved. Student ${studentId} created. Email sent to ${studentRequest.referenceEmail}`);
    res.json({ success: true, message: 'Request approved and student created', studentId, universityEmail, user: newStudent });
  } catch (err) {
    console.error('❌ Approval error:', err.message);
    res.status(500).json({ error: 'Failed to approve request', details: err.message });
  }
});

// ── POST /api/login ──────────────────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Try finding by email, universityEmail, or studentId
    const user = await User.findOne({
      $or: [
        { email },
        { universityEmail: email },
        { studentId: email }
      ],
      password
    });

    // Also check hardcoded admin fallback if not found in DB
    if (!user && email === 'admin@university.edu' && password === 'admin123') {
      return res.json({ 
        success: true, 
        user: { id: 'admin', name: 'Admin', role: 'Admin', email } 
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// ── POST /api/users ──────────────────────────────────────────────────────────
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password, role, facultyId, facultyIds, studentId, universityEmail } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newUser = new User({
      name,
      email,
      password, // Save password if provided
      role,
      facultyId,
      facultyIds,
      studentId,
      universityEmail
    });
    
    await newUser.save();
    console.log(`✅ New user created: ${name} (${role})`);
    res.json({ success: true, message: 'User created successfully', user: newUser });
  } catch (err) {
    console.error('❌ User creation error:', err.message);
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
});

// ── GET /api/users ──────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    console.error('❌ Fetch users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

// ── POST /api/submit-request ────────────────────────────────────────────────
// Body: { fullName, nic, referenceEmail, facultyId, degreeName, advancedLevel, ordinaryLevel }
app.post('/api/submit-request', async (req, res) => {
  try {
    const { fullName, nic, referenceEmail, facultyId, degreeName, advancedLevel, ordinaryLevel } = req.body;

    if (!fullName || !nic || !referenceEmail || !facultyId || !degreeName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newRequest = new StudentRequest({
      fullName,
      nic,
      referenceEmail,
      facultyId,
      degreeName,
      advancedLevel,
      ordinaryLevel,
      status: 'Pending',
    });

    await newRequest.save();
    console.log(`📝 New student request submitted by ${fullName} (${nic}). Request ID: ${newRequest._id}`);
    res.json({ success: true, message: 'Request submitted successfully', requestId: newRequest._id });
  } catch (err) {
    console.error('❌ Request submission error:', err.message);
    res.status(500).json({ error: 'Failed to submit request', details: err.message });
  }
});

// ── POST /api/reject-request ────────────────────────────────────────────────
// Body: { requestId }
app.post('/api/reject-request', async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) {
      return res.status(400).json({ error: 'Missing requestId' });
    }

    const studentRequest = await StudentRequest.findById(requestId);
    if (!studentRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    studentRequest.status = 'Rejected';
    await studentRequest.save();

    console.log(`❌ Request ${requestId} rejected.`);
    res.json({ success: true, message: 'Request rejected' });
  } catch (err) {
    console.error('❌ Rejection error:', err.message);
    res.status(500).json({ error: 'Failed to reject request', details: err.message });
  }
});

// ── GET /api/requests ──────────────────────────────────────────────────────
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await StudentRequest.find().sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error('❌ Fetch requests error:', err.message);
    res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

