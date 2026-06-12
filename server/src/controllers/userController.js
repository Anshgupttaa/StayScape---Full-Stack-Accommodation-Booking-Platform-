import User from '../models/User.js';
import Property from '../models/Property.js';

// @desc    Toggle property in wishlist
// @route   POST /api/users/wishlist
// @access  Private
export const toggleWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isWishlisted = user.wishlist.includes(propertyId);

    if (isWishlisted) {
      user.wishlist = user.wishlist.filter((id) => id.toString() !== propertyId);
    } else {
      user.wishlist.push(propertyId);
    }

    await user.save();
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
