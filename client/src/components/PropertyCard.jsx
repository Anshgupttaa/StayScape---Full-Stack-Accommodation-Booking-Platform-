import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PropertyCard = ({ property, isWishlisted, onToggleWishlist, layoutId }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative group cursor-pointer w-full h-full perspective-1000"
    >
      <Link to={`/property/${property._id}`} className="block h-full no-underline">
        <motion.div 
          layoutId={layoutId}
          className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Glare effect */}
          <motion.div
            style={{
              translateX: useTransform(mouseXSpring, [-0.5, 0.5], ["-20%", "20%"]),
              translateY: useTransform(mouseYSpring, [-0.5, 0.5], ["-20%", "20%"]),
              opacity: useTransform(mouseXSpring, [-0.5, 0.5], [0, 0.2]),
            }}
            className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-br from-white via-transparent to-transparent opacity-0 group-hover:opacity-20 transition-opacity"
          />

          <motion.img 
            src={property.images[0]?.url || 'https://via.placeholder.com/400'} 
            alt={property.title} 
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            style={{ transform: "translateZ(0px)" }}
          />

          {/* Floating Badges (Parallax) */}
          <motion.div 
            style={{ transform: "translateZ(40px)" }}
            className="absolute top-4 left-4 z-20"
          >
            <div className="glass px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-black dark:text-white border-iridescent shadow-neon">
              {property.type}
            </div>
          </motion.div>

          <button 
            onClick={async (e) => {
              e.preventDefault();
              onToggleWishlist(property._id);
            }}
            className="absolute top-4 right-4 p-2 rounded-full z-30 glass hover:scale-110 transition-transform"
            style={{ transform: "translateZ(50px)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth={1.5} className={`w-6 h-6 transition-colors ${isWishlisted ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-white'}`}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
        </motion.div>
        
        <motion.div 
          style={{ transform: "translateZ(30px)" }}
          className="px-1"
        >
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-gray-900 dark:text-white truncate text-base group-hover:text-primary-500 transition-colors">
              {property.location.city}, {property.location.country}
            </h3>
            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white shrink-0">
              <FaStar className="text-primary-500 mb-0.5" />
              <span>{property.ratingsAverage || '5.0'}</span>
            </div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2 line-clamp-1">{property.title}</p>
          <div className="flex items-baseline gap-1">
             <span className="text-gray-900 dark:text-white font-black text-lg">₹{property.pricePerNight.toLocaleString()}</span>
             <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">night</span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default PropertyCard;
