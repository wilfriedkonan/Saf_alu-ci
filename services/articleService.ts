// services/articleService.ts

import axios, { AxiosResponse } from 'axios';
import apiClient from '@/lib/auth';
import {
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  ArticleListParams,
} from '@/types/article';
import { PagedResponse, ApiResponse } from '@/types/stock';

export class ArticleService {

  // =====================================================
  // LISTE COMPLÈTE (pour selects / dropdowns)
  // =====================================================

  static async getArticles(params: { actif?: boolean; categorieId?: number } = {}): Promise<Article[]> {
    try {
      const query = new URLSearchParams();
      if (params.actif !== undefined) query.append('actif', String(params.actif));
      if (params.categorieId)         query.append('categorieId', String(params.categorieId));
      const response: AxiosResponse<Article[]> = await apiClient.get(
        `/Stock/articles?${query}`
      );
      return response.data;
    } catch (error) {
      throw ArticleService.handleError(error);
    }
  }

  // =====================================================
  // LISTE PAGINÉE
  // =====================================================

  static async getArticlesPaged(params: ArticleListParams = {}): Promise<PagedResponse<Article>> {
    try {
      const query = new URLSearchParams();
      if (params.page)        query.append('page',        String(params.page));
      if (params.pageSize)    query.append('pageSize',    String(params.pageSize));
      if (params.search)      query.append('search',      params.search);
      if (params.categorieId) query.append('categorieId', String(params.categorieId));
      if (params.depotId)     query.append('depotId',     String(params.depotId));
      if (params.actif !== undefined) query.append('actif', String(params.actif));
      const response: AxiosResponse<PagedResponse<Article>> = await apiClient.get(
        `/Stock/articles/paged?${query}`
      );
      return response.data;
    } catch (error) {
      throw ArticleService.handleError(error);
    }
  }

  // =====================================================
  // DÉTAIL PAR ID
  // =====================================================

  static async getArticleById(id: number): Promise<Article> {
    try {
      const response: AxiosResponse<Article> = await apiClient.get(
        `/Stock/articles/${id}`
      );
      return response.data;
    } catch (error) {
      throw ArticleService.handleError(error);
    }
  }

  // =====================================================
  // CRÉATION
  // =====================================================

  static async createArticle(data: CreateArticleRequest): Promise<ApiResponse<Article>> {
    try {
      const response: AxiosResponse<ApiResponse<Article>> = await apiClient.post(
        '/Stock/articles',
        data
      );
      return response.data;
    } catch (error) {
      throw ArticleService.handleError(error);
    }
  }

  // =====================================================
  // MISE À JOUR
  // =====================================================

  static async updateArticle(
    id: number,
    data: UpdateArticleRequest
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/Stock/articles/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw ArticleService.handleError(error);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  static async deleteArticle(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(
        `/Stock/articles/${id}`
      );
      return response.data;
    } catch (error) {
      throw ArticleService.handleError(error);
    }
  }

  // =====================================================
  // ACTIVER / DÉSACTIVER
  // =====================================================

  static async toggleActif(id: number, actif: boolean): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.patch(
        `/Stock/articles/${id}/actif`,
        { actif }
      );
      return response.data;
    } catch (error) {
      throw ArticleService.handleError(error);
    }
  }

  // =====================================================
  // GESTION CENTRALISÉE DES ERREURS
  // =====================================================

  private static handleError(error: unknown): Error {
    let message = "Une erreur inattendue s'est produite";

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as any;
        switch (status) {
          case 400: message = data?.message || 'Données invalides';               break;
          case 401: message = 'Non autorisé - Veuillez vous reconnecter';         break;
          case 403: message = 'Accès interdit';                                   break;
          case 404: message = 'Article introuvable';                               break;
          case 409: message = data?.message || 'Cet article existe déjà';        break;
          case 422: message = data?.message || 'Données non valides';             break;
          case 500: message = 'Erreur serveur interne';                           break;
          default:  message = data?.message || `Erreur ${status}`;
        }
      } else if (error.request) {
        message = 'Erreur de connexion - Vérifiez votre réseau';
      }
    }

    return new Error(message);
  }
}
