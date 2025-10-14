// components/devis/devis-form-modal.tsx
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
import { Plus, Trash2, Calculator, Loader2 } from "lucide-react"
import { CreateDevisRequest, CreateLigneDevisRequest, Devis } from "@/types/devis"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { useClientsList } from "@/hooks/useClients"

interface QuoteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (devis: CreateDevisRequest) => Promise<void>
  devis?: Devis // Pour l'édition
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
  })
  
  const [lignes, setLignes] = useState<LigneFormData[]>([
    { designation: "", description: "", quantite: 1, unite: "U", prixUnitaireHT: 0 },
  ])
 
  const {clients,loading: clientLoading, error: clientError, refreshCliens}=useClientsList()

  // Fonction pour obtenir le client sélectionné
  const getSelectedClient = () => {
    if (formData.clientId > 0 && clients) {
      return clients.find(client => client.id === formData.clientId)
    }
    return null
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
        })

        if (devis.lignes && devis.lignes.length > 0) {
          setLignes(devis.lignes.map(ligne => ({
            designation: ligne.designation,
            description: ligne.description || "",
            quantite: ligne.quantite,
            unite: ligne.unite,
            prixUnitaireHT: ligne.prixUnitaireHT,
          })))
        } else {
          setLignes([{ designation: "", description: "", quantite: 1, unite: "U", prixUnitaireHT: 0 }])
        }
      } else {
        // Mode création - formulaire vide
        setFormData({
          clientId: 0,
          titre: "",
          description: "",
          dateValidite: "",
          conditions: "",
          notes: "",
        })
        setLignes([{ designation: "", description: "", quantite: 1, unite: "U", prixUnitaireHT: 0 }])
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

  const calculateTotals = () => {
    const montantHT = lignes.reduce((sum, ligne) => {
      return sum + (ligne.quantite * ligne.prixUnitaireHT)
    }, 0)
    
    const tauxTVA = 18 // 18% par défaut
    const montantTVA = montantHT * (tauxTVA / 100)
    const montantTTC = montantHT + montantTVA

    return { montantHT, tauxTVA, montantTVA, montantTTC }
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
        description: errors.join(', '),
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
      lignes: lignes.map(ligne => ({
        designation: ligne.designation.trim(),
        description: ligne.description?.trim() || undefined,
        quantite: ligne.quantite,
        unite: ligne.unite,
        prixUnitaireHT: ligne.prixUnitaireHT,
      })),
    }

    try { 
      await onSubmit(devisData)
      // Le parent gère la fermeture de la modal et les messages de succès
    } catch (error) {
      // L'erreur est gérée par le parent ou le hook
    }
  }

  const { montantHT, tauxTVA, montantTVA, montantTTC } = calculateTotals()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] max-w-[98vw] lg:max-w-[96vw] xl:max-w-[94vw] h-[98vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl">
            {isEdit ? `Modifier le devis ${devis?.numero}` : "Nouveau devis"}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {isEdit ? "Modifiez les informations du devis" : "Créez un nouveau devis en remplissant les informations ci-dessous"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            {/* Informations générales */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
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
                            ? "Chargement des clients..." 
                            : clients && clients.length === 0 
                              ? "Aucun client disponible" 
                              : "Sélectionner un client"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {clientLoading ? (
                        <SelectItem value="" disabled>
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Chargement...
                          </div>
                        </SelectItem>
                      ) : clients && clients.length > 0 ? (
                        clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{client.nom}</span>
                              {client.designation && (
                                <span className="text-xs text-muted-foreground">{client.designation}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>
                          Aucun client disponible
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {clientError && (
                    <p className="text-xs text-red-600">Erreur lors du chargement des clients</p>
                  )}
                  {/* Affichage des informations du client sélectionné */}
                  {getSelectedClient() && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                      <div className="text-xs text-blue-800">
                        <div className="font-medium">Client sélectionné:</div>
                        <div className="text-blue-700">
                          {getSelectedClient()?.nom}
                          {getSelectedClient()?.designation && (
                            <span className="text-blue-600"> - {getSelectedClient()?.designation}</span>
                          )}
                        </div>
                        <div className="text-blue-600">
                          {getSelectedClient()?.email} • {getSelectedClient()?.telephone}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

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

                <div className="space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={2}
                    className="text-sm resize-none"
                    placeholder="Description du projet"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lignes du devis */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base sm:text-lg">Éléments du devis</CardTitle>
                <Button type="button" onClick={addLigne} size="sm" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="min-w-[250px] font-medium">Désignation *</TableHead>
                        <TableHead className="w-20 text-center font-medium">Description</TableHead>
                        <TableHead className="w-20 text-center font-medium">Qté *</TableHead>
                        <TableHead className="w-20 text-center font-medium">Unité</TableHead>
                        <TableHead className="w-28 text-right font-medium">Prix unit. (FCFA) *</TableHead>
                        <TableHead className="w-28 text-right font-medium">Total (FCFA)</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lignes.map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell className="p-2">
                            <Input
                              value={ligne.designation}
                              onChange={(e) => handleLigneChange(index, "designation", e.target.value)}
                              placeholder="Ex: Pose fenêtre aluminium"
                              className="text-sm h-8 border-0 focus:ring-1 focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              value={ligne.description || ""}
                              onChange={(e) => handleLigneChange(index, "description", e.target.value)}
                              placeholder="Détails"
                              className="text-sm h-8 border-0 focus:ring-1 focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={ligne.quantite}
                              onChange={(e) =>
                                handleLigneChange(index, "quantite", parseFloat(e.target.value) || 1)
                              }
                              className="text-sm h-8 text-center border-0 focus:ring-1 focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Select 
                              value={ligne.unite} 
                              onValueChange={(value) => handleLigneChange(index, "unite", value)}
                            >
                              <SelectTrigger className="text-sm h-8 border-0 focus:ring-1 focus:ring-primary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="U">Unité</SelectItem>
                                <SelectItem value="m²">m²</SelectItem>
                                <SelectItem value="m³">m³</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="forfait">Forfait</SelectItem>
                                <SelectItem value="h">Heure</SelectItem>
                                <SelectItem value="j">Jour</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="100"
                              value={ligne.prixUnitaireHT}
                              onChange={(e) =>
                                handleLigneChange(index, "prixUnitaireHT", parseFloat(e.target.value) || 0)
                              }
                              placeholder="0"
                              className="text-sm h-8 text-right border-0 focus:ring-1 focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-2 font-medium text-sm text-right">
                            {formatCurrency(ligne.quantite * ligne.prixUnitaireHT)}
                          </TableCell>
                          <TableCell className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLigne(index)}
                              disabled={lignes.length === 1}
                              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Message d'aide */}
                <div className="mt-3 text-xs text-muted-foreground">
                  * Champs obligatoires. Utilisez le bouton "Ajouter" pour créer de nouvelles lignes.
                </div>
              </CardContent>
            </Card>

            {/* Totaux et Notes */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Totaux */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Calculator className="mr-2 h-4 w-4" />
                    Récapitulatif financier
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total HT:</span>
                      <span className="font-medium">{formatCurrency(montantHT)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TVA ({tauxTVA}%):</span>
                      <span className="font-medium">{formatCurrency(montantTVA)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold text-primary">
                        <span>Total TTC:</span>
                        <span>{formatCurrency(montantTTC)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informations supplémentaires */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>• Montants en Francs CFA (XOF)</div>
                    <div>• TVA: Taxe sur la Valeur Ajoutée</div>
                    <div>• TTC: Toutes Taxes Comprises</div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes et Conditions */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Conditions et Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="conditions" className="text-sm font-medium">
                      Conditions générales
                    </Label>
                    <Textarea
                      id="conditions"
                      value={formData.conditions}
                      onChange={(e) => handleInputChange("conditions", e.target.value)}
                      placeholder="Ex: Acompte de 30% à la commande, solde à la livraison..."
                      rows={3}
                      className="text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-sm font-medium">
                      Notes internes
                    </Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Notes privées non visibles sur le devis final..."
                      rows={2}
                      className="text-sm resize-none"
                    />
                    <div className="text-xs text-muted-foreground">
                      Ces notes ne seront pas affichées sur le devis client
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </div>

        {/* Footer avec boutons d'action */}
        <div className="flex-shrink-0 border-t bg-gray-50/50 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Informations de validation */}
            <div className="text-xs text-muted-foreground">
              {isEdit ? "Modifiez les informations puis cliquez sur Modifier" : "Vérifiez toutes les informations avant de créer le devis"}
            </div>
            
            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="sm:w-auto"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="sm:w-auto" 
                onClick={handleSubmit}
                disabled={loading || clientLoading || !formData.titre.trim() || formData.clientId === 0 || (!clients || clients.length === 0)}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? "Modification en cours..." : "Création en cours..."}
                  </>
                ) : (
                  <>
                    {isEdit ? "Modifier le devis" : "Créer le devis"}
                    {montantTTC > 0 && (
                      <span className="ml-2 text-xs">
                        ({formatCurrency(montantTTC)})
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