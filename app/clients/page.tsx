"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientFormModal } from "@/components/clients/client-form-modal"
import { Client, } from "@/types/clients"
import { useClientActions, useClientsList, useClientStatistiques } from "@/hooks/useClients"
import { Plus, Search, Building2, User, Mail, Phone, MapPin, Trash2, Edit, Eye } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useAuth, usePermissions } from "@/contexts/AuthContext"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientsPage() {
    const [filteredClients, setFilteredClients] = useState<Client[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [showFormModal, setShowFormModal] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | undefined>()
    const [clientToDelete, setClientToDelete] = useState<number | null>(null)

    const router = useRouter()
    const { user } = useAuth()
    const { canManageClients } = usePermissions()
    const canAccessClients = !!canManageClients()

    // Hooks personnalisés
    const { clients, loading: clientLoading, error: devisError, refreshCliens } = useClientsList()
    const {createClient,updateClient,deleteClient,loading : actionLoading} = useClientActions()
    const {stats, loading: statsLoading, refreshStats,}= useClientStatistiques()
    
    // Debug logs
    console.log('🔍 Debug clients:', { clients, clientLoading, devisError })
    console.log('🔍 Debug stats:', { stats, statsLoading })
    // Vérification des permissions
    useEffect(() => {
        if (user && !canAccessClients) {
            console.log('🚫 Accès refusé - Permissions insuffisantes pour les clients')
            router.push("/dashboard")
            return
        } 
    }, [user, canAccessClients, router])

    // Filtrage des clients
    useEffect(() => {
        // S'assurer que clients est un tableau avant de le filtrer
        let filtered = Array.isArray(clients) ? clients : []

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            filtered = filtered.filter(
                (client) =>
                    client.nom.toLowerCase().includes(searchLower) ||
                    client.designation?.toLowerCase().includes(searchLower) ||
                    client.telephone?.toLowerCase().includes(searchLower)
            )
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((client) => client.status === statusFilter)
        }

        if (typeFilter !== "all") {
            filtered = filtered.filter((client) => client.typeClient === typeFilter)
        }

        setFilteredClients(filtered)
        console.log('🔍 Clients originaux:', clients)
        console.log('🔍 Clients filtrés:', filtered)
        console.log('🔍 Nombre de clients filtrés:', filtered.length)
    }, [clients, searchTerm, statusFilter, typeFilter])

  // État devis en édition
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  // Gestionnaire création/modification
  const handleSubmitClients = async (newClientData: any) => {
    try {
      const response = editingClient
        ? await updateClient(editingClient.id, newClientData)
        : await createClient(newClientData)
      toast({
        title: editingClient ? "Client modifié" : "Client créé",
        description: response.message || (editingClient ? "Le Client a été modifié avec succès" : "Le Client a été créé avec succès"),
      })
      refreshCliens()
      refreshStats()
      setShowFormModal(false)
      setEditingClient(null)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : (editingClient ? "Erreur lors de la modification du devis" : "Erreur lors de la création du devis"),
        variant: "destructive",
      })
    }
  }
  const handleDeleteClient = async (clientId: number) => {
    try {
      await deleteClient(clientId)
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
      })
      refreshCliens()
      refreshStats()
      setClientToDelete(null)
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression du client",
        variant: "destructive",
      })
    }
  }
  const getStatusBadge = (status: string | null) => {
    const variants: Record<string, { label: string; className: string }> = {
        actif: { label: "Actif", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
        inactif: { label: "Inactif", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
        prospect: { label: "Prospect", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
    }
    
    //  Gérer le cas null
    if (!status) {
        return <Badge className="bg-gray-100 text-gray-800">Non défini</Badge>
    }
    
    const variant = variants[status.toLowerCase()] || variants.prospect
    return <Badge className={variant.className}>{variant.label}</Badge>
}
    // Vérification des permissions avant rendu
    if (!user || !canManageClients) {
        return null
    }
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Clients</h1>
                        <p className="text-muted-foreground">Gérez vos clients et prospects</p>
                    </div>
                    <Button
                        onClick={() => {
                            setSelectedClient(undefined)
                            setShowFormModal(true)
                        }}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau client
                    </Button>
                </div>

                {/* Affichage des erreurs */}
                {devisError && (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="text-red-600">
                                <strong>Erreur lors du chargement des clients:</strong> {devisError}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total clients</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{stats?.totalClients || 0}</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Clients actifs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{stats?.totalActifs || 0}</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Prospects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{stats?.totalProspects || 0}</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Entreprises</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {statsLoading ? (
                                <Skeleton className="h-8 w-16" />
                            ) : (
                                <div className="text-2xl font-bold">{stats?.totalEntreprises || 0}</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher un client..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les types</SelectItem>
                                    <SelectItem value="particulier">Particulier</SelectItem>
                                    <SelectItem value="entreprise">Entreprise</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="actif">Actif</SelectItem>
                                    <SelectItem value="prospect">Prospect</SelectItem>
                                    <SelectItem value="inactif">Inactif</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Clients Grid */}
                {clientLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-12 w-12 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-32" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-6 w-16" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-28" />
                                    </div>
                                    <div className="flex border-t grid grid-cols-3 gap-2 text-center pt-3">
                                        <div className="space-y-1">
                                            <Skeleton className="h-6 w-8 mx-auto" />
                                            <Skeleton className="h-3 w-12 mx-auto" />
                                        </div>
                                        <div className="space-y-1">
                                            <Skeleton className="h-6 w-8 mx-auto" />
                                            <Skeleton className="h-3 w-10 mx-auto" />
                                        </div>
                                        <div className="space-y-1">
                                            <Skeleton className="h-6 w-12 mx-auto" />
                                            <Skeleton className="h-3 w-16 mx-auto" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-3">
                                        <Skeleton className="h-8 flex-1" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredClients.map((client) => (
                        <Card key={client.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            {client.typeClient === "entreprise" ? (
                                                <Building2 className="h-6 w-6 text-primary" />
                                            ) : (
                                                <User className="h-6 w-6 text-primary" />
                                            )}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{client.nom}</CardTitle>
                                            {client.designation && <p className="text-sm text-muted-foreground">{client.designation}</p>}
                                        </div>
                                    </div>
                                    {getStatusBadge(client.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{client.telephone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">
                                        {client.ville}
                                    </span>
                                </div>

                                <div className="flex border-t grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-lg font-bold">{client.statistique.totalProjets}</div>
                                        <div className="text-xs text-muted-foreground">Projets</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">{client.statistique.totalDevis}</div>
                                        <div className="text-xs text-muted-foreground">Devis</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">{(client.statistique.totalRevenue / 1000).toFixed(0)}K</div>
                                        <div className="text-xs text-muted-foreground">CA (FCFA)</div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3">
                                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                                        <Eye className="h-4 w-4 mr-1" />
                                        Détails
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditingClient(client)
                                            setShowFormModal(true)
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setClientToDelete(client.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                )}

                {!clientLoading && filteredClients.length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">Aucun client trouvé</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Form Modal */}
            <ClientFormModal
                open={showFormModal}
                onOpenChange={(open) => {
                    setShowFormModal(open)
                    if (!open) {
                        setEditingClient(null)
                        setSelectedClient(undefined)
                    }
                }}
                onSubmit={handleSubmitClients}
                client={editingClient || selectedClient}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    )
}
