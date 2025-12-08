"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronLeft, ChevronRight, Loader2, Users, UserPlus, RefreshCw } from "lucide-react"
import { useSearchUtilisateurs } from "@/hooks/useParametres"
import { getRoleBadgeColor } from "@/types/parametres"
import { InviteUserModal } from "./invite-user-modal"

export function UsersSearchTab() {
  const { results, loading, search } = useSearchUtilisateurs()
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const pageSize = 10

  // Lancer la recherche au chargement et lors des changements de filtres
  useEffect(() => {
    handleSearch()
  }, [currentPage, roleFilter, statusFilter])
  
  const handleSearch = () => {
    search({
      SearchTerm: searchTerm || undefined,
      RoleFilter: roleFilter !== "all" ? roleFilter : undefined,
      StatusFilter: statusFilter !== "all" ? (statusFilter === "active") : undefined,
      PageNumber: currentPage,
      PageSize: pageSize
    })
  }

  const handleSearchClick = () => {
    setCurrentPage(1) // Reset à la page 1 lors d'une nouvelle recherche
    handleSearch()
  }

  const handleInviteSuccess = () => {
    // Rafraîchir la liste après invitation
    handleSearch()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recherche d'utilisateurs</CardTitle>
              <CardDescription>Recherchez et filtrez les utilisateurs du système</CardDescription>
            </div>
            <Button onClick={() => setIsInviteModalOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Inviter un utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barre de recherche et filtres */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email, username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="chef_projet">Chef de Projet</SelectItem>
                  <SelectItem value="comptable">Comptable</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="sous_traitant">Sous-traitant</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="inactive">Inactifs</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearchClick} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recherche...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                size="icon"
                onClick={handleSearch}
                disabled={loading}
                title="Actualiser"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* Tableau des résultats */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Chargement des utilisateurs...</p>
              </div>
            ) : results && results.utilisateurs?.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom complet</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Dernière connexion</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.utilisateurs.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.nomComplet}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                          <TableCell>
                            {user.roleName && (
                              <Badge variant="outline" className={getRoleBadgeColor(user.roleName)}>
                                {user.roleName.replace('_', ' ')}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{user.telephone || '-'}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {user.derniereConnexion 
                              ? new Date(user.derniereConnexion).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : 'Jamais'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.actif ? "default" : "secondary"}>
                              {user.actif ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {results.currentPage} sur {results.totalPages} ({results.totalRecords} résultat{results.totalRecords > 1 ? 's' : ''})
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(results.totalPages, p + 1))}
                      disabled={currentPage === results.totalPages || loading}
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 border rounded-md bg-muted/10">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Aucun résultat trouvé</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal d'invitation */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
      />
    </>
  )
}