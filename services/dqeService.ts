// services/dqeService.ts

import axios, { AxiosResponse } from 'axios';
import {
  DQE,
  DQELot,
  DQEChapter,
  DQEItem,
  DQETemplate,
  CreateDQERequest,
  UpdateDQERequest,
  ValidateDQERequest,
  ConvertDQEToProjectRequest,
  ConversionPreviewResponse,
  CreateTemplateFromDQERequest,
  CreateDQEFromTemplateRequest,
  ExportDQERequest,
  ApiResponse,
  PaginatedResponse,
  DQEStatistiques,
  CanConvertResponse,
  ConversionSuccessResponse,
  DQESearchParams,
  DQEStatut,
  APIResponse,
} from '@/types/dqe';

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

export class DQEService {
  
  // ========================================
  // CRUD DE BASE
  // ========================================

  /**
   * Récupère tous les DQE avec filtres optionnels
   */
  static async getAllDQE(params?: {
    statut?: DQEStatut;
    isConverted?: boolean;
  }): Promise<DQE[]> {
    try {
      console.log('Récupération des DQE');
      
      const queryParams = new URLSearchParams();
      if (params?.statut) queryParams.append('statut', params.statut);
      if (params?.isConverted !== undefined) queryParams.append('isConverted', params.isConverted.toString());
      
      const url = queryParams.toString() ? `/DQE?${queryParams}` : '/DQE';
      const response: AxiosResponse<DQE[]> = await apiClient.get(url);
      
      console.log('Réponse:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des DQE:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un DQE par son ID avec structure complète
   */
  static async getDQEById(id: number): Promise<DQE> {
    try {
      console.log(`Récupération du DQE ${id}`);
      const response: AxiosResponse<DQE> = await apiClient.get(`/DQE/${id}`);
      console.log('Fetch data:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du DQE ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau DQE
   */
  static async createDQE(dqeData: CreateDQERequest): Promise<ApiResponse<{ id: number }>> {
    try {
      console.log('Création du DQE:', dqeData);
      const response: AxiosResponse<ApiResponse<{ id: number }>> = await apiClient.post('/DQE', dqeData);
      console.log('Réponse createDQE:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du DQE:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un DQE existant
   */
  static async updateDQE(id: number, dqeData: UpdateDQERequest): Promise<ApiResponse<void>> {
    try {
      console.log(`Mise à jour du DQE ${id}:`, dqeData);
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/DQE/${id}`, dqeData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du DQE ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime un DQE (soft delete)
   */
  static async deleteDQE(id: number): Promise<ApiResponse<void>> {
    try {
      console.log(`Suppression du DQE ${id}`);
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/DQE/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du DQE ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // VALIDATION
  // ========================================

  /**
   * Valide un DQE
   */
  static async validateDQE(id: number, data?: ValidateDQERequest): Promise<ApiResponse<void>> {
    try {
      console.log(`Validation du DQE ${id}`);
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(
        `/DQE/${id}/validate`,
        data || {}
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la validation du DQE ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // CONVERSION DQE → PROJET
  // ========================================

  /**
   * Vérifie si un DQE peut être converti en projet
   */
  static async canConvert(id: number): Promise<CanConvertResponse> {
    try {
      console.log(`Vérification conversion DQE ${id}`);
      const response: AxiosResponse<CanConvertResponse> = await apiClient.get(`/DQE/${id}/can-convert`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la vérification de conversion du DQE ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Génère une prévisualisation de la conversion DQE → Projet
   */
  static async getConversionPreview(
    id: number,
    request: ConvertDQEToProjectRequest
  ): Promise<ConversionPreviewResponse> {
    try {
      console.log(`Prévisualisation conversion DQE ${id}:`, request);
      const response: AxiosResponse<ConversionPreviewResponse> = await apiClient.post(
        `/DQE/${id}/conversion-preview`,
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la prévisualisation de conversion du DQE ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Convertit un DQE en projet
   */
  static async convertToProject(
    id: number,
    request: ConvertDQEToProjectRequest
  ): Promise<ConversionSuccessResponse> {
    try {
      console.log(`Conversion DQE ${id} en projet:`, request);
      const response: AxiosResponse<ConversionSuccessResponse> = await apiClient.post(
        `/DQE/${id}/convert-to-project`,
        request
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la conversion du DQE ${id} en projet:`, error);
      throw this.handleError(error);
    }
  }
  static async linkToExistingProject(dqeId: number, projetId: number): Promise<APIResponse<any>> {
    try {
      const response = await apiClient.post<APIResponse<any>>(
        `/DQE/${dqeId}/link-to-project/${projetId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  
  // ========================================
  // FILTRES SPÉCIALISÉS
  // ========================================

  /**
   * Récupère tous les DQE convertis
   */
  static async getConvertedDQE(): Promise<DQE[]> {
    try {
      console.log('Récupération des DQE convertis');
      const response: AxiosResponse<DQE[]> = await apiClient.get('/DQE/converted');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des DQE convertis:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère tous les DQE convertibles (validés et non convertis)
   */
  static async getConvertibleDQE(): Promise<DQE[]> {
    try {
      console.log('Récupération des DQE convertibles');
      const response: AxiosResponse<DQE[]> = await apiClient.get('/DQE/convertible');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des DQE convertibles:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère tous les DQE en brouillon
   */
  static async getBrouillonDQE(): Promise<DQE[]> {
    try {
      console.log('Récupération des DQE en brouillon');
      const response: AxiosResponse<DQE[]> = await apiClient.get('/DQE/brouillon');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des DQE en brouillon:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère tous les DQE validés
   */
  static async getValideDQE(): Promise<DQE[]> {
    try {
      console.log('Récupération des DQE validés');
      const response: AxiosResponse<DQE[]> = await apiClient.get('/DQE/valide');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des DQE validés:', error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // STATISTIQUES
  // ========================================

  /**
   * Récupère les statistiques globales des DQE
   */
  static async getStatistiquesDQE(): Promise<DQEStatistiques> {
    try {
      console.log('Récupération des statistiques DQE');
      const response: AxiosResponse<DQEStatistiques> = await apiClient.get('/DQE/stats');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // RECHERCHE ET FILTRES
  // ========================================

  /**
   * Recherche des DQE avec filtres avancés
   */
  static async rechercherDQE(params: DQESearchParams): Promise<PaginatedResponse<DQE>> {
    try {
      console.log('Recherche DQE avec params:', params);
      
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response: AxiosResponse<PaginatedResponse<DQE>> = await apiClient.get(
        `/DQE/search?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de DQE:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les DQE par client
   */
  static async getDQEByClient(clientId: number): Promise<DQE[]> {
    try {
      console.log(`Récupération des DQE du client ${clientId}`);
      const response: AxiosResponse<DQE[]> = await apiClient.get(`/DQE/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des DQE du client ${clientId}:`, error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // TEMPLATES
  // ========================================

  /**
   * Récupère tous les templates DQE
   */
  static async getTemplates(): Promise<DQETemplate[]> {
    try {
      console.log('Récupération des templates DQE');
      const response: AxiosResponse<DQETemplate[]> = await apiClient.get('/DQE/templates');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un template depuis un DQE
   */
  static async createTemplateFromDQE(data: CreateTemplateFromDQERequest): Promise<ApiResponse<{ id: number }>> {
    try {
      console.log('Création template depuis DQE:', data);
      const response: AxiosResponse<ApiResponse<{ id: number }>> = await apiClient.post(
        '/DQE/templates/from-dqe',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un DQE depuis un template
   */
  static async createDQEFromTemplate(data: CreateDQEFromTemplateRequest): Promise<ApiResponse<{ id: number }>> {
    try {
      console.log('Création DQE depuis template:', data);
      const response: AxiosResponse<ApiResponse<{ id: number }>> = await apiClient.post(
        '/DQE/from-template',
        data
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du DQE depuis template:', error);
      throw this.handleError(error);
    }
  }

  // ========================================
  // EXPORT
  // ========================================

  /**
   * Exporte un DQE en Excel
   */
  static async exportExcel(id: number): Promise<{ blob: Blob; filename?: string }> {
    try {
      console.log(`Export Excel du DQE ${id}`);
      const response: AxiosResponse<Blob> = await apiClient.get(`/DQE/${id}/export/excel`, {
        responseType: 'blob'
      });

      let filename: string | undefined;
      const disposition = (response.headers as any)?.['content-disposition'] as string | undefined;
      if (disposition) {
        const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(disposition);
        const encoded = match?.[1];
        const plain = match?.[2];
        if (encoded) filename = decodeURIComponent(encoded);
        else if (plain) filename = plain;
      }

      if (!filename) {
        filename = `DQE-${id}-${new Date().toISOString().split('T')[0]}.xlsx`;
      }

      return { blob: response.data, filename };
    } catch (error) {
      console.error(`Erreur lors de l'export Excel du DQE ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Exporte un DQE en PDF
   */
  static async exportPDF(id: number): Promise<{ blob: Blob; filename?: string }> {
    try {
      console.log(`Export PDF du DQE ${id}`);
      const response: AxiosResponse<Blob> = await apiClient.get(`/DQE/${id}/export/pdf`, {
        responseType: 'blob'
      });

      let filename: string | undefined;
      const disposition = (response.headers as any)?.['content-disposition'] as string | undefined;
      if (disposition) {
        const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(disposition);
        const encoded = match?.[1];
        const plain = match?.[2];
        if (encoded) filename = decodeURIComponent(encoded);
        else if (plain) filename = plain;
      }

      if (!filename) {
        filename = `DQE-${id}-${new Date().toISOString().split('T')[0]}.pdf`;
      }

      return { blob: response.data, filename };
    } catch (error) {
      console.error(`Erreur lors de l'export PDF du DQE ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Exporte un DQE avec options personnalisées
   */
  static async exportWithOptions(request: ExportDQERequest): Promise<{ blob: Blob; filename?: string }> {
    try {
      console.log('Export DQE avec options:', request);
      const endpoint = request.format === 'excel' 
        ? `/DQE/${request.dqeId}/export/excel`
        : `/DQE/${request.dqeId}/export/pdf`;
      
      const response: AxiosResponse<Blob> = await apiClient.post(endpoint, request.options, {
        responseType: 'blob'
      });

      let filename: string | undefined;
      const disposition = (response.headers as any)?.['content-disposition'] as string | undefined;
      if (disposition) {
        const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(disposition);
        const encoded = match?.[1];
        const plain = match?.[2];
        if (encoded) filename = decodeURIComponent(encoded);
        else if (plain) filename = plain;
      }

      const extension = request.format === 'excel' ? 'xlsx' : 'pdf';
      if (!filename) {
        filename = `DQE-${request.dqeId}-${new Date().toISOString().split('T')[0]}.${extension}`;
      }

      return { blob: response.data, filename };
    } catch (error) {
      console.error('Erreur lors de l\'export du DQE avec options:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Télécharge un fichier exporté
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // ========================================
  // DUPLICATION
  // ========================================

  /**
   * Duplique un DQE
   */
  static async duplicateDQE(id: number, nouveauNom?: string): Promise<ApiResponse<{ id: number }>> {
    try {
      console.log(`Duplication du DQE ${id}`);
      const response: AxiosResponse<ApiResponse<{ id: number }>> = await apiClient.post(
        `/DQE/${id}/duplicate`,
        { nouveauNom }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la duplication du DQE ${id}:`, error);
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
            message = 'DQE non trouvé';
            break;
          case 409:
            message = 'Conflit - Le DQE existe déjà ou a déjà été converti';
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

// Export par défaut
export default DQEService;