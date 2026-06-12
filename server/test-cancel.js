import mongoose from 'mongoose';
import Booking from './src/models/Booking.js';
import Property from './src/models/Property.js';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testCancellation = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/stayspace');
    console.log('Connected to DB');

    // 1. Get a user and property
    const user = await User.findOne({});
    const property = await Property.findOne({});

    if (!user || !property) {
      console.error('No user or property found in DB to test with');
      process.exit(1);
    }

    // 2. Create a test booking
    const booking = new Booking({
      propertyId: property._id,
      userId: user._id,
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 86400000),
      guests: 2,
      totalPrice: 1000,
      paymentMethod: 'upi',
      bookingStatus: 'confirmed'
    });

    const savedBooking = await booking.save();
    console.log('Created test booking with ID:', savedBooking._id.toString());

    // 3. Try to find it by ID (like the controller does)
    const found = await Booking.findById(savedBooking._id);
    console.log('Found by ID immediately after save:', found ? 'YES' : 'NO');

    // 4. Update status (simulate cancel)
    found.bookingStatus = 'cancelled';
    await found.save();
    console.log('Status updated to cancelled successfully');

    // 5. Cleanup
    await Booking.deleteOne({ _id: savedBooking._id });
    console.log('Test booking cleaned up');

    await mongoose.connection.close();
    console.log('Test completed successfully');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
};

testCancellation();
