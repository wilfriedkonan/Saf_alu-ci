"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { getBankAccounts } from "@/lib/treasury"

interface TransactionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (transaction: any) => void
}

export function TransactionFormModal({ isOpen, onClose, onSubmit }: TransactionFormModalProps) {
  const [formData, setFormData] = useState({
    description: "",
    amount: 0,
    type: "expense" as "income" | "expense",
    category: "",
    accountId: "",
    invoiceId: "",
    projectId: "",
    status: "completed" as "pending" | "completed" | "cancelled",
  })

  const [transactionDate, setTransactionDate] = useState<Date>(new Date())

  const bankAccounts = getBankAccounts()

  const expenseCategories = [
    "Matériaux",
    "Main d'œuvre",
    "Équipement",
    "Transport",
    "Assurances",
    "Frais généraux",
    "Sous-traitance",
    "Carburant",
  ]

  const incomeCategories = ["Paiements clients", "Subventions", "Autres revenus"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const transaction = {
      ...formData,
      amount: formData.type === "expense" ? -Math.abs(formData.amount) : Math.abs(formData.amount),
      date: format(transactionDate, "yyyy-MM-dd"),
      id: Date.now().toString(),
    }

    onSubmit(transaction)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-[95vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[85vh] max-h-[85vh] p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">Nouvelle Transaction</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations de la transaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value: "income" | "expense") =>
                          setFormData({ ...formData, type: value, category: "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Recette</SelectItem>
                          <SelectItem value="expense">Dépense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">Montant (FCFA)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !transactionDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {transactionDate
                              ? format(transactionDate, "dd/MM/yyyy", { locale: fr })
                              : "Sélectionner une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={transactionDate}
                            onSelect={(date) => date && setTransactionDate(date)}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {(formData.type === "expense" ? expenseCategories : incomeCategories).map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="accountId">Compte bancaire</Label>
                      <Select
                        value={formData.accountId}
                        onValueChange={(value) => setFormData({ ...formData, accountId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un compte" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.name} - {account.bank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">Statut</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value: "pending" | "completed" | "cancelled") =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Terminée</SelectItem>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="cancelled">Annulée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Description de la transaction..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor="invoiceId">ID Facture (optionnel)</Label>
                      <Input
                        id="invoiceId"
                        value={formData.invoiceId}
                        onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                        placeholder="Lier à une facture..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="projectId">ID Projet (optionnel)</Label>
                      <Input
                        id="projectId"
                        value={formData.projectId}
                        onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                        placeholder="Lier à un projet..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          <div className="border-t px-6 py-4 flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" onClick={handleSubmit}>
              Créer la transaction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
