import axios from 'axios';
const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://167.86.107.54:8081"

// ── API principale ────────────────────────────────────────────

/* export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://167.86.107.54/api'; */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.safalu-ci.com/api';
 

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safalu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('safalu_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ── API WhatsApp ──────────────────────────────────────────────

//export const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL ?? 'http://167.86.107.54:9090';

export const whatsappClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://messagerie-whatsappdotnetapi-agds3c:8080',
  headers: {
    'Content-Type': 'application/json',
    // ⚠️ NE PAS mettre la clé ici côté frontend!
  },
});
whatsappClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safalu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Interceptor pour les erreurs
whatsappClient.interceptors.response.use(
  
  (response) => response,
  (error) => {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
export default whatsappClient;
// ── API publique (sans auth) — pour les pages fournisseurs ───

export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,   // même URL que apiClient : http://167.86.107.54/api
  headers: {
    'Content-Type': 'application/json',
  },
  // Pas d'intercepteur auth, pas de redirection 401
});