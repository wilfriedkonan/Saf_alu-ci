// services/devisService.ts

import axios, { AxiosResponse } from 'axios';
import { 
  Utilisateur
} from '@/types/Utilisateurs';

import apiClient from '@/lib/auth';



export class UtilisiateurService {
  
  /**
   * Récupère tous les devis
   */
  static async getAllUsers(): Promise<any[]> {
    try {console.log("Récupération des devis")
      const response: AxiosResponse<any[]> = await apiClient.get('/Utilisateurs');
      console.log('Reponse: ',response.data)
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
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

// Hook personnalisé pour utiliser le service de devis
export const useUtilisateurService = () => {
  return {
    getAllUsers: UtilisiateurService.getAllUsers,
   
  };
};