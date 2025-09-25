"use client"
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  Utilisateur, 
  AuthContextType, 
  AuthResponse, 
  RegisterRequest,
  LoginResponse,
  convertLoginResponseToUtilisateur,
  hasPermission as checkPermission,
  hasRole,
  isRoleHigherOrEqual,
} from '@/types/Utilisateurs';
import { authService, getStoredUser, setStoredUser } from '@/lib/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [roles, setRoles] = useState<any[]>([]);

  // Charger le profil utilisateur depuis l'API
  const refreshProfile = async (): Promise<void> => {
    try {
      const result = await authService.getProfile();
      if (result.success && result.data) {
        const userData: Utilisateur = {
          Id: result.data.id || result.data.Id,
          Email: result.data.email || result.data.Email,
          Username: result.data.username || result.data.Username,
          Prenom: result.data.prenom || result.data.Prenom,
          Nom: result.data.nom || result.data.Nom,
          Telephone: result.data.telephone || result.data.Telephone,
          Photo: result.data.photo || result.data.Photo,
          Role: {
            Id: 0,
            Nom: result.data.role || result.data.Role,
            Permissions: result.data.permissions || result.data.Permissions || []
          },
          DerniereConnexion: result.data.derniereConnexion || result.data.DerniereConnexion,
          DateCreation: result.data.dateCreation || result.data.DateCreation,
          Actif: result.data.actif !== undefined ? result.data.actif : result.data.Actif !== undefined ? result.data.Actif : true
        };

        setUser(userData);
        setIsAuthenticated(true);
        setStoredUser(userData);
      } else {
        // Erreur lors du chargement du profil, déconnecter
        logout();
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      logout();
    }
  };

  // Connexion
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);

      if (result.success && result.data) {
        // Convertir la réponse en Utilisateur
        const userData = convertLoginResponseToUtilisateur(result.data as LoginResponse);

        setUser(userData);
        setIsAuthenticated(true);
        setStoredUser(userData);

        return {
          success: true,
          Success: true,
          message: result.message || 'Connexion réussie',
          Message: result.message || 'Connexion réussie',
          data: {
            token: result.data.token || '',
            user: userData
          },
          Data: {
            Token: result.data.token || '',
            User: userData as any
          },
          status: 200,
          Status: 200
        };
      } else {
        return {
          success: false,
          Success: false,
          message: result.message || 'Email ou mot de passe incorrect',
          Message: result.message || 'Email ou mot de passe incorrect',
          status: result.status || 400,
          Status: result.status || 400
        };
      }
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      return {
        success: false,
        Success: false,
        message: error.message || 'Erreur de connexion',
        Message: error.message || 'Erreur de connexion',
        status: error.status || 500,
        Status: error.status || 500
      };
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const result = await authService.register(userData);
      
      if (result.success && result.data) {
        // Convertir et stocker l'utilisateur
        const newUser = convertLoginResponseToUtilisateur(result.data as LoginResponse);

        setUser(newUser);
        setIsAuthenticated(true);
        setStoredUser(newUser);

        return {
          success: true,
          Success: true,
          Message: result.message || 'Inscription réussie',
          Data: {
            Token: result.data.token || '',
            User: newUser as any
          },
          Status: 200
        };
      } else {
        return {
          success: false,
          Success: false,
          Message: result.message || 'Erreur lors de l\'inscription',
          Status: result.status || 400
        };
      }
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      return {
        success: false,
        Success: false,
        Message: error.message || 'Erreur d\'inscription',
        Status: error.status || 500
      };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const logout = (): void => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Mettre à jour l'utilisateur
  const updateUser = (userData: Utilisateur): void => {
    setUser(userData);
    setStoredUser(userData);
  };

  // Vérifier les permissions (utilise directement les permissions de l'utilisateur)
  const hasPermission = (permission: string): boolean => {
    return checkPermission(user, permission);
  };

  // Vérifier le rôle
  const hasRoleCheck = (role: string): boolean => {
    return hasRole(user, role);
  };

  // Vérifier si le rôle est supérieur ou égal
  const isRoleHigherOrEqualCheck = (requiredRole: string): boolean => {
    if (!user?.Role?.Nom) return false;
    return isRoleHigherOrEqual(user.Role.Nom, requiredRole);
  };

  // Rafraîchir les rôles
  const refreshRoles = async (): Promise<void> => {
    // Implémentation future pour charger les rôles depuis l'API
    console.log('refreshRoles - à implémenter');
  };

  // Initialisation au démarrage de l'application
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Vérifier si on a un utilisateur stocké et un token
        const storedUser = getStoredUser();
        const isAuth = authService.isAuthenticated();
        
        if (isAuth && storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Optionnel : rafraîchir le profil depuis l'API pour s'assurer que les données sont à jour
          // Commenté pour éviter les appels API inutiles au démarrage
          // await refreshProfile();
        } else if (isAuth && !storedUser) {
          // On a un token mais pas d'utilisateur stocké, charger depuis l'API
          await refreshProfile();
        } else {
          // Pas de token, s'assurer que tout est nettoyé
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
        // En cas d'erreur, nettoyer et déconnecter
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: AuthContextType = {
    user,
    roles,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    refreshRoles,
    hasPermission,
    hasRole: hasRoleCheck,
    isRoleHigherOrEqual: isRoleHigherOrEqualCheck,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour vérifier les permissions facilement
export const usePermissions = () => {
  const { hasPermission, hasRole, user } = useAuth();
  
  return {
    hasPermission,
    canAccessDashboard: () => hasPermission('dashboard'),
    canManageUsers: () => hasPermission('utilisateurs'),
    canManageProjects: () => hasPermission('projets'),
    canManageFinances: () => hasPermission('factures') || hasPermission('tresorerie'),
    canManageClients: () => hasPermission('clients'),
    canManageQuotes: () => hasPermission('devis'),
    canManageSousTraitants: () => hasPermission('sous_traitants'),
    canManageTresorerie: () => hasPermission('tresorerie'),
    canManageParametres: () => hasPermission('parametres'),
    canManageNotifications: () => hasPermission('notifications'),
    isAdmin: () => hasRole('admin') || hasRole('super_admin'),
    isSuperAdmin: () => hasRole('super_admin'),
    currentUserRole: user?.Role?.Nom || null,
    userPermissions: user?.Role?.Permissions || [],
  };
};