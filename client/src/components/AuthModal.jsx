import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const [tab, setTab] = useState(defaultTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, googleLogin } = useAuth();

  const reset = () => {
    setName(''); setEmail(''); setPassword(''); setError(''); setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      reset();
    }
  }, [isOpen, defaultTab]);

  const switchTab = (t) => { setTab(t); reset(); };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sign in');
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await register(name, email, password);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError(''); setLoading(true);
    try {
      await googleLogin(credentialResponse.credential);
      onClose();
    } catch (err) {
      setError('Google sign-in failed');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const inputClass = "w-full p-4 glass-dark rounded-[24px] focus:ring-4 focus:ring-primary-500/50 outline-none transition-all text-white placeholder-gray-500";

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="relative w-full max-w-[568px] glass-dark rounded-[40px] shadow-premium border-iridescent overflow-hidden z-[10000]"
          >
            <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between text-white">
              <button
                onClick={onClose}
                className="p-3 rounded-full hover:bg-white/10 transition-colors"
                title="Abort"
              >
                <FaTimes size={16} className="text-gray-400 hover:text-white" />
              </button>
              <h2 className="font-black text-[10px] uppercase tracking-widest text-primary-500 mx-auto translate-x-[-20px]">Welcome to StayScape</h2>
            </div>
            
            <div className="p-8">
              <h3 className="text-3xl font-black mb-8 text-white tracking-tighter text-glow">Sign In</h3>

              <div className="flex border-b border-white/10 mb-8 relative">
                {['login', 'signup'].map(t => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    className={`pb-4 px-6 font-black text-[10px] uppercase tracking-widest transition-all relative ${
                      tab === t
                        ? 'text-primary-500'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {t === 'login' ? 'Login' : 'Sign Up'}
                    {tab === t && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 shadow-neon" />}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-6 bg-rose-500/10 text-rose-500 p-4 rounded-[24px] text-xs font-bold uppercase tracking-widest border border-rose-500/20 flex items-center justify-center">
                  {error}
                </div>
              )}

              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                   <input
                      type="email" required
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Email"
                      className={inputClass}
                    />
                    <input
                      type="password" required
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      className={inputClass}
                    />
                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-primary-500 text-white py-5 rounded-[24px] font-black text-lg hover:bg-primary-600 transition-all disabled:opacity-50 shadow-neon uppercase tracking-widest mt-6"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
              )}

              {tab === 'signup' && (
                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                      type="text" required
                      value={name} onChange={e => setName(e.target.value)}
                      placeholder="Full Name"
                      className={inputClass}
                    />
                    <input
                      type="email" required
                      value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="Email"
                      className={inputClass}
                    />
                    <input
                      type="password" required minLength={6}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Password"
                      className={inputClass}
                    />
                  <button
                    type="submit" disabled={loading}
                    className="w-full bg-primary-500 text-white py-5 rounded-[24px] font-black text-lg hover:bg-primary-600 transition-all disabled:opacity-50 shadow-neon uppercase tracking-widest mt-6"
                  >
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </button>
                </form>
              )}

              <div className="flex items-center my-8">
                <div className="flex-1 border-t border-white/10" />
                <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">or continue with</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              <div className="flex justify-center glass-dark rounded-[24px] p-2 hover:shadow-neon transition-all border-white/10">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed')}
                  text="continue_with"
                  theme="filled_black"
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
