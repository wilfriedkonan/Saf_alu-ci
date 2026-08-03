// hooks/useDepot.ts

import { useState, useEffect, useCallback } from 'react';
import { DepotService } from '@/services/depotService';
import {
  Depot,
  CreateDepotRequest,
  UpdateDepotRequest,
  DepotListParams,
} from '@/types/depot';
import { PagedResponse } from '@/types/stock';

// =====================================================
// LISTE PAGINÉE
// =====================================================

export const useDepotsList = (
  initialParams: DepotListParams = { page: 1, pageSize: 20 }
) => {
  const [items, setItems] = useState<Depot[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: DepotListParams) => {
    try {
      setLoading(true);
      setError(null);
      const data: PagedResponse<Depot> = await DepotService.getDepotsPaged(p);
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

  return {
    items,
    totalItems,
    totalPages,
    loading,
    error,
    params,
    setParams,
    refresh: () => fetch(params),
  };
};

// =====================================================
// LISTE COMPLÈTE (pour selects / combobox)
// =====================================================

export const useDepotsAll = (actifSeulement = true) => {
  const [items, setItems] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await DepotService.getDepots(actifSeulement ? true : undefined);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des dépôts');
    } finally {
      setLoading(false);
    }
  }, [actifSeulement]);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, error, refresh: fetch };
};

// =====================================================
// DÉTAIL D'UN DÉPÔT
// =====================================================

export const useDepot = (id: number | null) => {
  const [depot, setDepot] = useState<Depot | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchDepot = useCallback(async (depotId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await DepotService.getDepotById(depotId);
      setDepot(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du dépôt');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) fetchDepot(id);
  }, [id, fetchDepot]);

  return {
    depot,
    loading,
    error,
    refresh: () => id && fetchDepot(id),
  };
};

// =====================================================
// ACTIONS (CRUD)
// =====================================================

export const useDepotsActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDepot = useCallback(async (data: CreateDepotRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await DepotService.createDepot(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepot = useCallback(async (id: number, data: UpdateDepotRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await DepotService.updateDepot(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDepot = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await DepotService.deleteDepot(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleActif = useCallback(async (id: number, actif: boolean) => {
    try {
      setLoading(true);
      setError(null);
      return await DepotService.toggleActif(id, actif);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createDepot,
    updateDepot,
    deleteDepot,
    toggleActif,
    clearError: () => setError(null),
  };
};
