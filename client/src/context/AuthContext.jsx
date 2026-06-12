import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const isTokenExpired = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    return exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  const logout = () => {
    setUser(null);
    setWishlist([]);
    localStorage.removeItem('userInfo');
  };

  const fetchWishlist = async (token) => {
    try {
      const { data } = await axios.get('/api/users/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(data.map(p => p._id || p));
    } catch (err) {
      console.error('Failed to fetch wishlist');
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        if (parsedUser && parsedUser.token) {
          if (isTokenExpired(parsedUser.token)) {
            localStorage.removeItem('userInfo');
          } else {
            setUser(parsedUser);
            fetchWishlist(parsedUser.token);
          }
        }
      } catch (err) {
        console.error('Error parsing user info from localStorage', err);
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          const msg = error.response.data?.message;
          if (msg && (msg.includes('token failed') || msg.includes('no token') || msg.includes('Not authorized'))) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    fetchWishlist(data.token);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post('/api/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    fetchWishlist(data.token);
    return data;
  };

  const googleLogin = async (tokenId) => {
    const { data } = await axios.post('/api/auth/google', { tokenId });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    fetchWishlist(data.token);
    return data;
  };

  const toggleWishlistContext = async (propertyId) => {
    if (!user) return;
    try {
      const { data } = await axios.post('/api/users/wishlist', { propertyId }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setWishlist(data);
    } catch (err) {
      console.error('Failed to toggle wishlist');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading, wishlist, toggleWishlistContext }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
