"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Shield, BarChart3, Settings as SettingsIcon } from "lucide-react"

// Import des composants d'onglets
import { UsersSearchTab } from "@/components/parametres/users-search-tab"
import { RolesTab } from "@/components/parametres/roles-tab"
import { StatsTab } from "@/components/parametres/stats-tab"
import { SystemTab } from "@/components/parametres/system-tab"

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState("users")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez les paramètres de l'application, les utilisateurs et les rôles
          </p>
        </div>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Rôles & Permissions
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Système
            </TabsTrigger>
          </TabsList>

          {/* Onglet Recherche Utilisateurs */}
          <TabsContent value="users">
            <UsersSearchTab />
          </TabsContent>

          {/* Onglet Gestion Rôles */}
          <TabsContent value="roles">
            <RolesTab />
          </TabsContent>

          {/* Onglet Statistiques */}
          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>

          {/* Onglet Paramètres Système */}
          <TabsContent value="system">
            <SystemTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}