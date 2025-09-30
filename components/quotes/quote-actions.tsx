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
import { DevisListItem, DevisStatutLabels, Devis } from "@/types/devis"
import { useDevisActions } from "@/hooks/useDevis"
import { QuotePreviewModal } from "./quote-preview-modal"
import { InvoiceGenerationModal } from "./invoice-generation-modal"
import { toast } from "@/hooks/use-toast"
import { useDevisService } from "@/services/devisService"

interface QuoteActionsProps {
  devis: DevisListItem
  onUpdate: () => void
  onEdit?: (devis: DevisListItem) => void
}

export function QuoteActions({ devis, onUpdate, onEdit }: QuoteActionsProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [showValidateDialog, setShowValidateDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showGenerateInvoiceDialog, setShowGenerateInvoiceDialog] = useState(false)
  const [thisDevis, setThisDevis] = useState<Devis | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

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

  const {
    getDevisById
  } = useDevisService()

  const handlePreview = async () => {
    try {
      setPreviewLoading(true)
      const response = await getDevisById(devis.id)
      setThisDevis(response)
      setShowPreview(true)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ouverture du devis",
        variant: "destructive",
      })
    } finally {
      setPreviewLoading(false)
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
          <DropdownMenuItem onClick={handlePreview}>
            <Eye className="mr-2 h-4 w-4" />
            Prévisualiser
          </DropdownMenuItem>

          {canSend && (
            <DropdownMenuItem onClick={() => setShowSendDialog(true)}>
              <Mail className="mr-2 h-4 w-4" />
              Envoyer
            </DropdownMenuItem>
          )}

          {canValidate && (
            <DropdownMenuItem onClick={() => setShowValidateDialog(true)}>
              <Receipt className="mr-2 h-4 w-4" />
              Valider
            </DropdownMenuItem>
          )}

          {canReject && (
            <DropdownMenuItem onClick={() => setShowRejectDialog(true)} className="text-orange-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Refuser
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setShowDuplicateDialog(true)}>
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

          <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            Export PDF
          </DropdownMenuItem>

          {canGenerateInvoice && (
            <DropdownMenuItem onClick={() => setShowGenerateInvoiceDialog(true)}>
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

      {/* Confirm Send */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer le devis</DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment envoyer le devis {devis.numero} au client ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={loading}>Annuler</Button>
            <Button onClick={async () => { await handleSendDevis(); setShowSendDialog(false) }} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Validate */}
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le devis</DialogTitle>
            <DialogDescription>
              Confirmez-vous la validation du devis {devis.numero} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidateDialog(false)} disabled={loading}>Annuler</Button>
            <Button onClick={async () => { await handleValidateDevis(); setShowValidateDialog(false) }} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Reject */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser le devis</DialogTitle>
            <DialogDescription>
              Souhaitez-vous refuser le devis {devis.numero} ? Cette action est réversible par validation ultérieure.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={loading}>Annuler</Button>
            <Button onClick={async () => { await handleRejectDevis(); setShowRejectDialog(false) }} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refuser"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Duplicate */}
      <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dupliquer le devis</DialogTitle>
            <DialogDescription>
              Voulez-vous créer une copie du devis {devis.numero} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicateDialog(false)} disabled={loading}>Annuler</Button>
            <Button onClick={async () => { await handleDuplicate(); setShowDuplicateDialog(false) }} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dupliquer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Export */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter en PDF</DialogTitle>
            <DialogDescription>
              Confirmez l'export du devis {devis.numero} en PDF.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)} disabled={loading}>Annuler</Button>
            <Button onClick={async () => { await handleExportPDF(); setShowExportDialog(false) }} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Exporter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Generate Invoice */}
      <Dialog open={showGenerateInvoiceDialog} onOpenChange={setShowGenerateInvoiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Générer une facture</DialogTitle>
            <DialogDescription>
              Voulez-vous générer une facture à partir du devis {devis.numero} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateInvoiceDialog(false)} disabled={loading}>Annuler</Button>
            <Button onClick={() => { setShowGenerateInvoiceDialog(false); handleGenerateInvoice() }} disabled={loading}>
              Générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {thisDevis && (
        <QuotePreviewModal
          quote={thisDevis}
          open={showPreview}
          onOpenChange={(open) => {
            if (!open) setThisDevis(null)
            setShowPreview(open)
          }}
        />
      )}

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