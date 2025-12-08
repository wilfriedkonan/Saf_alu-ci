// hooks/use-parametres.ts

import { useState, useEffect, useCallback } from 'react';
import { ParametresService, type Role, type CreateRoleRequest, type UpdateRoleRequest, type ParametresByCategorie, type UpdateParametreRequest, type SearchUtilisateursRequest, type SearchUtilisateursResponse, type StatistiquesUtilisateurs, type PermissionsGrouped } from '@/types/parametres';
import { toast } from "sonner"
// Hook pour la gestion des rôles
export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ParametresService.getAllRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createRole = useCallback(async (data: CreateRoleRequest) => {
    try {
      const newRole = await ParametresService.createRole(data);
      toast.success('Rôle créé avec succès');
      await fetchRoles();
      return newRole;
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchRoles]);

  const updateRole = useCallback(async (id: number, data: UpdateRoleRequest) => {
    try {
      const updatedRole = await ParametresService.updateRole(id, data);
      toast.success('Rôle mis à jour avec succès');
      await fetchRoles();
      return updatedRole;
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchRoles]);

  const deleteRole = useCallback(async (id: number) => {
    try {
      await ParametresService.deleteRole(id);
      toast.success('Rôle supprimé avec succès');
      await fetchRoles();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchRoles]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    refreshRoles: fetchRoles
  };
}

// Hook pour la recherche d'utilisateurs
export function useSearchUtilisateurs() {
  const [results, setResults] = useState<SearchUtilisateursResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: SearchUtilisateursRequest) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ParametresService.searchUtilisateurs(params);
      console.log('hook result data: ',data)
      setResults(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search
  };
}

// Hook pour les statistiques
export function useStatistiquesUtilisateurs() {
  const [stats, setStats] = useState<StatistiquesUtilisateurs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ParametresService.getStatistiquesUtilisateurs();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
}

// Hook pour les paramètres système
export function useParametresSysteme() {
  const [parametres, setParametres] = useState<ParametresByCategorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParametres = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ParametresService.getParametresByCategorie();
      
      setParametres(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    console.log("🔥 parametres mis à jour :", parametres);
  }, [parametres]);  const updateParametre = useCallback(async (data: UpdateParametreRequest) => {
    try {
      await ParametresService.updateParametre(data);
      toast.success('Paramètre mis à jour avec succès');
      await fetchParametres();
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }, [fetchParametres]);

  useEffect(() => {
    fetchParametres();
  }, [fetchParametres]);

  return {
    parametres,
    loading,
    error,
    updateParametre,
    refreshParametres: fetchParametres
  };
}

// Hook pour les permissions
export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsGrouped | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ParametresService.getAllPermissions();
      setPermissions(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    refreshPermissions: fetchPermissions
  };
}

// Hook global combiné
export function useParametres() {
  const rolesData = useRoles();
  const statsData = useStatistiquesUtilisateurs();
  const parametresData = useParametresSysteme();
  const permissionsData = usePermissions();

  return {
    // Rôles
    roles: rolesData.roles,
    rolesLoading: rolesData.loading,
    createRole: rolesData.createRole,
    updateRole: rolesData.updateRole,
    deleteRole: rolesData.deleteRole,
    refreshRoles: rolesData.refreshRoles,

    // Statistiques
    stats: statsData.stats,
    statsLoading: statsData.loading,
    refreshStats: statsData.refreshStats,

    // Paramètres système
    parametres: parametresData.parametres,
    parametresLoading: parametresData.loading,
    updateParametre: parametresData.updateParametre,
    refreshParametres: parametresData.refreshParametres,

    // Permissions
    permissions: permissionsData.permissions,
    permissionsLoading: permissionsData.loading,

    // État global
    loading: rolesData.loading || statsData.loading || parametresData.loading || permissionsData.loading
  };
}