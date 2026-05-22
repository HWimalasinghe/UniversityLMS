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

// Basic route to test the server
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', db: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// ── Email transporter (Gmail SMTP) ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP transporter verification failed:', error.message);
  } else {
    console.log('✅ SMTP transporter is ready to send emails');
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
    from: `"UniLMS Administration" <${process.env.SMTP_USER}>`,
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

