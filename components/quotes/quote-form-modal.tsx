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
import { Plus, Trash2, Calculator, Loader2, GripVertical, Folder, FileText } from "lucide-react"
import {
  CreateDevisRequest,
  CreateDevisSectionRequest,
  CreateLigneDevisRequest,
  Devis,
  DevisCompletResponse,
  UnitesDisponibles,
  TypesElements,
  QualitesMateriel,
  TypesVitrage,
  calculateSectionTotal
} from "@/types/devis"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { useClientsList } from "@/hooks/useClients"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from 'uuid';
import { RemiseForm } from "./remise-form-component"
import { calculateMontantHTBrut } from "@/types/devis"
import { formatCurrency } from "@/types/devis"


interface QuoteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (devis: CreateDevisRequest) => Promise<void>
  devis?: Devis | DevisCompletResponse // CHANGÉ: Accepter les deux types
  loading?: boolean
}

interface SectionFormData extends Omit<CreateDevisSectionRequest, 'lignes'> {
  tempId: string;
  lignes: LigneFormData[];
}

interface LigneFormData extends CreateLigneDevisRequest {
  tempId: string;
}

export function QuoteFormModalV2({ open, onOpenChange, onSubmit, devis, loading = false }: QuoteFormModalProps) {
  const { user } = useAuth()
  const isEdit = !!devis

  const [currentTab, setCurrentTab] = useState("general")

  const [formData, setFormData] = useState({
    clientId: 0,
    titre: "",
    description: "",
    dateValidite: "",
    conditions: "",
    notes: "",
    chantier: "",
    contact: "",
    qualiteMateriel: "",
    typeVitrage: "",
  })

  const [sections, setSections] = useState<SectionFormData[]>([
    {
      tempId: uuidv4(),
      nom: "Section 1",
      ordre: 1,
      description: "",
      lignes: [
        {
          tempId: uuidv4(),
          typeElement: "",
          designation: "",
          description: "",
          longueur: undefined,
          hauteur: undefined,
          quantite: 1,
          unite: "U",
          prixUnitaireHT: 0
        }
      ]
    }
  ])

  const [activeSectionId, setActiveSectionId] = useState<string>(sections[0]?.tempId)
  const [remiseValeur, setRemiseValeur] = useState(0)
  const [remisePourcentage, setRemisePourcentage] = useState(0)

  const { clients, loading: clientLoading } = useClientsList()

  // Calculer le montant HT brut à partir des sections
  const montantHTBrut = sections.reduce((total, section) => {
    return total + section.lignes.reduce((sum, ligne) => {
      return sum + (ligne.quantite * ligne.prixUnitaireHT)
    }, 0)
  }, 0)
  // Handler pour les changements de remise
  const handleRemiseChange = (valeur: number, pourcentage: number) => {
    setRemiseValeur(valeur)
    setRemisePourcentage(pourcentage)
  }
  // Fonction helper pour normaliser les sections
  const normalizeSections = (inputSections: any[]): SectionFormData[] => {
    return inputSections.map(section => ({
      tempId: uuidv4(),
      nom: section.nom,
      ordre: section.ordre,
      description: section.description || "",
      lignes: (section.lignes || []).map((ligne: any) => ({
        tempId: uuidv4(),
        typeElement: ligne.typeElement || "",
        designation: ligne.designation,
        description: ligne.description || "",
        longueur: ligne.longueur,
        hauteur: ligne.hauteur,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prixUnitaireHT: ligne.prixUnitaireHT
      }))
    }))
  }

  // Réinitialiser le formulaire quand la modal s'ouvre
  useEffect(() => {
    if (open) {
      if (isEdit && devis) {
        // Mode édition - charger les données du devis
        setFormData({
          clientId: devis.clientId,
          titre: devis.titre,
          description: devis.description || "",
          dateValidite: devis.dateValidite ? devis.dateValidite.split('T')[0] : "",
          conditions: devis.conditions || "",
          notes: devis.notes || "",
          chantier: devis.chantier || "",
          contact: devis.contact || "",
          qualiteMateriel: devis.qualiteMateriel || "",
          typeVitrage: devis.typeVitrage || "",
        })
        setRemiseValeur(devis.remiseValeur || 0)
        setRemisePourcentage(devis.remisePourcentage || 0)

        if (devis.sections && devis.sections.length > 0) {
          const loadedSections = normalizeSections(devis.sections)
          setSections(loadedSections)
          setActiveSectionId(loadedSections[0]?.tempId)
        } else {
          // Pas de sections, créer une par défaut
          const defaultSection: SectionFormData = {
            tempId: uuidv4(),
            nom: "Section 1",
            ordre: 1,
            description: "",
            lignes: [{
              tempId: uuidv4(),
              typeElement: "",
              designation: "",
              description: "",
              longueur: undefined,
              hauteur: undefined,
              quantite: 1,
              unite: "U",
              prixUnitaireHT: 0
            }]
          }
          setSections([defaultSection])
          setActiveSectionId(defaultSection.tempId)
        }
      } else {
        // Mode création - formulaire vide
        const initialSection: SectionFormData = {
          tempId: uuidv4(),
          nom: "Section 1",
          ordre: 1,
          description: "",
          lignes: [{
            tempId: uuidv4(),
            typeElement: "",
            designation: "",
            description: "",
            longueur: undefined,
            hauteur: undefined,
            quantite: 1,
            unite: "U",
            prixUnitaireHT: 0
          }]
        }
        setSections([initialSection])
        setActiveSectionId(initialSection.tempId)
        setFormData({
          clientId: 0,
          titre: "",
          description: "",
          dateValidite: "",
          conditions: "",
          notes: "",
          chantier: "",
          contact: "",
          qualiteMateriel: "",
          typeVitrage: "",
        })
      }
      setCurrentTab("general")
    }
  }, [open, isEdit, devis])



  // Gestion du formulaire général
  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    console.log("formData", formData)
  }

  // Gestion des sections
  const addSection = () => {
    const newSection: SectionFormData = {
      tempId: uuidv4(),
      nom: `Section ${sections.length + 1}`,
      ordre: sections.length + 1,
      description: "",
      lignes: [{
        tempId: uuidv4(),
        typeElement: "",
        designation: "",
        description: "",
        longueur: undefined,
        hauteur: undefined,
        quantite: 1,
        unite: "U",
        prixUnitaireHT: 0
      }]
    }
    setSections(prev => [...prev, newSection])
    setActiveSectionId(newSection.tempId)
    setCurrentTab("lignes")
  }

  const removeSection = (tempId: string) => {
    if (sections.length > 1) {
      const filtered = sections.filter(s => s.tempId !== tempId)
      setSections(filtered)
      if (activeSectionId === tempId) {
        setActiveSectionId(filtered[0]?.tempId)
      }
    }
  }

  const updateSection = (tempId: string, field: keyof Omit<SectionFormData, 'tempId' | 'lignes'>, value: any) => {
    setSections(prev => prev.map(s =>
      s.tempId === tempId ? { ...s, [field]: value } : s
    ))
  }

  // Gestion des lignes
  const addLigne = (sectionTempId: string) => {
    setSections(prev => prev.map(section => {
      if (section.tempId === sectionTempId) {
        return {
          ...section,
          lignes: [...section.lignes, {
            tempId: uuidv4(),
            typeElement: "",
            designation: "",
            description: "",
            longueur: undefined,
            hauteur: undefined,
            quantite: 1,
            unite: "U",
            prixUnitaireHT: 0
          }]
        }
      }
      return section
    }))
  }

  const removeLigne = (sectionTempId: string, ligneTempId: string) => {
    setSections(prev => prev.map(section => {
      if (section.tempId === sectionTempId && section.lignes.length > 1) {
        return {
          ...section,
          lignes: section.lignes.filter(l => l.tempId !== ligneTempId)
        }
      }
      return section
    }))
  }

  const updateLigne = (sectionTempId: string, ligneTempId: string, field: keyof Omit<LigneFormData, 'tempId'>, value: any) => {
    setSections(prev => prev.map(section => {
      if (section.tempId === sectionTempId) {
        return {
          ...section,
          lignes: section.lignes.map(ligne =>
            ligne.tempId === ligneTempId ? { ...ligne, [field]: value } : ligne
          )
        }
      }
      return section
    }))
  }

  // Calcul des totaux
  const calculateTotals = () => {
    // Calculer le montant HT brut (somme de toutes les lignes)
    let montantHTBrut = 0
    sections.forEach(section => {
      section.lignes.forEach(ligne => {
        montantHTBrut += (ligne.quantite || 0) * (ligne.prixUnitaireHT || 0)
      })
    })

    // Appliquer les remises
    // 1. D'abord la remise en pourcentage
    const montantRemisePourcentage = montantHTBrut * (remisePourcentage / 100)
    const montantApresRemisePourcentage = montantHTBrut - montantRemisePourcentage

    // 2. Puis la remise en valeur
    const montantHTNet = Math.max(0, montantApresRemisePourcentage - remiseValeur)

    // Calculer le total de la remise
    const montantRemiseTotal = montantHTBrut - montantHTNet

    // Calculer la TVA et le TTC sur le montant net
    const tauxTVA = 18
    const montantTVA = montantHTNet * (tauxTVA / 100)
    const montantTTC = montantHTNet + montantTVA

    return {
      montantHTBrut,           // ✅ Nouveau
      montantRemiseTotal,      // ✅ Nouveau
      montantHT: montantHTNet, // ✅ Modifié (montant net après remises)
      tauxTVA,
      montantTVA,
      montantTTC
    }
  }

  // Validation et soumission
  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.titre.trim()) {
      errors.push('Le titre est requis')
    }

    if (formData.clientId === 0) {
      if (clientLoading) {
        errors.push('Veuillez attendre le chargement des clients')
      } else if (!clients || clients.length === 0) {
        errors.push('Aucun client disponible. Veuillez créer un client d\'abord.')
      } else {
        errors.push('Veuillez sélectionner un client')
      }
    }

    if (sections.length === 0) {
      errors.push('Au moins une section est requise')
    }

    sections.forEach((section, sIndex) => {
      if (!section.nom.trim()) {
        errors.push(`Section ${sIndex + 1}: Le nom est requis`)
      }

      if (section.lignes.length === 0) {
        errors.push(`Section ${sIndex + 1}: Au moins une ligne est requise`)
      }

      section.lignes.forEach((ligne, lIndex) => {
        if (!ligne.designation.trim() && !ligne.typeElement?.trim()) {
          errors.push(`Section "${section.nom}" - Ligne ${lIndex + 1}: La désignation ou le type d'élément est requis`)
        }
        if ((ligne.quantite || 0) <= 0) {
          errors.push(`Section "${section.nom}" - Ligne ${lIndex + 1}: La quantité doit être supérieure à 0`)
        }
        if ((ligne.prixUnitaireHT || 0) < 0) {
          errors.push(`Section "${section.nom}" - Ligne ${lIndex + 1}: Le prix unitaire ne peut pas être négatif`)
        }
      })
    })

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer cette action",
        variant: "destructive",
      })
      return
    }

    const errors = validateForm()
    if (errors.length > 0) {
      toast({
        title: "Erreurs de validation",
        description: errors.slice(0, 3).join(', ') + (errors.length > 3 ? '...' : ''),
        variant: "destructive",
      })
      return
    }

    const devisData: CreateDevisRequest = {
      clientId: formData.clientId,
      titre: formData.titre.trim(),
      description: formData.description.trim() || undefined,
      dateValidite: formData.dateValidite || undefined,
      conditions: formData.conditions.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      chantier: formData.chantier.trim() || undefined,
      contact: formData.contact.trim() || undefined,
      qualiteMateriel: formData.qualiteMateriel || undefined,
      typeVitrage: formData.typeVitrage || undefined,
      remiseValeur: remiseValeur > 0 ? remiseValeur : undefined,  // ✅
      remisePourcentage: remisePourcentage > 0 ? remisePourcentage : undefined,
      sections: sections.map(section => ({
        nom: section.nom.trim(),
        ordre: section.ordre,
        description: section.description?.trim() || undefined,
        lignes: section.lignes.map(ligne => ({
          typeElement: ligne.typeElement?.trim() || undefined,
          designation: ligne.designation.trim() || ligne.typeElement?.trim() || "",
          description: ligne.description?.trim() || undefined,
          longueur: ligne.longueur || undefined,
          hauteur: ligne.hauteur || undefined,
          quantite: ligne.quantite || 1,
          unite: ligne.unite,
          prixUnitaireHT: ligne.prixUnitaireHT || 0
        }))
      }))
    }
    console.log("devisData", devisData) 
    await onSubmit(devisData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totals = calculateTotals()
  const activeSection = sections.find(s => s.tempId === activeSectionId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] lg:max-w-[90vw] xl:max-w-[85vw] 2xl:max-w-[80vw] p-0">        <DialogHeader>
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">

            {isEdit ? "Modifier le devis" : "Nouveau devis"}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {isEdit
            ? "Modifiez les informations du devis et ses lignes"
            : "Créez un nouveau devis avec des sections et lignes détaillées"}
        </DialogDescription>
      </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="lignes">Sections et lignes</TabsTrigger>
              <TabsTrigger value="remise">💰 Remises</TabsTrigger>
              <TabsTrigger value="recap">Récapitulatif</TabsTrigger>
            </TabsList>

            {/* TAB 1: Informations générales */}
            <TabsContent value="general" className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Client *</Label>
                  <Select
                    value={formData.clientId.toString()}
                    onValueChange={(value) => handleInputChange('clientId', parseInt(value))}
                    disabled={clientLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={clientLoading ? "Chargement..." : "Sélectionner un client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map(client => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {`${client.nom}` || client.raisonSociale}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titre">Titre du devis *</Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => handleInputChange('titre', e.target.value)}
                    placeholder="Ex: Menuiserie aluminium - Projet X"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chantier">Chantier / Site</Label>
                  <Input
                    id="chantier"
                    value={formData.chantier}
                    onChange={(e) => handleInputChange('chantier', e.target.value)}
                    placeholder="Ex: Chantier Cocody Saint Jean"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact">Contact</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="Nom du contact"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qualiteMateriel">Qualité matériel</Label>
                  <Select
                    value={formData.qualiteMateriel}
                    onValueChange={(value) => handleInputChange('qualiteMateriel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la qualité" />
                    </SelectTrigger>
                    <SelectContent>
                      {QualitesMateriel.map(q => (
                        <SelectItem key={q.value} value={q.value}>{q.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="typeVitrage">Type de vitrage</Label>
                  <Select
                    value={formData.typeVitrage}
                    onValueChange={(value) => handleInputChange('typeVitrage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le vitrage" />
                    </SelectTrigger>
                    <SelectContent>
                      {TypesVitrage.map(v => (
                        <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description du projet..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateValidite">Date de validité</Label>
                  <Input
                    id="dateValidite"
                    type="date"
                    value={formData.dateValidite}
                    onChange={(e) => handleInputChange('dateValidite', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Conditions commerciales</Label>
                <Textarea
                  id="conditions"
                  value={formData.conditions}
                  onChange={(e) => handleInputChange('conditions', e.target.value)}
                  placeholder="Conditions de paiement, délais, garanties..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes internes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes internes (non visibles sur le PDF client)..."
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* TAB 2: Sections et lignes */}
            <TabsContent value="lignes" className="flex-1 overflow-hidden flex gap-4 mt-4">
              {/* Sidebar des sections */}
              <div className="w-64 border-r pr-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    Sections
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addSection}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {sections.map((section, index) => (
                    <div
                      key={section.tempId}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${activeSectionId === section.tempId
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                        }`}
                      onClick={() => setActiveSectionId(section.tempId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{section.nom}</span>
                        </div>
                        {sections.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSection(section.tempId)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {section.lignes.length} ligne(s)
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contenu de la section active */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeSection && (
                  <>
                    <div className="space-y-3 mb-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="section-nom">Nom de la section *</Label>
                          <Input
                            id="section-nom"
                            value={activeSection.nom}
                            onChange={(e) => updateSection(activeSection.tempId, 'nom', e.target.value)}
                            placeholder="Ex: Restauration, Bureau, Office..."
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="section-ordre">Ordre</Label>
                          <Input
                            id="section-ordre"
                            type="number"
                            min="1"
                            value={activeSection.ordre}
                            onChange={(e) => updateSection(activeSection.tempId, 'ordre', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="section-description">Description (optionnel)</Label>
                        <Textarea
                          id="section-description"
                          value={activeSection.description}
                          onChange={(e) => updateSection(activeSection.tempId, 'description', e.target.value)}
                          placeholder="Description de la section..."
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Lignes de "{activeSection.nom}"
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addLigne(activeSection.tempId)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une ligne
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader className="sticky top-0 bg-background z-10">
                          <TableRow>
                            <TableHead className="w-32">Type</TableHead>
                            <TableHead className="w-40">Désignation *</TableHead>
                            <TableHead className="w-20">L (cm)</TableHead>
                            <TableHead className="w-20">H (cm)</TableHead>
                            <TableHead className="w-20">Qté *</TableHead>
                            <TableHead className="w-24">Unité</TableHead>
                            <TableHead className="w-28">Prix U. HT *</TableHead>
                            <TableHead className="w-28">Total HT</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeSection.lignes.map((ligne) => (
                            <TableRow key={ligne.tempId}>
                              <TableCell>
                                <Select
                                  value={ligne.typeElement}
                                  onValueChange={(value) => updateLigne(activeSection.tempId, ligne.tempId, 'typeElement', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TypesElements.map(t => (
                                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>

                              <TableCell>
                                <Input
                                  value={ligne.designation}
                                  onChange={(e) => updateLigne(activeSection.tempId, ligne.tempId, 'designation', e.target.value)}
                                  placeholder="Désignation"
                                  className="h-8"
                                />
                              </TableCell>

                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={ligne.longueur || ''}
                                  onChange={(e) => updateLigne(activeSection.tempId, ligne.tempId, 'longueur', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  placeholder="L"
                                  className="h-8"
                                />
                              </TableCell>

                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={ligne.hauteur || ''}
                                  onChange={(e) => updateLigne(activeSection.tempId, ligne.tempId, 'hauteur', e.target.value ? parseFloat(e.target.value) : undefined)}
                                  placeholder="H"
                                  className="h-8"
                                />
                              </TableCell>

                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={ligne.quantite}
                                  onChange={(e) => updateLigne(activeSection.tempId, ligne.tempId, 'quantite', parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </TableCell>

                              <TableCell>
                                <Select
                                  value={ligne.unite}
                                  onValueChange={(value) => updateLigne(activeSection.tempId, ligne.tempId, 'unite', value)}
                                >
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {UnitesDisponibles.map(u => (
                                      <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>

                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={ligne.prixUnitaireHT}
                                  onChange={(e) => updateLigne(activeSection.tempId, ligne.tempId, 'prixUnitaireHT', parseFloat(e.target.value) || 0)}
                                  className="h-8"
                                />
                              </TableCell>

                              <TableCell className="font-medium">
                                {formatCurrency((ligne.quantite || 0) * (ligne.prixUnitaireHT || 0))}
                              </TableCell>

                              <TableCell>
                                {activeSection.lignes.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeLigne(activeSection.tempId, ligne.tempId)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Remise */}
            <TabsContent value="remise" className="space-y-4">
              <RemiseForm
                montantHTBrut={sections.reduce((total, section) =>
                  total + section.lignes.reduce((sum, ligne) =>
                    sum + (ligne.quantite * ligne.prixUnitaireHT), 0
                  ), 0
                )}
                remiseValeur={remiseValeur}
                remisePourcentage={remisePourcentage}
                onRemiseChange={(valeur, pourcentage) => {
                  setRemiseValeur(valeur)
                  setRemisePourcentage(pourcentage)
                }}
                disabled={loading}
              />
            </TabsContent>

            {/* TAB 4: Récapitulatif */}
            <TabsContent value="recap" className="flex-1 overflow-y-auto space-y-4 mt-4 pr-2">
              <Card>
                <CardHeader>
                  <CardTitle>Récapitulatif du devis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Infos générales */}
                  <div>
                    <h4 className="font-semibold mb-3">Informations générales</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Client:</span>{' '}
                        <span className="font-medium">
                          {clients?.find(c => c.id === formData.clientId)?.raisonSociale ||
                            clients?.find(c => c.id === formData.clientId)?.nom ||
                            'Non sélectionné'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Titre:</span>{' '}
                        <span className="font-medium">{formData.titre || 'Non renseigné'}</span>
                      </div>
                      {formData.chantier && (
                        <div>
                          <span className="text-muted-foreground">Chantier:</span>{' '}
                          <span className="font-medium">{formData.chantier}</span>
                        </div>
                      )}
                      {formData.qualiteMateriel && (
                        <div>
                          <span className="text-muted-foreground">Qualité:</span>{' '}
                          <span className="font-medium">{formData.qualiteMateriel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sections et lignes */}
                  <div>
                    <h4 className="font-semibold mb-3">Détail par section</h4>
                    <div className="space-y-4">
                      {sections.map((section) => {
                        const sectionTotal = section.lignes.reduce((sum, l) =>
                          sum + ((l.quantite || 0) * (l.prixUnitaireHT || 0)), 0
                        )
                        return (
                          <div key={section.tempId} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold">{section.nom}</h5>
                              <Badge>{section.lignes.length} ligne(s)</Badge>
                            </div>
                            <div className="space-y-2">
                              {section.lignes.map((ligne, idx) => (
                                <div key={ligne.tempId} className="text-sm flex justify-between">
                                  <span>
                                    {idx + 1}. {ligne.typeElement || ligne.designation}
                                    {ligne.longueur && ligne.hauteur && ` (${ligne.longueur} × ${ligne.hauteur})`}
                                    {' × '}{ligne.quantite} {ligne.unite}
                                  </span>
                                  <span className="font-medium">
                                    {formatCurrency((ligne.quantite || 0) * (ligne.prixUnitaireHT || 0))}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t flex justify-between font-semibold">
                              <span>Total section:</span>
                              <span>{formatCurrency(sectionTotal)}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Totaux */}
                  <Card className="bg-muted/30">
                    <CardContent className="pt-6 space-y-3">
                      {(remiseValeur > 0 || remisePourcentage > 0) &&
                        (<div className="flex justify-between text-lg">
                          <span> Montant HT brut:</span>
                          <span className="font-semibold">{formatCurrency(totals.montantHTBrut)}</span>
                        </div>)}
                      {remisePourcentage > 0 && (
                        <div className="flex justify-between">
                          <span> Remise {remisePourcentage}%:</span>
                          <span className="font-medium">-{formatCurrency(totals.montantHTBrut * (remisePourcentage / 100))}</span>
                        </div>)}
                      {remiseValeur > 0 && (
                        <div className="flex justify-between text-xl font-bold pt-3 border-t">
                          <span>Remise forfaitaire:</span>
                          <span className="text-primary">-{formatCurrency(remiseValeur)}</span>
                        </div>)}
                      {(remiseValeur > 0 || remisePourcentage > 0) && (
                        <div className="flex justify-between text-xl font-bold pt-3 border-t">
                          <span>Remise totale:</span>
                          <span className="text-primary">-{formatCurrency(totals.montantRemiseTotal)}</span>
                        </div>)}
                      {/* Montant HT net */}
                      <div className="flex justify-between text-xl font-bold pt-3 border-t">
                        <span>{(remiseValeur > 0 || remisePourcentage > 0) ? 'Montant HT net:' : 'Sous-total HT:'}</span>
                        <span className="text-primary">{formatCurrency(totals.montantHT)}</span>
                      </div>
                      {/* TVA */}
                      <div className="flex justify-between text-xl font-bold pt-3 border-t">
                        <span> TVA ({totals.tauxTVA}%):</span>
                        <span className="text-primary">{formatCurrency(totals.montantTVA)}</span>
                      </div>
                      {/* Total TTC */}
                      <div className="flex justify-between text-xl font-bold pt-3 border-t">
                        <span> TOTAL TTC:</span>
                        <span className="text-primary">{formatCurrency(totals.montantTTC)}</span>
                      </div>
                      {/* Badge économie si remise */}
                      {(remiseValeur > 0 || remisePourcentage > 0) && (
                        <div className="flex justify-between text-xl font-bold pt-3 border-t">
                          <span>💰 Économie totale</span>
                          <span className="text-primary">-{formatCurrency(totals.montantRemiseTotal)}</span>
                        </div>)}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                <Calculator className="inline h-4 w-4 mr-1" />
                Total: <span className="font-semibold">{formatCurrency(totals.montantTTC)}</span>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    isEdit ? "Modifier" : "Créer le devis"
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}