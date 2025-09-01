"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Users, Plus, MoreHorizontal, Edit, Trash2, Settings, Building, Shield, Bell, Database } from "lucide-react"

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@safalu.ci",
    role: "Super Admin",
    status: "Actif",
    lastLogin: "2024-01-15 14:30",
    phone: "+225 07 12 34 56 78",
  },
  {
    id: 2,
    name: "Marie Kouassi",
    email: "marie.kouassi@safalu.ci",
    role: "Admin",
    status: "Actif",
    lastLogin: "2024-01-15 09:15",
    phone: "+225 05 98 76 54 32",
  },
  {
    id: 3,
    name: "Pierre Yao",
    email: "pierre.yao@safalu.ci",
    role: "Chef de Projet",
    status: "Actif",
    lastLogin: "2024-01-14 16:45",
    phone: "+225 01 23 45 67 89",
  },
  {
    id: 4,
    name: "Fatou Traoré",
    email: "fatou.traore@safalu.ci",
    role: "Comptable",
    status: "Inactif",
    lastLogin: "2024-01-10 11:20",
    phone: "+225 07 87 65 43 21",
  },
  {
    id: 5,
    name: "Koffi Assi",
    email: "koffi.assi@safalu.ci",
    role: "Commercial",
    status: "Actif",
    lastLogin: "2024-01-15 13:10",
    phone: "+225 05 11 22 33 44",
  },
]

const roleColors = {
  "Super Admin": "bg-red-100 text-red-800",
  Admin: "bg-blue-100 text-blue-800",
  "Chef de Projet": "bg-green-100 text-green-800",
  Comptable: "bg-purple-100 text-purple-800",
  Commercial: "bg-orange-100 text-orange-800",
  "Sous-traitant": "bg-gray-100 text-gray-800",
}

export default function ParametresPage() {
  const [users, setUsers] = useState(mockUsers)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const handleAddUser = (userData: any) => {
    const newUser = {
      id: users.length + 1,
      ...userData,
      status: "Actif",
      lastLogin: "Jamais connecté",
    }
    setUsers([...users, newUser])
    setIsAddUserOpen(false)
  }

  const handleEditUser = (user: any) => {
    setEditingUser(user)
  }

  const handleDeleteUser = (userId: number) => {
    setUsers(users.filter((user) => user.id !== userId))
  }

  const UserForm = ({ user, onSave, onCancel }: any) => {
    const [formData, setFormData] = useState({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.role || "Commercial",
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nom complet</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="role">Rôle</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Chef de Projet">Chef de Projet</SelectItem>
                <SelectItem value="Comptable">Comptable</SelectItem>
                <SelectItem value="Commercial">Commercial</SelectItem>
                <SelectItem value="Sous-traitant">Sous-traitant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit">{user ? "Modifier" : "Ajouter"}</Button>
        </DialogFooter>
      </form>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Gérez les paramètres de l'application et les utilisateurs</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Entreprise
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Système
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestion des utilisateurs</CardTitle>
                    <CardDescription>Gérez les comptes utilisateurs et leurs permissions</CardDescription>
                  </div>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Ajouter un utilisateur
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Ajouter un utilisateur</DialogTitle>
                        <DialogDescription>Créez un nouveau compte utilisateur</DialogDescription>
                      </DialogHeader>
                      <UserForm onSave={handleAddUser} onCancel={() => setIsAddUserOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Rôle</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière connexion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">{user.email}</div>
                              <div className="text-sm text-muted-foreground">{user.phone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={roleColors[user.role as keyof typeof roleColors]}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.status === "Actif" ? "default" : "secondary"}>{user.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
                <CardDescription>Gérez les informations de votre entreprise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name">Nom de l'entreprise</Label>
                    <Input id="company-name" defaultValue="SAF ALU-CI" />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Email</Label>
                    <Input id="company-email" defaultValue="contact@safalu.ci" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-phone">Téléphone</Label>
                    <Input id="company-phone" defaultValue="+225 27 20 12 34 56" />
                  </div>
                  <div>
                    <Label htmlFor="company-website">Site web</Label>
                    <Input id="company-website" defaultValue="www.safalu.ci" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-address">Adresse</Label>
                  <Textarea id="company-address" defaultValue="Zone Industrielle de Yopougon, Abidjan, Côte d'Ivoire" />
                </div>
                <Button>Sauvegarder les modifications</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de notifications</CardTitle>
                <CardDescription>Configurez les notifications de l'application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">Notifications SMS</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des notifications par SMS</p>
                  </div>
                  <Switch id="sms-notifications" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="project-alerts">Alertes de projets</Label>
                    <p className="text-sm text-muted-foreground">Alertes pour les projets en retard</p>
                  </div>
                  <Switch id="project-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment-alerts">Alertes de paiement</Label>
                    <p className="text-sm text-muted-foreground">Alertes pour les paiements en retard</p>
                  </div>
                  <Switch id="payment-alerts" defaultChecked />
                </div>
                <Button>Sauvegarder les préférences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Paramètres système</CardTitle>
                  <CardDescription>Configuration générale du système</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language">Langue</Label>
                    <Select defaultValue="fr">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select defaultValue="africa/abidjan">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="africa/abidjan">Africa/Abidjan (GMT+0)</SelectItem>
                        <SelectItem value="europe/paris">Europe/Paris (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Devise</Label>
                    <Select defaultValue="xof">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xof">Franc CFA (XOF)</SelectItem>
                        <SelectItem value="eur">Euro (EUR)</SelectItem>
                        <SelectItem value="usd">Dollar US (USD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>Sauvegarder la configuration</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sauvegarde et sécurité</CardTitle>
                  <CardDescription>Gestion des sauvegardes et de la sécurité</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Sauvegarde automatique</Label>
                      <p className="text-sm text-muted-foreground">Sauvegarde quotidienne des données</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Authentification à deux facteurs</Label>
                      <p className="text-sm text-muted-foreground">Sécurité renforcée pour les connexions</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Database className="mr-2 h-4 w-4" />
                      Créer une sauvegarde
                    </Button>
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Audit de sécurité
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modifier l'utilisateur</DialogTitle>
                <DialogDescription>Modifiez les informations de l'utilisateur</DialogDescription>
              </DialogHeader>
              <UserForm
                user={editingUser}
                onSave={(userData: any) => {
                  setUsers(users.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u)))
                  setEditingUser(null)
                }}
                onCancel={() => setEditingUser(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
