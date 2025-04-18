import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  adminOnly?: boolean;
  editorsAllowed?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
  editorsAllowed = true,
}: ProtectedRouteProps) {
  return (
    <Route path={path}>
      <ProtectedContent 
        Component={Component} 
        adminOnly={adminOnly} 
        editorsAllowed={editorsAllowed}
        path={path}
      />
    </Route>
  );
}

// Composant interne qui gère la logique de protection
function ProtectedContent({
  Component,
  adminOnly = false,
  editorsAllowed = true,
  path
}: {
  Component: React.ComponentType;
  adminOnly?: boolean;
  editorsAllowed?: boolean;
  path: string;
}) {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  
  // Routes spécifiquement réservées aux administrateurs
  const strictAdminRoutes = [
    "/admin/categories",
    "/admin/team",
    "/admin/users",
    "/admin/directs/nouveau",
    "/admin/directs/editer"
  ];
  
  // Vérifier si l'URL actuelle est dans les routes strictement réservées aux admins
  const isStrictAdminRoute = strictAdminRoutes.some(route => {
    // Capturer aussi les sous-routes
    if (route.endsWith("*")) {
      const baseRoute = route.slice(0, -1);
      return path.startsWith(baseRoute);
    }
    return path === route;
  });
  
  // Hook unifié pour les redirections
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        console.log("Utilisateur non connecté, redirection vers /auth");
        setRedirecting(true);
        setLocation("/auth");
      } else if (
        // Rediriger si :
        (adminOnly && !(user.isAdmin || user.role === "admin" || user.role === "editor")) || // Pas les droits d'admin/éditeur pour pages adminOnly
        (isStrictAdminRoute && !(user.isAdmin || user.role === "admin")) || // Pas les droits d'admin pour routes strictes
        (!editorsAllowed && user.role === "editor") // Route interdite aux éditeurs
      ) {
        // Rediriger vers la page d'accueil si l'utilisateur n'a pas les droits
        console.log("L'utilisateur n'a pas les droits suffisants, redirection vers l'accueil", user);
        setRedirecting(true);
        setLocation("/");
      } else {
        console.log("Utilisateur authentifié:", user);
      }
    }
  }, [user, isLoading, adminOnly, editorsAllowed, isStrictAdminRoute, setLocation, path]);

  // Afficher un écran de chargement pendant le chargement ou la redirection
  if (isLoading || redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Chargement..." : "Redirection..."}
          </span>
        </div>
      </div>
    );
  }

  // L'utilisateur est connecté et a les droits nécessaires
  return <Component />;
}