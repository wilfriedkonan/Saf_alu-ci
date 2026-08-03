// services/categorieService.ts

import axios, { AxiosResponse } from 'axios';
import apiClient from '@/lib/auth';
import {
  Categorie,
  CreateCategorieRequest,
  UpdateCategorieRequest,
  CategorieListParams,
} from '@/types/categorie';
import { PagedResponse, ApiResponse } from '@/types/stock';

export class CategorieService {

  // =====================================================
  // LISTE COMPLÈTE (pour selects / dropdowns)
  // =====================================================

  static async getCategories(actif?: boolean): Promise<Categorie[]> {
    try {
      const query = new URLSearchParams();
      if (actif !== undefined) query.append('actif', String(actif));
      const response: AxiosResponse<Categorie[]> = await apiClient.get(
        `/Stock/categories?${query}`
      );
      return response.data;
    } catch (error) {
      throw CategorieService.handleError(error);
    }
  }

  // =====================================================
  // LISTE PAGINÉE
  // =====================================================

  static async getCategoriesPaged(
    params: CategorieListParams = {}
  ): Promise<PagedResponse<Categorie>> {
    try {
      const query = new URLSearchParams();
      if (params.page)     query.append('page',     String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search)   query.append('search',   params.search);
      if (params.actif !== undefined) query.append('actif', String(params.actif));
      const response: AxiosResponse<PagedResponse<Categorie>> = await apiClient.get(
        `/Stock/categories/paged?${query}`
      );
      return response.data;
    } catch (error) {
      throw CategorieService.handleError(error);
    }
  }

  // =====================================================
  // DÉTAIL PAR ID
  // =====================================================

  static async getCategorieById(id: number): Promise<Categorie> {
    try {
      const response: AxiosResponse<Categorie> = await apiClient.get(
        `/Stock/categories/${id}`
      );
      return response.data;
    } catch (error) {
      throw CategorieService.handleError(error);
    }
  }

  // =====================================================
  // CRÉATION
  // =====================================================

  static async createCategorie(
    data: CreateCategorieRequest
  ): Promise<ApiResponse<Categorie>> {
    try {
      const response: AxiosResponse<ApiResponse<Categorie>> = await apiClient.post(
        '/Stock/categories',
        data
      );
      return response.data;
    } catch (error) {
      throw CategorieService.handleError(error);
    }
  }

  // =====================================================
  // MISE À JOUR
  // =====================================================

  static async updateCategorie(
    id: number,
    data: UpdateCategorieRequest
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/Stock/categories/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw CategorieService.handleError(error);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  static async deleteCategorie(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(
        `/Stock/categories/${id}`
      );
      return response.data;
    } catch (error) {
      throw CategorieService.handleError(error);
    }
  }

  // =====================================================
  // ACTIVER / DÉSACTIVER
  // =====================================================

  static async toggleActif(id: number, actif: boolean): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.patch(
        `/Stock/categories/${id}/actif`,
        { actif }
      );
      return response.data;
    } catch (error) {
      throw CategorieService.handleError(error);
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
          case 400: message = data?.message || 'Données invalides';                   break;
          case 401: message = 'Non autorisé - Veuillez vous reconnecter';             break;
          case 403: message = 'Accès interdit';                                       break;
          case 404: message = 'Catégorie introuvable';                                break;
          case 409: message = data?.message || 'Cette catégorie existe déjà';        break;
          case 422: message = data?.message || 'Données non valides';                 break;
          case 500: message = 'Erreur serveur interne';                               break;
          default:  message = data?.message || `Erreur ${status}`;
        }
      } else if (error.request) {
        message = 'Erreur de connexion - Vérifiez votre réseau';
      }
    }

    return new Error(message);
  }
}
