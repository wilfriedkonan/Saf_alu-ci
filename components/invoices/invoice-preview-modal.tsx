"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { type Facture, invoiceStatusLabels, invoiceStatusColors, invoiceTypeLabels } from "@/types/invoices"
import { Building2, Mail, Phone, MapPin } from "lucide-react"
import { useInvoice } from "@/hooks/useInvoices"

interface InvoicePreviewModalProps {
  invoice: Facture
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InvoicePreviewModal({ invoice, open, onOpenChange }: InvoicePreviewModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-6xl xl:max-w-7xl max-h-[92vh] overflow-y-auto sm:max-w-7xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Prévisualisation - {invoice.numero}</span>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{invoiceTypeLabels[invoice.typeFacture]}</Badge>
              <Badge className={invoiceStatusColors[invoice.statut]}>{invoiceStatusLabels[invoice.statut]}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary rounded-lg">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">SAF ALU-CI</h2>
                <p className="text-sm text-muted-foreground">Entreprise de Construction</p>
                <p className="text-xs text-muted-foreground">Abidjan, Côte d'Ivoire</p>
              </div>
            </div>
            <div className="text-left md:text-right">
              <h3 className="text-lg font-semibold">FACTURE</h3>
              <p className="text-sm text-muted-foreground">{invoice.numero}</p>
              <p className="text-xs text-muted-foreground">{invoiceTypeLabels[invoice.typeFacture]}</p>
            </div>
          </div>

          <Separator />

          {/* Client and Invoice Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Facturer à</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{invoice.detailDebiteur?.nom}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{invoice.detailDebiteur.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{invoice.detailDebiteur.telephone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{invoice.detailDebiteur.adresse}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Détails de la facture</h4>
              <div className="space-y-2">
                <div className="justify-between">
                  <span className="text-muted-foreground">Date d'émission:</span>
                  <span> {new Date(invoice.dateCreation).toLocaleDateString("fr-FR")}</span>
                </div>
                <div className="justify-between">
                  <span className="text-muted-foreground">Date d'échéance:</span>
                  <span> {new Date(invoice.dateEcheance).toLocaleDateString("fr-FR")}</span>
                </div>
                {invoice.datePaiement && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date de paiement:</span>
                    <span>{new Date(invoice.datePaiement).toLocaleDateString("fr-FR")}</span>
                  </div>
                )}
                {invoice.devisId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Devis associé:</span>
                    <span>DEV-2024-{invoice.devisId.toString().padStart(3, "0")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Project Details */}
          <div>
            <h4 className="font-semibold mb-3">Projet</h4>
            <h5 className="text-lg font-medium">{invoice.projectTitle}</h5>
            <p className="text-muted-foreground mt-1">{invoice.description}</p>
          </div>

          <Separator />

          {/* Items Table */}
          <div>
            <h4 className="font-semibold mb-3">Détail des prestations</h4>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full min-w-[600px]">
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
                  {invoice.lignes?.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}>
                      <td className="p-3">{item.designation}</td>
                      <td className="text-right p-3">{item.quantite}</td>
                      <td className="text-right p-3">{item.unite}</td>
                      <td className="text-right p-3">{formatCurrency(item.prixUnitaireHT)}</td>
                      <td className="text-right p-3 font-medium">{formatCurrency(item.totalHT)}</td>
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
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({invoice.tauxTVA}%) :</span>
                <span>{formatCurrency(invoice.montantTVA)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total TTC :</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Montant payé :</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Reste à payer :</span>
                    <span>{formatCurrency(invoice.remainingAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Schedule */}
          {invoice.echeanciers && invoice?.echeanciers?.length > 1 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-3">Échéancier de paiement</h4>
                <div className="space-y-2">
                  {invoice.echeanciers.map((payment, index) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Échéance: {new Date(payment.dateEcheance).toLocaleDateString("fr-FR")}
                          {payment.datePaiement && ` • Payé le ${new Date(payment.datePaiement).toLocaleDateString("fr-FR")}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(payment?.montantTTC)}</p>
                        <Badge
                          variant="outline"
                          className={
                            payment.statut === "Payee"
                              ? "bg-green-100 text-green-800"
                              : payment.statut === "en_retard"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {payment.statut === "payee"
                            ? "Payé"
                            : payment.statut === "en_retard"
                              ? "En retard"
                              : "En attente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
         {/*  {invoice.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Notes</h4>
                <p className="text-muted-foreground">{invoice.notes}</p>
              </div>
            </>
          )} */}

          {/* Reminders */}
          {/* {invoice.remindersSent > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Relances</h4>
                <p className="text-sm text-muted-foreground">
                  {invoice.remindersSent} relance(s) envoyée(s)
                  {invoice.lastReminderDate &&
                    ` • Dernière relance le ${new Date(invoice.lastReminderDate).toLocaleDateString("fr-FR")}`}
                </p>
              </div>
            </>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  )
}
