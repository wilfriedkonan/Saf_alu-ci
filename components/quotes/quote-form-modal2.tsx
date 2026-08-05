// components/quotes/quote-form-modal2.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Calculator, Loader2, Percent, Tag, Folder, FileText, ChevronRight, ChevronDown, Layers } from "lucide-react"
import { CreateDevisRequest, CreateSousSectionRequest, CreateLigneDevisRequest, Devis, UnitesDisponibles } from "@/types/devis"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { useClientsList } from "@/hooks/useClients"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from 'uuid'

interface QuoteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (devis: CreateDevisRequest) => Promise<void>
  devis?: Devis
  loading?: boolean
}

interface LigneFormData extends CreateLigneDevisRequest {
  tempId: string
}

interface SousSectionFormData {
  tempId: string
  code?: string
  nom: string
  description?: string
  ordre: number
  lignes: LigneFormData[]
}

interface SectionFormData {
  tempId: string
  nom: string
  ordre: number
  description?: string
  lignes: LigneFormData[]
  sousSections: SousSectionFormData[]
}

const makeLigne = (ordre = 1): LigneFormData => ({
  tempId: uuidv4(), ordre, code: "", typeElement: "", designation: "",
  description: "", longueur: undefined, hauteur: undefined,
  quantite: 1, unite: "U", prixUnitaireHT: 0,
})

const makeSection = (index: number): SectionFormData => ({
  tempId: uuidv4(), nom: `Section ${index}`, ordre: index,
  description: "", lignes: [makeLigne(1)], sousSections: [],
})

// ---- standalone LignesTable ----
interface LignesTableProps {
  lignes: LigneFormData[]
  isEdit: boolean
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: keyof Omit<LigneFormData, 'tempId'>, value: any) => void
  onOrdre: (id: string, val: number) => void
}

function LignesTable2({ lignes, isEdit, onAdd, onRemove, onUpdate, onOrdre }: LignesTableProps) {
  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n).replace(/ /g, ' ')
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold flex items-center gap-1"><FileText className="h-3.5 w-3.5" />Lignes</h4>
        <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onAdd}><Plus className="h-3 w-3 mr-1" />Ajouter</Button>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">N°</TableHead>
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Désignation *</TableHead>
              <TableHead className="w-20">Qté *</TableHead>
              <TableHead className="w-20">Unité</TableHead>
              <TableHead className="w-28">Prix U. HT</TableHead>
              <TableHead className="w-28">Total HT</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lignes.map((ligne, idx) => (
              <TableRow key={ligne.tempId}>
                <TableCell className="text-center">
                  {isEdit ? (
                    <Input type="number" min="1" max={lignes.length}
                      value={ligne.ordre ?? idx + 1}
                      onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v)) onOrdre(ligne.tempId, v) }}
                      className="h-8 w-14 text-center" />
                  ) : (
                    <span className="text-sm text-muted-foreground">{idx + 1}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Input value={ligne.code || ""} onChange={(e) => onUpdate(ligne.tempId, 'code', e.target.value)} placeholder="Code" className="text-sm h-8" />
                </TableCell>
                <TableCell>
                  <Input value={ligne.designation} onChange={(e) => onUpdate(ligne.tempId, 'designation', e.target.value)} placeholder="Désignation" className="text-sm h-8" />
                </TableCell>
                <TableCell>
                  <Input type="number" value={ligne.quantite} onChange={(e) => onUpdate(ligne.tempId, 'quantite', parseFloat(e.target.value) || 0)} min="0" step="0.01" className="text-sm h-8" />
                </TableCell>
                <TableCell>
                  <Select value={ligne.unite} onValueChange={(v) => onUpdate(ligne.tempId, 'unite', v)}>
                    <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{UnitesDisponibles.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input type="number" value={ligne.prixUnitaireHT} onChange={(e) => onUpdate(ligne.tempId, 'prixUnitaireHT', parseFloat(e.target.value) || 0)} min="0" step="100" className="text-sm h-8" />
                </TableCell>
                <TableCell className="text-sm font-medium">{fmt((ligne.quantite || 0) * (ligne.prixUnitaireHT || 0))}</TableCell>
                <TableCell>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(ligne.tempId)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
// --------------------------------

export function QuoteFormModal({ open, onOpenChange, onSubmit, devis, loading = false }: QuoteFormModalProps) {
  const { user } = useAuth()
  const isEdit = !!devis
  const [formData, setFormData] = useState({ clientId: 0, titre: "", description: "", dateValidite: "", conditions: "", notes: "", chantier: "", contact: "" })
  const [remiseValeur, setRemiseValeur] = useState(0)
  const [remisePourcentage, setRemisePourcentage] = useState(0)
  const [sections, setSections] = useState<SectionFormData[]>([makeSection(1)])
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.tempId)
  const [activeSousSectionId, setActiveSousSectionId] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([sections[0]?.tempId]))
  const { clients, loading: clientLoading, error: clientError, refreshCliens } = useClientsList()

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n).replace(/ /g, ' ')

  const normalizeLines = (raw: any[]): LigneFormData[] =>
    raw.map((l, idx) => ({
      tempId: uuidv4(), ordre: l.ordre ?? (idx + 1), code: l.code || "",
      typeElement: l.typeElement || "", designation: l.designation || "",
      description: l.description || "", longueur: l.longueur, hauteur: l.hauteur,
      quantite: l.quantite || 1, unite: l.unite || "U", prixUnitaireHT: l.prixUnitaireHT || 0,
    }))

  const normalizeSections = (raw: any[]): SectionFormData[] =>
    raw.map(s => ({
      tempId: uuidv4(), nom: s.nom, ordre: s.ordre, description: s.description || "",
      lignes: normalizeLines(s.lignes || []),
      sousSections: (s.sousSections || []).map((ss: any, i: number) => ({
        tempId: uuidv4(), code: ss.code || "", nom: ss.nom || `Sous-section ${i + 1}`,
        description: ss.description || "", ordre: ss.ordre ?? (i + 1),
        lignes: normalizeLines(ss.lignes || []),
      })),
    }))

  useEffect(() => {
    if (!open) return
    if (isEdit && devis) {
      setFormData({
        clientId: devis.clientId, titre: devis.titre,
        description: devis.description || "", dateValidite: devis.dateValidite ? devis.dateValidite.split('T')[0] : "",
        conditions: devis.conditions || "", notes: devis.notes || "",
        chantier: devis.chantier || "", contact: devis.contact || "",
      })
      setRemiseValeur(devis.remiseValeur || 0)
      setRemisePourcentage(devis.remisePourcentage || 0)
      const loaded = devis.sections && devis.sections.length > 0 ? normalizeSections(devis.sections) : [makeSection(1)]
      setSections(loaded)
      setActiveSectionId(loaded[0].tempId)
      setActiveSousSectionId(null)
      setExpandedSections(new Set([loaded[0].tempId]))
    } else {
      const s = makeSection(1)
      setSections([s])
      setActiveSectionId(s.tempId)
      setActiveSousSectionId(null)
      setExpandedSections(new Set([s.tempId]))
      setFormData({ clientId: 0, titre: "", description: "", dateValidite: "", conditions: "", notes: "", chantier: "", contact: "" })
      setRemiseValeur(0); setRemisePourcentage(0)
    }
  }, [open, isEdit, devis])

  const calculateTotals = () => {
    let brut = 0
    sections.forEach(s => {
      s.lignes.forEach(l => { brut += (l.quantite || 0) * (l.prixUnitaireHT || 0) })
      s.sousSections.forEach(ss => ss.lignes.forEach(l => { brut += (l.quantite || 0) * (l.prixUnitaireHT || 0) }))
    })
    const net = Math.max(0, brut * (1 - remisePourcentage / 100) - remiseValeur)
    const tva = net * 0.18
    return { brut, remiseTotal: brut - net, net, tva, ttc: net + tva }
  }

  // ---- sections ----
  const addSection = () => {
    const s = makeSection(sections.length + 1)
    setSections(p => [...p, s])
    setActiveSectionId(s.tempId); setActiveSousSectionId(null)
    setExpandedSections(p => new Set([...p, s.tempId]))
  }
  const removeSection = (id: string) => {
    if (sections.length <= 1) return
    const f = sections.filter(s => s.tempId !== id); setSections(f)
    if (activeSectionId === id) { setActiveSectionId(f[0].tempId); setActiveSousSectionId(null) }
  }
  const updateSection = (id: string, field: 'nom' | 'ordre' | 'description', value: any) =>
    setSections(p => p.map(s => s.tempId === id ? { ...s, [field]: value } : s))
  const toggleExpand = (id: string) =>
    setExpandedSections(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  // ---- sous-sections ----
  const addSousSection = (sectionId: string) => {
    const parent = sections.find(s => s.tempId === sectionId)
    const ss: SousSectionFormData = { tempId: uuidv4(), code: "", nom: "", description: "", ordre: (parent?.sousSections.length ?? 0) + 1, lignes: [makeLigne(1)] }
    setSections(p => p.map(s => s.tempId === sectionId ? { ...s, sousSections: [...s.sousSections, ss] } : s))
    setActiveSectionId(sectionId); setActiveSousSectionId(ss.tempId)
    setExpandedSections(p => new Set([...p, sectionId]))
  }
  const removeSousSection = (sectionId: string, ssId: string) => {
    setSections(p => p.map(s => s.tempId !== sectionId ? s : { ...s, sousSections: s.sousSections.filter(ss => ss.tempId !== ssId) }))
    if (activeSousSectionId === ssId) setActiveSousSectionId(null)
  }
  const updateSousSection = (sectionId: string, ssId: string, field: 'code' | 'nom' | 'description' | 'ordre', value: any) =>
    setSections(p => p.map(s => s.tempId !== sectionId ? s : { ...s, sousSections: s.sousSections.map(ss => ss.tempId === ssId ? { ...ss, [field]: value } : ss) }))

  // ---- lines (section) ----
  const addLigne = (sId: string) =>
    setSections(p => p.map(s => s.tempId !== sId ? s : { ...s, lignes: [...s.lignes, makeLigne(s.lignes.length + 1)] }))
  const removeLigne = (sId: string, lId: string) =>
    setSections(p => p.map(s => s.tempId !== sId ? s : { ...s, lignes: s.lignes.filter(l => l.tempId !== lId) }))
  const updateLigne = (sId: string, lId: string, field: keyof Omit<LigneFormData, 'tempId'>, value: any) =>
    setSections(p => p.map(s => s.tempId !== sId ? s : { ...s, lignes: s.lignes.map(l => l.tempId === lId ? { ...l, [field]: value } : l) }))
  const handleOrdre = (sId: string, lId: string, newOrdre: number) =>
    setSections(p => p.map(s => {
      if (s.tempId !== sId) return s
      const arr = [...s.lignes]; const from = arr.findIndex(l => l.tempId === lId); if (from === -1) return s
      const to = Math.max(0, Math.min(newOrdre - 1, arr.length - 1))
      const [m] = arr.splice(from, 1); arr.splice(to, 0, m)
      return { ...s, lignes: arr.map((l, i) => ({ ...l, ordre: i + 1 })) }
    }))

  // ---- lines (sous-section) ----
  const updSS = (sId: string, ssId: string, fn: (ss: SousSectionFormData) => SousSectionFormData) =>
    setSections(p => p.map(s => s.tempId !== sId ? s : { ...s, sousSections: s.sousSections.map(ss => ss.tempId === ssId ? fn(ss) : ss) }))
  const addLigneInSS = (sId: string, ssId: string) =>
    updSS(sId, ssId, ss => ({ ...ss, lignes: [...ss.lignes, makeLigne(ss.lignes.length + 1)] }))
  const removeLigneInSS = (sId: string, ssId: string, lId: string) =>
    updSS(sId, ssId, ss => ({ ...ss, lignes: ss.lignes.filter(l => l.tempId !== lId) }))
  const updateLigneInSS = (sId: string, ssId: string, lId: string, field: keyof Omit<LigneFormData, 'tempId'>, value: any) =>
    updSS(sId, ssId, ss => ({ ...ss, lignes: ss.lignes.map(l => l.tempId === lId ? { ...l, [field]: value } : l) }))
  const handleOrdreInSS = (sId: string, ssId: string, lId: string, newOrdre: number) =>
    updSS(sId, ssId, ss => {
      const arr = [...ss.lignes]; const from = arr.findIndex(l => l.tempId === lId); if (from === -1) return ss
      const to = Math.max(0, Math.min(newOrdre - 1, arr.length - 1))
      const [m] = arr.splice(from, 1); arr.splice(to, 0, m)
      return { ...ss, lignes: arr.map((l, i) => ({ ...l, ordre: i + 1 })) }
    })

  const serializeLigne = (l: LigneFormData, idx: number) => ({
    ordre: l.ordre ?? (idx + 1), code: l.code?.trim() || undefined,
    typeElement: undefined, designation: l.designation.trim(),
    description: l.description?.trim() || undefined,
    longueur: undefined, hauteur: undefined,
    quantite: l.quantite || 1, unite: l.unite, prixUnitaireHT: l.prixUnitaireHT || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast({ title: "Erreur", description: "Vous devez être connecté", variant: "destructive" }); return }
    const errors: string[] = []
    if (!formData.titre.trim()) errors.push('Titre requis')
    if (!formData.clientId) errors.push('Client requis')
    if (errors.length > 0) { toast({ title: "Erreurs", description: errors.join(', '), variant: "destructive" }); return }

    const data: CreateDevisRequest = {
      clientId: formData.clientId, titre: formData.titre.trim(),
      description: formData.description.trim() || undefined,
      dateValidite: formData.dateValidite || undefined,
      conditions: formData.conditions.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      chantier: formData.chantier.trim() || undefined,
      contact: formData.contact.trim() || undefined,
      remiseValeur: remiseValeur > 0 ? remiseValeur : undefined,
      remisePourcentage: remisePourcentage > 0 ? remisePourcentage : undefined,
      TypeDevis: 'classique',
      sections: sections.map(s => ({
        nom: s.nom.trim(), ordre: s.ordre, description: s.description?.trim() || undefined,
        sousSections: s.sousSections.map((ss, si) => ({
          code: ss.code?.trim() || undefined, nom: ss.nom.trim(),
          description: ss.description?.trim() || undefined, ordre: ss.ordre ?? (si + 1),
          lignes: ss.lignes.map(serializeLigne),
        } satisfies CreateSousSectionRequest)),
        lignes: s.lignes.map(serializeLigne),
      })),
    }
    try { await onSubmit(data) } catch (_) { /* handled by parent */ }
  }

  const { brut, remiseTotal, net, tva, ttc } = calculateTotals()
  const hasRemise = remiseValeur > 0 || remisePourcentage > 0
  const activeSection = sections.find(s => s.tempId === activeSectionId)
  const activeSousSection = activeSousSectionId ? activeSection?.sousSections.find(ss => ss.tempId === activeSousSectionId) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] lg:max-w-[96vw] xl:max-w-[94vw] h-[98vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            {isEdit ? `Modifier le devis ${devis?.numero}` : "Nouveau devis classique"}
            <span className="text-xs font-normal text-muted-foreground">(Format simplifié)</span>
          </DialogTitle>
          <DialogDescription>{isEdit ? "Modifiez les informations du devis" : "Créez un devis avec sections et sous-sections"}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="py-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="lignes">Sections & lignes</TabsTrigger>
                <TabsTrigger value="remise">💰 Remises</TabsTrigger>
                <TabsTrigger value="recap">Récapitulatif</TabsTrigger>
              </TabsList>

              {/* TAB GÉNÉRAL */}
              <TabsContent value="general" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Informations générales</CardTitle></CardHeader>
                  <CardContent className="pt-0 grid gap-3 grid-cols-1 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Client *</Label>
                        {clientError && <Button type="button" variant="ghost" size="sm" onClick={refreshCliens} className="text-xs h-6 px-2">🔄 Rafraîchir</Button>}
                      </div>
                      <Select value={formData.clientId > 0 ? formData.clientId.toString() : ""} onValueChange={(v) => setFormData(p => ({ ...p, clientId: parseInt(v) || 0 }))} disabled={clientLoading || (isEdit && !(user && ["super_admin", "admin", "comptable"].includes(user.Role?.Nom ?? "")))}>
                        <SelectTrigger className="text-sm h-9">
                          <SelectValue placeholder={clientLoading ? "Chargement..." : clients && clients.length === 0 ? "Aucun client" : "Sélectionner"} />
                        </SelectTrigger>
                        <SelectContent>
                          {clientLoading ? <SelectItem value="" disabled><Loader2 className="h-4 w-4 animate-spin" /></SelectItem>
                            : clients && clients.length > 0 ? clients.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>)
                              : <SelectItem value="" disabled>Aucun client</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Titre *</Label>
                      <Input value={formData.titre} onChange={(e) => setFormData(p => ({ ...p, titre: e.target.value }))} className="text-sm h-9" placeholder="Titre du devis" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Valide jusqu'au</Label>
                      <Input type="date" value={formData.dateValidite} onChange={(e) => setFormData(p => ({ ...p, dateValidite: e.target.value }))} className="text-sm h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium">Chantier</Label>
                      <Input value={formData.chantier} onChange={(e) => setFormData(p => ({ ...p, chantier: e.target.value }))} className="text-sm h-9" placeholder="Lieu du chantier" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-sm font-medium">Contact projet</Label>
                      <Input value={formData.contact} onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))} className="text-sm h-9" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Description générale..." rows={3} className="text-sm resize-none" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB SECTIONS & LIGNES */}
              <TabsContent value="lignes" className="mt-4">
                <div className="flex gap-4 h-[60vh]">
                  {/* Sidebar */}
                  <div className="w-56 border-r pr-3 flex flex-col shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm flex items-center gap-1"><Folder className="h-3.5 w-3.5" />Sections</h3>
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={addSection}><Plus className="h-3.5 w-3.5" /></Button>
                    </div>
                    <div className="space-y-1 flex-1 overflow-y-auto">
                      {sections.map(section => {
                        const expanded = expandedSections.has(section.tempId)
                        const sActive = activeSectionId === section.tempId && !activeSousSectionId
                        return (
                          <div key={section.tempId}>
                            <div className={`p-2 rounded-lg border cursor-pointer transition-colors ${sActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-transparent'}`}>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1 flex-1 min-w-0" onClick={() => { setActiveSectionId(section.tempId); setActiveSousSectionId(null) }}>
                                  <button type="button" className="p-0.5 shrink-0" onClick={(e) => { e.stopPropagation(); toggleExpand(section.tempId) }}>
                                    {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                  </button>
                                  <span className="font-medium text-xs truncate">{section.nom}</span>
                                </div>
                                <div className="flex shrink-0">
                                  <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0" title="Ss." onClick={(e) => { e.stopPropagation(); addSousSection(section.tempId) }}><Layers className="h-3 w-3" /></Button>
                                  {sections.length > 1 && <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={(e) => { e.stopPropagation(); removeSection(section.tempId) }}><Trash2 className="h-3 w-3" /></Button>}
                                </div>
                              </div>
                              <div className="flex gap-1 mt-1 ml-4">
                                <Badge variant="secondary" className="text-xs">{section.lignes.length}L</Badge>
                                {section.sousSections.length > 0 && <Badge variant="outline" className="text-xs">{section.sousSections.length}ss</Badge>}
                              </div>
                            </div>
                            {expanded && section.sousSections.map(ss => {
                              const ssActive = activeSectionId === section.tempId && activeSousSectionId === ss.tempId
                              return (
                                <div key={ss.tempId}
                                  className={`ml-4 mt-0.5 p-1.5 rounded-lg border cursor-pointer transition-colors ${ssActive ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700' : 'hover:bg-muted border-transparent'}`}
                                  onClick={() => { setActiveSectionId(section.tempId); setActiveSousSectionId(ss.tempId) }}>
                                  <div className="flex items-center justify-between gap-1">
                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                      <Layers className="h-3 w-3 shrink-0 text-blue-500" />
                                      <span className="text-xs truncate">{ss.nom || <span className="italic text-muted-foreground">Sans nom</span>}</span>
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0" onClick={(e) => { e.stopPropagation(); removeSousSection(section.tempId, ss.tempId) }}><Trash2 className="h-3 w-3" /></Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                    {activeSousSection && activeSection ? (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <button type="button" className="hover:text-foreground underline" onClick={() => setActiveSousSectionId(null)}>{activeSection.nom}</button>
                          <ChevronRight className="h-3 w-3" />
                          <span className="font-medium text-foreground">{activeSousSection.nom || "Sous-section"}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Code</Label>
                            <Input value={activeSousSection.code || ""} onChange={(e) => updateSousSection(activeSection.tempId, activeSousSection.tempId, 'code', e.target.value)} placeholder="Code" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Nom *</Label>
                            <Input value={activeSousSection.nom} onChange={(e) => updateSousSection(activeSection.tempId, activeSousSection.tempId, 'nom', e.target.value)} placeholder="Nom" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Ordre</Label>
                            <Input type="number" min="1" value={activeSousSection.ordre} onChange={(e) => updateSousSection(activeSection.tempId, activeSousSection.tempId, 'ordre', parseInt(e.target.value) || 1)} className="h-8 text-sm" />
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <LignesTable2 lignes={activeSousSection.lignes} isEdit={isEdit}
                            onAdd={() => addLigneInSS(activeSection.tempId, activeSousSection.tempId)}
                            onRemove={(lId) => removeLigneInSS(activeSection.tempId, activeSousSection.tempId, lId)}
                            onUpdate={(lId, f, v) => updateLigneInSS(activeSection.tempId, activeSousSection.tempId, lId, f, v)}
                            onOrdre={(lId, o) => handleOrdreInSS(activeSection.tempId, activeSousSection.tempId, lId, o)} />
                        </div>
                      </div>
                    ) : activeSection ? (
                      <div className="flex flex-col h-full">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Nom *</Label>
                            <Input value={activeSection.nom} onChange={(e) => updateSection(activeSection.tempId, 'nom', e.target.value)} className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Ordre</Label>
                            <Input type="number" min="1" value={activeSection.ordre} onChange={(e) => updateSection(activeSection.tempId, 'ordre', parseInt(e.target.value) || 1)} className="h-8 text-sm" />
                          </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <LignesTable2 lignes={activeSection.lignes} isEdit={isEdit}
                            onAdd={() => addLigne(activeSection.tempId)}
                            onRemove={(lId) => removeLigne(activeSection.tempId, lId)}
                            onUpdate={(lId, f, v) => updateLigne(activeSection.tempId, lId, f, v)}
                            onOrdre={(lId, o) => handleOrdre(activeSection.tempId, lId, o)} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </TabsContent>

              {/* TAB REMISES */}
              <TabsContent value="remise" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base sm:text-lg">Remises commerciales</CardTitle></CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Montant HT brut</span>
                      <span className="text-lg font-bold">{fmt(brut)} FCFA</span>
                    </div>
                    <div className="space-y-2">
                      <Label>Remise en pourcentage (%)</Label>
                      <Input type="number" min="0" max="100" step="0.01" value={remisePourcentage} onChange={(e) => setRemisePourcentage(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Remise forfaitaire (FCFA)</Label>
                      <Input type="number" min="0" step="1000" value={remiseValeur} onChange={(e) => setRemiseValeur(parseFloat(e.target.value) || 0)} />
                    </div>
                    {!hasRemise && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Remises rapides:</Label>
                        <div className="flex gap-2">
                          {[5, 10, 15, 20].map(p => (
                            <Button key={p} type="button" variant="outline" size="sm" onClick={() => setRemisePourcentage(p)} className="flex-1">{p}%</Button>
                          ))}
                        </div>
                      </div>
                    )}
                    {hasRemise && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm"><span>Montant HT brut:</span><span>{fmt(brut)} FCFA</span></div>
                        {remisePourcentage > 0 && <div className="flex justify-between text-sm text-green-700"><span className="flex items-center gap-1"><Percent className="h-3 w-3" />Remise {remisePourcentage}%:</span><span>-{fmt(brut * remisePourcentage / 100)} FCFA</span></div>}
                        {remiseValeur > 0 && <div className="flex justify-between text-sm text-green-700"><span className="flex items-center gap-1"><Tag className="h-3 w-3" />Remise forfaitaire:</span><span>-{fmt(remiseValeur)} FCFA</span></div>}
                        <div className="flex justify-between text-sm font-semibold text-green-700 border-t pt-2"><span>Remise totale:</span><span>-{fmt(remiseTotal)} FCFA</span></div>
                        <div className="flex justify-between font-bold border-t pt-2"><span>Montant HT net:</span><span className="text-lg">{fmt(net)} FCFA</span></div>
                        <Button type="button" variant="outline" size="sm" onClick={() => { setRemiseValeur(0); setRemisePourcentage(0) }} className="w-full mt-2">Supprimer les remises</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB RÉCAPITULATIF */}
              <TabsContent value="recap" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3"><CardTitle className="text-base">Résumé</CardTitle></CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Client:</div>
                      <div className="font-medium">{clients?.find(c => c.id === formData.clientId)?.nom || "Non sélectionné"}</div>
                      <div className="text-muted-foreground">Titre:</div>
                      <div className="font-medium">{formData.titre || "Non renseigné"}</div>
                    </div>
                    {sections.map(s => {
                      const sTotal = s.lignes.reduce((t, l) => t + (l.quantite || 0) * (l.prixUnitaireHT || 0), 0)
                          + s.sousSections.reduce((t, ss) => t + ss.lignes.reduce((t2, l) => t2 + (l.quantite || 0) * (l.prixUnitaireHT || 0), 0), 0)
                      return (
                        <div key={s.tempId} className="border rounded p-3 text-sm">
                          <div className="flex justify-between font-semibold mb-2"><span>{s.nom}</span><span>{fmt(sTotal)} FCFA</span></div>
                          {s.sousSections.map(ss => (
                            <div key={ss.tempId} className="ml-4 border-l-2 border-blue-200 pl-2 mb-1">
                              <p className="text-xs text-blue-700 font-medium">{ss.nom}</p>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-4 space-y-2">
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      {hasRemise && <div className="flex justify-between text-sm text-muted-foreground"><span>HT brut:</span><span className="line-through">{fmt(brut)} FCFA</span></div>}
                      {remisePourcentage > 0 && <div className="flex justify-between text-sm text-green-600"><span>Remise {remisePourcentage}%:</span><span>-{fmt(brut * remisePourcentage / 100)} FCFA</span></div>}
                      {remiseValeur > 0 && <div className="flex justify-between text-sm text-green-600"><span>Remise forfaitaire:</span><span>-{fmt(remiseValeur)} FCFA</span></div>}
                      {hasRemise && <div className="flex justify-between text-sm font-semibold text-green-600 border-t pt-2"><span>Remise totale:</span><span>-{fmt(remiseTotal)} FCFA</span></div>}
                      <div className="flex justify-between text-sm"><span>{hasRemise ? "HT net:" : "Sous-total HT:"}</span><span className="font-medium">{fmt(net)} FCFA</span></div>
                      <div className="flex justify-between text-sm"><span>TVA (18%):</span><span className="font-medium">{fmt(tva)} FCFA</span></div>
                      <div className="border-t pt-2"><div className="flex justify-between text-lg font-bold text-primary"><span>Total TTC:</span><span>{fmt(ttc)} FCFA</span></div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-1.5">
                      <Label>Conditions générales</Label>
                      <Textarea value={formData.conditions} onChange={(e) => setFormData(p => ({ ...p, conditions: e.target.value }))} placeholder="Ex: Acompte 30%..." rows={3} className="text-sm resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notes internes</Label>
                      <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Notes privées..." rows={2} className="text-sm resize-none" />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t bg-gray-50/50 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Total: {fmt(ttc)} FCFA
              {hasRemise && <span className="text-green-600">(Économie: {fmt(remiseTotal)} FCFA)</span>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Annuler</Button>
              <Button type="submit" onClick={handleSubmit} disabled={loading || clientLoading || !formData.titre.trim() || formData.clientId === 0}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEdit ? "Modification..." : "Création..."}</> : <>{isEdit ? "Modifier" : "Créer le devis"}{ttc > 0 && <span className="ml-2 text-xs">({fmt(ttc)} FCFA)</span>}</>}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
