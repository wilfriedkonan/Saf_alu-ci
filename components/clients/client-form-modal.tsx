"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client } from "@/types/clients"

interface ClientFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (client: Partial<Client>) => void
  client?: Client
}

export function ClientFormModal({ open, onOpenChange, onSubmit, client }: ClientFormModalProps) {
  const [formData, setFormData] = useState<Partial<Client>>({
    nom: "",
    designation: "",
    raisonSociale: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    typeClient: "particulier",
    ncc: "",
    status: "Prospect",
  })

  useEffect(() => {
    if (client) {
      setFormData(client)
    } else {
      // Réinitialiser pour un nouveau client
      setFormData({
        nom: "",
        designation: "",
        raisonSociale: "",
        email: "",
        telephone: "",
        adresse: "",
        ville: "",
        typeClient: "particulier",
        ncc: "",
        status: "Prospect",
      })
    }
  }, [client, open])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw] 2xl:max-w-[75vw] max-h-[98vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{client ? "Modifier le client" : "Nouveau client"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-1 space-y-6 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-100 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-blue-600">
            {/* Type de client */}
            <div className="space-y-2">
              <Label htmlFor="type">Type de client *</Label>
              <Select
                value={formData.typeClient}
                onValueChange={(value: "particulier" | "entreprise") => setFormData({ ...formData, typeClient: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="particulier">Particulier</SelectItem>
                  <SelectItem value="entreprise">Entreprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Informations principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
              <div className="space-y-2 sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
                <Label htmlFor="name">Nom complet / Raison sociale *</Label>
                <Input
                  id="name"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
                <Label htmlFor="raisonSociale">Raison sociale *</Label>
                <Input
                  id="raisonSociale"
                  value={formData.raisonSociale}
                  onChange={(e) => setFormData({ ...formData, raisonSociale: e.target.value })}
                  required
                />
              </div>

              {formData.typeClient === "entreprise" && (
                <div className="space-y-2 sm:col-span-2 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
                  <Label htmlFor="company">Nom commercial</Label>
                  <Input
                    id="company"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2 sm:col-span-1 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-1 lg:col-span-1 xl:col-span-2 2xl:col-span-3">
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Informations entreprise */}
            {formData.typeClient === "entreprise" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siret">NCC</Label>
                  <Input
                    id="Ncc"
                    value={formData.ncc}
                    onChange={(e) => setFormData({ ...formData, ncc: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select
                    value={formData.status ?formData.status : undefined}
                    onValueChange={(value: "actif" | "inactif" | "Prospect") =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="actif">Actif</SelectItem>
                      <SelectItem value="inactif">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Adresse */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t flex-shrink-0 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">{client ? "Enregistrer" : "Créer le client"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
