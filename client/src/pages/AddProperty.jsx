import { useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaCheckCircle } from 'react-icons/fa';

const AddProperty = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Villa',
    pricePerNight: '',
    maxGuests: 1,
    bedroomCount: 1,
    bathroomCount: 1,
    city: '',
    country: '',
    address: '',
    amenities: '',
  });
  const [images, setImages] = useState([]);

  // Calculate Progress
  const progress = useMemo(() => {
    const fields = Object.values(formData).filter(v => v !== '' && v !== 0);
    const imageWeight = images.length > 0 ? 1 : 0;
    return Math.floor(((fields.length + imageWeight) / (Object.keys(formData).length + 1)) * 100);
  }, [formData, images]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      submitData.append('pricePerNight', formData.pricePerNight);
      submitData.append('maxGuests', formData.maxGuests);
      submitData.append('bedroomCount', formData.bedroomCount);
      submitData.append('bathroomCount', formData.bathroomCount);
      submitData.append('address', formData.address);
      submitData.append('city', formData.city);
      submitData.append('country', formData.country);
      submitData.append('amenities', formData.amenities);

      images.forEach((file) => {
        submitData.append('images', file);
      });

      await axios.post('/api/properties', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      });

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="p-12 text-center min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-background text-gray-900 dark:text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-[40px] border-iridescent"
      >
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Access Denied</h2>
        <p className="text-gray-500 mb-8">Please log in to your account to host a property.</p>
        <button onClick={() => navigate('/')} className="bg-primary-500 text-white px-8 py-3 rounded-full font-bold">Return Home</button>
      </motion.div>
    </div>
  );

  const inputClass = "w-full p-4 glass rounded-[24px] focus:ring-4 focus:ring-primary-500/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600";
  const labelClass = "block text-[10px] font-black uppercase tracking-widest text-primary-500 mb-2 ml-1";
  const sectionClass = "p-8 glass rounded-[32px] shadow-xl hover:shadow-2xl transition-all duration-500 group perspective-1000";
  const headerClass = "text-xl font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tighter border-b border-gray-200 dark:border-white/5 pb-4 flex items-center justify-between";

  const MotionInput = ({ children, label }) => (
    <motion.div
      className="relative z-0 focus-within:z-50 focus-within:-translate-y-[5px] focus-within:scale-[1.02] transition-transform duration-300"
    >
      <label className={labelClass}>{label}</label>
      {children}
    </motion.div>
  );

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-background text-gray-900 dark:text-white pb-32 pt-12 overflow-x-hidden transition-colors duration-500">

      {/* 3D Liquid Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-2 z-[110] bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-primary-500 via-rose-500 to-indigo-500 relative"
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 animate-liquid" />
          <div className="absolute top-0 right-0 w-8 h-full bg-white blur-md opacity-50" />
        </motion.div>
      </div>

      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-black mb-2 tracking-tighter text-glow">Host your <span className="text-primary-500">Space.</span></h1>
          <p className="text-gray-500 font-medium">Add your property details to start hosting guests.</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-rose-500/10 text-rose-500 p-6 rounded-3xl mb-12 border border-rose-500/20 flex items-center gap-4"
          >
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="font-bold text-sm tracking-tight">{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">

          {/* Basics */}
          <section className={sectionClass}>
            <div className={headerClass}>
              <span>Basic Information</span>
              <FaCheckCircle className={formData.title && formData.description ? 'text-primary-500' : 'text-white/10'} />
            </div>
            <div className="space-y-6">
              <MotionInput label="Property Title">
                <input type="text" name="title" required value={formData.title} onChange={handleChange} className={inputClass} placeholder="Modern Beach Villa" />
              </MotionInput>

              <MotionInput label="Description">
                <textarea name="description" required value={formData.description} onChange={handleChange} className={inputClass} rows="4" placeholder="Describe what makes your space unique..."></textarea>
              </MotionInput>

              <div className="grid grid-cols-2 gap-6">
                <MotionInput label="Property Type">
                  <select name="type" className={`${inputClass} appearance-none cursor-pointer`} value={formData.type} onChange={handleChange}>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Room">Room</option>
                    <option value="Villa">Villa</option>
                    <option value="Cabin">Cabin</option>
                    <option value="PG">PG</option>
                    <option value="Hotel">Hotel</option>
                  </select>
                </MotionInput>
                <MotionInput label="Price per night (₹)">
                  <input type="number" name="pricePerNight" required min="1" value={formData.pricePerNight} onChange={handleChange} className={inputClass} />
                </MotionInput>
              </div>
            </div>
          </section>

          {/* Spatial Capacity */}
          <section className={sectionClass}>
            <div className={headerClass}>
              <span>Property Details</span>
              <FaCheckCircle className="text-primary-500" />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <MotionInput label="Max Guests">
                <input type="number" name="maxGuests" required min="1" value={formData.maxGuests} onChange={handleChange} className={inputClass} />
              </MotionInput>
              <MotionInput label="Bedrooms">
                <input type="number" name="bedroomCount" required min="1" value={formData.bedroomCount} onChange={handleChange} className={inputClass} />
              </MotionInput>
              <MotionInput label="Bathrooms">
                <input type="number" name="bathroomCount" required min="1" value={formData.bathroomCount} onChange={handleChange} className={inputClass} />
              </MotionInput>
            </div>
          </section>

          {/* Void Coordinates */}
          <section className={sectionClass}>
            <div className={headerClass}>
              <span>Property Location</span>
              <FaCheckCircle className={formData.city && formData.country ? 'text-primary-500' : 'text-white/10'} />
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <MotionInput label="City">
                  <input type="text" name="city" required value={formData.city} onChange={handleChange} className={inputClass} />
                </MotionInput>
                <MotionInput label="Country">
                  <input type="text" name="country" required value={formData.country} onChange={handleChange} className={inputClass} />
                </MotionInput>
              </div>
              <MotionInput label="Street Address">
                <input type="text" name="address" required value={formData.address} onChange={handleChange} className={inputClass} />
              </MotionInput>
            </div>
          </section>

          {/* Visual Data */}
          <section className={sectionClass}>
            <div className={headerClass}>
              <span>Property Images</span>
              <FaCloudUploadAlt className={images.length > 0 ? 'text-primary-500' : 'text-white/10'} />
            </div>
            <div className="space-y-6">
              <MotionInput label="Amenities (comma separated)">
                <input type="text" name="amenities" required value={formData.amenities} onChange={handleChange} className={inputClass} placeholder="Wifi, Pool, Kitchen, etc." />
              </MotionInput>

              <div className="relative group/upload">
                <div className="absolute inset-0 bg-primary-500/5 rounded-3xl border-2 border-dashed border-white/10 group-hover/upload:border-primary-500/50 transition-colors" />
                <div className="relative p-12 text-center pointer-events-none">
                  <FaCloudUploadAlt size={48} className="mx-auto mb-4 text-gray-500 group-hover/upload:text-primary-500 transition-colors" />
                  <p className="font-bold text-gray-400">Drag and drop images or click to browse</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  required
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
              </div>

              <AnimatePresence>
                {images.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-wrap gap-4 pt-4"
                  >
                    {Array.from(images).map((_, i) => (
                      <div key={i} className="w-16 h-16 bg-primary-500/20 rounded-xl border border-primary-500/30 flex items-center justify-center text-primary-500 font-bold text-xs">IMG {i + 1}</div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-black py-6 rounded-[32px] transition-all text-xl shadow-neon disabled:opacity-50 uppercase tracking-tighter"
          >
            {loading ? 'Submitting...' : 'List your Property'}
          </motion.button>

        </form>
      </div>
    </div>
  );
};

export default AddProperty;