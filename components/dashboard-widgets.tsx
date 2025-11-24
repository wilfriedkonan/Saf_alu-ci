"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts"
import { 
  DollarSign, 
  FileText, 
  Hammer, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  AlertCircle
} from "lucide-react"
import { useAuth, usePermissions } from "@/contexts/AuthContext"
import { useDashboard } from "@/hooks/useDashboard"
import { Utilisateur } from "@/types/Utilisateurs"
import type { 
  DashboardStatsGlobal, 
  DashboardStatsChefProjet, 
  DashboardStatsCommercial, 
  DashboardStatsComptable 
} from "@/types/dashboard"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"

interface DashboardWidgetsProps {
  user: Utilisateur | null
}

export function DashboardWidgets({ user }: DashboardWidgetsProps) {
  const { canAccessDashboard } = usePermissions()
  const { donnees, loading, error, refreshing, actualiser } = useDashboard()

  // Vérifier les permissions
  if (!canAccessDashboard) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Vous n'avez pas accès au tableau de bord
          </p>
        </CardContent>
      </Card>
    )
  }
console.log('user:',user)
  // État de chargement initial
  if (loading) {
    return <DashboardSkeleton />
  }

  // Gestion des erreurs
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          {error}
          <Button 
            onClick={actualiser} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // Pas de données
  if (!donnees) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">
            Aucune donnée disponible
          </p>
        </CardContent>
      </Card>
    )
  }

  // Obtenir les KPIs selon le rôle
  const getKPIsForRole = () => {
    const stats = donnees.statistiques

    switch (user?.Role?.Nom) {
      case "super_admin":
      case "admin": {
        const statsGlobal = stats as DashboardStatsGlobal
        return [
          {
            title: "Chiffre d'affaires",
            value: statsGlobal?.chiffreAffaires?.valeur || "0F",
            change: statsGlobal?.chiffreAffaires?.changement || "+0%",
            icon: DollarSign,
            color: "text-green-600",
            type: statsGlobal?.chiffreAffaires?.type || "neutre"
          },
          {
            title: "Projets actifs",
            value: statsGlobal?.projetsActifs?.valeur || "0",
            change: statsGlobal?.projetsActifs?.changement || "+0",
            icon: Hammer,
            color: "text-blue-600",
            type: statsGlobal?.projetsActifs?.type || "neutre"
          },
          {
            title: "Objectif annuel",
            value: statsGlobal?.objectifAnnuel?.valeur || "0",
            change: statsGlobal?.objectifAnnuel?.changement || "devis",
            icon: FileText,
            color: "text-orange-600",
            type: statsGlobal?.objectifAnnuel?.type || "neutre"
          },
          {
            title: "Solde des comptes",
            value: statsGlobal?.soldeComptes?.valeur || "0F",
            change: statsGlobal?.soldeComptes?.changement || "+0%",
            icon: TrendingUp,
            color: "text-purple-600",
            type: statsGlobal?.soldeComptes?.type || "neutre"
          },
        ]
      }
      case "super_admin":
      case "chef_projet"  : {
        const statsChef = stats as DashboardStatsChefProjet
        return [
          {
            title: "Mes projets",
            value: statsChef.mesProjets?.valeur || "0",
            change: statsChef.mesProjets?.changement || "+0",
            icon: Hammer,
            color: "text-blue-600",
            type: statsChef.mesProjets?.type || "neutre"
          },
          {
            title: "Projets en retard",
            value: statsChef.projetsEnRetard?.valeur || "0",
            change: statsChef.projetsEnRetard?.changement || "0",
            icon: AlertTriangle,
            color: "text-red-600",
            type: statsChef.projetsEnRetard?.type || "neutre"
          },
          {
            title: "Tâches terminées",
            value: statsChef.tachesTerminees?.valeur || "0",
            change: statsChef.tachesTerminees?.changement || "+0",
            icon: CheckCircle,
            color: "text-green-600",
            type: statsChef.tachesTerminees?.type || "neutre"
          },
          {
            title: "Équipe active",
            value: statsChef.equipeActive?.valeur || "0",
            change: statsChef.equipeActive?.changement || "0",
            icon: Users,
            color: "text-purple-600",
            type: statsChef.equipeActive?.type || "neutre"
          },
        ]
      }
      case "super_admin":
      case "commercial": {
        const statsCommercial = stats as DashboardStatsCommercial
        return [
          {
            title: "Devis envoyés",
            value: statsCommercial.devisEnvoyes?.valeur || "0",
            change: statsCommercial.devisEnvoyes?.changement || "+0",
            icon: FileText,
            color: "text-blue-600",
            type: statsCommercial.devisEnvoyes?.type || "neutre"
          },
          {
            title: "Taux de conversion",
            value: statsCommercial.tauxConversion?.valeur || "0%",
            change: statsCommercial.tauxConversion?.changement || "+0%",
            icon: TrendingUp,
            color: "text-green-600",
            type: statsCommercial.tauxConversion?.type || "neutre"
          },
          {
            title: "Devis en attente",
            value: statsCommercial.devisEnAttente?.valeur || "0",
            change: statsCommercial.devisEnAttente?.changement || "0",
            icon: Clock,
            color: "text-orange-600",
            type: statsCommercial.devisEnAttente?.type || "neutre"
          },
          {
            title: "Clients prospects",
            value: statsCommercial.clientsProspects?.valeur || "0",
            change: statsCommercial.clientsProspects?.changement || "+0",
            icon: Users,
            color: "text-purple-600",
            type: statsCommercial.clientsProspects?.type || "neutre"
          },
        ]
      }
      case "super_admin":
      case "comptable": {
        const statsComptable = stats as DashboardStatsComptable
        return [
          {
            title: "Factures impayées",
            value: statsComptable.facturesImpayees?.valeur || "0F",
            change: statsComptable.facturesImpayees?.changement || "0F",
            icon: AlertTriangle,
            color: "text-red-600",
            type: statsComptable.facturesImpayees?.type || "neutre"
          },
          {
            title: "Trésorerie",
            value: statsComptable.tresorerie?.valeur || "0F",
            change: statsComptable.tresorerie?.changement || "+0F",
            icon: TrendingUp,
            color: "text-green-600",
            type: statsComptable.tresorerie?.type || "neutre"
          },
          {
            title: "Factures du mois",
            value: statsComptable.facturesMois?.valeur || "0",
            change: statsComptable.facturesMois?.changement || "+0",
            icon: FileText,
            color: "text-blue-600",
            type: statsComptable.facturesMois?.type || "neutre"
          },
          {
            title: "Retards de paiement",
            value: statsComptable.retardsPaiement?.valeur || "0",
            change: statsComptable.retardsPaiement?.changement || "0",
            icon: Clock,
            color: "text-orange-600",
            type: statsComptable.retardsPaiement?.type || "neutre"
          },
        ]
      }

      default:
        return [
          {
            title: "Mes tâches",
            value: "0",
            change: "+0",
            icon: CheckCircle,
            color: "text-blue-600",
            type: "neutre"
          },
          {
            title: "Projets assignés",
            value: "0",
            change: "0",
            icon: Hammer,
            color: "text-green-600",
            type: "neutre"
          },
        ]
    }
  }

  const kpis = getKPIsForRole()

  return (
    <div className="space-y-6">
      {/* Bouton de rafraîchissement */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={actualiser}
          disabled={refreshing}
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", refreshing ? "animate-spin" : undefined)} />
          Actualiser
        </Button>
      </div>

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
                <span className={getChangeColorClass(kpi.type)}>
                  {kpi.change}
                </span>{" "}
                par rapport au mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphiques pour admin, super_admin et comptable */}
      {(user?.Role?.Nom === "super_admin" || 
        user?.Role?.Nom === "admin" || 
        user?.Role?.Nom === "comptable") && 
        donnees.evolutionChiffreAffaires && 
        donnees.repartitionProjets && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Graphique Évolution CA */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution du chiffre d'affaires</CardTitle>
              <CardDescription>Revenus mensuels des 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              {donnees.evolutionChiffreAffaires.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={donnees.evolutionChiffreAffaires}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${Number(value).toLocaleString()}F`, "Revenus"]} 
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>

          {/* Graphique Répartition Projets */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition des projets</CardTitle>
              <CardDescription>État actuel de tous les projets</CardDescription>
            </CardHeader>
            <CardContent>
              {donnees.repartitionProjets.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={donnees.repartitionProjets}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {donnees.repartitionProjets.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {donnees.repartitionProjets.map((status, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: status.color || '#8884d8' }} 
                        />
                        <span className="text-sm">
                          {status.label}: {status.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Aucune donnée disponible
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertes projets pour chef de projet, admin et super_admin */}
      {(user?.Role?.Nom === "chef_projet" || 
        user?.Role?.Nom === "admin" || 
        user?.Role?.Nom === "super_admin") && 
        donnees.projetsAlerte && 
        donnees.projetsAlerte.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Projets nécessitant une attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donnees.projetsAlerte.map((alerte, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alerte.nomProjet}</p>
                    <p className="text-sm text-muted-foreground">{alerte.message}</p>
                  </div>
                  <Badge variant={getBadgeVariant(alerte.niveau)}>
                    {getNiveauLabel(alerte.niveau)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activités récentes */}
      {donnees.activitesRecentes && donnees.activitesRecentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {donnees.activitesRecentes.map((activite, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div 
                    className={cn(
                      "h-2 w-2 rounded-full mt-2",
                      getActivityColorClass(activite.couleur)
                    )} 
                  />
                  <div className="flex-1">
                    <p className="text-sm">{activite.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activite.dateActivite), {
                        addSuffix: true,
                        locale: fr
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// =============================================
// SKELETON DE CHARGEMENT
// =============================================

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[80px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// =============================================
// FONCTIONS UTILITAIRES
// =============================================

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function getChangeColorClass(type: string): string {
  switch (type) {
    case "hausse":
      return "text-green-600"
    case "baisse":
      return "text-red-600"
    default:
      return "text-muted-foreground"
  }
}

function getBadgeVariant(niveau: string): "default" | "destructive" | "secondary" | "outline" {
  switch (niveau) {
    case "urgent":
      return "destructive"
    case "attention":
      return "secondary"
    default:
      return "outline"
  }
}

function getNiveauLabel(niveau: string): string {
  switch (niveau) {
    case "urgent":
      return "Urgent"
    case "attention":
      return "Attention"
    default:
      return "Info"
  }
}

function getActivityColorClass(couleur: string): string {
  const colorMap: Record<string, string> = {
    green: "bg-green-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  }
  return colorMap[couleur] || "bg-gray-500"
}