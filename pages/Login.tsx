
import React, { useState } from 'react';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import AnoAI from '../components/ui/animated-shader-background';

const DEV_ACCOUNTS = [
  { label: '👑 Super Admin', email: 'admin@igreja.com', senha: 'admin123', className: 'bg-white/10 text-white backdrop-blur-md border border-white/20' },
  { label: '🎸 Banda Gratidão', email: 'david@igreja.com', senha: 'banda123', className: 'bg-mint/80 text-navy backdrop-blur-md' },
  { label: '🎤 Ministério Zoe', email: 'maria@igreja.com', senha: 'banda123', className: 'bg-mint/80 text-navy backdrop-blur-md' },
];

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();

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
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 font-sans overflow-hidden">
      {/* Animated Background */}
      <AnoAI />

      <div className="w-full max-w-[420px] flex flex-col items-center animate-fade-in z-10">
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center gap-4 animate-float">
          <div className="size-24 rounded-4xl bg-navy flex items-center justify-center text-white shadow-2xl shadow-navy/30 transition-transform hover:scale-110">
            <span className="material-symbols-outlined !text-5xl">church</span>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">Escala Ministerial</h1>
            <p className="text-mint font-bold text-base mt-2 drop-shadow-md">Comunidade Cristã</p>
          </div>
        </div>

        {/* Login Form Card - GLASSMORPHISM */}
        <div className="w-full bg-white/10 dark:bg-black/20 backdrop-blur-xl p-8 rounded-4xl shadow-2xl border border-white/20 transition-all hover:border-white/40 hover:bg-white/15">
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-wider text-xs opacity-70">Acesso ao Sistema</h2>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-500/30 rounded-2xl flex items-center gap-3">
              <span className="material-symbols-outlined text-red-400 text-xl">error</span>
              <p className="text-red-200 text-sm font-medium">{loginError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-2" htmlFor="email">Email</label>
              <input 
                className="block w-full px-5 h-14 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-mint focus:ring-4 focus:ring-mint/5 outline-none transition-all font-medium"
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
              <label className="text-[10px] font-black text-white/50 uppercase tracking-widest ml-2" htmlFor="password">Senha</label>
              <input 
                className="block w-full px-5 h-14 rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-mint focus:ring-4 focus:ring-mint/5 outline-none transition-all font-medium"
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
              <button type="button" className="text-xs font-bold text-mint hover:underline transition-all">
                Esqueci a senha
              </button>
            </div>

            <button 
              className="w-full bg-mint text-navy font-black h-16 rounded-2xl shadow-xl shadow-mint/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm mt-4 hover:brightness-110" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="size-6 border-2 border-navy/30 border-t-navy rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Entrar</span>
                  <span className="material-symbols-outlined !text-xl font-bold">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Access Grid */}
          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 text-center">Acesso rápido desenvolvedor</p>
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

        <div className="mt-8 text-center text-[10px] text-white/20 font-black uppercase tracking-[0.3em]">
          <p>© 2024 Comunidade Cristã • Escala 2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
