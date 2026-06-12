import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format, isPast, isFuture, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Trips = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/bookings/my-trips', config);
        setBookings(data);
      } catch (error) {
        console.error('Error fetching trips', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTrips();
  }, [user]);

  const confirmCancel = async (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this trip?")) {
        try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.patch(`/api/bookings/${bookingId}/cancel`, {}, config);
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b));
        } catch (error) {
        console.error('Error cancelling booking', error);
        alert('Failed to cancel the trip.');
        }
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[70vh] text-center bg-white dark:bg-background transition-colors">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass dark:glass-dark p-12 rounded-[48px] border-iridescent shadow-premium max-w-xl"
        >
          <h2 className="text-4xl font-black mb-6 tracking-tighter text-gray-900 dark:text-white uppercase">Access Your Trips</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg leading-relaxed">Sign in to view your upcoming adventures and past memories on StayScape.</p>
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
          Your <span className="text-primary-500 text-glow">Trips</span>
        </motion.h1>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : bookings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-24 border-t border-gray-200 dark:border-white/5"
          >
             <h2 className="text-3xl font-black mb-6 tracking-tighter text-gray-900 dark:text-white">No trips booked... yet!</h2>
             <p className="text-gray-600 dark:text-gray-400 mb-10 text-lg max-w-lg">Time to dust off your bags and start planning your next luxury adventure.</p>
             <Link to="/" className="bg-primary-500 text-white px-10 py-4 rounded-2xl font-bold shadow-neon hover:shadow-neon-strong transition-all inline-block uppercase tracking-widest text-xs">Start searching</Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
            {bookings.map((booking, idx) => {
              const checkInDate = parseISO(booking.checkInDate);
              const checkOutDate = parseISO(booking.checkOutDate);
              const isUpcoming = isFuture(checkInDate) && booking.bookingStatus !== 'cancelled';
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={booking._id} 
                  className="glass dark:glass-dark rounded-[40px] p-6 md:p-8 flex flex-col h-full shadow-premium border-iridescent group hover:shadow-neon/10 transition-all duration-500"
                >
                  <div className="flex gap-6 mb-6 items-start">
                    <div className="relative w-28 h-28 shrink-0 overflow-hidden rounded-[24px] shadow-lg border border-white/10">
                      <img 
                        src={booking.propertyId?.images?.[0]?.url || 'https://via.placeholder.com/150'} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="Property" 
                      />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary-500 mb-1">{booking.propertyId?.location?.city}</p>
                        <h3 className="font-extrabold text-xl text-gray-900 dark:text-white truncate tracking-tight">{booking.propertyId?.title || 'Luxury Stay'}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wide mt-1">Hosted by {booking.propertyId?.hostId?.name}</p>
                        <p className="text-sm font-black text-gray-900 dark:text-white mt-3 bg-white/5 py-1.5 px-3 rounded-xl border border-white/5 inline-block">
                           {format(checkInDate, 'MMM dd')} — {format(checkOutDate, 'MMM dd, yyyy')}
                        </p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                      <div>
                          {booking.bookingStatus === 'cancelled' ? (
                              <span className="bg-red-500/10 text-red-500 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-red-500/20">Cancelled</span>
                          ) : isUpcoming ? (
                              <span className="bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-green-500/20 shadow-neon/20">Upcoming</span>
                          ) : (
                              <span className="bg-white/5 text-gray-400 px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border border-white/10">Past trip</span>
                          )}
                      </div>
                      {isUpcoming && (
                        <motion.button 
                          whileHover={{ scale: 1.05, x: 5 }}
                          onClick={() => confirmCancel(booking._id)} 
                          className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Cancel
                        </motion.button>
                      )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Trips;
