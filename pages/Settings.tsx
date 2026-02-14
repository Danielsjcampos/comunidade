
import React from 'react';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, logout, theme, toggleTheme } = useAuth();

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in pb-32">
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-4xl font-black tracking-tight text-navy dark:text-white transition-colors">Ajustes</h1>
        <div className="bg-navy/10 dark:bg-white/10 border border-navy/20 dark:border-white/10 size-14 rounded-3xl flex items-center justify-center text-navy dark:text-white shadow-sm">
          <span className="material-symbols-outlined text-3xl material-symbols-fill">account_circle</span>
        </div>
      </header>

      {/* Theme Toggle Section */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 px-2">APARÊNCIA</h2>
        <div className="bg-white dark:bg-dark-surface rounded-4xl p-6 border border-gray-100 dark:border-white/5 shadow-soft flex items-center justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-navy/10 dark:bg-mint/10 rounded-2xl flex items-center justify-center text-navy dark:text-mint">
              <span className="material-symbols-outlined material-symbols-fill">
                {theme === 'dark' ? 'dark_mode' : 'light_mode'}
              </span>
            </div>
            <div>
              <p className="text-lg font-bold text-navy dark:text-white">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
              <p className="text-xs text-gray-400 font-medium">Alterar visual do sistema</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className={`w-16 h-9 rounded-full transition-all duration-300 relative flex items-center px-1.5 ${theme === 'dark' ? 'bg-mint' : 'bg-gray-200'}`}
          >
            <div className={`size-6 rounded-full bg-white shadow-md transition-transform duration-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </section>

      {/* Admin Section */}
      {user?.role === 'admin' && (
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 px-2">ADMINISTRAÇÃO</h2>
          <Link to="/admin" className="block p-1 bg-white dark:bg-dark-surface rounded-4xl border border-gray-100 dark:border-white/5 shadow-soft hover:shadow-md transition-all active:scale-[0.99] group overflow-hidden">
            <div className="flex items-center gap-5 p-6 bg-navy/5 dark:bg-white/5 rounded-3xl border border-navy/10 dark:border-white/10 group-hover:bg-navy/10 dark:group-hover:bg-white/10 transition-colors">
              <div className="size-12 bg-navy dark:bg-navy rounded-2xl flex items-center justify-center text-white">
                <span className="material-symbols-outlined material-symbols-fill">admin_panel_settings</span>
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-navy dark:text-white tracking-tight">Painel do Administrador</p>
                <p className="text-xs text-navy/60 dark:text-white/40 font-medium tracking-wide">Gerenciar escalas, bandas e convites</p>
              </div>
              <span className="material-symbols-outlined text-navy/30 dark:text-white/20">arrow_forward</span>
            </div>
          </Link>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 px-2">PERFIL</h2>
        <div className="bg-white dark:bg-dark-surface rounded-4xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft transition-colors">
          <div className="flex items-center gap-5 p-6 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group">
            <span className="material-symbols-outlined text-navy dark:text-mint group-hover:scale-110 transition-transform">person</span>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Nome</p>
              <p className="text-base font-bold text-navy dark:text-white tracking-wide">{user?.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-6 border-b border-gray-50 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group">
            <span className="material-symbols-outlined text-navy dark:text-mint group-hover:scale-110 transition-transform">mail</span>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">E-mail</p>
              <p className="text-base font-bold text-navy dark:text-white tracking-wide">{user?.email}</p>
            </div>
          </div>
          {user?.banda && (
            <div className="flex items-center gap-5 p-6 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group">
              <span className="material-symbols-outlined text-navy dark:text-mint group-hover:scale-110 transition-transform">groups</span>
              <div className="flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Banda Principal</p>
                <p className="text-base font-bold text-navy dark:text-white tracking-wide">{user?.banda}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="pt-8 space-y-6">
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 py-5 px-4 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-3xl border border-red-100 dark:border-red-500/20 font-black text-sm uppercase tracking-widest shadow-lg shadow-red-500/5 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Sair do Sistema
        </button>
        <div className="text-center">
           <p className="text-[10px] text-gray-300 dark:text-white/20 uppercase tracking-[0.4em] font-black">PLATAFORMA MINISTERIAL v2.1</p>
           <p className="text-[10px] text-mint mt-1 font-bold">● Conectado ao NeonDB</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
