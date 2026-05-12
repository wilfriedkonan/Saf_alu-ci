// =============================================
// TYPES – FOURNISSEUR
// =============================================

export interface Fournisseur {
  id: number
  nom: string
  raisonSociale?: string
  email?: string
  telephone?: string
  adresse?: string
  ville?: string
  nomContact?: string
  telephoneContact?: string
  emailContact?: string
  ncc?: string
  actif: boolean
  dateCreation: string
  dateModification: string
}

// =============================================
// TYPES – DEVIS FOURNISSEUR
// =============================================

export type TypeDevis = 'Classique' | 'Technique'
export type StatutDevis = 'Brouillon' | 'EnCours' | 'Cloture' | 'Selectionne'
export type StatutDemande = 'EnAttente' | 'LienOuvert' | 'OtpValide' | 'Repondu' | 'Expire' | 'Rejete'

export interface DevisSection {
  id: number
  devisId: number
  ordre: number
  titre: string
  description?: string
  remiseSectionPct: number
  remiseSectionValeur: number
  lignes: DevisLigne[]
}

export interface DevisLigne {
  id: number
  devisId: number
  sectionId?: number
  ordre: number
  designation: string
  description?: string
  unite?: string
  quantite: number
  // Technique
  typeElement?: string
  dimensionL?: number
  dimensionH?: number
  // Remises
  remiseLignePct: number
  remiseLigneValeur: number
}

export interface DevisLigneReponse {
  id: number
  demandeId: number
  ligneId: number
  prixUnitaire: number
  commentaire?: string
  dateSaisie: string
  ligneSelectionnee: boolean
}

export interface DevisDemande {
  id: number
  devisId: number
  fournisseurId: number
  fournisseurNom?: string
  fournisseurTelephone?: string
  token: string
  otp: string
  dateExpiration: string
  nbTentativesOtp: number
  otpValideA?: string
  statut: StatutDemande
  messageWhatsApp?: string
  lienDevis?: string
  dateEnvoi?: string
  dateOuvertureLien?: string
  dateReponse?: string
  selectionne: boolean
  dateSelection?: string
  commentaireSelection?: string
  dateCreation: string
  reponses: DevisLigneReponse[]
}

export interface DevisFournisseur {
  id: number
  reference: string
  typeDevis: TypeDevis
  titre: string
  description?: string
  dateLimiteReponse: string
  remiseGlobalePct: number
  remiseGlobaleValeur: number
  statut: StatutDevis
  dateCreation: string
  dateModification: string
  utilisateurCreation: number
  utilisateurModification: number
  sections: DevisSection[]
  lignes: DevisLigne[]
  demandes: DevisDemande[]
  nbDemandes:number
}

// =============================================
// TYPES – COMPARAISON
// =============================================

export interface OffreLigne {
  demandeId: number
  fournisseurId: number
  fournisseurNom: string
  prixUnitaire: number
  montantBrut: number
  montantNet: number
  commentaire?: string
  rangPrix: number
  ligneSelectionnee: boolean
}

export interface ComparaisonLigne {
  ligneId: number
  ordre: number
  designation: string
  unite?: string
  quantite: number
  typeElement?: string
  dimensionL?: number
  dimensionH?: number
  offres: OffreLigne[]
}

export interface SectionComparaison {
  sectionId: number
  sectionTitre: string
  lignes: ComparaisonLigne[]
}

export interface FournisseurTotal {
  demandeId: number
  fournisseurId: number
  fournisseurNom: string
  totalBrut: number
  totalNet: number
  selectionne: boolean
  commentaireSelection?: string
}

export interface ComparaisonDevis {
  devisId: number
  reference: string
  titre: string
  typeDevis: TypeDevis
  nombreFournisseursAyantRepondu: number
  totauxParFournisseur: FournisseurTotal[]
  sections: SectionComparaison[]
  lignes: ComparaisonLigne[]
}

// =============================================
// TYPES – REQUESTS
// =============================================

export interface CreateDevisFournisseurRequest {
  typeDevis: TypeDevis
  titre: string
  description?: string
  dateLimiteReponse: string
  remiseGlobalePct: number
  remiseGlobaleValeur: number
  sections: CreateSectionRequest[]
  lignes: CreateLigneRequest[]
}

export interface UpdateDevisFournisseurRequest {
  titre: string
  description?: string
  dateLimiteReponse: string
  remiseGlobalePct: number
  remiseGlobaleValeur: number
}

export interface CreateSectionRequest {
  titre: string
  description?: string
  remiseSectionPct: number
  remiseSectionValeur: number
  ordre: number
}

export interface CreateLigneRequest {
  designation: string
  description?: string
  unite?: string
  quantite: number
  sectionId?: number
  ordre: number
  typeElement?: string
  dimensionL?: number
  dimensionH?: number
  remiseLignePct: number
  remiseLigneValeur: number
}

export interface EnvoyerDemandesRequest {
  fournisseurIds: number[]
  dureeValiditeHeures: number
  messagePersonnalise?: string
}

export interface UpdateSectionRequest {
  titre: string
  description?: string
  remiseSectionPct: number
  remiseSectionValeur: number
  ordre: number
}

export interface UpdateLigneRequest {
  designation: string
  description?: string
  unite?: string
  quantite: number
  sectionId?: number
  ordre: number
  typeElement?: string
  dimensionL?: number
  dimensionH?: number
  remiseLignePct: number
  remiseLigneValeur: number
}

export interface SelectionnerFournisseurRequest {
  demandeId: number
  commentaire?: string
}

export interface SelectionnerLignesRequest {
  selectionParLigne: Record<number, number>
}

export interface ValiderOtpRequest {
  otp: string
}

export interface SoumettreReponsesRequest {
  reponses: { ligneId: number; prixUnitaire: number; commentaire?: string }[]
}

export interface CreateFournisseurRequest {
  nom: string
  raisonSociale?: string
  email?: string
  telephone?: string
  adresse?: string
  ville?: string
  nomContact?: string
  telephoneContact?: string
  emailContact?: string
  ncc?: string
}

export interface UpdateFournisseurRequest {
  nom: string
  raisonSociale?: string
  email?: string
  telephone?: string
  adresse?: string
  ville?: string
  nomContact?: string
  telephoneContact?: string
  emailContact?: string
  ncc?: string
  actif?: boolean
}

// =============================================
// TYPES – PUBLIC (AllowAnonymous)
// =============================================

export interface LignePublique {
  id: number
  ordre: number
  designation: string
  description?: string
  unite?: string
  quantite: number
  typeElement?: string
  dimensionL?: number
  dimensionH?: number
}

export interface SectionPublique {
  id: number
  titre: string
  description?: string
  lignes: LignePublique[]
}

export interface FormulairePublicDevis {
  devisId: number
  reference: string
  typeDevis: TypeDevis
  titre: string
  description?: string
  dateLimiteReponse: string
  fournisseurNom: string
  statut: StatutDemande
  otpValide: boolean
  sections: SectionPublique[]
  lignes: LignePublique[]
}

// =============================================
// HELPERS
// =============================================

export const statutDevisLabels: Record<StatutDevis, string> = {
  Brouillon:   'Brouillon',
  EnCours:     'En cours',
  Cloture:     'Clôturé',
  Selectionne: 'Sélectionné',
}

export const statutDevisColors: Record<StatutDevis, string> = {
  Brouillon:   'bg-gray-100 text-gray-700 border-gray-200',
  EnCours:     'bg-blue-100 text-blue-700 border-blue-200',
  Cloture:     'bg-red-100 text-red-700 border-red-200',
  Selectionne: 'bg-green-100 text-green-700 border-green-200',
}

export const statutDemandeLabels: Record<StatutDemande, string> = {
  EnAttente:  'En attente',
  LienOuvert: 'Lien ouvert',
  OtpValide:  'OTP validé',
  Repondu:    'Répondu',
  Expire:     'Expiré',
  Rejete:     'Rejeté',
}

export const statutDemandeColors: Record<StatutDemande, string> = {
  EnAttente:  'bg-gray-100 text-gray-600',
  LienOuvert: 'bg-blue-100 text-blue-700',
  OtpValide:  'bg-yellow-100 text-yellow-700',
  Repondu:    'bg-green-100 text-green-700',
  Expire:     'bg-orange-100 text-orange-700',
  Rejete:     'bg-red-100 text-red-700',
}
