"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Calendar, Euro } from "lucide-react"
import { useInvoices } from "@/hooks/useInvoices"
import type { Facture } from "@/types/invoices"
import { toast } from "@/hooks/use-toast"

interface PaymentTrackingModalProps {
  invoice: Facture
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function PaymentTrackingModal({ invoice, open, onOpenChange, onUpdate }: PaymentTrackingModalProps) {
  // Utiliser le hook pour les actions de paiement
  const { markAsPaid, loading } = useInvoices(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleMarkPaymentAsPaid = async (paymentId: string, paymentDescription: string, paymentAmount: number) => {
    const success = await markAsPaid(invoice.id.toString(), {
      montantPaye: paymentAmount,
      datePaiement: new Date().toISOString(),
    })

    if (success) {
      onUpdate()
      toast({
        title: "Paiement enregistré",
        description: `Le paiement "${paymentDescription}" a été marqué comme payé`,
      })
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "payee":
        return "bg-green-100 text-green-800"
      case "en_retard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "payee":
        return "Payé"
      case "en_retard":
        return "En retard"
      default:
        return "En attente"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Suivi des paiements - {invoice.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Euro className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Total facture</p>
              <p className="text-lg font-bold">{formatCurrency(invoice.total)}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Check className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Montant payé</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(invoice.paidAmount)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="text-sm text-muted-foreground">Reste à payer</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(invoice.remainingAmount)}</p>
            </div>
          </div>

          <Separator />

          {/* Payment Schedule */}
          <div>
            <h4 className="font-semibold mb-4">Échéancier de paiement</h4>
            <div className="space-y-3">
              {invoice.echeanciers?.map((payment, index) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            payment.statut === "Paye"
                              ? "bg-green-100 text-green-800"
                              : payment.statut === "EnRetard"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{payment.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <span>Échéance: {new Date(payment.dateEcheance).toLocaleDateString("fr-FR")}</span>
                          {payment.datePaiement && (
                            <span>Payé le: {new Date(payment.datePaiement).toLocaleDateString("fr-FR")}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(payment.montantTTC)}</p>
                      <Badge className={getPaymentStatusColor(payment.statut)}>
                        {getPaymentStatusLabel(payment.statut)}
                      </Badge>
                    </div>
                    {payment.statut !== "Paye" && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaymentAsPaid(payment.id.toString(), payment.description || "", payment.montantTTC)}
                        className="flex-shrink-0"
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Marquer payé
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div>
            <h4 className="font-semibold mb-3">Historique des paiements</h4>
            <div className="space-y-2">
              {invoice.echeanciers
                ?.filter((payment) => payment.statut === "Paye")
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between text-sm p-2 bg-green-50 rounded">
                    <span>{payment.description}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(payment.montantTTC)}</div>
                      <div className="text-muted-foreground">
                        {payment.datePaiement && new Date(payment.datePaiement).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ))}
              {invoice.echeanciers?.filter((payment) => payment.statut === "Paye").length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun paiement enregistré</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}