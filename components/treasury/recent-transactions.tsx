"use client"

import { useState } from "react"
import { ArrowUpRight, ArrowDownRight, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, typeMouvementColors, MouvementFinancier, Compte } from "@/types/tresorerie"
import { TransactionDetailDialog } from "./transaction-detail-dialog"

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

  const handleViewDetails = (transactionId: number) => {
    setSelectedTransactionId(transactionId)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    // Attendre la fermeture de l'animation avant de reset l'ID
    setTimeout(() => setSelectedTransactionId(null), 300)
  }
  
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

  const filteredTransactions = mouvements.filter((mouvement) => {
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

  // Limiter à 10 transactions
  const transactions = filteredTransactions.slice(0, 10)

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune transaction trouvée pour les critères sélectionnés
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const isEntree = transaction.typeMouvement === "Entree"
/*           const isVirement = transaction.typeMouvement === "Virement"
 */          
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
                  isEntree ? "bg-green-100" : "bg-red-100" /* isVirement ? "bg-blue-100" : "bg-red-100" */
                }`}>
                  {isEntree ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className={`h-4 w-4 ${/* isVirement ? "text-blue-600" : */ "text-red-600"}`} />
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
                    isEntree ? "text-green-600" : "text-red-600" /* isVirement ? "text-blue-600" : "text-red-600" */
                  }`}>
                    {isEntree ? "+" : "-" /* isVirement ? "→" : "-" */}
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

      {/* Dialog de détails */}
      {selectedTransactionId && (
        <TransactionDetailDialog
          transactionId={selectedTransactionId}
          open={dialogOpen}
          onOpenChange={handleCloseDialog}
        />
      )}
    </>
  )
}