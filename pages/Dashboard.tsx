
import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../App';
import { formatDateBR } from '../utils';
import ConfirmationModal from '../components/ConfirmationModal';
import CalendarSelector from '../components/CalendarSelector';
import { Schedule } from '../types';
import { AnimatePresence } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { schedules, bookings, addBooking, user, loading, refreshData } = useAuth();
  const [confirmingSlot, setConfirmingSlot] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const dateRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const groupedSchedules = useMemo(() => {
    return schedules.reduce((acc, s) => {
      if (!acc[s.data_sabado]) acc[s.data_sabado] = [];
      acc[s.data_sabado].push(s);
      return acc;
    }, {} as Record<string, Schedule[]>);
  }, [schedules]);

  const availableDates = useMemo(() => Object.keys(groupedSchedules), [groupedSchedules]);

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

  const scrollToDate = (date: string) => {
    const element = dateRefs.current[date];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Apply offset for header
      setTimeout(() => {
        window.scrollBy(0, -120);
      }, 300);
    }
    setSelectedDate(date);
    setShowCalendar(false);
  };

  const getBooking = (slotId: string) => bookings.find(b => b.schedule_id === slotId);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-10 animate-fade-in transition-colors pb-32">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sticky top-16 bg-background/80 dark:bg-dark-bg/80 backdrop-blur-md z-40 py-4 -mx-4 px-4">
        <div>
          <h1 className="text-4xl font-extrabold text-navy dark:text-white tracking-tight leading-none">Agenda de Sábados</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">Reserve o horário da sua banda para o próximo culto.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCalendar(true)}
            className="flex items-center gap-2 px-5 py-3.5 bg-navy dark:bg-mint text-white dark:text-navy font-black rounded-2xl shadow-lg shadow-navy/10 dark:shadow-mint/10 hover:scale-105 transition-all active:scale-95 whitespace-nowrap text-[10px] uppercase tracking-widest"
          >
            <span className="material-symbols-outlined text-xl">calendar_month</span>
            Escolher Data
          </button>
          <button 
            onClick={() => refreshData()}
            className="flex items-center justify-center size-12 bg-white dark:bg-dark-surface border border-gray-100 dark:border-white/5 rounded-2xl text-navy dark:text-white shadow-sm hover:shadow-md transition-all active:scale-95"
            title="Atualizar"
          >
            <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>sync</span>
          </button>
        </div>
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

      {/* Calendar Modal Modal */}
      <AnimatePresence>
        {showCalendar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/40 dark:bg-black/60 backdrop-blur-sm">
            <CalendarSelector 
              availableDates={availableDates}
              selectedDate={selectedDate || undefined}
              onSelect={scrollToDate}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Slots List */}
      <div className="grid grid-cols-1 gap-8">
        {schedules.length === 0 && !loading && (
          <div className="py-24 bg-white dark:bg-dark-surface rounded-3xl border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center transition-colors">
            <div className="size-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-gray-300 dark:text-white/20 text-5xl">event_busy</span>
            </div>
            <p className="text-gray-400 dark:text-white/40 font-bold uppercase tracking-widest text-sm">Nenhum horário liberado ainda</p>
          </div>
        )}

        {(Object.entries(groupedSchedules) as [string, Schedule[]][]).sort((a, b) => a[0].localeCompare(b[0])).map(([date, slots]) => {
          const isSelected = selectedDate === date;
          
          return (
            <section 
              key={date} 
              ref={el => dateRefs.current[date] = el}
              className={`bg-white dark:bg-dark-surface rounded-4xl border overflow-hidden transition-all duration-500 ${
                isSelected 
                  ? 'border-mint/50 shadow-mint/10 shadow-2xl scale-[1.02]' 
                  : 'border-gray-100 dark:border-white/5 shadow-soft'
              }`}
            >
              <div className={`px-8 py-6 flex justify-between items-center relative overflow-hidden transition-colors ${isSelected ? 'bg-mint' : 'bg-navy'}`}>
                 {/* Decorative Church Icon */}
                 <span className={`material-symbols-outlined absolute -right-4 -bottom-4 !text-8xl select-none transition-colors ${isSelected ? 'text-navy/5' : 'text-white/5'}`}>church</span>
                
                <div className="relative z-10">
                  <h3 className={`font-extrabold text-2xl capitalize transition-colors ${isSelected ? 'text-navy' : 'text-white'}`}>{formatDateBR(date)}</h3>
                  <p className={`text-sm font-medium transition-colors ${isSelected ? 'text-navy/60' : 'text-white/60'}`}>Culto de Adoração</p>
                </div>
                <div className={`${isSelected ? 'bg-navy/10' : 'bg-white/10'} px-4 py-2 rounded-2xl flex items-center gap-2 relative z-10 transition-colors`}>
                  <span className={`material-symbols-outlined text-sm material-symbols-fill transition-colors ${isSelected ? 'text-navy' : 'text-mint'}`}>calendar_month</span>
                  <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${isSelected ? 'text-navy' : 'text-white'}`}>Sábado</span>
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.sort((a,b) => a.hora_inicio.localeCompare(b.hora_inicio)).map(slot => {
                  const booking = getBooking(slot.id);
                  const isMyBooking = booking?.user_id === user?.id;
                  
                  return (
                    <div 
                      key={slot.id} 
                      className={`p-6 rounded-3xl flex flex-col justify-between h-56 transition-all relative overflow-hidden ${
                        booking 
                          ? 'bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5' 
                          : 'bg-white dark:bg-dark-surface border-2 border-transparent hover:border-mint/30 shadow-sm hover:shadow-soft active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-3xl font-black text-navy dark:text-white">{slot.hora_inicio}</span>
                          <span className="text-gray-400 dark:text-white/40 text-[10px] font-black uppercase tracking-widest mt-0.5">até {slot.hora_fim}</span>
                        </div>
                        {isMyBooking && (
                          <div className="size-9 bg-mint rounded-full flex items-center justify-center text-navy shadow-lg shadow-mint/20 animate-float translate-x-2 -translate-y-2">
                            <span className="material-symbols-outlined text-xl font-black">check</span>
                          </div>
                        )}
                      </div>
  
                      <div className="mt-4 flex items-center gap-4">
                        {booking ? (
                          <>
                            <div className="size-14 rounded-2xl bg-gray-200 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-gray-300 dark:border-white/10 shrink-0">
                              {booking.photo_url ? (
                                <img src={booking.photo_url.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${booking.photo_url}` : booking.photo_url} alt="Banda" className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-gray-400 dark:text-white/20 text-3xl">music_note</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Ocupado por</p>
                              <p className="text-navy dark:text-white font-extrabold text-sm truncate">{booking.banda_name || booking.user_name}</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center gap-4">
                             <div className="size-14 rounded-2xl bg-mint/5 border-2 border-dashed border-mint/20 flex items-center justify-center shrink-0">
                               <span className="material-symbols-outlined text-mint/40">add</span>
                             </div>
                             <div>
                              <p className="text-[10px] font-black text-mint uppercase tracking-widest">Disponível</p>
                              <p className="text-gray-400 dark:text-white/40 font-bold text-xs">Aberto para reserva</p>
                            </div>
                          </div>
                        )}
                      </div>
  
                      <div className="mt-4">
                        {booking ? (
                          <div className="w-full bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-white/20 font-black py-3.5 px-4 rounded-2xl text-[10px] text-center uppercase tracking-[0.2em] cursor-not-allowed border border-gray-200 dark:border-white/10 transition-colors">
                            Indisponível
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleReserve(slot.id)}
                            disabled={loading}
                            className="w-full bg-navy dark:bg-mint hover:scale-[1.02] text-white dark:text-navy font-black py-3.5 px-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-navy/10 dark:shadow-mint/10 transition-all active:scale-95 disabled:opacity-50"
                          >
                            Reservar agora
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
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
