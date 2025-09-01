"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import type { Quote } from "@/lib/quotes"

interface InvoiceGenerationModalProps {
  quote: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate: () => void
}

export function InvoiceGenerationModal({ quote, open, onOpenChange, onGenerate }: InvoiceGenerationModalProps) {
  const [paymentSchedule, setPaymentSchedule] = useState("unique")
  const [notes, setNotes] = useState("")

  const handleGenerate = () => {
    // In a real app, this would create the invoice(s) in the database
    onGenerate()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getScheduleDetails = () => {
    switch (paymentSchedule) {
      case "30_70":
        return [
          { label: "Acompte (30%)", amount: quote.total * 0.3 },
          { label: "Solde (70%)", amount: quote.total * 0.7 },
        ]
      case "mensuel":
        const monthlyAmount = quote.total / 3
        return [
          { label: "1er mois", amount: monthlyAmount },
          { label: "2ème mois", amount: monthlyAmount },
          { label: "3ème mois", amount: monthlyAmount },
        ]
      default:
        return [{ label: "Paiement unique", amount: quote.total }]
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Générer une facture</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Génération de facture à partir du devis {quote.number} pour un montant de {formatCurrency(quote.total)}
            </p>
          </div>

          <div>
            <Label className="text-base font-medium">Échéancier de paiement</Label>
            <RadioGroup value={paymentSchedule} onValueChange={setPaymentSchedule} className="mt-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unique" id="unique" />
                <Label htmlFor="unique">Paiement unique</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30_70" id="30_70" />
                <Label htmlFor="30_70">30% acompte / 70% solde</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mensuel" id="mensuel" />
                <Label htmlFor="mensuel">Paiement mensuel (3 mois)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Détail de l'échéancier :</h4>
            <div className="space-y-1">
              {getScheduleDetails().map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Notes additionnelles pour la facture..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleGenerate}>Générer la facture</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
