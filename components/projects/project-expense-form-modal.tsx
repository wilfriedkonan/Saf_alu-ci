"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Building2 } from "lucide-react"
import { toast } from "sonner"
import { useComptesList, useMouvementActions } from "@/hooks/useTresorerie"

interface EtapeOption {
  id?: number
  nom: string
  statut?: string
}

interface ProjectExpenseFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  projetId: number
  projetNom: string
  compteId?: number
  etapes?: EtapeOption[]
}

interface FormState {
  montant: string
  etapeProjetId: string
  libelle: string
  description: string
}

const initialFormState: FormState = {
  montant: "",
  etapeProjetId: "",
  libelle: "",
  description: "",
}

export function ProjectExpenseFormModal({
  isOpen,
  onClose,
  onSuccess,
  projetId,
  projetNom,
  compteId,
  etapes = [],
}: ProjectExpenseFormModalProps) {
  const { comptes, loading: loadingComptes } = useComptesList()
  const { createMouvement, loading: submitting } = useMouvementActions()

  const [formState, setFormState] = useState<FormState>(initialFormState)

  const compte = useMemo(() => comptes.find((c) => c.id === compteId), [comptes, compteId])

  const resetForm = useCallback(() => {
    setFormState({ ...initialFormState })
  }, [])

  useEffect(() => {
    if (!isOpen) resetForm()
  }, [isOpen, resetForm])

  const handleChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formState.libelle.trim()) {
      toast.info("Veuillez saisir un libellé.")
      return
    }
    const montant = Number(formState.montant)
    if (!montant || montant <= 0) {
      toast.info("Le montant doit être supérieur à zéro.")
      return
    }
    if (!compte) {
      toast.error("Aucun compte de trésorerie n'est configuré pour ce projet.")
      return
    }

    try {
      await createMouvement({
        compteId: compte.id,
        typeMouvement: "Sortie",
        libelle: formState.libelle.trim(),
        description: formState.description.trim() || undefined,
        montant,
        projetId,
        etapeProjetId: formState.etapeProjetId ? Number(formState.etapeProjetId) : undefined,
      })

      toast.success("Dépense enregistrée avec succès.")
      onClose()
      resetForm()
      onSuccess?.()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Impossible d'enregistrer la dépense")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] max-h-[85vh] flex flex-col gap-0">
        <DialogHeader>
          <DialogTitle>Nouvelle dépense</DialogTitle>
          <DialogDescription>
            Enregistrez une dépense directe liée au projet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 -mr-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">Mouvement: Sortie</Badge>
            {loadingComptes ? (
              <Badge variant="outline" className="font-normal text-muted-foreground">
                Chargement du compte...
              </Badge>
            ) : compte ? (
              <Badge variant="secondary" className="font-normal">Compte: {compte.nom}</Badge>
            ) : (
              <Badge variant="destructive" className="font-normal">
                Aucun compte configuré pour ce projet
              </Badge>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Montant de la dépense</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label>Montant (F CFA) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={formState.montant}
                  onChange={(e) => handleChange("montant", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Liens avec le projet */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Liens avec le projet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Projet</Label>
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{projetNom}</span>
                </div>
              </div>

              {etapes.length > 0 && (
                <div>
                  <Label>Étape du projet (optionnel)</Label>
                  <Select
                    value={formState.etapeProjetId}
                    onValueChange={(value) => handleChange("etapeProjetId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une étape" />
                    </SelectTrigger>
                    <SelectContent>
                      {etapes.filter((etape) => etape.id != null).map((etape) => (
                        <SelectItem key={etape.id} value={String(etape.id)}>
                          {etape.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Libellé *</Label>
                <Input
                  placeholder="Ex: Achat ciment - Lot 2"
                  value={formState.libelle}
                  onChange={(e) => handleChange("libelle", e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  placeholder="Ajouter des détails concernant la dépense..."
                  value={formState.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter className="border-t pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || loadingComptes || !compte}
            className="bg-[#1e3a5f] hover:bg-[#15293f] text-white"
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
