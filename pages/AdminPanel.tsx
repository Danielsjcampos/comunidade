
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { api } from '../api';
import { User, Schedule } from '../types';
import { formatDateBR } from '../utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminPanel: React.FC = () => {
  const { user, schedules, bookings } = useAuth();
  const [activeTab, setActiveTab] = useState<'summary' | 'schedules' | 'bands' | 'invite'>('summary');
  const [users, setUsers] = useState<User[]>([]);
  const [inviteLink, setInviteLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form states for new schedule
  const [newSlot, setNewSlot] = useState({
    data_sabado: '',
    hora_inicio: '08:00',
    hora_fim: '09:00'
  });

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (activeTab === 'bands') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCreateInvite = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.generateInvite(user.id);
      setInviteLink(data.link);
      setMessage({ type: 'success', text: 'Convite gerado com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await api.createSchedule(user.id, newSlot);
      setMessage({ type: 'success', text: 'Horário criado/atualizado com sucesso!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingUser) return;
    setLoading(true);
    try {
      await api.updateAdminUser(user.id, editingUser.id, {
        nome: editingUser.nome,
        banda: editingUser.banda,
        telefone: editingUser.telefone,
        email: editingUser.email
      });
      setMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!user) return;
    if (window.confirm(`Tem certeza que deseja excluir "${name}"? Esta ação removerá o usuário e todas as suas reservas.`)) {
      setLoading(true);
      try {
        await api.deleteUser(user.id, userId);
        setMessage({ type: 'success', text: 'Usuário excluído com sucesso!' });
        loadUsers();
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado para a área de transferência!');
  };

  const groupedSchedules = schedules.reduce((acc, s) => {
    if (!acc[s.data_sabado]) acc[s.data_sabado] = [];
    acc[s.data_sabado].push(s);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const getBooking = (slotId: string) => bookings.find(b => b.schedule_id === slotId);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // Navy
    doc.text('Escala Ministerial - Comunidade Cristã', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

    let currentY = 40;

    const sortedDates = (Object.entries(groupedSchedules) as [string, Schedule[]][]).sort((a, b) => a[0].localeCompare(b[0]));

    sortedDates.forEach(([date, slots]) => {
      // Date Header
      doc.setFillColor(30, 58, 138);
      doc.rect(14, currentY, 182, 10, 'F');
      doc.setTextColor(255);
      doc.setFontSize(12);
      doc.text(formatDateBR(date).toUpperCase(), 20, currentY + 7);
      
      currentY += 12;

      // Table for slots
      const tableData = slots.sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio)).map(slot => {
        const b = getBooking(slot.id);
        return [
          `${slot.hora_inicio} - ${slot.hora_fim}`,
          b ? (b.banda_name || b.user_name) : 'VAGO',
          b ? 'CONFIRMADO' : 'AGUARDANDO'
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['Horário', 'Banda / Responsável', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [45, 212, 191] }, // Mint
        styles: { fontSize: 10, cellPadding: 5 },
        margin: { left: 14, right: 14 }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;

      // New page if space is tight
      if (currentY > 260 && sortedDates.indexOf([date, slots]) !== sortedDates.length - 1) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save(`escala-ministerial-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in transition-colors pb-32">
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-navy dark:text-white tracking-tight">Painel Administrativo</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Gestão de escalas, bandas e convites.</p>
          </div>
          {activeTab === 'summary' && schedules.length > 0 && (
            <button
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-2 px-6 h-12 bg-mint text-navy font-black rounded-2xl shadow-lg shadow-mint/10 hover:shadow-mint/20 active:scale-95 transition-all text-xs uppercase tracking-widest whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
              Exportar PDF
            </button>
          )}
        </div>
      </header>

      {message && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400'}`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
            <p className="font-bold">{message.text}</p>
          </div>
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2 p-1.5 bg-gray-100 dark:bg-dark-surface rounded-3xl transition-colors">
        {[
          { id: 'summary', label: 'Resumo', icon: 'summarize' },
          { id: 'schedules', label: 'Escalas', icon: 'calendar_add_on' },
          { id: 'bands', label: 'Bandas', icon: 'groups' },
          { id: 'invite', label: 'Convite', icon: 'link' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
              activeTab === tab.id ? 'bg-navy dark:bg-navy text-white shadow-lg' : 'text-gray-500 dark:text-white/40 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-xl">{tab.icon}</span>
            <span className="text-xs sm:text-sm uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="bg-white dark:bg-dark-surface rounded-4xl border border-gray-100 dark:border-white/5 shadow-soft p-4 sm:p-8 transition-colors">
        {activeTab === 'summary' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black text-navy dark:text-white">Escala Geral por Dia</h3>
              <span className="text-[10px] font-bold text-mint uppercase tracking-widest">Visualização Admin</span>
            </div>

            <div className="space-y-6">
              {(Object.entries(groupedSchedules) as [string, Schedule[]][]).sort((a, b) => a[0].localeCompare(b[0])).map(([date, slots]) => (
                <div key={date} className="bg-gray-50 dark:bg-white/5 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/10">
                  <div className="bg-navy px-6 py-4 flex justify-between items-center">
                    <h4 className="text-white font-black text-lg capitalize">{formatDateBR(date)}</h4>
                    <span className="text-[10px] font-bold text-mint uppercase tracking-widest">Sábado</span>
                  </div>
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slots.sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio)).map(slot => {
                      const booking = getBooking(slot.id);
                      return (
                        <div key={slot.id} className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                              <span className="text-navy dark:text-white font-black text-base">{slot.hora_inicio}</span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">{slot.hora_fim}</span>
                            </div>
                            <div className="w-px h-8 bg-gray-100 dark:bg-white/10 mx-1"></div>
                            <div>
                              {booking ? (
                                <>
                                  <p className="text-navy dark:text-white font-bold text-sm truncate max-w-[150px]">{booking.banda_name || booking.user_name}</p>
                                  <p className="text-[10px] text-mint font-bold uppercase tracking-widest">Confirmado</p>
                                </>
                              ) : (
                                <>
                                  <p className="text-gray-300 dark:text-white/10 font-bold text-sm italic">Vago</p>
                                  <p className="text-[10px] text-gray-300 dark:text-white/5 font-black uppercase tracking-widest">Aguardando</p>
                                </>
                              )}
                            </div>
                          </div>
                          {booking && (
                             <div className="size-8 bg-mint/10 rounded-xl flex items-center justify-center text-mint">
                               <span className="material-symbols-outlined text-lg font-bold">check</span>
                             </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {schedules.length === 0 && (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-gray-200 dark:text-white/5 text-6xl mb-4">event_busy</span>
                  <p className="text-gray-400 dark:text-white/20 font-bold uppercase tracking-widest text-xs">Nenhuma data disponível para o resumo</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'schedules' && (
          <form onSubmit={handleCreateSchedule} className="space-y-6">
            <h3 className="text-2xl font-black text-navy dark:text-white mb-4">Novo Horário</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest ml-1">Data (Sábado)</label>
                <input
                  type="date"
                  required
                  className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-navy dark:focus:border-mint focus:ring-4 focus:ring-navy/5 outline-none font-medium dark:text-white"
                  value={newSlot.data_sabado}
                  onChange={e => setNewSlot({ ...newSlot, data_sabado: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest ml-1">Início</label>
                <input
                  type="time"
                  required
                  className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-navy dark:focus:border-mint outline-none font-medium dark:text-white"
                  value={newSlot.hora_inicio}
                  onChange={e => setNewSlot({ ...newSlot, hora_inicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest ml-1">Fim</label>
                <input
                  type="time"
                  required
                  className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-navy dark:focus:border-mint outline-none font-medium dark:text-white"
                  value={newSlot.hora_fim}
                  onChange={e => setNewSlot({ ...newSlot, hora_fim: e.target.value })}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-10 h-14 bg-navy dark:bg-mint text-white dark:text-navy font-black rounded-2xl shadow-lg hover:shadow-navy/20 active:scale-95 transition-all disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              CRIAR HORÁRIO
            </button>
          </form>
        )}

        {activeTab === 'bands' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-navy dark:text-white mb-4">Gestão de Bandas</h3>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {users.filter(u => u.role !== 'admin').map(u => (
                <div key={u.id} className="py-5 flex items-center justify-between group">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white transition-colors">{u.nome}</p>
                    <p className="text-xs text-mint font-bold uppercase tracking-widest mt-1">{u.banda || 'Individual'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="size-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 text-navy dark:text-white hover:bg-navy hover:text-white dark:hover:bg-mint dark:hover:text-navy transition-all shadow-sm"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-xl">edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.banda || u.nome)}
                      className="size-12 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-all shadow-sm"
                      title="Excluir"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {editingUser && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-navy/40 dark:bg-black/60 backdrop-blur-sm">
                <form onSubmit={handleUpdateUser} className="w-full max-w-lg bg-white dark:bg-dark-surface rounded-4xl p-8 shadow-2xl animate-fade-in space-y-6 border border-white/5">
                   <div className="flex justify-between items-center mb-4">
                     <h4 className="text-2xl font-black text-navy dark:text-white">Editar Músico</h4>
                     <button type="button" onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined">close</span>
                     </button>
                   </div>
                   <div className="space-y-4">
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Nome Responsável</label>
                       <input
                         className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:border-navy dark:focus:border-mint text-navy dark:text-white font-medium"
                         value={editingUser.nome}
                         onChange={e => setEditingUser({...editingUser, nome: e.target.value})}
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Nome da Banda</label>
                       <input
                         className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:border-navy dark:focus:border-mint text-navy dark:text-white font-medium"
                         value={editingUser.banda || ''}
                         onChange={e => setEditingUser({...editingUser, banda: e.target.value})}
                       />
                     </div>
                     <div className="space-y-1">
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Telefone</label>
                       <input
                         className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:border-navy dark:focus:border-mint text-navy dark:text-white font-medium"
                         value={editingUser.telefone || ''}
                         onChange={e => setEditingUser({...editingUser, telefone: e.target.value})}
                       />
                     </div>
                   </div>
                   <button
                     type="submit"
                     disabled={loading}
                     className="w-full py-5 bg-navy dark:bg-mint text-white dark:text-navy font-black rounded-2xl shadow-lg hover:shadow-navy/20 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
                   >
                     SALVAR ALTERAÇÕES
                   </button>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'invite' && (
          <div className="space-y-8 py-4">
            <div>
              <h3 className="text-2xl font-black text-navy dark:text-white mb-2">Gerador de Convites</h3>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Crie links exclusivos para novos ministérios.</p>
            </div>
            
            {!inviteLink ? (
              <button
                onClick={handleCreateInvite}
                disabled={loading}
                className="w-full sm:w-auto px-10 h-16 bg-mint dark:bg-mint text-navy font-black rounded-2xl shadow-lg shadow-mint/10 hover:shadow-mint/20 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
              >
                <span className="material-symbols-outlined font-bold">add_link</span>
                GERAR NOVO LINK
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    readOnly
                    className="flex-1 h-16 px-6 rounded-2xl bg-gray-50 dark:bg-white/5 border-2 border-mint/20 text-navy dark:text-white font-bold outline-none"
                    value={inviteLink}
                  />
                  <button
                    onClick={() => copyToClipboard(inviteLink)}
                    className="h-16 px-8 bg-navy dark:bg-navy text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                  >
                    <span className="material-symbols-outlined text-xl">content_copy</span>
                    COPIAR
                  </button>
                </div>
                <button
                  onClick={() => setInviteLink('')}
                  className="text-navy dark:text-mint font-bold text-sm hover:underline ml-2"
                >
                  Gerar outro convite
                </button>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-500/5 p-6 rounded-3xl border border-amber-100 dark:border-amber-500/20 flex gap-4 transition-colors">
              <span className="material-symbols-outlined text-amber-500 font-bold">info</span>
              <div>
                <p className="text-amber-900 dark:text-amber-400 font-bold text-sm">Aviso de Segurança</p>
                <p className="text-amber-800/70 dark:text-amber-400/50 text-xs mt-1 leading-relaxed">
                  O link gerado é temporário e permite 1 cadastro. Envie apenas para líderes de grupo autorizados.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
