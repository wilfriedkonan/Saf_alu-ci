"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Plus, Trash2, UserPlus } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { InvoiceType, LigneFacture, Echeancier, Facture } from "@/types/invoices"

import type { CreateFactureRequest } from "@/types/invoices"
import { useClientActions, useClientsList } from "@/hooks/useClients"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { Client } from "@/types/clients"
import { ClientFormModal } from "@/components/clients/client-form-modal"
import { toast } from "../ui/use-toast"

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (invoice: CreateFactureRequest) => void
  facture?: Facture // Pour l'édition
  loading?: boolean
}

export function InvoiceFormModal({ isOpen, onClose, onSubmit, facture, loading=false }: InvoiceFormModalProps) {
  const isEdit = !!facture

  const [formData, setFormData] = useState({
    type: "Facture_Client" as InvoiceType,
    clientName: "",
    clientId: 0,
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    projectTitle: "",
    description: "",
    taxRate: 18,
    notes: "",
    titre: "",
  })

  const [items, setItems] = useState<LigneFacture[]>([
    { id: 1, factureId: 1, ordre: 1, designation: "", description: "", quantite: 1, unite: "unité", prixUnitaireHT: 0, totalHT: 0 },
  ])

  const [paymentSchedule, setPaymentSchedule] = useState<Echeancier[]>([
    { id: 1, factureId: 1, ordre: 1, description: "Paiement unique", montantTTC: 0, dateEcheance: "", statut: "EnAttente" },
  ])
  const [clientSearchOpen, setClientSearchOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [dueDate, setDueDate] = useState<Date>()

  //hook presonnalisé 
  const { clients, loading: clientLoading, error: clientError, refreshCliens } = useClientsList();
  const {createClient} = useClientActions()

  // Fonction pour obtenir le client sélectionné
  const getSelectedClient = () => {
    if (formData.clientId > 0 && clients) {
      return clients.find(client => client.id === formData.clientId)
    }
    return null
  }
   // Réinitialiser le formulaire quand la modal s'ouvre
   useEffect(() => {
    if (isOpen) {
      if (isEdit && facture) {
        // Mode édition - charger les données du devis
        setFormData({
          type: facture.typeFacture,
          clientId: facture.clientId,
          clientName: facture.detailDebiteur.nom,
          clientEmail: facture.detailDebiteur?.email || "",
          clientAddress: facture.detailDebiteur?.adresse,
          clientPhone: facture.detailDebiteur?.telephone || "",
          projectTitle: facture.titre || "",
          description: facture.description || "", 
          taxRate: facture.tauxTVA,
          notes: facture.conditionsPaiement || "",
          titre: facture.titre || "",
        })

        if (facture.lignes && facture.lignes.length > 0) {
          setItems(facture.lignes.map(ligne => ({
            id: ligne.id,
            factureId :ligne.factureId,
            ordre: ligne.ordre,
            designation: ligne.designation,
            description: ligne.description || "",
            quantite: ligne.quantite,
            unite: ligne.unite,
            prixUnitaireHT: ligne.prixUnitaireHT,
            totalHT : ligne.totalHT
          })))
        } 
        if(facture.echeanciers && facture.echeanciers.length > 0){
          setPaymentSchedule(facture.echeanciers.map(echancier=>({
            id:echancier.id,
            factureId: echancier.factureId,
            ordre: echancier.ordre,
            description: echancier.description,
            montantTTC: echancier.montantTTC,
            dateEcheance: echancier.dateEcheance ? echancier.dateEcheance.split('T')[0] : "",
            statut: echancier.statut
          })))
          
        }
      } else {
        // Mode création - formulaire vide
        setFormData({
    type: "Facture_Client" as InvoiceType,
    clientName: "",
    clientId: 0,
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    projectTitle: "",
    description: "",
    taxRate: 18,
    notes: "",
    titre: "",
        })
        setItems([{  id: 1, factureId: 1, ordre: 1, designation: "", description: "", quantite: 1, unite: "unité", prixUnitaireHT: 0, totalHT: 0 }]),
        setPaymentSchedule([{id: 1, factureId: 1, ordre: 1, description: "Paiement unique", montantTTC: 0, dateEcheance: "", statut: "EnAttente"}])
      }
    }
  }, [isOpen, isEdit, facture])

  const addItem = () => {
    const newItem: LigneFacture = {
      id: Date.now(), // Utiliser un ID unique basé sur le timestamp
      designation: "",
      description: "",
      quantite: 1,
      unite: "unité",
      prixUnitaireHT: 0,
      totalHT: 0,
      factureId: 1,
      ordre: items.length + 1,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: number, field: keyof LigneFacture, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantite" || field === "prixUnitaireHT") {
            updatedItem.totalHT = updatedItem.quantite * updatedItem.prixUnitaireHT
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const addPayment = () => {
    const newPayment: Echeancier = {
      id: Date.now(), // Utiliser un ID unique basé sur le timestamp
      description: "",
      montantTTC: 0,
      dateEcheance: "",
      statut: "EnAttente",
      factureId: 1,
      ordre: paymentSchedule.length + 1,
    }
    setPaymentSchedule([...paymentSchedule, newPayment])
  }

  const removePayment = (id: number) => {
    setPaymentSchedule(paymentSchedule.filter((payment) => payment.id !== id))
  }

  const updatePayment = (id: number, field: keyof Echeancier, value: any) => {
    setPaymentSchedule(paymentSchedule.map((payment) => (payment.id === id ? { ...payment, [field]: value } : payment)))
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalHT, 0)
  const taxAmount = subtotal * (formData.taxRate / 100)
  const total = subtotal + taxAmount
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleClientSelect = (client: Client) => {
    setFormData({
      ...formData,
      clientId: client.id,
      clientName: client.nom,
      clientEmail: client.email,
      clientPhone: client.telephone,
      clientAddress: `${client.adresse}, ${client.ville}`,
    })
    setClientSearchOpen(false)
  }
// Gestionnaire création
  const handleNewClient = async(newClient: any) => {
    const response = await createClient(newClient)
    toast({
      title:  "Client créé",
      description: response.message || ("Le Client a été créé avec succès"),
    })
    // Rafraîchir la liste des clients après création
    refreshCliens()
    handleClientSelect(response.data as Client)
    // Fermer le modal
    setIsClientModalOpen(false)
    // Note: Le nouveau client sera automatiquement disponible après le refresh
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Format des données selon l'API
    const invoiceData = {
      typeFacture: formData.type,
      clientId: formData.clientId || undefined,
      sousTraitantId: undefined,
      devisId: undefined,
      projetId: undefined,
      titre: formData.titre,
      description: formData.description || "",
      dateFacture: new Date().toISOString(),
      dateEcheance: dueDate ? dueDate.toISOString() : new Date().toISOString(),
      conditionsPaiement: formData.notes || "",
      referenceClient: formData.clientName || "",
      lignes: items.map(item => ({
        designation: item.designation || item.description || "",
        description: item.description || "",
        quantite: item.quantite,
        unite: item.unite,
        prixUnitaireHT: item.prixUnitaireHT
      })),
      echeanciers: paymentSchedule.map(payment => ({
        description: payment.description || "",
        montantTTC: payment.montantTTC,
        dateEcheance: payment.dateEcheance ? new Date(payment.dateEcheance).toISOString() : new Date().toISOString()
      }))
    }

    onSubmit(invoiceData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-[98vw] lg:max-w-[96vw] xl:max-w-[94vw] h-[98vh] flex flex-col p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">Nouvelle Facture</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-50 hover:scrollbar-thumb-blue-500 dark:scrollbar-thumb-blue-600 dark:scrollbar-track-blue-900/20 dark:hover:scrollbar-thumb-blue-500">
            <form onSubmit={handleSubmit} className="space-y-6 pb-4">
              {/* Type et informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Type de facture</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: InvoiceType) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Facture_Client">Facture client</SelectItem>
                          <SelectItem value="SousTraitant">Facture sous-traitant</SelectItem>
                          <SelectItem value="Avoir">Avoir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="projectTitle">Titre du projet</Label>
                      <Input
                        id="projectTitle"
                        value={formData.titre}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="dueDate">Date d'échéance</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !dueDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Informations client */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations client</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="clientName">Sélectionner un client</Label>
                        <div className="flex gap-2">
                          <Popover open={clientSearchOpen} onOpenChange={setClientSearchOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={clientSearchOpen}
                                className="flex-1 justify-between bg-transparent"
                              >
                                {formData.clientName || "Rechercher un client..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[400px] p-0">
                              <Command>
                                <CommandInput placeholder="Rechercher un client..." />
                                <CommandList>
                                  <CommandEmpty>Aucun client trouvé.</CommandEmpty>
                                  <CommandGroup>
                                    {clients.map((client) => (
                                      <CommandItem
                                        key={client.id}
                                        value={`${client.nom} ${client.telephone || ""} ${client.email}`}
                                        onSelect={() => handleClientSelect(client)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            getSelectedClient()?.id === client.id ? "opacity-100" : "opacity-0",
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span className="font-medium">{client.nom }</span>
                                          <span className="text-xs text-muted-foreground">
                                            {client.email} • {client.telephone}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setIsClientModalOpen(true)}
                            title="Ajouter un nouveau client"
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="clientEmail">Email</Label>
                        <Input
                          id="clientEmail"
                          type="email"
                          value={formData.clientEmail}
                          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="clientPhone">Téléphone</Label>
                        <Input
                          id="clientPhone"
                          value={formData.clientPhone}
                          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="taxRate">TVA (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          value={formData.taxRate}
                          onChange={(e) =>
                            setFormData({ ...formData, taxRate: Number.parseFloat(e.target.value) || 0 })
                          }
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                    </div>

                    {getSelectedClient() && (
                      <div className="mt-4">
                        <Label htmlFor="clientAddress">Adresse</Label>
                        <div className="text-blue-700">
                          {getSelectedClient()?.adresse}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {/* Éléments de facturation */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Éléments de facturation</CardTitle>
                  <Button type="button" onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un élément
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                        <div className="md:col-span-4">
                          <Label>Désignation</Label>
                          <Input
                            value={item.designation}
                            onChange={(e) => updateItem(item.id, "designation", e.target.value)}
                            placeholder="Désignation de l'élément"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Quantité</Label>
                          <Input
                            type="number"
                            value={item.quantite}
                            onChange={(e) => updateItem(item.id, "quantite", Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Unité</Label>
                          <Input
                            value={item.unite}
                            onChange={(e) => updateItem(item.id, "unite", e.target.value)}
                            placeholder="m², h, forfait..."
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Prix unitaire (FCFA)</Label>
                          <Input
                            type="number"
                            value={item.prixUnitaireHT}
                            onChange={(e) => updateItem(item.id, "prixUnitaireHT", Number.parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div className="md:col-span-1 flex items-end">
                          <Badge variant="outline" className="w-full justify-center">
                            {item.totalHT.toLocaleString()} FCFA
                          </Badge>
                        </div>

                        <div className="md:col-span-1 flex items-end">
                          {items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Échéancier de paiement */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Échéancier de paiement</CardTitle>
                  <Button type="button" onClick={addPayment} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un paiement
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentSchedule.map((payment) => (
                      <div key={payment.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={payment.description}
                            onChange={(e) => updatePayment(payment.id, "description", e.target.value)}
                            placeholder="Acompte, solde..."
                            required
                          />
                        </div>

                        <div>
                          <Label>Montant (FCFA)</Label>
                          <Input
                            type="number"
                            value={payment.montantTTC}
                            onChange={(e) =>
                              updatePayment(payment.id, "montantTTC", Number.parseFloat(e.target.value) || 0)
                            }
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>

                        <div>
                          <Label>Date d'échéance</Label>
                          <Input
                            type="date"
                            value={payment.dateEcheance}
                            onChange={(e) => updatePayment(payment.id, "dateEcheance", e.target.value)}
                            required
                          />
                        </div>

                        <div className="flex items-end">
                          {paymentSchedule.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removePayment(payment.id)}
                              className="w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Totaux et notes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Totaux</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Sous-total:</span>
                      <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>TVA ({formData.taxRate}%):</span>
                      <span className="font-medium">{taxAmount.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{total.toLocaleString()} FCFA</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notes additionnelles..."
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </div>
            </form>
          </div>

          <div className="border-t px-6 py-4 flex justify-end space-x-3 flex-shrink-0 bg-background">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              {loading ? (
                <> 
                <Loader2 className="mr-2 h-4 w4 animate-spin"/>
                { isEdit? "Modification en cours..." : "Création en cours..."}
             </> )
             : (
              <> {isEdit? "Modifier la facture" : "Creer une facture"}
               {total > 0 && (
                      <span className="ml-2 text-xs">
                        ({formatCurrency(total)})
                      </span>
                    )}
              </>
             )}
             
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Modal de création client */}
      <ClientFormModal
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
        onSubmit={handleNewClient}
      />
    </Dialog>
  )
}
