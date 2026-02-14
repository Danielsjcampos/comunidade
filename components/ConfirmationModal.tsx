
import React from 'react';
import { Schedule } from '../types';
import { formatDateShort } from '../utils';

interface Props {
  slot: Schedule;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
}

const ConfirmationModal: React.FC<Props> = ({ slot, onClose, onConfirm, loading = false }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-navy/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white dark:bg-dark-surface rounded-4xl shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/5 transition-colors">
        <div className="size-20 bg-mint rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-mint/20">
          <span className="material-symbols-outlined text-navy text-4xl font-bold">event_available</span>
        </div>
        
        <h3 className="text-navy dark:text-white text-2xl font-black leading-tight px-2 mb-4 transition-colors">
          Confirmar reserva para {formatDateShort(slot.data_sabado)} às {slot.hora_inicio}?
        </h3>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium leading-relaxed px-4 transition-colors">
          Ao confirmar, este horário será bloqueado para outras bandas e seu grupo será oficialmente escalado para o culto.
        </p>
        
        <div className="flex flex-col w-full gap-3 mt-8">
          <button 
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-navy dark:bg-mint text-white dark:text-navy font-black py-5 px-4 rounded-2xl shadow-lg shadow-navy/10 hover:bg-navy/90 dark:hover:bg-mint/90 active:scale-[0.98] transition-all text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Confirmar Reserva</span>
            )}
          </button>
          <button 
            onClick={onClose}
            disabled={loading}
            className="w-full bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-white/20 font-black py-4 px-4 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-[10px] uppercase tracking-[0.2em] disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
