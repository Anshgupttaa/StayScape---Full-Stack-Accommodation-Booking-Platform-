import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { FaStar, FaSwimmingPool, FaUmbrellaBeach, FaHome, FaLeaf, FaSearch, FaMapMarkerAlt, FaGlobeAmericas, FaCloud, FaUsers, FaFire, FaTree, FaWater, FaMountain, FaBuilding, FaBed, FaHotel } from 'react-icons/fa';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import PropertyCard from '../components/PropertyCard';

const categories = [
  { label: 'Trending', type: '', icon: <FaFire size={20} /> },
  { label: 'Villas', type: 'Villa', icon: <FaHome size={20} /> },
  { label: 'Rooms', type: 'Room', icon: <FaBed size={20} /> },
  { label: 'PGs', type: 'PG', icon: <FaUsers size={20} /> },
  { label: 'Hotels', type: 'Hotel', icon: <FaHotel size={20} /> }
];

const Home = () => {
  const { user, wishlist, toggleWishlistContext } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Trending');

  const location = useLocation();
  const [searchCity, setSearchCity] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSearchSegment, setActiveSearchSegment] = useState(null);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cityParam = params.get('city');
    setSearchCity(cityParam || '');
  }, [location.search]);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const currentCategory = categories.find(c => c.label === activeCategory);
      let queryObj = {};
      if (currentCategory?.type) queryObj.type = currentCategory.type;
      if (searchCity) queryObj.city = searchCity;

      const queryString = new URLSearchParams(queryObj).toString();
      const { data } = await axios.get(queryString ? `/api/properties?${queryString}` : '/api/properties');
      setProperties(data);
    } catch (error) {
      console.error('Error fetching generic properties', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchCity]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  return (
    <div className="w-full min-h-screen pb-20 bg-white dark:bg-background transition-colors duration-500 overflow-x-hidden">

      {/* Anti-Gravity Hero Section - Pull up to fill space behind glass navbar */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center perspective-1200 overflow-hidden -mt-24 pt-24">
        {/* Cinematic Background Image */}
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src="https://i.pinimg.com/1200x/86/d7/b9/86d7b98afc06de19f549c43cdc737a80.jpg"
            alt="StayScape Ultra Luxury"
            className="w-full h-full object-cover"
            style={{ imageRendering: 'auto' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-background" />
        </motion.div>

        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center px-6 max-w-4xl"
        >
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-gray-900 dark:text-white"
          >
            Find your <span className="text-primary-500 text-glow">Perfect</span> retreat.
          </motion.h1>

          {/* Modern Segmented Search Bar */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{
              y: isSearchFocused ? -10 : 0,
              opacity: 1,
              scale: isSearchFocused ? 1.02 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`mx-auto max-w-4xl glass-dark rounded-full flex flex-col md:flex-row items-center shadow-premium border-iridescent transition-all duration-500 hover:shadow-neon/20 ${isSearchFocused ? 'shadow-neon ring-1 ring-primary-500/30' : ''}`}
            onMouseEnter={() => setIsSearchFocused(true)}
            onMouseLeave={() => { setIsSearchFocused(false); setActiveSearchSegment(null); }}
          >
            {/* Location Segment */}
            <div
              className={`flex-1 flex flex-col items-start px-8 py-3 rounded-full md:rounded-r-none transition-all cursor-pointer hover:bg-white/5 ${activeSearchSegment === 'where' ? 'bg-white/10 shadow-inner' : ''}`}
              onClick={() => setActiveSearchSegment('where')}
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-0.5">Where</label>
              <div className="flex items-center w-full">
                <FaMapMarkerAlt className="text-gray-500 mr-2 shrink-0" size={14} />
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="w-full bg-transparent outline-none text-white placeholder-gray-500 font-bold text-sm"
                />
              </div>
            </div>

            <div className="hidden md:block w-px h-8 bg-white/10" />

            {/* Check-in Segment */}
            <div
              className={`flex-1 flex flex-col items-start px-8 py-3 transition-all cursor-pointer hover:bg-white/5 ${activeSearchSegment === 'checkin' ? 'bg-white/10 shadow-inner' : ''}`}
              onClick={() => setActiveSearchSegment('checkin')}
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Check in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent outline-none text-white text-sm font-bold w-full cursor-pointer [color-scheme:dark]"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-white/10" />

            {/* Check-out Segment */}
            <div
              className={`flex-1 flex flex-col items-start px-8 py-3 transition-all cursor-pointer hover:bg-white/5 ${activeSearchSegment === 'checkout' ? 'bg-white/10 shadow-inner' : ''}`}
              onClick={() => setActiveSearchSegment('checkout')}
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Check out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent outline-none text-white text-sm font-bold w-full cursor-pointer [color-scheme:dark]"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-white/10" />

            {/* Guests Segment */}
            <div
              className={`flex-1 flex flex-col items-start px-8 py-3 transition-all cursor-pointer hover:bg-white/5 ${activeSearchSegment === 'who' ? 'bg-white/10 shadow-inner' : ''}`}
              onClick={() => setActiveSearchSegment('who')}
            >
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Who</label>
              <div className="flex items-center w-full gap-2">
                <FaUsers className="text-gray-500 shrink-0" size={14} />
                <input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  className="bg-transparent outline-none text-white text-sm font-bold w-full"
                  placeholder="Add guests"
                />
              </div>
            </div>

            {/* Search Button */}
            <div className="p-2 pr-4">
              <button
                onClick={fetchProperties}
                className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center hover:shadow-neon"
              >
                <FaSearch size={18} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <div className="container mx-auto px-6 max-w-[1440px] -mt-20 relative z-20">
        {/* Infinite Void Categories */}
        <div className="relative mb-16">
          <div className="flex items-center gap-12 overflow-x-auto pb-6 hide-scrollbar justify-center">
            {categories.map((cat, index) => {
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={index}
                  onClick={() => setActiveCategory(cat.label)}
                  className={`relative flex flex-col items-center gap-3 cursor-pointer group outline-none`}
                >
                  <motion.span
                    animate={{
                      y: isActive ? -5 : 0,
                      scale: isActive ? 1.2 : 1,
                      color: isActive ? "#ff385c" : "#9ca3af"
                    }}
                    className="p-3 rounded-2xl bg-gray-50 dark:bg-white/5 transition-colors group-hover:bg-gray-100 dark:group-hover:bg-white/10"
                  >
                    {cat.icon}
                  </motion.span>
                  <span className={`text-xs font-bold whitespace-nowrap transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                    {cat.label}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="category-orb"
                      className="absolute -bottom-2 w-1.5 h-1.5 bg-primary-500 rounded-full shadow-neon"
                      transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-40">
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 shadow-neon"
            />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-16"
          >
            {properties.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="font-black text-3xl mb-4 text-gray-900 dark:text-white">No properties found.</p>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Try adjusting your search or category filters.</p>
                <button onClick={() => { setSearchCity(''); setActiveCategory('Trending'); }} className="bg-primary-500 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-neon transition-all">Clear Filters</button>
              </div>
            ) : (
              properties.map(property => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  isWishlisted={wishlist?.includes(property._id)}
                  onToggleWishlist={toggleWishlistContext}
                  layoutId={`card-${property._id}`}
                />
              ))
            )}
          </motion.div>
        )}
      </div>

      {/* Mobile Floating Dock Orb */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed md:hidden bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        <button className="glass-dark p-4 rounded-full border-iridescent shadow-spatial flex items-center gap-3 text-white">
          <FaSearch size={20} className="text-primary-500" />
          <span className="font-bold text-sm tracking-wide">Search</span>
        </button>
      </motion.div>
    </div>
  );
};

export default Home;
