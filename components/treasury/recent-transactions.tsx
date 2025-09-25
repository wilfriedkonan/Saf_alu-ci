"use client"

import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getTransactions } from "@/lib/treasury"

interface RecentTransactionsProps {
  searchTerm?: string
  period?: string
}

export function RecentTransactions({ searchTerm = "", period = "month" }: RecentTransactionsProps) {
  const allTransactions = getTransactions()

  // Filter by period
  const now = new Date()
  const filteredByPeriod = allTransactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date)
    const diffTime = now.getTime() - transactionDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    switch (period) {
      case "week":
        return diffDays <= 7
      case "month":
        return diffDays <= 30
      case "quarter":
        return diffDays <= 90
      case "year":
        return diffDays <= 365
      default:
        return diffDays <= 30
    }
  })

  // Filter by search term
  const filteredTransactions = filteredByPeriod.filter((transaction) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      transaction.description.toLowerCase().includes(searchLower) ||
      transaction.category.toLowerCase().includes(searchLower)
    )
  })

  // Take only the first 10 transactions after filtering
  const transactions = filteredTransactions.slice(0, 10)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Terminé"
      case "pending":
        return "En attente"
      case "cancelled":
        return "Annulé"
      default:
        return status
    }
  }

  return (
    <div className="space-y-4">
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Aucune transaction trouvée pour les critères sélectionnés</div>
      ) : (
        transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}>
                {transaction.type === "income" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-muted-foreground">{transaction.category}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <p className={`font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {transaction.type === "income" ? "+" : ""}
                {transaction.amount.toLocaleString()} €
              </p>
              <div className="flex items-center space-x-1">
                {getStatusIcon(transaction.status)}
                <Badge variant={transaction.status === "completed" ? "default" : "secondary"} className="text-xs">
                  {getStatusLabel(transaction.status)}
                </Badge>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
