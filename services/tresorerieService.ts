// services/tresorerieService.ts

import axios, { AxiosResponse } from 'axios';
import {
  Compte,
  MouvementFinancier,
  CreateCompteRequest,
  UpdateCompteRequest,
  CreateMouvementRequest,
  VirementRequest,
  CorrectionSoldeRequest,
  TresorerieStats,
  RapportTresorerie,
} from '@/types/tresorerie';

interface ComptesApiResponse {
    comptes: Compte[]  // ← Notez le "c" minuscule
    resume?: {
      nombreComptes: number
      soldeTotal: number
      soldeInitialTotal: number
      variationTotale: number
      repartitionParType: Array<{
        type: string
        nombre: number
        solde: number
      }>
    }
  }
// Configuration axios
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://167.86.107.54/api' ;;

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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export class TresorerieService {
  
  // =============================================
  // GESTION DES COMPTES
  // =============================================
  
  /**
   * Récupère tous les comptes
   */
  static async getAllComptes(): Promise<Compte[]> {
    try {
      console.log("Récupération des comptes");
      
      const response: AxiosResponse<ComptesApiResponse | Compte[]> = await apiClient.get('/Tresorerie/comptes');
      
      console.log('Réponse API brute:', response.data);
      
      // Vérifier si c'est un objet avec la propriété "comptes" (minuscule)
      if (response.data && typeof response.data === 'object' && 'comptes' in response.data) {
        console.log('✅ Format API avec wrapper - Extraction des comptes (minuscule)');
        const apiResponse = response.data as ComptesApiResponse;
        console.log('✅ Comptes extraits:', apiResponse.comptes.length);
        return apiResponse.comptes || [];
      }
      
      // Vérifier si c'est un objet avec la propriété "Comptes" (majuscule) - pour compatibilité
      if (response.data && typeof response.data === 'object' && 'Comptes' in response.data) {
        console.log('✅ Format API avec wrapper - Extraction des Comptes (majuscule)');
        const apiResponse = response.data as any;
        console.log('✅ Comptes extraits:', apiResponse.Comptes.length);
        return apiResponse.Comptes || [];
      }
      
      // Sinon, c'est directement un tableau
      if (Array.isArray(response.data)) {
        console.log('✅ Format API directe - Tableau de comptes');
        console.log('✅ Nombre de comptes:', response.data.length);
        return response.data;
      }
      
      // Si aucun format reconnu
      console.error('❌ Format de réponse API non reconnu:', response.data);
      console.error('❌ Clés disponibles:', Object.keys(response.data));
      return [];
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des comptes:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un compte par son ID
   */
  static async getCompteById(id: number): Promise<Compte> {
    try {
      const response: AxiosResponse<Compte> = await apiClient.get(`/Tresorerie/comptes/${id}`);
      console.log('Fetch compte:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du compte ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau compte
   */
  static async createCompte(compteData: CreateCompteRequest): Promise<ApiResponse<Compte>> {
    try {
      const response: AxiosResponse<ApiResponse<Compte>> = await apiClient.post(
        '/Tresorerie/comptes',
        compteData
      );
      console.log('Réponse createCompte:', response);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un compte existant
   */
  static async updateCompte(id: number, compteData: UpdateCompteRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/Tresorerie/comptes/${id}`,
        compteData
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du compte ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Désactive un compte
   */
  static async desactiverCompte(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/Tresorerie/comptes/${id}/desactiver`
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la désactivation du compte ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Réactive un compte
   */
  static async reactiverCompte(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/Tresorerie/comptes/${id}/reactiver`
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la réactivation du compte ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Corrige le solde d'un compte
   */
  static async corrigerSolde(
    id: number,
    correctionData: CorrectionSoldeRequest
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(
        `/Tresorerie/comptes/${id}/corriger-solde`,
        correctionData
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la correction du solde du compte ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // =============================================
  // GESTION DES MOUVEMENTS
  // =============================================

  /**
   * Récupère tous les mouvements
   */
  static async getAllMouvements(params?: {
    compteId?: number;
    typeMouvement?: string;
    dateDebut?: string;
    dateFin?: string;
    categorie?: string;
  }): Promise<MouvementFinancier[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const url = queryParams.toString() 
        ? `/Tresorerie/mouvements?${queryParams.toString()}`
        : '/Tresorerie/mouvements';

      console.log('🌐 Fetching mouvements from:', url);

      const response = await apiClient.get(url);
      
      console.log('📊 Réponse API brute mouvements:', response.data);
      
      // ✅ CORRECTION : Vérifier le format de la réponse
      // L'API retourne { mouvements: [...], pagination: {...}, resume: {...} }
      if (response.data && typeof response.data === 'object' && 'mouvements' in response.data) {
        console.log('✅ Format API avec wrapper - Extraction des mouvements');
        console.log('✅ Nombre de mouvements:', response.data.mouvements?.length || 0);
        return response.data.mouvements || [];
      }
      
      // Si c'est directement un tableau (pour compatibilité)
      if (Array.isArray(response.data)) {
        console.log('✅ Format API directe - Tableau de mouvements');
        console.log('✅ Nombre de mouvements:', response.data.length);
        return response.data;
      }
      
      // Si aucun format reconnu
      console.error('❌ Format de réponse API non reconnu:', response.data);
      console.error('❌ Clés disponibles:', Object.keys(response.data));
      return [];
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des mouvements:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère un mouvement par son ID
   */
  static async getMouvementById(id: number): Promise<MouvementFinancier> {
    try {
      const response: AxiosResponse<MouvementFinancier> = await apiClient.get(
        `/Tresorerie/mouvements/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du mouvement ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crée un nouveau mouvement
   */
  static async createMouvement(
    mouvementData: CreateMouvementRequest
  ): Promise<ApiResponse<MouvementFinancier>> {
    try {
      const response: AxiosResponse<ApiResponse<MouvementFinancier>> = await apiClient.post(
        '/Tresorerie/mouvements',
        mouvementData
      );
      console.log('Réponse createMouvement:', response);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création du mouvement:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Met à jour un mouvement existant
   */
  static async updateMouvement(
    id: number,
    mouvementData: Partial<CreateMouvementRequest>
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/Tresorerie/mouvements/${id}`,
        mouvementData
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du mouvement ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Supprime un mouvement
   */
  static async deleteMouvement(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(
        `/Tresorerie/mouvements/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du mouvement ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les mouvements d'un compte
   */
  static async getMouvementsByCompte(compteId: number): Promise<MouvementFinancier[]> {
    try {
      const response: AxiosResponse<MouvementFinancier[]> = await apiClient.get(
        `/Tresorerie/comptes/${compteId}/mouvements`
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des mouvements du compte ${compteId}:`, error);
      throw this.handleError(error);
    }
  }

  // =============================================
  // VIREMENTS
  // =============================================

  /**
   * Effectue un virement entre deux comptes
   */
  static async effectuerVirement(virementData: VirementRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(
        '/Tresorerie/virements',
        virementData
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors du virement:', error);
      throw this.handleError(error);
    }
  }

  // =============================================
  // STATISTIQUES ET RAPPORTS
  // =============================================

  /**
   * Récupère les statistiques de trésorerie
   */
  static async getStatistiques(params?: {
    dateDebut?: string;
    dateFin?: string;
  }): Promise<TresorerieStats> {
    try {
      console.log('fetchStats service --->');
      
      const queryParams = new URLSearchParams();
      if (params?.dateDebut) queryParams.append('dateDebut', params.dateDebut);
      if (params?.dateFin) queryParams.append('dateFin', params.dateFin);

      const url = queryParams.toString()
        ? `/Tresorerie/statistiques?${queryParams.toString()}`
        : '/Tresorerie/statistiques';

      const response: AxiosResponse<TresorerieStats> = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Génère un rapport de trésorerie
   */
  static async genererRapport(params: {
    dateDebut: string;
    dateFin: string;
    comptesIds?: number[];
  }): Promise<RapportTresorerie> {
    try {
      const response: AxiosResponse<RapportTresorerie> = await apiClient.post(
        '/Tresorerie/rapports',
        params
      );
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exporte un rapport en PDF
   */
  static async exporterRapportPDF(params: {
    dateDebut: string;
    dateFin: string;
    comptesIds?: number[];
  }): Promise<{ blob: Blob; filename?: string }> {
    try {
      const response: AxiosResponse<Blob> = await apiClient.post(
        '/Tresorerie/rapports/pdf',
        params,
        { responseType: 'blob' }
      );

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
      console.error('Erreur lors de l\'export PDF du rapport:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exporte un rapport en Excel
   */
  static async exporterRapportExcel(params: {
    dateDebut: string;
    dateFin: string;
    comptesIds?: number[];
  }): Promise<{ blob: Blob; filename?: string }> {
    try {
      const response: AxiosResponse<Blob> = await apiClient.post(
        '/Tresorerie/rapports/excel',
        params,
        { responseType: 'blob' }
      );

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
      console.error('Erreur lors de l\'export Excel du rapport:', error);
      throw this.handleError(error);
    }
  }

  // =============================================
  // RECHERCHE ET FILTRAGE
  // =============================================

  /**
   * Recherche des mouvements avec filtres avancés
   */
  static async rechercherMouvements(params: {
    search?: string;
    compteId?: number;
    typeMouvement?: string;
    categorie?: string;
    dateDebut?: string;
    dateFin?: string;
    montantMin?: number;
    montantMax?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    mouvements: MouvementFinancier[];
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

      const response = await apiClient.get(`/Tresorerie/mouvements/search?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche de mouvements:', error);
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

// Hook personnalisé pour utiliser le service de trésorerie
export const useTresorerieService = () => {
  return {
    // Comptes
    getAllComptes: TresorerieService.getAllComptes,
    getCompteById: TresorerieService.getCompteById,
    createCompte: TresorerieService.createCompte,
    updateCompte: TresorerieService.updateCompte,
    desactiverCompte: TresorerieService.desactiverCompte,
    reactiverCompte: TresorerieService.reactiverCompte,
    corrigerSolde: TresorerieService.corrigerSolde,
    
    // Mouvements
    getAllMouvements: TresorerieService.getAllMouvements,
    getMouvementById: TresorerieService.getMouvementById,
    createMouvement: TresorerieService.createMouvement,
    updateMouvement: TresorerieService.updateMouvement,
    deleteMouvement: TresorerieService.deleteMouvement,
    getMouvementsByCompte: TresorerieService.getMouvementsByCompte,
    
    // Virements
    effectuerVirement: TresorerieService.effectuerVirement,
    
    // Statistiques et rapports
    getStatistiques: TresorerieService.getStatistiques,
    genererRapport: TresorerieService.genererRapport,
    exporterRapportPDF: TresorerieService.exporterRapportPDF,
    exporterRapportExcel: TresorerieService.exporterRapportExcel,
    
    // Recherche
    rechercherMouvements: TresorerieService.rechercherMouvements,
  };
};