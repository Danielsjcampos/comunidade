
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';

const Shell: React.FC = () => {
  const { logout, user, theme } = useAuth();
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
            <h1 className="text-gray-900 dark:text-white text-lg font-black leading-none tracking-tight">Comunidade Cristã</h1>
            <p className="text-mint text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Escala Ministerial</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end mr-2">
            <p className="text-gray-900 dark:text-white font-bold text-sm leading-none">{user?.nome}</p>
            <p className="text-gray-400 dark:text-white/40 text-[10px] font-medium mt-1">{user?.banda || 'Músico Individual'}</p>
          </div>
          <button 
            onClick={logout}
            className="flex size-11 items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-red-50 hover:text-red-500 hover:border-red-100 dark:hover:bg-red-500/10 transition-all text-gray-400"
          >
            <span className="material-symbols-outlined font-bold">logout</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 z-50 pointer-events-none">
        <div className="max-w-md mx-auto bg-navy/95 dark:bg-dark-surface/95 backdrop-blur-md rounded-4xl p-2 shadow-2xl shadow-navy/30 dark:shadow-black/50 flex justify-between items-center pointer-events-auto border border-white/10 transition-colors">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 py-3 transition-colors rounded-3xl ${isActive ? 'text-navy bg-mint' : 'text-white/60 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">dashboard</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Agenda</span>
          </NavLink>
          
          <NavLink 
            to="/scales" 
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 py-3 transition-colors rounded-3xl ${isActive ? 'text-navy bg-mint' : 'text-white/60 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">event_note</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Minhas</span>
          </NavLink>

          <NavLink 
            to="/bands" 
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 py-3 transition-colors rounded-3xl ${isActive ? 'text-navy bg-mint' : 'text-white/60 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">groups</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Bandas</span>
          </NavLink>

          <NavLink 
            to="/settings" 
            className={({ isActive }) => `flex-1 flex flex-col items-center gap-1 py-3 transition-colors rounded-3xl ${isActive ? 'text-navy bg-mint' : 'text-white/60 hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-2xl font-bold">settings</span>
            <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">Ajustes</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Shell;
