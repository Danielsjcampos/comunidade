
export interface User {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  banda?: string;
  role?: 'admin' | 'user';
}

export interface Schedule {
  id: string;
  data_sabado: string; // ISO date string
  hora_inicio: string;
  hora_fim: string;
  vagas_totais: number;
}

export interface Booking {
  id: string;
  user_id: string;
  schedule_id: string;
  created_at: string;
  status: 'confirmado' | 'pendente';
  user_name?: string;
  banda_name?: string;
}

export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  bookings: Booking[];
  schedules: Schedule[];
}
