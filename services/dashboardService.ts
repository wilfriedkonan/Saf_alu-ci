// services/dashboardService.ts

import axios, { AxiosResponse } from 'axios';
import type {
  DashboardStatsGlobal,
  DashboardStatsChefProjet,
  DashboardStatsCommercial,
  DashboardStatsComptable,
  ChartData,
  AlerteProjet,
  ActiviteRecente,
  DonneesCompletesDashboard,
  DashboardKPIs,
  ProjetActif,
} from '@/types/dashboard';
import apiClient from '@/lib/auth';

// =============================================
// SERVICE DASHBOARD
// =============================================

export class DashboardService {
  /**
   * Récupère les statistiques globales (admin/super_admin)
   */
  static async getStatistiquesGlobales(): Promise<DashboardStatsGlobal> {
    try {
      const response: AxiosResponse<DashboardStatsGlobal> = await apiClient.get(
        '/Dashboard/statistiques-globales'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques chef de projet
   */
  static async getStatistiquesChefProjet(): Promise<DashboardStatsChefProjet> {
    try {
      const response: AxiosResponse<DashboardStatsChefProjet> = await apiClient.get(
        '/Dashboard/statistiques-chef-projet'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques commercial
   */
  static async getStatistiquesCommercial(): Promise<DashboardStatsCommercial> {
    try {
      const response: AxiosResponse<DashboardStatsCommercial> = await apiClient.get(
        '/Dashboard/statistiques-commercial'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les statistiques comptable
   */
  static async getStatistiquesComptable(): Promise<DashboardStatsComptable> {
    try {
      const response: AxiosResponse<DashboardStatsComptable> = await apiClient.get(
        '/Dashboard/statistiques-comptable'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère l'évolution du chiffre d'affaires
   */
  static async getEvolutionChiffreAffaires(mois: number = 6): Promise<ChartData[]> {
    try {
      const response: AxiosResponse<ChartData[]> = await apiClient.get(
        `/Dashboard/evolution-chiffre-affaires?mois=${mois}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère la répartition des projets par statut
   */
  static async getRepartitionProjets(): Promise<ChartData[]> {
    try {
      const response: AxiosResponse<ChartData[]> = await apiClient.get(
        '/Dashboard/repartition-projets'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les projets nécessitant attention
   */
  static async getProjetsAlerte(): Promise<AlerteProjet[]> {
    try {
      const response: AxiosResponse<AlerteProjet[]> = await apiClient.get(
        '/Dashboard/projets-alerte'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les activités récentes
   */
  static async getActivitesRecentes(limite: number = 10): Promise<ActiviteRecente[]> {
    try {
      const response: AxiosResponse<ActiviteRecente[]> = await apiClient.get(
        `/Dashboard/activites-recentes?limite=${limite}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère toutes les données du dashboard en une seule requête
   */
  static async getDonneesCompletes(): Promise<DonneesCompletesDashboard> {
    try {
      const response: AxiosResponse<DonneesCompletesDashboard> = await apiClient.get(
        '/Dashboard/donnees-completes'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================
  // MÉTHODES POUR ENDPOINTS EXISTANTS
  // =============================================

  /**
   * Récupère les KPIs de base (depuis v_KPIDashboard)
   */
  static async getKPIs(): Promise<DashboardKPIs> {
    try {
      const response: AxiosResponse<DashboardKPIs> = await apiClient.get(
        '/Dashboard/kpis'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère les projets actifs (depuis v_ProjetsActifs)
   */
  static async getProjetsActifs(): Promise<ProjetActif[]> {
    try {
      const response: AxiosResponse<ProjetActif[]> = await apiClient.get(
        '/Dashboard/projets-actifs'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Récupère la répartition par type de projet
   */
  static async getRepartitionProjetsParType(): Promise<ChartData[]> {
    try {
      const response: AxiosResponse<ChartData[]> = await apiClient.get(
        '/Dashboard/repartition-projets-type'
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // =============================================
  // GESTION DES ERREURS
  // =============================================

  private static handleError(error: any): Error {
    let message = 'Une erreur inattendue est survenue';

    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            message = data?.message || 'Données invalides';
            break;
          case 401:
            message = 'Non autorisé - Veuillez vous reconnecter';
            break;
          case 403:
            message = 'Accès interdit';
            break;
          case 404:
            message = 'Ressource non trouvée';
            break;
          case 500:
            message = data?.message || 'Erreur serveur interne';
            break;
          default:
            message = data?.message || `Erreur ${status}`;
        }
      } else if (error.request) {
        message = 'Erreur de connexion - Vérifiez votre réseau';
      }
    }

    console.error('Erreur Dashboard:', message, error);
    return new Error(message);
  }
}

// =============================================
// EXPORT PAR DÉFAUT
// =============================================

export default DashboardService;