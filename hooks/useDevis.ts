// src/hooks/useDevis.ts

import { useState, useEffect, useCallback } from 'react';
import { DevisService } from '@/services/devisService';
import { 
  Devis, 
  DevisListItem, 
  CreateDevisRequest, 
  UpdateDevisRequest,
  DevisStatut
} from '@/types/Devis';

// Hook pour gérer la liste des devis
export const useDevisList = () => {
  const [devis, setDevis] = useState<DevisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DevisService.getAllDevis();
      setDevis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevis();
  }, [fetchDevis]);

  const refreshDevis = useCallback(() => {
    fetchDevis();
  }, [fetchDevis]);

  return {
    devis,
    loading,
    error,
    refreshDevis
  };
};

// Hook pour gérer un devis spécifique
export const useDevis = (id: number | null) => {
  const [devis, setDevis] = useState<Devis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevis = useCallback(async (devisId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DevisService.getDevisById(devisId);
      setDevis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du devis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchDevis(id);
    }
  }, [id, fetchDevis]);

  const refreshDevis = useCallback(() => {
    if (id) {
      fetchDevis(id);
    }
  }, [id, fetchDevis]);

  return {
    devis,
    loading,
    error,
    refreshDevis
  };
};

// Hook pour les actions CRUD sur les devis
export const useDevisActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDevis = useCallback(async (devisData: CreateDevisRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await DevisService.createDevis(devisData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du devis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDevis = useCallback(async (id: number, devisData: UpdateDevisRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await DevisService.updateDevis(id, devisData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du devis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDevis = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await DevisService.deleteDevis(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du devis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const envoyerDevis = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await DevisService.envoyerDevis(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'envoi du devis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const validerDevis = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await DevisService.validerDevis(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation du devis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refuserDevis = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await DevisService.refuserDevis(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du refus du devis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const dupliquerDevis = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await DevisService.dupliquerDevis(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la duplication du devis';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exporterPDF = useCallback(async (id: number, filename?: string) => {
    try {
      setLoading(true);
      setError(null);
      const blob = await DevisService.exporterDevisPDF(id);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `devis-${id}.pdf`;
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

  return {
    loading,
    error,
    createDevis,
    updateDevis,
    deleteDevis,
    envoyerDevis,
    validerDevis,
    refuserDevis,
    dupliquerDevis,
    exporterPDF,
    clearError: () => setError(null)
  };
};

// Hook pour la recherche et filtrage des devis
export const useDevisSearch = () => {
  const [devis, setDevis] = useState<DevisListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const searchDevis = useCallback(async (params: {
    search?: string;
    statut?: DevisStatut;
    clientId?: number;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DevisService.rechercherDevis(params);
      setDevis(data.devis);
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
    devis,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    searchDevis
  };
};

// Hook pour les statistiques des devis
export const useDevisStatistiques = () => {
  const [stats, setStats] = useState({
    total: 0,
    brouillon: 0,
    envoye: 0,
    enNegociation: 0,
    valide: 0,
    refuse: 0,
    expire: 0,
    montantTotal: 0,
    montantValide: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DevisService.getStatistiquesDevis();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  }, []);

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
    refreshStats
  };
};