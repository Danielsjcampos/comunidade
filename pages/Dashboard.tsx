
import React, { useState } from 'react';
import { useAuth } from '../App';
import { formatDateBR } from '../utils';
import ConfirmationModal from '../components/ConfirmationModal';
import { Schedule } from '../types';

const Dashboard: React.FC = () => {
  const { schedules, bookings, addBooking, user, loading, refreshData } = useAuth();
  const [confirmingSlot, setConfirmingSlot] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const groupedSchedules = schedules.reduce((acc, s) => {
    if (!acc[s.data_sabado]) acc[s.data_sabado] = [];
    acc[s.data_sabado].push(s);
    return acc;
  }, {} as Record<string, Schedule[]>);

  const handleReserve = (slotId: string) => {
    setConfirmingSlot(slotId);
    setActionError(null);
  };

  const onConfirm = async () => {
    if (confirmingSlot) {
      try {
        await addBooking(confirmingSlot);
        setConfirmingSlot(null);
      } catch (err: any) {
        setActionError(err.message || 'Erro ao reservar');
      }
    }
  };

  const getBooking = (slotId: string) => bookings.find(b => b.schedule_id === slotId);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-10 animate-fade-in transition-colors">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy dark:text-white tracking-tight">Agenda de Sábados</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Reserve o horário da sua banda para o próximo culto.</p>
        </div>
        <button 
          onClick={() => refreshData()}
          className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-dark-surface border border-gray-100 dark:border-white/5 rounded-2xl text-navy dark:text-white font-bold shadow-sm hover:shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>sync</span>
          Atualizar
        </button>
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="p-5 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <p className="text-red-700 dark:text-red-400 font-bold">{actionError}</p>
          </div>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Slots List */}
      <div className="grid grid-cols-1 gap-8">
        {schedules.length === 0 && !loading && (
          <div className="py-24 bg-white dark:bg-dark-surface rounded-3xl border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
            <div className="size-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-gray-300 dark:text-white/20 text-5xl">event_busy</span>
            </div>
            <p className="text-gray-400 dark:text-white/40 font-bold uppercase tracking-widest text-sm">Nenhum horário liberado ainda</p>
          </div>
        )}

        {(Object.entries(groupedSchedules) as [string, Schedule[]][]).sort((a, b) => a[0].localeCompare(b[0])).map(([date, slots]) => (
          <section key={date} className="bg-white dark:bg-dark-surface rounded-4xl border border-gray-100 dark:border-white/5 shadow-soft overflow-hidden transition-colors">
            <div className="px-8 py-6 bg-navy flex justify-between items-center">
              <div>
                <h3 className="text-white font-extrabold text-2xl capitalize">{formatDateBR(date)}</h3>
                <p className="text-white/60 text-sm font-medium">Culto de Adoração</p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                <span className="material-symbols-outlined text-mint text-sm material-symbols-fill">calendar_month</span>
                <span className="text-white text-xs font-bold uppercase tracking-widest">Sábado</span>
              </div>
            </div>
            
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slots.sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio)).map(slot => {
                const booking = getBooking(slot.id);
                const isMyBooking = booking?.user_id === user?.id;
                
                return (
                  <div 
                    key={slot.id} 
                    className={`p-6 rounded-3xl flex flex-col justify-between h-48 transition-all ${
                      booking 
                        ? 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 opacity-80' 
                        : 'bg-white dark:bg-dark-surface border-2 border-transparent hover:border-mint/30 shadow-sm hover:shadow-soft'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-3xl font-black text-navy dark:text-white">{slot.hora_inicio}</span>
                        <span className="text-gray-400 dark:text-white/40 text-xs font-bold font-mono">até {slot.hora_fim}</span>
                      </div>
                      {isMyBooking && (
                        <div className="size-8 bg-mint rounded-full flex items-center justify-center text-navy animate-bounce">
                          <span className="material-symbols-outlined text-base">check</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      {booking ? (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Ocupado por</p>
                          <p className="text-gray-700 dark:text-white font-extrabold text-sm truncate">{booking.banda_name || booking.user_name}</p>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-mint uppercase tracking-widest">Disponível</p>
                          <p className="text-gray-400 dark:text-white/40 font-medium text-sm">Vaga aberta</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      {booking ? (
                        <div className="w-full bg-gray-200 dark:bg-white/10 text-gray-400 dark:text-white/20 font-bold py-3 px-4 rounded-2xl text-xs text-center uppercase tracking-widest cursor-not-allowed">
                          Indisponível
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleReserve(slot.id)}
                          disabled={loading}
                          className="w-full bg-mint hover:bg-mint/90 text-navy font-black py-3 px-4 rounded-2xl text-xs uppercase tracking-widest shadow-md shadow-mint/10 transition-all active:scale-95 disabled:opacity-50"
                        >
                          Reservar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {confirmingSlot && (
        <ConfirmationModal 
          slot={schedules.find(s => s.id === confirmingSlot)!}
          onClose={() => setConfirmingSlot(null)}
          onConfirm={onConfirm}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Dashboard;
