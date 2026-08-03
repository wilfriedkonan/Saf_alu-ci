"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"
import { type Demande, type RejeterDemandeRequest, formatMontantStock } from "@/types/stock"

interface RejetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demande: Demande
  onConfirm: (data: RejeterDemandeRequest) => void
}

export function RejetModal({
  open,
  onOpenChange,
  demande,
  onConfirm,
}: RejetModalProps) {
  const [motifRejet, setMotifRejet] = useState("")

  const handleConfirm = () => {
    onConfirm({ motifRejet })
    setMotifRejet("")
  }

  const handleClose = () => {
    onOpenChange(false)
    setMotifRejet("")
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md w-full mx-auto rounded-xl shadow-xl p-0 gap-0">
        {/* Header with destructive icon */}
        <div className="flex items-start gap-4 p-6">
          <div className="flex-none w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="flex-1 space-y-1">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Confirmer le rejet
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Cette action est irreversible. La demande sera marquee comme rejetee et le demandeur sera notifie.
            </DialogDescription>
          </div>
        </div>

        {/* Resume */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">N° demande</span>
              <span className="font-mono font-medium text-gray-900">{demande.numero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Demandeur</span>
              <span className="font-medium text-gray-900">{demande.nomDemandeur}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Montant HT</span>
              <span className="font-bold text-gray-900">{formatMontantStock(demande.traitement?.montantDevisTTC ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* Motif */}
        <div className="px-6 pb-4 space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Motif du rejet <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="motif"
            value={motifRejet}
            onChange={(e) => setMotifRejet(e.target.value)}
            placeholder="Expliquez le motif du rejet..."
            rows={3}
            className="resize-none border-gray-300"
          />
          <p className="text-xs text-gray-400">
            Ce motif sera visible par le demandeur.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!motifRejet.trim()}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirmer le rejet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
