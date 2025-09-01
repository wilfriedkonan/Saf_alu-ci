"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontal, Mail, Edit, Eye, FileDown, Check, AlertTriangle, X } from "lucide-react"
import { type Invoice, updateInvoiceStatus, sendReminder } from "@/lib/invoices"
import { InvoicePreviewModal } from "./invoice-preview-modal"
import { PaymentTrackingModal } from "./payment-tracking-modal"
import { toast } from "@/hooks/use-toast"

interface InvoiceActionsProps {
  invoice: Invoice
  onUpdate: () => void
}

export function InvoiceActions({ invoice, onUpdate }: InvoiceActionsProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const handleSendInvoice = async () => {
    updateInvoiceStatus(invoice.id, "envoyee")
    onUpdate()
    toast({
      title: "Facture envoyée",
      description: `La facture ${invoice.number} a été envoyée à ${invoice.clientEmail}`,
    })
  }

  const handleMarkAsPaid = () => {
    updateInvoiceStatus(invoice.id, "payee")
    onUpdate()
    toast({
      title: "Facture marquée comme payée",
      description: `La facture ${invoice.number} a été marquée comme payée`,
    })
  }

  const handleSendReminder = () => {
    sendReminder(invoice.id)
    onUpdate()
    toast({
      title: "Relance envoyée",
      description: `Une relance a été envoyée pour la facture ${invoice.number}`,
    })
  }

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: `La facture ${invoice.number} a été exportée en PDF`,
    })
  }

  const handleExportExcel = () => {
    toast({
      title: "Export Excel",
      description: `Les données comptables de la facture ${invoice.number} ont été exportées`,
    })
  }

  const handleCancel = () => {
    updateInvoiceStatus(invoice.id, "annulee")
    onUpdate()
    toast({
      title: "Facture annulée",
      description: `La facture ${invoice.number} a été annulée`,
    })
    setShowCancelDialog(false)
  }

  const canSend = invoice.status === "brouillon"
  const canMarkPaid =
    invoice.status === "envoyee" || invoice.status === "en_retard" || invoice.status === "partiellement_payee"
  const canSendReminder =
    invoice.status === "envoyee" || invoice.status === "en_retard" || invoice.status === "partiellement_payee"
  const canCancel = invoice.status !== "payee" && invoice.status !== "annulee"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </DropdownMenuItem>
          {canSend && (
            <DropdownMenuItem onClick={handleSendInvoice}>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer
            </DropdownMenuItem>
          )}
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {canMarkPaid && (
            <DropdownMenuItem onClick={() => setShowPaymentModal(true)}>
              <Check className="mr-2 h-4 w-4" />
              Gérer paiements
            </DropdownMenuItem>
          )}
          {canSendReminder && (
            <DropdownMenuItem onClick={handleSendReminder}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Envoyer relance
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcel}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {canCancel && (
            <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600">
              <X className="mr-2 h-4 w-4" />
              Annuler
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <InvoicePreviewModal invoice={invoice} open={showPreview} onOpenChange={setShowPreview} />

      <PaymentTrackingModal
        invoice={invoice}
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onUpdate={onUpdate}
      />

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la facture</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler la facture {invoice.number} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
