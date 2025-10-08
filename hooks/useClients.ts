import { useState, useEffect, useCallback } from "react"
import {
    Client,
    CreateClientRequest,
} from '@/types/clients'
import { clientServices } from "@/services/clientService";

// Hook pour gérer la liste des Clients
export const useClientsList = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        try {
            console.log('🚀 Début fetchClients');
            setLoading(true);
            setError(null);
            const data = await clientServices.getAllClients();
            console.log('📊 Données reçues:', data);
            console.log('📊 Type de données:', typeof data, Array.isArray(data));
            setClients(data);
            console.log('✅ Clients mis à jour dans le state');
        } catch (err) {
            console.error('❌ Erreur fetchClients:', err);
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des devis');
        } finally {
            setLoading(false);
            console.log('🏁 Fin fetchClients');
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const refreshCliens = useCallback(() => {
        fetchClients();
    }, [fetchClients]);

    return {
        clients,
        loading,
        error,
        refreshCliens
    };
};

// Hook pour les actions CRUD sur les devis
export const useClientActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createClient = useCallback(async (clientData: CreateClientRequest) => {
        try {
            setLoading(true);
            setError(null);
            const response = await clientServices.createClient(clientData);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du client';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateClient = useCallback(async (id: number, clientData: Client) => {
        try {
            setLoading(true);
            setError(null);
            const response = await clientServices.updateClient(id, clientData);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du client';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteClient = useCallback(async (id: number) => {
        try {
            setLoading(true);
            setError(null);
            const response = await clientServices.deleteClient(id);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du client';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createClient,
        updateClient,
        deleteClient,
        clearError: () => setError(null)
    };
};

// Hook pour les statistiques des devis
export const useClientStatistiques = () => {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalEntreprises: 0,
        totalProspects: 0,
        totalActifs: 0

    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            console.log('🚀 Début fetchStatClients');

            setLoading(true);
            setError(null);
            const data = await clientServices.getStatistiquesClients();
            setStats(data);
            console.log('✅ Stats reçues:', data)       
         } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const refreshStats = useCallback(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refreshStats
    };
};