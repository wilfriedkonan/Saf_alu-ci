"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type Quote, quoteStatusLabels, quoteStatusColors } from "@/lib/quotes"
import { Building2, Calendar, Mail, Phone, MapPin } from "lucide-react"

interface QuotePreviewModalProps {
  quote: Quote
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuotePreviewModal({ quote, open, onOpenChange }: QuotePreviewModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Prévisualisation - {quote.number}</span>
            <Badge className={quoteStatusColors[quote.status]}>{quoteStatusLabels[quote.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">SAF ALU-CI</h2>
                <p className="text-sm text-muted-foreground">Entreprise de Construction</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-lg font-semibold">DEVIS</h3>
              <p className="text-sm text-muted-foreground">{quote.number}</p>
            </div>
          </div>

          <Separator />

          {/* Client Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Informations client</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.clientName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.clientEmail}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.clientPhone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{quote.clientAddress}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Détails du devis</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Créé le {new Date(quote.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Valide jusqu'au {new Date(quote.validUntil).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Project Details */}
          <div>
            <h4 className="font-semibold mb-3">Projet</h4>
            <h5 className="text-lg font-medium">{quote.projectTitle}</h5>
            <p className="text-muted-foreground mt-1">{quote.description}</p>
          </div>

          <Separator />

          {/* Items Table */}
          <div>
            <h4 className="font-semibold mb-3">Détail des prestations</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Qté</th>
                    <th className="text-right p-3">Unité</th>
                    <th className="text-right p-3">Prix unitaire</th>
                    <th className="text-right p-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                      <td className="p-3">{item.description}</td>
                      <td className="text-right p-3">{item.quantity}</td>
                      <td className="text-right p-3">{item.unit}</td>
                      <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right p-3 font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between">
                <span>Sous-total :</span>
                <span>{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({quote.taxRate}%) :</span>
                <span>{formatCurrency(quote.taxAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC :</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-muted-foreground">{quote.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
