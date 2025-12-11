// ============================================
// INTERFACES PRINCIPALES - TRÉSORERIE
// ============================================

import { Facture } from "./invoices"
import { Project } from "./projet"
import Utilisateurs, { Utilisateur } from "./Utilisateurs"

export interface Compte {
    id: number
    nom: string
    typeCompte: TypeCompte
    numero?: string
    banque?: string
    soldeInitial: number
    soldeActuel: number
    dateCreation: string
    actif: boolean
    
    // Navigation properties (optionnelles)
    mouvements?: MouvementFinancier[]
    mouvementsDestination?: MouvementFinancier[]
  }
  
  export interface MouvementFinancier {
    id: number
    compteId: number
    typeMouvement: TypeMouvement
    categorie?: string
    
    // Relations optionnelles vers autres entités
    factureId?: number
    projetId?: number
    sousTraitantId?: number
    
    libelle: string
    description?: string
    montant: number
    dateMouvement: string
    dateSaisie: string
    modePaiement?: string
    reference?: string
    
    // Pour les virements
    compteDestinationId?: number
    
    utilisateurSaisie: number
    
    // Navigation properties (optionnelles)
    compte?: Compte
    compteDestination?: Compte
    facture? : Facture
    projet?:Project
    utilisateurSaisieProp: Utilisateurs
  }
  interface Utilisateurs {
    
    nom: string;
    prenom: string; }
  // ============================================
  // DTOs POUR CRÉATION ET MODIFICATION
  // ============================================
  
  export interface CreateCompteRequest {
    nom: string
    typeCompte: TypeCompte
    numero?: string
    banque?: string
    soldeInitial: number
  }
  
  export interface UpdateCompteRequest {
    nom: string
    numero?: string
    banque?: string
  }
  
  export interface CreateMouvementRequest {
    compteId: number
    typeMouvement: TypeMouvement
    categorie?: string
    
    // Relations optionnelles
    factureId?: number
    projetId?: number
    sousTraitantId?: number
    etapeProjetId?: number 
    
    libelle: string
    description?: string
    montant: number
    dateMouvement?: string | Date
    modePaiement?: string
    reference?: string
    
    // Pour les virements uniquement
    compteDestinationId?: number
  }
  
  export interface VirementRequest {
    compteSourceId: number
    compteDestinationId: number
    montant: number
    libelle: string
    description?: string
    dateMouvement?: string | Date
    reference?: string
  }
  
  export interface CorrectionSoldeRequest {
    nouveauSolde: number
    motifCorrection: string
    reference?: string
  }
  
  // ============================================
  // STATISTIQUES ET REPORTING
  // ============================================
  
  export interface TresorerieStats {
    soldeTotal: number
    entreesMois: number
    sortiesMois: number
    beneficeMois: number
    entreesAnnee: number
    sortiesAnnee: number
    beneficeAnnee: number
    
    fluxMensuels: ChartData[]
    beneficesParProjet: ChartData[]
    repartitionParCategorie: ChartData[]
    evolutionSoldes: ChartData[]
    fluxSemestre : ChartData[]
    
    indicateurs: TresorerieIndicateurs
  }
  
  export interface TresorerieIndicateurs {
    tauxCroissanceMensuel: number
    moyenneMouvementsParJour: number
    plusGrosseEntree: number
    plusGrosseSortie: number
    compteLesPlusUtilise?: string
    nombreMouvementsMois: number
  }
  
  export interface ChartData {
    label: string
    value: number
    color?: string
    metaDonnees?: Record<string, any>
  }
  
  export interface RapportTresorerie {
    dateDebut: string
    dateFin: string
    comptesAnalyses: Compte[]
    mouvements: MouvementFinancier[]
    statistiques: TresorerieStats
    alertes: AlerteTresorerie[]
  }
  
  export interface AlerteTresorerie {
    type: string // SoldeFaible, MouvementImportant, etc.
    message: string
    niveau: NiveauAlerte
    dateDetection: string
    contexte?: Record<string, any>
  }
  
  // ============================================
  // TYPES ET ENUMS
  // ============================================
  
  export type TypeCompte = "Courant" | "Epargne" | "Caisse"
  export type TypeMouvement = "Entree" | "Sortie" /* | "Virement" */
  export type NiveauAlerte = "Info" | "Attention" | "Critique"
  
  // ============================================
  // CONSTANTES - Types de Comptes
  // ============================================
  
  export const TypesCompte = {
    Courant: "Courant" as const,
    Epargne: "Epargne" as const,
    Caisse: "Caisse" as const,
  }
  
  export const typesCompteList: TypeCompte[] = ["Courant", "Epargne", "Caisse"]
  
  // ============================================
  // CONSTANTES - Types de Mouvements
  // ============================================
  
  export const TypesMouvement = {
    Entree: "Entree" as const,
    Sortie: "Sortie" as const,
    Virement: "Virement" as const,
  }
  
  export const typesMouvementList: TypeMouvement[] = ["Entree", "Sortie"/* , "Virement" */]
  
  // ============================================
  // CONSTANTES - Catégories de Mouvements
  // ============================================
  
  export const CategoriesMouvement = {
    FactureClient: "Facture client",
    PaiementSousTraitant: "Paiement sous-traitant",
    ChargesSociales: "Charges sociales",
    Assurances: "Assurances",
    Location: "Location",
    Fournitures: "Fournitures",
    Carburant: "Carburant",
    Maintenance: "Maintenance",
    Banque: "Frais bancaires",
    Autre: "Autre",
  } as const
  
  export const categoriesMouvementList = [
    "Facture client",
    "Paiement sous-traitant",
    "Charges sociales",
    "Assurances",
    "Location",
    "Fournitures",
    "Carburant",
    "Maintenance",
    "Frais bancaires",
    "Autre",
  ] as const
  
  // ============================================
  // LABELS ET COULEURS
  // ============================================
  
  export const typeCompteLabels: Record<TypeCompte, string> = {
    Courant: "Compte Courant",
    Epargne: "Compte Épargne",
    Caisse: "Caisse",
  }
  
  export const typeCompteColors: Record<TypeCompte, string> = {
    Courant: "bg-blue-100 text-blue-800",
    Epargne: "bg-green-100 text-green-800",
    Caisse: "bg-orange-100 text-orange-800",
  }
  
  export const typeMouvementLabels: Record<TypeMouvement, string> = {
    Entree: "Entrée",
    Sortie: "Sortie",
   /*  Virement: "Virement", */
  }
  
  export const typeMouvementColors: Record<TypeMouvement, string> = {
    Entree: "bg-green-100 text-green-800",
    Sortie: "bg-red-100 text-red-800",
/*     Virement: "bg-blue-100 text-blue-800",
 */  }
  
  export const niveauAlerteColors: Record<NiveauAlerte, string> = {
    Info: "bg-blue-100 text-blue-800",
    Attention: "bg-yellow-100 text-yellow-800",
    Critique: "bg-red-100 text-red-800",
  }
  
  // ============================================
  // FONCTIONS UTILITAIRES
  // ============================================
  
  /**
   * Formate un montant en devise locale (XOF)
   */
  export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }
  
  /**
   * Formate une date pour l'affichage
   */
  export const formatDate = (date: string | Date): string => {
    const d = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(d)
  }
  
  /**
   * Formate une date avec l'heure
   */
  export const formatDateTime = (date: string | Date): string => {
    const d = typeof date === "string" ? new Date(date) : date
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d)
  }
  
  /**
   * Convertit une Date en string ISO format pour l'API .NET
   */
  export const formatDateForAPI = (date: Date | undefined): string | undefined => {
    if (!date) return undefined
    return date.toISOString()
  }
  
  /**
   * Convertit une string ISO en Date pour l'affichage
   */
  export const parseDateFromAPI = (dateString: string | undefined): Date | undefined => {
    if (!dateString) return undefined
    return new Date(dateString)
  }
  
  /**
   * Calcule le solde total de tous les comptes actifs
   */
  export const calculateSoldeTotal = (comptes: Compte[]): number => {
    return comptes
      .filter(compte => compte.actif)
      .reduce((total, compte) => total + compte.soldeActuel, 0)
  }
  
  /**
   * Calcule le total des entrées pour une période
   */
  export const calculateTotalEntrees = (mouvements: MouvementFinancier[]): number => {
    return mouvements
      .filter(m => m.typeMouvement === "Entree")
      .reduce((total, m) => total + m.montant, 0)
  }
  
  /**
   * Calcule le total des sorties pour une période
   */
  export const calculateTotalSorties = (mouvements: MouvementFinancier[]): number => {
    return mouvements
      .filter(m => m.typeMouvement === "Sortie")
      .reduce((total, m) => total + m.montant, 0)
  }
  
  /**
   * Calcule le bénéfice (entrées - sorties)
   */
  export const calculateBenefice = (mouvements: MouvementFinancier[]): number => {
    const entrees = calculateTotalEntrees(mouvements)
    const sorties = calculateTotalSorties(mouvements)
    return entrees - sorties
  }
  
  /**
   * Filtre les mouvements par type
   */
  export const filterMouvementsByType = (
    mouvements: MouvementFinancier[],
    type: TypeMouvement
  ): MouvementFinancier[] => {
    return mouvements.filter(m => m.typeMouvement === type)
  }
  
  /**
   * Filtre les mouvements par catégorie
   */
  export const filterMouvementsByCategorie = (
    mouvements: MouvementFinancier[],
    categorie: string
  ): MouvementFinancier[] => {
    return mouvements.filter(m => m.categorie === categorie)
  }
  
  /**
   * Filtre les mouvements par compte
   */
  export const filterMouvementsByCompte = (
    mouvements: MouvementFinancier[],
    compteId: number
  ): MouvementFinancier[] => {
    return mouvements.filter(m => m.compteId === compteId)
  }
  
  /**
   * Filtre les mouvements par période
   */
  export const filterMouvementsByPeriode = (
    mouvements: MouvementFinancier[],
    dateDebut: Date,
    dateFin: Date
  ): MouvementFinancier[] => {
    return mouvements.filter(m => {
      const dateMvt = new Date(m.dateMouvement)
      return dateMvt >= dateDebut && dateMvt <= dateFin
    })
  }
  
  /**
   * Vérifie si un compte a un solde faible (< 10% du solde initial)
   */
  export const isSoldeFaible = (compte: Compte): boolean => {
    if (compte.soldeInitial === 0) return false
    const pourcentage = (compte.soldeActuel / compte.soldeInitial) * 100
    return pourcentage < 10
  }
  
  /**
   * Vérifie si un compte est en négatif
   */
  export const isSoldeNegatif = (compte: Compte): boolean => {
    return compte.soldeActuel < 0
  }
  
  /**
   * Calcule la variation du solde
   */
  export const calculateVariationSolde = (compte: Compte): number => {
    return compte.soldeActuel - compte.soldeInitial
  }
  
  /**
   * Calcule le pourcentage de variation du solde
   */
  export const calculateVariationPourcentage = (compte: Compte): number => {
    if (compte.soldeInitial === 0) return 0
    return ((compte.soldeActuel - compte.soldeInitial) / compte.soldeInitial) * 100
  }
  
  /**
   * Groupe les mouvements par catégorie
   */
  export const groupMouvementsByCategorie = (
    mouvements: MouvementFinancier[]
  ): Record<string, MouvementFinancier[]> => {
    return mouvements.reduce((groups, mouvement) => {
      const categorie = mouvement.categorie || "Non catégorisé"
      if (!groups[categorie]) {
        groups[categorie] = []
      }
      groups[categorie].push(mouvement)
      return groups
    }, {} as Record<string, MouvementFinancier[]>)
  }
  
  /**
   * Calcule les totaux par catégorie
   */
  export const calculateTotauxParCategorie = (
    mouvements: MouvementFinancier[]
  ): ChartData[] => {
    const grouped = groupMouvementsByCategorie(mouvements)
    
    return Object.entries(grouped).map(([categorie, mvts]) => ({
      label: categorie,
      value: mvts.reduce((sum, m) => sum + m.montant, 0),
    }))
  }