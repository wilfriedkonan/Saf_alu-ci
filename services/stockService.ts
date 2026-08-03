// services/stockService.ts

import axios, { AxiosResponse } from 'axios';
import {
  PagedResponse,
  PagedParams,
  Categorie,
  CreateCategorieRequest,
  UpdateCategorieRequest,
  Depot,
  CreateDepotRequest,
  UpdateDepotRequest,
  Fournisseur,
  CreateFournisseurRequest,
  UpdateFournisseurRequest,
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  InventaireItem,
  Alerte,
  Demande,
  CreateDemandeRequest,
  TraitementRequest,
  ValiderDemandeRequest,
  RejeterDemandeRequest,
  LivraisonDirecteRequest,
  LivraisonDirecteResponse,
  Mouvement,
  EntreeStockRequest,
  SortieStockRequest,
  TransfertStockRequest,
  BordereauEntreeRequest,
  BordereauEntreeResultDTO,
  BordereauSortieRequest,
  BordereauSortieResultDTO,
  StockStatistiques,
  RapportDemandesParProjet,
  RapportFournisseur,
  ApiResponse,
  ItemInventaire,
  DetailsInventaireDTO,
} from '@/types/stock';
import apiClient from '@/lib/auth';

export class StockService {

  // =====================================================
  // STATISTIQUES
  // =====================================================

  static async getStatistiques(): Promise<StockStatistiques> {
    try {
      const response: AxiosResponse<StockStatistiques> = await apiClient.get('/Stock/statistiques');
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // CATÉGORIES
  // =====================================================

  static async createCategorie(data: CreateCategorieRequest): Promise<ApiResponse<Categorie>> {
    try {
      const response: AxiosResponse<ApiResponse<Categorie>> = await apiClient.post('/Stock/categories', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getCategoriesPaged(params: PagedParams = {}): Promise<PagedResponse<Categorie>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search) query.append('search', params.search);
      const response: AxiosResponse<PagedResponse<Categorie>> = await apiClient.get(`/Stock/categories/paged?${query}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getCategorieById(id: number): Promise<Categorie> {
    try {
      const response: AxiosResponse<Categorie> = await apiClient.get(`/Stock/categories/${id}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async updateCategorie(id: number, data: UpdateCategorieRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Stock/categories/${id}`, data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // DÉPÔTS
  // =====================================================

  static async createDepot(data: CreateDepotRequest): Promise<ApiResponse<Depot>> {
    try {
      const response: AxiosResponse<ApiResponse<Depot>> = await apiClient.post('/Stock/depots', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getDepotsPaged(params: PagedParams = {}): Promise<PagedResponse<Depot>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search) query.append('search', params.search);
      const response: AxiosResponse<PagedResponse<Depot>> = await apiClient.get(`/Stock/depots/paged?${query}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getDepotById(id: number): Promise<Depot> {
    try {
      const response: AxiosResponse<Depot> = await apiClient.get(`/Stock/depots/${id}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async updateDepot(id: number, data: UpdateDepotRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Stock/depots/${id}`, data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // FOURNISSEURS
  // =====================================================

  static async createFournisseur(data: CreateFournisseurRequest): Promise<ApiResponse<Fournisseur>> {
    try {
      const response: AxiosResponse<ApiResponse<Fournisseur>> = await apiClient.post('/Stock/fournisseurs', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getFournisseursPaged(params: PagedParams = {}): Promise<PagedResponse<Fournisseur>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search) query.append('search', params.search);
      const response: AxiosResponse<PagedResponse<Fournisseur>> = await apiClient.get(`/Stock/fournisseurs/paged?${query}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getFournisseurById(id: number): Promise<Fournisseur> {
    try {
      const response: AxiosResponse<Fournisseur> = await apiClient.get(`/Stock/fournisseurs/${id}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async updateFournisseur(id: number, data: UpdateFournisseurRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Stock/fournisseurs/${id}`, data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // ARTICLES
  // =====================================================

  static async createArticle(data: CreateArticleRequest): Promise<ApiResponse<Article>> {
    try {
      const response: AxiosResponse<ApiResponse<Article>> = await apiClient.post('/Stock/articles', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getArticlesPaged(params: PagedParams & { categorieId?: number; depotId?: number } = {}): Promise<PagedResponse<Article>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search) query.append('search', params.search);
      if (params.categorieId) query.append('categorieId', String(params.categorieId));
      if (params.depotId) query.append('depotId', String(params.depotId));
      const response: AxiosResponse<PagedResponse<Article>> = await apiClient.get(`/Stock/articles/paged?${query}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getArticleById(id: number): Promise<Article> {
    try {
      const response: AxiosResponse<Article> = await apiClient.get(`/Stock/articles/${id}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async updateArticle(id: number, data: UpdateArticleRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Stock/articles/${id}`, data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // INVENTAIRE
  // =====================================================

  static async getInventaireDetails(articleId: number, depotId: number): Promise<DetailsInventaireDTO> {
    try {
      const response: AxiosResponse<DetailsInventaireDTO> = await apiClient.get(
        `/Stock/inventaire/details?articleId=${articleId}&depotId=${depotId}`
      );
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getInventairePaged(params: PagedParams & { depotId?: number; statut?: string } = {}): Promise<PagedResponse<ItemInventaire>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search) query.append('search', params.search);
      if (params.depotId) query.append('depotId', String(params.depotId));
      if (params.statut) query.append('statut', params.statut);
      const response: AxiosResponse<PagedResponse<ItemInventaire>> = await apiClient.get(`/Stock/inventaire/paged?${query}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // ALERTES
  // =====================================================

  static async getAlertes(): Promise<Alerte[]> {
    try {
      const response: AxiosResponse<Alerte[]> = await apiClient.get('/Stock/alertes');
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // DEMANDES
  // =====================================================

  static async createDemande(data: CreateDemandeRequest): Promise<ApiResponse<Demande>> {
    try {
      const response: AxiosResponse<ApiResponse<Demande>> = await apiClient.post('/Stock/demandes', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getDemandesPaged(params: PagedParams & { statut?: string; projetId?: number } = {}): Promise<PagedResponse<Demande>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search) query.append('search', params.search);
      if (params.statut) query.append('statut', params.statut);
      if (params.projetId) query.append('projetId', String(params.projetId));
      const response: AxiosResponse<PagedResponse<Demande>> = await apiClient.get(`/Stock/demandes/paged?${query}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getDemandeById(id: number): Promise<Demande> {
    try {
      const response: AxiosResponse<Demande> = await apiClient.get(`/Stock/demandes/${id}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async sauvegarderTraitement(id: number, data: TraitementRequest): Promise<ApiResponse<void>> {
    try { console.log('debug put : ',data);
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Stock/demandes/${id}/traitement/sauvegarder`, data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async soumettreTraitement(id: number, data: TraitementRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Stock/demandes/${id}/traitement/soumettre`, data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async validerDemande(id: number, data?: ValiderDemandeRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Stock/demandes/${id}/valider`, data ?? {});
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async rejeterDemande(id: number, data: RejeterDemandeRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Stock/demandes/${id}/rejeter`, data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async livraisonDirecte(id: number, data: LivraisonDirecteRequest): Promise<LivraisonDirecteResponse> {
    try {
      const response: AxiosResponse<LivraisonDirecteResponse> = await apiClient.post(`/Stock/demandes/${id}/livraison/direct`, data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async confirmerLivraisonArticle(id: number, articleId: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/Stock/demandes/${id}/livraison/articles/${articleId}/confirmer`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async confirmerToutesLivraisons(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/Stock/demandes/${id}/livraison/confirmer-tout`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async finaliserLivraison(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/Stock/demandes/${id}/livraison/finaliser`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // MOUVEMENTS
  // =====================================================

  static async getMouvementsPaged(params: PagedParams & { type?: string; articleId?: number; depotId?: number } = {}): Promise<PagedResponse<Mouvement>> {
    try {
      const query = new URLSearchParams();
      if (params.page) query.append('page', String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search) query.append('search', params.search);
      if (params.type) query.append('type', params.type);
      if (params.articleId) query.append('articleId', String(params.articleId));
      if (params.depotId) query.append('depotId', String(params.depotId));
      const response: AxiosResponse<PagedResponse<Mouvement>> = await apiClient.get(`/Stock/mouvements/paged?${query}`);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async entreeStock(data: EntreeStockRequest): Promise<ApiResponse<Mouvement>> {
    try {
      const response: AxiosResponse<ApiResponse<Mouvement>> = await apiClient.post('/Stock/mouvements/entree', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async sortieStock(data: SortieStockRequest): Promise<ApiResponse<Mouvement>> {
    try {
      const response: AxiosResponse<ApiResponse<Mouvement>> = await apiClient.post('/Stock/mouvements/sortie', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async transfertStock(data: TransfertStockRequest): Promise<ApiResponse<Mouvement>> {
    try {
      const response: AxiosResponse<ApiResponse<Mouvement>> = await apiClient.post('/Stock/mouvements/transfert', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async bordereauEntree(data: BordereauEntreeRequest): Promise<BordereauEntreeResultDTO> {
    try {
      const response: AxiosResponse<BordereauEntreeResultDTO> = await apiClient.post('/Stock/mouvements/bordereau-entree', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async bordereauSortie(data: BordereauSortieRequest): Promise<BordereauSortieResultDTO> {
    try {
      const response: AxiosResponse<BordereauSortieResultDTO> = await apiClient.post('/Stock/mouvements/bordereau-sortie', data);
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // RAPPORTS
  // =====================================================

  static async getRapportDemandesParProjet(): Promise<RapportDemandesParProjet[]> {
    try {
      const response: AxiosResponse<RapportDemandesParProjet[]> = await apiClient.get('/Stock/rapports/demandes-par-projet');
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  static async getRapportFournisseurs(): Promise<RapportFournisseur[]> {
    try {
      const response: AxiosResponse<RapportFournisseur[]> = await apiClient.get('/Stock/rapports/fournisseurs');
      return response.data;
    } catch (error) {
      throw StockService.handleError(error);
    }
  }

  // =====================================================
  // EXPORTS
  // =====================================================

  private static async exportBlob(url: string, defaultFilename: string): Promise<{ blob: Blob; filename: string }> {
    const response: AxiosResponse<Blob> = await apiClient.get(url, { responseType: 'blob' });
    let filename = defaultFilename;
    const disposition = (response.headers as any)?.['content-disposition'] as string | undefined;
    if (disposition) {
      const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(disposition);
      const encoded = match?.[1];
      const plain = match?.[2];
      if (encoded) filename = decodeURIComponent(encoded);
      else if (plain) filename = plain;
    }
    return { blob: response.data, filename };
  }

  static async exportEtatStocksPDF() {
    try {
      return await StockService.exportBlob('/Stock/exports/etat-stocks/pdf', 'etat-stocks.pdf');
    } catch (error) { throw StockService.handleError(error); }
  }

  static async exportAlertesPDF() {
    try {
      return await StockService.exportBlob('/Stock/exports/alertes/pdf', 'alertes-stock.pdf');
    } catch (error) { throw StockService.handleError(error); }
  }

  static async exportHistoriquePDF() {
    try {
      return await StockService.exportBlob('/Stock/exports/historique/pdf', 'historique-mouvements.pdf');
    } catch (error) { throw StockService.handleError(error); }
  }

  static async exportDemandesParProjetPDF() {
    try {
      return await StockService.exportBlob('/Stock/exports/demandes-par-projet/pdf', 'demandes-par-projet.pdf');
    } catch (error) { throw StockService.handleError(error); }
  }

  static async exportFournisseursPDF() {
    try {
      return await StockService.exportBlob('/Stock/exports/fournisseurs/pdf', 'rapport-fournisseurs.pdf');
    } catch (error) { throw StockService.handleError(error); }
  }

  static async exportEtatStocksExcel() {
    try {
      return await StockService.exportBlob('/Stock/exports/etat-stocks/excel', 'etat-stocks.xlsx');
    } catch (error) { throw StockService.handleError(error); }
  }

  static async exportHistoriqueExcel() {
    try {
      return await StockService.exportBlob('/Stock/exports/historique/excel', 'historique-mouvements.xlsx');
    } catch (error) { throw StockService.handleError(error); }
  }

  static async exportAlertesExcel() {
    try {
      return await StockService.exportBlob('/Stock/exports/alertes/excel', 'alertes-stock.xlsx');
    } catch (error) { throw StockService.handleError(error); }
  }

  // =====================================================
  // GESTION CENTRALISÉE DES ERREURS
  // =====================================================

  private static handleError(error: any): Error {
    let message = 'Une erreur inattendue s\'est produite';

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400: message = data?.message || 'Données invalides'; break;
          case 401: message = 'Non autorisé - Veuillez vous reconnecter'; break;
          case 403: message = 'Accès interdit'; break;
          case 404: message = 'Ressource non trouvée'; break;
          case 409: message = data?.message || 'Conflit - La ressource existe déjà'; break;
          case 422: message = data?.message || 'Données non valides'; break;
          case 500: message = 'Erreur serveur interne'; break;
          default: message = data?.message || `Erreur ${status}`;
        }
      } else if (error.request) {
        message = 'Erreur de connexion - Vérifiez votre réseau';
      }
    }

    return new Error(message);
  }
}

export const useStockService = () => StockService;
