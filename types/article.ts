// types/article.ts

import type { PagedParams, PagedResponse, ApiResponse } from '@/types/stock';
import type { Categorie } from '@/types/categorie';
import type { Fournisseur } from '@/types/fournisseur';

// =====================================================
// ARTICLE
// =====================================================

export interface Article {
  id: number;
/*   code: string;
 */  reference?: string;
  nom: string;
  description?: string;
  categorieId: number;
  categorie?: Categorie;
  unite: string;
  prixUnitaireMoyen: number;
  seuilAlerte: number;
  fournisseurPreferentielId?: number;
  fournisseurPreferentiel?: Fournisseur;
  actif: boolean;
  dateCreation: string;
  dateModification: string;
}

export interface CreateArticleRequest {
/*   code: string;
 */  reference?: string;
  nom: string;
  description?: string;
  categorieId: number;
  unite: string;
  prixUnitaireMoyen: number;
  seuilAlerte: number;
  fournisseurPreferentielId?: number;
}

export interface UpdateArticleRequest extends CreateArticleRequest {
  actif?: boolean;
}

export interface ArticleListParams extends PagedParams {
  categorieId?: number;
  depotId?: number;
  actif?: boolean;
}

// =====================================================
// RE-EXPORTS
// =====================================================

export type { PagedParams, PagedResponse, ApiResponse };
