"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Calculator } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import type { Quote, QuoteItem } from "@/lib/quotes"

interface QuoteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (quote: Omit<Quote, "id" | "createdAt" | "updatedAt">) => void
}

export function QuoteFormModal({ open, onOpenChange, onSubmit }: QuoteFormModalProps) {
  const user = getCurrentUser()
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    projectTitle: "",
    description: "",
    validUntil: "",
    taxRate: 18,
    notes: "",
  })

  const [items, setItems] = useState<Omit<QuoteItem, "id" | "total">[]>([
    { description: "", quantity: 1, unit: "m²", unitPrice: 0 },
  ])

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, field: keyof Omit<QuoteItem, "id" | "total">, value: string | number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const addItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit: "m²", unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const calculateTotals = () => {
    const itemsWithTotals: QuoteItem[] = items.map((item, index) => ({
      ...item,
      id: (index + 1).toString(),
      total: item.quantity * item.unitPrice,
    }))

    const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = subtotal * (formData.taxRate / 100)
    const total = subtotal + taxAmount

    return { itemsWithTotals, subtotal, taxAmount, total }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const { itemsWithTotals, subtotal, taxAmount, total } = calculateTotals()

    // Generate quote number
    const quoteNumber = `DEV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`

    const newQuote: Omit<Quote, "id" | "createdAt" | "updatedAt"> = {
      number: quoteNumber,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      projectTitle: formData.projectTitle,
      description: formData.description,
      items: itemsWithTotals,
      subtotal,
      taxRate: formData.taxRate,
      taxAmount,
      total,
      status: "brouillon",
      validUntil: formData.validUntil,
      createdBy: user.email,
      notes: formData.notes,
    }

    onSubmit(newQuote)
    onOpenChange(false)

    // Reset form
    setFormData({
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      projectTitle: "",
      description: "",
      validUntil: "",
      taxRate: 18,
      notes: "",
    })
    setItems([{ description: "", quantity: 1, unit: "m²", unitPrice: 0 }])
  }

  const { subtotal, taxAmount, total } = calculateTotals()

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
          <DialogTitle className="text-lg sm:text-xl">Nouveau devis</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Créez un nouveau devis en remplissant les informations ci-dessous
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            {/* Client Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Informations client</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                <div className="space-y-1.5 xl:col-span-2">
                  <Label htmlFor="clientName" className="text-sm font-medium">
                    Nom du client *
                  </Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange("clientName", e.target.value)}
                    required
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5 xl:col-span-2">
                  <Label htmlFor="clientEmail" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                    required
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="clientPhone" className="text-sm font-medium">
                    Téléphone
                  </Label>
                  <Input
                    id="clientPhone"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="validUntil" className="text-sm font-medium">
                    Valide jusqu'au *
                  </Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange("validUntil", e.target.value)}
                    required
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5 col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-6">
                  <Label htmlFor="clientAddress" className="text-sm font-medium">
                    Adresse
                  </Label>
                  <Input
                    id="clientAddress"
                    value={formData.clientAddress}
                    onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                    className="text-sm h-9"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Informations projet</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="projectTitle" className="text-sm font-medium">
                    Titre du projet *
                  </Label>
                  <Input
                    id="projectTitle"
                    value={formData.projectTitle}
                    onChange={(e) => handleInputChange("projectTitle", e.target.value)}
                    required
                    className="text-sm h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quote Items */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base sm:text-lg">Éléments du devis</CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="min-w-[300px] xl:min-w-[400px] font-medium">Description *</TableHead>
                        <TableHead className="w-24 text-center font-medium">Qté *</TableHead>
                        <TableHead className="w-24 text-center font-medium">Unité</TableHead>
                        <TableHead className="w-32 text-right font-medium">Prix unit. *</TableHead>
                        <TableHead className="w-32 text-right font-medium">Total</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="p-2">
                            <Input
                              value={item.description}
                              onChange={(e) => handleItemChange(index, "description", e.target.value)}
                              placeholder="Description"
                              required
                              className="text-sm h-8 border-0 focus:ring-1 focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(index, "quantity", Number.parseFloat(e.target.value) || 0)
                              }
                              required
                              className="text-sm h-8 text-center border-0 focus:ring-1 focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <Select value={item.unit} onValueChange={(value) => handleItemChange(index, "unit", value)}>
                              <SelectTrigger className="text-sm h-8 border-0 focus:ring-1 focus:ring-primary">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="m²">m²</SelectItem>
                                <SelectItem value="m³">m³</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="u">u</SelectItem>
                                <SelectItem value="forfait">forfait</SelectItem>
                                <SelectItem value="h">h</SelectItem>
                                <SelectItem value="j">j</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleItemChange(index, "unitPrice", Number.parseFloat(e.target.value) || 0)
                              }
                              required
                              className="text-sm h-8 text-right border-0 focus:ring-1 focus:ring-primary"
                            />
                          </TableCell>
                          <TableCell className="p-2 font-medium text-sm text-right">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </TableCell>
                          <TableCell className="p-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              disabled={items.length === 1}
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
              </CardContent>
            </Card>

            {/* Combined Totals and Notes */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Totals */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Calculator className="mr-2 h-4 w-4" />
                    Récapitulatif
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="taxRate" className="text-sm font-medium whitespace-nowrap">
                      TVA (%)
                    </Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.taxRate}
                      onChange={(e) => handleInputChange("taxRate", Number.parseFloat(e.target.value) || 0)}
                      className="w-20 text-sm h-8"
                    />
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total HT:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>TVA ({formData.taxRate}%):</span>
                      <span className="font-medium">{formatCurrency(taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t pt-2">
                      <span>Total TTC:</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Notes internes (optionnel)"
                    rows={4}
                    className="text-sm resize-none"
                  />
                </CardContent>
              </Card>
            </div>
          </form>
        </div>

        {/* Fixed action buttons at bottom */}
        <div className="flex-shrink-0 border-t bg-background px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="sm:w-auto">
              Annuler
            </Button>
            <Button type="submit" className="sm:w-auto" onClick={handleSubmit}>
              Créer le devis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
