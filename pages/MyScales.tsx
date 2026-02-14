
import React from 'react';
import { useAuth } from '../App';
import { formatDateBR } from '../utils';

const MyScales: React.FC = () => {
  const { bookings, user, cancelBooking, schedules, loading } = useAuth();
  const myBookings = bookings.filter(b => b.user_id === user?.id);

  const handleCancel = async (bookingId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      await cancelBooking(bookingId);
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-2xl mx-auto animate-fade-in transition-colors pb-32">
      <header className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="size-11 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/40 hover:text-navy dark:hover:text-white transition-all transform active:scale-95">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-black text-navy dark:text-white tracking-tight">Minhas Escalas</h1>
            <p className="text-gray-400 font-medium text-sm">Gerencie seus horários reservados</p>
          </div>
        </div>
        <div className="flex size-12 items-center justify-center rounded-2xl bg-mint/10 border border-mint/20 text-mint shadow-sm">
          <span className="text-lg font-black">{myBookings.length}</span>
        </div>
      </header>

      {myBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-dark-surface rounded-4xl border border-dashed border-gray-200 dark:border-white/10 transition-colors">
          <div className="size-20 rounded-full bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 text-gray-200 dark:text-white/10">
            <span className="material-symbols-outlined text-5xl">event_busy</span>
          </div>
          <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Nenhuma escala reservada</p>
          <button 
             onClick={() => window.location.hash = '#/'}
             className="mt-6 text-mint font-black text-sm uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
             Reservar agora
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {myBookings.map(booking => {
            const slot = schedules.find(s => s.id === booking.schedule_id);
            if (!slot) return null;
            return (
              <div key={booking.id} className="bg-white dark:bg-dark-surface rounded-4xl shadow-soft border border-gray-100 dark:border-white/5 overflow-hidden group transition-all">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-2xl font-black text-navy dark:text-white capitalize tracking-tight mb-1">{formatDateBR(slot.data_sabado)}</h4>
                      <p className="text-mint font-bold text-xs uppercase tracking-[0.2em]">Culto de Adoração</p>
                    </div>
                    <span className="text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest bg-mint/10 text-mint border border-mint/20">
                      Confirmado
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 dark:bg-white/5 p-6 rounded-3xl border border-gray-100 dark:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-xl bg-white dark:bg-dark-surface flex items-center justify-center text-navy dark:text-mint shadow-sm">
                        <span className="material-symbols-outlined material-symbols-fill text-xl">schedule</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Horário</p>
                        <p className="text-base font-black text-navy dark:text-white">{slot.hora_inicio} - {slot.hora_fim}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="size-11 rounded-xl bg-white dark:bg-dark-surface flex items-center justify-center text-navy dark:text-mint shadow-sm">
                        <span className="material-symbols-outlined material-symbols-fill text-xl">person</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responsável</p>
                        <p className="text-base font-black text-navy dark:text-white truncate max-w-[140px]">{booking.banda_name || booking.user_name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button 
                      onClick={() => handleCancel(booking.id)}
                      disabled={loading}
                      className="flex-1 px-6 py-4 text-[10px] font-black rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-50 transition-all uppercase tracking-[0.2em] shadow-lg shadow-red-500/5 active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? 'Cancelando...' : 'Cancelar Reserva'}
                    </button>
                    <button className="flex items-center justify-center size-14 rounded-2xl bg-gray-50 dark:bg-white/5 text-navy dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-white/10 active:scale-95 shadow-sm">
                      <span className="material-symbols-outlined text-2xl">share</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyScales;
