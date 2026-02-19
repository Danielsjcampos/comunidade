import { User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:3001/api' : '/api');


export const api = {
  // Auth
  async login(email: string, senha: string) {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');
    return data;
  },

  async register(userData: { nome: string; email: string; telefone: string; senha: string; banda?: string; token?: string }) {
    const res = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');
    return data;
  },

  async updateProfile(userId: string, profileData: Partial<User>) {
    const res = await fetch(`${API_URL}/profile/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar perfil');
    return data;
  },

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer upload da imagem');
    return data;
  },

  // Schedules
  async getSchedules() {
    const res = await fetch(`${API_URL}/schedules`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar horários');
    return data;
  },

  // Bookings
  async getBookings() {
    const res = await fetch(`${API_URL}/bookings`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar reservas');
    return data;
  },

  async createBooking(userId: string, scheduleId: string) {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, schedule_id: scheduleId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao reservar');
    return data;
  },

  async cancelBooking(bookingId: string, userId: string) {
    const res = await fetch(`${API_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao cancelar');
    return data;
  },

  // Admin
  async getUsers() {
    const res = await fetch(`${API_URL}/admin/users`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao carregar usuários');
    return data;
  },

  async generateInvite(userId: string) {
    const res = await fetch(`${API_URL}/admin/invite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao gerar convite');
    return data;
  },

  async createSchedule(userId: string, scheduleData: { data_sabado: string; hora_inicio: string; hora_fim: string }) {
    const res = await fetch(`${API_URL}/admin/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, ...scheduleData })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar horário');
    return data;
  },

  async updateAdminUser(adminId: string, targetId: string, updateData: Partial<User>) {
    const res = await fetch(`${API_URL}/admin/users/${targetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id: adminId, ...updateData })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar usuário');
    return data;
  },

  async deleteUser(adminId: string, targetId: string) {
    const res = await fetch(`${API_URL}/admin/users/${targetId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id: adminId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao excluir usuário');
    return data;
  },

  // Health
  async healthCheck() {
    const res = await fetch(`${API_URL}/health`);
    return res.json();
  }
};
