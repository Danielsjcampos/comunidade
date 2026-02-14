
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Booking, Schedule } from './types';
import { api } from './api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyScales from './pages/MyScales';
import Bands from './pages/Bands';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';

// Components
import Shell from './components/Shell';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: Partial<User> & { senha?: string; token?: string }) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  logout: () => void;
  bookings: Booking[];
  schedules: Schedule[];
  addBooking: (scheduleId: string) => Promise<void>;
  cancelBooking: (bookingId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  loading: boolean;
  error: string | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Apply theme class to <html>
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Persist user in localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Fetch schedules & bookings from API
  const refreshData = useCallback(async () => {
    try {
      const [schedulesData, bookingsData] = await Promise.all([
        api.getSchedules(),
        api.getBookings()
      ]);
      setSchedules(schedulesData.map((s: any) => ({
        id: s.id,
        data_sabado: s.data_sabado.split('T')[0],
        hora_inicio: s.hora_inicio.substring(0, 5),
        hora_fim: s.hora_fim.substring(0, 5),
        vagas_totais: 1
      })));
      setBookings(bookingsData.map((b: any) => ({
        id: b.id,
        user_id: b.user_id,
        schedule_id: b.schedule_id,
        created_at: b.created_at,
        status: 'confirmado' as const,
        user_name: b.user_name,
        banda_name: b.banda_name
      })));
    } catch (err: any) {
      console.error('Fetch error:', err);
    }
  }, []);

  // Load data on mount and poll every 5 seconds
  useEffect(() => {
    if (user) {
      refreshData();
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
    }
  }, [user, refreshData]);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, pass);
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: Partial<User> & { senha?: string; token?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register({
        nome: formData.nome || '',
        email: formData.email || '',
        telefone: formData.telefone || '',
        senha: formData.senha || '',
        banda: formData.banda,
        token: formData.token
      });
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (formData: Partial<User>) => {
    if (!user) return false;
    setLoading(true);
    setError(null);
    try {
      const data = await api.updateProfile(user.id, formData);
      setUser(data.user);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setBookings([]);
    setSchedules([]);
    localStorage.removeItem('bookings');
  };

  const addBooking = async (scheduleId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.createBooking(user.id, scheduleId);
      await refreshData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.cancelBooking(bookingId, user.id);
      await refreshData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, updateProfile, logout, bookings, schedules, addBooking, cancelBooking, refreshData, loading, error,
      theme, toggleTheme
    }}>
      <HashRouter>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          
          <Route path="/" element={user ? <Shell /> : <Navigate to="/login" />}>
             <Route index element={<Dashboard />} />
             <Route path="scales" element={<MyScales />} />
             <Route path="bands" element={<Bands />} />
             <Route path="settings" element={<Settings />} />
             <Route path="admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />

          </Route>
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthContext.Provider>
  );
};

export default App;
