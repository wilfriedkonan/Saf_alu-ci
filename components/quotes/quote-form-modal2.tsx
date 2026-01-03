// components/quotes/quote-form-modal2.tsx
// ✅ DEVIS CLASSIQUE - Compatible avec la base de données + Remises intégrées
// ✅ CORRECTION: Gestion correcte du type Devis (pas de propriété lignes directe)
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
import { Plus, Trash2, Calculator, Loader2, Percent, Tag } from "lucide-react"
import { CreateDevisRequest, Devis } from "@/types/devis"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { useClientsList } from "@/hooks/useClients"

interface QuoteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (devis: CreateDevisRequest) => Promise<void>
  devis?: Devis
  loading?: boolean
}

interface LigneFormData {
  designation: string
  description?: string
  quantite: number
  unite: string
  prixUnitaireHT: number
}

export function QuoteFormModal({ open, onOpenChange, onSubmit, devis, loading = false }: QuoteFormModalProps) {
  const { user } = useAuth()
  const isEdit = !!devis

  const [formData, setFormData] = useState({
    clientId: 0,
    titre: "",
    description: "",
    dateValidite: "",
    conditions: "",
    notes: "",
    chantier: "",
    contact: "",
  })
  
  const [lignes, setLignes] = useState<LigneFormData[]>([
    { designation: "", description: "", quantite: 1, unite: "U", prixUnitaireHT: 0 },
  ])

  // ✅ États pour les remises
  const [remiseValeur, setRemiseValeur] = useState(0)
  const [remisePourcentage, setRemisePourcentage] = useState(0)
 
  const { clients, loading: clientLoading, error: clientError, refreshCliens } = useClientsList()

  const getSelectedClient = () => {
    if (formData.clientId > 0 && clients) {
      return clients.find(client => client.id === formData.clientId)
    }
    return null
  }

  // Réinitialiser le formulaire
  useEffect(() => {
    if (open) {
      if (isEdit && devis) {
        // Mode édition
        setFormData({
          clientId: devis.clientId,
          titre: devis.titre,
          description: devis.description || "",
          dateValidite: devis.dateValidite ? devis.dateValidite.split('T')[0] : "",
          conditions: devis.conditions || "",
          notes: devis.notes || "",
          chantier: devis.chantier || "",
          contact: devis.contact || "",
        })

        // ✅ Charger les remises
        setRemiseValeur(devis.remiseValeur || 0)
        setRemisePourcentage(devis.remisePourcentage || 0)

        // ✅ CORRECTION: Charger les lignes UNIQUEMENT depuis sections
        if (devis.sections && devis.sections.length > 0) {
          // Extraire toutes les lignes de toutes les sections
          const allLignes: LigneFormData[] = []
          devis.sections.forEach(section => {
            if (section.lignes && section.lignes.length > 0) {
              section.lignes.forEach(ligne => {
                allLignes.push({
                  designation: ligne.designation || ligne.typeElement || "",
                  description: ligne.description || "",
                  quantite: ligne.quantite,
                  unite: ligne.unite,
                  prixUnitaireHT: ligne.prixUnitaireHT,
                })
              })
            }
          })
          setLignes(allLignes.length > 0 ? allLignes : [{ designation: "", description: "", quantite: 1, unite: "U", prixUnitaireHT: 0 }])
        } else {
          // Pas de sections, ligne par défaut
          setLignes([{ designation: "", description: "", quantite: 1, unite: "U", prixUnitaireHT: 0 }])
        }
      } else {
        // Mode création
        setFormData({
          clientId: 0,
          titre: "",
          description: "",
          dateValidite: "",
          conditions: "",
          notes: "",
          chantier: "",
          contact: "",
        })
        setLignes([{ designation: "", description: "", quantite: 1, unite: "U", prixUnitaireHT: 0 }])
        setRemiseValeur(0)
        setRemisePourcentage(0)
      }
    }
  }, [open, isEdit, devis])

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLigneChange = (index: number, field: keyof LigneFormData, value: string | number) => {
    setLignes(prev => prev.map((ligne, i) => 
      i === index ? { ...ligne, [field]: value } : ligne
    ))
  }

  const addLigne = () => {
    setLignes(prev => [...prev, { 
      designation: "", 
      description: "", 
      quantite: 1, 
      unite: "U", 
      prixUnitaireHT: 0 
    }])
  }

  const removeLigne = (index: number) => {
    if (lignes.length > 1) {
      setLignes(prev => prev.filter((_, i) => i !== index))
    }
  }

  // ✅ Fonction de calcul avec remises
  const calculateTotals = () => {
    // 1. Calculer le montant HT brut
    const montantHTBrut = lignes.reduce((sum, ligne) => {
      return sum + (ligne.quantite * ligne.prixUnitaireHT)
    }, 0)

    // 2. Appliquer la remise en pourcentage
    const montantRemisePourcentage = montantHTBrut * (remisePourcentage / 100)
    const montantApresRemisePourcentage = montantHTBrut - montantRemisePourcentage

    // 3. Appliquer la remise en valeur
    const montantHTNet = Math.max(0, montantApresRemisePourcentage - remiseValeur)

    // 4. Calculer le total de la remise
    const montantRemiseTotal = montantHTBrut - montantHTNet

    // 5. Calculer TVA et TTC
    const tauxTVA = 18
    const montantTVA = montantHTNet * (tauxTVA / 100)
    const montantTTC = montantHTNet + montantTVA

    return { 
      montantHTBrut,
      montantRemiseTotal,
      montantHT: montantHTNet,
      tauxTVA, 
      montantTVA, 
      montantTTC 
    }
  }

  const validateForm = () => {
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

    if (lignes.length === 0) {
      errors.push('Au moins une ligne est requise')
    }

    lignes.forEach((ligne, index) => {
      if (!ligne.designation.trim()) {
        errors.push(`Ligne ${index + 1}: La désignation est requise`)
      }
      if (ligne.quantite <= 0) {
        errors.push(`Ligne ${index + 1}: La quantité doit être supérieure à 0`)
      }
      if (ligne.prixUnitaireHT < 0) {
        errors.push(`Ligne ${index + 1}: Le prix unitaire ne peut pas être négatif`)
      }
    })

    // ✅ Validation des remises
    if (remisePourcentage < 0 || remisePourcentage > 100) {
      errors.push('La remise en pourcentage doit être entre 0 et 100')
    }

    if (remiseValeur < 0) {
      errors.push('La remise en valeur ne peut pas être négative')
    }

    const { montantHTBrut } = calculateTotals()
    if (remiseValeur + (montantHTBrut * remisePourcentage / 100) > montantHTBrut) {
      errors.push('Le montant total des remises ne peut pas dépasser le montant HT brut')
    }

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

    // ✅ Structure compatible: Créer une section unique avec toutes les lignes
    const devisData: CreateDevisRequest = {
      clientId: formData.clientId,
      titre: formData.titre.trim(),
      description: formData.description.trim() || undefined,
      dateValidite: formData.dateValidite || undefined,
      conditions: formData.conditions.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      chantier: formData.chantier.trim() || undefined,
      contact: formData.contact.trim() || undefined,
      
      // ✅ Remises
      remiseValeur: remiseValeur > 0 ? remiseValeur : undefined,
      remisePourcentage: remisePourcentage > 0 ? remisePourcentage : undefined,

      // ✅ Structure compatible: 1 section avec toutes les lignes
      sections: [{
        nom: "Devis Classique",
        ordre: 1,
        description: undefined,
        lignes: lignes.map((ligne) => ({
          typeElement: undefined,
          designation: ligne.designation.trim(),
          description: ligne.description?.trim() || undefined,
          longueur: undefined,
          hauteur: undefined,
          quantite: ligne.quantite,
          unite: ligne.unite,
          prixUnitaireHT: ligne.prixUnitaireHT,
        })),
      }],
    }

    try { 
      await onSubmit(devisData)
    } catch (error) {
      // L'erreur est gérée par le parent
    }
  }

  const { montantHTBrut, montantRemiseTotal, montantHT, tauxTVA, montantTVA, montantTTC } = calculateTotals()
  const hasRemise = remiseValeur > 0 || remisePourcentage > 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace(/\s/g, ' ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] lg:max-w-[96vw] xl:max-w-[94vw] h-[98vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            {isEdit ? `Modifier le devis ${devis?.numero}` : "Nouveau devis classique"}
            <span className="text-xs font-normal text-muted-foreground">(Format simplifié)</span>
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isEdit ? "Modifiez les informations du devis" : "Créez un devis rapide avec liste simple de lignes"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="py-4">
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="lignes">Lignes</TabsTrigger>
                <TabsTrigger value="remise">💰 Remises</TabsTrigger>
                <TabsTrigger value="recap">Récapitulatif</TabsTrigger>
              </TabsList>

              {/* TAB GÉNÉRAL */}
              <TabsContent value="general" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 grid gap-3 grid-cols-1 sm:grid-cols-2">
                    {/* Client */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="clientId" className="text-sm font-medium">
                          Client *
                        </Label>
                        {clientError && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={refreshCliens}
                            className="text-xs h-6 px-2"
                          >
                            🔄 Rafraîchir
                          </Button>
                        )}
                      </div>
                      <Select
                        value={formData.clientId > 0 ? formData.clientId.toString() : ""}
                        onValueChange={(value) => handleInputChange("clientId", parseInt(value) || 0)}
                        disabled={clientLoading}
                      >
                        <SelectTrigger className="text-sm h-9">
                          <SelectValue 
                            placeholder={
                              clientLoading 
                                ? "Chargement..." 
                                : clients && clients.length === 0 
                                  ? "Aucun client" 
                                  : "Sélectionner"
                            } 
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {clientLoading ? (
                            <SelectItem value="" disabled>
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </SelectItem>
                          ) : clients && clients.length > 0 ? (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.nom}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="" disabled>Aucun client</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Titre */}
                    <div className="space-y-1.5">
                      <Label htmlFor="titre" className="text-sm font-medium">
                        Titre du projet *
                      </Label>
                      <Input
                        id="titre"
                        value={formData.titre}
                        onChange={(e) => handleInputChange("titre", e.target.value)}
                        className="text-sm h-9"
                        placeholder="Titre du devis"
                      />
                    </div>

                    {/* Date validité */}
                    <div className="space-y-1.5">
                      <Label htmlFor="dateValidite" className="text-sm font-medium">
                        Valide jusqu'au
                      </Label>
                      <Input
                        id="dateValidite"
                        type="date"
                        value={formData.dateValidite}
                        onChange={(e) => handleInputChange("dateValidite", e.target.value)}
                        className="text-sm h-9"
                      />
                    </div>

                    {/* Chantier */}
                    <div className="space-y-1.5">
                      <Label htmlFor="chantier" className="text-sm font-medium">
                        Chantier
                      </Label>
                      <Input
                        id="chantier"
                        value={formData.chantier}
                        onChange={(e) => handleInputChange("chantier", e.target.value)}
                        className="text-sm h-9"
                        placeholder="Lieu du chantier"
                      />
                    </div>

                    {/* Contact */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="contact" className="text-sm font-medium">
                        Contact projet
                      </Label>
                      <Input
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => handleInputChange("contact", e.target.value)}
                        className="text-sm h-9"
                        placeholder="Nom et coordonnées du contact"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="description" className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        placeholder="Description générale du projet..."
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB LIGNES */}
              <TabsContent value="lignes" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-base sm:text-lg">
                      Lignes du devis ({lignes.length})
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLigne}
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Ajouter
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Désignation *</TableHead>
                            <TableHead className="w-[20%]">Quantité *</TableHead>
                            <TableHead className="w-[15%]">Unité</TableHead>
                            <TableHead className="w-[20%]">Prix Unit. HT *</TableHead>
                            <TableHead className="w-[5%]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lignes.map((ligne, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Input
                                  value={ligne.designation}
                                  onChange={(e) => handleLigneChange(index, "designation", e.target.value)}
                                  placeholder="Désignation"
                                  className="text-sm h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={ligne.quantite}
                                  onChange={(e) => handleLigneChange(index, "quantite", parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  className="text-sm h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={ligne.unite}
                                  onValueChange={(value) => handleLigneChange(index, "unite", value)}
                                >
                                  <SelectTrigger className="text-sm h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="U">Unité</SelectItem>
                                    <SelectItem value="m">Mètre</SelectItem>
                                    <SelectItem value="m²">m²</SelectItem>
                                    <SelectItem value="ml">ml</SelectItem>
                                    <SelectItem value="Ens">Ensemble</SelectItem>
                                    <SelectItem value="FF">Forfait</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={ligne.prixUnitaireHT}
                                  onChange={(e) => handleLigneChange(index, "prixUnitaireHT", parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="100"
                                  className="text-sm h-8"
                                />
                              </TableCell>
                              <TableCell>
                                {lignes.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeLigne(index)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ✅ TAB REMISES */}
              <TabsContent value="remise" className="space-y-4 mt-4">
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Remises commerciales</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-4">
                    {/* Montant HT brut */}
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Montant HT brut</span>
                      <span className="text-lg font-bold">{formatCurrency(montantHTBrut)} FCFA</span>
                    </div>

                    {/* Remise pourcentage */}
                    <div className="space-y-2">
                      <Label htmlFor="remisePourcentage">Remise en pourcentage (%)</Label>
                      <Input
                        id="remisePourcentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={remisePourcentage}
                        onChange={(e) => setRemisePourcentage(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    {/* Remise valeur */}
                    <div className="space-y-2">
                      <Label htmlFor="remiseValeur">Remise forfaitaire (FCFA)</Label>
                      <Input
                        id="remiseValeur"
                        type="number"
                        min="0"
                        step="1000"
                        value={remiseValeur}
                        onChange={(e) => setRemiseValeur(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    {/* Boutons remise rapide */}
                    {!hasRemise && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Remises rapides:</Label>
                        <div className="flex gap-2">
                          {[5, 10, 15, 20].map(percent => (
                            <Button
                              key={percent}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setRemisePourcentage(percent)}
                              className="flex-1"
                            >
                              {percent}%
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Aperçu */}
                    {hasRemise && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Montant HT brut:</span>
                          <span className="font-medium">{formatCurrency(montantHTBrut)} FCFA</span>
                        </div>
                        {remisePourcentage > 0 && (
                          <div className="flex justify-between text-sm text-green-700">
                            <span className="flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              Remise {remisePourcentage}%:
                            </span>
                            <span>-{formatCurrency(montantHTBrut * (remisePourcentage / 100))} FCFA</span>
                          </div>
                        )}
                        {remiseValeur > 0 && (
                          <div className="flex justify-between text-sm text-green-700">
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              Remise forfaitaire:
                            </span>
                            <span>-{formatCurrency(remiseValeur)} FCFA</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-semibold text-green-700 border-t pt-2">
                          <span>Remise totale:</span>
                          <span>-{formatCurrency(montantRemiseTotal)} FCFA</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Montant HT net:</span>
                          <span className="text-lg">{formatCurrency(montantHT)} FCFA</span>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRemiseValeur(0)
                            setRemisePourcentage(0)
                          }}
                          className="w-full mt-2"
                        >
                          Supprimer les remises
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB RÉCAPITULATIF */}
              <TabsContent value="recap" className="space-y-4 mt-4">
                {/* Résumé */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Résumé du devis</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-muted-foreground">Client:</div>
                      <div className="font-medium">{getSelectedClient()?.nom || "Non sélectionné"}</div>
                      
                      <div className="text-muted-foreground">Titre:</div>
                      <div className="font-medium">{formData.titre || "Non renseigné"}</div>
                      
                      <div className="text-muted-foreground">Nombre de lignes:</div>
                      <div className="font-medium">{lignes.length}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Totaux */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Montants</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                      {hasRemise && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Montant HT brut:</span>
                          <span className="line-through">{formatCurrency(montantHTBrut)} FCFA</span>
                        </div>
                      )}
                      
                      {remisePourcentage > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Remise {remisePourcentage}%:</span>
                          <span>-{formatCurrency(montantHTBrut * (remisePourcentage / 100))} FCFA</span>
                        </div>
                      )}
                      
                      {remiseValeur > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Remise forfaitaire:</span>
                          <span>-{formatCurrency(remiseValeur)} FCFA</span>
                        </div>
                      )}
                      
                      {hasRemise && (
                        <div className="flex justify-between text-sm font-semibold text-green-600 border-t pt-2">
                          <span>Remise totale:</span>
                          <span>-{formatCurrency(montantRemiseTotal)} FCFA</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span>{hasRemise ? "Montant HT net:" : "Sous-total HT:"}</span>
                        <span className="font-medium">{formatCurrency(montantHT)} FCFA</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span>TVA ({tauxTVA}%):</span>
                        <span className="font-medium">{formatCurrency(montantTVA)} FCFA</span>
                      </div>
                      
                      <div className="border-t pt-2">
                        <div className="flex justify-between text-lg font-bold text-primary">
                          <span>Total TTC:</span>
                          <span>{formatCurrency(montantTTC)} FCFA</span>
                        </div>
                      </div>

                      {hasRemise && (
                        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                          <div className="text-sm font-medium text-green-700">
                            💰 Économie: {formatCurrency(montantRemiseTotal)} FCFA
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Conditions et notes */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg">Conditions et Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="conditions">Conditions générales</Label>
                      <Textarea
                        id="conditions"
                        value={formData.conditions}
                        onChange={(e) => handleInputChange("conditions", e.target.value)}
                        placeholder="Ex: Acompte 30%, solde à la livraison..."
                        rows={3}
                        className="text-sm resize-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="notes">Notes internes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Notes privées..."
                        rows={2}
                        className="text-sm resize-none"
                      />
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
              Total: {formatCurrency(montantTTC)} FCFA
              {hasRemise && (
                <span className="text-green-600">(Économie: {formatCurrency(montantRemiseTotal)} FCFA)</span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={loading || clientLoading || !formData.titre.trim() || formData.clientId === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Modification..." : "Création..."}
                  </>
                ) : (
                  <>
                    {isEdit ? "Modifier" : "Créer le devis"}
                    {montantTTC > 0 && (
                      <span className="ml-2 text-xs">
                        ({formatCurrency(montantTTC)} FCFA)
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}