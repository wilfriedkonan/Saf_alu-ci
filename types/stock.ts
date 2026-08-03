// types/stock.ts

// =====================================================
// PAGINATION GÉNÉRIQUE
// =====================================================

export interface PagedResponse<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PagedParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

// =====================================================
// CATÉGORIE
// =====================================================

export interface Categorie {
  id: number;
  code: string;
  nom: string;
  description?: string;
  couleur?: string;
  actif: boolean;
  dateCreation: string;
  dateModification: string;
}

export interface CreateCategorieRequest {
  code: string;
  nom: string;
  description?: string;
  couleur?: string;
}

export interface UpdateCategorieRequest extends CreateCategorieRequest {
  actif?: boolean;
}

// =====================================================
// DÉPÔT
// =====================================================

export interface Depot {
  id: number;
  code: string;
  nom: string;
  adresse?: string;
  responsable?: string;
  actif: boolean;
  dateCreation: string;
  dateModification: string;
}

export interface CreateDepotRequest {
  code: string;
  nom: string;
  adresse?: string;
  responsable?: string;
}

export interface UpdateDepotRequest extends CreateDepotRequest {
  actif?: boolean;
}

// =====================================================
// FOURNISSEUR
// =====================================================

export interface Fournisseur {
  id: number;
  code: string;
  nom: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  specialites?: string[];
  actif: boolean;
  dateCreation: string;
  dateModification: string;
}

export interface CreateFournisseurRequest {
  code: string;
  nom: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  specialites?: string[];
}

export interface UpdateFournisseurRequest extends CreateFournisseurRequest {
  actif?: boolean;
}

// =====================================================
// ARTICLE
// =====================================================

export interface Article {
  id: number;
/*   code: string;
 */  articleReference?: string;
  reference?: string;
  Nom: string;
  description?: string;
  categorieId: number;
  categorie?: Categorie;
  categorieCouleur?: string;
  categorieNom?: string;
  unite: string;
  prixUnitaireMoyenMoyen: number;
  seuilAlerte: number;
  fournisseurPreferentielId?: number;
  fournisseurPreferentiel?: Fournisseur;
  actif: boolean;
  dateCreation: string;
  dateModification: string;
}

export interface CreateArticleRequest {
  /* code?: string; */
  reference?: string;
  Nom: string;
  description?: string;
  categorieId: number;
  unite: string;
  prixUnitaireMoyenMoyen: number;
  seuilAlerte: number;
  fournisseurPreferentielId?: number;
}

export interface UpdateArticleRequest extends CreateArticleRequest {
  actif?: boolean;
}

// =====================================================
// INVENTAIRE
// =====================================================

export type StatutStock = 'Normal' | 'Critique' | 'Rupture' | 'Surstock';

export interface InventaireItem {
  id: number;
  articleId: number;
  article?: Article;
  depotId: number;
  depot?: Depot;
  quantiteDisponible: number;
  quantiteReservee: number;
  quantiteLibre: number;
  valeurStock: number;
  statut: StatutStock;
}

export interface ItemInventaire {
  articleId: number;
  reference: string;
  articleNom: string;
  unite: string;
  seuilMinimum?: number;
  seuilMaximum: number;
  prixUnitaireMoyenMoyenMoyen: number;
  categorieId: number;
  categorieNom: string;
  categorieCouleur: string;
  depotId: number;
  depotCode: string;
  depotNom: string;
  quantiteDisponible: number;
  quantiteReservee: number;
  quantiteLibre: number;
  valeurStock: number;
  niveauAlerte: string;
  enAlerte: boolean,
  dateDernierMouvement: string;
  statut: StatutStock;
}

export const StatutStockLabels: Record<StatutStock, string> = {
  Normal: 'Normal',
  Critique: 'Critique',
  Rupture: 'Rupture',
  Surstock: 'Surstock',
};

export const StatutStockColors: Record<StatutStock, string> = {
  Normal: 'bg-green-100 text-green-800',
  Critique: 'bg-amber-100 text-amber-800',
  Rupture: 'bg-red-100 text-red-800',
  Surstock: 'bg-blue-100 text-blue-800',
};

// =====================================================
// ALERTE
// =====================================================

export interface Alerte {
  articleId: number;
  articleCode: string;
  articleDesignation: string;
  categorieNom?: string;
  depotId?: number;
  depotNom?: string;
  quantiteDisponible: number;
  seuilAlerte: number;
  statut: 'Critique' | 'Rupture';
}

// =====================================================
// DEMANDE DE STOCK
// =====================================================

export type StatutDemande =
  | 'EnAttente'
  | 'EnTraitement'
  | 'AttenteValidation'
  | 'AttenteComptabilite'
  | 'Livree'
  | 'Rejetee'
  | 'AttenteLivraison'
  | 'LivraisonPartielle'
  | 'Dotee';

/** Sous-ligne de dotation multi-dépôt (Stock_DemandeArticleDotations) */
export interface ArticleDotationItem {
  id: number;
  demandeArticleId: number;
  depotId: number;
  depotNom: string;
  depotCode: string;
  quantiteDotee: number;
  estLivre: boolean;
  userValidationNom?: string;
  dateConfirmationLivraison?: string;   // DateLivraisonConfirmee
  mouvementId?: number;
}
export interface LotEntreeDTO {
  id: number
  rangFifo: number
  quantiteEntree: number
  quantiteRestante: number
  quantiteConsommee: number
  pourcentageConsomme: number
  prixUnitaireMoyenMoyen?: number | null
  valeurRestante?: number | null
  reference?: string | null
  notes?: string | null
  dateCreation: string
  mouvementEntreeId?: number | null
}
 
export interface DetailsInventaireDTO {
  articleId: number
  articleNom: string
  articleReference: string
  unite: string
  depotId: number
  depotNom: string
  quantiteDisponible: number
  quantiteTotaleLots: number
  ecartNonTrace: number
  valeurTotaleEstimee?: number | null
  lots: LotEntreeDTO[]
}
 
export interface ArticleDemandeItem {
  id: number;
  articleId?: number;
  articleReference?: string;
  articleNom?: string;
  articleDescription?: string;
  designationLibre?: string;
  isHorsCatalogue: boolean;
  unite: string;
  quantiteDemandee: number;
  quantiteValidee: number;
  quantiteLivree?: number;
  prixUnitaireMoyenMoyenDevis?: number;
  prixTotalLigne: number;
  montantHT?: number;
  notes?: string;
  // ── Traitement partiel ──────────────────────────────────
  /** "Stock" | "Commande" | "CommandeReste" */
  source: string;
  depotDotationId?: number;
  depotDotationNom?: string;
  quantiteDotee?: number;
  // ── Livraison ───────────────────────────────────────────
  estLivre: boolean;
  userValidationLivraisonId?: number;
  userValidationLivraisonNom?: string;
  dateConfirmationLivraison?: string;   // DateLivraisonConfirmee
  /** Sous-lignes dotations multi-dépôts (source = "Stock") */
  dotations: ArticleDotationItem[];
}

export interface ArticleTraiteItem {
  id: number;
  articleDemandeId: number;
  quantiteValidee: number;
  prixUnitaireMoyenMoyenDevis: number;
  montantLigne: number;
}

export interface TraitementDemande {
  id: number;
  fournisseurId?: number;
  fournisseurNom?: string;
  nomFournisseurLibre?: string;
  numeroDevis?: string;
  dateDevis?: string;
  montantDevisHT?: number;        // nullable côté API
  montantDevisTTC?: number;       // nullable côté API
  delaiLivraison?: string;
  conditionsPaiement?: string;
  notes?: string;
  fichierDevisPath?: string;
  statutTraitement: 'Brouillon' | 'Complet';
  traiteParNom?: string;
  dateModification?: string;
  articlesValides?: ArticleTraiteItem[];
}

export interface Demande {
  id: number;
  numero: string;
  nomDemandeur: string;
  posteDemandeur?: string;
  typeDestination: 'Administration' | 'Projet';
  projetId?: number;
  projetNom?: string;
  projetNumero?: string;
  etapeProjetId?: number;
  etapeNom?: string;              // anciennement etapeProjetNom
  motifDemande: string;
  dateDemande: string;
  statut: StatutDemande;
  montantTotal: number;
  fournisseur?: string;
  articles: ArticleDemandeItem[];
  traitement?: TraitementDemande;
  notesTraitement?: string;
  notesValidation?: string;
  dateDebutTraitement?: string;
  dateValidation?: string;
  dateLivraisonReelle?: string;   // anciennement dateLivraison
  dateLivraisonPrevue?: string;
  validateurNom?: string;
  commentaireRejet?: string;
  /** Progression livraison */
  nbArticlesLivres?: number;
  nbArticlesTotal?: number;
  /** Mouvements liés à cette demande (sorties dotation + entrées) */
  mouvements?: MouvementDemandeItem[];
}

/** Mouvement simplifié dans le détail d'une demande (MouvementDemandeDTO) */
export interface MouvementDemandeItem {
  id: number;
  dateMouvement: string;
  typeMouvement: string;
  articleId: number;
  articleNom: string;
  articleReference: string;
  unite: string;
  depotId: number;
  depotNom: string;
  quantite: number;
  quantiteAvant: number;
  quantiteApres: number;
  prixUnitaireMoyenMoyen?: number;
  motifSortie?: string;
  operateurNom: string;
  notes?: string;
  dotationId?: number;
}

export interface CreateDemandeRequest {
  nomDemandeur: string;
  posteDemandeur?: string;
  typeDestination: 'Administration' | 'Projet';
  projetId?: number;
  etapeProjetId?: number;
  motifDemande: string;
  utilisateurId?: number;
  demandeurId:number;
  articles: {
    articleId?: number;
    designationLibre?: string;
    isHorsCatalogue: boolean;
    unite: string;
    quantiteDemandee: number;
    notes?: string;
    
  }[];
}

export interface TraitementRequest {
  fournisseurId?: number;
  nomFournisseurLibre?: string;
  numeroDevis?: string;
  dateDevis?: string;
  montantDevisHT: number;
  montantDevisTTC: number;
  delaiLivraison?: string;
  conditionsPaiement?: string;
  notes?: string;
  articlesValides: {
    demandeArticleId: number;
    quantiteValidee: number;
    prixUnitaireMoyenMoyenDevis: number;
    source?: string;
    depotDotationId?: number
    quantiteDotee?: number;
  }[];
}

export interface ValiderDemandeRequest {
  notesValidation?: string;
  dateLivraisonPrevue?: string;
}

export interface RejeterDemandeRequest {
  motifRejet: string;
}

export interface LivraisonDirecteRequest {
  /** Id de Stock_DemandeArticleDotations — obligatoire côté API */
  dotationId: number;
}

/** Réponse de POST .../livraison/direct */
export interface LivraisonDirecteResponse {
  mouvementId: number;
  stockApres: number;
  tousLivres: boolean;
  nouveauStatut: string;
  message: string;
}

export const StatutDemandeLabels: Record<StatutDemande, string> = {
  EnAttente: 'En attente',
  EnTraitement: 'En traitement',
  AttenteValidation: 'Attente validation',
  AttenteLivraison: 'Attente livraison',
  AttenteComptabilite: 'Attente comptabilité',
  LivraisonPartielle: 'Livraison partielle',
  Livree: 'Livrée',
  Rejetee: 'Rejetée',
  Dotee: 'Doté',
};

export const StatutDemandeColors: Record<StatutDemande, string> = {
  EnAttente: 'bg-gray-100 text-gray-800',
  EnTraitement: 'bg-blue-100 text-blue-800',
  AttenteValidation: 'bg-amber-100 text-amber-800',
  AttenteLivraison: 'bg-orange-100 text-amber-800',
  AttenteComptabilite: 'bg-purple-100 text-purple-800',
  LivraisonPartielle: 'bg-yellow-100 text-yellow-800',
  Dotee: 'bg-cyan-100 text-cyan-800',
  Livree: 'bg-green-100 text-green-800',
  Rejetee: 'bg-red-100 text-red-800',
};

// =====================================================
// MOUVEMENT DE STOCK
// =====================================================

export type TypeMouvement = 'Entree' | 'Sortie' | 'Transfert' | 'Ajustement';

export interface Mouvement {
  mouvementId: number;
  dateMouvement: string;
  typeMouvement: TypeMouvement;
  reference: string;
  articleId: number;
  article?: Article;
  articleReference? : string;
  articleNom: string ;
  unite: string;
  categorieNom: string;
  depotId: number;
  depotNom?: Depot;
  depotDestinationId?: number;
  depotDestinationNom?: string;
  quantite?: number;
  quantiteApres: number;
  prixUnitaireMoyenMoyen?: number;
  projetId?: number;
  projetNom?: string;
  demandeId?: number;
  demandeNumero?: string;
  operateurNom?: string;
  notes?: string;
}

export interface EntreeStockRequest {
  articleId: number;
  depotId: number;
  quantite: number;
  prixUnitaireMoyenMoyen?: number;
  fournisseurId?: number;
  reference?: string;
  notes?: string;
}

export interface SortieStockRequest {
  articleId: number;
  depotId: number;
  quantite: number;
  projetId?: number;
  demandeId?: number;
  reference?: string;
  notes?: string;
}

export interface TransfertStockRequest {
  articleId: number;
  depotSourceId: number;
  depotDestinationId: number;
  quantite: number;
  reference?: string;
  notes?: string;
}

export const TypeMouvementLabels: Record<TypeMouvement, string> = {
  Entree: 'Entrée',
  Sortie: 'Sortie',
  Transfert: 'Transfert',
  Ajustement: 'Ajustement',
};

export const TypeMouvementColors: Record<TypeMouvement, string> = {
  Entree: 'bg-green-100 text-green-800',
  Sortie: 'bg-red-100 text-red-800',
  Transfert: 'bg-blue-100 text-blue-800',
  Ajustement: 'bg-purple-100 text-purple-800',
};

// =====================================================
// BORDEREAUX (entrée / sortie multi-lignes)
// =====================================================

export interface BordereauLigneEntreeRequest {
  articleId: number;
  quantite: number;
  prixUnitaire?: number;
  /** Note spécifique à cette ligne (état, lot fournisseur…) */
  notes?: string;
}

export interface BordereauEntreeRequest {
  depotId: number;
  /** N° de BL, de bon de commande, ou référence libre */
  reference?: string;
  fournisseurId?: number;
  notes?: string;
  lignes: BordereauLigneEntreeRequest[];
}

export interface BordereauLigneSortieRequest {
  articleId: number;
  quantite: number;
  notes?: string;
}

export interface BordereauSortieRequest {
  depotId: number;
  reference?: string;
  projetId?: number;
  etapeProjetId?: number;
  motifSortie?: string;
  notes?: string;
  lignes: BordereauLigneSortieRequest[];
}

export interface BordereauLigneResultDTO {
  articleId: number;
  articleNom: string;
  articleReference: string;
  quantite: number;
  prixUnitaire?: number;
  mouvementId?: number;
  quantiteAvant?: number;
  quantiteApres?: number;
  succes: boolean;
  erreur?: string;
}

export interface BordereauEntreeResultDTO {
  reference?: string;
  depotId: number;
  depotNom: string;
  nbLignesTotal: number;
  nbLignesReussies: number;
  montantTotalEntre: number;
  lignes: BordereauLigneResultDTO[];
  message: string;
}

export interface BordereauSortieResultDTO {
  reference?: string;
  depotId: number;
  depotNom: string;
  nbLignesTotal: number;
  nbLignesReussies: number;
  nbLignesEchec: number;
  lignes: BordereauLigneResultDTO[];
  message: string;
}

// =====================================================
// STATISTIQUES
// =====================================================

export interface StockStatistiques {
  totalArticles: number;
  totalDepots: number;
  valeurTotaleStock: number;
  articlesEnAlerte: number;
  articlesEnRupture: number;
  demandesEnAttente: number;
  demandesEnTraitement: number;
  demandesAttenteValidation: number;
  demandesAttenteLivraison: number;
  demandesLivraisonPartielle: number;
  demandesAttenteComptabilite: number;
  mouvementsDuMois: number;
}

// =====================================================
// RAPPORTS
// =====================================================

/** DemandeParProjetDTO */
export interface RapportDemandesParProjet {
  demandeId: number;
  numero: string;
  statut: string;
  typeDestination: string;
  nomDemandeur: string;
  posteDemandeur: string;
  dateDemande: string;
  montantTotal: number;
  dateValidation?: string;
  dateLivraisonPrevue?: string;
  dateLivraisonReelle?: string;
  projetId?: number;
  projetNumero?: string;
  projetNom?: string;
  etapeId?: number;
  etapeNom?: string;
  nombreArticles: number;
  totalQteDemandee: number;
  montantLignes: number;
  dureeTraitement: number;
  validateurNom?: string;
  numeroDevis?: string;
  montantDevisHT?: number;
  fournisseurNom?: string;
}

/** RapportFournisseurDTO */
export interface RapportFournisseur {
  fournisseurId: number;
  fournisseurCode: string;
  fournisseurNom: string;
  telephone?: string;
  email?: string;
  ville?: string;
  noteEvaluation: number;
  nombreCommandes: number;
  montantTotalHT: number;
  montantMoyenCommande: number;
  derniereCommande?: string;
  nombreArticlesPreferentiels: number;
}

// =====================================================
// API RESPONSE GÉNÉRIQUE
// =====================================================

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// =====================================================
// HELPERS
// =====================================================

export function formatMontantStock(montant: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(montant).replace(/\u202F/g, ' ') + ' F CFA';
}
