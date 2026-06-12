import express from 'express';
import { toggleWishlist, getWishlist } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/wishlist')
  .post(protect, toggleWishlist)
  .get(protect, getWishlist);

export default router;
