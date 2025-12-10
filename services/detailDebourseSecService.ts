// services/detailDebourseSecService.ts

import axios, { AxiosResponse } from 'axios';
import {
  DQEDetailDebourseSec,
  CreateDetailDebourseSecRequest,
  UpdateDetailDebourseSecRequest,
  RecapitulatifDebourseSecResponse,
  DebourseStatistics,
  ApiResponse,
  TypeDepense,
} from '@/types/dqe-debourse-sec';

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
      localStorage.removeItem('safalu_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export class DetailDebourseSecService {
  
  // ========================================
  // CRUD DÉTAILS DÉBOURSÉ SEC
  // ========================================

  /**
   * Récupère tous les détails d'un item
   */
  static async getByItemId(itemId: number): Promise<DQEDetailDebourseSec[]> {
    try {
      console.log(`Récupération détails déboursé pour item ${itemId}`);
      const response: AxiosResponse<ApiResponse<DQEDetailDebourseSec[]>> = 
        await apiClient.get(`/DetailDebourseSec/item/${itemId}`);
      
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur getByItemId:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un détail par son ID
   */
  static async getById(id: number): Promise<DQEDetailDebourseSec> {
    try {
      console.log(`Récupération détail déboursé ${id}`);
      const response: AxiosResponse<ApiResponse<DQEDetailDebourseSec>> = 
        await apiClient.get(`/DetailDebourseSec/${id}`);
      
      if (!response.data.data) {
        throw new Error('Détail non trouvé');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur getById:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau détail de déboursé
   */
  static async create(
    itemId: number, 
    data: CreateDetailDebourseSecRequest
  ): Promise<DQEDetailDebourseSec> {
    try {
      console.log('Création détail déboursé:', data);
      const response: AxiosResponse<ApiResponse<DQEDetailDebourseSec>> = 
        await apiClient.post(`/DetailDebourseSec/item/${itemId}`, data);
      
      if (!response.data.data) {
        throw new Error('Erreur lors de la création');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur create:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un détail de déboursé
   */
  static async update(
    id: number, 
    data: UpdateDetailDebourseSecRequest
  ): Promise<DQEDetailDebourseSec> {
    try {
      console.log(`Mise à jour détail ${id}:`, data);
      const response: AxiosResponse<ApiResponse<DQEDetailDebourseSec>> = 
        await apiClient.put(`/DetailDebourseSec/${id}`, data);
      
      if (!response.data.data) {
        throw new Error('Erreur lors de la mise à jour');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur update:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime un détail de déboursé
   */
  static async delete(id: number): Promise<boolean> {
    try {
      console.log(`Suppression détail ${id}`);
      const response: AxiosResponse<ApiResponse> = 
        await apiClient.delete(`/DetailDebourseSec/${id}`);
      
      return response.data.success;
    } catch (error) {
      console.error('Erreur delete:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime tous les détails d'un item
   */
  static async deleteAllByItemId(itemId: number): Promise<number> {
    try {
      console.log(`Suppression de tous les détails de l'item ${itemId}`);
      const response: AxiosResponse<ApiResponse<{ deletedCount: number }>> = 
        await apiClient.delete(`/DetailDebourseSec/item/${itemId}/all`);
      
      return response.data.data?.deletedCount || 0;
    } catch (error) {
      console.error('Erreur deleteAllByItemId:', error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // RÉCAPITULATIFS ET STATISTIQUES
  // ========================================

  /**
   * Récupère le récapitulatif des déboursés par type pour un item
   */
  static async getRecapitulatif(itemId: number): Promise<RecapitulatifDebourseSecResponse> {
    try {
      console.log(`Récapitulatif item ${itemId}`);
      const response: AxiosResponse<ApiResponse<RecapitulatifDebourseSecResponse>> = 
        await apiClient.get(`/DetailDebourseSec/item/${itemId}/recapitulatif`);
      
      if (!response.data.data) {
        throw new Error('Récapitulatif non disponible');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur getRecapitulatif:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques de déboursé d'un DQE complet
   */
  static async getDebourseStatistics(dqeId: number): Promise<DebourseStatistics> {
    try {
      console.log(`Statistiques déboursé DQE ${dqeId}`);
      const response: AxiosResponse<ApiResponse<DebourseStatistics>> = 
        await apiClient.get(`/DQE/${dqeId}/debourse-statistics`);
      
      if (!response.data.data) {
        throw new Error('Statistiques non disponibles');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur getDebourseStatistics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Copie les détails d'un item vers un autre
   */
  static async copyDetails(sourceItemId: number, targetItemId: number): Promise<number> {
    try {
      console.log(`Copie détails de ${sourceItemId} vers ${targetItemId}`);
      const response: AxiosResponse<ApiResponse<{ copiedCount: number }>> = 
        await apiClient.post(`/DetailDebourseSec/copy/${sourceItemId}/to/${targetItemId}`);
      
      return response.data.data?.copiedCount || 0;
    } catch (error) {
      console.error('Erreur copyDetails:', error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // TYPES DE DÉPENSE
  // ========================================

  /**
   * Récupère les types de dépense disponibles
   */
  static async getTypes(): Promise<{ value: TypeDepense; label: string }[]> {
    try {
      console.log('Récupération types de dépense');
      const response: AxiosResponse<ApiResponse<{ value: TypeDepense; label: string }[]>> = 
        await apiClient.get('/DetailDebourseSec/types');
      
      return response.data.data || [];
    } catch (error) {
      console.error('Erreur getTypes:', error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // DUPLICATION DQE
  // ========================================

  /**
   * Duplique un DQE avec tous ses déboursés
   */
  static async duplicateDQEWithDebourse(dqeId: number): Promise<{ dqeId: number; totalDetailsCopied: number }> {
    try {
      console.log(`Duplication DQE ${dqeId} avec déboursés`);
      const response: AxiosResponse<ApiResponse<{ dqeId: number; totalDetailsCopied: number }>> = 
        await apiClient.post(`/DQE/${dqeId}/duplicate-with-debourse`);
      
      if (!response.data.data) {
        throw new Error('Erreur lors de la duplication');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Erreur duplicateDQEWithDebourse:', error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // GESTION DES ERREURS
  // ========================================

  /**
   * Gestion centralisée des erreurs
   */
  private static handleError(error: any): Error {
    let message = 'Une erreur inattendue s\'est produite';
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            message = data?.message || data?.error || 'Données invalides';
            break;
          case 401:
            message = 'Non autorisé - Veuillez vous reconnecter';
            break;
          case 404:
            message = 'Ressource non trouvée';
            break;
          case 500:
            message = 'Erreur serveur interne';
            break;
          default:
            message = data?.message || data?.error || `Erreur ${status}`;
        }
      } else if (error.request) {
        message = 'Erreur de connexion - Vérifiez votre réseau';
      }
    }
    
    return new Error(message);
  }
}

export default DetailDebourseSecService;