import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const PaymentModal = ({ propertyId, checkInDate, checkOutDate, guests, totalPrice, onSuccess, propertyName, propertyCity }) => {
  const { user } = useAuth();
  const { triggerBookingSuccess } = useNotifications();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;

    setProcessing(true);
    setError(null);

    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const bookingData = { propertyId, checkInDate, checkOutDate, guests, totalPrice, paymentMethod: 'razorpay' };

      // 1. Create booking in our DB
      const { data: bookingRes } = await axios.post('/api/bookings', bookingData, config);
      const bookingId = bookingRes.booking._id;

      // 2. Obtain Razorpay Order ID from our server
      const { data: orderRes } = await axios.post(`/api/bookings/${bookingId}/razorpay-order`, {}, config);
      const order = orderRes.order;

      // 3. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'StayScape',
        description: `Booking for ${propertyName}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            // 4. Verify Payment Signature
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };
            
            await axios.post(`/api/bookings/${bookingId}/razorpay-verify`, verifyData, config);
            
            // 5. Fire Success Actions
            triggerBookingSuccess(propertyName, propertyCity);
            onSuccess();
          } catch (verificationError) {
            setError(verificationError.response?.data?.message || 'Payment Verification Failed');
            setProcessing(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#f43f5e',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Payment processing failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          You will be redirected to Razorpay to complete your secure payment.
        </p>
      </div>

      {error && <div className="text-red-500 text-sm font-medium animate-shake bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">{error}</div>}

      <button
        type="submit"
        disabled={processing}
        className="w-full py-4 rounded-xl font-extrabold text-white shadow-xl transition-all transform active:scale-[0.98] group relative overflow-hidden disabled:opacity-50 animate-shimmer cursor-pointer"
        style={{
          background: 'linear-gradient(to right, var(--primary-600), var(--primary-500), #f43f5e, var(--primary-500), var(--primary-600))',
          backgroundSize: '200% auto'
        }}
      >
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex justify-center items-center gap-3">
          {processing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Opening Secure Checkout...</span>
            </>
          ) : (
            <>
              <span>Pay ₹{totalPrice} with Razorpay</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </div>
      </button>
    </form>
  );
};
