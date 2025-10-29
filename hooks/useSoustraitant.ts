import { useState, useEffect, useCallback } from 'react';
import { SousTraitantService } from '@/services/sous-traitantService';
import { 
  SousTraitant,
  Specialite, 
  /* DevisListItem, 
  CreateDevisRequest, 
  UpdateDevisRequest,
  DevisStatut */
} from '@/types/sous-traitants';

// Hook pour gérer la liste des sous-traitants
export const useSousTraitantList = () => {
    const [sousTraitantList, setsousTraitantList] = useState<SousTraitant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    const fetchSoustraitant = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await SousTraitantService.getAllSoustraitants();
        console.log('Debug data soustraitantListe:',data)
        setsousTraitantList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des devis');
      } finally {
        setLoading(false);
      }
    }, []);
  
    useEffect(() => {
        fetchSoustraitant();
    }, [fetchSoustraitant]);
  
    const refreshSoutraitant = useCallback(() => {
        fetchSoustraitant();
    }, [fetchSoustraitant]);
  
    return {
      sousTraitantList,
      loading,
      error,
      refreshSoutraitant
    };
  };

  // Hook pour gérer la liste des devis
export const useSpecialiteList = () => {
  const [specialite, setspecialite] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialite = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SousTraitantService.getAllSpecialite();
      setspecialite(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des devis');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialite();
  }, [fetchSpecialite]);

  const refreshSpecialite = useCallback(() => {
    fetchSpecialite();
  }, [fetchSpecialite]);

  return {
    specialite,
    loading,
    error,
    refreshSpecialite
  };
};