"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Euro, FileText, Hammer, Users, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import type { User } from "@/lib/auth"

interface DashboardWidgetsProps {
  user: User
}

// Mock data for charts
const monthlyRevenue = [
  { month: "Jan", revenue: 45000 },
  { month: "Fév", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Avr", revenue: 61000 },
  { month: "Mai", revenue: 55000 },
  { month: "Jun", revenue: 67000 },
]

const projectStatus = [
  { name: "En cours", value: 8, color: "#3b82f6" },
  { name: "Terminés", value: 12, color: "#10b981" },
  { name: "En retard", value: 3, color: "#ef4444" },
  { name: "Planifiés", value: 5, color: "#f59e0b" },
]

export function DashboardWidgets({ user }: DashboardWidgetsProps) {
  const getKPIsForRole = () => {
    switch (user.role) {
      case "super_admin":
      case "admin":
        return [
          {
            title: "Chiffre d'affaires",
            value: "€342,500",
            change: "+12.5%",
            icon: Euro,
            color: "text-green-600",
          },
          {
            title: "Projets actifs",
            value: "23",
            change: "+3",
            icon: Hammer,
            color: "text-blue-600",
          },
          {
            title: "Devis en attente",
            value: "8",
            change: "-2",
            icon: FileText,
            color: "text-orange-600",
          },
          {
            title: "Sous-traitants",
            value: "15",
            change: "+1",
            icon: Users,
            color: "text-purple-600",
          },
        ]
      case "chef_projet":
        return [
          {
            title: "Mes projets",
            value: "12",
            change: "+2",
            icon: Hammer,
            color: "text-blue-600",
          },
          {
            title: "Projets en retard",
            value: "2",
            change: "-1",
            icon: AlertTriangle,
            color: "text-red-600",
          },
          {
            title: "Tâches terminées",
            value: "45",
            change: "+8",
            icon: CheckCircle,
            color: "text-green-600",
          },
          {
            title: "Équipe active",
            value: "8",
            change: "0",
            icon: Users,
            color: "text-purple-600",
          },
        ]
      case "commercial":
        return [
          {
            title: "Devis envoyés",
            value: "24",
            change: "+6",
            icon: FileText,
            color: "text-blue-600",
          },
          {
            title: "Taux de conversion",
            value: "68%",
            change: "+5%",
            icon: TrendingUp,
            color: "text-green-600",
          },
          {
            title: "Devis en attente",
            value: "8",
            change: "-2",
            icon: Clock,
            color: "text-orange-600",
          },
          {
            title: "Clients prospects",
            value: "15",
            change: "+3",
            icon: Users,
            color: "text-purple-600",
          },
        ]
      case "comptable":
        return [
          {
            title: "Factures impayées",
            value: "€45,200",
            change: "-€8,500",
            icon: Euro,
            color: "text-red-600",
          },
          {
            title: "Trésorerie",
            value: "€125,800",
            change: "+€12,300",
            icon: TrendingUp,
            color: "text-green-600",
          },
          {
            title: "Factures du mois",
            value: "32",
            change: "+5",
            icon: FileText,
            color: "text-blue-600",
          },
          {
            title: "Retards de paiement",
            value: "6",
            change: "-2",
            icon: AlertTriangle,
            color: "text-orange-600",
          },
        ]
      default:
        return [
          {
            title: "Mes tâches",
            value: "8",
            change: "+2",
            icon: CheckCircle,
            color: "text-blue-600",
          },
          {
            title: "Projets assignés",
            value: "3",
            change: "0",
            icon: Hammer,
            color: "text-green-600",
          },
        ]
    }
  }

  const kpis = getKPIsForRole()

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className={cn("h-4 w-4", kpi.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={kpi.change.startsWith("+") ? "text-green-600" : "text-red-600"}>{kpi.change}</span> par
                rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and additional widgets */}
      {(user.role === "super_admin" || user.role === "admin" || user.role === "comptable") && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
              <CardDescription>Revenus mensuels des 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, "Revenus"]} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition des projets</CardTitle>
              <CardDescription>État actuel de tous les projets</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={projectStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {projectStatus.map((status, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: status.color }} />
                    <span className="text-sm">
                      {status.name}: {status.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project alerts for project managers */}
      {(user.role === "chef_projet" || user.role === "admin" || user.role === "super_admin") && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Projets nécessitant une attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Rénovation Villa Cocody</p>
                  <p className="text-sm text-muted-foreground">En retard de 5 jours</p>
                </div>
                <Badge variant="destructive">Urgent</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Construction Immeuble Plateau</p>
                  <p className="text-sm text-muted-foreground">Budget dépassé de 15%</p>
                </div>
                <Badge variant="secondary">Attention</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Extension Maison Marcory</p>
                  <p className="text-sm text-muted-foreground">Matériaux en attente</p>
                </div>
                <Badge variant="outline">En attente</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
              <div>
                <p className="text-sm">Devis #2024-045 validé par le client</p>
                <p className="text-xs text-muted-foreground">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2" />
              <div>
                <p className="text-sm">Nouveau projet "Rénovation Bureau" créé</p>
                <p className="text-xs text-muted-foreground">Il y a 4 heures</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
              <div>
                <p className="text-sm">Facture #2024-128 en retard de paiement</p>
                <p className="text-xs text-muted-foreground">Il y a 1 jour</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
