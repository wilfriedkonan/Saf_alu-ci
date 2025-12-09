// lib/api/parametresService.ts

import axios, { AxiosResponse } from 'axios';

// Configuration axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL /* || 'http://localhost:5264/api' */;

const apiClient = axios.create({
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
      // Token expiré ou invalide
      localStorage.removeItem('safalu_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Types pour les réponses API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

// Types pour les rôles
export interface Role {
  id: number;
  nom: string;
  description?: string;
  permissions?: string[];
  dateCreation?: string;
  actif: boolean;
  nombreUtilisateurs?: number;
}

export interface CreateRoleRequest {
  nom: string;
  description?: string;
  permissions?: string[];
  actif?: boolean;
}

export interface UpdateRoleRequest {
  id: number;
  nom: string;
  description?: string;
  permissions?: string[];
  actif: boolean;
}

// Types pour les paramètres système
export interface Parametre {
  id: number;
  cle: string;
  valeur?: string;
  typeValeur?: string;
  description?: string;
  categorie?: string;
  dateModification?: string;
  utilisateurModification?: number;
}

export interface ParametresByCategorie {
  categorie: string;
  parametres: Parametre[];
}

export interface UpdateParametreRequest {
  Cle: string;
  Valeur: string;
}

// Types pour la recherche
export interface SearchUtilisateursRequest {
  SearchTerm?: string;
  RoleFilter?: string;
  StatusFilter?: boolean;
  PageNumber?: number;
  PageSize?: number;
}

export interface UtilisateurResponse {
  id: number;
  email: string;
  username: string;
  prenom: string;
  nom: string;
  nomComplet: string;
  telephone?: string;
  roleId: number;
  roleName?: string;
  roleDescription?: string;
  photo?: string;
  derniereConnexion?: string;
  dateCreation?: string;
  actif: boolean;
}

export interface SearchUtilisateursResponse {
 utilisateurs: UtilisateurResponse[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
}

// Types pour les statistiques
export interface StatistiquesUtilisateurs {
  totalUtilisateurs: number;
  utilisateursActifs: number;
  utilisateursInactifs: number;
  connexionsRecentes: number;
  parRole: StatistiqueParRole[];
}

export interface StatistiqueParRole {
  roleName: string;
  roleDescription?: string;
  nombreUtilisateurs: number;
  utilisateursActifs: number;
  connexionsRecentes: number;
}

export interface PermissionsGrouped {
  [category: string]: string[];
}

// Service avec classe statique (style ProjetService)
export class ParametresService {
  
  // ==========================================
  // GESTION DES RÔLES
  // ==========================================

  /**
   * Récupère tous les rôles avec statistiques
   */
  static async getAllRoles(): Promise<Role[]> {
    try {
      console.log("Récupération des rôles");
      const response: AxiosResponse<ApiResponse<Role[]>> = await apiClient.get('/parametres/roles');
      console.log('Réponse:', response.data);
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des rôles:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un rôle par son ID
   */
  static async getRoleById(id: number): Promise<Role> {
    try {
      const response: AxiosResponse<ApiResponse<Role>> = await apiClient.get(`/parametres/roles/${id}`);
      console.log('Fetch data:', response.data);
      if (!response.data.data) throw new Error('Rôle non trouvé');
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du rôle ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau rôle
   */
  static async createRole(data: CreateRoleRequest): Promise<Role> {
    try {
      const response: AxiosResponse<ApiResponse<Role>> = await apiClient.post('/parametres/roles', data);
      console.log('Réponse createRole:', response);
      if (!response.data.data) throw new Error('Erreur lors de la création');
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la création du rôle:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un rôle existant
   */
  static async updateRole(id: number, data: UpdateRoleRequest): Promise<Role> {
    try {
      const response: AxiosResponse<ApiResponse<Role>> = await apiClient.put(`/parametres/roles/${id}`, data);
      if (!response.data.data) throw new Error('Erreur lors de la mise à jour');
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du rôle ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime un rôle
   */
  static async deleteRole(id: number): Promise<void> {
    try {
      await apiClient.delete(`/parametres/roles/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du rôle ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère la liste simple des rôles
   */
  static async getRolesList(): Promise<any[]> {
    try {
      const response: AxiosResponse<ApiResponse<any[]>> = await apiClient.get('/parametres/roles/liste');
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération de la liste des rôles:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================
  // RECHERCHE UTILISATEURS
  // ==========================================

  /**
   * Recherche avancée d'utilisateurs avec pagination
   */
  static async searchUtilisateurs(params: SearchUtilisateursRequest): Promise<SearchUtilisateursResponse> {
    try {
      const response: AxiosResponse<ApiResponse<SearchUtilisateursResponse>> = await apiClient.post(
        '/parametres/utilisateurs/search',
        params
      );
      return response.data.data || {
        utilisateurs: [],
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1
      };
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================
  // STATISTIQUES
  // ==========================================

  /**
   * Récupère les statistiques détaillées des utilisateurs
   */
  static async getStatistiquesUtilisateurs(): Promise<StatistiquesUtilisateurs> {
    try {
      console.log('Récupération des statistiques utilisateurs');
      const response: AxiosResponse<ApiResponse<StatistiquesUtilisateurs>> = await apiClient.get(
        '/parametres/utilisateurs/statistiques'
      );
      return response.data.data || {
        totalUtilisateurs: 0,
        utilisateursActifs: 0,
        utilisateursInactifs: 0,
        connexionsRecentes: 0,
        parRole: []
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques par rôle
   */
  static async getStatistiquesRoles(): Promise<Record<string, number>> {
    try {
      const response: AxiosResponse<ApiResponse<Record<string, number>>> = await apiClient.get(
        '/parametres/statistiques/roles'
      );
      return response.data.data || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques par rôle:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================
  // PARAMÈTRES SYSTÈME
  // ==========================================

  /**
   * Récupère tous les paramètres système
   */
  static async getAllParametres(): Promise<Parametre[]> {
    try {
      const response: AxiosResponse<ApiResponse<Parametre[]>> = await apiClient.get('/parametres/systeme');
      
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les paramètres groupés par catégorie
   */
  static async getParametresByCategorie(): Promise<ParametresByCategorie[]> {
    try {
      const response: AxiosResponse<ApiResponse<ParametresByCategorie[]>> = await apiClient.get(
        '/parametres/systeme/categories'
      );
      console.log('Debug Parametre: ',response.data.data)
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres par catégorie:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un paramètre par sa clé
   */
  static async getParametreByKey(cle: string): Promise<Parametre> {
    try {
      const response: AxiosResponse<ApiResponse<Parametre>> = await apiClient.get(`/parametres/systeme/${cle}`);
      if (!response.data.data) throw new Error('Paramètre non trouvé');
      return response.data.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du paramètre ${cle}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un paramètre système
   */
  static async updateParametre(data: UpdateParametreRequest): Promise<Parametre> {
    try {
      const response: AxiosResponse<ApiResponse<Parametre>> = await apiClient.put('/parametres/systeme', data);
      if (!response.data.data) throw new Error('Erreur lors de la mise à jour');
      return response.data.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du paramètre:', error);
      throw this.handleError(error);
    }
  }

  // ==========================================
  // UTILITAIRES
  // ==========================================

  /**
   * Récupère toutes les permissions disponibles
   */
  static async getAllPermissions(): Promise<PermissionsGrouped> {
    try {
      const response: AxiosResponse<ApiResponse<PermissionsGrouped>> = await apiClient.get('/parametres/permissions');
      return response.data.data || {};
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Gestion centralisée des erreurs
   */
  private static handleError(error: any): Error {
    let message = 'Une erreur inattendue s\'est produite';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Erreur de réponse du serveur
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            message = data?.message || 'Données invalides';
            break;
          case 401:
            message = 'Non autorisé - Veuillez vous reconnecter';
            break;
          case 403:
            message = 'Accès interdit';
            break;
          case 404:
            message = 'Ressource non trouvée';
            break;
          case 409:
            message = 'Conflit - La ressource existe déjà';
            break;
          case 422:
            message = data?.message || 'Données non valides';
            break;
          case 500:
            message = 'Erreur serveur interne';
            break;
          default:
            message = data?.message || `Erreur ${status}`;
        }
      } else if (error.request) {
        // Erreur de réseau
        message = 'Erreur de connexion - Vérifiez votre réseau';
      }
    }
    
    return new Error(message);
  }
}

// Hook personnalisé pour utiliser le service de paramètres (style ProjetService)
export const useParametresService = () => {
  return {
    getAllRoles: ParametresService.getAllRoles,
    getRoleById: ParametresService.getRoleById,
    createRole: ParametresService.createRole,
    updateRole: ParametresService.updateRole,
    deleteRole: ParametresService.deleteRole,
    getRolesList: ParametresService.getRolesList,
    searchUtilisateurs: ParametresService.searchUtilisateurs,
    getStatistiquesUtilisateurs: ParametresService.getStatistiquesUtilisateurs,
    getStatistiquesRoles: ParametresService.getStatistiquesRoles,
    getAllParametres: ParametresService.getAllParametres,
    getParametresByCategorie: ParametresService.getParametresByCategorie,
    getParametreByKey: ParametresService.getParametreByKey,
    updateParametre: ParametresService.updateParametre,
    getAllPermissions: ParametresService.getAllPermissions,
  };
};

// Export default pour compatibilité
export default ParametresService;