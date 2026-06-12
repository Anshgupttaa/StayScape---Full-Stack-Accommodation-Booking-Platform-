import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Hotel', 'Villa', 'PG', 'Room', 'Apartment', 'Homestay'], required: true },
  pricePerNight: { type: Number, required: true },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: { lat: Number, lng: Number }
  },
  images: [{ url: String, publicId: String }],
  amenities: [{ type: String }],
  maxGuests: { type: Number, required: true },
  bedroomCount: { type: Number, required: true },
  bathroomCount: { type: Number, required: true },
  ratingsAverage: { type: Number, default: 0, set: val => Math.round(val * 10) / 10 },
  ratingsQuantity: { type: Number, default: 0 }
}, { timestamps: true });

const Property = mongoose.model('Property', propertySchema);
export default Property;
