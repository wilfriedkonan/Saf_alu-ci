// services/devisService.ts

import axios, { AxiosResponse } from 'axios';
import { 
  Devis, 
  DevisListItem, 
  CreateDevisRequest, 
  UpdateDevisRequest, 
  ApiResponse,
  DevisStatut 
} from '@/types/devis';
import apiClient from '@/lib/auth';



export class DevisService {
  
  /**
   * Récupère tous les devis
   */
  static async getAllDevis(): Promise<any[]> {
    try {console.log("Récupération des devis")
      const response: AxiosResponse<any[]> = await apiClient.get('/devis');
      console.log('Reponse: ',response.data)
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un devis par son ID
   */
  static async getDevisById(id: number): Promise<Devis> {
    try {
      const response: AxiosResponse<Devis> = await apiClient.get(`/devis/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du devis ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau devis
   */
  static async createDevis(devisData: CreateDevisRequest): Promise<ApiResponse<Devis>> {
    try {
      const response: AxiosResponse<ApiResponse<Devis>> = await apiClient.post('/devis', devisData);
      console.log('Reponse neDevisData:',response)

      return response.data;
    } catch (error) {      console.log('Retour de service devis :')

      console.error('Erreur lors de la création du devis:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un devis existant
   */
  static async updateDevis(id: number, devisData: UpdateDevisRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/devis/${id}`, devisData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du devis ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime un devis
   */
  static async deleteDevis(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/devis/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du devis ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Envoie un devis
   */
  static async envoyerDevis(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/devis/${id}/envoyer`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'envoi du devis ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Valide un devis
   */
  static async validerDevis(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/devis/${id}/valider`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la validation du devis ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Refuse un devis
   */
  static async refuserDevis(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/devis/${id}/refuser`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du refus du devis ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Duplique un devis
   */
  static async dupliquerDevis(id: number): Promise<ApiResponse<{ id: number }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ id: number }>> = await apiClient.post(`/devis/${id}/dupliquer`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la duplication du devis ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Exporte un devis en PDF
   */
  static async exporterDevisPDF(id: number): Promise<{ blob: Blob; filename?: string }> {
    try {
      const response: AxiosResponse<Blob> = await apiClient.get(`/devis/${id}/pdf`, {
        responseType: 'blob'
      });

      let filename: string | undefined
      const disposition = (response.headers as any)?.['content-disposition'] as string | undefined
      if (disposition) {
        const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(disposition)
        const encoded = match?.[1]
        const plain = match?.[2]
        if (encoded) filename = decodeURIComponent(encoded)
        else if (plain) filename = plain
      }

      return { blob: response.data, filename }
    } catch (error) {
      console.error(`Erreur lors de l'export PDF du devis ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Recherche des devis avec filtres
   */
  static async rechercherDevis(params: {
    search?: string;
    statut?: DevisStatut;
    clientId?: number;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    devis: DevisListItem[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get(`/devis/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de devis:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques des devis
   */
  static async getStatistiquesDevis(): Promise<{
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
export const useDevisService = () => {
  return {
    getAllDevis: DevisService.getAllDevis,
    getDevisById: DevisService.getDevisById,
    createDevis: DevisService.createDevis,
    updateDevis: DevisService.updateDevis,
    deleteDevis: DevisService.deleteDevis,
    envoyerDevis: DevisService.envoyerDevis,
    validerDevis: DevisService.validerDevis,
    refuserDevis: DevisService.refuserDevis,
    dupliquerDevis: DevisService.dupliquerDevis,
    exporterDevisPDF: DevisService.exporterDevisPDF,
    rechercherDevis: DevisService.rechercherDevis,
    getStatistiquesDevis: DevisService.getStatistiquesDevis,
  };
};