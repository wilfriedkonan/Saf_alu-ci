// hooks/useFournisseur.ts

import { useState, useEffect, useCallback } from 'react';
import { FournisseurService } from '@/services/fournisseurService';
import {
  Fournisseur,
  CreateFournisseurRequest,
  UpdateFournisseurRequest,
  FournisseurListParams,
} from '@/types/fournisseur';
import { PagedResponse } from '@/types/stock';

// =====================================================
// LISTE PAGINÉE
// =====================================================

export const useFournisseursList = (
  initialParams: FournisseurListParams = { page: 1, pageSize: 20 }
) => {
  const [items, setItems] = useState<Fournisseur[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: FournisseurListParams) => {
    try {
      setLoading(true);
      setError(null);
      const data: PagedResponse<Fournisseur> = await FournisseurService.getFournisseursPaged(p);
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

export const useFournisseursAll = (actifSeulement = true) => {
  const [items, setItems] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await FournisseurService.getFournisseurs(actifSeulement ? true : undefined);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  }, [actifSeulement]);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, error, refresh: fetch };
};

// =====================================================
// DÉTAIL D'UN FOURNISSEUR
// =====================================================

export const useFournisseur = (id: number | null) => {
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchFournisseur = useCallback(async (fournisseurId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await FournisseurService.getFournisseurById(fournisseurId);
      setFournisseur(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du fournisseur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) fetchFournisseur(id);
  }, [id, fetchFournisseur]);

  return {
    fournisseur,
    loading,
    error,
    refresh: () => id && fetchFournisseur(id),
  };
};

// =====================================================
// ACTIONS (CRUD)
// =====================================================

export const useFournisseursActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFournisseur = useCallback(async (data: CreateFournisseurRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await FournisseurService.createFournisseur(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFournisseur = useCallback(async (id: number, data: UpdateFournisseurRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await FournisseurService.updateFournisseur(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteFournisseur = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await FournisseurService.deleteFournisseur(id);
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
      return await FournisseurService.toggleActif(id, actif);
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
    createFournisseur,
    updateFournisseur,
    deleteFournisseur,
    toggleActif,
    clearError: () => setError(null),
  };
};
