"use client"

import { useState, useMemo } from "react"
import { ArrowUpRight, ArrowDownRight, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, typeMouvementColors, MouvementFinancier, Compte } from "@/types/tresorerie"
import { TransactionDetailDialog } from "./transaction-detail-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface RecentTransactionsProps {
  mouvements: MouvementFinancier[]
  searchTerm?: string
  selectedCompteId?: number | string
  loading?: boolean
  error?: string | null
  comptesMap?: Map<number, Compte>
}

export function RecentTransactions({ 
  mouvements, 
  searchTerm = "", 
  selectedCompteId,
  loading = false,
  error = null,
  comptesMap,
}: RecentTransactionsProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // États de pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const handleViewDetails = (transactionId: number) => {
    setSelectedTransactionId(transactionId)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    // Attendre la fermeture de l'animation avant de reset l'ID
    setTimeout(() => setSelectedTransactionId(null), 300)
  }

  // Filtrage des transactions
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(mouvements)) return []

    return mouvements.filter((mouvement) => {
      // Filtre par terme de recherche
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          mouvement.libelle.toLowerCase().includes(searchLower) ||
          (mouvement.description && mouvement.description.toLowerCase().includes(searchLower)) ||
          (mouvement.categorie && mouvement.categorie.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }

      // Filtre par compte
      if (selectedCompteId && selectedCompteId !== "all") {
        const compteIdNumber = typeof selectedCompteId === 'string' 
          ? parseInt(selectedCompteId) 
          : selectedCompteId
        
        // Vérifier le compte source OU le compte destination (pour les virements)
        const matchesCompte = 
          mouvement.compteId === compteIdNumber ||
          mouvement.compte?.id === compteIdNumber ||
          mouvement.compteDestinationId === compteIdNumber ||
          mouvement.compteDestination?.id === compteIdNumber
        
        if (!matchesCompte) return false
      }

      return true
    })
  }, [mouvements, searchTerm, selectedCompteId])

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  // Réinitialiser la page quand les filtres changent
  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCompteId, itemsPerPage])

  // Fonctions de navigation
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value))
    setCurrentPage(1)
  }

  // États de chargement et d'erreur
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Chargement des transactions...
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erreur: {error}
      </div>
    )
  }

  if (!Array.isArray(mouvements) || mouvements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune transaction trouvée
      </div>
    )
  }

  if (filteredTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune transaction trouvée pour les critères sélectionnés
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Liste des transactions */}
      <div className="space-y-4">
        {currentTransactions.map((transaction) => {
          const isEntree = transaction.typeMouvement === "Entree"
          
          // Récupérer le compte depuis le mouvement ou depuis la map
          const compte = transaction.compte || (comptesMap && comptesMap.get(transaction.compteId))
          const compteName = compte?.nom || `Compte #${transaction.compteId || 'N/A'}`
          
          // Récupérer le compte destination si c'est un virement
          const compteDestination = transaction.compteDestination || 
            (transaction.compteDestinationId && comptesMap && comptesMap.get(transaction.compteDestinationId))

          return (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-3 flex-1">
                {/* Icône */}
                <div className={`p-2 rounded-full ${
                  isEntree ? "bg-green-100" : "bg-red-100"
                }`}>
                  {isEntree ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                </div>

                {/* Informations */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{transaction.libelle}</p>
                  
                  {transaction.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {transaction.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-1 flex-wrap">
                    {transaction.categorie && (
                      <>
                        <p className="text-xs text-muted-foreground">{transaction.categorie}</p>
                        <span className="text-xs text-muted-foreground">•</span>
                      </>
                    )}
                    
                    <p className="text-xs text-muted-foreground truncate">{compteName}</p>
                    
                    {compteDestination && (
                      <>
                        <span className="text-xs text-blue-500">→</span>
                        <p className="text-xs text-muted-foreground truncate">{compteDestination.nom}</p>
                      </>
                    )}
                    
                    <span className="text-xs text-muted-foreground">•</span>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.dateMouvement)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Montant, badge et bouton détails */}
              <div className="flex items-center gap-3 ml-3">
                <div className="text-right space-y-1">
                  <p className={`font-semibold ${
                    isEntree ? "text-green-600" : "text-red-600"
                  }`}>
                    {isEntree ? "+" : "-"}
                    {formatCurrency(transaction.montant)}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${typeMouvementColors[transaction.typeMouvement as keyof typeof typeMouvementColors] || ''}`}
                  >
                    {transaction.typeMouvement}
                  </Badge>
                </div>

                {/* Bouton œil - visible au survol */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleViewDetails(transaction.id)}
                  title="Voir les détails"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Contrôles de pagination */}
      <div className="flex items-center justify-between border-t pt-4">
        {/* Informations et sélecteur d'éléments par page */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Affichage de <span className="font-medium">{startIndex + 1}</span> à{" "}
            <span className="font-medium">{Math.min(endIndex, filteredTransactions.length)}</span> sur{" "}
            <span className="font-medium">{filteredTransactions.length}</span> transaction{filteredTransactions.length > 1 ? 's' : ''}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Par page:</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Boutons de navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>

          {/* Numéros de pages */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                // Afficher les 3 premières pages, les 3 dernières, et les pages autour de la page actuelle
                if (totalPages <= 7) return true
                if (page <= 2 || page > totalPages - 2) return true
                if (Math.abs(page - currentPage) <= 1) return true
                return false
              })
              .map((page, index, array) => {
                // Ajouter des ellipses entre les groupes de pages
                const showEllipsisBefore = index > 0 && page - array[index - 1] > 1

                return (
                  <div key={page} className="flex items-center">
                    {showEllipsisBefore && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-9 h-9 p-0"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  </div>
                )
              })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Dialog de détails */}
      {selectedTransactionId && (
        <TransactionDetailDialog
          transactionId={selectedTransactionId}
          open={dialogOpen}
          onOpenChange={handleCloseDialog}
        />
      )}
    </div>
  )
}