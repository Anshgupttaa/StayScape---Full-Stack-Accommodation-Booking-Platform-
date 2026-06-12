import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Wishlist = () => {
  const { user, wishlist, toggleWishlistContext } = useAuth();
  const [wishlistProps, setWishlistProps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProperties = async () => {
      if (!user || !wishlist || wishlist.length === 0) {
        setWishlistProps([]);
        setLoading(false);
        return;
      }
      try {
        const queryParams = new URLSearchParams();
        wishlist.forEach(id => queryParams.append('ids', id));
        const { data } = await axios.get(`/api/properties/batch?${queryParams.toString()}`);
        setWishlistProps(data);
      } catch (error) {
        console.error('Error fetching wishlist properties', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlistProperties();
  }, [user, wishlist]);

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[70vh] text-center bg-white dark:bg-background transition-colors">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass dark:glass-dark p-12 rounded-[48px] border-iridescent shadow-premium max-w-xl"
        >
          <h2 className="text-4xl font-black mb-6 tracking-tighter text-gray-900 dark:text-white">Log in to view your wishlist</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg leading-relaxed">You can create, view, or edit wishlists once you've logged in.</p>
          <Link to="/login" className="bg-primary-500 text-white px-10 py-4 rounded-2xl font-bold shadow-neon hover:shadow-neon-strong transition-all inline-block uppercase tracking-widest text-xs">Sign In</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-24 bg-white dark:bg-background transition-colors duration-500 overflow-x-hidden">
      <div className="container mx-auto px-6 pt-32 max-w-[1440px]">
        <motion.h1 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-5xl md:text-7xl font-black mb-16 tracking-tighter text-gray-900 dark:text-white"
        >
          Your <span className="text-primary-500 text-glow">Wishlist</span>
        </motion.h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : wishlistProps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 border-t border-gray-200 dark:border-white/5"
          >
             <h2 className="text-3xl font-black mb-6 tracking-tighter text-gray-900 dark:text-white">Create your first wishlist</h2>
             <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg max-w-lg">As you search, tap the heart icon to save your favorite places to a wishlist.</p>
             <Link to="/" className="bg-primary-500 text-white px-10 py-4 rounded-2xl font-bold shadow-neon hover:shadow-neon-strong transition-all inline-block uppercase tracking-widest text-xs">Start exploring</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-16">
            {wishlistProps.map((property, idx) => (
               <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={property._id} 
                className="group cursor-pointer flex flex-col h-full relative"
               >
                 <Link to={`/property/${property._id}`} className="block h-full relative">
                   <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-gray-200 dark:bg-gray-800 mb-6 shadow-premium group-hover:shadow-neon/20 transition-all duration-500">
                     <img 
                       src={property.images[0]?.url || 'https://via.placeholder.com/400'} 
                       alt={property.title} 
                       className="object-cover w-full h-full transform transition-transform duration-700 group-hover:scale-110"
                     />
                     <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                   </div>
                   
                   <div className="flex flex-col flex-grow px-2">
                     <div className="flex justify-between items-start gap-2 mb-2">
                       <h3 className="font-extrabold text-gray-900 dark:text-white truncate text-xl tracking-tight">{property.location.city}, {property.location.country}</h3>
                       <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 dark:text-white shrink-0">
                         <FaStar className="text-primary-500" />
                         <span>{property.ratingsAverage || '5.0'}</span>
                       </div>
                     </div>
                     <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-widest mb-2">{property.type}</p>
                     <div className="mt-auto pt-2">
                        <p className="text-gray-900 dark:text-white font-black text-xl">₹{property.pricePerNight.toLocaleString()} <span className="font-medium text-xs uppercase tracking-widest opacity-60 ml-1">night</span></p>
                     </div>
                   </div>
                 </Link>
                 <motion.button 
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={async (e) => {
                      e.preventDefault();
                      await toggleWishlistContext(property._id);
                    }}
                    className="absolute top-5 right-5 p-3 rounded-full z-10 glass-dark border-white/10 shadow-premium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} className="w-6 h-6 fill-primary-500 stroke-primary-500 shadow-neon">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                    </svg>
                  </motion.button>
               </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
