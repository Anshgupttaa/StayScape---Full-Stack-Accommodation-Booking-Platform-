import express from 'express';
import { createBooking, getMyBookings, updateBookingToPaid, getNotifications, cancelBooking, createRazorpayOrder, verifyRazorpayPayment, getHostBookings } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createBooking);

router.route('/my-trips')
  .get(protect, getMyBookings);

router.route('/notifications')
  .get(protect, getNotifications);

router.route('/host-bookings')
  .get(protect, getHostBookings);

router.route('/:id/cancel')
  .patch(protect, cancelBooking);

router.route('/:id/pay')
  .put(protect, updateBookingToPaid);

router.route('/:id/razorpay-order')
  .post(protect, createRazorpayOrder);

router.route('/:id/razorpay-verify')
  .post(protect, verifyRazorpayPayment);

export default router;
