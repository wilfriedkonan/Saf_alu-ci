export interface BankAccount {
  id: string
  name: string
  bank: string
  accountNumber: string
  balance: number
  currency: string
  type: "checking" | "savings" | "business"
}

export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  accountId: string
  invoiceId?: string
  projectId?: string
  status: "pending" | "completed" | "cancelled"
}

export interface ExpenseCategory {
  id: string
  name: string
  color: string
  budget?: number
  spent: number
}

export interface CashFlowData {
  month: string
  income: number
  expenses: number
  net: number
}

// Mock data
const bankAccounts: BankAccount[] = [
  {
    id: "acc1",
    name: "Compte Principal",
    bank: "BNP Paribas",
    accountNumber: "****1234",
    balance: 125000,
    currency: "EUR",
    type: "business",
  },
  {
    id: "acc2",
    name: "Compte Épargne",
    bank: "Crédit Agricole",
    accountNumber: "****5678",
    balance: 45000,
    currency: "EUR",
    type: "savings",
  },
  {
    id: "acc3",
    name: "Compte Chantiers",
    bank: "Société Générale",
    accountNumber: "****9012",
    balance: 32000,
    currency: "EUR",
    type: "checking",
  },
]

const expenseCategories: ExpenseCategory[] = [
  { id: "cat1", name: "Matériaux", color: "#3b82f6", budget: 50000, spent: 42000 },
  { id: "cat2", name: "Main d'œuvre", color: "#ef4444", budget: 80000, spent: 75000 },
  { id: "cat3", name: "Équipement", color: "#f59e0b", budget: 25000, spent: 18000 },
  { id: "cat4", name: "Transport", color: "#10b981", budget: 15000, spent: 12000 },
  { id: "cat5", name: "Assurances", color: "#8b5cf6", budget: 20000, spent: 20000 },
  { id: "cat6", name: "Frais généraux", color: "#6b7280", budget: 30000, spent: 25000 },
]

const transactions: Transaction[] = [
  {
    id: "t1",
    date: "2025-01-15",
    description: "Paiement Villa Moderne - Acompte",
    amount: 25000,
    type: "income",
    category: "Paiements clients",
    accountId: "acc1",
    invoiceId: "inv1",
    projectId: "proj1",
    status: "completed",
  },
  {
    id: "t2",
    date: "2025-01-14",
    description: "Achat matériaux - Leroy Merlin",
    amount: -3500,
    type: "expense",
    category: "Matériaux",
    accountId: "acc1",
    projectId: "proj1",
    status: "completed",
  },
  {
    id: "t3",
    date: "2025-01-13",
    description: "Salaire équipe - Janvier",
    amount: -12000,
    type: "expense",
    category: "Main d'œuvre",
    accountId: "acc1",
    status: "completed",
  },
  {
    id: "t4",
    date: "2025-01-12",
    description: "Paiement Rénovation Bureau - Solde",
    amount: 18000,
    type: "income",
    category: "Paiements clients",
    accountId: "acc1",
    invoiceId: "inv2",
    projectId: "proj2",
    status: "completed",
  },
  {
    id: "t5",
    date: "2025-01-11",
    description: "Location grue - 2 semaines",
    amount: -2800,
    type: "expense",
    category: "Équipement",
    accountId: "acc3",
    projectId: "proj1",
    status: "completed",
  },
  {
    id: "t6",
    date: "2025-01-10",
    description: "Assurance chantier - Trimestre",
    amount: -5000,
    type: "expense",
    category: "Assurances",
    accountId: "acc1",
    status: "completed",
  },
  {
    id: "t7",
    date: "2025-01-20",
    description: "Paiement Extension Maison - À recevoir",
    amount: 35000,
    type: "income",
    category: "Paiements clients",
    accountId: "acc1",
    invoiceId: "inv3",
    projectId: "proj3",
    status: "pending",
  },
  {
    id: "t8",
    date: "2025-01-18",
    description: "Carburant véhicules - Janvier",
    amount: -800,
    type: "expense",
    category: "Transport",
    accountId: "acc1",
    status: "pending",
  },
]

const cashFlowData: CashFlowData[] = [
  { month: "Sep", income: 85000, expenses: 62000, net: 23000 },
  { month: "Oct", income: 92000, expenses: 68000, net: 24000 },
  { month: "Nov", income: 78000, expenses: 55000, net: 23000 },
  { month: "Déc", income: 105000, expenses: 72000, net: 33000 },
  { month: "Jan", income: 98000, expenses: 65000, net: 33000 },
  { month: "Fév", income: 88000, expenses: 58000, net: 30000 },
]

export function getBankAccounts(): BankAccount[] {
  return bankAccounts
}

export function getTransactions(): Transaction[] {
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getExpenseCategories(): ExpenseCategory[] {
  return expenseCategories
}

export function getCashFlowData(): CashFlowData[] {
  return cashFlowData
}

export function getTotalBalance(): number {
  return bankAccounts.reduce((total, account) => total + account.balance, 0)
}

export function getMonthlyIncome(): number {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return transactions
    .filter((t) => {
      const transactionDate = new Date(t.date)
      return (
        t.type === "income" &&
        t.status === "completed" &&
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      )
    })
    .reduce((total, t) => total + t.amount, 0)
}

export function getMonthlyExpenses(): number {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  return Math.abs(
    transactions
      .filter((t) => {
        const transactionDate = new Date(t.date)
        return (
          t.type === "expense" &&
          t.status === "completed" &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        )
      })
      .reduce((total, t) => total + t.amount, 0),
  )
}

export function getPendingPayments(): number {
  return transactions
    .filter((t) => t.type === "income" && t.status === "pending")
    .reduce((total, t) => total + t.amount, 0)
}
