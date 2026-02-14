
import React, { useState } from 'react';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';

const DEV_ACCOUNTS = [
  { label: '👑 Super Admin', email: 'admin@igreja.com', senha: 'admin123', className: 'bg-navy text-white shadow-navy/10' },
  { label: '🎸 Banda Gratidão', email: 'david@igreja.com', senha: 'banda123', className: 'bg-mint text-navy shadow-mint/10' },
  { label: '🎤 Ministério Zoe', email: 'maria@igreja.com', senha: 'banda123', className: 'bg-mint text-navy shadow-mint/10' },
];

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, theme } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (!success) {
      setLoginError(error || 'Email ou senha incorretos');
    }
  };

  const handleDevLogin = async (devEmail: string, devSenha: string) => {
    setLoginError(null);
    setIsLoading(true);
    setEmail(devEmail);
    setPassword(devSenha);
    const success = await login(devEmail, devSenha);
    setIsLoading(false);
    if (!success) {
      setLoginError('Erro ao fazer login. Verifique se o banco foi configurado.');
    }
  };

  return (
    <div className="bg-background dark:bg-dark-bg min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors">
      <div className="w-full max-w-[420px] flex flex-col items-center animate-fade-in">
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="size-24 rounded-4xl bg-navy flex items-center justify-center text-white shadow-2xl shadow-navy/30 dark:shadow-navy/50 transition-transform hover:scale-105">
            <span className="material-symbols-outlined !text-5xl">church</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-navy dark:text-white tracking-tight">Escala Ministerial</h1>
            <p className="text-gray-500 dark:text-gray-400 text-base mt-2 font-medium">Comunidade Cristã</p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="w-full bg-white dark:bg-dark-surface p-8 rounded-4xl shadow-soft border border-gray-100 dark:border-white/5 transition-colors">
          <h2 className="text-2xl font-black text-navy dark:text-white mb-6 uppercase tracking-wider text-xs">Acesso ao Sistema</h2>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-center gap-3">
              <span className="material-symbols-outlined text-red-500 text-xl">error</span>
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2" htmlFor="email">Email</label>
              <input 
                className="block w-full px-5 h-14 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-white/10 focus:border-navy dark:focus:border-mint focus:ring-4 focus:ring-navy/5 dark:focus:ring-mint/5 outline-none transition-all font-medium"
                id="email" 
                placeholder="seu@email.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2" htmlFor="password">Senha</label>
              <input 
                className="block w-full px-5 h-14 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 focus:bg-white dark:focus:bg-white/10 focus:border-navy dark:focus:border-mint focus:ring-4 focus:ring-navy/5 dark:focus:ring-mint/5 outline-none transition-all font-medium"
                id="password" 
                placeholder="••••••••" 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex justify-end px-1">
              <button type="button" className="text-xs font-bold text-navy dark:text-mint hover:underline transition-all">
                Esqueci a senha
              </button>
            </div>

            <button 
              className="w-full bg-navy dark:bg-mint text-white dark:text-navy font-black h-16 rounded-2xl shadow-xl shadow-navy/20 dark:shadow-mint/5 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Entrar</span>
                  <span className="material-symbols-outlined !text-xl font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Access Grid */}
          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Contas de Teste</p>
            <div className="grid grid-cols-1 gap-2">
              {DEV_ACCOUNTS.map((acc) => (
                <button 
                  key={acc.email}
                  onClick={() => handleDevLogin(acc.email, acc.senha)}
                  disabled={isLoading}
                  className={`flex items-center justify-between p-4 rounded-2xl ${acc.className} font-bold text-xs shadow-lg active:scale-[0.98] transition-all disabled:opacity-50`}
                >
                  <span className="uppercase tracking-widest">{acc.label}</span>
                  <span className="opacity-50 font-medium lowercase font-mono">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-8 text-center px-8 py-4">
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Ainda não tem cadastro? 
            <Link to="/register" className="text-navy dark:text-mint font-bold hover:underline ml-1">Registar por Convite</Link>
          </p>
        </div>

        <div className="mt-8 text-center text-[10px] text-gray-400 dark:text-white/20 font-black uppercase tracking-[0.3em]">
          <p>© 2024 Comunidade Cristã • Escala 2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
