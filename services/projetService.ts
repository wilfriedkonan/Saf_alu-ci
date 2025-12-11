// services/projetService.ts

import axios, { AxiosResponse } from 'axios';
import { 
  Project,
  ProjectStage,
  CreateProjetRequest, 
  UpdateAvancementRequest,
  ProjectStatus,
  TypeProjet
} from '@/types/projet';
import { apiClient } from '@/lib/api-config';


interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export class ProjetService {
  
  /**
   * Récupère tous les projets
   */
  static async getAllProjets(): Promise<Project[]> {
    try {
      console.log("Récupération des projets");
      const response: AxiosResponse<Project[]> = await apiClient.get('/Projets');
      console.log('Réponse:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un projet par son ID
   */
  static async getProjetById(id: number): Promise<Project> {
    try {
      const response: AxiosResponse<Project> = await apiClient.get(`/projets/${id}`);
      console.log('Fetch data :',response.data)
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du projet ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau projet
   */
  static async createProjet(projetData: CreateProjetRequest): Promise<ApiResponse<Project>> {
    try {
      const response: AxiosResponse<ApiResponse<Project>> = await apiClient.post('/projets', projetData);
      console.log('Réponse createProjet:', response);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un projet existant
   */
  static async updateProjet(id: number, projetData: Partial<CreateProjetRequest>): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Projets/${id}`, projetData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du projet ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime un projet
   */
  static async deleteProjet(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/projets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du projet ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour l'avancement d'un projet
   */
  static async updateAvancement(id: number, avancementData: UpdateAvancementRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/projets/${id}/avancement`, 
        avancementData
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'avancement du projet ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour le statut d'un projet
   */
  static async updateStatut(id: number, statut: ProjectStatus): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/projets/${id}/statut`, 
        { statut }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du statut du projet ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les étapes d'un projet
   */
  static async getEtapesProjet(projetId: number): Promise<ProjectStage[]> {
    try {
      const response: AxiosResponse<ProjectStage[]> = await apiClient.get(`/projets/${projetId}/etapes`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des étapes du projet ${projetId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Ajoute une étape à un projet
   */
  static async addEtape(projetId: number, etapeData: Partial<ProjectStage>): Promise<ApiResponse<ProjectStage>> {
    try {
      const response: AxiosResponse<ApiResponse<ProjectStage>> = await apiClient.post(
        `/projets/${projetId}/etapes`, 
        etapeData
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de l'ajout d'une étape au projet ${projetId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour une étape d'un projet
   */
  static async updateEtape(
    projetId: number, 
    etapeId: number, 
    etapeData: Partial<ProjectStage>
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(
        `/Projets/etapes/${etapeId}/avancement`, 
        etapeData
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'étape ${etapeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime une étape d'un projet
   */
  static async deleteEtape(projetId: number, etapeId: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(
        `/projets/${projetId}/etapes/${etapeId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'étape ${etapeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un projet depuis un DQE
   */
  static async createFromDQE(dqeId: number, projetData: CreateProjetRequest): Promise<ApiResponse<Project>> {
    try {
      const response: AxiosResponse<ApiResponse<Project>> = await apiClient.post(
        `/projets/from-dqe/${dqeId}`, 
        projetData
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la création du projet depuis le DQE ${dqeId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les projets par statut
   */
  static async getProjetsByStatut(statut: ProjectStatus): Promise<Project[]> {
    try {
      const response: AxiosResponse<Project[]> = await apiClient.get(`/projets/statut/${statut}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des projets avec le statut ${statut}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les projets d'un client
   */
  static async getProjetsByClient(clientId: number): Promise<Project[]> {
    try {
      const response: AxiosResponse<Project[]> = await apiClient.get(`/projets/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des projets du client ${clientId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les projets d'un chef de projet
   */
  static async getProjetsByChefProjet(chefProjetId: number): Promise<Project[]> {
    try {
      const response: AxiosResponse<Project[]> = await apiClient.get(`/projets/chef-projet/${chefProjetId}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des projets du chef de projet ${chefProjetId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Recherche des projets avec filtres
   */
  static async rechercherProjets(params: {
    search?: string;
    statut?: ProjectStatus;
    clientId?: number;
    chefProjetId?: number;
    typeProjetId?: number;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    projets: Project[];
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

      const response = await apiClient.get(`/projets/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de projets:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques des projets
   */
  static async getStatistiquesProjets(): Promise<{
    totalProjets: number;
    retardProjet: number;
    budgetTotal: number;
    projetEncour :number;
    
  }> {
    try {      console.log('fetchStats service --->')

      const response = await apiClient.get('/Projets/statistiques');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw this.handleError(error);
    }
  }
  static async getAvailableProjectsForLinking(): Promise<Project[]> {
    try {
      console.log("Récupération des projets disponibles pour liaison DQE");
      const response: AxiosResponse<Project[]> = await apiClient.get('/Projets/available-for-linking');
      console.log('Projets disponibles:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets disponibles:', error);
      throw this.handleError(error);
    }
  }
  /**
   * Récupère tous les types de projets
   */
  static async getTypesProjets(): Promise<TypeProjet[]> {
    try {
      const response: AxiosResponse<TypeProjet[]> = await apiClient.get('/Projets/types');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des types de projets:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exporte un projet en PDF
   */
  static async exporterProjetPDF(id: number): Promise<{ blob: Blob; filename?: string }> {
    try {
      const response: AxiosResponse<Blob> = await apiClient.get(`/projets/${id}/pdf`, {
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

      return { blob: response.data, filename };
    } catch (error) {
      console.error(`Erreur lors de l'export PDF du projet ${id}:`, error);
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

// Hook personnalisé pour utiliser le service de projets
export const useProjetService = () => {
  return {
    getAllProjets: ProjetService.getAllProjets,
    getProjetById: ProjetService.getProjetById,
    createProjet: ProjetService.createProjet,
    updateProjet: ProjetService.updateProjet,
    deleteProjet: ProjetService.deleteProjet,
    updateAvancement: ProjetService.updateAvancement,
    updateStatut: ProjetService.updateStatut,
    getEtapesProjet: ProjetService.getEtapesProjet,
    addEtape: ProjetService.addEtape,
    updateEtape: ProjetService.updateEtape,
    deleteEtape: ProjetService.deleteEtape,
    createFromDQE: ProjetService.createFromDQE,
    getProjetsByStatut: ProjetService.getProjetsByStatut,
    getProjetsByClient: ProjetService.getProjetsByClient,
    getProjetsByChefProjet: ProjetService.getProjetsByChefProjet,
    rechercherProjets: ProjetService.rechercherProjets,
    getStatistiquesProjets: ProjetService.getStatistiquesProjets,
    getTypesProjets: ProjetService.getTypesProjets,
    exporterProjetPDF: ProjetService.exporterProjetPDF,
    getAvailableProjectsForLinking: ProjetService.getAvailableProjectsForLinking, // ✅ AJOUTER ICI
  };
};