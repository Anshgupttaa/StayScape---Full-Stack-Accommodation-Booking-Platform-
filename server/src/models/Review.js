import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  review: { type: String, required: true }
}, { timestamps: true });

// Prevent multiple reviews from the same user for the same property
reviewSchema.index({ propertyId: 1, userId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
