// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

  register: async (userData) => {
    // userData deve ser { email, password, fullName }
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  registerVisitante: async (visitorData) => {
    const response = await apiClient.post('/auth/visitante/register', visitorData); // <-- Correto
    return response.data;
  },

  getMinhaViagem: async () => {
    const response = await apiClient.get('/visitante/minha-viagem');
    return response.data; // Retorna { viagem, perfil, gestor }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    console.log("Usuário deslogado.");
    return Promise.resolve();
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

  updateDespesaStatus: async ({ id, status }) => {
    const response = await apiClient.patch(`/despesas/${id}`, { status });
    return response.data;
  },

  deleteViagem: async (id) => {
    await apiClient.delete(`/viagens/${id}`);
    // A rota DELETE não retorna conteúdo, então não precisamos retornar nada
  },

  convidarVisitante: async ({ viagemId, email, cpf }) => {
    // Chama o novo endpoint que criamos no backend
    const response = await apiClient.post(`/viagens/${viagemId}/convidar`, { email, cpf });
    return response.data; // Retorna o convite criado (com o token)
  },

  getConvites: async (viagemId) => {
    const response = await apiClient.get(`/viagens/${viagemId}/convites`);
    return response.data; // Retorna a lista de convites
  },

  // ADICIONE ESTA NOVA FUNÇÃO DE UPLOAD
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file); // 'file' deve ser o mesmo nome usado no `upload.single('file')` do backend

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // Espera um retorno como { fileUrl: '...' }
  },

  getDespesaById: async (id) => {
    const response = await apiClient.get(`/despesas/${id}`);
    return response.data;
  },

  updateDespesa: async ({ id, ...data }) => {
    const response = await apiClient.patch(`/despesas/${id}`, data);
    return response.data;
  },

  deleteDespesa: async (id) => {
    await apiClient.delete(`/despesas/${id}`);
  },

  getTimelineDaViagem: async (viagemId) => {
    const response = await apiClient.get(`/viagens/${viagemId}/timeline`);
    return response.data; // Retorna a lista de eventos
  },

  createViagem: async (viagemData) => {
    // "viagemData" agora contém { origem, destino, ..., eventos: [] }
    const response = await apiClient.post('/viagens', viagemData);
    return response.data;
  },

  getFaixaPreco: async (destino) => {
    const response = await apiClient.get('/viagens/faixa-preco', {
      params: { destino } // Envia o destino como query param
    });
    return response.data; // Retorna { avg, min, max, count }
  },

  getComunicados: async (viagemId) => {
    const response = await apiClient.get(`/viagens/${viagemId}/comunicados`);
    return response.data;
  },

  createComunicado: async ({ viagemId, titulo, conteudo }) => {
    const response = await apiClient.post(`/viagens/${viagemId}/comunicados`, { titulo, conteudo });
    return response.data;
  },

  // --- Funções de Admin (NOVAS) ---
  adminGetUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  adminUpdateUserRole: async ({ id, role }) => {
    const response = await apiClient.patch(`/admin/users/${id}`, { role });
    return response.data;
  },
};