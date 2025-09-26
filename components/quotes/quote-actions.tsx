// components/devis/devis-actions.tsx
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
import { MoreHorizontal, Mail, Copy, Edit, Eye, Trash2, FileDown, Receipt, Loader2 } from "lucide-react"
import { DevisListItem, DevisStatutLabels } from "@/types/Devis"
import { useDevisActions } from "@/hooks/useDevis"
import { QuotePreviewModal } from "./quote-preview-modal"
import { InvoiceGenerationModal } from "./invoice-generation-modal"
import { toast } from "@/hooks/use-toast"

interface QuoteActionsProps {
  devis: DevisListItem
  onUpdate: () => void
  onEdit?: (devis: DevisListItem) => void
}

export function QuoteActions({ devis, onUpdate, onEdit }: QuoteActionsProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const {
    loading,
    envoyerDevis,
    validerDevis,
    refuserDevis,
    dupliquerDevis,
    deleteDevis,
    exporterPDF
  } = useDevisActions()

  const handleSendDevis = async () => {
    try {
      await envoyerDevis(devis.id)
      toast({
        title: "Devis envoyé",
        description: `Le devis ${devis.numero} a été envoyé avec succès`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'envoi du devis",
        variant: "destructive",
      })
    }
  }

  const handleValidateDevis = async () => {
    try {
      await validerDevis(devis.id)
      toast({
        title: "Devis validé",
        description: `Le devis ${devis.numero} a été validé`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la validation du devis",
        variant: "destructive",
      })
    }
  }

  const handleRejectDevis = async () => {
    try {
      await refuserDevis(devis.id)
      toast({
        title: "Devis refusé",
        description: `Le devis ${devis.numero} a été refusé`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du refus du devis",
        variant: "destructive",
      })
    }
  }

  const handleDuplicate = async () => {
    try {
      const response = await dupliquerDevis(devis.id)
      toast({
        title: "Devis dupliqué",
        description: `Nouveau devis créé avec l'ID ${response.data?.id}`,
      })
      onUpdate()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la duplication du devis",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = async () => {
    try {
      await exporterPDF(devis.id, `devis-${devis.numero}.pdf`)
      toast({
        title: "Export PDF",
        description: `Le devis ${devis.numero} a été exporté en PDF`,
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'export PDF",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    try {
      await deleteDevis(devis.id)
      toast({
        title: "Devis supprimé",
        description: `Le devis ${devis.numero} a été supprimé`,
      })
      setShowDeleteDialog(false)
      onUpdate()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du devis",
        variant: "destructive",
      })
    }
  }

  const handleGenerateInvoice = () => {
    if (devis.statut === "Valide") {
      setShowInvoiceModal(true)
    } else {
      toast({
        title: "Action impossible",
        description: "Seuls les devis validés peuvent générer une facture",
        variant: "destructive",
      })
    }
  }

  const canSend = devis.statut === "Brouillon"
  const canValidate = ["Envoye", "EnNegociation"].includes(devis.statut)
  const canReject = ["Envoye", "EnNegociation"].includes(devis.statut)
  const canEdit = ["Brouillon", "Refuse"].includes(devis.statut)
  const canGenerateInvoice = devis.statut === "Valide"

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </DropdownMenuItem>
          
          {canSend && (
            <DropdownMenuItem onClick={handleSendDevis}>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer
            </DropdownMenuItem>
          )}
          
          {canValidate && (
            <DropdownMenuItem onClick={handleValidateDevis}>
              <Receipt className="mr-2 h-4 w-4" />
              Valider
            </DropdownMenuItem>
          )}
          
          {canReject && (
            <DropdownMenuItem onClick={handleRejectDevis} className="text-orange-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Refuser
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Dupliquer
          </DropdownMenuItem>
          
          {canEdit && onEdit && (
            <DropdownMenuItem onClick={() => onEdit(devis)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </DropdownMenuItem>
          
          {canGenerateInvoice && (
            <DropdownMenuItem onClick={handleGenerateInvoice}>
              <Receipt className="mr-2 h-4 w-4" />
              Générer facture
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <QuotePreviewModal 
        quote={devis as any} 
        open={showPreview} 
        onOpenChange={setShowPreview} 
      />

      <InvoiceGenerationModal
        quote={devis as any}
        open={showInvoiceModal}
        onOpenChange={setShowInvoiceModal}
        onGenerate={() => {
          setShowInvoiceModal(false)
          toast({
            title: "Facture générée",
            description: `Facture créée à partir du devis ${devis.numero}`,
          })
        }}
      />

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le devis</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le devis {devis.numero} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}