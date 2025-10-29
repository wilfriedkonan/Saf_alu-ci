// services/devisService.ts

import axios, { AxiosResponse } from 'axios';
import {
  SousTraitant,
  CreateSousTraitantRequest,
  CreateEvaluationRequest,
  ApiResponse,
  SousTraitantListResponse,
  UpdateSousTraitantRequest,
  Specialite
} from '@/types/sous-traitants';

// Configuration axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5264/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export class SousTraitantService {

  /**
   * Récupère tous les devis
   */
  static async getAllSoustraitants(): Promise<SousTraitant[]> {
    try {
      console.log("Récupération des SousTraitants")
      const response: AxiosResponse<any[]> = await apiClient.get('/SousTraitants');
      console.log('Reponse: ', response.data)
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des SousTraitants:', error);
      throw this.handleError(error);
    }
  }

  static async getAllSpecialite(): Promise<Specialite[]> {
    try {
      const response: AxiosResponse<Specialite[]> = await apiClient.get('/SousTraitants/specialites');
      return response.data;

    } catch (error) {
      console.error('Erreur lors de la récupération des specialités:', error);
      throw this.handleError(error);
    }

  }

  /**
   * Récupère un SousTraitantspar son ID
   */
  static async getSoustraitantsById(id: number): Promise<SousTraitant> {
    try {
      const response: AxiosResponse<SousTraitant> = await apiClient.get(`/SousTraitants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du SousTraitants${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau devis
   */
  static async createSoustraitants(devisData: CreateSousTraitantRequest): Promise<ApiResponse<SousTraitant>> {
    try {
      const response: AxiosResponse<ApiResponse<SousTraitant>> = await apiClient.post('/SousTraitants', devisData);
      console.log('Reponse neDevisData:', response)

      return response.data;
    } catch (error) {
      console.log('Retour de service SousTraitants:')

      console.error('Erreur lors de la création du devis:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un SousTraitantsexistant
   */
  static async updateSoustraitants(id: number, devisData: UpdateSousTraitantRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/SousTraitants/${id}`, devisData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du SousTraitants ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime un SousTraitants
   */
  static async deleteSoustraitants(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/SousTraitants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du SousTraitants${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques des devis
   */
  static async getStatistiqueSoustraitants(): Promise<{
    total: number;
    brouillon: number;
    envoye: number;
    enNegociation: number;
    valide: number;
    refuse: number;
    expire: number;
    montantTotal: number;
    montantValide: number;
  }> {
    try {
      const response = await apiClient.get('/devis/statistiques');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
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

// Hook personnalisé pour utiliser le service de devis
export const useSousTraitantService = () => {
  return {
    getAllSousTraitants: SousTraitantService.getAllSoustraitants,
    getSousTraitantsById: SousTraitantService.getSoustraitantsById,
    createSousTraitants: SousTraitantService.createSoustraitants,
    updateSousTraitants: SousTraitantService.updateSoustraitants,
    deleteSousTraitants: SousTraitantService.deleteSoustraitants,
    getStatistiquesSousTraitants: SousTraitantService.getStatistiqueSoustraitants,
    getListeSpecialites : SousTraitantService.getAllSpecialite,
  };
};