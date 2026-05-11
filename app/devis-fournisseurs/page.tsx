"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import {
  Plus, Search, FileText, Clock, CheckCircle2, XCircle, Loader2,
  ChevronRight, BarChart3, Send, MoreVertical, Trash2, Users,
  Phone, MapPin, Building2, UserCircle, Edit,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useDevisFournisseurList, useFournisseurs } from "@/hooks/useDevisFournisseur"
import { DevisFormModal } from "@/components/devis-fournisseur/devis-form-modal"
import { DevisFournisseurService, FournisseurService } from "@/services/devisFournisseurService"
import type { StatutDevis, Fournisseur, CreateFournisseurRequest, UpdateFournisseurRequest } from "@/types/devis-fournisseur"
import { statutDevisColors, statutDevisLabels } from "@/types/devis-fournisseur"
import { cn } from "@/lib/utils"

// ── Icônes statut ─────────────────────────────────────────────

const statutIcons: Record<StatutDevis, React.ReactNode> = {
  Brouillon:   <FileText className="h-3.5 w-3.5" />,
  EnCours:     <Send className="h-3.5 w-3.5" />,
  Cloture:     <XCircle className="h-3.5 w-3.5" />,
  Selectionne: <CheckCircle2 className="h-3.5 w-3.5" />,
}

// ── Modal Fournisseur (création / édition) ────────────────────

const emptyFournisseurForm = (): CreateFournisseurRequest => ({
  nom: "", raisonSociale: "", email: "", telephone: "",
  adresse: "", ville: "", nomContact: "", telephoneContact: "", emailContact: "", ncc: "",
})

function FournisseurModal({
  open, fournisseur, onOpenChange, onSuccess,
}: {
  open: boolean
  fournisseur: Fournisseur | null
  onOpenChange: (v: boolean) => void
  onSuccess: () => void
}) {
  const isEdit = fournisseur !== null
  const [form, setForm] = useState<CreateFournisseurRequest>(
    fournisseur
      ? {
          nom: fournisseur.nom, raisonSociale: fournisseur.raisonSociale ?? "",
          email: fournisseur.email ?? "", telephone: fournisseur.telephone ?? "",
          adresse: fournisseur.adresse ?? "", ville: fournisseur.ville ?? "",
          nomContact: fournisseur.nomContact ?? "", telephoneContact: fournisseur.telephoneContact ?? "",
          emailContact: fournisseur.emailContact ?? "", ncc: fournisseur.ncc ?? "",
        }
      : emptyFournisseurForm()
  )
  const [loading, setLoading] = useState(false)

  const set = (k: keyof CreateFournisseurRequest, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  const handleSubmit = async () => {
    if (!form.nom.trim()) {
      toast({ title: "Le nom est obligatoire", variant: "destructive" }); return
    }
    setLoading(true)
    try {
      if (isEdit) {
        await FournisseurService.update(fournisseur!.id, form as UpdateFournisseurRequest)
        toast({ title: "Fournisseur mis à jour" })
      } else {
        await FournisseurService.create(form)
        toast({ title: "Fournisseur créé" })
      }
      onSuccess()
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!loading) onOpenChange(v) }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le fournisseur" : "Nouveau fournisseur"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Infos principales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Nom <span className="text-destructive">*</span></Label>
              <Input value={form.nom} onChange={e => set("nom", e.target.value)} placeholder="Ex : SAF Aluminium" />
            </div>
            <div className="space-y-1.5">
              <Label>Raison sociale</Label>
              <Input value={form.raisonSociale} onChange={e => set("raisonSociale", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>NCC / RCCM</Label>
              <Input value={form.ncc} onChange={e => set("ncc", e.target.value)} />
            </div>
          </div>

          {/* Coordonnées */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Téléphone</Label>
              <Input value={form.telephone} onChange={e => set("telephone", e.target.value)} placeholder="+225 XX XX XX XX XX" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Ville</Label>
              <Input value={form.ville} onChange={e => set("ville", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Adresse</Label>
              <Input value={form.adresse} onChange={e => set("adresse", e.target.value)} />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t">
            <p className="col-span-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Contact principal
            </p>
            <div className="space-y-1.5">
              <Label>Nom du contact</Label>
              <Input value={form.nomContact} onChange={e => set("nomContact", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Tél. contact</Label>
              <Input value={form.telephoneContact} onChange={e => set("telephoneContact", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Email contact</Label>
              <Input type="email" value={form.emailContact} onChange={e => set("emailContact", e.target.value)} />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Enregistrer" : "Créer le fournisseur"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Page principale ───────────────────────────────────────────

export default function DevisFournisseurPage() {
  const router = useRouter()

  // — Onglet Devis —
  const [filtreStatut, setFiltreStatut] = useState<string>("all")
  const [filtreType, setFiltreType]     = useState<string>("all")
  const [search, setSearch]             = useState("")
  const [createOpen, setCreateOpen]     = useState(false)
  const [deletingId, setDeletingId]     = useState<number | null>(null)

  const { devis, resume, loading: loadingDevis, refresh: refreshDevis } = useDevisFournisseurList({
    statut:    filtreStatut !== "all" ? filtreStatut : undefined,
    typeDevis: filtreType !== "all" ? filtreType : undefined,
  })

  const devisFiltres = devis.filter(d =>
    !search ||
    d.reference.toLowerCase().includes(search.toLowerCase()) ||
    d.titre.toLowerCase().includes(search.toLowerCase())
  )

  const handleDeleteDevis = async (id: number, titre: string) => {
    if (!confirm(`Supprimer le devis "${titre}" ? Cette action est irréversible.`)) return
    setDeletingId(id)
    try {
      await DevisFournisseurService.delete(id)
      toast({ title: "Devis supprimé" })
      refreshDevis()
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally { setDeletingId(null) }
  }

  // — Onglet Fournisseurs —
  const [searchF, setSearchF]       = useState("")
  const [fournisseurModal, setFournisseurModal] = useState<{ open: boolean; target: Fournisseur | null }>({
    open: false, target: null,
  })
  const [deletingFId, setDeletingFId] = useState<number | null>(null)

  const { fournisseurs, loading: loadingF, refresh: refreshF } = useFournisseurs(searchF || undefined)

  const handleDeleteFournisseur = async (f: Fournisseur) => {
    if (!confirm(`Supprimer le fournisseur "${f.nom}" ? Cette action est irréversible.`)) return
    setDeletingFId(f.id)
    try {
      await FournisseurService.delete(f.id)
      toast({ title: "Fournisseur supprimé" })
      refreshF()
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" })
    } finally { setDeletingFId(null) }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Devis Fournisseurs</h1>
          <p className="text-muted-foreground mt-1">Gérez vos appels d'offres et vos fournisseurs</p>
        </div>

        <Tabs defaultValue="devis">
          <TabsList>
            <TabsTrigger value="devis" className="gap-2">
              <FileText className="h-4 w-4" />Devis
            </TabsTrigger>
            <TabsTrigger value="fournisseurs" className="gap-2">
              <Users className="h-4 w-4" />Fournisseurs
            </TabsTrigger>
          </TabsList>

          {/* ══════════════════════════════════════════
              ONGLET DEVIS
          ══════════════════════════════════════════ */}
          <TabsContent value="devis" className="mt-4 space-y-5">

            {/* Actions & filtres */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Référence, titre..."
                    className="pl-9"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <Select value={filtreType} onValueChange={setFiltreType}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Classique">Classique</SelectItem>
                    <SelectItem value="Technique">Technique</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtreStatut} onValueChange={setFiltreStatut}>
                  <SelectTrigger className="w-[150px]"><SelectValue placeholder="Statut" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="Brouillon">Brouillon</SelectItem>
                    <SelectItem value="EnCours">En cours</SelectItem>
                    <SelectItem value="Cloture">Clôturé</SelectItem>
                    <SelectItem value="Selectionne">Sélectionné</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => setCreateOpen(true)} className="shrink-0">
                <Plus className="mr-2 h-4 w-4" />Nouveau devis
              </Button>
            </div>

            {/* Cartes résumé */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total",        value: resume?.Total        ?? 0, icon: <FileText className="h-4 w-4" />,     color: "text-muted-foreground" },
                { label: "En cours",     value: resume?.EnCours      ?? 0, icon: <Send className="h-4 w-4" />,         color: "text-blue-600" },
                { label: "Sélectionnés", value: resume?.Selectionnes ?? 0, icon: <CheckCircle2 className="h-4 w-4" />, color: "text-green-600" },
                { label: "Clôturés",     value: resume?.Clotures     ?? 0, icon: <XCircle className="h-4 w-4" />,      color: "text-red-600" },
              ].map(card => (
                <Card key={card.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                    <span className={card.color}>{card.icon}</span>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Liste */}
            {loadingDevis ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : devisFiltres.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FileText className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-1">Aucun devis trouvé</p>
                  <p className="text-sm">Créez votre premier devis fournisseur</p>
                  <Button className="mt-4" onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />Nouveau devis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {devisFiltres.map(d => {
                  const nbReponses = d.demandes?.filter(dm => dm.statut === "Repondu").length ?? 0
                  const nbDemandes = d.demandes?.length ?? 0
                  const dateLimite = new Date(d.dateLimiteReponse)
                  const estExpire  = dateLimite < new Date() && d.statut === "EnCours"
                  const isDeleting = deletingId === d.id

                  return (
                    <Card
                      key={d.id}
                      className={cn("hover:shadow-md transition-shadow", isDeleting && "opacity-50 pointer-events-none")}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          {/* Infos — cliquable */}
                          <div
                            className="flex-1 min-w-0 space-y-2 cursor-pointer"
                            onClick={() => router.push(`/devis-fournisseurs/${d.id}`)}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs text-muted-foreground">{d.reference}</span>
                              <Badge variant="outline" className="text-xs">{d.typeDevis}</Badge>
                              <Badge className={cn("text-xs flex items-center gap-1", statutDevisColors[d.statut])}>
                                {statutIcons[d.statut]}
                                {statutDevisLabels[d.statut]}
                              </Badge>
                              {estExpire && (
                                <Badge className="text-xs bg-orange-100 text-orange-700">
                                  <Clock className="h-3 w-3 mr-1" />Délai dépassé
                                </Badge>
                              )}
                            </div>

                            <p className="font-semibold text-base truncate">{d.titre}</p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Délai : {format(dateLimite, "dd MMM yyyy", { locale: fr })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Send className="h-3.5 w-3.5" />
                                {nbDemandes} fournisseur{nbDemandes !== 1 ? "s" : ""} sollicité{nbDemandes !== 1 ? "s" : ""}
                              </span>
                              {nbDemandes > 0 && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {nbReponses}/{nbDemandes} réponse{nbReponses !== 1 ? "s" : ""}
                                </span>
                              )}
                              {d.lignes?.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <BarChart3 className="h-3.5 w-3.5" />
                                  {d.lignes.length} ligne{d.lignes.length !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <ChevronRight
                              className="h-5 w-5 text-muted-foreground cursor-pointer"
                              onClick={() => router.push(`/devis-fournisseurs/${d.id}`)}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  {isDeleting
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <MoreVertical className="h-4 w-4" />
                                  }
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => router.push(`/devis-fournisseurs/${d.id}`)}>
                                  <FileText className="mr-2 h-4 w-4" />Voir le détail
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDeleteDevis(d.id, d.titre)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* ══════════════════════════════════════════
              ONGLET FOURNISSEURS
          ══════════════════════════════════════════ */}
          <TabsContent value="fournisseurs" className="mt-4 space-y-5">

            {/* Actions & recherche */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, téléphone..."
                  className="pl-9"
                  value={searchF}
                  onChange={e => setSearchF(e.target.value)}
                />
              </div>
              <Button onClick={() => setFournisseurModal({ open: true, target: null })} className="shrink-0">
                <Plus className="mr-2 h-4 w-4" />Nouveau fournisseur
              </Button>
            </div>

            {/* Liste fournisseurs */}
            {loadingF ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : fournisseurs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Users className="h-12 w-12 mb-4 opacity-20" />
                  <p className="text-lg font-medium mb-1">Aucun fournisseur</p>
                  <p className="text-sm">Ajoutez votre premier fournisseur pour commencer</p>
                  <Button className="mt-4" onClick={() => setFournisseurModal({ open: true, target: null })}>
                    <Plus className="mr-2 h-4 w-4" />Nouveau fournisseur
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fournisseurs.map(f => {
                  const isDeleting = deletingFId === f.id
                  return (
                    <Card
                      key={f.id}
                      className={cn("transition-shadow hover:shadow-md", isDeleting && "opacity-50 pointer-events-none")}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Building2 className="h-4 w-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">{f.nom}</p>
                                {f.raisonSociale && (
                                  <p className="text-xs text-muted-foreground truncate">{f.raisonSociale}</p>
                                )}
                              </div>
                            </div>

                            <div className="space-y-1 pl-10">
                              {f.telephone && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <Phone className="h-3 w-3 shrink-0" />{f.telephone}
                                </p>
                              )}
                              {f.ville && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <MapPin className="h-3 w-3 shrink-0" />{f.ville}
                                </p>
                              )}
                              {f.nomContact && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  <UserCircle className="h-3 w-3 shrink-0" />{f.nomContact}
                                  {f.telephoneContact && ` · ${f.telephoneContact}`}
                                </p>
                              )}
                              {!f.actif && (
                                <Badge variant="outline" className="text-xs text-muted-foreground mt-1">Inactif</Badge>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                {isDeleting
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <MoreVertical className="h-4 w-4" />
                                }
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setFournisseurModal({ open: true, target: f })}>
                                <Edit className="mr-2 h-4 w-4" />Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDeleteFournisseur(f)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <DevisFormModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={(id) => { refreshDevis(); router.push(`/devis-fournisseurs/${id}`) }}
      />

      <FournisseurModal
        open={fournisseurModal.open}
        fournisseur={fournisseurModal.target}
        onOpenChange={v => setFournisseurModal(prev => ({ ...prev, open: v }))}
        onSuccess={refreshF}
      />
    </DashboardLayout>
  )
}
