
import React, { useState, useRef } from 'react';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import { api } from '../api';

const Settings: React.FC = () => {
  const { user, logout, theme, toggleTheme, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    photo_url: user?.photo_url || '',
    integrantes: user?.integrantes || ''
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    const ok = await updateProfile(formData);
    if (ok) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await api.uploadImage(file);
      const updatedData = { ...formData, photo_url: url };
      setFormData(updatedData);
      
      // Automatically update profile with new image
      const ok = await updateProfile(updatedData);
      if (ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert(`Erro no upload: ${err.message}\n\nCertifique-se que o servidor (Porta 3001) foi REINICIADO com o novo código.`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in pb-32">
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-4xl font-black tracking-tight text-navy dark:text-white transition-colors">Ajustes</h1>
        <div className="bg-navy/10 dark:bg-white/10 border border-navy/20 dark:border-white/10 size-14 rounded-3xl flex items-center justify-center text-navy dark:text-white shadow-sm overflow-hidden relative group">
          {user?.photo_url ? (
            <img src={user.photo_url.startsWith('/') ? `http://localhost:3001${user.photo_url}` : user.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-3xl material-symbols-fill">account_circle</span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <span className="material-symbols-outlined text-white text-xl font-bold">upload</span>
          </div>
        </div>
      </header>

      {/* Profile & Band Section */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 px-2">MEU MINISTÉRIO</h2>
        <form onSubmit={handleUpdate} className="bg-white dark:bg-dark-surface rounded-4xl p-8 border border-gray-100 dark:border-white/5 shadow-soft transition-colors space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-2">
              <div 
                className="size-24 bg-gray-100 dark:bg-white/5 rounded-3xl flex items-center justify-center overflow-hidden border border-gray-200 dark:border-white/10 shrink-0 relative group cursor-pointer shadow-inner"
                onClick={() => fileInputRef.current?.click()}
              >
                {formData.photo_url ? (
                  <img src={formData.photo_url.startsWith('/') ? `http://localhost:3001${formData.photo_url}` : formData.photo_url} alt="Previa" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-gray-300">image</span>
                )}
                
                {uploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="size-6 border-2 border-mint/30 border-t-mint rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-white text-xl mb-1">add_a_photo</span>
                    <span className="text-[8px] text-white font-black uppercase">Alterar</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3 w-full">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">URL da Foto ou Upload</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="https://exemplo.com/foto.jpg"
                      className="flex-1 h-12 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-navy dark:focus:border-mint outline-none text-navy dark:text-white text-sm transition-all"
                      value={formData.photo_url}
                      onChange={e => setFormData({...formData, photo_url: e.target.value})}
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="size-12 rounded-xl bg-navy/5 dark:bg-white/5 border border-navy/10 dark:border-white/10 flex items-center justify-center text-navy dark:text-mint hover:bg-navy/10 dark:hover:bg-white/10 transition-all"
                      title="Fazer Upload"
                    >
                      <span className="material-symbols-outlined">upload_file</span>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Integrantes da Banda</label>
              <textarea 
                placeholder="Ex: David (Voz), Maria (Teclado), João (Bateria)..."
                rows={3}
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-navy dark:focus:border-mint outline-none text-navy dark:text-white text-sm resize-none shadow-inner"
                value={formData.integrantes}
                onChange={e => setFormData({...formData, integrantes: e.target.value})}
              />
              <p className="text-[10px] text-gray-400 ml-1">Liste os nomes e instrumentos separados por vírgula.</p>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading || uploading}
            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
              success ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-navy dark:bg-mint text-white dark:text-navy shadow-lg hover:shadow-navy/20 active:scale-95'
            }`}
          >
            {loading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : success ? (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                DADOS ATUALIZADOS!
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-xl">save</span>
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      </section>

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
            className={`w-16 h-9 rounded-full transition-all duration-300 relative flex items-center px-1.5 shadow-inner ${theme === 'dark' ? 'bg-mint' : 'bg-gray-200'}`}
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
              <div className="size-12 bg-navy dark:bg-navy rounded-2xl flex items-center justify-center text-white shadow-lg shadow-navy/20">
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

      {/* Account Info Section */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 px-2">CONTA</h2>
        <div className="bg-white dark:bg-dark-surface rounded-4xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-soft transition-colors">
          <div className="flex items-center gap-5 p-6 border-b border-gray-50 dark:border-white/5 transition-colors group">
            <span className="material-symbols-outlined text-navy dark:text-mint transition-transform">person</span>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Responsável</p>
              <p className="text-base font-bold text-navy dark:text-white tracking-wide">{user?.nome}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-6 border-b border-gray-50 dark:border-white/5 transition-colors group">
            <span className="material-symbols-outlined text-navy dark:text-mint transition-transform">mail</span>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">E-mail de Acesso</p>
              <p className="text-base font-bold text-navy dark:text-white tracking-wide">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 p-6 transition-colors group">
            <span className="material-symbols-outlined text-navy dark:text-mint transition-transform">badge</span>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Nível de Acesso</p>
              <p className="text-base font-bold text-navy dark:text-white tracking-wide uppercase tracking-widest">{user?.role === 'admin' ? 'Super Administrador' : 'Músico Ministerial'}</p>
            </div>
          </div>
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
           <p className="text-[10px] text-gray-300 dark:text-white/20 uppercase tracking-[0.4em] font-black">PLATAFORMA MINISTERIAL v2.3</p>
           <p className="text-[10px] text-mint mt-1 font-bold">● Conectado ao NeonDB</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
