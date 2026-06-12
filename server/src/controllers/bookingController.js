import fs from 'fs';
import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create new booking & Stripe Payment Intent
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const { propertyId, checkInDate, checkOutDate, guests, totalPrice, paymentMethod = 'upi' } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // 2. Save Pending Booking to DB
    const booking = new Booking({
      propertyId,
      userId: req.user._id,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      paymentMethod,
      paymentIntentId: null,
      paymentStatus: 'pending',
      bookingStatus: 'confirmed'
    });

    const createdBooking = await booking.save();
    console.log('[DEBUG] Created Booking ID:', createdBooking._id);

    res.status(201).json({ booking: createdBooking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's bookings (Trips)
// @route   GET /api/bookings/my-trips
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('propertyId', 'title images location pricePerNight type')
      .sort({ createdAt: -1 });

    const logInfo = `[${new Date().toISOString()}] Served Trips - User: ${req.user._id}, Count: ${bookings.length}, IDs: ${bookings.map(b => b._id).join(', ')}\n`;
    fs.appendFileSync('debug.log', logInfo);

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bookings for properties owned by logged in host
// @route   GET /api/bookings/host-bookings
// @access  Private (Host)
export const getHostBookings = async (req, res) => {
  try {
    const hostProperties = await Property.find({ hostId: req.user._id });
    const propertyIds = hostProperties.map(p => p._id);
    
    const bookings = await Booking.find({ propertyId: { $in: propertyIds } })
      .populate('propertyId', 'title location images')
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking payment status (Webhook alternative)
// @route   PUT /api/bookings/:id/pay
// @access  Private
export const updateBookingToPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (booking) {
      booking.paymentStatus = 'completed';
      const updatedBooking = await booking.save();
      res.json(updatedBooking);
    } else {
      res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get notifications for logged in user (derived from bookings)
// @route   GET /api/bookings/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('propertyId', 'title location')
      .sort({ createdAt: -1 })
      .limit(10);

    const notifications = bookings.map(b => {
      const isCancelled = b.bookingStatus === 'cancelled';
      return {
        id: b._id,
        type: isCancelled ? 'booking_cancelled' : 'booking_confirmed',
        title: isCancelled ? 'Booking Cancelled ❌' : 'Booking Confirmed! 🎉',
        message: b.propertyId
          ? `Your stay at ${b.propertyId.title}${b.propertyId.location?.city ? ` in ${b.propertyId.location.city}` : ''} has been ${isCancelled ? 'cancelled' : 'confirmed'}.`
          : `Your booking has been ${isCancelled ? 'cancelled' : 'confirmed'}.`,
        createdAt: b.createdAt,
        status: b.bookingStatus
      };
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const logMsg = `[${new Date().toISOString()}] Cancel Attempt - ID: ${req.params.id}, User: ${req.user._id}\n`;
    fs.appendFileSync('debug.log', logMsg);

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Booking NOT FOUND. ID: ${req.params.id}\n`);
      return res.status(404).json({ message: 'Booking not found' });
    }

    fs.appendFileSync('debug.log', `[${new Date().toISOString()}] Booking found! Status: ${booking.bookingStatus}\n`);
    // ...
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Only allow cancellation of 'confirmed' bookings
    if (booking.bookingStatus !== 'confirmed') {
      return res.status(400).json({ message: `Cannot cancel booking with status: ${booking.bookingStatus}` });
    }

    booking.bookingStatus = 'cancelled';
    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Obtain Razorpay Order ID
// @route   POST /api/bookings/:id/razorpay-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
       return res.status(401).json({ message: 'Not authorized' });
    }

    const options = {
      amount: booking.totalPrice * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `receipt_booking_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);
    
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/bookings/:id/razorpay-verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Payment is valid
      booking.paymentStatus = 'completed';
      booking.razorpayPaymentId = razorpay_payment_id;
      await booking.save();
      
      return res.status(200).json({ message: "Payment verified successfully", booking });
    } else {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({ message: "Invalid signature" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
