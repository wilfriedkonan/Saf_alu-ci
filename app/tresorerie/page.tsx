"use client"

import { useState } from "react"
import {
  Plus,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertTriangle,
  Calendar,
  Search,
  Trash2,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { CashFlowChart } from "@/components/treasury/cash-flow-chart"
import { ExpenseBreakdown } from "@/components/treasury/expense-breakdown"
import { RecentTransactions } from "@/components/treasury/recent-transactions"
import { TransactionFormModal } from "@/components/treasury/transaction-form-modal"

// Mock treasury data
const mockTreasuryData = {
  totalBalance: 125000,
  monthlyIncome: 45000,
  monthlyExpenses: 32000,
  pendingPayments: 18000,
  accounts: [
    { id: 1, name: "Compte Principal", bank: "BNP Paribas", balance: 85000, type: "courant" },
    { id: 2, name: "Compte Épargne", bank: "Crédit Agricole", balance: 40000, type: "epargne" },
  ],
  alerts: [
    { id: 1, type: "warning", message: "Facture client ABC en retard de 15 jours", amount: 5500 },
    { id: 2, type: "info", message: "Paiement fournisseur prévu demain", amount: 3200 },
  ],
}

export default function TreasuryPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showAddAccount, setShowAddAccount] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [accounts, setAccounts] = useState(mockTreasuryData.accounts)
  const [alerts, setAlerts] = useState(mockTreasuryData.alerts)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const cashFlowTrend = mockTreasuryData.monthlyIncome - mockTreasuryData.monthlyExpenses

  const handleCreateTransaction = (transactionData: any) => {
    console.log("Nouvelle transaction créée:", transactionData)
    // Refresh data logic would go here
  }

  const handleDeleteAccount = (accountId: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")) {
      setAccounts(accounts.filter((account) => account.id !== accountId))
    }
  }

  const handleDeleteAlert = (alertId: number) => {
    setAlerts(alerts.filter((alert) => alert.id !== alertId))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trésorerie</h1>
            <p className="text-gray-600">Suivi financier et gestion des flux de trésorerie</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddTransaction(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Transaction
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Solde Total</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(mockTreasuryData.totalBalance)}</div>
              <p className="text-xs text-gray-500">Tous comptes confondus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Recettes du mois</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(mockTreasuryData.monthlyIncome)}</div>
              <p className="text-xs text-gray-500">+12% vs mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Dépenses du mois</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(mockTreasuryData.monthlyExpenses)}</div>
              <p className="text-xs text-gray-500">-5% vs mois dernier</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Flux net</CardTitle>
              <CreditCard className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${cashFlowTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(cashFlowTrend)}
              </div>
              <p className="text-xs text-gray-500">Ce mois-ci</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertes financières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-sm text-gray-700">{alert.message}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.type === "warning" ? "destructive" : "default"}>
                        {formatCurrency(alert.amount)}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution de trésorerie</CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseBreakdown />
            </CardContent>
          </Card>
        </div>

        {/* Bank Accounts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Comptes bancaires</CardTitle>
            <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un compte
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un compte bancaire</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="accountName">Nom du compte</Label>
                    <Input id="accountName" placeholder="Compte Principal" />
                  </div>
                  <div>
                    <Label htmlFor="bankName">Banque</Label>
                    <Input id="bankName" placeholder="BNP Paribas" />
                  </div>
                  <div>
                    <Label htmlFor="accountType">Type de compte</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="courant">Compte courant</SelectItem>
                        <SelectItem value="epargne">Compte épargne</SelectItem>
                        <SelectItem value="professionnel">Compte professionnel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="initialBalance">Solde initial</Label>
                    <Input id="initialBalance" type="number" placeholder="0.00" />
                  </div>
                  <Button className="w-full">Ajouter le compte</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-500">{account.bank}</p>
                    <Badge variant="outline" className="mt-1">
                      {account.type === "courant" ? "Courant" : "Épargne"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{formatCurrency(account.balance)}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAccount(account.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transactions récentes</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-32">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">7 jours</SelectItem>
                  <SelectItem value="month">30 jours</SelectItem>
                  <SelectItem value="quarter">3 mois</SelectItem>
                  <SelectItem value="year">1 an</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <RecentTransactions searchTerm={searchTerm} period={selectedPeriod} />
          </CardContent>
        </Card>

        {/* Cash Flow Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Prévisions de trésorerie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Mois prochain</div>
                <div className="text-xl font-semibold text-green-600">
                  {formatCurrency(mockTreasuryData.totalBalance + cashFlowTrend)}
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Dans 2 mois</div>
                <div className="text-xl font-semibold text-green-600">
                  {formatCurrency(mockTreasuryData.totalBalance + cashFlowTrend * 2)}
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-sm text-gray-500">Dans 3 mois</div>
                <div className="text-xl font-semibold text-green-600">
                  {formatCurrency(mockTreasuryData.totalBalance + cashFlowTrend * 3)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Form Modal */}
      <TransactionFormModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onSubmit={handleCreateTransaction}
      />
    </DashboardLayout>
  )
}
