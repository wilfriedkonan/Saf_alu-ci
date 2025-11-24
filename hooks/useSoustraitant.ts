import { useState, useEffect, useCallback } from 'react';
import { SousTraitantService } from '@/services/sous-traitantService';
import { 
  SousTraitant,
  Specialite,
  CreateEvaluationRequest,
  EvaluationSousTraitant,
  ApiResponse
} from '@/types/sous-traitants';

// ========================================
// Hook pour gérer la liste des sous-traitants
// ========================================
export const useSousTraitantList = () => {
  const [sousTraitantList, setsousTraitantList] = useState<SousTraitant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSoustraitant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SousTraitantService.getAllSoustraitants();
      console.log('Debug data soustraitantListe:', data);
      setsousTraitantList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des sous-traitants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSoustraitant();
  }, [fetchSoustraitant]);

  const refreshSoutraitant = useCallback(() => {
    fetchSoustraitant();
  }, [fetchSoustraitant]);

  return {
    sousTraitantList,
    loading,
    error,
    refreshSoutraitant
  };
};
// ========================================
// Hook pour Selectionner un sous-traitants
// ========================================
export const useGetSoustraitant = (id:number) => {
  const [ThisSousTraitant, setThisSousTraitantList] = useState<SousTraitant>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSoustraitant = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SousTraitantService.getSoustraitantsById(id);
      console.log('Debug data soustraitantListe:', data);
      setThisSousTraitantList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du sous-traitants');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSoustraitant();
  }, [fetchSoustraitant]);

  const refreshSoutraitant = useCallback(() => {
    fetchSoustraitant();
  }, [fetchSoustraitant]);

  return {
    ThisSousTraitant,
    loading,
    error,
    refreshSoutraitant
  };
};
// ========================================
// Hook pour gérer la liste des spécialités
// ========================================
export const useSpecialiteList = () => {
  const [specialite, setspecialite] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialite = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SousTraitantService.getAllSpecialite();
      setspecialite(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des spécialités');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialite();
  }, [fetchSpecialite]);

  const refreshSpecialite = useCallback(() => {
    fetchSpecialite();
  }, [fetchSpecialite]);

  return {
    specialite,
    loading,
    error,
    refreshSpecialite
  };
};

// ========================================
// ✅ NOUVEAU - Hook pour gérer les évaluations
// ========================================
export const useSousTraitantEvaluations = (sousTraitantId?: number) => {
  const [evaluations, setEvaluations] = useState<EvaluationSousTraitant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteMoyenne, setNoteMoyenne] = useState<number>(0);
  const [totalEvaluations, setTotalEvaluations] = useState<number>(0);

  /**
   * Récupérer les évaluations d'un sous-traitant
   */
  const fetchEvaluations = useCallback(async (
    targetSousTraitantId: number,
    page: number = 1,
    pageSize: number = 10
  ) => {
    try {
      setLoading(true);
      setError(null);

      const data = await SousTraitantService.getEvaluationsBySousTraitant(
        targetSousTraitantId,
        page,
        pageSize
      );

      setEvaluations(data.evaluations);
      setNoteMoyenne(data.noteMoyenne);
      setTotalEvaluations(data.totalEvaluations);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des évaluations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Créer une nouvelle évaluation
   */
  const createEvaluation = useCallback(async (
    targetSousTraitantId: number,
    evaluationData: CreateEvaluationRequest
  ): Promise<ApiResponse<EvaluationSousTraitant>> => {
    try {
      setLoading(true);
      setError(null);

      // Validation de la note
      if (evaluationData.note < 1 || evaluationData.note > 5) {
        throw new Error('La note doit être comprise entre 1 et 5');
      }

      const response = await SousTraitantService.createEvaluation(targetSousTraitantId, evaluationData);
      
      // Rafraîchir les évaluations si on évalue le sous-traitant actuellement affiché
      if (sousTraitantId && sousTraitantId === targetSousTraitantId) {
        await fetchEvaluations(targetSousTraitantId);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'évaluation';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sousTraitantId, fetchEvaluations]);

  /**
   * Charger les évaluations au montage si un ID est fourni
   */
  useEffect(() => {
    if (sousTraitantId) {
      fetchEvaluations(sousTraitantId);
    }
  }, [sousTraitantId, fetchEvaluations]);

  /**
   * Rafraîchir les évaluations
   */
  const refreshEvaluations = useCallback(() => {
    if (sousTraitantId) {
      fetchEvaluations(sousTraitantId);
    }
  }, [sousTraitantId, fetchEvaluations]);

  return {
    evaluations,
    loading,
    error,
    noteMoyenne,
    totalEvaluations,
    createEvaluation,
    fetchEvaluations,
    refreshEvaluations
  };
};

// ========================================
// ✅ NOUVEAU - Hook pour les recommandations
// ========================================
export const useSousTraitantRecommandations = () => {
  const [recommandations, setRecommandations] = useState<SousTraitant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommandations = useCallback(async (
    specialiteId?: number,
    noteMin: number = 3.0
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await SousTraitantService.getRecommandations(specialiteId, noteMin);
      setRecommandations(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des recommandations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    recommandations,
    loading,
    error,
    fetchRecommandations
  };
};

// ========================================
// ✅ NOUVEAU - Hook pour les statistiques
// ========================================
export const useSousTraitantStatistiques = () => {
  const [statistiques, setStatistiques] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistiques = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SousTraitantService.getStatistiqueSoustraitants();
      setStatistiques(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistiques();
  }, [fetchStatistiques]);

  const refreshStatistiques = useCallback(() => {
    fetchStatistiques();
  }, [fetchStatistiques]);

  return {
    statistiques,
    loading,
    error,
    refreshStatistiques
  };
};