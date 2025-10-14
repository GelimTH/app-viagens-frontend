// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Funções que conversam com o nosso backend
export const api = {
  // --- Autenticação ---
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // --- Viagens (CRUD) ---
  createViagem: async (viagemData) => {
    const response = await apiClient.post('/viagens', viagemData);
    return response.data;
  },

  getViagens: async () => {
    const response = await apiClient.get('/viagens');
    return response.data;
  },

  getViagemById: async (id) => {
    const response = await apiClient.get(`/viagens/${id}`);
    return response.data;
  },

  // ESTA É A NOVA FUNÇÃO
  updateViagem: async ({ id, ...dadosDaViagem }) => {
    const response = await apiClient.patch(`/viagens/${id}`, dadosDaViagem);
    return response.data;
  },
};