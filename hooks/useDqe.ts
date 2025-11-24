// hooks/useDqe.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import DQEService from '@/services/dqeService';
import {
  DQE,
  DQEStatut,
  CreateDQERequest,
  UpdateDQERequest,
  ConvertDQEToProjectRequest,
  ConversionPreviewResponse,
  DQEStatistiques,
  DQESearchParams,
  getConversionStatus,
} from '@/types/dqe';

/**
 * Hook personnalisé pour gérer les DQE
 */
export const useDqe = () => {
  const [dqes, setDqes] = useState<DQE[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère tous les DQE
   */
  const fetchDQE = useCallback(async (params?: { statut?: DQEStatut; isConverted?: boolean }) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DQEService.getAllDQE(params);
      
      // Ajouter le statut de conversion calculé
      const enrichedData = data.map(dqe => ({
        ...dqe,
        conversionStatus: getConversionStatus(dqe),
      }));
      
      setDqes(enrichedData);
      return enrichedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des DQE';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère un DQE par ID avec structure complète
   */
  const fetchDQEById = useCallback(async (id: number): Promise<DQE | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DQEService.getDQEById(id);
      const enrichedData = {
        ...data,
        conversionStatus: getConversionStatus(data),
      };
      return enrichedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du DQE';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crée un nouveau DQE
   */
  const createDQE = useCallback(async (dqeData: CreateDQERequest): Promise<number | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DQEService.createDQE(dqeData);
      toast.success(response.message || 'DQE créé avec succès');
      
      // Rafraîchir la liste
      await fetchDQE();
      
      return response.data?.id || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du DQE';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchDQE]);

  /**
   * Met à jour un DQE
   */
  const updateDQE = useCallback(async (id: number, dqeData: UpdateDQERequest): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try { 
      const response = await DQEService.updateDQE(id, dqeData);
      toast.success(response.message || 'DQE mis à jour avec succès');
      
      // Rafraîchir la liste
      await fetchDQE();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du DQE';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDQE]);

  /**
   * Supprime un DQE (soft delete)
   */
  const deleteDQE = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DQEService.deleteDQE(id);
      toast.success(response.message || 'DQE supprimé avec succès');
      
      // Rafraîchir la liste
      await fetchDQE();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du DQE';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDQE]);

  /**
   * Valide un DQE
   */
  const validateDQE = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DQEService.validateDQE(id);
      toast.success(response.message || 'DQE validé avec succès');
      console.log('Validation oui?:', response)
      // Rafraîchir la liste
      await fetchDQE();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation du DQE';
      console.log('Validation erreur?:', errorMessage)

      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDQE]);

  return {
    dqes,
    loading,
    error,
    fetchDQE,
    fetchDQEById,
    createDQE,
    updateDQE,
    deleteDQE,
    validateDQE,
  };
};

/**
 * Hook pour la conversion DQE → Projet
 * Version améliorée avec gestion d'erreurs robuste
 */
export const useDqeConversion = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ConversionPreviewResponse | null>(null);

  /**
   * Vérifie si un DQE peut être converti
   */
  const checkCanConvert = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DQEService.canConvert(id);
      
      if (!response.canConvert) {
        toast.warning(response.reason || 'Ce DQE ne peut pas être converti');
      }
      
      return response.canConvert;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la vérification';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Génère une prévisualisation de la conversion
   */
  const generatePreview = useCallback(async (
    id: number,
    request: ConvertDQEToProjectRequest
  ): Promise<ConversionPreviewResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DQEService.getConversionPreview(id, request);
      setPreview(data);
      toast.success('Prévisualisation générée avec succès');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la génération de la prévisualisation';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Convertit un DQE en projet
   */
  const convertToProject = useCallback(async (
    id: number,
    request: ConvertDQEToProjectRequest
  ): Promise<number | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DQEService.convertToProject(id, request);
      toast.success(response.message || 'DQE converti en projet avec succès');
      return response.projetId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la conversion du DQE';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Réinitialise la prévisualisation
   */
  const resetPreview = useCallback(() => {
    setPreview(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    preview,
    checkCanConvert,
    generatePreview,
    convertToProject,
    resetPreview,
  };
};

/**
 * Hook pour les DQE filtrés par statut
 */
export const useDqeFiltered = () => {
  const [convertedDQE, setConvertedDQE] = useState<DQE[]>([]);
  const [convertibleDQE, setConvertibleDQE] = useState<DQE[]>([]);
  const [brouillonDQE, setBrouillonDQE] = useState<DQE[]>([]);
  const [valideDQE, setValideDQE] = useState<DQE[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les DQE convertis
   */
  const fetchConvertedDQE = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DQEService.getConvertedDQE();
      setConvertedDQE(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des DQE convertis';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère les DQE convertibles (validés et non convertis)
   */
  const fetchConvertibleDQE = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DQEService.getConvertibleDQE();
      setConvertibleDQE(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des DQE convertibles';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère les DQE en brouillon
   */
  const fetchBrouillonDQE = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DQEService.getBrouillonDQE();
      setBrouillonDQE(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des brouillons';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère les DQE validés
   */
  const fetchValideDQE = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DQEService.getValideDQE();
      setValideDQE(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des DQE validés';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    convertedDQE,
    convertibleDQE,
    brouillonDQE,
    valideDQE,
    loading,
    error,
    fetchConvertedDQE,
    fetchConvertibleDQE,
    fetchBrouillonDQE,
    fetchValideDQE,
  };
};

/**
 * Hook pour les statistiques DQE
 */
export const useDqeStats = () => {
  const [stats, setStats] = useState<DQEStatistiques | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les statistiques
   */
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DQEService.getStatistiquesDQE();
      setStats(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rafraîchit les statistiques
   */
  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Chargement automatique au montage
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    fetchStats,
    refreshStats,
  };
};

/**
 * Hook pour l'export de DQE
 */
export const useDqeExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Exporte un DQE en Excel
   */
  const exportExcel = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { blob, filename } = await DQEService.exportExcel(id);
      DQEService.downloadFile(blob, filename || `DQE-${id}.xlsx`);
      toast.success('Export Excel réussi');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export Excel';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Exporte un DQE en PDF
   */
  const exportPDF = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { blob, filename } = await DQEService.exportPDF(id);
      DQEService.downloadFile(blob, filename || `DQE-${id}.pdf`);
      toast.success('Export PDF réussi');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'export PDF';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportExcel,
    exportPDF,
  };
};

/**
 * Hook pour la recherche de DQE
 */
export const useDqeSearch = () => {
  const [results, setResults] = useState<DQE[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  /**
   * Recherche des DQE
   */
  const search = useCallback(async (params: DQESearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DQEService.rechercherDQE(params);
      setResults(response.items);
      setTotal(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Réinitialise les résultats
   */
  const reset = useCallback(() => {
    setResults([]);
    setTotal(0);
    setPage(1);
    setTotalPages(0);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    total,
    page,
    totalPages,
    search,
    reset,
  };
};

/**
 * Hook pour la duplication de DQE
 */
export const useDqeDuplicate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Duplique un DQE
   */
  const duplicate = useCallback(async (id: number, nouveauNom?: string): Promise<number | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await DQEService.duplicateDQE(id, nouveauNom);
      toast.success(response.message || 'DQE dupliqué avec succès');
      return response.data?.id || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la duplication';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    duplicate,
  };
};

// Export de tous les hooks
export default {
  useDqe,
  useDqeConversion,
  useDqeFiltered,
  useDqeStats,
  useDqeExport,
  useDqeSearch,
  useDqeDuplicate,
};