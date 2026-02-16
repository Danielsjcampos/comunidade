
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarSelectorProps {
  onSelect: (date: string) => void;
  onClose: () => void;
  selectedDate?: string;
  availableDates?: string[];
}

const CalendarSelector: React.FC<CalendarSelectorProps> = ({ 
  onSelect, 
  onClose, 
  selectedDate,
  availableDates = []
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const days = daysInMonth(year, month);
  const offset = firstDayOfMonth(year, month);

  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long' });

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const [sYear, sMonth, sDay] = selectedDate.split('-').map(Number);
    return sDay === day && sMonth === (month + 1) && sYear === year;
  };

  const isAvailable = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availableDates.includes(dateStr);
  };

  const isSaturday = (day: number) => {
    return new Date(year, month, day).getDay() === 6;
  };

  const dayElements = [];
  for (let i = 0; i < offset; i++) {
    dayElements.push(<div key={`empty-${i}`} className="h-10 w-10" />);
  }

  for (let d = 1; d <= days; d++) {
    const available = isAvailable(d);
    const selected = isSelected(d);
    const saturday = isSaturday(d);
    const today = isToday(d);

    dayElements.push(
      <button
        key={d}
        onClick={() => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          onSelect(dateStr);
        }}
        className={`
          relative h-12 w-12 flex items-center justify-center rounded-2xl text-sm font-bold transition-all
          ${selected ? 'bg-mint text-navy shadow-lg shadow-mint/20 scale-110 z-10' : ''}
          ${!selected && available ? 'bg-navy/5 dark:bg-mint/10 text-navy dark:text-mint border border-mint/20' : ''}
          ${!selected && !available && saturday ? 'text-gray-400 dark:text-white/40' : ''}
          ${!selected && !available && !saturday ? 'text-gray-300 dark:text-white/10 opacity-50' : ''}
          ${today && !selected ? 'ring-2 ring-blue-400 ring-offset-2 dark:ring-offset-dark-surface' : ''}
          hover:scale-105 active:scale-95
        `}
      >
        {d}
        {available && !selected && (
          <div className="absolute bottom-1.5 size-1 bg-mint rounded-full" />
        )}
      </button>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="bg-white dark:bg-dark-surface p-8 rounded-[40px] shadow-2xl border border-gray-100 dark:border-white/5 w-full max-w-sm transition-colors"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h4 className="text-2xl font-black text-navy dark:text-white capitalize leading-none">{monthName}</h4>
          <p className="text-gray-400 dark:text-white/20 font-bold text-xs uppercase tracking-widest mt-1">{year}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="size-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={handleNextMonth} className="size-10 flex items-center justify-center rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
          <button onClick={onClose} className="size-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-500 transition-colors ml-2">
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
          <div key={d} className="h-10 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-white/20">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dayElements}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 flex items-center gap-4 transition-colors">
        <div className="size-10 rounded-2xl bg-mint/20 flex items-center justify-center text-mint">
           <span className="material-symbols-outlined text-xl">event_upcoming</span>
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 dark:text-white/20 uppercase tracking-widest">Dica</p>
          <p className="text-xs font-bold text-navy dark:text-white leading-tight">Os círculos verdes indicam datas com horários liberados para reserva.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarSelector;
