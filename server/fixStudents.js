const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  degreeName: String,
});
const studentRequestSchema = new mongoose.Schema({
  referenceEmail: String,
  degreeName: String,
});

const User = mongoose.model('User', userSchema);
const StudentRequest = mongoose.model('StudentRequest', studentRequestSchema);

async function fixStudents() {
  await mongoose.connect(process.env.MONGO_URI);
  const students = await User.find({ role: 'Student', degreeName: { $exists: false } });
  
  let updatedCount = 0;
  for (const student of students) {
    const req = await StudentRequest.findOne({ referenceEmail: student.email });
    if (req && req.degreeName) {
      student.degreeName = req.degreeName;
      await student.save();
      updatedCount++;
      console.log(`Updated degreeName for ${student.email} to ${req.degreeName}`);
    }
  }
  
  console.log(`Fixed ${updatedCount} students.`);
  process.exit(0);
}

fixStudents().catch(console.error);
