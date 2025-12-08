// lib/api/parametres.ts
// Fichier de réexportation pour compatibilité

// Réexporter tout depuis parametres.service.ts
export {
    ParametresService,
    useParametresService,
    type Role,
    type CreateRoleRequest,
    type UpdateRoleRequest,
    type Parametre,
    type ParametresByCategorie,
    type UpdateParametreRequest,
    type SearchUtilisateursRequest,
    type UtilisateurResponse,
    type SearchUtilisateursResponse,
    type StatistiquesUtilisateurs,
    type StatistiqueParRole,
    type PermissionsGrouped,
  } from '@/services/parametresService';
  
  // Alias pour l'export default (compatibilité)
  import { ParametresService } from '@/services/parametresService';
  export default ParametresService;
  
  // Helpers pour les permissions
  export const PERMISSION_LABELS: Record<string, string> = {
    'all': 'Accès total',
    'users.read': 'Voir les utilisateurs',
    'users.create': 'Créer des utilisateurs',
    'users.update': 'Modifier les utilisateurs',
    'users.delete': 'Supprimer les utilisateurs',
    'users.all': 'Gestion complète des utilisateurs',
    'projects.read': 'Voir les projets',
    'projects.create': 'Créer des projets',
    'projects.update': 'Modifier les projets',
    'projects.delete': 'Supprimer les projets',
    'projects.all': 'Gestion complète des projets',
    'projects.assigned': 'Projets assignés uniquement',
    'projects.tasks': 'Gestion des tâches',
    'clients.read': 'Voir les clients',
    'clients.create': 'Créer des clients',
    'clients.update': 'Modifier les clients',
    'clients.delete': 'Supprimer les clients',
    'clients.all': 'Gestion complète des clients',
    'invoices.read': 'Voir les factures',
    'invoices.create': 'Créer des factures',
    'invoices.update': 'Modifier les factures',
    'invoices.delete': 'Supprimer les factures',
    'invoices.all': 'Gestion complète des factures',
    'finance.read': 'Voir la finance',
    'finance.create': 'Créer des transactions',
    'finance.update': 'Modifier les transactions',
    'finance.delete': 'Supprimer les transactions',
    'finance.all': 'Gestion complète de la finance',
    'dqe.read': 'Voir les DQE',
    'dqe.create': 'Créer des DQE',
    'dqe.update': 'Modifier les DQE',
    'dqe.delete': 'Supprimer les DQE',
    'dqe.all': 'Gestion complète des DQE',
    'stock.read': 'Voir le stock',
    'stock.create': 'Créer des articles',
    'stock.update': 'Modifier le stock',
    'stock.delete': 'Supprimer des articles',
    'stock.all': 'Gestion complète du stock',
    'reports.finance': 'Rapports financiers',
    'reports.projects': 'Rapports de projets',
    'reports.all': 'Tous les rapports',
    'documents.read': 'Voir les documents',
    'documents.upload': 'Télécharger des documents',
    'documents.delete': 'Supprimer des documents',
    'settings.read': 'Voir les paramètres',
    'settings.update': 'Modifier les paramètres',
    'tasks.update': 'Modifier les tâches'
  };
  
  export function getRoleBadgeColor(roleName: string): string {
    const colors: Record<string, string> = {
      'super_admin': 'bg-red-100 text-red-800 border-red-200',
      'admin': 'bg-blue-100 text-blue-800 border-blue-200',
      'chef_projet': 'bg-green-100 text-green-800 border-green-200',
      'comptable': 'bg-purple-100 text-purple-800 border-purple-200',
      'commercial': 'bg-orange-100 text-orange-800 border-orange-200',
      'sous_traitant': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return colors[roleName] || 'bg-gray-100 text-gray-800 border-gray-200';
  }
  
  export function formatParametreValue(parametre: { Valeur?: string; TypeValeur?: string }): string {
    if (!parametre.Valeur) return '-';
    
    switch (parametre.TypeValeur) {
      case 'boolean':
        return parametre.Valeur === 'true' ? 'Oui' : 'Non';
      case 'decimal':
        return `${parametre.Valeur} %`;
      case 'integer':
        return parametre.Valeur;
      default:
        return parametre.Valeur;
    }
  }