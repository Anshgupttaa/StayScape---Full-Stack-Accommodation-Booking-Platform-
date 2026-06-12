import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center pt-8 pb-20 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="glass w-full max-w-md p-8 md:p-12 rounded-[40px] shadow-premium border-iridescent relative z-10 transition-all">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to StayScape</h2>
        </div>

        {error && (
          <div className="glass bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-sm mb-6 border border-rose-500/20 text-center font-bold tracking-tight">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
             <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 glass rounded-[24px] focus:ring-4 focus:ring-primary-500/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="Email" />
          </div>
          <div className="relative group">
             <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full p-4 glass rounded-[24px] focus:ring-4 focus:ring-primary-500/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="Password" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary-500 text-white py-5 rounded-[24px] font-black text-lg hover:bg-primary-600 transition-all disabled:opacity-50 shadow-neon uppercase tracking-widest mt-4">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
          Don't have an account? <Link to="/signup" className="text-primary-500 font-black tracking-widest uppercase hover:text-primary-400 transition ml-1">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
