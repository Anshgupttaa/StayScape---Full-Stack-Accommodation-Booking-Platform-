import express from 'express';
import { getProperties, getPropertyById, createProperty, deleteProperty, getPropertiesByBatch } from '../controllers/propertyController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(getProperties)
  .post(protect, upload.array('images', 5), createProperty); // Allow up to 5 images

router.route('/batch').get(getPropertiesByBatch);

router.route('/:id')
  .get(getPropertyById)
  .delete(protect, deleteProperty);

export default router;
