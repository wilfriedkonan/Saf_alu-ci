"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Building2,
  LayoutDashboard,
  FileText,
  Hammer,
  Receipt,
  Users,
  Wallet,
  UserCog,
  Bell,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  ChevronDown,
  ClipboardList,
  ArrowLeftRight,
  BarChart3,
  Settings,
  BookOpen,
  PenLine,
  BookText,
  Scale,
  FolderOpen,
  History,
  FolderKanban,
  Landmark,
} from "lucide-react"
import { hasPermission, Utilisateur, type Utilisateur as AuthUser } from "@/types/Utilisateurs"
import { getStoredUser, setStoredUser } from "@/lib/auth"
import { useAuth, usePermissions } from "@/contexts/AuthContext"


interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge: boolean
  permission: string
}

const projetsSubNav: NavigationItem[] = [
{ name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard, badge: false , permission: "dashboard" },
  { name: "Devis", href: "/devis", icon: FileText, badge: false , permission: "devis" },
  { name: "Projets", href: "/projets", icon: Hammer, badge: false , permission: "projets" },
  { name: "DQE", href: "/dqe", icon: Bell, badge: false , permission: "dqe" },
  { name: "Factures", href: "/factures", icon: Receipt, badge: false , permission: "factures" },
  { name: "Clients", href: "/clients", icon: Users, badge: false , permission: "clients" },
  { name: "Sous-traitants", href: "/sous-traitants", badge: false , icon: Users, permission: "sous_traitants" },
  { name: "Trésorerie", href: "/tresorerie", icon: Wallet, badge: false , permission: "tresorerie" },
  { name: "Paramètres", href: "/parametres", icon: UserCog, badge: false , permission: "utilisateurs" },
  { name: "Notifications", href: "/notifications", icon: Bell, badge: true , permission: "notifications" },

]

// Routes that belong to Gestion de Projets accordion
const projetsRoutes = ["/dashboard", "/devis", "/projets", "/dqe", "/factures", "/clients", "/sous-traitants", "/tresorerie", "/notifications"]
// Stock sub-navigation
const stockSubNav = [
  { name: "Tableau de bord", href: "/stock", icon: LayoutDashboard },
  { name: "Inventaire & Stocks", href: "/stock/inventaire", icon: Package },
  { name: "Demandes", href: "/stock/demandes", icon: ClipboardList },
  { name: "Mouvements", href: "/stock/mouvements", icon: ArrowLeftRight },
  { name: "Rapports", href: "/stock/rapports", icon: BarChart3 },
  { name: "Configuration", href: "/stock/configuration", icon: Settings },
]
interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
/*   const [user, setUser] = useState<Utilisateur | null>(() => getStoredUser())
 */  

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [projetsExpanded, setProjetsExpanded] = useState(false)
  const [stockExpanded, setStockExpanded] = useState(false)
  const [notificationsCount, setNotificationsCount] = useState(0)
  const router = useRouter();
  const { user } = useAuth();  
  const pathname = usePathname()

// Auto-expand accordions if on relevant routes
  useEffect(() => {
    if (projetsRoutes.some(route => pathname === route || pathname.startsWith(route + "/"))) {
      setProjetsExpanded(true)
    }
    if (pathname.startsWith("/stock")) {
      setStockExpanded(true)
    }
  }, [pathname])

  // Fetch notifications count for badge (mock)
  useEffect(() => {
    setNotificationsCount(2)
  }, [])

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [router, user])

  useEffect(() => {
    
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("user")
    setStoredUser(null)
    router.push("/")
  }

  if (!user) {
    return null
  }

  const filteredNavigation = projetsSubNav.filter((item) => hasPermission(user, item.permission))

   return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
     
        <div className="fixed inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r">
          <div className="flex h-16 items-center px-6">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">SAF ALU-CI</span>
          </div>
          {/* Scrollable navigation area */}
          <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 sidebar-nav">
            <ul className="space-y-1">
              {/* Gestion de Projets Accordion */}
              <li>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between",
                      projetsRoutes.some(r => pathname === r || pathname.startsWith(r + "/")) && "bg-[var(--hover-green)] text-white hover:bg-[var(--hover-green)]/90 hover:text-white"
                    )}
                    onClick={() => setProjetsExpanded(!projetsExpanded)}
                  >
                    <span className="flex items-center">
                      <FolderKanban className="mr-3 h-5 w-5" />
                      Gestion de Projets
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        projetsExpanded && "rotate-180"
                      )}
                    />
                  </Button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      projetsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="pl-8 space-y-1 pt-1">
                      {filteredNavigation.map((subItem) => (
                        <li key={subItem.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm h-8",
                              pathname === subItem.href
                                ? "text-[#1e3a5f] font-medium bg-blue-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}
                            onClick={() => {
                              router.push(subItem.href)
                              setSidebarOpen(false)
                            }}
                          >
                            <subItem.icon className="mr-2 h-3.5 w-3.5" />
                            <span className="flex-1 text-left">{subItem.name}</span>
                            {subItem.badge && notificationsCount > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                {notificationsCount}
                              </span>
                            )}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>

              {/* Gestion de Stock Accordion */}
              <li>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between",
                      pathname.startsWith("/stock") && "bg-[#1e3a5f] text-white hover:bg-[#15293f] hover:text-white"
                    )}
                    onClick={() => setStockExpanded(!stockExpanded)}
                  >
                    <span className="flex items-center">
                      <Package className="mr-3 h-5 w-5" />
                      Gestion de Stock
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        stockExpanded && "rotate-180"
                      )}
                    />
                  </Button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      stockExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="pl-8 space-y-1 pt-1">
                      {stockSubNav.map((subItem) => (
                        <li key={subItem.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm h-8",
                              pathname === subItem.href
                                ? "text-[#1e3a5f] font-medium bg-blue-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}
                            onClick={() => {
                              router.push(subItem.href)
                              setSidebarOpen(false)
                            }}
                          >
                            <subItem.icon className="mr-2 h-3.5 w-3.5" />
                            {subItem.name}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>

              {/* Comptabilite Accordion */}
              {/* <li>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between",
                      pathname.startsWith("/comptabilite") && "bg-[#1e3a5f] text-white hover:bg-[#15293f] hover:text-white"
                    )}
                    onClick={() => setComptaExpanded(!comptaExpanded)}
                  >
                    <span className="flex items-center">
                      <BookOpen className="mr-3 h-5 w-5" />
                      Comptabilite
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        comptaExpanded && "rotate-180"
                      )}
                    />
                  </Button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      comptaExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="pl-8 space-y-1 pt-1">
                      {comptaSubNav.map((subItem) => (
                        <li key={subItem.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm h-8",
                              pathname === subItem.href
                                ? "text-[#1e3a5f] font-medium bg-blue-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}
                            onClick={() => {
                              router.push(subItem.href)
                              setSidebarOpen(false)
                            }}
                          >
                            <subItem.icon className="mr-2 h-3.5 w-3.5" />
                            <span className="flex-1 text-left">{subItem.name}</span>
                            {subItem.badge && comptaDemandesCount > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                {comptaDemandesCount}
                              </span>
                            )}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li> */}

              {/* Parametres - standalone entry */}
              <li>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push("/parametres")
                    setSidebarOpen(false)
                  }}
                >
                  <Settings className="mr-3 h-5 w-5" />
                  Parametres
                </Button>
              </li>
            </ul>
          </nav>
          {/* Footer - fixed, never scrolls */}
          <div className="flex-none border-t border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user.Nom.split(" ").map((n) => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.Nom}</p>
                <p className="text-xs text-gray-500 truncate">{user.Email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col bg-card border-r border-gray-200 z-40 transition-all duration-300",
          sidebarCollapsed ? "lg:w-16" : "lg:w-64",
        )}
      >
        {/* Logo / Header - fixed, never scrolls */}
        <div className="flex-none h-16 flex items-center justify-center gap-1 px-2 border-b border-gray-100">
          {!sidebarCollapsed && (
            <div className="flex flex-1 min-w-0 items-center gap-2 px-2">
              <Building2 className="h-8 w-8 shrink-0 text-primary" />
              <span className="text-xl font-bold truncate">SAF ALU-CI</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8 p-0 shrink-0"
            aria-label={sidebarCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            title={sidebarCollapsed ? "Développer" : "Réduire"}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Scrollable navigation area */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 sidebar-nav">
          <ul className="space-y-1">
            {/* Gestion de Projets Accordion - Desktop */}
            <li>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full transition-all duration-200",
                    sidebarCollapsed ? "justify-center px-2" : "justify-between px-4",
                    projetsRoutes.some(r => pathname === r || pathname.startsWith(r + "/")) && "bg-[var(--hover-green)] text-white hover:bg-[var(--hover-green)]/90 hover:text-white"
                  )}
                  onClick={() => {
                    if (sidebarCollapsed) {
                      setSidebarCollapsed(false)
                      setProjetsExpanded(true)
                    } else {
                      setProjetsExpanded(!projetsExpanded)
                    }
                  }}
                  title={sidebarCollapsed ? "Gestion de Projets" : undefined}
                >
                  <span className={cn("flex items-center", sidebarCollapsed && "justify-center")}>
                    <FolderKanban className={cn("h-5 w-5", !sidebarCollapsed && "mr-3")} />
                    {!sidebarCollapsed && <span>Gestion de Projets</span>}
                  </span>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        projetsExpanded && "rotate-180"
                      )}
                    />
                  )}
                </Button>
                {!sidebarCollapsed && (
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      projetsExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="pl-8 space-y-1 pt-1">
                      {filteredNavigation.map((subItem) => (
                        <li key={subItem.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm h-8",
                              pathname === subItem.href
                                ? "text-[#1e3a5f] font-medium bg-blue-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}
                            onClick={() => router.push(subItem.href)}
                          >
                            <subItem.icon className="mr-2 h-3.5 w-3.5" />
                            <span className="flex-1 text-left">{subItem.name}</span>
                            {subItem.badge && notificationsCount > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                                {notificationsCount}
                              </span>
                            )}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>

            {/* Gestion de Stock Accordion - Desktop */}
            <li>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full transition-all duration-200",
                    sidebarCollapsed ? "justify-center px-2" : "justify-between px-4",
                    pathname.startsWith("/stock") && "bg-[#1e3a5f] text-white hover:bg-[#15293f] hover:text-white"
                  )}
                  onClick={() => {
                    if (sidebarCollapsed) {
                      setSidebarCollapsed(false)
                      setStockExpanded(true)
                    } else {
                      setStockExpanded(!stockExpanded)
                    }
                  }}
                  title={sidebarCollapsed ? "Gestion de Stock" : undefined}
                >
                  <span className={cn("flex items-center", sidebarCollapsed && "justify-center")}>
                    <Package className={cn("h-5 w-5", !sidebarCollapsed && "mr-3")} />
                    {!sidebarCollapsed && <span>Gestion de Stock</span>}
                  </span>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        stockExpanded && "rotate-180"
                      )}
                    />
                  )}
                </Button>
                {!sidebarCollapsed && (
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-200",
                      stockExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <ul className="pl-8 space-y-1 pt-1">
                      {stockSubNav.map((subItem) => (
                        <li key={subItem.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "w-full justify-start text-sm h-8",
                              pathname === subItem.href
                                ? "text-[#1e3a5f] font-medium bg-blue-50"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}
                            onClick={() => router.push(subItem.href)}
                          >
                            <subItem.icon className="mr-2 h-3.5 w-3.5" />
                            {subItem.name}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </li>


            {/* Parametres - standalone entry */}
            <li>
              <Button
                variant="ghost"
                className={cn(
                  "w-full transition-all duration-200",
                  sidebarCollapsed ? "justify-center px-2" : "justify-start px-4",
                )}
                onClick={() => router.push("/parametres")}
                title={sidebarCollapsed ? "Parametres" : undefined}
              >
                <Settings className={cn("h-5 w-5", !sidebarCollapsed && "mr-3")} />
                {!sidebarCollapsed && <span>Parametres</span>}
              </Button>
            </li>
          </ul>
        </nav>
          
          {/* Footer - fixed, never scrolls */}
          {!sidebarCollapsed && (
            <div className="flex-none border-t border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {user.Nom.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.Nom}</p>
                  <p className="text-xs text-gray-500 truncate">{user.Email}</p>
                </div>
              </div>
            </div>
          )}
      </aside>

      {/* Main content */}
      <div className={cn("transition-all duration-300", sidebarCollapsed ? "lg:pl-16" : "lg:pl-64")}>
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.Nom
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.Nom}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.Email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
