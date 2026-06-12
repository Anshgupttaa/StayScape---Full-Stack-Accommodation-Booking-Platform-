import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for Google OAuth uses
  googleId: { type: String },
  role: { type: String, enum: ['user', 'host', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  phone: { type: String },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
