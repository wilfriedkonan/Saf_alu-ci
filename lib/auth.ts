// lib/api.js - Configuration Axios centralisée
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5264/api';

// Instance Axios principale
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête pour ajouter le token automatiquement
apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer l'expiration du token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Token expiré, rediriger vers login
      if (typeof window !== 'undefined') {
        removeStoredToken();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Gestion du stockage du token (avec support SSR)
export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('safalu_token');
};

export const setStoredToken = (token: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('safalu_token', token);
  console.log('Token stocké:', localStorage.getItem('safalu_token'));
};

export const removeStoredToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('safalu_token');
  localStorage.removeItem('safalu_user');
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('safalu_user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: unknown) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('safalu_user', JSON.stringify(user));
};

export default apiClient;

// Service d'authentification (export nommé)
class AuthService {
  // Connexion utilisateur
  async login(email: string, password: string) {
    try {
      const response = await apiClient.post('/Utilisateurs/login', {
        email,
        password,
      });
      const { token, user } = response.data;
     
      // Stocker le token et les infos utilisateur
      setStoredToken(token);
      setStoredUser(user);

      return {
        success: true,
        data: { token, user },
        message: 'Connexion réussie'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur de connexion',
        status: error.response?.status
      };
    }
  }

  // Inscription utilisateur
  async register(userData: unknown) {
    try {
      const response = await apiClient.post('/Utilisateurs/register', userData);
      
      const { token, user } = response.data;
      // Connexion automatique après inscription
      setStoredToken(token);
      setStoredUser(user);

      return {
        success: true,
        data: { token, user },
        message: response.data.message || 'Inscription réussie'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de l\'inscription',
        status: error.response?.status
      };
    }
  }

  // Déconnexion
  logout() {
    removeStoredToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!getStoredToken();
  }

  // Obtenir l'utilisateur connecté
  getCurrentUser() {
    return getStoredUser();
  }

  // Obtenir le profil utilisateur depuis l'API
  async getProfile() {
    try {
      const response = await apiClient.get('/Utilisateurs/me');
      const user = response.data;
      // Mettre à jour les infos stockées
      setStoredUser(user);
      
      return {
        success: true,
        data: user
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors de la récupération du profil'
      };
    }
  }

  // Changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string) {
    try {
      const response = await apiClient.put('/Utilisateurs/change-password', {
        currentPassword,
        newPassword
      });

      return {
        success: true,
        message: response.data.message || 'Mot de passe changé avec succès'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du changement de mot de passe'
      };
    }
  }
}

export const authService = new AuthService();

// context/AuthContext.js - (contenu supprimé du fichier TS pour éviter les conflits)