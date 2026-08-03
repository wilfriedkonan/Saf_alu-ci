"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle } from "lucide-react"
import { type Demande, type ValiderDemandeRequest, formatMontantStock } from "@/types/stock"


interface ValidationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demande: Demande
  onConfirm: (data: ValiderDemandeRequest) => void
}

export function ValidationModal({
  open,
  onOpenChange,
  demande,
  onConfirm,
}: ValidationModalProps) {
  const [notesValidation, setNotesValidation] = useState("")
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState("")

  const handleConfirm = () => {
    onConfirm({ notesValidation, dateLivraisonPrevue })
    setNotesValidation("")
    setDateLivraisonPrevue("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setNotesValidation("")
    setDateLivraisonPrevue("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full mx-auto rounded-xl shadow-xl p-0 gap-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Valider la demande
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-gray-500">
            Confirmez la validation de cette demande de stock.
          </DialogDescription>
        </div>

        {/* Corps */}
        <div className="px-6 py-5 space-y-4">
          {/* Resume */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">N° demande</span>
              <span className="font-mono font-medium text-gray-900">{demande.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Fournisseur</span>
              <span className="font-medium text-gray-900">{demande.traitement?.fournisseurNom || demande.fournisseur || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Montant total HT</span>
              <span className="font-bold text-[#1e3a5f]">{formatMontantStock(demande.traitement?.montantDevisHT ?? demande.montantTotal)}</span>
            </div>
          </div>

          {/* Date livraison prevue */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Date de livraison prevue <span className="text-red-500">*</span></label>
            <Input
              id="dateLivraison"
              type="date"
              value={dateLivraisonPrevue}
              onChange={(e) => setDateLivraisonPrevue(e.target.value)}
              className="h-9 border-gray-300"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Notes de validation (optionnel)</label>
            <Textarea
              id="notes"
              value={notesValidation}
              onChange={(e) => setNotesValidation(e.target.value)}
              placeholder="Ajouter des notes ou remarques..."
              rows={3}
              className="resize-none border-gray-300"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!dateLivraisonPrevue}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Confirmer la validation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
