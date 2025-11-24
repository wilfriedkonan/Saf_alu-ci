"use client"

import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, typeMouvementColors } from "@/types/tresorerie"

interface Compte {
  compteId: number
  nom: string
}

interface MouvementAPI {
  id: number
  typeMouvement: string
  categorie?: string | null
  libelle: string
  description?: string | null
  montant: number
  dateMouvement: string
  dateSaisie: string
  modePaiement?: string | null
  reference?: string | null
  compte: Compte
  compteDestination?: Compte | null
  couleur?: string
}

interface RecentTransactionsProps {
  mouvements: MouvementAPI[]
  searchTerm?: string
  selectedCompteId?: number | string  // ✅ Ajout du filtre de compte
  loading?: boolean
  error?: string | null
}

export function RecentTransactions({ 
  mouvements, 
  searchTerm = "", 
  selectedCompteId,  // ✅ Nouveau prop
  loading = false,
  error = null,
}: RecentTransactionsProps) {
  
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

  // ✅ FILTRAGE CORRIGÉ
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

    // ✅ Filtre par compte (CORRIGÉ)
    if (selectedCompteId && selectedCompteId !== "all") {
      const compteIdNumber = typeof selectedCompteId === 'string' 
        ? parseInt(selectedCompteId) 
        : selectedCompteId
      
      // Vérifier le compte source OU le compte destination (pour les virements)
      const matchesCompte = 
        mouvement.compte?.compteId === compteIdNumber ||
        mouvement.compteDestination?.compteId === compteIdNumber
      
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
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const isEntree = transaction.typeMouvement === "Entree"
        const isVirement = transaction.typeMouvement === "Virement"
        
        const compteName = transaction.compte?.nom || `Compte #${transaction.compte?.compteId || 'N/A'}`

        return (
          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              {/* Icône */}
              <div className={`p-2 rounded-full ${
                isEntree ? "bg-green-100" : isVirement ? "bg-blue-100" : "bg-red-100"
              }`}>
                {isEntree ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className={`h-4 w-4 ${isVirement ? "text-blue-600" : "text-red-600"}`} />
                )}
              </div>

              {/* Informations */}
              <div>
                <p className="font-medium text-sm">{transaction.libelle}</p>
                
                {transaction.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">
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
                  
                  <p className="text-xs text-muted-foreground">{compteName}</p>
                  
                  {transaction.compteDestination && (
                    <>
                      <span className="text-xs text-blue-500">→</span>
                      <p className="text-xs text-muted-foreground">{transaction.compteDestination.nom}</p>
                    </>
                  )}
                  
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(transaction.dateMouvement)}
                  </p>
                </div>
              </div>
            </div>

            {/* Montant et badge */}
            <div className="text-right space-y-1">
              <p className={`font-semibold ${
                isEntree ? "text-green-600" : isVirement ? "text-blue-600" : "text-red-600"
              }`}>
                {isEntree ? "+" : isVirement ? "→" : "-"}
                {formatCurrency(transaction.montant)}
              </p>
              <Badge 
                variant="outline" 
                className={`text-xs ${typeMouvementColors[transaction.typeMouvement as keyof typeof typeMouvementColors] || ''}`}
              >
                {transaction.typeMouvement}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}