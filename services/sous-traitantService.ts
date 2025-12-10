// services/sous-traitantService.ts

import axios, { AxiosResponse } from 'axios';
import {
  SousTraitant,
  CreateSousTraitantRequest,
  CreateEvaluationRequest,
  ApiResponse,
  SousTraitantListResponse,
  UpdateSousTraitantRequest,
  Specialite,
  EvaluationSousTraitant
} from '@/types/sous-traitants';

// Configuration axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ; // || 'http://localhost:5264/api' ;;

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

export class SousTraitantService {

  /**
   * Récupère tous les sous-traitants
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

  /**
   * Récupère toutes les spécialités
   */
  static async getAllSpecialite(): Promise<Specialite[]> {
    try {
      const response: AxiosResponse<Specialite[]> = await apiClient.get('/SousTraitants/specialites');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des spécialités:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un sous-traitant par son ID
   */
  static async getSoustraitantsById(id: number): Promise<SousTraitant> {
    try {
      const response: AxiosResponse<SousTraitant> = await apiClient.get(`/SousTraitants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du SousTraitant ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau sous-traitant
   */
  static async createSoustraitants(sousTraitantData: CreateSousTraitantRequest): Promise<ApiResponse<SousTraitant>> {
    try {
      const response: AxiosResponse<ApiResponse<SousTraitant>> = await apiClient.post('/SousTraitants', sousTraitantData);
      console.log('Réponse création SousTraitant:', response)
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du sous-traitant:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un sous-traitant existant
   */
  static async updateSoustraitants(id: number, sousTraitantData: UpdateSousTraitantRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/SousTraitants/${id}`, sousTraitantData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du SousTraitant ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime un sous-traitant
   */
  static async deleteSoustraitants(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/SousTraitants/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du SousTraitant ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // ✅ NOUVELLES MÉTHODES POUR LES ÉVALUATIONS
  // ========================================

  /**
   * Crée une évaluation pour un sous-traitant
   */
  static async createEvaluation(sousTraitantId: number, evaluationData: CreateEvaluationRequest): Promise<ApiResponse<EvaluationSousTraitant>> {
    try {
      console.log('Création évaluation:', { sousTraitantId, evaluationData });
      
      const response: AxiosResponse<ApiResponse<EvaluationSousTraitant>> = await apiClient.post(
        `/SousTraitants/${sousTraitantId}/evaluations`,
        evaluationData
      );
      
      console.log('Réponse création évaluation:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création de l'évaluation pour le sous-traitant ${sousTraitantId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère toutes les évaluations d'un sous-traitant
   */
  static async getEvaluationsBySousTraitant(
    sousTraitantId: number, 
    page: number = 1, 
    pageSize: number = 10
  ): Promise<{
    evaluations: EvaluationSousTraitant[];
    totalEvaluations: number;
    noteMoyenne: number;
    page: number;
    pageSize: number;
  }> {
    try {
      const response = await apiClient.get(`/SousTraitants/${sousTraitantId}/evaluations`, {
        params: { page, pageSize }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des évaluations du sous-traitant ${sousTraitantId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les sous-traitants recommandés pour une spécialité
   */
  static async getRecommandations(specialiteId?: number, noteMin: number = 3.0): Promise<SousTraitant[]> {
    try {
      const params: any = { noteMin };
      if (specialiteId) {
        params.specialiteId = specialiteId;
      }

      const response: AxiosResponse<SousTraitant[]> = await apiClient.get('/SousTraitants/recommandations', {
        params
      });
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des recommandations:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques des sous-traitants
   */
  static async getStatistiqueSoustraitants(): Promise<{
    totalSousTraitants: number;
    noteMoyenneGlobale: number;
    totalEvaluations: number;
    repartitionNotes: {
      excellent: number;
      tresBien: number;
      bien: number;
      passable: number;
      insuffisant: number;
      nonEvalue: number;
    };
    topSpecialites: any[];
    repartitionVilles: any[];
  }> {
    try {
      const response = await apiClient.get('/SousTraitants/statistiques');
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

// Hook personnalisé pour utiliser le service de sous-traitants
export const useSousTraitantService = () => {
  return {
    // Sous-traitants
    getAllSousTraitants: SousTraitantService.getAllSoustraitants,
    getSousTraitantsById: SousTraitantService.getSoustraitantsById,
    createSousTraitants: SousTraitantService.createSoustraitants,
    updateSousTraitants: SousTraitantService.updateSoustraitants,
    deleteSousTraitants: SousTraitantService.deleteSoustraitants,
    
    // Spécialités
    getListeSpecialites: SousTraitantService.getAllSpecialite,
    
    // ✅ Évaluations
    createEvaluation: SousTraitantService.createEvaluation,
    getEvaluationsBySousTraitant: SousTraitantService.getEvaluationsBySousTraitant,
    
    // Recommandations et statistiques
    getRecommandations: SousTraitantService.getRecommandations,
    getStatistiquesSousTraitants: SousTraitantService.getStatistiqueSoustraitants,
  };
};