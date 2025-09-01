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
import { MoreHorizontal, Mail, Copy, Edit, Eye, Trash2, FileDown, Receipt } from "lucide-react"
import { type Quote, updateQuoteStatus, duplicateQuote } from "@/lib/quotes"
import { QuotePreviewModal } from "./quote-preview-modal"
import { InvoiceGenerationModal } from "./invoice-generation-modal"
import { toast } from "@/hooks/use-toast"

interface QuoteActionsProps {
  quote: Quote
  onUpdate: () => void
}

export function QuoteActions({ quote, onUpdate }: QuoteActionsProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSendQuote = async () => {
    updateQuoteStatus(quote.id, "envoye")
    onUpdate()
    toast({
      title: "Devis envoyé",
      description: `Le devis ${quote.number} a été envoyé à ${quote.clientEmail}`,
    })
  }

  const handleDuplicate = () => {
    const newQuote = duplicateQuote(quote.id)
    if (newQuote) {
      onUpdate()
      toast({
        title: "Devis dupliqué",
        description: `Nouveau devis ${newQuote.number} créé`,
      })
    }
  }

  const handleGenerateInvoice = () => {
    if (quote.status === "valide") {
      setShowInvoiceModal(true)
    } else {
      toast({
        title: "Action impossible",
        description: "Seuls les devis validés peuvent générer une facture",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = () => {
    toast({
      title: "Export PDF",
      description: `Le devis ${quote.number} a été exporté en PDF`,
    })
  }

  const handleDelete = () => {
    // In a real app, this would delete from the database
    toast({
      title: "Devis supprimé",
      description: `Le devis ${quote.number} a été supprimé`,
    })
    setShowDeleteDialog(false)
    onUpdate()
  }

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
          <DropdownMenuItem onClick={handleSendQuote} disabled={quote.status === "valide"}>
            <Mail className="mr-2 h-4 w-4" />
            Envoyer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Dupliquer
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </DropdownMenuItem>
          {quote.status === "valide" && (
            <DropdownMenuItem onClick={handleGenerateInvoice}>
              <Receipt className="mr-2 h-4 w-4" />
              Générer facture
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <QuotePreviewModal quote={quote} open={showPreview} onOpenChange={setShowPreview} />

      <InvoiceGenerationModal
        quote={quote}
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        onGenerate={() => {
          setShowInvoiceModal(false)
          toast({
            title: "Facture générée",
            description: `Facture créée à partir du devis ${quote.number}`,
          })
        }}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le devis</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le devis {quote.number} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
