// components/dqe/detail-debourse-sec-form-modal.tsx
"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Calculator } from "lucide-react"
import { useDetailDebourseSec } from "@/hooks/useDetailDebourseSec"
import {
  type DQEDetailDebourseSec,
  type CreateDetailDebourseSecRequest,
  type UpdateDetailDebourseSecRequest,
  TYPES_DEPENSE,
  UNITES_DEBOURSE,
  calculateMontantHT,
  formatCurrency,
} from "@/types/dqe-debourse-sec"

interface DetailDebourseSecFormModalProps {
  open: boolean
  onClose: () => void
  itemId: number
  detail?: DQEDetailDebourseSec | null
  onSuccess?: () => void
}

export function DetailDebourseSecFormModal({
  open,
  onClose,
  itemId,
  detail,
  onSuccess,
}: DetailDebourseSecFormModalProps) {
  const { createDetail, updateDetail, loading } = useDetailDebourseSec()
  const [montantPreview, setMontantPreview] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CreateDetailDebourseSecRequest>({
    defaultValues: {
      typeDepense: 'MainOeuvre',
      ordre: 1,
      coefficient: 1.0,
      quantite: 1,
      prixUnitaireHT: 0,
    },
  })

  const typeDepense = watch('typeDepense')
  const quantite = watch('quantite')
  const prixUnitaireHT = watch('prixUnitaireHT')
  const coefficient = watch('coefficient')

  // Calculer le montant preview en temps réel
  useEffect(() => {
    if (quantite && prixUnitaireHT) {
      const montant = calculateMontantHT(
        quantite || 0,
        prixUnitaireHT || 0,
        coefficient || 1.0
      )
      setMontantPreview(montant)
    }
  }, [quantite, prixUnitaireHT, coefficient])

  // Charger les données si on édite
  useEffect(() => {
    if (open && detail) {
      reset({
        typeDepense: detail.typeDepense,
        designation: detail.designation,
        description: detail.description || '',
        ordre: detail.ordre,
        unite: detail.unite,
        quantite: detail.quantite,
        prixUnitaireHT: detail.prixUnitaireHT,
        coefficient: detail.coefficient,
        referenceExterne: detail.referenceExterne || '',
        notes: detail.notes || '',
      })
    } else if (open) {
      reset({
        typeDepense: 'MainOeuvre',
        ordre: 1,
        coefficient: 1.0,
        quantite: 1,
        prixUnitaireHT: 0,
      })
    }
  }, [open, detail, reset])

  const onSubmit = async (data: CreateDetailDebourseSecRequest) => {
    try {
      let success = false

      if (detail) {
        // Mise à jour
        const updateData: UpdateDetailDebourseSecRequest = {
          typeDepense: data.typeDepense,
          designation: data.designation,
          description: data.description,
          ordre: data.ordre,
          unite: data.unite,
          quantite: data.quantite,
          prixUnitaireHT: data.prixUnitaireHT,
          coefficient: data.coefficient,
          referenceExterne: data.referenceExterne,
          notes: data.notes,
        }
        success = await updateDetail(detail.id, itemId, updateData)
      } else {
        // Création
        const result = await createDetail(itemId, data)
        success = result.success
      }

      if (success) {
        reset()
        onSuccess?.()
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {detail ? 'Modifier le détail' : 'Ajouter un détail de déboursé'}
          </DialogTitle>
          <DialogDescription>
            Détaillez les coûts associés à ce poste DQE
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Type de dépense */}
            <div className="space-y-2">
              <Label htmlFor="typeDepense">
                Type de dépense <span className="text-red-500">*</span>
              </Label>
              <Select
                value={typeDepense}
                onValueChange={(value: any) => setValue('typeDepense', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_DEPENSE.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ordre */}
            <div className="space-y-2">
              <Label htmlFor="ordre">Ordre d'affichage</Label>
              <Input
                id="ordre"
                type="number"
                min="1"
                {...register('ordre', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Désignation */}
          <div className="space-y-2">
            <Label htmlFor="designation">
              Désignation <span className="text-red-500">*</span>
            </Label>
            <Input
              id="designation"
              {...register('designation', { required: 'La désignation est requise' })}
              placeholder="Ex: Chef d'équipe, Ciment CPJ 45..."
            />
            {errors.designation && (
              <p className="text-sm text-red-500">{errors.designation.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optionnel)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description détaillée..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Quantité */}
            <div className="space-y-2">
              <Label htmlFor="quantite">
                Quantité <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantite"
                type="number"
                step="0.001"
                min="0.001"
                {...register('quantite', {
                  required: 'La quantité est requise',
                  valueAsNumber: true,
                  min: { value: 0.001, message: 'Doit être > 0' },
                })}
              />
              {errors.quantite && (
                <p className="text-sm text-red-500">{errors.quantite.message}</p>
              )}
            </div>

            {/* Unité */}
            <div className="space-y-2">
              <Label htmlFor="unite">
                Unité <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('unite')}
                onValueChange={(value) => setValue('unite', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {UNITES_DEBOURSE.map((unite) => (
                    <SelectItem key={unite} value={unite}>
                      {unite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unite && (
                <p className="text-sm text-red-500">{errors.unite.message}</p>
              )}
            </div>

            {/* Coefficient */}
            <div className="space-y-2">
              <Label htmlFor="coefficient">Coefficient</Label>
              <Input
                id="coefficient"
                type="number"
                step="0.01"
                min="0.01"
                {...register('coefficient', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Prix unitaire */}
            <div className="space-y-2">
              <Label htmlFor="prixUnitaireHT">
                Prix Unitaire HT (F) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prixUnitaireHT"
                type="number"
                step="1"
                min="0"
                {...register('prixUnitaireHT', {
                  required: 'Le prix unitaire est requis',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Doit être >= 0' },
                })}
              />
              {errors.prixUnitaireHT && (
                <p className="text-sm text-red-500">{errors.prixUnitaireHT.message}</p>
              )}
            </div>

            {/* Montant preview */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Montant HT calculé
              </Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 py-2">
                <span className="font-semibold text-green-600">
                  {formatCurrency(montantPreview)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                = {quantite || 0} × {formatCurrency(prixUnitaireHT || 0)} × {coefficient || 1}
              </p>
            </div>
          </div>

          {/* Référence externe */}
          <div className="space-y-2">
            <Label htmlFor="referenceExterne">Référence externe (optionnel)</Label>
            <Input
              id="referenceExterne"
              {...register('referenceExterne')}
              placeholder="Ex: REF-2024-001"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes additionnelles..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {detail ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}