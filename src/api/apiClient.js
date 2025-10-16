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

  createDespesa: async (despesaData) => {
    const response = await apiClient.post('/despesas', despesaData);
    return response.data;
  },

  askChatbot: async (dados) => {
    // `dados` será um objeto como: { pergunta: "Qual o status da minha viagem?" }
    const response = await apiClient.post('/chatbot/ask', dados);
    return response.data; // Esperamos uma resposta como: { resposta: "..." }
  },
  
  getDespesas: async (viagemId) => {
    const response = await apiClient.get('/despesas', {
      params: { viagemId } // Envia o viagemId como um query param
    });
    return response.data;
  },

  getPendingDespesas: async () => {
    const response = await apiClient.get('/despesas/pendentes');
    return response.data;
  },

  updateDespesa: async ({ id, status }) => {
    const response = await apiClient.patch(`/despesas/${id}`, { status });
    return response.data;
  },
};