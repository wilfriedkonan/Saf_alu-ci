"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, Activity, Loader2 } from "lucide-react"
import { useStatistiquesUtilisateurs } from "@/hooks/useParametres"
import { getRoleBadgeColor } from  "@/types/parametres"

export function StatsTab() {
  const { stats, loading } = useStatistiquesUtilisateurs()

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground mt-2">Chargement des statistiques...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">Impossible de charger les statistiques</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cartes KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUtilisateurs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tous les utilisateurs du système
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.utilisateursActifs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalUtilisateurs > 0 
                ? `${((stats.utilisateursActifs / stats.totalUtilisateurs) * 100).toFixed(1)}%`
                : '0%'
              } du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Inactifs</CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.utilisateursInactifs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalUtilisateurs > 0 
                ? `${((stats.utilisateursInactifs / stats.totalUtilisateurs) * 100).toFixed(1)}%`
                : '0%'
              } du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connexions Récentes</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.connexionsRecentes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dernières 24 heures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau par rôle */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par rôle</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.parRole && stats.parRole.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Total utilisateurs</TableHead>
                  <TableHead className="text-right">Actifs</TableHead>
                  <TableHead className="text-right">Connexions récentes</TableHead>
                  <TableHead className="text-right">Taux d'activité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.parRole.map((roleStats) => {
                  const activiteRate = roleStats.nombreUtilisateurs > 0
                    ? ((roleStats.utilisateursActifs / roleStats.nombreUtilisateurs) * 100).toFixed(1)
                    : '0'

                  return (
                    <TableRow key={roleStats.roleName}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getRoleBadgeColor(roleStats.roleName)}>
                            {roleStats.roleName.replace('_', ' ')}
                          </Badge>
                          {roleStats.roleDescription && (
                            <span className="text-xs text-muted-foreground">
                              {roleStats.roleDescription}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {roleStats.nombreUtilisateurs}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-600 font-medium">
                          {roleStats.utilisateursActifs}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-blue-600 font-medium">
                          {roleStats.connexionsRecentes}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={parseFloat(activiteRate) > 50 ? "default" : "secondary"}>
                          {activiteRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Aucune statistique par rôle disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Résumé global */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé global</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Taux d'activation</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {stats.totalUtilisateurs > 0
                    ? ((stats.utilisateursActifs / stats.totalUtilisateurs) * 100).toFixed(1)
                    : '0'
                  }%
                </span>
                <span className="text-sm text-muted-foreground">
                  des utilisateurs
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Taux de connexion</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {stats.utilisateursActifs > 0
                    ? ((stats.connexionsRecentes / stats.utilisateursActifs) * 100).toFixed(1)
                    : '0'
                  }%
                </span>
                <span className="text-sm text-muted-foreground">
                  des actifs
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Nombre de rôles</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {stats.parRole.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  rôle{stats.parRole.length > 1 ? 's' : ''} configuré{stats.parRole.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}