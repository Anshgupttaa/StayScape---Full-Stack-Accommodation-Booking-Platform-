import { createContext, useContext, useState, useCallback } from 'react';

const defaultCtx = { bookingToast: null, notifVersion: 0, triggerBookingSuccess: () => {} };
const NotificationContext = createContext(defaultCtx);

export const useNotifications = () => useContext(NotificationContext) ?? defaultCtx;

export const NotificationProvider = ({ children }) => {
  // Global booking success toast
  const [bookingToast, setBookingToast] = useState(null); // { propertyName, city, type: 'success' | 'cancel' }
  // Counter bump to signal Navbar to refetch notifications
  const [notifVersion, setNotifVersion] = useState(0);

  const triggerBookingSuccess = useCallback((propertyName, city) => {
    setBookingToast({ propertyName, city, type: 'success' });
    setNotifVersion(v => v + 1); // tells Navbar to refetch
    setTimeout(() => setBookingToast(null), 4500);
  }, []);

  const triggerCancellation = useCallback((propertyName, city) => {
    setBookingToast({ propertyName, city, type: 'cancel' });
    setNotifVersion(v => v + 1); // tells Navbar to refetch
    setTimeout(() => setBookingToast(null), 4500);
  }, []);

  return (
    <NotificationContext.Provider value={{ bookingToast, notifVersion, triggerBookingSuccess, triggerCancellation }}>
      {children}
    </NotificationContext.Provider>
  );
};
