// types/dashboard.ts

/**
 * Types pour le Dashboard SAF ALU CI
 * Compatible avec le backend DashboardService.cs
 */

// =============================================
// KPIs et Statistiques
// =============================================

export interface StatKPI {
    valeur: string;
    changement: string;
    type: 'hausse' | 'baisse' | 'neutre';
  }
  
  export interface DashboardStatsGlobal {
    chiffreAffaires: StatKPI;
    projetsActifs: StatKPI;
    objectifAnnuel: StatKPI;
    soldeComptes: StatKPI;
  }
  
  export interface DashboardStatsChefProjet {
    mesProjets: StatKPI;
    projetsEnRetard: StatKPI;
    tachesTerminees: StatKPI;
    equipeActive: StatKPI;
  }
  
  export interface DashboardStatsCommercial {
    devisEnvoyes: StatKPI;
    tauxConversion: StatKPI;
    devisEnAttente: StatKPI;
    clientsProspects: StatKPI;
  }
  
  export interface DashboardStatsComptable {
    facturesImpayees: StatKPI;
    tresorerie: StatKPI;
    facturesMois: StatKPI;
    retardsPaiement: StatKPI;
  }
  
  // Union type pour toutes les statistiques possibles
  export type DashboardStats = 
    | DashboardStatsGlobal 
    | DashboardStatsChefProjet 
    | DashboardStatsCommercial 
    | DashboardStatsComptable;
  
  // =============================================
  // Graphiques et Charts
  // =============================================
  
  export interface ChartData {
    label: string;
    value: number;
    color?: string;
  }
  
  // =============================================
  // Alertes et Activités
  // =============================================
  
  export interface AlerteProjet {
    projetId: number;
    nomProjet: string;
    type: string;
    message: string;
    niveau: 'urgent' | 'attention' | 'info';
  }
  
  export interface ActiviteRecente {
    type: string;
    message: string;
    dateActivite: string;
    couleur: string;
  }
  
  // =============================================
  // Données complètes du dashboard
  // =============================================
  
  export interface DonneesCompletesDashboard {
    statistiques: DashboardStats;
    activitesRecentes: ActiviteRecente[];
    evolutionChiffreAffaires?: ChartData[];
    repartitionProjets?: ChartData[];
    projetsAlerte?: AlerteProjet[];
  }
  
  // =============================================
  // KPIs de base (depuis v_KPIDashboard)
  // =============================================
  
  export interface DashboardKPIs {
    projetsActifs: number;
    devisEnAttente: number;
    facturesImpayes: number;
    revenusMois: number;
    tresorerieTotal: number;
  }
  
  // =============================================
  // Projets actifs (depuis v_ProjetsActifs)
  // =============================================
  
  export interface ProjetActif {
    id: number;
    numero: string;
    nom: string;
    statut: string;
    pourcentageAvancement: number;
    nomClient: string;
    typeProjet: string;
    budgetRevise: number;
    coutReel: number;
    dateDebut?: string;
    dateFinPrevue?: string;
    chefProjet?: string;
  }
  
  // =============================================
  // Types de réponses API
  // =============================================
  
  export interface ApiResponse<T> {
    success?: boolean;
    message?: string;
    data?: T;
  }
  
  export interface ApiError {
    message: string;
    status?: number;
  }