// components/devis/quote-form-modal-v2.tsx
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Calculator, Loader2, Folder, FileText, ChevronRight, ChevronDown, Layers } from "lucide-react"
import {
  CreateDevisRequest,
  CreateLigneDevisRequest,
  CreateSousSectionRequest,
  Devis,
  DevisCompletResponse,
  UnitesDisponibles,
  QualitesMateriel,
  TypesVitrage,
} from "@/types/devis"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { useClientsList } from "@/hooks/useClients"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from 'uuid'
import { RemiseForm } from "./remise-form-component"
import { formatCurrency } from "@/types/devis"

interface QuoteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (devis: CreateDevisRequest) => Promise<void>
  devis?: Devis | DevisCompletResponse
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

// ---------- Lines table (standalone component to avoid re-mount) ----------
interface LignesTableProps {
  lignes: LigneFormData[]
  isEdit: boolean
  title: string
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, field: keyof Omit<LigneFormData, 'tempId'>, value: any) => void
  onOrdre: (id: string, val: number) => void
}

function LignesTable({ lignes, isEdit, title, onAdd, onRemove, onUpdate, onOrdre }: LignesTableProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />{title}
        </h4>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />Ajouter ligne
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto border rounded-lg">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead className="w-12 text-center">N°</TableHead>
              <TableHead className="w-24">Code</TableHead>
              <TableHead>Désignation *</TableHead>
              <TableHead className="w-20">L (cm)</TableHead>
              <TableHead className="w-20">H (cm)</TableHead>
              <TableHead className="w-20">Qté *</TableHead>
              <TableHead className="w-24">Unité</TableHead>
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
                  <Input value={ligne.code || ""} onChange={(e) => onUpdate(ligne.tempId, 'code', e.target.value)} placeholder="Code" className="h-8" />
                </TableCell>
                <TableCell>
                  <Input value={ligne.designation} onChange={(e) => onUpdate(ligne.tempId, 'designation', e.target.value)} placeholder="Désignation" className="h-8" />
                </TableCell>
                <TableCell>
                  <Input type="number" step="0.01" value={ligne.longueur || ''} onChange={(e) => onUpdate(ligne.tempId, 'longueur', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="L" className="h-8" />
                </TableCell>
                <TableCell>
                  <Input type="number" step="0.01" value={ligne.hauteur || ''} onChange={(e) => onUpdate(ligne.tempId, 'hauteur', e.target.value ? parseFloat(e.target.value) : undefined)} placeholder="H" className="h-8" />
                </TableCell>
                <TableCell>
                  <Input type="number" step="0.01" min="0" value={ligne.quantite} onChange={(e) => onUpdate(ligne.tempId, 'quantite', parseFloat(e.target.value) || 0)} className="h-8" />
                </TableCell>
                <TableCell>
                  <Select value={ligne.unite} onValueChange={(v) => onUpdate(ligne.tempId, 'unite', v)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{UnitesDisponibles.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}</SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input type="number" step="0.01" min="0" value={ligne.prixUnitaireHT} onChange={(e) => onUpdate(ligne.tempId, 'prixUnitaireHT', parseFloat(e.target.value) || 0)} className="h-8" />
                </TableCell>
                <TableCell className="font-medium text-xs">{formatCurrency((ligne.quantite || 0) * (ligne.prixUnitaireHT || 0))}</TableCell>
                <TableCell>
                  <Button type="button" variant="ghost" size="sm" onClick={() => onRemove(ligne.tempId)}>
                    <Trash2 className="h-4 w-4" />
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
// -------------------------------------------------------------------------

export function QuoteFormModalV2({ open, onOpenChange, onSubmit, devis, loading = false }: QuoteFormModalProps) {
  const { user } = useAuth()
  const isEdit = !!devis
  const [currentTab, setCurrentTab] = useState("general")

  const [formData, setFormData] = useState({
    clientId: 0, titre: "", description: "", dateValidite: "",
    conditions: "", notes: "", chantier: "", contact: "",
    qualiteMateriel: "", typeVitrage: "",
  })

  const [sections, setSections] = useState<SectionFormData[]>([makeSection(1)])
  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.tempId)
  const [activeSousSectionId, setActiveSousSectionId] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([sections[0]?.tempId]))
  const [remiseValeur, setRemiseValeur] = useState(0)
  const [remisePourcentage, setRemisePourcentage] = useState(0)

  const { clients, loading: clientLoading } = useClientsList()

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
        qualiteMateriel: devis.qualiteMateriel || "", typeVitrage: devis.typeVitrage || "",
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
      setFormData({ clientId: 0, titre: "", description: "", dateValidite: "", conditions: "", notes: "", chantier: "", contact: "", qualiteMateriel: "", typeVitrage: "" })
      setRemiseValeur(0)
      setRemisePourcentage(0)
    }
    setCurrentTab("general")
  }, [open, isEdit, devis])

  // ---- sections ----
  const addSection = () => {
    const s = makeSection(sections.length + 1)
    setSections(p => [...p, s])
    setActiveSectionId(s.tempId)
    setActiveSousSectionId(null)
    setExpandedSections(p => new Set([...p, s.tempId]))
    setCurrentTab("lignes")
  }
  const removeSection = (id: string) => {
    if (sections.length <= 1) return
    const filtered = sections.filter(s => s.tempId !== id)
    setSections(filtered)
    if (activeSectionId === id) { setActiveSectionId(filtered[0].tempId); setActiveSousSectionId(null) }
  }
  const updateSection = (id: string, field: 'nom' | 'ordre' | 'description', value: any) =>
    setSections(p => p.map(s => s.tempId === id ? { ...s, [field]: value } : s))
  const toggleExpand = (id: string) =>
    setExpandedSections(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  // ---- sous-sections ----
  const addSousSection = (sectionId: string) => {
    const parent = sections.find(s => s.tempId === sectionId)
    const ss: SousSectionFormData = {
      tempId: uuidv4(), code: "", nom: "", description: "",
      ordre: (parent?.sousSections.length ?? 0) + 1, lignes: [makeLigne(1)],
    }
    setSections(p => p.map(s => s.tempId === sectionId ? { ...s, sousSections: [...s.sousSections, ss] } : s))
    setActiveSectionId(sectionId)
    setActiveSousSectionId(ss.tempId)
    setExpandedSections(p => new Set([...p, sectionId]))
  }
  const removeSousSection = (sectionId: string, ssId: string) => {
    setSections(p => p.map(s => s.tempId !== sectionId ? s : { ...s, sousSections: s.sousSections.filter(ss => ss.tempId !== ssId) }))
    if (activeSousSectionId === ssId) setActiveSousSectionId(null)
  }
  const updateSousSection = (sectionId: string, ssId: string, field: 'code' | 'nom' | 'description' | 'ordre', value: any) =>
    setSections(p => p.map(s => s.tempId !== sectionId ? s : {
      ...s, sousSections: s.sousSections.map(ss => ss.tempId === ssId ? { ...ss, [field]: value } : ss)
    }))

  // ---- lines (section direct) ----
  const addLigne = (sectionId: string) =>
    setSections(p => p.map(s => s.tempId !== sectionId ? s : { ...s, lignes: [...s.lignes, makeLigne(s.lignes.length + 1)] }))
  const removeLigne = (sectionId: string, lId: string) =>
    setSections(p => p.map(s => s.tempId !== sectionId ? s : { ...s, lignes: s.lignes.filter(l => l.tempId !== lId) }))
  const updateLigne = (sectionId: string, lId: string, field: keyof Omit<LigneFormData, 'tempId'>, value: any) =>
    setSections(p => p.map(s => s.tempId !== sectionId ? s : { ...s, lignes: s.lignes.map(l => l.tempId === lId ? { ...l, [field]: value } : l) }))
  const handleOrdre = (sectionId: string, lId: string, newOrdre: number) =>
    setSections(p => p.map(s => {
      if (s.tempId !== sectionId) return s
      const arr = [...s.lignes]; const from = arr.findIndex(l => l.tempId === lId); if (from === -1) return s
      const to = Math.max(0, Math.min(newOrdre - 1, arr.length - 1))
      const [m] = arr.splice(from, 1); arr.splice(to, 0, m)
      return { ...s, lignes: arr.map((l, i) => ({ ...l, ordre: i + 1 })) }
    }))

  // ---- lines (sous-section) ----
  const updSS = (sectionId: string, ssId: string, fn: (ss: SousSectionFormData) => SousSectionFormData) =>
    setSections(p => p.map(s => s.tempId !== sectionId ? s : { ...s, sousSections: s.sousSections.map(ss => ss.tempId === ssId ? fn(ss) : ss) }))
  const addLigneInSS = (sectionId: string, ssId: string) =>
    updSS(sectionId, ssId, ss => ({ ...ss, lignes: [...ss.lignes, makeLigne(ss.lignes.length + 1)] }))
  const removeLigneInSS = (sectionId: string, ssId: string, lId: string) =>
    updSS(sectionId, ssId, ss => ({ ...ss, lignes: ss.lignes.filter(l => l.tempId !== lId) }))
  const updateLigneInSS = (sectionId: string, ssId: string, lId: string, field: keyof Omit<LigneFormData, 'tempId'>, value: any) =>
    updSS(sectionId, ssId, ss => ({ ...ss, lignes: ss.lignes.map(l => l.tempId === lId ? { ...l, [field]: value } : l) }))
  const handleOrdreInSS = (sectionId: string, ssId: string, lId: string, newOrdre: number) =>
    updSS(sectionId, ssId, ss => {
      const arr = [...ss.lignes]; const from = arr.findIndex(l => l.tempId === lId); if (from === -1) return ss
      const to = Math.max(0, Math.min(newOrdre - 1, arr.length - 1))
      const [m] = arr.splice(from, 1); arr.splice(to, 0, m)
      return { ...ss, lignes: arr.map((l, i) => ({ ...l, ordre: i + 1 })) }
    })

  // ---- totals ----
  const calculateTotals = () => {
    let brut = 0
    sections.forEach(s => {
      s.lignes.forEach(l => { brut += (l.quantite || 0) * (l.prixUnitaireHT || 0) })
      s.sousSections.forEach(ss => ss.lignes.forEach(l => { brut += (l.quantite || 0) * (l.prixUnitaireHT || 0) }))
    })
    const net = Math.max(0, brut * (1 - remisePourcentage / 100) - remiseValeur)
    const tva = net * 0.18
    return { montantHTBrut: brut, montantRemiseTotal: brut - net, montantHT: net, tauxTVA: 18, montantTVA: tva, montantTTC: net + tva }
  }

  const validateForm = (): string[] => {
    const errors: string[] = []
    if (!formData.titre.trim()) errors.push('Le titre est requis')
    if (!formData.clientId) errors.push('Veuillez sélectionner un client')
    sections.forEach((s, si) => {
      if (!s.nom.trim()) errors.push(`Section ${si + 1}: nom requis`)
      s.lignes.forEach((l, li) => { if (!l.designation.trim()) errors.push(`Section "${s.nom}" ligne ${li + 1}: désignation requise`) })
      s.sousSections.forEach((ss, ssi) => {
        if (!ss.nom.trim()) errors.push(`Section "${s.nom}" ss. ${ssi + 1}: nom requis`)
        ss.lignes.forEach((l, li) => { if (!l.designation.trim()) errors.push(`"${ss.nom}" ligne ${li + 1}: désignation requise`) })
      })
    })
    return errors
  }

  const serializeLigne = (l: LigneFormData, idx: number) => ({
    ordre: l.ordre ?? (idx + 1),
    code: l.code?.trim() || undefined,
    typeElement: l.typeElement?.trim() || undefined,
    designation: l.designation.trim() || "",
    description: l.description?.trim() || undefined,
    longueur: l.longueur || undefined, hauteur: l.hauteur || undefined,
    quantite: l.quantite || 1, unite: l.unite, prixUnitaireHT: l.prixUnitaireHT || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { toast({ title: "Erreur", description: "Vous devez être connecté", variant: "destructive" }); return }
    const errors = validateForm()
    if (errors.length > 0) { toast({ title: "Erreurs", description: errors.slice(0, 3).join(', '), variant: "destructive" }); return }
    const data: CreateDevisRequest = {
      clientId: formData.clientId, titre: formData.titre.trim(),
      description: formData.description.trim() || undefined,
      dateValidite: formData.dateValidite || undefined,
      conditions: formData.conditions.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      chantier: formData.chantier.trim() || undefined,
      contact: formData.contact.trim() || undefined,
      qualiteMateriel: formData.qualiteMateriel || undefined,
      typeVitrage: formData.typeVitrage || undefined,
      remiseValeur: remiseValeur > 0 ? remiseValeur : undefined,
      remisePourcentage: remisePourcentage > 0 ? remisePourcentage : undefined,
      TypeDevis: 'technique',
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
    await onSubmit(data)
  }

  const totals = calculateTotals()
  const activeSection = sections.find(s => s.tempId === activeSectionId)
  const activeSousSection = activeSousSectionId ? activeSection?.sousSections.find(ss => ss.tempId === activeSousSectionId) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl font-semibold">{isEdit ? "Modifier le devis" : "Nouveau devis"}</DialogTitle>
          <DialogDescription>{isEdit ? "Modifiez les informations du devis" : "Créez un nouveau devis avec sections et lignes"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 shrink-0">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="lignes">Sections & lignes</TabsTrigger>
              <TabsTrigger value="remise">💰 Remises</TabsTrigger>
              <TabsTrigger value="recap">Récapitulatif</TabsTrigger>
            </TabsList>

            {/* TAB 1: General */}
            <TabsContent value="general" className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client *</Label>
                  <Select value={formData.clientId.toString()} onValueChange={(v) => setFormData(p => ({ ...p, clientId: parseInt(v) }))} disabled={clientLoading}>
                    <SelectTrigger><SelectValue placeholder={clientLoading ? "Chargement..." : "Sélectionner un client"} /></SelectTrigger>
                    <SelectContent>{clients?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nom || c.raisonSociale}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Titre *</Label>
                  <Input value={formData.titre} onChange={(e) => setFormData(p => ({ ...p, titre: e.target.value }))} placeholder="Ex: Menuiserie aluminium - Projet X" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Chantier / Site</Label>
                  <Input value={formData.chantier} onChange={(e) => setFormData(p => ({ ...p, chantier: e.target.value }))} placeholder="Ex: Chantier Cocody Saint Jean" />
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <Input value={formData.contact} onChange={(e) => setFormData(p => ({ ...p, contact: e.target.value }))} placeholder="Nom du contact" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Qualité matériel</Label>
                  <Select value={formData.qualiteMateriel} onValueChange={(v) => setFormData(p => ({ ...p, qualiteMateriel: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{QualitesMateriel.map(q => <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type de vitrage</Label>
                  <Select value={formData.typeVitrage} onValueChange={(v) => setFormData(p => ({ ...p, typeVitrage: v }))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{TypesVitrage.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Description du projet..." rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de validité</Label>
                  <Input type="date" value={formData.dateValidite} onChange={(e) => setFormData(p => ({ ...p, dateValidite: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Conditions commerciales</Label>
                <Textarea value={formData.conditions} onChange={(e) => setFormData(p => ({ ...p, conditions: e.target.value }))} placeholder="Conditions de paiement, délais..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Notes internes</Label>
                <Textarea value={formData.notes} onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))} placeholder="Notes internes (non visibles sur le PDF)..." rows={2} />
              </div>
            </TabsContent>

            {/* TAB 2: Sections & lignes */}
            <TabsContent value="lignes" className="flex-1 overflow-hidden flex gap-4 mt-4">
              {/* Sidebar */}
              <div className="w-64 border-r pr-4 flex flex-col shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm"><Folder className="h-4 w-4" />Sections</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={addSection}><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="space-y-1 flex-1 overflow-y-auto">
                  {sections.map(section => {
                    const expanded = expandedSections.has(section.tempId)
                    const sectionActive = activeSectionId === section.tempId && !activeSousSectionId
                    return (
                      <div key={section.tempId}>
                        <div className={`p-2 rounded-lg border cursor-pointer transition-colors ${sectionActive ? 'bg-primary/10 border-primary' : 'hover:bg-muted border-transparent'}`}>
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1 flex-1 min-w-0" onClick={() => { setActiveSectionId(section.tempId); setActiveSousSectionId(null) }}>
                              <button type="button" className="p-0.5 hover:bg-muted rounded shrink-0"
                                onClick={(e) => { e.stopPropagation(); toggleExpand(section.tempId) }}>
                                {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              </button>
                              <Folder className="h-3.5 w-3.5 shrink-0 text-primary" />
                              <span className="font-medium text-sm truncate">{section.nom}</span>
                            </div>
                            <div className="flex items-center shrink-0">
                              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" title="Ajouter sous-section"
                                onClick={(e) => { e.stopPropagation(); addSousSection(section.tempId) }}>
                                <Layers className="h-3 w-3" />
                              </Button>
                              {sections.length > 1 && (
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0"
                                  onClick={(e) => { e.stopPropagation(); removeSection(section.tempId) }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 mt-1 ml-5">
                            <Badge variant="secondary" className="text-xs">{section.lignes.length} ligne(s)</Badge>
                            {section.sousSections.length > 0 && <Badge variant="outline" className="text-xs">{section.sousSections.length} ss.</Badge>}
                          </div>
                        </div>

                        {expanded && section.sousSections.map(ss => {
                          const ssActive = activeSectionId === section.tempId && activeSousSectionId === ss.tempId
                          return (
                            <div key={ss.tempId}
                              className={`ml-5 mt-0.5 p-2 rounded-lg border cursor-pointer transition-colors ${ssActive ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700' : 'hover:bg-muted border-transparent'}`}
                              onClick={() => { setActiveSectionId(section.tempId); setActiveSousSectionId(ss.tempId) }}>
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                  <Layers className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                                  <span className="text-sm truncate">{ss.nom || <span className="italic text-muted-foreground">Sans nom</span>}</span>
                                </div>
                                <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0"
                                  onClick={(e) => { e.stopPropagation(); removeSousSection(section.tempId, ss.tempId) }}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="ml-5 mt-0.5">
                                <Badge variant="secondary" className="text-xs">{ss.lignes.length} ligne(s)</Badge>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Content panel */}
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {activeSousSection && activeSection ? (
                  <>
                    <div className="space-y-3 mb-4 shrink-0">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <button type="button" className="hover:text-foreground underline" onClick={() => setActiveSousSectionId(null)}>{activeSection.nom}</button>
                        <ChevronRight className="h-3 w-3" />
                        <span className="font-medium text-foreground">{activeSousSection.nom || "Sous-section"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label>Code</Label>
                          <Input value={activeSousSection.code || ""} onChange={(e) => updateSousSection(activeSection.tempId, activeSousSection.tempId, 'code', e.target.value)} placeholder="Code ss." />
                        </div>
                        <div className="space-y-1">
                          <Label>Nom *</Label>
                          <Input value={activeSousSection.nom} onChange={(e) => updateSousSection(activeSection.tempId, activeSousSection.tempId, 'nom', e.target.value)} placeholder="Nom" />
                        </div>
                        <div className="space-y-1">
                          <Label>Ordre</Label>
                          <Input type="number" min="1" value={activeSousSection.ordre} onChange={(e) => updateSousSection(activeSection.tempId, activeSousSection.tempId, 'ordre', parseInt(e.target.value) || 1)} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea value={activeSousSection.description || ""} onChange={(e) => updateSousSection(activeSection.tempId, activeSousSection.tempId, 'description', e.target.value)} rows={2} />
                      </div>
                    </div>
                    <LignesTable
                      lignes={activeSousSection.lignes} isEdit={isEdit}
                      title={`Lignes de "${activeSousSection.nom || 'Sous-section'}"`}
                      onAdd={() => addLigneInSS(activeSection.tempId, activeSousSection.tempId)}
                      onRemove={(lId) => removeLigneInSS(activeSection.tempId, activeSousSection.tempId, lId)}
                      onUpdate={(lId, f, v) => updateLigneInSS(activeSection.tempId, activeSousSection.tempId, lId, f, v)}
                      onOrdre={(lId, o) => handleOrdreInSS(activeSection.tempId, activeSousSection.tempId, lId, o)}
                    />
                  </>
                ) : activeSection ? (
                  <>
                    <div className="space-y-3 mb-4 shrink-0">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label>Nom de la section *</Label>
                          <Input value={activeSection.nom} onChange={(e) => updateSection(activeSection.tempId, 'nom', e.target.value)} placeholder="Ex: Restauration, Bureau..." />
                        </div>
                        <div className="space-y-1">
                          <Label>Ordre</Label>
                          <Input type="number" min="1" value={activeSection.ordre} onChange={(e) => updateSection(activeSection.tempId, 'ordre', parseInt(e.target.value) || 1)} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Textarea value={activeSection.description || ""} onChange={(e) => updateSection(activeSection.tempId, 'description', e.target.value)} placeholder="Description de la section..." rows={2} />
                      </div>
                    </div>
                    <LignesTable
                      lignes={activeSection.lignes} isEdit={isEdit}
                      title={`Lignes de "${activeSection.nom}"`}
                      onAdd={() => addLigne(activeSection.tempId)}
                      onRemove={(lId) => removeLigne(activeSection.tempId, lId)}
                      onUpdate={(lId, f, v) => updateLigne(activeSection.tempId, lId, f, v)}
                      onOrdre={(lId, o) => handleOrdre(activeSection.tempId, lId, o)}
                    />
                  </>
                ) : null}
              </div>
            </TabsContent>

            {/* TAB 3: Remise */}
            <TabsContent value="remise" className="space-y-4 mt-4">
              <RemiseForm
                montantHTBrut={totals.montantHTBrut}
                remiseValeur={remiseValeur} remisePourcentage={remisePourcentage}
                onRemiseChange={(v, p) => { setRemiseValeur(v); setRemisePourcentage(p) }}
                disabled={loading}
              />
            </TabsContent>

            {/* TAB 4: Récapitulatif */}
            <TabsContent value="recap" className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2">
              <Card>
                <CardHeader><CardTitle>Récapitulatif du devis</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-muted-foreground">Client: </span><span className="font-medium">{clients?.find(c => c.id === formData.clientId)?.nom || 'Non sélectionné'}</span></div>
                    <div><span className="text-muted-foreground">Titre: </span><span className="font-medium">{formData.titre || 'Non renseigné'}</span></div>
                  </div>
                  <div className="space-y-4">
                    {sections.map(section => {
                      const directTotal = section.lignes.reduce((s, l) => s + (l.quantite || 0) * (l.prixUnitaireHT || 0), 0)
                      const ssTotal = section.sousSections.reduce((t, ss) => t + ss.lignes.reduce((s, l) => s + (l.quantite || 0) * (l.prixUnitaireHT || 0), 0), 0)
                      return (
                        <div key={section.tempId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold">{section.nom}</h5>
                            <Badge>{section.lignes.length} ligne(s) + {section.sousSections.length} ss.</Badge>
                          </div>
                          {section.lignes.map((l, i) => (
                            <div key={l.tempId} className="text-sm flex justify-between py-0.5">
                              <span>{i + 1}. {l.designation} × {l.quantite} {l.unite}</span>
                              <span>{formatCurrency((l.quantite || 0) * (l.prixUnitaireHT || 0))}</span>
                            </div>
                          ))}
                          {section.sousSections.map(ss => (
                            <div key={ss.tempId} className="ml-4 border-l-2 border-blue-200 pl-3 mt-2">
                              <p className="text-sm font-medium text-blue-700 flex items-center gap-1"><Layers className="h-3 w-3" />{ss.nom}</p>
                              {ss.lignes.map((l, i) => (
                                <div key={l.tempId} className="text-xs flex justify-between text-muted-foreground py-0.5">
                                  <span>{i + 1}. {l.designation}</span>
                                  <span>{formatCurrency((l.quantite || 0) * (l.prixUnitaireHT || 0))}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                          <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
                            <span>Total section:</span><span>{formatCurrency(directTotal + ssTotal)}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <Card className="bg-muted/30">
                    <CardContent className="pt-6 space-y-2">
                      {(remiseValeur > 0 || remisePourcentage > 0) && <div className="flex justify-between"><span>Montant HT brut:</span><span>{formatCurrency(totals.montantHTBrut)}</span></div>}
                      {remisePourcentage > 0 && <div className="flex justify-between text-sm"><span>Remise {remisePourcentage}%:</span><span>-{formatCurrency(totals.montantHTBrut * remisePourcentage / 100)}</span></div>}
                      {remiseValeur > 0 && <div className="flex justify-between text-sm"><span>Remise forfaitaire:</span><span>-{formatCurrency(remiseValeur)}</span></div>}
                      {(remiseValeur > 0 || remisePourcentage > 0) && <div className="flex justify-between font-semibold border-t pt-2"><span>Remise totale:</span><span>-{formatCurrency(totals.montantRemiseTotal)}</span></div>}
                      <div className="flex justify-between text-xl font-bold border-t pt-2"><span>{(remiseValeur > 0 || remisePourcentage > 0) ? 'HT net:' : 'Sous-total HT:'}</span><span className="text-primary">{formatCurrency(totals.montantHT)}</span></div>
                      <div className="flex justify-between text-xl font-bold border-t pt-2"><span>TVA ({totals.tauxTVA}%):</span><span className="text-primary">{formatCurrency(totals.montantTVA)}</span></div>
                      <div className="flex justify-between text-xl font-bold border-t pt-2"><span>TOTAL TTC:</span><span className="text-primary">{formatCurrency(totals.montantTTC)}</span></div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                <Calculator className="inline h-4 w-4 mr-1" />
                Total: <span className="font-semibold">{formatCurrency(totals.montantTTC)}</span>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enregistrement...</> : (isEdit ? "Modifier" : "Créer le devis")}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
