import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaHome, FaStar, FaRupeeSign, FaCalendarAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

const HostDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalEarnings: 0, totalBookings: 0, activeListings: 0 });

  useEffect(() => {
    const fetchHostData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [propsResult, bookingsResult] = await Promise.allSettled([
          axios.get('/api/properties', config),
          axios.get('/api/bookings/host-bookings', config)
        ]);

        const propertiesData = propsResult.status === 'fulfilled' ? propsResult.value.data : [];
        const bookingsData = bookingsResult.status === 'fulfilled' ? bookingsResult.value.data : [];

        const myProperties = propertiesData.filter(p => p.hostId?._id === user._id || p.hostId === user._id);
        setProperties(myProperties);
        setBookings(bookingsData);

        setStats({
          activeListings: myProperties.length,
          totalBookings: bookingsData.length,
          totalEarnings: bookingsData.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)
        });

      } catch (error) {
        console.error('Error fetching host data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchHostData();
  }, [user]);

  if (!user) return <div className="p-12 text-center text-xl font-bold dark:text-white">Please sign in.</div>;
  if (loading) return <div className="text-center py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 dark:border-white"></div></div>;

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1280px] min-h-screen text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="flex justify-between items-center mb-10">
         <h1 className="text-[32px] font-semibold text-gray-900 dark:text-white">Host Dashboard</h1>
         <Link to="/add-property" className="bg-[#E51D53] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#D51243] transition">Create new listing</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-4 bg-white dark:bg-gray-900 shadow-sm transition-colors">
          <div className="p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-full"><FaRupeeSign size={24} /></div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Earnings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white pr-4">₹{stats.totalEarnings.toLocaleString()}</p>
          </div>
        </div>
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-4 bg-white dark:bg-gray-900 shadow-sm transition-colors">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full"><FaCalendarAlt size={24} /></div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Bookings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
          </div>
        </div>
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center gap-4 bg-white dark:bg-gray-900 shadow-sm transition-colors">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-500 rounded-full"><FaHome size={24} /></div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Listings</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeListings}</p>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="mb-12">
         <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Your Listings</h2>
         {properties.length === 0 ? (
            <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-xl text-center bg-gray-50 dark:bg-gray-800/50">
               <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any active listings.</p>
               <Link to="/add-property" className="text-rose-500 font-semibold underline">Add a property</Link>
            </div>
         ) : (
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 uppercase text-xs">
                     <tr>
                        <th className="px-6 py-4">Listing</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Price / Night</th>
                        <th className="px-6 py-4">Rating</th>
                        <th className="px-6 py-4">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                    {properties.map(p => (
                       <tr key={p._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-4">
                             <img src={p.images[0]?.url} alt={p.title} className="w-12 h-12 rounded object-cover bg-gray-200 dark:bg-gray-800" />
                             <span className="font-semibold text-gray-900 dark:text-white">{p.title}</span>
                          </td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 rounded-lg text-xs font-semibold">Live</span></td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">₹{p.pricePerNight.toLocaleString()}</td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1 font-medium"><FaStar className="text-gray-900 dark:text-white" size={12}/> {p.ratingsAverage || 'New'}</div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                                <button className="hover:text-black dark:hover:text-white transition" title="Edit"><FaEdit size={16}/></button>
                                <button className="hover:text-rose-600 transition" title="Delete"><FaTrash size={16}/></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>

      {/* Bookings */}
      <div>
         <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Guest Reservations</h2>
         {bookings.length === 0 ? (
            <div className="p-8 border border-gray-200 dark:border-gray-800 rounded-xl text-center bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
               No bookings yet.
            </div>
         ) : (
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
               <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 uppercase text-xs">
                     <tr>
                        <th className="px-6 py-4">Guest</th>
                        <th className="px-6 py-4">Property</th>
                        <th className="px-6 py-4">Dates</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Payout</th>
                     </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                       <tr key={b._id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{b.userId?.name || 'Guest'}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{b.propertyId?.title}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                             {format(parseISO(b.checkInDate), 'MMM dd')} - {format(parseISO(b.checkOutDate), 'MMM dd, yy')}
                          </td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${b.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-400'}`}>
                                {b.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">₹{(b.totalPrice || 0).toLocaleString()}</td>
                       </tr>
                    ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
    </div>
  );
};

export default HostDashboard;
