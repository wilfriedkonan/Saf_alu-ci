"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, XCircle, Search, Filter } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  category: "project" | "invoice" | "quote" | "system" | "user"
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Nouveau devis validé",
    message: "Le devis #DEV-2024-001 pour la rénovation de la cuisine a été validé par le client Dupont.",
    type: "success",
    category: "quote",
    isRead: false,
    createdAt: "2024-01-15T10:30:00Z",
    actionUrl: "/devis/1",
  },
  {
    id: "2",
    title: "Projet en retard",
    message: "Le projet 'Extension maison Martin' a dépassé sa date de fin prévue. Action requise.",
    type: "warning",
    category: "project",
    isRead: false,
    createdAt: "2024-01-15T09:15:00Z",
    actionUrl: "/projets/2",
  },
  {
    id: "3",
    title: "Facture impayée",
    message: "La facture #FAC-2024-015 de 2 500€ est en retard de paiement (échéance dépassée de 15 jours).",
    type: "error",
    category: "invoice",
    isRead: true,
    createdAt: "2024-01-14T16:45:00Z",
    actionUrl: "/factures/15",
  },
  {
    id: "4",
    title: "Nouveau sous-traitant inscrit",
    message: "Électricité Pro s'est inscrit sur la plateforme et attend validation.",
    type: "info",
    category: "user",
    isRead: false,
    createdAt: "2024-01-14T14:20:00Z",
    actionUrl: "/sous-traitants",
  },
  {
    id: "5",
    title: "Seuil de trésorerie atteint",
    message: "Le solde du compte principal est descendu sous le seuil d'alerte de 10 000€.",
    type: "warning",
    category: "system",
    isRead: true,
    createdAt: "2024-01-13T11:30:00Z",
    actionUrl: "/tresorerie",
  },
  {
    id: "6",
    title: "Évaluation sous-traitant",
    message: "N'oubliez pas d'évaluer le travail de Plomberie Express sur le projet Villa Moderne.",
    type: "info",
    category: "project",
    isRead: false,
    createdAt: "2024-01-12T08:00:00Z",
    actionUrl: "/projets/5",
  },
]

const notificationSettings = {
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  projectUpdates: true,
  invoiceReminders: true,
  quoteValidations: true,
  systemAlerts: true,
  weeklyReports: false,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [settings, setSettings] = useState(notificationSettings)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Succès
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Attention
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Erreur</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      project: "Projet",
      invoice: "Facture",
      quote: "Devis",
      system: "Système",
      user: "Utilisateur",
    }
    return labels[category as keyof typeof labels] || category
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "À l'instant"
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    if (diffInHours < 48) return "Hier"
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)))
  }

  const markAsUnread = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, isRead: false } : notif)))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const filteredNotifications = notifications.filter((notif) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !notif.isRead) ||
      (filter === "read" && notif.isRead) ||
      notif.category === filter

    const matchesSearch =
      searchTerm === "" ||
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Gérez vos notifications et paramètres d'alerte</p>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notifications récentes</CardTitle>
                    <CardDescription>
                      {unreadCount} notification{unreadCount !== 1 ? "s" : ""} non lue{unreadCount !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button onClick={markAllAsRead} variant="outline" size="sm">
                    <Check className="h-4 w-4 mr-2" />
                    Tout marquer comme lu
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher dans les notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="unread">Non lues</SelectItem>
                      <SelectItem value="read">Lues</SelectItem>
                      <SelectItem value="project">Projets</SelectItem>
                      <SelectItem value="invoice">Factures</SelectItem>
                      <SelectItem value="quote">Devis</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                      <SelectItem value="user">Utilisateurs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Aucune notification trouvée</div>
                  ) : (
                    filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border rounded-lg transition-colors ${
                          !notification.isRead
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                            : "bg-background"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className={`font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                                {notification.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                {getNotificationBadge(notification.type)}
                                <Badge variant="outline" className="text-xs">
                                  {getCategoryLabel(notification.category)}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(notification.createdAt)}
                              </span>
                              <div className="flex items-center gap-2">
                                {notification.actionUrl && (
                                  <Button variant="outline" size="sm">
                                    Voir détails
                                  </Button>
                                )}
                                {!notification.isRead ? (
                                  <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button variant="ghost" size="sm" onClick={() => markAsUnread(notification.id)}>
                                    Marquer non lu
                                  </Button>
                                )}
                                <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de notification</CardTitle>
                <CardDescription>Configurez vos préférences de notification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Canaux de notification</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-notifications">Notifications par email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recevoir les notifications importantes par email
                        </p>
                      </div>
                      <Switch
                        id="email-notifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, emailNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sms-notifications">Notifications par SMS</Label>
                        <p className="text-sm text-muted-foreground">Recevoir les alertes urgentes par SMS</p>
                      </div>
                      <Switch
                        id="sms-notifications"
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, smsNotifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-notifications">Notifications push</Label>
                        <p className="text-sm text-muted-foreground">Recevoir les notifications dans le navigateur</p>
                      </div>
                      <Switch
                        id="push-notifications"
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Types de notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="project-updates">Mises à jour de projets</Label>
                        <p className="text-sm text-muted-foreground">Changements d'état, retards, validations</p>
                      </div>
                      <Switch
                        id="project-updates"
                        checked={settings.projectUpdates}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, projectUpdates: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="invoice-reminders">Rappels de factures</Label>
                        <p className="text-sm text-muted-foreground">Échéances, retards de paiement</p>
                      </div>
                      <Switch
                        id="invoice-reminders"
                        checked={settings.invoiceReminders}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, invoiceReminders: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="quote-validations">Validations de devis</Label>
                        <p className="text-sm text-muted-foreground">Acceptation, refus, demandes de modification</p>
                      </div>
                      <Switch
                        id="quote-validations"
                        checked={settings.quoteValidations}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, quoteValidations: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="system-alerts">Alertes système</Label>
                        <p className="text-sm text-muted-foreground">Seuils de trésorerie, maintenance, sécurité</p>
                      </div>
                      <Switch
                        id="system-alerts"
                        checked={settings.systemAlerts}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, systemAlerts: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weekly-reports">Rapports hebdomadaires</Label>
                        <p className="text-sm text-muted-foreground">Résumé d'activité chaque lundi</p>
                      </div>
                      <Switch
                        id="weekly-reports"
                        checked={settings.weeklyReports}
                        onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, weeklyReports: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button>Sauvegarder les paramètres</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
