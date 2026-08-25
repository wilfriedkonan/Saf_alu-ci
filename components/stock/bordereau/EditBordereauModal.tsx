"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useMouvementsActions } from "@/hooks/useStock"
import type { UpdateBordereauResultDTO } from "@/types/stock"

interface EditBordereauModalProps {
  open: boolean
  type: "entree" | "sortie"
  reference: string
  depotId: number
  notes?: string
  dateMouvement?: string
  motifSortie?: string
  onOpenChange: (v: boolean) => void
  onSuccess: (result: UpdateBordereauResultDTO) => void
}

const toDateInputValue = (value?: string) => {
  if (!value) return ""
  const d = new Date(value)
  if (isNaN(d.getTime())) return ""
  return d.toISOString().slice(0, 10)
}

export function EditBordereauModal({
  open,
  type,
  reference,
  depotId,
  notes,
  dateMouvement,
  motifSortie,
  onOpenChange,
  onSuccess,
}: EditBordereauModalProps) {
  const isSortie = type === "sortie"
  const { updateBordereauEntree, updateBordereauSortie, loading } = useMouvementsActions()

  const initialNotes = notes || ""
  const initialDate = toDateInputValue(dateMouvement)
  const initialMotifSortie = motifSortie || ""

  const [nouvelleReference, setNouvelleReference] = useState("")
  const [formNotes, setFormNotes] = useState(initialNotes)
  const [formDate, setFormDate] = useState(initialDate)
  const [formMotifSortie, setFormMotifSortie] = useState(initialMotifSortie)

  useEffect(() => {
    if (!open) return
    setNouvelleReference("")
    setFormNotes(notes || "")
    setFormDate(toDateInputValue(dateMouvement))
    setFormMotifSortie(motifSortie || "")
  }, [open, notes, dateMouvement, motifSortie])

  const handleSubmit = async () => {
    const payload: Record<string, string | number | undefined> = {
      reference,
      depotId,
    }

    const trimmedNouvelleReference = nouvelleReference.trim()
    if (trimmedNouvelleReference && trimmedNouvelleReference !== reference) {
      payload.nouvelleReference = trimmedNouvelleReference
    }
    if (formNotes.trim() !== initialNotes.trim()) {
      payload.notes = formNotes.trim()
    }
    if (formDate && formDate !== initialDate) {
      payload.dateMouvement = formDate
    }
    if (isSortie && formMotifSortie.trim() !== initialMotifSortie.trim()) {
      payload.motifSortie = formMotifSortie.trim()
    }

    const hasChanges = Object.keys(payload).some((key) => key !== "reference" && key !== "depotId")
    if (!hasChanges) {
      toast.info("Aucun champ à modifier.")
      return
    }

    try {
      const result = isSortie
        ? await updateBordereauSortie(payload as any)
        : await updateBordereauEntree(payload as any)
      toast.success(result.message)
      onSuccess(result)
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur serveur")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Modifier le bordereau — {isSortie ? "Sortie" : "Entrée"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-md bg-muted p-3 text-sm">
            <span className="text-muted-foreground">Référence actuelle : </span>
            <span className="font-mono font-semibold">{reference}</span>
          </div>

          <div>
            <Label>Nouvelle référence (optionnel)</Label>
            <Input
              placeholder={reference}
              value={nouvelleReference}
              onChange={(e) => setNouvelleReference(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Laisser vide pour conserver la référence actuelle.
            </p>
          </div>

          <div>
            <Label>Date du bordereau</Label>
            <Input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
            />
          </div>

          {isSortie && (
            <div>
              <Label>Motif de sortie</Label>
              <Input
                value={formMotifSortie}
                onChange={(e) => setFormMotifSortie(e.target.value)}
                placeholder="Ex: Chantier Tour Abidjan"
              />
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea
              rows={3}
              placeholder="Notes ou remarques sur ce bordereau..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enregistrer les modifications
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
