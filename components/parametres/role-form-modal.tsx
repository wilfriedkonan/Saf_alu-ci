"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useRoles } from "@/hooks/useParametres"
import { PERMISSION_LABELS } from "@/types/parametres"
import type { Role, PermissionsGrouped } from "@/services/parametresService"

interface RoleFormModalProps {
  isOpen: boolean
  onClose: () => void
  role?: Role | null
  permissions: PermissionsGrouped
}

export function RoleFormModal({ isOpen, onClose, role, permissions }: RoleFormModalProps) {
  const { createRole, updateRole } = useRoles()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    permissions: [] as string[],
    actif: true
  })

  // Charger les données du rôle en mode édition
  useEffect(() => {
    if (role) {
      setFormData({
        nom: role.nom || "",
        description: role.description || "",
        permissions: role.permissions || [],
        actif: role.actif ?? true
      })
    } else {
      setFormData({
        nom: "",
        description: "",
        permissions: [],
        actif: true
      })
    }
  }, [role])

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  const handleCategoryToggle = (category: string[]) => {
    const allSelected = category.every(p => formData.permissions.includes(p))
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !category.includes(p))
        : [...new Set([...prev.permissions, ...category])]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (role) {
        // Mode édition
        await updateRole(role.id, {
          id: role.id,
          ...formData
        })
      } else {
        // Mode création
        await createRole(formData)
      }
      onClose()
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  // Grouper les permissions par catégorie
  const groupedPermissions = Object.entries(permissions).map(([category, perms]) => ({
    category,
    permissions: perms
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {role ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Contenu avec défilement */}
          <div className="flex-1 overflow-y-auto px-1">
            <div className="space-y-6 py-4">
              {/* Informations de base */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom du rôle *</Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    placeholder="ex: gestionnaire_projets"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez les responsabilités de ce rôle..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="actif"
                    checked={formData.actif}
                    onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })}
                  />
                  <Label htmlFor="actif">Rôle actif</Label>
                </div>
              </div>

              <Separator />

              {/* Permissions */}
              <div>
                <Label className="text-base">Permissions *</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Sélectionnez les permissions accordées à ce rôle
                </p>

                <div className="space-y-4">
                  {groupedPermissions.map(({ category, permissions: categoryPerms }) => {
                    const allSelected = categoryPerms.every(p => formData.permissions.includes(p))
                    const someSelected = categoryPerms.some(p => formData.permissions.includes(p))

                    return (
                      <div key={category} className="border rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Checkbox
                            id={`category-${category}`}
                            checked={allSelected}
                            onCheckedChange={() => handleCategoryToggle(categoryPerms)}
                            className={someSelected && !allSelected ? "data-[state=checked]:bg-primary/50" : ""}
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="text-sm font-semibold cursor-pointer"
                          >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                            {' '}
                            <span className="text-muted-foreground font-normal">
                              ({categoryPerms.length})
                            </span>
                          </Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                          {categoryPerms.map((permission) => (
                            <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission}
                                checked={formData.permissions.includes(permission)}
                                onCheckedChange={() => handlePermissionToggle(permission)}
                              />
                              <Label
                                htmlFor={permission}
                                className="text-sm cursor-pointer"
                              >
                                {PERMISSION_LABELS[permission] || permission}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {formData.permissions.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {formData.permissions.length} permission{formData.permissions.length > 1 ? 's' : ''} sélectionnée{formData.permissions.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer fixe */}
          <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.nom || formData.permissions.length === 0}
            >
              {loading ? 'Enregistrement...' : role ? 'Mettre à jour' : 'Créer le rôle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}