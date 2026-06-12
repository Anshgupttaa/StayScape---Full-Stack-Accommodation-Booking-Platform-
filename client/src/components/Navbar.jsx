import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBell, FaSearch, FaMoon, FaSun } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';
import AuthModal from './AuthModal';

const READ_KEY = 'stayscape_notifs_read_at';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifVersion } = useNotifications();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [readAt, setReadAt] = useState(() => {
    const stored = localStorage.getItem(READ_KEY);
    return stored ? new Date(stored) : null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [searchQuery, setSearchQuery] = useState('');
  
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?city=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!user?.token) return;
    setNotifsLoading(true);
    try {
      const { data } = await axios.get('/api/bookings/notifications', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setNotifsLoading(false);
    }
  }, [user?.token]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications, notifVersion]);

  useEffect(() => {
    if (notificationsOpen) fetchNotifications();
  }, [notificationsOpen, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setNotifications([]);
    navigate('/');
  };

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setDropdownOpen(false);
  };

  const unreadCount = notifications.filter(n => !readAt || new Date(n.createdAt) > readAt).length;
  const hasUnread = !!user && unreadCount > 0;

  return (
    <>
      <div className="sticky top-4 z-[100] px-4 md:px-8 w-full flex justify-center pointer-events-none">
        <nav className="glass w-full max-w-[1400px] rounded-[32px] transition-all duration-500 shadow-premium pointer-events-auto">
          <div className="px-6 md:px-8 h-20 flex items-center justify-between">

          {/* Logo - Premium Typography */}
          <Link to="/" className="flex items-center gap-2 group">
             <motion.span 
               whileHover={{ scale: 1.1, rotate: [-5, 5, 0] }}
               className="text-primary-500 font-black text-3xl tracking-tighter drop-shadow-neon transition-all"
             >
               StayScape
             </motion.span>
          </Link>

          {/* Spatial Search - Floating in the Void */}
          <div className="hidden md:flex flex-1 max-w-md mx-12">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center glass-dark rounded-full px-6 py-3 shadow-xl hover:shadow-neon transition-all duration-300 border-iridescent group focus-within:ring-2 ring-primary-500/30"
            >
              <input
                type="text"
                placeholder="Search for your next stay"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm text-white placeholder-gray-500 bg-transparent font-medium"
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="submit" 
                className="bg-primary-500 text-white p-2.5 rounded-full shadow-lg"
              >
                 <FaSearch size={16} />
              </motion.button>
            </form>
          </div>

          {/* Actions - Grouped with Spatial Gap */}
          <div className="flex items-center gap-6 relative text-gray-700 dark:text-gray-300">
            
            <Link to="/add-property" className="hidden lg:block">
              <motion.span 
                whileHover={{ y: -2, x: 1 }}
                className="text-sm font-bold tracking-widest uppercase hover:text-primary-500 px-4 py-2 transition-colors cursor-pointer"
              >
                Host your home
              </motion.span>
            </Link>
            
            <div className="relative" ref={notifRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-3 glass-dark rounded-full relative transition-all shadow-lg text-gray-400 hover:text-white"
              >
                <FaBell size={20} />
                {hasUnread && (
                  <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-primary-500 rounded-full border-2 border-background animate-pulse shadow-neon" />
                )}
              </motion.button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute right-0 top-16 w-96 glass-dark rounded-3xl shadow-premium border-iridescent z-50 overflow-hidden perspective-1000"
                  >
                    <div className="px-6 py-4 border-b border-white/10 font-black text-xs uppercase tracking-widest text-primary-500">Notifications</div>
                    <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
                      {!user ? (
                        <div className="p-8 text-center text-sm text-gray-500">Please log in to view notifications</div>
                      ) : notifications.length === 0 ? (
                         <div className="p-8 text-center text-sm text-gray-500">No new notifications</div>
                      ) : (
                        notifications.map(n => (
                          <Link to="/trips" key={n.id} onClick={() => setNotificationsOpen(false)} className="block p-6 hover:bg-white/5 border-b border-white/5 text-sm transition-all group">
                            <p className="font-bold text-white mb-1 group-hover:text-primary-500 transition-colors uppercase tracking-tight">{n.title}</p>
                            <p className="text-gray-400 font-medium">{n.message}</p>
                          </Link>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Orb */}
            <div className="relative" ref={dropdownRef}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 p-1.5 glass-dark rounded-full cursor-pointer hover:shadow-neon transition-all duration-500 border-iridescent"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="flex flex-col space-y-1 ml-3 opacity-50 group-hover:opacity-100">
                   <span className="w-4 h-0.5 bg-white rounded-full"></span>
                   <span className="w-3 h-0.5 bg-white rounded-full"></span>
                </div>
                {user?.avatar ? (
                  <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 border border-primary-500/30">
                    <FaUserCircle size={24} />
                  </div>
                )}
              </motion.div>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9, rotateX: 10 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="absolute right-0 top-16 w-64 glass-dark rounded-3xl shadow-premium border-iridescent py-4 z-50 overflow-hidden"
                  >
                    {user ? (
                      <>
                        <div className="px-6 py-4 border-b border-white/10 mb-2">
                          <p className="font-black text-[10px] uppercase tracking-widest text-primary-500 mb-1">Logged In</p>
                          <p className="font-bold text-white truncate">{user.name}</p>
                        </div>
                        <div className="px-2 space-y-1">
                          <Link to="/trips" className="block px-4 py-3 hover:bg-primary-500 hover:text-white rounded-xl text-sm font-bold transition-all text-gray-300" onClick={() => setDropdownOpen(false)}>Trips</Link>
                          <Link to="/wishlist" className="block px-4 py-3 hover:bg-primary-500 hover:text-white rounded-xl text-sm font-bold transition-all text-gray-300" onClick={() => setDropdownOpen(false)}>Wishlist</Link>
                          <Link to="/dashboard" className="block px-4 py-3 hover:bg-primary-500 hover:text-white rounded-xl text-sm font-bold transition-all text-gray-300" onClick={() => setDropdownOpen(false)}>Host Dashboard</Link>
                        </div>
                        <div className="h-px bg-white/10 my-3 mx-4"></div>
                        <div className="px-2">
                          <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-rose-500/20 text-rose-500 rounded-xl text-sm font-black uppercase tracking-tight transition-all">Logout</button>
                        </div>
                      </>
                    ) : (
                      <div className="px-2 space-y-1">
                         <button onClick={() => openAuth('login')} className="w-full text-left px-6 py-4 hover:bg-primary-500 hover:text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all text-white">Login</button>
                         <button onClick={() => openAuth('signup')} className="w-full text-left px-6 py-4 hover:bg-white/10 rounded-2xl text-sm font-bold transition-all text-gray-400">Sign Up</button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Navbar;
