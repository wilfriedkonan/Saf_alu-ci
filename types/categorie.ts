// types/categorie.ts

import type { PagedParams, PagedResponse, ApiResponse } from '@/types/stock';

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

export interface CategorieListParams extends PagedParams {
  actif?: boolean;
}

// =====================================================
// RE-EXPORTS
// =====================================================

export type { PagedParams, PagedResponse, ApiResponse };
