// services/fournisseurService.ts

import axios, { AxiosResponse } from 'axios';
import apiClient from '@/lib/auth';
import {
  Fournisseur,
  CreateFournisseurRequest,
  UpdateFournisseurRequest,
  FournisseurListParams,
} from '@/types/fournisseur';
import { PagedResponse, ApiResponse } from '@/types/stock';

export class FournisseurService {

  // =====================================================
  // LISTE COMPLÈTE (pour selects / dropdowns)
  // =====================================================

  static async getFournisseurs(actif?: boolean): Promise<Fournisseur[]> {
    try {
      const query = new URLSearchParams();
      if (actif !== undefined) query.append('actif', String(actif));
      const response: AxiosResponse<Fournisseur[]> = await apiClient.get(
        `/Stock/fournisseurs?${query}`
      );
      return response.data;
    } catch (error) {
      throw FournisseurService.handleError(error);
    }
  }

  // =====================================================
  // LISTE PAGINÉE
  // =====================================================

  static async getFournisseursPaged(
    params: FournisseurListParams = {}
  ): Promise<PagedResponse<Fournisseur>> {
    try {
      const query = new URLSearchParams();
      if (params.page)      query.append('page',       String(params.page));
      if (params.pageSize)  query.append('pageSize',   String(params.pageSize));
      if (params.search)    query.append('search',     params.search);
      if (params.actif !== undefined) query.append('actif', String(params.actif));
      if (params.specialite) query.append('specialite', params.specialite);
      const response: AxiosResponse<PagedResponse<Fournisseur>> = await apiClient.get(
        `/Stock/fournisseurs/paged?${query}`
      );
      return response.data;
    } catch (error) {
      throw FournisseurService.handleError(error);
    }
  }

  // =====================================================
  // DÉTAIL PAR ID
  // =====================================================

  static async getFournisseurById(id: number): Promise<Fournisseur> {
    try {
      const response: AxiosResponse<Fournisseur> = await apiClient.get(
        `/Stock/fournisseurs/${id}`
      );
      return response.data;
    } catch (error) {
      throw FournisseurService.handleError(error);
    }
  }

  // =====================================================
  // CRÉATION
  // =====================================================

  static async createFournisseur(
    data: CreateFournisseurRequest
  ): Promise<ApiResponse<Fournisseur>> {
    try {
      const response: AxiosResponse<ApiResponse<Fournisseur>> = await apiClient.post(
        '/Stock/fournisseurs',
        data
      );
      return response.data;
    } catch (error) {
      throw FournisseurService.handleError(error);
    }
  }

  // =====================================================
  // MISE À JOUR
  // =====================================================

  static async updateFournisseur(
    id: number,
    data: UpdateFournisseurRequest
  ): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/Stock/fournisseurs/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw FournisseurService.handleError(error);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  static async deleteFournisseur(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(
        `/Stock/fournisseurs/${id}`
      );
      return response.data;
    } catch (error) {
      throw FournisseurService.handleError(error);
    }
  }

  // =====================================================
  // ACTIVER / DÉSACTIVER
  // =====================================================

  static async toggleActif(id: number, actif: boolean): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.patch(
        `/Stock/fournisseurs/${id}/actif`,
        { actif }
      );
      return response.data;
    } catch (error) {
      throw FournisseurService.handleError(error);
    }
  }

  // =====================================================
  // GESTION CENTRALISÉE DES ERREURS
  // =====================================================

  private static handleError(error: unknown): Error {
    let message = 'Une erreur inattendue s\'est produite';

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data as any;
        switch (status) {
          case 400: message = data?.message || 'Données invalides';                      break;
          case 401: message = 'Non autorisé - Veuillez vous reconnecter';                break;
          case 403: message = 'Accès interdit';                                          break;
          case 404: message = 'Fournisseur introuvable';                                 break;
          case 409: message = data?.message || 'Ce fournisseur existe déjà';             break;
          case 422: message = data?.message || 'Données non valides';                    break;
          case 500: message = 'Erreur serveur interne';                                  break;
          default:  message = data?.message || `Erreur ${status}`;
        }
      } else if (error.request) {
        message = 'Erreur de connexion - Vérifiez votre réseau';
      }
    }

    return new Error(message);
  }
}
