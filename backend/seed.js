const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected for seeding...");

    // 1. Raman ko check karein
    const existingRaman = await User.findOne({ username: 'raman' });
    if (existingRaman) {
      console.log("⚠️ User 'raman' already exists! Updating password...");
      await User.deleteOne({ username: 'raman' }); // Purana raman delete karke naya bana rahe hain
    }

    // 2. Naya Admin 'raman' banayein
    const hashedPassword = await bcrypt.hash('raman 123', 10); // Space ka dhyan rakha hai
    const ramanAdmin = new User({
      username: 'raman',
      password: hashedPassword,
      role: 'admin'
    });

    await ramanAdmin.save();
    console.log("✅ New Admin created: raman / raman 123");
    
    // 3. Purane 'admin' ka password bhi reset kar dete hain agar galti ho rahi hai
    const adminUser = await User.findOne({ username: 'admin' });
    if (adminUser) {
        const hashedAdminPass = await bcrypt.hash('admin123', 10);
        adminUser.password = hashedAdminPass;
        await adminUser.save();
        console.log("✅ Original Admin password reset to: admin123");
    }

    console.log("🚀 All set! You can now login.");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
};

seedAdmin();