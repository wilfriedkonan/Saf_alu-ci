// types/Utilisateurs.ts

export interface Utilisateur {
  Id: number;
  Email: string;
  Username: string;
  Prenom: string; 
  Nom: string;    
  Telephone?: string;
  Photo?: string;
  Role?: {
    Id: number;
    Nom: string;
    Permissions?: string[];
  };
  DerniereConnexion?: string;
  DateCreation: string;
  DateModification?: string; 
  Actif: boolean;
}

export type UserRole = "super_admin" | "admin" | "chef_projet" | "comptable" | "commercial" | "sous_traitant";

// Labels des rôles
export const roleLabels: Record<UserRole, string> = {
  super_admin: "Super Admin",
  admin: "Administrateur", 
  chef_projet: "Chef de Projet",
  comptable: "Comptable",
  commercial: "Commercial",
  sous_traitant: "Sous-traitant",
};

// Permissions par rôle
export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: [
    "dashboard",
    "devis",
    "projets", 
    "factures",
    "clients",
    "sous_traitants",
    "tresorerie",
    "utilisateurs",
    "notifications",
    "parametres"
  ],
  admin: [
    "dashboard",
    "devis", 
    "projets",
    "factures",
    "clients",
    "sous_traitants",
    "tresorerie",
    "utilisateurs",
    "notifications"
  ],
  chef_projet: [
    "dashboard",
    "projets",
    "sous_traitants",
    "clients"
  ],
  comptable: [
    "dashboard",
    "factures", 
    "tresorerie",
    "clients"
  ],
  commercial: [
    "dashboard",
    "devis",
    "clients"
  ],
  sous_traitant: [
    "dashboard",
    "projets"
  ],
};

// Hiérarchie des rôles
export const roleHierarchy: Record<UserRole, number> = {
  sous_traitant: 1,
  commercial: 2,
  comptable: 2,
  chef_projet: 3,
  admin: 4,
  super_admin: 5,
};

// Types pour l'authentification
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  prenom: string;
  nom: string;
  telephone?: string;
  roleId: number;
}

// Type pour la mise à jour d'utilisateur
export interface UpdateUserRequest {
  email: string;
  username: string;
  prenom: string;
  nom: string;
  telephone?: string;
  roleId: number;
  photo?: string;
  actif?: boolean;
}

// Type pour le changement de mot de passe
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Réponse du login selon votre API actuelle
export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    prenom: string;
    nom: string;
    telephone?: string;
    photo?: string;
    role: string;
    permissions: string[];
    derniereConnexion?: string;
    dateCreation: string;
    actif: boolean;
  };
}

// Structure de réponse d'authentification
export interface AuthResponse {
  success: boolean;
  Success: boolean;
  message?: string;
  Message?: string;
  data?: {
    token: string;
    user: Utilisateur;
    expiration?: string;
  };
  Data?: AuthData;
  status?: number;
  Status: number;
}

// Structure des données d'authentification
export interface AuthData {
  Token: string;
  User: UserProfile;
  Expiration?: string;
}

export interface UserProfile {
  Id: number;
  Email: string;
  Username: string;
  Prenom: string;
  Nom: string;
  Telephone?: string;
  Photo?: string;
  Role?: string;
  Permissions?: string[];
  DerniereConnexion?: string;
  DateCreation: string;
  Actif: boolean;
}

// Informations sur les rôles
export interface RoleInfo {
  Id: number;
  Nom: string;
  Label: string;
  Permissions: string[];
}

// Type pour les statistiques d'utilisateurs
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
}

// Types pour les contextes et hooks
export interface AuthContextType {
  user: Utilisateur | null;
  roles: RoleInfo[]; 
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: RegisterRequest) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (userData: Utilisateur) => void;
  refreshProfile: () => Promise<void>;
  refreshRoles: () => Promise<void>; 
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isRoleHigherOrEqual: (requiredRole: string) => boolean;
}

// API des utilisateurs
export interface UtilisateursApiType {
  getAll: () => Promise<UserProfile[]>;
  getById: (id: number) => Promise<UserProfile>;
  getProfile: () => Promise<UserProfile>;
  getRoles: () => Promise<RoleInfo[]>; 
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  create: (userData: RegisterRequest) => Promise<AuthResponse>;
  update: (id: number, userData: UpdateUserRequest) => Promise<{ message: string }>;
  changePassword: (id: number, passwordData: ChangePasswordRequest) => Promise<{ message: string }>;
  delete: (id: number) => Promise<{ message: string }>;
  toggleStatus: (id: number) => Promise<{ message: string }>;
  search: (searchTerm: string) => Promise<UserProfile[]>;
}

// Fonction pour convertir la réponse de login vers Utilisateur
export const convertLoginResponseToUtilisateur = (loginData: LoginResponse): Utilisateur => {
  return {
    Id: loginData.user.id,
    Email: loginData.user.email,
    Username: loginData.user.username,
    Prenom: loginData.user.prenom,
    Nom: loginData.user.nom,
    Telephone: loginData.user.telephone,
    Photo: loginData.user.photo,
    Role: {
      Id: 0,
      Nom: loginData.user.role,
      Permissions: loginData.user.permissions
    },
    DerniereConnexion: loginData.user.derniereConnexion,
    DateCreation: loginData.user.dateCreation,
    Actif: loginData.user.actif
  };
};

// Vérification des permissions
export const hasPermission = (user: Utilisateur | null, permission: string): boolean => {
  // Utiliser les permissions directement depuis l'objet utilisateur si disponibles
  if (user?.Role?.Permissions && user.Role.Permissions.length > 0) {
    return user.Role.Permissions.includes(permission);
  }
  
  // Fallback vers les permissions statiques
  if (user?.Role?.Nom) {
    const userRole = user.Role.Nom as UserRole;
    const staticPermissions = rolePermissions[userRole] || [];
    return staticPermissions.includes(permission);
  }
  
  return false;
};

// Vérification du rôle
export const hasRole = (user: Utilisateur | null, role: string): boolean => {
  return user?.Role?.Nom === role;
};

// Hiérarchie des rôles
export const isRoleHigherOrEqual = (userRole: string, requiredRole: string): boolean => {
  const userLevel = roleHierarchy[userRole as UserRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole as UserRole] || 0;
  
  return userLevel >= requiredLevel;
};

// Vérifier si l'utilisateur peut gérer un autre utilisateur
export const canManageUser = (currentUser: Utilisateur | null, targetUser: Utilisateur | null): boolean => {
  if (!currentUser?.Role?.Nom || !targetUser?.Role?.Nom) return false;
  
  const currentUserRole = currentUser.Role.Nom as UserRole;
  const targetUserRole = targetUser.Role.Nom as UserRole;
  
  // Super admin peut gérer tout le monde
  if (currentUserRole === 'super_admin') return true;
  
  // Admin peut gérer tous sauf super_admin
  if (currentUserRole === 'admin' && targetUserRole !== 'super_admin') return true;
  
  // Utiliser la hiérarchie pour des règles plus complexes
  const currentLevel = roleHierarchy[currentUserRole] || 0;
  const targetLevel = roleHierarchy[targetUserRole] || 0;
  return currentLevel > targetLevel;
};

// Vérifier si l'utilisateur peut attribuer un rôle
export const canAssignRole = (currentUser: Utilisateur | null, roleToAssign: UserRole): boolean => {
  if (!currentUser?.Role?.Nom) return false;
  
  const currentUserRole = currentUser.Role.Nom as UserRole;
  
  // Super admin peut attribuer tous les rôles
  if (currentUserRole === 'super_admin') return true;
  
  // Admin peut attribuer tous les rôles sauf super_admin
  if (currentUserRole === 'admin' && roleToAssign !== 'super_admin') return true;
  
  return false;
};

// Obtenir les rôles qu'un utilisateur peut attribuer
export const getAssignableRoles = (currentUser: Utilisateur | null): RoleInfo[] => {
  if (!currentUser?.Role?.Nom) return [];
  
  const currentUserRole = currentUser.Role.Nom as UserRole;
  let assignableRoleNames: UserRole[] = [];
  
  if (currentUserRole === 'super_admin') {
    assignableRoleNames = ['super_admin', 'admin', 'chef_projet', 'comptable', 'commercial', 'sous_traitant'];
  } else if (currentUserRole === 'admin') {
    assignableRoleNames = ['admin', 'chef_projet', 'comptable', 'commercial', 'sous_traitant'];
  }
  
  // Convertir en RoleInfo
  return assignableRoleNames.map(roleName => ({
    Id: 0, // ID non disponible dans le fallback
    Nom: roleName,
    Label: getRoleLabel(roleName),
    Permissions: rolePermissions[roleName] || []
  }));
};

// Obtenir le label d'un rôle
export const getRoleLabel = (role: UserRole | string): string => {
  return roleLabels[role as UserRole] || role;
};

// Validation des données utilisateur
export const validateUserData = (userData: Partial<RegisterRequest | UpdateUserRequest>): string[] => {
  const errors: string[] = [];
  
  if (!userData.email?.trim()) {
    errors.push('L\'email est requis');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.push('Format d\'email invalide');
  }
  
  if (!userData.username?.trim()) {
    errors.push('Le nom d\'utilisateur est requis');
  } else if (userData.username.length < 3) {
    errors.push('Le nom d\'utilisateur doit contenir au moins 3 caractères');
  }
  
  if (!userData.prenom?.trim()) {
    errors.push('Le prénom est requis');
  }
  
  if (!userData.nom?.trim()) {
    errors.push('Le nom est requis');
  }
  
  if ('password' in userData && userData.password) {
    if (userData.password.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }
  }
  
  if (userData.telephone && !/^[\d+\-\s()]+$/.test(userData.telephone)) {
    errors.push('Format de téléphone invalide');
  }
  
  return errors;
};

// Formater les données utilisateur pour l'affichage
export const formatUserForDisplay = (user: Utilisateur | UserProfile): string => {
  const prenom = (user as any).Prenom || (user as any).prenom || '';
  const nom = (user as any).Nom || (user as any).nom || '';
  return `${prenom} ${nom}`.trim() || user.Username || user.Email;
};

// Obtenir l'initiale de l'utilisateur pour l'avatar
export const getUserInitials = (user: Utilisateur | UserProfile): string => {
  const prenom = (user as any).Prenom || (user as any).prenom || '';
  const nom = (user as any).Nom || (user as any).nom || '';
  
  if (prenom && nom) {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase();
  }
  
  if (user.Username) {
    return user.Username.substring(0, 2).toUpperCase();
  }
  
  return user.Email.charAt(0).toUpperCase();
};

// Types pour les erreurs
export interface AuthError {
  field?: string;
  message: string;
  code?: string;
}

// Type pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
}

// Constantes pour les messages d'erreur
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Accès non autorisé',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  ACCOUNT_DISABLED: 'Votre compte a été désactivé',
  EMAIL_EXISTS: 'Cet email est déjà utilisé',
  USERNAME_EXISTS: 'Ce nom d\'utilisateur est déjà utilisé',
  INVALID_ROLE: 'Rôle invalide',
  INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes',
  USER_NOT_FOUND: 'Utilisateur non trouvé',
  SERVER_ERROR: 'Erreur serveur',
  NETWORK_ERROR: 'Erreur réseau',
  VALIDATION_ERROR: 'Erreur de validation',
} as const;

// Type pour les constantes de messages
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

export default {
  hasPermission,
  hasRole,
  getRoleLabel,
  isRoleHigherOrEqual,
  canManageUser,
  canAssignRole,
  getAssignableRoles,
  validateUserData,
  formatUserForDisplay,
  getUserInitials,
  convertLoginResponseToUtilisateur,
  roleLabels,
  rolePermissions,
  roleHierarchy,
  ERROR_MESSAGES,
};