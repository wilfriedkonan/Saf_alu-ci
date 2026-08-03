// services/depotService.ts

import axios, { AxiosResponse } from 'axios';
import apiClient from '@/lib/auth';
import {
  Depot,
  CreateDepotRequest,
  UpdateDepotRequest,
  DepotListParams,
} from '@/types/depot';
import { PagedResponse, ApiResponse } from '@/types/stock';

export class DepotService {

  // =====================================================
  // LISTE COMPLÈTE (pour selects / dropdowns)
  // =====================================================

  static async getDepots(actif?: boolean): Promise<Depot[]> {
    try {
      const query = new URLSearchParams();
      if (actif !== undefined) query.append('actif', String(actif));
      const response: AxiosResponse<Depot[]> = await apiClient.get(
        `/Stock/depots?${query}`
      );
      return response.data;
    } catch (error) {
      throw DepotService.handleError(error);
    }
  }

  // =====================================================
  // LISTE PAGINÉE
  // =====================================================

  static async getDepotsPaged(params: DepotListParams = {}): Promise<PagedResponse<Depot>> {
    try {
      const query = new URLSearchParams();
      if (params.page)     query.append('page',     String(params.page));
      if (params.pageSize) query.append('pageSize', String(params.pageSize));
      if (params.search)   query.append('search',   params.search);
      if (params.actif !== undefined) query.append('actif', String(params.actif));
      const response: AxiosResponse<PagedResponse<Depot>> = await apiClient.get(
        `/Stock/depots/paged?${query}`
      );
      return response.data;
    } catch (error) {
      throw DepotService.handleError(error);
    }
  }

  // =====================================================
  // DÉTAIL PAR ID
  // =====================================================

  static async getDepotById(id: number): Promise<Depot> {
    try {
      const response: AxiosResponse<Depot> = await apiClient.get(`/Stock/depots/${id}`);
      return response.data;
    } catch (error) {
      throw DepotService.handleError(error);
    }
  }

  // =====================================================
  // CRÉATION
  // =====================================================

  static async createDepot(data: CreateDepotRequest): Promise<ApiResponse<Depot>> {
    try {
      const response: AxiosResponse<ApiResponse<Depot>> = await apiClient.post(
        '/Stock/depots',
        data
      );
      return response.data;
    } catch (error) {
      throw DepotService.handleError(error);
    }
  }

  // =====================================================
  // MISE À JOUR
  // =====================================================

  static async updateDepot(id: number, data: UpdateDepotRequest): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(
        `/Stock/depots/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw DepotService.handleError(error);
    }
  }

  // =====================================================
  // SUPPRESSION
  // =====================================================

  static async deleteDepot(id: number): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(
        `/Stock/depots/${id}`
      );
      return response.data;
    } catch (error) {
      throw DepotService.handleError(error);
    }
  }

  // =====================================================
  // ACTIVER / DÉSACTIVER
  // =====================================================

  static async toggleActif(id: number, actif: boolean): Promise<ApiResponse<void>> {
    try {
      const response: AxiosResponse<ApiResponse<void>> = await apiClient.patch(
        `/Stock/depots/${id}/actif`,
        { actif }
      );
      return response.data;
    } catch (error) {
      throw DepotService.handleError(error);
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
          case 404: message = 'Dépôt introuvable';                                break;
          case 409: message = data?.message || 'Ce dépôt existe déjà';           break;
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
