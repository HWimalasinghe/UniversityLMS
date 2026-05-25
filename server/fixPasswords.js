const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String },
  role: String,
});

const User = mongoose.model('User', userSchema);

async function fixPasswords() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({ password: { $exists: false } });
  
  let updatedCount = 0;
  for (const user of users) {
    if (user.role && user.role !== 'Student') {
      const defaultPassword = user.role.replace(/\s+/g, '') + '123';
      user.password = defaultPassword;
      await user.save();
      updatedCount++;
      console.log(`Updated password for ${user.email} to ${defaultPassword}`);
    } else if (user.role === 'Student') {
      // Assuming they should have had their NIC set, but if not, fallback to Student123
      user.password = 'Student123';
      await user.save();
      updatedCount++;
      console.log(`Updated password for ${user.email} to Student123 (Fallback)`);
    }
  }
  
  console.log(`Fixed ${updatedCount} users.`);
  process.exit(0);
}

fixPasswords().catch(console.error);
