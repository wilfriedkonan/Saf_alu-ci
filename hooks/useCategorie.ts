// hooks/useCategorie.ts

import { useState, useEffect, useCallback } from 'react';
import { CategorieService } from '@/services/categorieService';
import {
  Categorie,
  CreateCategorieRequest,
  UpdateCategorieRequest,
  CategorieListParams,
} from '@/types/categorie';
import { PagedResponse } from '@/types/stock';

// =====================================================
// LISTE PAGINÉE
// =====================================================

export const useCategoriesList = (
  initialParams: CategorieListParams = { page: 1, pageSize: 20 }
) => {
  const [items, setItems] = useState<Categorie[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: CategorieListParams) => {
    try {
      setLoading(true);
      setError(null);
      const data: PagedResponse<Categorie> = await CategorieService.getCategoriesPaged(p);
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

export const useCategoriesAll = (actifSeulement = true) => {
  const [items, setItems] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategorieService.getCategories(actifSeulement ? true : undefined);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  }, [actifSeulement]);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, error, refresh: fetch };
};

// =====================================================
// DÉTAIL D'UNE CATÉGORIE
// =====================================================

export const useCategorie = (id: number | null) => {
  const [categorie, setCategorie] = useState<Categorie | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorie = useCallback(async (categorieId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await CategorieService.getCategorieById(categorieId);
      setCategorie(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la catégorie');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) fetchCategorie(id);
  }, [id, fetchCategorie]);

  return {
    categorie,
    loading,
    error,
    refresh: () => id && fetchCategorie(id),
  };
};

// =====================================================
// ACTIONS (CRUD)
// =====================================================

export const useCategoriesActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategorie = useCallback(async (data: CreateCategorieRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await CategorieService.createCategorie(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategorie = useCallback(async (id: number, data: UpdateCategorieRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await CategorieService.updateCategorie(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategorie = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await CategorieService.deleteCategorie(id);
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
      return await CategorieService.toggleActif(id, actif);
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
    createCategorie,
    updateCategorie,
    deleteCategorie,
    toggleActif,
    clearError: () => setError(null),
  };
};
