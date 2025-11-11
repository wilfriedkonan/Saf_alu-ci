"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Edit,
  Save,
  CheckCircle,
  AlertTriangle,
  Info,
  Package,
  FileText,
  ClipboardList,
} from "lucide-react"
import { toast } from "sonner"
import { clients } from "@/lib/clients"
import { formatCurrency } from "@/lib/format"
import type { DQE, DQELot, DQEChapitre, DQEPoste } from "@/lib/dqe"

interface DQEFormCompleteProps {
  mode: "create" | "edit"
  dqeId?: string
  initialData?: DQE
  onSuccess?: (dqe: DQE) => void
  onCancel?: () => void
}

const UNITS = [
  { value: "m³", label: "m³ (mètre cube)" },
  { value: "ml", label: "ml (mètre linéaire)" },
  { value: "m²", label: "m² (mètre carré)" },
  { value: "ens", label: "ens (ensemble)" },
  { value: "forf", label: "forf (forfait)" },
  { value: "u", label: "u (unité)" },
]

export function DQEFormComplete({ mode, dqeId, initialData, onSuccess, onCancel }: DQEFormCompleteProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // État principal du DQE
  const [dqe, setDqe] = useState<Partial<DQE>>({
    nom: initialData?.nom || "",
    description: initialData?.description || "",
    clientId: initialData?.clientId || "",
    clientName: initialData?.clientName || "",
    devisId: initialData?.devisId || "",
    statut: initialData?.statut || "brouillon",
    tauxTVA: initialData?.tauxTVA || 18,
    totalRevenueHT: 0,
    montantTVA: 0,
    totalTTC: 0,
    lots: initialData?.lots || [],
  })

  // États pour les dialogs
  const [isLotDialogOpen, setIsLotDialogOpen] = useState(false)
  const [isChapterDialogOpen, setIsChapterDialogOpen] = useState(false)
  const [isPosteDialogOpen, setIsPosteDialogOpen] = useState(false)

  // États pour l'édition
  const [editingLot, setEditingLot] = useState<DQELot | null>(null)
  const [editingChapter, setEditingChapter] = useState<DQEChapitre | null>(null)
  const [editingPoste, setEditingPoste] = useState<DQEPoste | null>(null)
  const [currentLotIndex, setCurrentLotIndex] = useState<number | null>(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null)

  // Formulaires temporaires
  const [lotForm, setLotForm] = useState({ code: "", nom: "", description: "" })
  const [chapterForm, setChapterForm] = useState({ code: "", nom: "", description: "" })
  const [posteForm, setPosteForm] = useState({
    code: "",
    designation: "",
    description: "",
    unite: "m³",
    quantite: 0,
    prixUnitaireHT: 0,
  })

  // Calcul automatique des totaux
  useEffect(() => {
    calculateAllTotals()
  }, [dqe.lots, dqe.tauxTVA])

  const calculateAllTotals = () => {
    if (!dqe.lots || dqe.lots.length === 0) {
      setDqe((prev) => ({
        ...prev,
        totalRevenueHT: 0,
        montantTVA: 0,
        totalTTC: 0,
      }))
      return
    }

    const updatedLots = dqe.lots.map((lot) => {
      const updatedChapitres = lot.chapitres.map((chapitre) => {
        const totalChapitre = chapitre.postes.reduce((sum, poste) => sum + poste.quantite * poste.prixUnitaireHT, 0)
        return { ...chapitre, totalRevenueHT: totalChapitre }
      })

      const totalLot = updatedChapitres.reduce((sum, ch) => sum + ch.totalRevenueHT, 0)

      return {
        ...lot,
        chapitres: updatedChapitres,
        totalRevenueHT: totalLot,
      }
    })

    const totalHT = updatedLots.reduce((sum, lot) => sum + lot.totalRevenueHT, 0)
    const tva = dqe.tauxTVA || 18
    const montantTVA = totalHT * (tva / 100)
    const totalTTC = totalHT + montantTVA

    // Calculer les pourcentages
    const lotsWithPercentage = updatedLots.map((lot) => ({
      ...lot,
      pourcentageTotal: totalHT > 0 ? (lot.totalRevenueHT / totalHT) * 100 : 0,
    }))

    setDqe((prev) => ({
      ...prev,
      lots: lotsWithPercentage,
      totalRevenueHT: totalHT,
      montantTVA: montantTVA,
      totalTTC: totalTTC,
    }))
  }

  // Gestion des lots
  const openAddLotDialog = () => {
    setEditingLot(null)
    setLotForm({ code: "", nom: "", description: "" })
    setIsLotDialogOpen(true)
  }

  const openEditLotDialog = (lot: DQELot, index: number) => {
    setEditingLot(lot)
    setCurrentLotIndex(index)
    setLotForm({ code: lot.code, nom: lot.nom, description: lot.description || "" })
    setIsLotDialogOpen(true)
  }

  const saveLot = () => {
    if (!lotForm.code || !lotForm.nom) {
      toast.error("Code et nom du lot sont requis")
      return
    }

    const newLot: DQELot = {
      code: lotForm.code,
      nom: lotForm.nom,
      description: lotForm.description,
      ordre: editingLot ? editingLot.ordre : (dqe.lots?.length || 0) + 1,
      totalRevenueHT: 0,
      pourcentageTotal: 0,
      chapitres: editingLot ? editingLot.chapitres : [],
    }

    if (editingLot && currentLotIndex !== null) {
      const updatedLots = [...(dqe.lots || [])]
      updatedLots[currentLotIndex] = newLot
      setDqe((prev) => ({ ...prev, lots: updatedLots }))
      toast.success("Lot modifié avec succès")
    } else {
      setDqe((prev) => ({ ...prev, lots: [...(prev.lots || []), newLot] }))
      toast.success("Lot ajouté avec succès")
    }

    setIsLotDialogOpen(false)
    setEditingLot(null)
    setCurrentLotIndex(null)
  }

  const deleteLot = (index: number) => {
    const updatedLots = dqe.lots?.filter((_, i) => i !== index) || []
    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    toast.success("Lot supprimé")
  }

  // Gestion des chapitres
  const openAddChapterDialog = (lotIndex: number) => {
    setCurrentLotIndex(lotIndex)
    setEditingChapter(null)
    setChapterForm({ code: "", nom: "", description: "" })
    setIsChapterDialogOpen(true)
  }

  const openEditChapterDialog = (lotIndex: number, chapter: DQEChapitre, chapterIndex: number) => {
    setCurrentLotIndex(lotIndex)
    setCurrentChapterIndex(chapterIndex)
    setEditingChapter(chapter)
    setChapterForm({ code: chapter.code, nom: chapter.nom, description: chapter.description || "" })
    setIsChapterDialogOpen(true)
  }

  const saveChapter = () => {
    if (!chapterForm.code || !chapterForm.nom || currentLotIndex === null) {
      toast.error("Code et nom du chapitre sont requis")
      return
    }

    const lot = dqe.lots![currentLotIndex]
    const newChapter: DQEChapitre = {
      code: chapterForm.code,
      nom: chapterForm.nom,
      description: chapterForm.description,
      ordre: editingChapter ? editingChapter.ordre : (lot.chapitres?.length || 0) + 1,
      totalRevenueHT: 0,
      postes: editingChapter ? editingChapter.postes : [],
    }

    const updatedLots = [...dqe.lots!]
    if (editingChapter && currentChapterIndex !== null) {
      updatedLots[currentLotIndex].chapitres[currentChapterIndex] = newChapter
      toast.success("Chapitre modifié avec succès")
    } else {
      updatedLots[currentLotIndex].chapitres = [...lot.chapitres, newChapter]
      toast.success("Chapitre ajouté avec succès")
    }

    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    setIsChapterDialogOpen(false)
    setEditingChapter(null)
    setCurrentChapterIndex(null)
  }

  const deleteChapter = (lotIndex: number, chapterIndex: number) => {
    const updatedLots = [...dqe.lots!]
    updatedLots[lotIndex].chapitres = updatedLots[lotIndex].chapitres.filter((_, i) => i !== chapterIndex)
    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    toast.success("Chapitre supprimé")
  }

  // Gestion des postes
  const openAddPosteDialog = (lotIndex: number, chapterIndex: number) => {
    setCurrentLotIndex(lotIndex)
    setCurrentChapterIndex(chapterIndex)
    setEditingPoste(null)
    setPosteForm({
      code: "",
      designation: "",
      description: "",
      unite: "m³",
      quantite: 0,
      prixUnitaireHT: 0,
    })
    setIsPosteDialogOpen(true)
  }

  const savePoste = () => {
    if (!posteForm.code || !posteForm.designation || currentLotIndex === null || currentChapterIndex === null) {
      toast.error("Code et désignation du poste sont requis")
      return
    }

    if (posteForm.quantite <= 0) {
      toast.error("La quantité doit être supérieure à 0")
      return
    }

    const newPoste: DQEPoste = {
      code: posteForm.code,
      designation: posteForm.designation,
      description: posteForm.description,
      unite: posteForm.unite,
      quantite: posteForm.quantite,
      prixUnitaireHT: posteForm.prixUnitaireHT,
      totalRevenueHT: posteForm.quantite * posteForm.prixUnitaireHT,
      ordre: (dqe.lots![currentLotIndex].chapitres[currentChapterIndex].postes?.length || 0) + 1,
    }

    const updatedLots = [...dqe.lots!]
    updatedLots[currentLotIndex].chapitres[currentChapterIndex].postes = [
      ...updatedLots[currentLotIndex].chapitres[currentChapterIndex].postes,
      newPoste,
    ]

    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    setIsPosteDialogOpen(false)
    toast.success("Poste ajouté avec succès")
  }

  const deletePoste = (lotIndex: number, chapterIndex: number, posteIndex: number) => {
    const updatedLots = [...dqe.lots!]
    updatedLots[lotIndex].chapitres[chapterIndex].postes = updatedLots[lotIndex].chapitres[chapterIndex].postes.filter(
      (_, i) => i !== posteIndex,
    )
    setDqe((prev) => ({ ...prev, lots: updatedLots }))
    toast.success("Poste supprimé")
  }

  // Validation et soumission
  const validateStep1 = () => {
    if (!dqe.nom) {
      toast.error("Le nom du DQE est requis")
      return false
    }
    if (!dqe.clientId) {
      toast.error("Veuillez sélectionner un client")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!dqe.lots || dqe.lots.length === 0) {
      toast.error("Ajoutez au moins un lot")
      return false
    }

    for (const lot of dqe.lots) {
      if (!lot.chapitres || lot.chapitres.length === 0) {
        toast.error(`Le lot "${lot.nom}" doit contenir au moins un chapitre`)
        return false
      }

      for (const chapitre of lot.chapitres) {
        if (!chapitre.postes || chapitre.postes.length === 0) {
          toast.error(`Le chapitre "${chapitre.nom}" doit contenir au moins un poste`)
          return false
        }
      }
    }

    return true
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return
    if (currentStep === 2 && !validateStep2()) return
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSaveDraft = async () => {
    if (!validateStep1()) return

    setIsSubmitting(true)
    try {
      // Simuler l'appel API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const savedDqe = {
        ...dqe,
        id:
          dqeId ||
          `DQE-2024-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
        reference:
          dqeId ||
          `DQE-2024-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
        statut: "brouillon" as const,
      }

      toast.success("Brouillon enregistré avec succès")
      onSuccess?.(savedDqe as DQE)
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleValidate = async () => {
    if (!validateStep1() || !validateStep2()) return

    setIsSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const validatedDqe = {
        ...dqe,
        id:
          dqeId ||
          `DQE-2024-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
        reference:
          dqeId ||
          `DQE-2024-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`,
        statut: "validé" as const,
      }

      toast.success("DQE validé avec succès")
      onSuccess?.(validatedDqe as DQE)
    } catch (error) {
      toast.error("Erreur lors de la validation")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Rendu des étapes
  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          Informations générales du DQE
        </CardTitle>
        <CardDescription>Renseignez les informations de base du DQE</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="reference">Référence DQE</Label>
            <Input id="reference" value={dqeId || "DQE-2024-XXX"} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nom">
              Nom du DQE <span className="text-destructive">*</span>
            </Label>
            <Input
              id="nom"
              value={dqe.nom}
              onChange={(e) => setDqe((prev) => ({ ...prev, nom: e.target.value }))}
              placeholder="Ex: Centre Médical Abobo"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={dqe.description}
            onChange={(e) => setDqe((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Description détaillée du projet..."
            rows={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="client">
              Client <span className="text-destructive">*</span>
            </Label>
            <Select
              value={dqe.clientId}
              onValueChange={(value) => {
                const client = clients.find((c) => c.id === value)
                setDqe((prev) => ({
                  ...prev,
                  clientId: value,
                  clientName: client?.nom || "",
                }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client..." />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tva">
              Taux TVA (%) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tva"
              type="number"
              value={dqe.tauxTVA}
              onChange={(e) => setDqe((prev) => ({ ...prev, tauxTVA: Number(e.target.value) }))}
              min="0"
              max="100"
            />
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Les montants seront calculés automatiquement à partir des postes détaillés dans l'étape suivante.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Structure du DQE
          </CardTitle>
          <CardDescription>Organisez votre DQE en lots, chapitres et postes</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={openAddLotDialog} className="mb-4">
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un lot
          </Button>

          {dqe.lots && dqe.lots.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {dqe.lots.map((lot, lotIndex) => (
                <AccordionItem
                  key={lotIndex}
                  value={`lot-${lotIndex}`}
                  className="border rounded-lg bg-blue-50 dark:bg-blue-950/20"
                >
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
                          {lot.code}
                        </Badge>
                        <span className="font-semibold">{lot.nom}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {formatCurrency(lot.totalRevenueHT)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              openEditLotDialog(lot, lotIndex)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteLot(lotIndex)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openAddChapterDialog(lotIndex)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un chapitre
                      </Button>

                      {lot.chapitres && lot.chapitres.length > 0 ? (
                        <Accordion type="multiple" className="space-y-3">
                          {lot.chapitres.map((chapitre, chapterIndex) => (
                            <AccordionItem
                              key={chapterIndex}
                              value={`chapter-${chapterIndex}`}
                              className="border rounded-lg bg-green-50 dark:bg-green-950/20"
                            >
                              <AccordionTrigger className="px-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-3">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                                      {chapitre.code}
                                    </Badge>
                                    <span className="font-medium text-sm">{chapitre.nom}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-green-600 dark:text-green-400">
                                      {formatCurrency(chapitre.totalRevenueHT)}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          openEditChapterDialog(lotIndex, chapitre, chapterIndex)
                                        }}
                                      >
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          deleteChapter(lotIndex, chapterIndex)
                                        }}
                                      >
                                        <Trash2 className="h-3 w-3 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-3 pb-3">
                                <div className="space-y-3 mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openAddPosteDialog(lotIndex, chapterIndex)}
                                  >
                                    <Plus className="mr-2 h-3 w-3" />
                                    Ajouter un poste
                                  </Button>

                                  {chapitre.postes && chapitre.postes.length > 0 ? (
                                    <div className="rounded-lg border bg-white dark:bg-gray-950">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-20">Code</TableHead>
                                            <TableHead>Désignation</TableHead>
                                            <TableHead className="w-16">Unité</TableHead>
                                            <TableHead className="w-24 text-right">Qté</TableHead>
                                            <TableHead className="w-32 text-right">PU HT</TableHead>
                                            <TableHead className="w-32 text-right">Total HT</TableHead>
                                            <TableHead className="w-16"></TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {chapitre.postes.map((poste, posteIndex) => (
                                            <TableRow key={posteIndex}>
                                              <TableCell className="font-mono text-xs">{poste.code}</TableCell>
                                              <TableCell>{poste.designation}</TableCell>
                                              <TableCell className="text-center">{poste.unite}</TableCell>
                                              <TableCell className="text-right">
                                                {poste.quantite.toLocaleString("fr-FR")}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                {formatCurrency(poste.prixUnitaireHT)}
                                              </TableCell>
                                              <TableCell className="text-right font-medium">
                                                {formatCurrency(poste.totalRevenueHT)}
                                              </TableCell>
                                              <TableCell>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={() => deletePoste(lotIndex, chapterIndex, posteIndex)}
                                                >
                                                  <Trash2 className="h-3 w-3 text-destructive" />
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ) : (
                                    <Alert>
                                      <AlertDescription>
                                        Aucun poste ajouté. Cliquez sur "Ajouter un poste" pour commencer.
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <Alert>
                          <AlertDescription>
                            Aucun chapitre ajouté. Cliquez sur "Ajouter un chapitre" pour commencer.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Alert>
              <AlertDescription>
                Aucun lot ajouté. Cliquez sur "Ajouter un lot" pour commencer à structurer votre DQE.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderStep3 = () => {
    const totalLots = dqe.lots?.length || 0
    const totalChapitres = dqe.lots?.reduce((sum, lot) => sum + (lot.chapitres?.length || 0), 0) || 0
    const totalPostes =
      dqe.lots?.reduce((sum, lot) => sum + lot.chapitres.reduce((s, ch) => s + (ch.postes?.length || 0), 0), 0) || 0

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Récapitulatif du DQE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations générales */}
            <div>
              <h3 className="font-semibold mb-3">Informations générales</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Référence :</span>
                  <span className="font-medium">{dqeId || "DQE-2024-XXX"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nom :</span>
                  <span className="font-medium">{dqe.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client :</span>
                  <span className="font-medium">{dqe.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA :</span>
                  <span className="font-medium">{dqe.tauxTVA}%</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Structure */}
            <div>
              <h3 className="font-semibold mb-3">Structure</h3>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">{totalLots}</div>
                    <div className="text-sm text-muted-foreground">Lots</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">{totalChapitres}</div>
                    <div className="text-sm text-muted-foreground">Chapitres</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <ClipboardList className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">{totalPostes}</div>
                    <div className="text-sm text-muted-foreground">Postes</div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            {/* Totaux financiers */}
            <div>
              <h3 className="font-semibold mb-3">Totaux financiers</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span>Total HT</span>
                  <span className="font-semibold">{formatCurrency(dqe.totalRevenueHT || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA ({dqe.tauxTVA}%)</span>
                  <span>{formatCurrency(dqe.montantTVA || 0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-blue-600">
                  <span>Total TTC</span>
                  <span>{formatCurrency(dqe.totalTTC || 0)}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Détail par lot */}
            <div>
              <h3 className="font-semibold mb-3">Détail par lot</h3>
              <Accordion type="single" collapsible className="space-y-2">
                {dqe.lots?.map((lot, index) => (
                  <AccordionItem key={index} value={`recap-lot-${index}`} className="border rounded-lg">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{lot.code}</Badge>
                          <span className="font-medium">{lot.nom}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(lot.totalRevenueHT)}</div>
                          <div className="text-xs text-muted-foreground">{lot.pourcentageTotal.toFixed(1)}%</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Chapitres :</span>
                          <span>{lot.chapitres.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Postes :</span>
                          <span>{lot.chapitres.reduce((sum, ch) => sum + ch.postes.length, 0)}</span>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Vérifiez tous les montants avant validation. Un DQE validé ne pourra plus être modifié.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{mode === "create" ? "Créer un DQE" : "Modifier le DQE"}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer brouillon
          </Button>
          {currentStep === 3 && (
            <Button onClick={handleValidate} disabled={isSubmitting}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Valider DQE
            </Button>
          )}
        </div>
      </div>

      {/* Progression */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                1
              </div>
              <span className={currentStep >= 1 ? "font-medium" : "text-muted-foreground"}>Infos générales</span>
            </div>
            <div className="h-px flex-1 bg-border mx-4" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                2
              </div>
              <span className={currentStep >= 2 ? "font-medium" : "text-muted-foreground"}>Lots & Détails</span>
            </div>
            <div className="h-px flex-1 bg-border mx-4" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                3
              </div>
              <span className={currentStep >= 3 ? "font-medium" : "text-muted-foreground"}>Récapitulatif</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenu */}
      <ScrollArea className="h-[calc(100vh-300px)]">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </ScrollArea>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Précédent
            </Button>
            <Button onClick={handleNext} disabled={currentStep === 3}>
              Suivant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Lot */}
      <Dialog open={isLotDialogOpen} onOpenChange={setIsLotDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLot ? "Modifier le lot" : "Ajouter un lot"}</DialogTitle>
            <DialogDescription>Renseignez les informations du lot</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lot-code">
                Code du lot <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lot-code"
                value={lotForm.code}
                onChange={(e) => setLotForm((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="Ex: LOT 1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot-nom">
                Nom du lot <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lot-nom"
                value={lotForm.nom}
                onChange={(e) => setLotForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: TERRASSEMENTS"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lot-description">Description</Label>
              <Textarea
                id="lot-description"
                value={lotForm.description}
                onChange={(e) => setLotForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du lot..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLotDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveLot}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Chapitre */}
      <Dialog open={isChapterDialogOpen} onOpenChange={setIsChapterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingChapter ? "Modifier le chapitre" : "Ajouter un chapitre"}</DialogTitle>
            <DialogDescription>
              {currentLotIndex !== null && dqe.lots && (
                <Badge variant="secondary" className="mt-2">
                  Parent : {dqe.lots[currentLotIndex].code} - {dqe.lots[currentLotIndex].nom}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chapter-code">
                Code du chapitre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="chapter-code"
                value={chapterForm.code}
                onChange={(e) => setChapterForm((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="Ex: 1.1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-nom">
                Nom du chapitre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="chapter-nom"
                value={chapterForm.nom}
                onChange={(e) => setChapterForm((prev) => ({ ...prev, nom: e.target.value }))}
                placeholder="Ex: Déblais"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter-description">Description</Label>
              <Textarea
                id="chapter-description"
                value={chapterForm.description}
                onChange={(e) => setChapterForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du chapitre..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChapterDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={saveChapter}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Poste */}
      <Dialog open={isPosteDialogOpen} onOpenChange={setIsPosteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un poste</DialogTitle>
            <DialogDescription>
              {currentLotIndex !== null && currentChapterIndex !== null && dqe.lots && (
                <Badge variant="secondary" className="mt-2">
                  Parent : {dqe.lots[currentLotIndex].chapitres[currentChapterIndex].code} -{" "}
                  {dqe.lots[currentLotIndex].chapitres[currentChapterIndex].nom}
                </Badge>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="poste-code">
                  Code du poste <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="poste-code"
                  value={posteForm.code}
                  onChange={(e) => setPosteForm((prev) => ({ ...prev, code: e.target.value }))}
                  placeholder="Ex: 1.1.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poste-unite">
                  Unité <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={posteForm.unite}
                  onValueChange={(value) => setPosteForm((prev) => ({ ...prev, unite: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poste-designation">
                Désignation <span className="text-destructive">*</span>
              </Label>
              <Input
                id="poste-designation"
                value={posteForm.designation}
                onChange={(e) => setPosteForm((prev) => ({ ...prev, designation: e.target.value }))}
                placeholder="Ex: Déblai manuel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="poste-description">Description</Label>
              <Textarea
                id="poste-description"
                value={posteForm.description}
                onChange={(e) => setPosteForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description du poste..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="poste-quantite">
                  Quantité <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="poste-quantite"
                  type="number"
                  value={posteForm.quantite}
                  onChange={(e) => setPosteForm((prev) => ({ ...prev, quantite: Number(e.target.value) }))}
                  placeholder="150.00"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poste-prix">
                  Prix unitaire HT (FCFA) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="poste-prix"
                  type="number"
                  value={posteForm.prixUnitaireHT}
                  onChange={(e) => setPosteForm((prev) => ({ ...prev, prixUnitaireHT: Number(e.target.value) }))}
                  placeholder="2500"
                  step="1"
                  min="0"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total HT</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(posteForm.quantite * posteForm.prixUnitaireHT)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPosteDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={savePoste}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
