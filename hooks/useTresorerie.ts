// src/hooks/useTresorerie.ts

import { useState, useEffect, useCallback } from 'react';
import { TresorerieService } from '@/services/tresorerieService';
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

// =============================================
// HOOKS POUR LES COMPTES
// =============================================

/**
 * Hook pour gérer la liste des comptes
 */
export const useComptesList = () => {
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComptes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TresorerieService.getAllComptes();
      console.log('fetch Compte:',data)
      setComptes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des comptes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComptes();
  }, [fetchComptes]);

  const refreshComptes = useCallback(() => {
    fetchComptes();
  }, [fetchComptes]);

  return {
    comptes,
    loading,
    error,
    refreshComptes,
  };
};

/**
 * Hook pour gérer un compte spécifique
 */
export const useCompte = (id: number | null) => {
  const [compte, setCompte] = useState<Compte | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompte = useCallback(async (compteId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await TresorerieService.getCompteById(compteId);
      setCompte(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du compte');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCompte(id);
    } else {
      setCompte(null);
      setLoading(false);
    }
  }, [id, fetchCompte]);

  const refreshCompte = useCallback(() => {
    if (id) {
      fetchCompte(id);
    }
  }, [id, fetchCompte]);

  return {
    compte,
    loading,
    error,
    refreshCompte,
  };
};

/**
 * Hook pour les actions CRUD sur les comptes
 */
export const useCompteActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCompte = useCallback(async (compteData: CreateCompteRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.createCompte(compteData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du compte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompte = useCallback(async (id: number, compteData: UpdateCompteRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.updateCompte(id, compteData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du compte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const desactiverCompte = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.desactiverCompte(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la désactivation du compte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactiverCompte = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.reactiverCompte(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la réactivation du compte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const corrigerSolde = useCallback(async (id: number, correctionData: CorrectionSoldeRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.corrigerSolde(id, correctionData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la correction du solde';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createCompte,
    updateCompte,
    desactiverCompte,
    reactiverCompte,
    corrigerSolde,
    clearError: () => setError(null),
  };
};

// =============================================
// HOOKS POUR LES MOUVEMENTS
// =============================================
const formatDateParam = (value?: string | Date) => {
  if (!value) return undefined;
  const date = new Date(value);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};
/**
 * Hook pour gérer la liste des mouvements
 */
export const useMouvementsList = (params?: {
  compteId?: number;
  typeMouvement?: string;
  dateDebut?: string;
  dateFin?: string;
  categorie?: string;
}) => {
  const [mouvements, setMouvements] = useState<MouvementFinancier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMouvements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
       // Formatage des dates AVANT l'appel API
       const formattedParams = {
        ...params,
        dateDebut: params?.dateDebut
          ? formatDateParam(params.dateDebut)
          : undefined,
        dateFin: params?.dateFin
          ? formatDateParam(params.dateFin)
          : undefined,
      };
      console.log('les parametre:',params)

      const data = await TresorerieService.getAllMouvements(params);
      setMouvements(data);
      console.log('data movement:',data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des mouvements');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchMouvements();
  }, [fetchMouvements]);

  const refreshMouvements = useCallback(() => {
    fetchMouvements();
  }, [fetchMouvements]);

  return {
    mouvements,
    loading,
    error,
    refreshMouvements,
  };
};

/**
 * Hook pour gérer un mouvement spécifique
 */
export const useMouvement = (id: number | null) => {
  const [mouvement, setMouvement] = useState<MouvementFinancier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMouvement = useCallback(async (mouvementId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await TresorerieService.getMouvementById(mouvementId);
      setMouvement(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du mouvement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchMouvement(id);
    } else {
      setMouvement(null);
      setLoading(false);
    }
  }, [id, fetchMouvement]);

  const refreshMouvement = useCallback(() => {
    if (id) {
      fetchMouvement(id);
    }
  }, [id, fetchMouvement]);

  return {
    mouvement,
    loading,
    error,
    refreshMouvement,
  };
};

/**
 * Hook pour les actions CRUD sur les mouvements
 */
export const useMouvementActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMouvement = useCallback(async (mouvementData: CreateMouvementRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.createMouvement(mouvementData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du mouvement';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMouvement = useCallback(async (id: number, mouvementData: Partial<CreateMouvementRequest>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.updateMouvement(id, mouvementData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du mouvement';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMouvement = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.deleteMouvement(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du mouvement';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const effectuerVirement = useCallback(async (virementData: VirementRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.effectuerVirement(virementData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du virement';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createMouvement,
    updateMouvement,
    deleteMouvement,
    effectuerVirement,
    clearError: () => setError(null),
  };
};

/**
 * Hook pour les mouvements d'un compte spécifique
 */
export const useMouvementsByCompte = (compteId: number | null) => {
  const [mouvements, setMouvements] = useState<MouvementFinancier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMouvementsByCompte = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await TresorerieService.getMouvementsByCompte(id);
      setMouvements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des mouvements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (compteId) {
      fetchMouvementsByCompte(compteId);
    }
  }, [compteId, fetchMouvementsByCompte]);

  const refreshMouvements = useCallback(() => {
    if (compteId) {
      fetchMouvementsByCompte(compteId);
    }
  }, [compteId, fetchMouvementsByCompte]);

  return {
    mouvements,
    loading,
    error,
    refreshMouvements,
  };
};

// =============================================
// HOOKS POUR LES STATISTIQUES ET RAPPORTS
// =============================================

/**
 * Hook pour les statistiques de trésorerie
 */
export const useTresorerieStatistiques = (params?: {
  dateDebut?: string;
  dateFin?: string;
}) => {
  const [stats, setStats] = useState<TresorerieStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      console.log('fetchStats useTresorerie -->');
      setLoading(true);
      setError(null);
      const data = await TresorerieService.getStatistiques(params);
      console.log('statdata:', data);
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refreshStats = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};

/**
 * Hook pour la génération de rapports
 */
export const useRapportActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const genererRapport = useCallback(async (params: {
    dateDebut: string;
    dateFin: string;
    comptesIds?: number[];
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await TresorerieService.genererRapport(params);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération du rapport';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exporterRapportPDF = useCallback(async (
    params: {
      dateDebut: string;
      dateFin: string;
      comptesIds?: number[];
    },
    filename?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const { blob, filename: serverFilename } = await TresorerieService.exporterRapportPDF(params);

      // Vérifications de validité du contenu
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error("Le fichier PDF reçu est vide ou invalide");
      }
      if (blob.type && blob.type !== 'application/pdf') {
        try {
          const text = await blob.text();
          try {
            const json = JSON.parse(text);
            const apiMsg = (json && (json.message || json.Message)) as string | undefined;
            throw new Error(apiMsg || "La réponse du serveur n'est pas un PDF valide");
          } catch {
            throw new Error(text || "La réponse du serveur n'est pas un PDF valide");
          }
        } catch {
          throw new Error("La réponse du serveur n'est pas un PDF valide");
        }
      }

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || serverFilename || `rapport-tresorerie.pdf`;
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export PDF';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exporterRapportExcel = useCallback(async (
    params: {
      dateDebut: string;
      dateFin: string;
      comptesIds?: number[];
    },
    filename?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const { blob, filename: serverFilename } = await TresorerieService.exporterRapportExcel(params);

      // Vérifications de validité du contenu
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error("Le fichier Excel reçu est vide ou invalide");
      }

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || serverFilename || `rapport-tresorerie.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export Excel';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    genererRapport,
    exporterRapportPDF,
    exporterRapportExcel,
    clearError: () => setError(null),
  };
};

// =============================================
// HOOKS POUR LA RECHERCHE
// =============================================

/**
 * Hook pour la recherche et filtrage des mouvements
 */
export const useMouvementSearch = () => {
  const [mouvements, setMouvements] = useState<MouvementFinancier[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const searchMouvements = useCallback(async (params: {
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
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await TresorerieService.rechercherMouvements(params);
      setMouvements(data.mouvements);
      setTotalPages(data.totalPages);
      setCurrentPage(data.page);
      setTotal(data.total);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    mouvements,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    searchMouvements,
  };
};

// =============================================
// HOOK COMPOSITE
// =============================================

/**
 * Hook composite pour accéder à toutes les fonctionnalités de trésorerie
 */
export const useTresorerie = () => {
  const comptesList = useComptesList();
  const compteActions = useCompteActions();
  const mouvementActions = useMouvementActions();
  const rapportActions = useRapportActions();

  return {
    // Comptes
    comptes: comptesList.comptes,
    loadingComptes: comptesList.loading,
    errorComptes: comptesList.error,
    refreshComptes: comptesList.refreshComptes,

    // Actions sur les comptes
    createCompte: compteActions.createCompte,
    updateCompte: compteActions.updateCompte,
    desactiverCompte: compteActions.desactiverCompte,
    reactiverCompte: compteActions.reactiverCompte,
    corrigerSolde: compteActions.corrigerSolde,
    loadingCompteActions: compteActions.loading,
    errorCompteActions: compteActions.error,

    // Actions sur les mouvements
    createMouvement: mouvementActions.createMouvement,
    updateMouvement: mouvementActions.updateMouvement,
    deleteMouvement: mouvementActions.deleteMouvement,
    effectuerVirement: mouvementActions.effectuerVirement,
    loadingMouvementActions: mouvementActions.loading,
    errorMouvementActions: mouvementActions.error,

    // Rapports
    genererRapport: rapportActions.genererRapport,
    exporterRapportPDF: rapportActions.exporterRapportPDF,
    exporterRapportExcel: rapportActions.exporterRapportExcel,
    loadingRapport: rapportActions.loading,
    errorRapport: rapportActions.error,

    // Fonctions de nettoyage
    clearErrors: () => {
      compteActions.clearError();
      mouvementActions.clearError();
      rapportActions.clearError();
    },
  };
};