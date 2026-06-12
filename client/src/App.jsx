import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import HostDashboard from './pages/HostDashboard';
import AddProperty from './pages/AddProperty';
import PropertyDetails from './pages/PropertyDetails';
import Trips from './pages/Trips';
import Wishlist from './pages/Wishlist';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

// Global booking success toast shown at bottom of screen
const BookingToastBanner = () => {
  const { bookingToast } = useNotifications();
  return (
    <AnimatePresence>
      {bookingToast && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
            bookingToast.type === 'cancel'
              ? 'bg-red-50 dark:bg-red-900/90 text-red-900 dark:text-red-50 border-red-200 dark:border-red-800'
              : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-white/10'
          }`}
        >
          <span className="text-2xl">{bookingToast.type === 'cancel' ? '📉' : '🎉'}</span>
          <div>
            <p className="font-bold text-sm">
              {bookingToast.type === 'cancel' ? 'Booking Cancelled' : 'Booking Confirmed!'}
            </p>
            <p className="text-xs opacity-80 mt-0.5">
              {bookingToast.propertyName
                ? `${bookingToast.propertyName}${bookingToast.city ? ` · ${bookingToast.city}` : ''}`
                : bookingToast.type === 'cancel' 
                  ? 'Your trip has been cancelled. Refund initiated.'
                  : 'Your trip is all set. Check the bell for details.'}
            </p>
          </div>
          <span className={`ml-2 text-xl ${bookingToast.type === 'cancel' ? 'text-red-500' : 'text-green-400'}`}>
            {bookingToast.type === 'cancel' ? '✕' : '✓'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col font-sans">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/dashboard" element={<HostDashboard />} />
                  <Route path="/add-property" element={<AddProperty />} />
                  <Route path="/property/:id" element={<PropertyDetails />} />
                  <Route path="/trips" element={<Trips />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                </Routes>
              </main>
              <Footer />
              <Chatbot />
              <BookingToastBanner />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
