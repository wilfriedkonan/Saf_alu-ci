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
import { useInvoices } from "@/hooks/useInvoices"
import type { Invoice } from "@/lib/invoices"
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

  // Utiliser le hook pour les actions
  const { send, cancel, sendReminder, downloadPDF, loading } = useInvoices(false)

  const handleSendInvoice = async () => {
    const success = await send(invoice.id)
    if (success) {
      onUpdate()
      toast({
        title: "Facture envoyée",
        description: `La facture ${invoice.number} a été envoyée à ${invoice.clientEmail}`,
      })
    }
  }

  const handleSendReminder = async () => {
    const success = await sendReminder(invoice.id)
    if (success) {
      onUpdate()
      toast({
        title: "Relance envoyée",
        description: `Une relance a été envoyée pour la facture ${invoice.number}`,
      })
    }
  }

  const handleExportPDF = async () => {
    await downloadPDF(invoice.id)
  }

  const handleExportExcel = () => {
    toast({
      title: "Export Excel",
      description: `Les données comptables de la facture ${invoice.number} ont été exportées`,
    })
  }

  const handleCancel = async () => {
    const success = await cancel(invoice.id)
    if (success) {
      onUpdate()
      toast({
        title: "Facture annulée",
        description: `La facture ${invoice.number} a été annulée`,
      })
      setShowCancelDialog(false)
    }
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
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </DropdownMenuItem>
          {canSend && (
            <DropdownMenuItem onClick={handleSendInvoice} disabled={loading}>
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
            <DropdownMenuItem onClick={handleSendReminder} disabled={loading}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Envoyer relance
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportPDF} disabled={loading}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcel}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Excel
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {canCancel && (
            <DropdownMenuItem onClick={() => setShowCancelDialog(true)} className="text-red-600" disabled={loading}>
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
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}