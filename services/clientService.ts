import axios, { AxiosResponse } from "axios";
import {
    Client,
    CreateClientRequest,
    ApiResponse,

} from "@/types/clients";
import apiClient from "@/lib/auth";

 
//Convertir Reponse getall
interface ApiWrapper<T> {
    success: boolean;
    data: T;
    count?: number;
}
export class clientServices {

    /**
   * Récupère tous les clients
   */
    static async getAllClients(): Promise<Client[]> {
        try {
            const response: AxiosResponse<ApiWrapper<Client[]>> = await apiClient.get('/Clients');
            return response.data.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
            }
            throw this.handleError(error);
        }
    }


    /**
    * Récupère un client par son ID
    */
    static async getClientById(id: number): Promise<Client> {
        try {
            const response: AxiosResponse<Client> = await apiClient.get(`/Clients/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la récupération du client ${id}:`, error);
            throw this.handleError(error);
        }
    }

    /**
    * Crée un nouveau Client
    */
    static async createClient(ClientData: CreateClientRequest): Promise<ApiResponse<Client>> {
        try {
            const response: AxiosResponse<ApiResponse<Client>> = await apiClient.post('/Clients', ClientData);
            console.log('Reponse neDevisData:', response)

            return response.data;
        } catch (error) {
            console.log('Retour de service client :')

            console.error('Erreur lors de la création du client:', error);
            throw this.handleError(error);
        }
    }

    /**
    * Met à jour un client existant
    */
    static async updateClient(id: number, clientData: Client): Promise<ApiResponse<void>> {
        try {
            const response: AxiosResponse<ApiResponse<void>> = await apiClient.put(`/Clients/${id}`, clientData);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
            throw this.handleError(error);
        }
    }

     /**
     * Supprime un client
     */
    static async deleteClient(id: number): Promise<ApiResponse<void>> {
        try {
            const response: AxiosResponse<ApiResponse<void>> = await apiClient.delete(`/Clients/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur lors de la suppression du client ${id}:`, error);
            throw this.handleError(error);
        }
    }

    /* Récupère les statistiques des clients
    */
    static async getStatistiquesClients(): Promise<{
        totalClients: number;
        totalEntreprises: number;
        totalProspects: number;
        totalActifs: number;

    }> {
        try {
            const response = await apiClient.get('/Clients/statistiqueGlobal');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    //Gestion centralisée des erreurs
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
export const useClientService = () => {
    return {
      /* getAllDevis: DevisService.getAllDevis,
      getDevisById: DevisService.getDevisById,
      createDevis: DevisService.createDevis,
      updateDevis: DevisService.updateDevis,
      deleteDevis: DevisService.deleteDevis,
      envoyerDevis: DevisService.envoyerDevis,
      validerDevis: DevisService.validerDevis,
      refuserDevis: DevisService.refuserDevis,
      dupliquerDevis: DevisService.dupliquerDevis,
      exporterDevisPDF: DevisService.exporterDevisPDF,
      rechercherDevis: DevisService.rechercherDevis, */
      getStatistiquesClients: clientServices.getStatistiquesClients,
    };
  };