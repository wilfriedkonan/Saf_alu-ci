// services/invoiceService.ts

import axios, { AxiosResponse } from 'axios';
import type {
    Facture,
    LigneFacture,
    Echeancier,
    CreateFactureRequest,
    CreateLigneFactureRequest,
    CreateEcheancierRequest,
    MarquerPayeRequest,
    FactureStatut,
    FactureType,
  } from "@/types/invoices"
  
  // DTOs pour l'API - Utilisation des types de types/invoices.ts
  interface UpdateFactureRequest {
    titre?: string
    description?: string
    dateFacture?: string
    dateEcheance?: string
    conditionsPaiement?: string
    referenceClient?: string
    lignes?: CreateLigneFactureRequest[]
    echeanciers?: CreateEcheancierRequest[]
    statut?: FactureStatut
  }
  
  interface FactureStats {
    totalFacturesGolbal: number
    retardPayementGolbal: number
    montantTotalPayeGolbal: number
    montantRestantARecouvrerGolbal: number
  }
  
  interface FactureFilters {
    status?: FactureStatut | "all"
    type?: FactureType | "all"
    search?: string
    clientId?: number
    projectId?: number
    year?: number
  }

  interface ApiResponse<T> {
    data?: T;
    message?: string;
    errors?: string[];
  }
  
  // Configuration axios
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://167.86.107.54/api' ;;

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Intercepteur pour ajouter le token d'authentification
  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('safalu_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Intercepteur pour gérer les erreurs de réponse
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expiré ou invalide
        localStorage.removeItem('safalu_token');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
  
  export class InvoiceService {
  
    /**
     * Récupère toutes les factures avec filtres optionnels
     */
    static async getAllInvoices(filters?: FactureFilters): Promise<Facture[]> {
      try { 
        const params = new URLSearchParams()
        
        if (filters?.status && filters.status !== "all") {
          params.append("statut", filters.status)
        }
        
        if (filters?.type && filters.type !== "all") {
          params.append("typeFacture", filters.type)
        }
    
        const url = `/factures${params.toString() ? `?${params.toString()}` : ""}`
        
        const response: AxiosResponse<Facture[]> = await apiClient.get(url)
        
        let data = response.data
        
        // Filtrage côté client pour search, clientId, projectId
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase()
          data = data.filter(
            (inv) =>
              inv.numero.toLowerCase().includes(searchLower) ||
              inv.detailDebiteur?.nom?.toLowerCase().includes(searchLower) ||
              inv.titre?.toLowerCase().includes(searchLower)
          )
        }
        
        if (filters?.clientId) {
          data = data.filter((inv) => inv.clientId === filters.clientId)
        }
        
        if (filters?.projectId) {
          data = data.filter((inv) => inv.projetId === filters.projectId)
        }
        
        return data
      } catch (error) {
        console.error('Erreur lors de la récupération des factures:', error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Récupère une facture par son ID
     */
    static async getInvoiceById(id: number): Promise<Facture> {
      try {
        const response: AxiosResponse<Facture> = await apiClient.get(`/factures/${id}`);
        console.log('Debug repose Facture:', response.data)
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la récupération de la facture ${id}:`, error);
        throw this.handleError(error);
      }
    }
  
  /**
   * Crée une nouvelle facture
   */
  static async createInvoice(data: CreateFactureRequest): Promise<ApiResponse<Facture>> {
    try {
      console.log('📤 Données envoyées à l\'API pour créer une facture:', JSON.stringify(data, null, 2));
      const response: AxiosResponse<ApiResponse<Facture>> = await apiClient.post('/factures', data);
      console.log('✅ Réponse de l\'API:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la facture:', error);
      throw this.handleError(error);
    }
  }
  
    /**
     * Crée une facture à partir d'un devis
     */
    static async createInvoiceFromQuote(quoteId: number): Promise<ApiResponse<Facture>> {
      try {
        const response: AxiosResponse<ApiResponse<Facture>> = await apiClient.post(`/factures/from-devis/${quoteId}`);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la création de la facture depuis le devis ${quoteId}:`, error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Met à jour une facture (uniquement si statut = brouillon)
     */
    static async updateInvoice(id: number, data: UpdateFactureRequest): Promise<ApiResponse<void>> {
      try {console.log('Debug Service update:',data) 
        const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/factures/${id}`, data);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la mise à jour de la facture ${id}:`, error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Envoie une facture (change le statut à envoyée)
     */
    static async sendInvoice(id: number): Promise<ApiResponse<void>> {
      try {
        const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/factures/${id}/envoyer`);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de l'envoi de la facture ${id}:`, error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Marque une facture comme payée (partiellement ou totalement)
     */
    static async markInvoiceAsPaid(id: number, data: MarquerPayeRequest): Promise<ApiResponse<void>> {
      try {
        const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/factures/${id}/marquer-payee`, data);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors du marquage de paiement de la facture ${id}:`, error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Annule une facture
     */
    static async cancelInvoice(id: number, reason?: string): Promise<ApiResponse<void>> {
      try {
        const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/factures/${id}/annuler`, {
          motif: reason
        });
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de l'annulation de la facture ${id}:`, error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Supprime une facture
     */
    static async deleteInvoice(id: number): Promise<ApiResponse<void>> {
      try {
        const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/factures/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de la suppression de la facture ${id}:`, error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Récupère les factures impayées
     */
    static async getOverdueInvoices(): Promise<Facture[]> {
      try {
        const response: AxiosResponse<Facture[]> = await apiClient.get('/factures/impayes');
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des factures impayées:', error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Envoie une relance pour une facture
     */
    static async sendInvoiceReminder(id: number): Promise<ApiResponse<void>> {
      try {
        const response: AxiosResponse<ApiResponse<void>> = await apiClient.post(`/factures/${id}/relance`);
        return response.data;
      } catch (error) {
        console.error(`Erreur lors de l'envoi de la relance pour la facture ${id}:`, error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Télécharge le PDF d'une facture
     */
    static async downloadInvoicePDF(id: number): Promise<{ blob: Blob; filename?: string }> {
      try {
        const response: AxiosResponse<Blob> = await apiClient.get(`/factures/${id}/pdf`, {
          responseType: 'blob'
        });

        let filename: string | undefined
        const disposition = (response.headers as any)?.['content-disposition'] as string | undefined
        if (disposition) {
          const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(disposition)
          const encoded = match?.[1]
          const plain = match?.[2]
          if (encoded) filename = decodeURIComponent(encoded)
          else if (plain) filename = plain
        }

        return { blob: response.data, filename }
      } catch (error) {
        console.error(`Erreur lors du téléchargement du PDF de la facture ${id}:`, error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Récupère les statistiques des factures
     */
    static async getInvoiceStats(year?: number): Promise<FactureStats> {
      try {
        const params = year ? `?annee=${year}` : ""
        const response: AxiosResponse<FactureStats> = await apiClient.get(`/factures/statistiques${params}`);
        return response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques des factures:', error);
        throw this.handleError(error);
      }
    }
  
    /**
     * Exporte les factures en Excel
     */
    static async exportInvoicesToExcel(filters?: FactureFilters): Promise<{ blob: Blob; filename?: string }> {
      try {
        const params = new URLSearchParams()
        
        if (filters?.status && filters.status !== "all") {
          params.append("statut", filters.status)
        }
        
        if (filters?.type && filters.type !== "all") {
          params.append("typeFacture", filters.type)
        }

        const response: AxiosResponse<Blob> = await apiClient.get(`/factures/export/excel?${params.toString()}`, {
          responseType: 'blob'
        });

        let filename: string | undefined
        const disposition = (response.headers as any)?.['content-disposition'] as string | undefined
        if (disposition) {
          const match = /filename\*=UTF-8''([^;\n]+)|filename="?([^";\n]+)"?/i.exec(disposition)
          const encoded = match?.[1]
          const plain = match?.[2]
          if (encoded) filename = decodeURIComponent(encoded)
          else if (plain) filename = plain
        }

        return { blob: response.data, filename }
      } catch (error) {
        console.error('Erreur lors de l\'export Excel des factures:', error);
        throw this.handleError(error);
      }
    }

    /**
     * Gestion centralisée des erreurs
     */
    private static handleError(error: any): Error {
      let message = 'Une erreur inattendue s\'est produite';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Erreur de réponse du serveur
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
            case 409:
              message = 'Conflit - La ressource existe déjà';
              break;
            case 422:
              message = data?.message || 'Données non valides';
              break;
            case 500:
              message = 'Erreur serveur interne';
              break;
            default:
              message = data?.message || `Erreur ${status}`;
          }
        } else if (error.request) {
          // Erreur de réseau
          message = 'Erreur de connexion - Vérifiez votre réseau';
        }
      }
      
      return new Error(message);
    }
  }
  
  // Hook personnalisé pour utiliser le service de factures
  export const useInvoiceService = () => {
    return {
      getAllInvoices: InvoiceService.getAllInvoices,
      getInvoiceById: InvoiceService.getInvoiceById,
      createInvoice: InvoiceService.createInvoice,
      createInvoiceFromQuote: InvoiceService.createInvoiceFromQuote,
      updateInvoice: InvoiceService.updateInvoice,
      deleteInvoice: InvoiceService.deleteInvoice,
      sendInvoice: InvoiceService.sendInvoice,
      markInvoiceAsPaid: InvoiceService.markInvoiceAsPaid,
      cancelInvoice: InvoiceService.cancelInvoice,
      sendInvoiceReminder: InvoiceService.sendInvoiceReminder,
      downloadInvoicePDF: InvoiceService.downloadInvoicePDF,
      getOverdueInvoices: InvoiceService.getOverdueInvoices,
      getInvoiceStats: InvoiceService.getInvoiceStats,
      exportInvoicesToExcel: InvoiceService.exportInvoicesToExcel,
    };
  };
  
  // Exporter les types pour utilisation dans les composants
  export type {
    FactureStatut,
    FactureType,
    UpdateFactureRequest,
    FactureStats,
    FactureFilters,
    ApiResponse,
  }