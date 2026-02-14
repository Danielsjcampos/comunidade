
import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../App';
import LumaBar from './ui/futuristic-nav';

const Shell: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background dark:bg-dark-bg transition-colors font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-50 flex items-center bg-white/80 dark:bg-dark-surface/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 px-6 py-4 justify-between transition-colors">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          <div className="text-white flex size-12 shrink-0 items-center justify-center rounded-2xl bg-navy shadow-lg shadow-navy/10 transform active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-2xl">church</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-gray-900 dark:text-white text-lg font-black leading-none tracking-tight transition-colors">Comunidade Cristã</h1>
            <p className="text-mint text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Escala Ministerial</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link to="/settings" className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <p className="text-gray-900 dark:text-white font-bold text-sm leading-none transition-colors">{user?.nome}</p>
              <p className="text-gray-400 dark:text-white/40 text-[10px] font-bold mt-1 uppercase tracking-wider">{user?.banda || 'Músico Individual'}</p>
            </div>
            <div className="size-10 rounded-xl bg-navy/10 dark:bg-white/10 border border-navy/20 dark:border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              {user?.photo_url ? (
                <img src={user.photo_url.startsWith('/') ? `http://localhost:3001${user.photo_url}` : user.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-navy dark:text-mint material-symbols-fill text-2xl">account_circle</span>
              )}
            </div>
          </Link>

          <button 
            onClick={logout}
            className="flex size-10 items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-red-50 hover:text-red-500 hover:border-red-100 dark:hover:bg-red-500/10 transition-all text-gray-400"
            title="Sair"
          >
            <span className="material-symbols-outlined font-bold text-xl">logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <Outlet />
      </main>

      {/* Futuristic Bottom Nav */}
      <LumaBar />
    </div>
  );
};

export default Shell;
