// types/depot.ts

import type { PagedParams, PagedResponse, ApiResponse } from '@/types/stock';

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

export interface DepotListParams extends PagedParams {
  actif?: boolean;
}

// =====================================================
// RE-EXPORTS
// =====================================================

export type { PagedParams, PagedResponse, ApiResponse };
