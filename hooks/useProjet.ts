// src/hooks/useProjet.ts

import { useState, useEffect, useCallback } from 'react';
import { ProjetService } from '@/services/projetService';
import { 
  Project,
  ProjectStage,
  CreateProjetRequest,
  UpdateAvancementRequest,
  ProjectStatus,
  TypeProjet
} from '@/types/projet';

// Hook pour gérer la liste des projets
export const useProjetsList = () => {
  const [projets, setProjets] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProjetService.getAllProjets();
      setProjets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjets();
  }, [fetchProjets]);

  const refreshProjets = useCallback(() => {
    fetchProjets();
  }, [fetchProjets]);

  return {
    projets,
    loading,
    error,
    refreshProjets
  };
};

// Hook pour gérer un projet spécifique
export const useProjet = (id: number | null) => {
  const [projet, setProjet] = useState<Project | null>(null);
	const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjet = useCallback(async (projetId: number) => {
    try { 
      setLoading(true);
      setError(null);
      const data = await ProjetService.getProjetById(projetId);

      setProjet(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du projet');
    } finally {
      setLoading(false);
    }
  }, []);

	useEffect(() => {
		if (id) {
			fetchProjet(id);
		} else {
			// Aucun id pour le moment: éviter les faux négatifs et garder l'état cohérent
			setProjet(null);
			setLoading(false);
		}
	}, [id, fetchProjet]);

  const refreshProjet = useCallback(() => {
    if (id) {
      fetchProjet(id);
    }
  }, [id, fetchProjet]);

  return {
    projet,
    loading,
    error,
    refreshProjet
  };
};

// Hook pour les actions CRUD sur les projets
export const useProjetActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProjet = useCallback(async (projetData: CreateProjetRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProjetService.createProjet(projetData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du projet';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProjet = useCallback(async (id: number, projetData: Partial<CreateProjetRequest>) => {
    try {
      console.log('update projet -->: ',projetData)
      setLoading(true);
      setError(null);
      const response = await ProjetService.updateProjet(id, projetData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du projet';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProjet = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProjetService.deleteProjet(id);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du projet';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAvancement = useCallback(async (id: number, avancementData: UpdateAvancementRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProjetService.updateAvancement(id, avancementData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'avancement';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatut = useCallback(async (id: number, statut: ProjectStatus) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProjetService.updateStatut(id, statut);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFromDQE = useCallback(async (dqeId: number, projetData: CreateProjetRequest) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProjetService.createFromDQE(dqeId, projetData);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du projet depuis le DQE';
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
      const { blob, filename: serverFilename } = await ProjetService.exporterProjetPDF(id);

      // Vérifications de validité du contenu
      if (!(blob instanceof Blob) || blob.size === 0) {
        throw new Error("Le fichier PDF reçu est vide ou invalide");
      }
      if (blob.type && blob.type !== 'application/pdf') {
        try {
          const text = await blob.text();
          // Essaye d'extraire un message d'erreur côté API
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
      link.download = filename || serverFilename || `projet-${id}.pdf`;
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
    createProjet,
    updateProjet,
    deleteProjet,
    updateAvancement,
    updateStatut,
    createFromDQE,
    exporterPDF,
    clearError: () => setError(null)
  };
};

// Hook pour gérer les étapes d'un projet
export const useProjetEtapes = (projetId: number | null) => {
  const [etapes, setEtapes] = useState<ProjectStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEtapes = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProjetService.getEtapesProjet(id);
      setEtapes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des étapes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projetId) {
      fetchEtapes(projetId);
    }
  }, [projetId, fetchEtapes]);

  const addEtape = useCallback(async (etapeData: Partial<ProjectStage>) => {
    if (!projetId) throw new Error('Projet ID requis');
    
    try {
      setLoading(true);
      setError(null);
      const response = await ProjetService.addEtape(projetId, etapeData);
      await fetchEtapes(projetId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'étape';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projetId, fetchEtapes]);

  const updateEtape = useCallback(async (etapeId: number, etapeData: Partial<ProjectStage>) => {
    if (!projetId) throw new Error('Projet ID requis');
    
    try {
      setLoading(true);
      setError(null);
      const response = await ProjetService.updateEtape(projetId, etapeId, etapeData);
      await fetchEtapes(projetId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'étape';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projetId, fetchEtapes]);

  const deleteEtape = useCallback(async (etapeId: number) => {
    if (!projetId) throw new Error('Projet ID requis');
    
    try {
      setLoading(true);
      setError(null);
      const response = await ProjetService.deleteEtape(projetId, etapeId);
      await fetchEtapes(projetId);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'étape';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [projetId, fetchEtapes]);

  const refreshEtapes = useCallback(() => {
    if (projetId) {
      fetchEtapes(projetId);
    }
  }, [projetId, fetchEtapes]);

  return {
    etapes,
    loading,
    error,
    addEtape,
    updateEtape,
    deleteEtape,
    refreshEtapes
  };
};

// Hook pour la recherche et filtrage des projets
export const useProjetSearch = () => {
  const [projets, setProjets] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

  const searchProjets = useCallback(async (params: {
    search?: string;
    statut?: ProjectStatus;
    clientId?: number;
    chefProjetId?: number;
    typeProjetId?: number;
    dateDebut?: string;
    dateFin?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProjetService.rechercherProjets(params);
      setProjets(data.projets);
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
    projets,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    searchProjets
  };
};

// Hook pour les projets par statut
export const useProjetsByStatut = (statut: ProjectStatus | null) => {
  const [projets, setProjets] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjetsByStatut = useCallback(async (status: ProjectStatus) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProjetService.getProjetsByStatut(status);
      setProjets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (statut) {
      fetchProjetsByStatut(statut);
    }
  }, [statut, fetchProjetsByStatut]);

  const refreshProjets = useCallback(() => {
    if (statut) {
      fetchProjetsByStatut(statut);
    }
  }, [statut, fetchProjetsByStatut]);

  return {
    projets,
    loading,
    error,
    refreshProjets
  };
};

// Hook pour les projets d'un client
export const useProjetsByClient = (clientId: number | null) => {
  const [projets, setProjets] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjetsByClient = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProjetService.getProjetsByClient(id);
      setProjets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      fetchProjetsByClient(clientId);
    }
  }, [clientId, fetchProjetsByClient]);

  const refreshProjets = useCallback(() => {
    if (clientId) {
      fetchProjetsByClient(clientId);
    }
  }, [clientId, fetchProjetsByClient]);

  return {
    projets,
    loading,
    error,
    refreshProjets
  };
};

// Hook pour les types de projets
export const useTypesProjets = () => {
  const [types, setTypes] = useState<TypeProjet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProjetService.getTypesProjets();
      setTypes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des types de projets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTypes();
  }, [fetchTypes]);

  const refreshTypes = useCallback(() => {
    fetchTypes();
  }, [fetchTypes]);

  return {
    types,
    loading,
    error,
    refreshTypes
  };
};

// Hook pour les statistiques des projets
export const useProjetStatistiques = () => {
  const [stats, setStats] = useState({
    totalProjets: 0,
    retardProjet: 0,
    budgetTotal: 0,
    projetEncour :0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {   console.log('fetchStats-->')

      setLoading(true);
      setError(null);
      const data = await ProjetService.getStatistiquesProjets();
      console.log('statdata:',data)
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