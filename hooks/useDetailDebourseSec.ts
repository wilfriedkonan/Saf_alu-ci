// hooks/useDetailDebourseSec.ts

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import DetailDebourseSecService from '@/services/detailDebourseSecService';
import {
  DQEDetailDebourseSec,
  CreateDetailDebourseSecRequest,
  UpdateDetailDebourseSecRequest,
  RecapitulatifDebourseSecResponse,
  DebourseStatistics,
  validateCreateRequest,
} from '@/types/dqe-debourse-sec';

/**
 * Hook personnalisé pour gérer les détails de déboursé sec
 */
export const useDetailDebourseSec = () => {
  const [details, setDetails] = useState<DQEDetailDebourseSec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Récupère les détails d'un item
   */
  const fetchDetailsByItemId = useCallback(async (itemId: number): Promise<DQEDetailDebourseSec[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DetailDebourseSecService.getByItemId(itemId);
      setDetails(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère un détail par ID
   */
  const fetchDetailById = useCallback(async (id: number): Promise<DQEDetailDebourseSec | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DetailDebourseSecService.getById(id);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crée un nouveau détail
   */
  const createDetail = useCallback(async (
    itemId: number,
    data: CreateDetailDebourseSecRequest
  ): Promise<{ success: boolean; detail?: DQEDetailDebourseSec }> => {
    // Validation
    const errors = validateCreateRequest(data);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return { success: false };
    }

    setLoading(true);
    setError(null);
    
    try {
      const newDetail = await DetailDebourseSecService.create(itemId, data);
      toast.success('Détail créé avec succès');
      
      // Rafraîchir la liste
      await fetchDetailsByItemId(itemId);
      
      return { success: true, detail: newDetail };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, [fetchDetailsByItemId]);

  /**
   * Met à jour un détail
   */
  const updateDetail = useCallback(async (
    id: number,
    itemId: number,
    data: UpdateDetailDebourseSecRequest
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await DetailDebourseSecService.update(id, data);
      toast.success('Détail mis à jour avec succès');
      
      // Rafraîchir la liste
      await fetchDetailsByItemId(itemId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDetailsByItemId]);

  /**
   * Supprime un détail
   */
  const deleteDetail = useCallback(async (id: number, itemId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await DetailDebourseSecService.delete(id);
      toast.success('Détail supprimé avec succès');
      
      // Rafraîchir la liste
      await fetchDetailsByItemId(itemId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDetailsByItemId]);

  /**
   * Supprime tous les détails d'un item
   */
  const deleteAllDetails = useCallback(async (itemId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const count = await DetailDebourseSecService.deleteAllByItemId(itemId);
      toast.success(`${count} détail(s) supprimé(s)`);
      
      // Vider la liste locale
      setDetails([]);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère le récapitulatif d'un item
   */
  const fetchRecapitulatif = useCallback(async (
    itemId: number
  ): Promise<RecapitulatifDebourseSecResponse | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DetailDebourseSecService.getRecapitulatif(itemId);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Récupère les statistiques d'un DQE
   */
  const fetchDebourseStatistics = useCallback(async (
    dqeId: number
  ): Promise<DebourseStatistics | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await DetailDebourseSecService.getDebourseStatistics(dqeId);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Copie les détails d'un item vers un autre
   */
  const copyDetails = useCallback(async (
    sourceItemId: number,
    targetItemId: number
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const count = await DetailDebourseSecService.copyDetails(sourceItemId, targetItemId);
      toast.success(`${count} détail(s) copié(s)`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la copie';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // État
    details,
    loading,
    error,
    
    // Méthodes CRUD
    fetchDetailsByItemId,
    fetchDetailById,
    createDetail,
    updateDetail,
    deleteDetail,
    deleteAllDetails,
    
    // Statistiques
    fetchRecapitulatif,
    fetchDebourseStatistics,
    
    // Utilitaires
    copyDetails,
  };
};

export default useDetailDebourseSec;