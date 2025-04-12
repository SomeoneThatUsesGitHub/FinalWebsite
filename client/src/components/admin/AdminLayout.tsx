import React from "react";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Clipboard,
  Tag,
  Users,
  Megaphone,
  Video,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Radio,
  Mail,
  ClipboardList,
  MessageSquareText,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

type NavItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  disabled?: boolean;
  isSeparator?: boolean;
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [location, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Navigation items
  const mainNavItems: NavItem[] = [
    {
      name: "Tableau de bord",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Articles",
      href: "/admin/articles",
      icon: FileText,
    },
    {
      name: "Catégories",
      href: "/admin/categories",
      icon: Tag,
      disabled: user ? (!user.isAdmin && user.role !== "admin") : false,
    },
    {
      name: "Flash infos",
      href: "/admin/flash-infos",
      icon: Megaphone,
      disabled: false,
    },
    {
      name: "Vidéos",
      href: "/admin/videos",
      icon: Video,
      disabled: false,
    },
    {
      name: "Directs",
      href: "/admin/directs",
      icon: Radio,
      disabled: false, // Les éditeurs ont accès aux directs
    },
    {
      name: "Utilisateurs",
      href: "/admin/users",
      icon: Users,
      disabled: user ? (!user.isAdmin && user.role !== "admin") : false,
    },
    {
      name: "Équipe",
      href: "/admin/team",
      icon: Users,
      disabled: user ? (!user.isAdmin && user.role !== "admin") : false,
    },
    {
      name: "Newsletter",
      href: "/admin/newsletter",
      icon: Mail,
      disabled: user ? (!user.isAdmin && user.role !== "admin") : false,
    },
    {
      name: "Candidatures",
      href: "/admin/applications",
      icon: ClipboardList,
      disabled: user ? (!user.isAdmin && user.role !== "admin") : false,
    },
    {
      name: "Messages de contact",
      href: "/admin/messages",
      icon: MessageSquareText,
      disabled: user ? (!user.isAdmin && user.role !== "admin") : false,
    },
    {
      name: "Contenu éducatif",
      href: "/admin/contenu-educatif",
      icon: GraduationCap,
      disabled: user ? (!user.isAdmin && user.role !== "admin") : false,
    },
    {
      name: "Notes Éditoriales",
      href: "/admin/notes",
      icon: Clipboard,
      disabled: true,
    },
  ];

  // Fonction pour déterminer si un élément de nav est actif
  const isActive = (href: string) => {
    if (href === "/admin" && location === "/admin") {
      return true;
    }
    return href !== "/admin" && location.startsWith(href);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/auth");
  };

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar pour desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow border-r border-border bg-card">
          <div className="px-4 py-5 flex items-center border-b border-border h-16">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-[#001158] rounded-full overflow-hidden w-8 h-8 mr-2">
                <img 
                  src="/Logos%20Politiquensemble.png" 
                  alt="Logo Politiquensemble" 
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="text-xl font-semibold">Admin</span>
              <span className="ml-2 text-muted-foreground text-xs bg-muted px-1.5 py-0.5 rounded">
                Politiquensemble
              </span>
            </div>
          </div>
          <div className="flex-grow flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4 space-y-1">
              {mainNavItems.map((item) =>
                item.isSeparator ? (
                  <div key={item.name} className="border-t border-border my-3" />
                ) : (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start text-sm font-medium",
                      isActive(item.href)
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground",
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => !item.disabled && setLocation(item.href)}
                    disabled={item.disabled}
                  >
                    <item.icon
                      className={cn("h-4 w-4 mr-3", item.disabled && "opacity-50")}
                    />
                    {item.name}
                  </Button>
                )
              )}
            </nav>
          </div>
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{user?.username || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.role === "admin" || user?.isAdmin 
                      ? "Administrateur" 
                      : user?.role === "editor" 
                        ? "Éditeur" 
                        : "Utilisateur"}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => {}} disabled>
                    <Settings className="h-4 w-4 mr-2" /> Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    disabled={logoutMutation.isPending}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutMutation.isPending ? "Déconnexion..." : "Se déconnecter"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[300px] p-0">
          <SheetHeader className="px-4 py-5 border-b border-border h-16">
            <SheetTitle className="text-left flex items-center">
              <div className="bg-[#001158] rounded-full overflow-hidden w-8 h-8 mr-2">
                <img 
                  src="/Logos%20Politiquensemble.png" 
                  alt="Logo Politiquensemble" 
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="font-semibold text-xl">Admin</span>
              <span className="ml-2 text-muted-foreground text-xs bg-muted px-1.5 py-0.5 rounded">
                Politiquensemble
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="px-3 py-4">
            <nav className="space-y-1">
              {mainNavItems.map((item) =>
                item.isSeparator ? (
                  <div key={item.name} className="border-t border-border my-3" />
                ) : (
                  <Button
                    key={item.name}
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "w-full justify-start text-sm font-medium",
                      item.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!item.disabled) {
                        setLocation(item.href);
                        setSidebarOpen(false);
                      }
                    }}
                    disabled={item.disabled}
                  >
                    <item.icon className="h-4 w-4 mr-3" />
                    {item.name}
                  </Button>
                )
              )}
            </nav>
          </div>
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.username || "Utilisateur"}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role === "admin" || user?.isAdmin
                    ? "Administrateur"
                    : user?.role === "editor"
                      ? "Éditeur"
                      : "Utilisateur"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3 text-red-600"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? "Déconnexion..." : "Se déconnecter"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-card border-b border-border md:hidden">
          <div className="flex-1 flex justify-between items-center px-4">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="bg-[#001158] rounded-full overflow-hidden w-7 h-7 mr-2">
                <img 
                  src="/Logos%20Politiquensemble.png" 
                  alt="Logo Politiquensemble" 
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="font-semibold">Admin</span>
            </div>
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="sr-only md:not-sr-only text-sm">
                      {user?.username || "Utilisateur"}
                    </span>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => {}} disabled>
                    <Settings className="h-4 w-4 mr-2" /> Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    disabled={logoutMutation.isPending}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {logoutMutation.isPending ? "Déconnexion..." : "Se déconnecter"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            {title && (
              <div className="mb-6">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <div className="w-10 h-1 bg-primary mt-2"></div>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;