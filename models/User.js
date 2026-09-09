import mongoose from 'mongoose';

const baseOptions = {
  discriminatorKey: 'role',
  collection: 'users',
  timestamps: true
};

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  avatar: { type: String },
  isActive: { type: Boolean, default: true }
}, baseOptions);

export const User = mongoose.model('User', userSchema);

export const Admin = User.discriminator('admin', new mongoose.Schema({
  permissions: [{ type: String }]
}));

export const Teacher = User.discriminator('teacher', new mongoose.Schema({
  speciality: { type: String },
  office: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }
}));

export const Student = User.discriminator('student', new mongoose.Schema({
  studentCode: { type: String, unique: true, sparse: true },
  level: { type: String },
  group: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  enrollmentDate: { type: Date, default: Date.now }
}));
