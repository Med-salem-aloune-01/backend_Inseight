import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { Teacher } from './models/User.js'; // adjust path if needed

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB:', mongoose.connection.name);

  const email = 'mohamed.trabelsi@eduinsight.com';
  const newPassword = '000000';

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  const result = await Teacher.findOneAndUpdate(
    { email },
    { password: hashedPassword }
  );

  if (!result) {
    console.log('No user found with that email');
  } else {
    console.log('Password updated for', email);
  }

  await mongoose.disconnect();
}

run();