// hooks/useDashboard.ts

import { useState, useEffect, useCallback } from 'react';
import { DashboardService } from '@/services/dashboardService';
import type { DonneesCompletesDashboard } from '@/types/dashboard';
import { toast } from 'sonner';

// =============================================
// INTERFACE
// =============================================

interface UseDashboardReturn {
  donnees: DonneesCompletesDashboard | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  actualiser: () => void;
  chargerDonnees: (showToast?: boolean) => Promise<void>;
}

// =============================================
// HOOK
// =============================================

export const useDashboard = (): UseDashboardReturn => {
  const [donnees, setDonnees] = useState<DonneesCompletesDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  /**
   * Charge toutes les données du dashboard
   */
  const chargerDonnees = useCallback(async (showToast: boolean = false) => {
    try {
      // Définir l'état de chargement
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Appeler l'API
      const data = await DashboardService.getDonneesCompletes();
      
      // Mettre à jour les données
      setDonnees(data);

      // Afficher un toast si demandé
      if (showToast) {
        toast.success('Données actualisées');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors du chargement';
      setError(message);
      
      // Toujours afficher le toast en cas d'erreur
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Actualise les données (avec toast)
   */
  const actualiser = useCallback(() => {
    chargerDonnees(true);
  }, [chargerDonnees]);

  /**
   * Charge les données au montage du composant
   */
  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  /**
   * Actualisation automatique toutes les 5 minutes
   */
  useEffect(() => {
    const interval = setInterval(() => {
      chargerDonnees(false);
    }, 5 * 60 * 1000); // 5 minutes en millisecondes

    return () => clearInterval(interval);
  }, [chargerDonnees]);

  return {
    donnees,
    loading,
    error,
    refreshing,
    actualiser,
    chargerDonnees,
  };
};

// =============================================
// EXPORT PAR DÉFAUT
// =============================================

export default useDashboard;