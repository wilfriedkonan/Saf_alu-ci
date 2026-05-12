"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { CheckCheck, Copy, Loader2, Info, Phone, Plus, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { DevisFournisseurService, FournisseurService } from "@/services/devisFournisseurService"
import { useFournisseurs, useComparaisonDevis } from "@/hooks/useDevisFournisseur"
import type { DemandeCreee } from "@/components/devis-fournisseur/whatsapp-send-panel"
import type { CreateFournisseurRequest, DevisDemande } from "@/types/devis-fournisseur"

const fCurrency = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(n)

// ============================================================
// FORMULAIRE INLINE — CRÉER UN FOURNISSEUR
// ============================================================

const emptyForm = (): CreateFournisseurRequest => ({
  nom: "", raisonSociale: "", email: "", telephone: "",
  adresse: "", ville: "", nomContact: "", telephoneContact: "", emailContact: "", ncc: "",
})

function CreerFournisseurForm({
  onSuccess, onCancel,
}: {
  onSuccess: (id: number, nom: string) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<CreateFournisseurRequest>(emptyForm())
  const [loading, setLoading] = useState(false)
  const set = (k: keyof CreateFournisseurRequest, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (!form.nom.trim()) {
      toast({ title: "Le nom est obligatoire", variant: "destructive" }); return
    }
    setLoading(true)
    try {
      const res = await FournisseurService.create(form)
      toast({ title: "Fournisseur créé", description: form.nom })
      onSuccess(res.id, form.nom)
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sous-en-tête */}
      <div className="px-6 pt-4 pb-3 border-b shrink-0 flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md p-1 hover:bg-muted transition-colors"
          title="Retour à la liste"
        >
          <ArrowLeft className="h-4 w-4 text-muted-foreground" />
        </button>
        <p className="font-semibold text-sm">Nouveau fournisseur</p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-4 space-y-4">
          {/* Infos principales */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Nom <span className="text-destructive">*</span></Label>
              <Input
                value={form.nom}
                onChange={e => set("nom", e.target.value)}
                placeholder="Nom du fournisseur"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Téléphone</Label>
                <Input
                  value={form.telephone}
                  onChange={e => set("telephone", e.target.value)}
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ville</Label>
                <Input value={form.ville} onChange={e => set("ville", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Raison sociale</Label>
              <Input value={form.raisonSociale} onChange={e => set("raisonSociale", e.target.value)} />
            </div>
          </div>

          <Separator />

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contact principal (optionnel)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nom du contact</Label>
                <Input value={form.nomContact} onChange={e => set("nomContact", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tél. contact</Label>
                <Input value={form.telephoneContact} onChange={e => set("telephoneContact", e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="px-6 py-4 border-t bg-muted/20 flex gap-3 shrink-0">
        <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
          Annuler
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Créer le fournisseur
        </Button>
      </div>
    </div>
  )
}

// ============================================================
// MODAL — ENVOYER DEMANDES
// ============================================================

export function EnvoyerDemandesModal({
  open, devisId, devisReference, demandesExistantes = [], onOpenChange, onSuccess,
}: {
  open: boolean
  devisId: number
  devisReference: string
  demandesExistantes?: DevisDemande[]
  onOpenChange: (v: boolean) => void
  onSuccess: (demandes: DemandeCreee[]) => void
}) {
  const { fournisseurs, loading: loadingF, refresh: refreshF } = useFournisseurs()
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [duree, setDuree] = useState(48)
  const [loading, setLoading] = useState(false)
  const [showCreer, setShowCreer] = useState(false)

  const filtres = fournisseurs.filter(f =>
    !search ||
    f.nom.toLowerCase().includes(search.toLowerCase()) ||
    (f.telephone ?? "").includes(search)
  )

  const toggle = (id: number) => setSelectedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const handleFournisseurCree = async (id: number) => {
    await refreshF()
    setSelectedIds(prev => new Set(prev).add(id))
    setShowCreer(false)
  }

  const handleEnvoyer = async () => {
    if (selectedIds.size === 0) {
      toast({ title: "Sélectionnez au moins un fournisseur", variant: "destructive" }); return
    }
    setLoading(true)
    try {
      const res = await DevisFournisseurService.envoyerDemandes(devisId, {
        fournisseurIds: Array.from(selectedIds),
        dureeValiditeHeures: duree,
      })

      // Normalise la réponse : tableau direct, { demandes: [] }, ou .NET { demandes: { $values: [] } }
      const rawList: any[] =
        Array.isArray(res) ? res :
        Array.isArray(res?.demandes) ? res.demandes :
        Array.isArray(res?.demandes?.$values) ? res.demandes.$values :
        []

      const demandes: DemandeCreee[] = rawList.map((d: any) => {
        const lienFrontend = `${window.location.origin}/public/${d.token}`
        return {
          id: d.id, fournisseurId: d.fournisseurId,
          fournisseurNom: d.fournisseurNom, fournisseurTelephone: d.fournisseurTelephone,
          token: d.token, otp: d.otp, dateExpiration: d.dateExpiration,
          lienDevis: lienFrontend,
          messageWhatsApp: (d.messageWhatsApp ?? "").replace(
            /https?:\/\/[^\s]*\/(?:devis-fournisseur\/)?public\/[^\s]*/g,
            lienFrontend
          ),
        }
      })

      if (demandes.length === 0) {
        // L'API n'a créé aucune nouvelle demande : ces fournisseurs ont déjà une demande active.
        // On récupère leurs demandes existantes depuis devis.demandes.
        const existantes: DemandeCreee[] = demandesExistantes
          .filter(d => selectedIds.has(d.fournisseurId))
          .map(d => {
            const lienFrontend = `${window.location.origin}/public/${d.token}`
            return {
              id: d.id,
              fournisseurId: d.fournisseurId,
              fournisseurNom: d.fournisseurNom ?? "",
              fournisseurTelephone: d.fournisseurTelephone,
              token: d.token,
              otp: d.otp,
              dateExpiration: d.dateExpiration,
              lienDevis: lienFrontend,
              messageWhatsApp: (d.messageWhatsApp ?? "").replace(
                /https?:\/\/[^\s]*\/(?:devis-fournisseur\/)?public\/[^\s]*/g,
                lienFrontend
              ),
            }
          })
        toast({ title: "Une demande a déjà été envoyée à ce fournisseur", description: "Les informations existantes ont été chargées." })
        onSuccess(existantes)
      } else {
        toast({ title: `${demandes.length} demande(s) créée(s)` })
        onSuccess(demandes)
      }
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!loading) { onOpenChange(v); setShowCreer(false) } }}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden">

        {/* ── Vue : formulaire nouveau fournisseur ── */}
        {showCreer ? (
          <CreerFournisseurForm
            onSuccess={handleFournisseurCree}
            onCancel={() => setShowCreer(false)}
          />
        ) : (
          <>
            {/* ── Vue : liste des fournisseurs ── */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle>Envoyer le devis — {devisReference}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Sélectionnez les fournisseurs à solliciter
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => setShowCreer(true)}
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />Nouveau
                </Button>
              </div>
            </DialogHeader>

            <div className="px-6 py-3 border-b shrink-0">
              <Input
                placeholder="Rechercher un fournisseur..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="px-6 py-3">
              {loadingF ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
              ) : filtres.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-3">
                  <p className="text-sm">Aucun fournisseur trouvé</p>
                  <Button size="sm" variant="outline" onClick={() => setShowCreer(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1.5" />Créer un fournisseur
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtres.map(f => (
                    <button key={f.id} type="button" onClick={() => toggle(f.id)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                        selectedIds.has(f.id) ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                      )}>
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0",
                        selectedIds.has(f.id) ? "border-primary bg-primary" : "border-muted-foreground"
                      )}>
                        {selectedIds.has(f.id) && <CheckCheck className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{f.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {[f.telephone ?? f.telephoneContact , f.ville].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      {!f.telephone && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                          Sans tél.
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
              </div>
            </ScrollArea>

            <div className="px-6 py-4 border-t bg-muted/20 space-y-4 shrink-0">
              <div className="flex items-center gap-3">
                <Label className="shrink-0 text-sm">Durée de validité du lien :</Label>
                <Select value={String(duree)} onValueChange={v => setDuree(+v)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 heures</SelectItem>
                    <SelectItem value="48">48 heures</SelectItem>
                    <SelectItem value="72">72 heures</SelectItem>
                    <SelectItem value="168">7 jours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleEnvoyer} disabled={loading || selectedIds.size === 0}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Envoyer à {selectedIds.size} fournisseur{selectedIds.size !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// COMPARAISON VIEW
// ============================================================

export function ComparaisonView({
  devisId, onSelectionnerFournisseur, onSelectionnerLignes,
}: {
  devisId: number
  onSelectionnerFournisseur: (demandeId: number) => void
  onSelectionnerLignes: (selection: Record<number, number>) => void
}) {
  const { comparaison, loading } = useComparaisonDevis(devisId)
  const [selectionLignes, setSelectionLignes] = useState<Record<number, number>>({})

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
  if (!comparaison || comparaison.nombreFournisseursAyantRepondu === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Info className="h-10 w-10 mb-3 opacity-30" />
      <p className="text-sm">Aucune réponse reçue pour le moment</p>
    </div>
  )

  const fournisseurs = comparaison.totauxParFournisseur
  const allLignes = comparaison.lignes

  const selectLigne = (ligneId: number, demandeId: number) =>
    setSelectionLignes(prev => ({ ...prev, [ligneId]: demandeId }))

  const getRangColor = (rang: number, total: number) => {
    if (rang === 1) return "bg-green-50 text-green-700 font-semibold"
    if (rang === total) return "bg-red-50 text-red-600"
    return "bg-muted/30 text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Résumé par fournisseur */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${fournisseurs.length}, 1fr)` }}>
        {fournisseurs.map(f => (
          <Card key={f.demandeId} className={cn("relative", f.selectionne && "border-green-400 bg-green-50/50")}>
            {f.selectionne && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-600 text-xs">
                Sélectionné
              </Badge>
            )}
            <CardContent className="p-4 text-center space-y-2">
              <p className="font-semibold text-sm truncate">{f.fournisseurNom}</p>
              <div>
                <p className="text-2xl font-bold">{fCurrency(f.totalNet)}</p>
                {f.totalBrut !== f.totalNet && (
                  <p className="text-xs text-muted-foreground line-through">{fCurrency(f.totalBrut)}</p>
                )}
              </div>
              {!f.selectionne && (
                <Button size="sm" variant="outline" className="w-full text-xs"
                  onClick={() => onSelectionnerFournisseur(f.demandeId)}>
                  Sélectionner
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau comparatif */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left p-3 font-medium w-[280px]">Désignation</th>
              <th className="text-center p-3 font-medium w-16">Qté</th>
              <th className="text-center p-3 font-medium w-16">U.</th>
              {fournisseurs.map(f => (
                <th key={f.demandeId} className="text-center p-3 font-medium min-w-[140px]">
                  <div className="truncate max-w-[130px] mx-auto">{f.fournisseurNom}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allLignes.map(ligne => {
              const nbOffres = ligne.offres.length
              return (
                <tr key={ligne.ligneId} className="border-b hover:bg-muted/20">
                  <td className="p-3">
                    <p className="font-medium">{ligne.designation}</p>
                    {(ligne.typeElement || (ligne.dimensionL && ligne.dimensionH)) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ligne.typeElement && <span>{ligne.typeElement} </span>}
                        {ligne.dimensionL && ligne.dimensionH &&
                          <span>{ligne.dimensionL}×{ligne.dimensionH}m</span>}
                      </p>
                    )}
                  </td>
                  <td className="p-3 text-center text-muted-foreground">{ligne.quantite}</td>
                  <td className="p-3 text-center text-muted-foreground">{ligne.unite ?? "—"}</td>
                  {fournisseurs.map(f => {
                    const offre = ligne.offres.find(o => o.demandeId === f.demandeId)
                    const isSelected = selectionLignes[ligne.ligneId] === f.demandeId ||
                                       offre?.ligneSelectionnee
                    return (
                      <td key={f.demandeId}
                        className={cn("p-2 text-center cursor-pointer transition-colors",
                          isSelected ? "bg-green-50 ring-1 ring-inset ring-green-400" : ""
                        )}
                        onClick={() => offre && selectLigne(ligne.ligneId, f.demandeId)}
                      >
                        {offre ? (
                          <div className={cn("rounded-md px-2 py-1.5", getRangColor(offre.rangPrix, nbOffres))}>
                            <p className="text-xs">{fCurrency(offre.prixUnitaire)}/u</p>
                            <p className="text-sm font-semibold">{fCurrency(offre.montantNet)}</p>
                            {offre.rangPrix === 1 && (
                              <p className="text-[10px] text-green-600">✓ Moins cher</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {Object.keys(selectionLignes).length > 0 && (
        <div className="flex justify-end">
          <Button onClick={() => onSelectionnerLignes(selectionLignes)}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Enregistrer la sélection ({Object.keys(selectionLignes).length} ligne{Object.keys(selectionLignes).length > 1 ? "s" : ""})
          </Button>
        </div>
      )}
    </div>
  )
}
