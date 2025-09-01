"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, FileText, Euro, Clock, CheckCircle } from "lucide-react"
import { getCurrentUser, hasPermission } from "@/lib/auth"
import { getQuotes, type Quote, quoteStatusLabels, quoteStatusColors, type QuoteStatus } from "@/lib/quotes"
import { QuoteActions } from "@/components/quotes/quote-actions"
import { QuoteFormModal } from "@/components/quotes/quote-form-modal"

export default function QuotesPage() {
  const [user, setUser] = useState(getCurrentUser())
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "all">("all")
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!user || !hasPermission(user, "devis")) {
      router.push("/dashboard")
      return
    }

    const quotesData = getQuotes()
    setQuotes(quotesData)
    setFilteredQuotes(quotesData)
  }, [user, router])

  useEffect(() => {
    let filtered = quotes

    if (searchTerm) {
      filtered = filtered.filter(
        (quote) =>
          quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quote.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((quote) => quote.status === statusFilter)
    }

    setFilteredQuotes(filtered)
  }, [quotes, searchTerm, statusFilter])

  const handleRefresh = () => {
    const quotesData = getQuotes()
    setQuotes(quotesData)
  }

  const handleCreateQuote = (newQuote: Omit<Quote, "id" | "createdAt" | "updatedAt">) => {
    // In a real app, this would make an API call
    const quote: Quote = {
      ...newQuote,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setQuotes((prev) => [quote, ...prev])
    setFilteredQuotes((prev) => [quote, ...prev])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getQuoteStats = () => {
    const total = quotes.length
    const pending = quotes.filter((q) => q.status === "envoye" || q.status === "en_negociation").length
    const validated = quotes.filter((q) => q.status === "valide").length
    const totalValue = quotes.filter((q) => q.status === "valide").reduce((sum, q) => sum + q.total, 0)

    return { total, pending, validated, totalValue }
  }

  const stats = getQuoteStats()

  if (!user || !hasPermission(user, "devis")) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Devis</h1>
            <p className="text-muted-foreground">Créez, gérez et suivez vos devis clients</p>
          </div>
          <Button onClick={() => setShowQuoteForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau devis
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total devis</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validés</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.validated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valeur validée</CardTitle>
              <Euro className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro, client ou projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QuoteStatus | "all")}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="envoye">Envoyé</SelectItem>
                  <SelectItem value="en_negociation">En négociation</SelectItem>
                  <SelectItem value="valide">Validé</SelectItem>
                  <SelectItem value="refuse">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quotes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des devis ({filteredQuotes.length})</CardTitle>
            <CardDescription>Gérez vos devis avec toutes les actions disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Projet</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead>Valide jusqu'au</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.number}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quote.clientName}</div>
                        <div className="text-sm text-muted-foreground">{quote.clientEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-48 truncate" title={quote.projectTitle}>
                        {quote.projectTitle}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(quote.total)}</TableCell>
                    <TableCell>
                      <Badge className={quoteStatusColors[quote.status]}>{quoteStatusLabels[quote.status]}</Badge>
                    </TableCell>
                    <TableCell>{new Date(quote.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell>{new Date(quote.validUntil).toLocaleDateString("fr-FR")}</TableCell>
                    <TableCell className="text-right">
                      <QuoteActions quote={quote} onUpdate={handleRefresh} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quote Form Modal */}
      <QuoteFormModal open={showQuoteForm} onOpenChange={setShowQuoteForm} onSubmit={handleCreateQuote} />
    </DashboardLayout>
  )
}
