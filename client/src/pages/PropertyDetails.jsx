import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaMapMarkerAlt, FaWifi, FaTimes, FaHeart, FaShare, FaChevronLeft, FaUserFriends } from 'react-icons/fa';
import { differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { PaymentModal } from '../components/PaymentModal';
import AuthModal from '../components/AuthModal';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, wishlist, toggleWishlistContext } = useAuth();
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}`);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center py-40 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  );

  if (!property) return <div className="text-center mt-40 font-bold text-gray-500 text-xl min-h-screen">Listing not found.</div>;

  let days = 1;
  if (checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    if (d2 > d1) days = differenceInDays(d2, d1);
  }
  const totalPrice = property.pricePerNight * days;

  const isWishlisted = wishlist?.includes(property._id) || false;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full min-h-screen bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground pt-8 pb-32 transition-colors duration-500"
      >
        <div className="container mx-auto px-6 max-w-[1120px]">

          {/* Header */}
          <div className="mb-8">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-black mb-4 tracking-tighter text-glow text-gray-900 dark:text-white"
            >
              {property.title}
            </motion.h1>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-primary-500">
                <span className="flex items-center gap-1.5"><FaStar size={14} className="mb-0.5" /> {property.ratingsAverage || '5.0'} · <span className="underline decoration-primary-500/30 font-medium">{property.ratingsQuantity} reviews</span></span>
                <span className="flex items-center gap-1.5 underline decoration-primary-500/30">{property.location.city}, {property.location.country}</span>
              </div>
              <div className="flex gap-4">
                <motion.button whileHover={{ scale: 1.05 }} onClick={handleShare} className="flex items-center gap-2 glass dark:glass-dark px-4 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest border-gray-200 dark:border-white/5">
                  <FaShare size={14} /> Share
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={async (e) => {
                    if (!user) return setShowAuthModal(true);
                    await toggleWishlistContext(property._id);
                  }}
                  className="flex items-center gap-2 glass dark:glass-dark px-4 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest border-gray-200 dark:border-white/5"
                >
                  <FaHeart className={isWishlisted ? 'text-rose-500 drop-shadow-neon' : 'text-gray-500'} size={14} /> {isWishlisted ? 'Saved' : 'Save'}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Gallery - Shared Element Base */}
          <motion.div
            layoutId={`card-${id}`}
            className="relative rounded-[40px] overflow-hidden mb-16 flex h-[60vh] min-h-[500px] shadow-premium border-iridescent group bg-gray-200 dark:bg-gray-800"
          >
            <div className="w-1/2 pr-1.5 cursor-pointer overflow-hidden" onClick={() => setShowGallery(true)}>
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={property.images[0]?.url}
                alt="Main"
                className="w-full h-full object-cover transition-transform duration-700"
              />
            </div>
            <div className="w-1/2 grid grid-cols-2 gap-1.5 pl-1.5">
              {property.images.slice(1, 5).map((img, i) => (
                <div key={i} className="cursor-pointer overflow-hidden" onClick={() => setShowGallery(true)}>
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={img.url}
                    alt={`View ${i}`}
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                </div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.1, y: -5 }}
              onClick={() => setShowGallery(true)}
              className="absolute bottom-10 right-10 glass dark:glass-dark text-gray-900 dark:text-white border-gray-200 dark:border-white/10 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-premium flex items-center gap-3 backdrop-blur-2xl hover:border-primary-500/50 transition-all"
            >
              Show all photos
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
            <div className="lg:col-span-2">

              <div className="pb-12 border-b border-gray-200 dark:border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                      High-End {property.type}
                      <span className="text-xs font-medium px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full border border-primary-500/20">Verified Property</span>
                    </h2>
                    <div className="flex flex-wrap text-sm font-bold uppercase tracking-widest text-gray-500 mt-3 gap-4">
                      <span>{property.maxGuests} Guests</span>
                      <span className="w-1 h-1 bg-gray-300 dark:bg-white/10 rounded-full my-auto" />
                      <span>{property.bedroomCount} Bedrooms</span>
                      <span className="w-1 h-1 bg-gray-300 dark:bg-white/10 rounded-full my-auto" />
                      <span>{property.bathroomCount} Bathrooms</span>
                    </div>
                  </div>
                  {property.hostId?.avatar ? (
                    <motion.img
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      src={property.hostId.avatar}
                      alt="Host"
                      className="w-20 h-20 rounded-[24px] object-cover border-iridescent shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-[24px] glass dark:glass-dark border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600"><FaUserFriends size={32} /></div>
                  )}
                </div>
              </div>

              <div className="py-12 border-b border-gray-200 dark:border-white/5">
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg font-medium">
                  {property.description}
                </p>
              </div>

              <div className="py-12">
                <h3 className="text-2xl font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tighter">What this place offers</h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  {property.amenities?.map((amenity, i) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      key={i}
                      className="flex items-center gap-4 text-gray-500 dark:text-gray-400 group"
                    >
                      <div className="p-3 glass dark:glass-dark rounded-xl text-primary-500 group-hover:shadow-neon transition-all border-gray-200 dark:border-transparent">
                        <FaWifi size={20} />
                      </div>
                      <span className="text-base font-bold tracking-tight text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{amenity}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>

            {/* Booking Card - Spatial Glass */}
            <div className="lg:col-span-1">
              <motion.div
                style={{ transformStyle: "preserve-3d" }}
                whileHover={{ rotateY: -5, rotateX: 5 }}
                className="sticky top-28 glass dark:glass-dark border-iridescent rounded-[40px] p-8 shadow-premium perspective-1000"
              >
                <div className="flex justify-between items-baseline mb-8">
                  <span className="text-3xl font-black text-gray-900 dark:text-white">₹{property.pricePerNight.toLocaleString()} <span className="text-xs font-medium uppercase tracking-widest text-gray-500 ml-1">/ night</span></span>
                  <div className="flex items-center gap-1.5 text-sm font-bold text-primary-500">
                    <FaStar size={14} className="mb-0.5" /> {property.ratingsAverage || '5.0'}
                  </div>
                </div>

                <div className="glass dark:glass-dark border-gray-200 dark:border-white/5 rounded-3xl mb-8 overflow-hidden">
                  <div className="flex flex-col border-b border-gray-200 dark:border-white/5">
                    <div className="p-4 border-b border-gray-200 dark:border-white/5">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1">Check-in</label>
                      <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-transparent outline-none text-gray-900 dark:text-white text-sm font-bold mt-1 dark:[color-scheme:dark] [color-scheme:light]" />
                    </div>
                    <div className="p-4">
                      <label className="block text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1">Check-out</label>
                      <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-transparent outline-none text-gray-900 dark:text-white text-sm font-bold mt-1 dark:[color-scheme:dark] [color-scheme:light]" />
                    </div>
                  </div>
                  <div className="p-4">
                    <label className="block text-[9px] font-black uppercase tracking-widest text-primary-500 mb-1">Guests</label>
                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent outline-none text-gray-900 dark:text-white text-sm font-bold mt-1 cursor-pointer">
                      {Array.from({ length: property.maxGuests }).map((_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-white text-gray-900 dark:bg-background dark:text-white">{i + 1} guest{i > 0 && 's'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!user) return setShowAuthModal(true);
                    if (!checkIn || !checkOut) return alert('Please select timeline');
                    setShowCheckout(true);
                  }}
                  className="w-full bg-primary-500 text-white py-4.5 rounded-2xl font-black text-sm uppercase tracking-widest mb-6 shadow-neon transition-all"
                >
                  Reserve now
                </motion.button>

                <div className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-8 opacity-50">You won't be charged yet</div>

                <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-white/5">
                  <div className="flex justify-between text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-tight">
                    <span>₹{property.pricePerNight.toLocaleString()} x {days} nights</span>
                    <span className="text-gray-900 dark:text-white">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 dark:text-white font-black text-lg pt-4 border-t border-gray-200 dark:border-white/10 uppercase tracking-tighter">
                    <span>Total</span>
                    <span className="text-primary-500 text-glow">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Spatial Gallery */}
        <AnimatePresence>
          {showGallery && (
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="fixed inset-0 z-[1000] bg-background/95 backdrop-blur-3xl overflow-y-auto hide-scrollbar"
            >
              <div className="max-w-4xl mx-auto px-6 py-20 relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: -90 }}
                  onClick={() => setShowGallery(false)}
                  className="fixed top-12 left-12 glass-dark p-4 rounded-full text-white z-[1100] border-white/10"
                >
                  <FaChevronLeft size={20} />
                </motion.button>
                <div className="space-y-12">
                  {property.images.map((img, i) => (
                    <motion.img
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      key={i}
                      src={img.url}
                      className="w-full rounded-[48px] shadow-premium border-iridescent"
                      alt={`View ${i}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCheckout && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 50 }}
                className="glass-dark border-iridescent rounded-[48px] w-full max-w-xl p-10 relative shadow-premium text-white overflow-hidden"
              >
                <button onClick={() => setShowCheckout(false)} className="absolute top-8 right-8 p-3 rounded-full hover:bg-white/10 text-gray-500 transition-colors"><FaTimes size={20} /></button>
                <h2 className="text-3xl font-black mb-8 tracking-tighter text-glow uppercase">Confirm Booking</h2>
                <PaymentModal
                  propertyId={property._id}
                  checkInDate={checkIn}
                  checkOutDate={checkOut}
                  guests={guests}
                  totalPrice={totalPrice}
                  propertyName={property.title}
                  propertyCity={property.location?.city}
                  onSuccess={() => { setShowCheckout(false); navigate('/trips'); }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
      </motion.div>
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 glass-dark border-primary-500/30 text-white px-8 py-4 rounded-full shadow-neon z-[1000] text-xs font-black uppercase tracking-widest flex items-center gap-3">
            <FaShare className="text-primary-500" /> Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PropertyDetails;
