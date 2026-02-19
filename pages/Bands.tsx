
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { User } from '../types';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';

const Bands: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMembers, setViewingMembers] = useState<string | null>(null);

  useEffect(() => {
    loadBands();
  }, []);

  const loadBands = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (targetId: string, name: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    if (window.confirm(`Tem certeza que deseja excluir o ministério "${name}"? Esta ação não pode ser desfeita e removerá todas as reservas associadas.`)) {
      try {
        setLoading(true);
        await api.deleteUser(currentUser.id, targetId);
        // Refresh list
        await loadBands();
      } catch (err: any) {
        alert(err.message || 'Erro ao excluir ministério');
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
     (u.banda?.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    u.role !== 'admin'
  );

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto animate-fade-in transition-colors pb-32">
      <header className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <div className="bg-navy rounded-2xl size-14 flex items-center justify-center text-white shadow-lg shadow-navy/10 transform active:scale-95 transition-transform">
            <span className="material-symbols-outlined text-3xl">library_music</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-navy dark:text-white tracking-tight">Ministérios</h1>
            <p className="text-gray-400 dark:text-gray-400 font-medium text-sm">Grupos e Bandas da Comunidade</p>
          </div>
        </div>
        
        {currentUser?.role === 'admin' && (
          <Link to="/admin" className="size-12 bg-mint rounded-2xl flex items-center justify-center text-navy shadow-lg shadow-mint/10 hover:scale-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined font-bold">add</span>
          </Link>
        )}
      </header>

      <div className="relative group">
        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors">search</span>
        <input 
          className="w-full bg-white dark:bg-dark-surface border border-gray-100 dark:border-white/5 rounded-3xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-navy/5 focus:border-navy dark:focus:border-mint text-base placeholder:text-gray-400 text-navy dark:text-white transition-all shadow-soft outline-none font-medium" 
          placeholder="Buscar banda, músico ou estilo..." 
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">ATIVOS NO SISTEMA</h3>
          <span className="text-xs font-bold text-mint">{filteredUsers.length} GRUPOS</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="size-12 border-4 border-gray-100 dark:border-white/10 border-t-navy dark:border-t-mint rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-dark-surface rounded-4xl border border-dashed border-gray-200 dark:border-white/10 transition-colors">
            <span className="material-symbols-outlined text-gray-200 dark:text-white/5 text-6xl mb-4">search_off</span>
            <p className="text-gray-400 dark:text-white/20 font-bold uppercase tracking-widest text-xs">Nenhum resultado encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.map(u => (
              <div key={u.id} className="bg-white dark:bg-dark-surface p-6 rounded-4xl shadow-soft border border-gray-100 dark:border-white/5 flex flex-col gap-4 hover:shadow-md transition-all group border-b-4 border-b-transparent hover:border-b-mint active:scale-[0.99] relative overflow-hidden">
                <div className="flex items-center gap-6">
                  <div className="size-20 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-navy dark:text-white shrink-0 group-hover:scale-105 transition-transform overflow-hidden font-black text-2xl uppercase border border-gray-100 dark:border-white/5 shadow-sm">
                    {u.photo_url ? (
                      <img src={u.photo_url} alt={u.banda} className="w-full h-full object-cover" />
                    ) : (
                      u.banda ? u.banda.substring(0, 1) : u.nome.substring(0, 1)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-xl text-navy dark:text-white truncate tracking-tight">{u.banda || 'Músico Individual'}</h4>
                    <p className="text-sm font-bold text-mint uppercase tracking-widest mt-0.5">{u.nome}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-gray-400 dark:text-white/40 text-xs font-bold transition-colors">
                        <span className="material-symbols-outlined text-sm">call</span>
                        {u.telefone || 'Sem tel'}
                      </div>
                    </div>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <div className="flex flex-col gap-2 shrink-0">
                      <Link to="/admin" className="text-gray-200 dark:text-white/10 hover:text-navy dark:hover:text-mint transition-colors" title="Editar">
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(u.id, u.banda || u.nome);
                        }}
                        className="text-gray-200 dark:text-white/10 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Excluir"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Integrantes Preview */}
                {u.integrantes && (
                  <div className="mt-2 pt-4 border-t border-gray-50 dark:border-white/5">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Integrantes:</p>
                    <div className="flex flex-wrap gap-2">
                       {u.integrantes.split(',').map((name, i) => (
                         <span key={i} className="px-3 py-1 bg-navy/5 dark:bg-white/5 rounded-full text-[10px] font-bold text-navy/70 dark:text-white/60">
                           {name.trim()}
                         </span>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Informative Footer */}
      <div className="bg-navy/5 dark:bg-white/5 p-8 rounded-4xl border border-navy/10 dark:border-white/10 flex flex-col items-center text-center transition-colors">
        <div className="size-14 bg-white dark:bg-dark-surface rounded-2xl flex items-center justify-center text-navy dark:text-white mb-4 shadow-sm">
          <span className="material-symbols-outlined font-bold text-mint">verified</span>
        </div>
        <h4 className="text-navy dark:text-white font-bold transition-colors">Cadastro de Novos Ministérios</h4>
        <p className="text-navy/60 dark:text-white/40 text-xs mt-2 leading-relaxed">
          Para registrar um novo grupo ou músico, peça o link de convite único ao seu administrador.
        </p>
      </div>
    </div>
  );
};

export default Bands;
