import Property from '../models/Property.js';
import cloudinary, { isCloudinaryConfigured } from '../config/cloudinary.js';

// @desc    Get all properties (with filters optionally)
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
  try {
    const { city, type, minPrice, maxPrice, guests } = req.query;
    let query = {};

    if (city) query['location.city'] = { $regex: city, $options: 'i' };
    if (type) query.type = type;
    if (guests) query.maxGuests = { $gte: Number(guests) };
    
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    const properties = await Property.find(query).populate('hostId', 'name avatar');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get properties by batch (multiple IDs)
// @route   GET /api/properties/batch
// @access  Public
export const getPropertiesByBatch = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ message: 'No property IDs provided' });
    }
    
    // Support both single ID string and array of IDs
    const idArray = Array.isArray(ids) ? ids : [ids];
    
    const properties = await Property.find({ _id: { $in: idArray } }).populate('hostId', 'name avatar');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('hostId', 'name avatar email');
    if (property) {
      res.json(property);
    } else {
      res.status(404).json({ message: 'Property not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Host)
export const createProperty = async (req, res) => {
  try {
    const { title, description, type, pricePerNight, address, city, state, country, lat, lng, amenities, maxGuests, bedroomCount, bathroomCount } = req.body;
    
    // Process uploaded images
    let images = [];
    if (isCloudinaryConfigured && req.files && req.files.length > 0) {
      images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename // Cloudinary specific
      }));
    } else {
      // Fallback: If no Cloudinary config or no images were uploaded, provide a beautiful placeholder
      images = [
        { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', publicId: 'placeholder_res' }
      ];
    }

    const property = new Property({
      hostId: req.user._id,
      title,
      description,
      type,
      pricePerNight,
      location: {
        address,
        city,
        state,
        country,
        coordinates: { lat: Number(lat) || 0, lng: Number(lng) || 0 }
      },
      images,
      amenities: amenities ? amenities.split(',') : [],
      maxGuests,
      bedroomCount,
      bathroomCount
    });

    const createdProperty = await property.save();
    
    // Ensure user role is updated to host if not already
    if (req.user.role === 'user') {
      req.user.role = 'host';
      await req.user.save();
    }

    res.status(201).json(createdProperty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a property
// @route   DELETE /api/properties/:id
// @access  Private (Host)
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if the user is the host of this property
    if (property.hostId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this property' });
    }

    // Delete images from cloudinary only if configured
    if (isCloudinaryConfigured && property.images && property.images.length > 0) {
      for (const img of property.images) {
        if (img.publicId && !img.publicId.includes('placeholder') && !img.publicId.includes('dummy')) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }
    }

    await Property.deleteOne({ _id: req.params.id });

    res.json({ message: 'Property removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
