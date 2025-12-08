"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Users, Shield, Loader2 } from "lucide-react"
import { useRoles, usePermissions } from "@/hooks/useParametres"
import { getRoleBadgeColor } from "@/types/parametres"
import { RoleFormModal } from "./role-form-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function RolesTab() {
  const { roles, loading, deleteRole } = useRoles()
  const { permissions } = usePermissions()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null)

  const handleEdit = (role: any) => {
    setEditingRole(role)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setEditingRole(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRole(null)
  }

  const handleDelete = async () => {
    if (deletingRoleId) {
      try {
        await deleteRole(deletingRoleId)
        setDeletingRoleId(null)
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Chargement des rôles...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {/* En-tête avec bouton d'ajout */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Gestion des rôles</h2>
            <p className="text-muted-foreground">
              Créez et gérez les rôles avec leurs permissions
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau rôle
          </Button>
        </div>

        {/* Grille de cartes des rôles */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{role.nom.replace('_', ' ')}</CardTitle>
                  </div>
                  <Badge variant="outline" className={getRoleBadgeColor(role.nom)}>
                    {role.actif ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                {role.description && (
                  <CardDescription className="mt-2">{role.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Statistiques */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{role.nombreUtilisateurs || 0} utilisateur{(role.nombreUtilisateurs || 0) > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>{role.permissions?.length || 0} permission{(role.permissions?.length || 0) > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Permissions (preview) */}
                {role.permissions && role.permissions.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Permissions :</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role?.permissions.length - 3 }
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(role)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setDeletingRoleId(role.id)}
                    disabled={!!role.nombreUtilisateurs && role.nombreUtilisateurs > 0}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {roles.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Aucun rôle configuré</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Créez votre premier rôle pour commencer
                </p>
                <Button className="mt-4" onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un rôle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de création/édition */}
      {permissions && (
        <RoleFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          role={editingRole}
          permissions={permissions}
        />
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!deletingRoleId} onOpenChange={() => setDeletingRoleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}