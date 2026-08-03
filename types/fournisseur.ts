// types/fournisseur.ts

import { PagedParams, PagedResponse, ApiResponse } from '@/types/stock';

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

export interface FournisseurListParams extends PagedParams {
  actif?: boolean;
  specialite?: string;
}

// =====================================================
// RE-EXPORTS
// =====================================================

export type { PagedParams, PagedResponse, ApiResponse };
