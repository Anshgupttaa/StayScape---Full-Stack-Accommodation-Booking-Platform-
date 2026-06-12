import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['card', 'netbanking', 'upi', 'razorpay'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentIntentId: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  bookingStatus: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
