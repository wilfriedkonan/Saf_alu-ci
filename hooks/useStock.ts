// hooks/useStock.ts

import { useState, useEffect, useCallback } from 'react';
import { StockService } from '@/services/stockService';
import {
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
  EntreeStockRequest,
  SortieStockRequest,
  TransfertStockRequest,
  BordereauEntreeRequest,
  BordereauSortieRequest,
  StockStatistiques,
  ItemInventaire,
  DetailsInventaireDTO,
} from '@/types/stock';

// =====================================================
// STATISTIQUES
// =====================================================

export const useStockStatistiques = () => {
  const [stats, setStats] = useState<StockStatistiques | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getStatistiques();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
};

// =====================================================
// CATÉGORIES
// =====================================================

export const useCategoriesList = (initialParams: PagedParams = { page: 1, pageSize: 20 }) => {
  const [items, setItems] = useState<Categorie[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: PagedParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getCategoriesPaged(p);
      setItems(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(params); }, [params, fetch]);

  return { items, totalItems, totalPages, loading, error, params, setParams, refresh: () => fetch(params) };
};

export const useCategoriesActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategorie = useCallback(async (data: CreateCategorieRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.createCategorie(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const updateCategorie = useCallback(async (id: number, data: UpdateCategorieRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.updateCategorie(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  return { loading, error, createCategorie, updateCategorie, clearError: () => setError(null) };
};

// =====================================================
// DÉPÔTS
// =====================================================

export const useDepotsList = (initialParams: PagedParams = { page: 1, pageSize: 20 }) => {
  const [items, setItems] = useState<Depot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: PagedParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getDepotsPaged(p);
      setItems(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des dépôts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(params); }, [params, fetch]);

  return { items, totalItems, totalPages, loading, error, params, setParams, refresh: () => fetch(params) };
};

export const useDepotsActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDepot = useCallback(async (data: CreateDepotRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.createDepot(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const updateDepot = useCallback(async (id: number, data: UpdateDepotRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.updateDepot(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  return { loading, error, createDepot, updateDepot, clearError: () => setError(null) };
};

// =====================================================
// FOURNISSEURS
// =====================================================

export const useFournisseursList = (initialParams: PagedParams = { page: 1, pageSize: 20 }) => {
  const [items, setItems] = useState<Fournisseur[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: PagedParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getFournisseursPaged(p);
      setItems(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(params); }, [params, fetch]);

  return { items, totalItems, totalPages, loading, error, params, setParams, refresh: () => fetch(params) };
};

export const useFournisseursActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFournisseur = useCallback(async (data: CreateFournisseurRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.createFournisseur(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const updateFournisseur = useCallback(async (id: number, data: UpdateFournisseurRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.updateFournisseur(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  return { loading, error, createFournisseur, updateFournisseur, clearError: () => setError(null) };
};

// =====================================================
// ARTICLES
// =====================================================

export const useArticlesList = (initialParams: PagedParams & { categorieId?: number; depotId?: number } = { page: 1, pageSize: 20 }) => {
  const [items, setItems] = useState<Article[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: typeof initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getArticlesPaged(p);
      setItems(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(params); }, [params, fetch]);

  return { items, totalItems, totalPages, loading, error, params, setParams, refresh: () => fetch(params) };
};

export const useArticlesActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createArticle = useCallback(async (data: CreateArticleRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.createArticle(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const updateArticle = useCallback(async (id: number, data: UpdateArticleRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.updateArticle(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  return { loading, error, createArticle, updateArticle, clearError: () => setError(null) };
};

// =====================================================
// INVENTAIRE
// =====================================================

export const useInventaire = (initialParams: PagedParams & { depotId?: number; statut?: string } = { page: 1, pageSize: 20 }) => {
  const [items, setItems] = useState<ItemInventaire[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: typeof initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getInventairePaged(p);
      setItems(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'inventaire');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(params); }, [params, fetch]);

  return { items, totalItems, totalPages, loading, error, params, setParams, refresh: () => fetch(params) };
};

export const useInventaireDetails = (articleId: number | null, depotId: number | null) => {
  const [details, setDetails] = useState<DetailsInventaireDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (aId: number, dId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getInventaireDetails(aId, dId);
      setDetails(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (articleId && depotId) fetch(articleId, depotId);
    else setDetails(null);
  }, [articleId, depotId, fetch]);

  return { details, loading, error, refresh: () => articleId && depotId && fetch(articleId, depotId) };
};

// =====================================================
// ALERTES
// =====================================================

export const useAlertes = () => {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlertes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getAlertes();
      setAlertes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlertes(); }, [fetchAlertes]);

  return { alertes, loading, error, refresh: fetchAlertes };
};

// =====================================================
// DEMANDES — LISTE
// =====================================================

export const useDemandesList = (initialParams: PagedParams & { statut?: string; projetId?: number } = { page: 1, pageSize: 20 }) => {
  const [items, setItems] = useState<Demande[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: typeof initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getDemandesPaged(p);
      setItems(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(params); }, [params, fetch]);

  return { items, totalItems, totalPages, loading, error, params, setParams, refresh: () => fetch(params) };
};

// =====================================================
// DEMANDES — DÉTAIL
// =====================================================

export const useDemande = (id: number | null) => {
  const [demande, setDemande] = useState<Demande | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchDemande = useCallback(async (demandeId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getDemandeById(demandeId);
      console.log('Debug Data demande: ',data)
      setDemande(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la demande');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (id) fetchDemande(id); }, [id, fetchDemande]);

  return { demande, loading, error, refresh: () => id && fetchDemande(id) };
};

// =====================================================
// DEMANDES — ACTIONS
// =====================================================

export const useDemandesActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDemande = useCallback(async (data: CreateDemandeRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.createDemande(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création de la demande';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const sauvegarderTraitement = useCallback(async (id: number, data: TraitementRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.sauvegarderTraitement(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du traitement';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const soumettreTraitement = useCallback(async (id: number, data: TraitementRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.soumettreTraitement(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la soumission du traitement';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const validerDemande = useCallback(async (id: number, data?: ValiderDemandeRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.validerDemande(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la validation de la demande';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const rejeterDemande = useCallback(async (id: number, data: RejeterDemandeRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.rejeterDemande(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du rejet de la demande';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const livraisonDirecte = useCallback(async (id: number, data: LivraisonDirecteRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.livraisonDirecte(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la livraison directe';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const confirmerLivraisonArticle = useCallback(async (id: number, articleId: number) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.confirmerLivraisonArticle(id, articleId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la confirmation de livraison';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const confirmerToutesLivraisons = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.confirmerToutesLivraisons(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la confirmation de toutes les livraisons';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const finaliserLivraison = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.finaliserLivraison(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la finalisation de la livraison';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  return {
    loading,
    error,
    createDemande,
    sauvegarderTraitement,
    soumettreTraitement,
    validerDemande,
    rejeterDemande,
    livraisonDirecte,
    confirmerLivraisonArticle,
    confirmerToutesLivraisons,
    finaliserLivraison,
    clearError: () => setError(null),
  };
};

// =====================================================
// MOUVEMENTS
// =====================================================

export const useMouvementsList = (initialParams: PagedParams & { type?: string; articleId?: number; depotId?: number } = { page: 1, pageSize: 20 }) => {
  const [items, setItems] = useState<import('@/types/stock').Mouvement[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: typeof initialParams) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StockService.getMouvementsPaged(p);
      setItems(data.items);
      setTotalItems(data.totalItems);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des mouvements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(params); }, [params, fetch]);

  return { items, totalItems, totalPages, loading, error, params, setParams, refresh: () => fetch(params) };
};

export const useMouvementsActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entreeStock = useCallback(async (data: EntreeStockRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.entreeStock(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'entrée de stock';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const sortieStock = useCallback(async (data: SortieStockRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.sortieStock(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sortie de stock';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const transfertStock = useCallback(async (data: TransfertStockRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.transfertStock(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du transfert de stock';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const bordereauEntree = useCallback(async (data: BordereauEntreeRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.bordereauEntree(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création du bordereau d\'entrée';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  const bordereauSortie = useCallback(async (data: BordereauSortieRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await StockService.bordereauSortie(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création du bordereau de sortie';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  return {
    loading,
    error,
    entreeStock,
    sortieStock,
    transfertStock,
    bordereauEntree,
    bordereauSortie,
    clearError: () => setError(null),
  };
};

// =====================================================
// EXPORTS — helper de téléchargement
// =====================================================

export const useStockExports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (
    fetcher: () => Promise<{ blob: Blob; filename: string }>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const { blob, filename } = await fetcher();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du téléchargement';
      setError(msg); throw err;
    } finally { setLoading(false); }
  }, []);

  return {
    loading,
    error,
    exportEtatStocksPDF: () => download(StockService.exportEtatStocksPDF),
    exportAlertesPDF: () => download(StockService.exportAlertesPDF),
    exportHistoriquePDF: () => download(StockService.exportHistoriquePDF),
    exportDemandesParProjetPDF: () => download(StockService.exportDemandesParProjetPDF),
    exportFournisseursPDF: () => download(StockService.exportFournisseursPDF),
    exportEtatStocksExcel: () => download(StockService.exportEtatStocksExcel),
    exportHistoriqueExcel: () => download(StockService.exportHistoriqueExcel),
    exportAlertesExcel: () => download(StockService.exportAlertesExcel),
    clearError: () => setError(null),
  };
};
