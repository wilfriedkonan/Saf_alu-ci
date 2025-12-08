"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
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
    Nom: "",
    Description: "",
    Permissions: [] as string[],
    Actif: true
  })

  // Charger les données du rôle en mode édition
  useEffect(() => {
    if (role) {
      setFormData({
        Nom: role.Nom || "",
        Description: role.Description || "",
        Permissions: role.Permissions || [],
        Actif: role.Actif ?? true
      })
    } else {
      setFormData({
        Nom: "",
        Description: "",
        Permissions: [],
        Actif: true
      })
    }
  }, [role])

  const handlePermissionToggle = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      Permissions: prev.Permissions.includes(permission)
        ? prev.Permissions.filter(p => p !== permission)
        : [...prev.Permissions, permission]
    }))
  }

  const handleCategoryToggle = (category: string[]) => {
    const allSelected = category.every(p => formData.Permissions.includes(p))
    
    setFormData(prev => ({
      ...prev,
      Permissions: allSelected
        ? prev.Permissions.filter(p => !category.includes(p))
        : [...new Set([...prev.Permissions, ...category])]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (role) {
        // Mode édition
        await updateRole(role.Id, {
          Id: role.Id,
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
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {role ? 'Modifier le rôle' : 'Créer un nouveau rôle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
            <div className="space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nom">Nom du rôle *</Label>
                  <Input
                    id="nom"
                    value={formData.Nom}
                    onChange={(e) => setFormData({ ...formData, Nom: e.target.value })}
                    placeholder="ex: gestionnaire_projets"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.Description}
                    onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                    placeholder="Décrivez les responsabilités de ce rôle..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="actif"
                    checked={formData.Actif}
                    onCheckedChange={(checked) => setFormData({ ...formData, Actif: checked })}
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
                    const allSelected = categoryPerms.every(p => formData.Permissions.includes(p))
                    const someSelected = categoryPerms.some(p => formData.Permissions.includes(p))

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
                                checked={formData.Permissions.includes(permission)}
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

                {formData.Permissions.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {formData.Permissions.length} permission{formData.Permissions.length > 1 ? 's' : ''} sélectionnée{formData.Permissions.length > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !formData.Nom || formData.Permissions.length === 0}>
              {loading ? 'Enregistrement...' : role ? 'Mettre à jour' : 'Créer le rôle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}