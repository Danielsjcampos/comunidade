
import React, { useState } from 'react';
import { useAuth } from '../App';
import { Link, useSearchParams } from 'react-router-dom';

const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('token') || '';
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    banda: ''
  });
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);
    setIsLoading(true);
    
    const success = await register({
      ...formData,
      token: inviteToken
    });
    
    setIsLoading(false);
    if (!success) {
      setRegisterError(error || 'Erro ao cadastrar. Tente novamente.');
    }
  };

  return (
    <div className="bg-background dark:bg-dark-bg min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors">
      <div className="w-full max-w-[460px] animate-fade-in">
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8 px-2">
          <Link to="/login" className="size-12 rounded-2xl bg-white dark:bg-dark-surface border border-gray-100 dark:border-white/5 flex items-center justify-center text-navy dark:text-white shadow-soft transition-transform active:scale-95">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="text-right">
             <h2 className="text-navy dark:text-white font-black text-xl tracking-tight">Novo Cadastro</h2>
             <p className="text-mint font-bold text-[10px] uppercase tracking-widest">{inviteToken ? 'Convite Verificado' : 'Acesso Restrito'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-4xl shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden transition-colors">
          <div className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="size-16 bg-navy rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-navy/20">
                <span className="material-symbols-outlined text-3xl font-bold">music_note</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-center text-sm font-medium px-6">
                Complete seus dados para começar a gerenciar suas escalas e bandas.
              </p>
            </div>

            {/* Error Message */}
            {registerError && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-red-700 dark:text-red-400 text-sm font-medium">{registerError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Nome Completo</label>
                  <input 
                    className="w-full h-14 px-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:border-navy dark:focus:border-mint focus:ring-4 focus:ring-navy/5 outline-none text-navy dark:text-white transition-all font-medium" 
                    placeholder="Seu nome" 
                    type="text"
                    required
                    disabled={isLoading}
                    value={formData.nome}
                    onChange={e => setFormData({...formData, nome: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">E-mail</label>
                  <input 
                    className="w-full h-14 px-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:border-navy dark:focus:border-mint focus:ring-4 focus:ring-navy/5 outline-none text-navy dark:text-white transition-all font-medium" 
                    placeholder="exemplo@igreja.com" 
                    type="email"
                    required
                    disabled={isLoading}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Telefone</label>
                    <input 
                      className="w-full h-14 px-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:border-navy dark:focus:border-mint focus:ring-4 focus:ring-navy/5 outline-none text-navy dark:text-white transition-all font-medium" 
                      placeholder="(00) 00000-0000" 
                      type="tel"
                      disabled={isLoading}
                      value={formData.telefone}
                      onChange={e => setFormData({...formData, telefone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Sua Banda</label>
                    <input 
                      className="w-full h-14 px-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:border-navy dark:focus:border-mint focus:ring-4 focus:ring-navy/5 outline-none text-navy dark:text-white transition-all font-medium" 
                      placeholder="Opcional" 
                      type="text"
                      disabled={isLoading}
                      value={formData.banda}
                      onChange={e => setFormData({...formData, banda: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Defina uma Senha</label>
                  <input 
                    className="w-full h-14 px-5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:border-navy dark:focus:border-mint focus:ring-4 focus:ring-navy/5 outline-none text-navy dark:text-white transition-all font-medium" 
                    placeholder="Mínimo 8 caracteres" 
                    type="password"
                    required
                    disabled={isLoading}
                    value={formData.senha}
                    onChange={e => setFormData({...formData, senha: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6">
                <button 
                  className="w-full bg-navy dark:bg-mint text-white dark:text-navy font-black h-16 rounded-2xl shadow-xl shadow-navy/20 dark:shadow-mint/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-[0.2em] text-sm" 
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Criar Conta</span>
                      <span className="material-symbols-outlined font-bold">check</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
          <div className="p-8 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5 text-center">
             <p className="text-[10px] text-gray-400 dark:text-white/20 uppercase tracking-[0.4em] font-black">
                Comunidade Cristã • Ministerial
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
