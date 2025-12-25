// src/hooks/useDevis.ts

import { useState, useEffect, useCallback } from 'react';
import { 
  Utilisateur 
} from '@/types/Utilisateurs';
import { UtilisiateurService } from '@/services/utilisatuerService';

// Hook pour gérer la liste des devis
export const useUtilisateurList = () => {
  const [Utilisateur, setUtilisateur] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUtilisateur = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UtilisiateurService.getAllUsers();
      setUtilisateur(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUtilisateur();
  }, [fetchUtilisateur]);

  const refreshUtilisateur = useCallback(() => {
    fetchUtilisateur();
  }, [fetchUtilisateur]);

  return {
    Utilisateur,
    loading,
    error,
    refreshUtilisateur
  };
};

