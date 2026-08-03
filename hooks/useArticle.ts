// hooks/useArticle.ts

import { useState, useEffect, useCallback } from 'react';
import { ArticleService } from '@/services/articleService';
import {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleListParams,
} from '@/types/article';
import { PagedResponse } from '@/types/stock';

// =====================================================
// LISTE PAGINÉE
// =====================================================

export const useArticlesList = (
  initialParams: ArticleListParams = { page: 1, pageSize: 20 }
) => {
  const [items, setItems] = useState<Article[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState(initialParams);

  const fetch = useCallback(async (p: ArticleListParams) => {
    try {
      setLoading(true);
      setError(null);
      const data: PagedResponse<Article> = await ArticleService.getArticlesPaged(p);
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

export const useArticlesAll = (
  options: { actifSeulement?: boolean; categorieId?: number } = {}
) => {
  const { actifSeulement = true, categorieId } = options;
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ArticleService.getArticles({
        actif: actifSeulement ? true : undefined,
        categorieId,
      });
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  }, [actifSeulement, categorieId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { items, loading, error, refresh: fetch };
};

// =====================================================
// DÉTAIL D'UN ARTICLE
// =====================================================

export const useArticle = (id: number | null) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(id !== null);
  const [error, setError] = useState<string | null>(null);

  const fetchArticle = useCallback(async (articleId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ArticleService.getArticleById(articleId);
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement de l'article");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) fetchArticle(id);
  }, [id, fetchArticle]);

  return {
    article,
    loading,
    error,
    refresh: () => id && fetchArticle(id),
  };
};

// =====================================================
// ACTIONS (CRUD)
// =====================================================

export const useArticlesActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createArticle = useCallback(async (data: CreateArticleRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await ArticleService.createArticle(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateArticle = useCallback(async (id: number, data: UpdateArticleRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await ArticleService.updateArticle(id, data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteArticle = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      return await ArticleService.deleteArticle(id);
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
      return await ArticleService.toggleActif(id, actif);
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
    createArticle,
    updateArticle,
    deleteArticle,
    toggleActif,
    clearError: () => setError(null),
  };
};
