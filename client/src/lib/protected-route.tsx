import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  adminOnly?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
}: ProtectedRouteProps) {
  return (
    <Route path={path}>
      <ProtectedContent Component={Component} adminOnly={adminOnly} />
    </Route>
  );
}

// Composant interne qui gère la logique de protection
function ProtectedContent({
  Component,
  adminOnly = false,
}: {
  Component: React.ComponentType;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  
  // Hook unifié pour les redirections
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        setRedirecting(true);
        setLocation("/auth");
      } else if (adminOnly && user.role !== "admin") {
        // Rediriger vers la page d'accueil si l'utilisateur n'est pas admin
        setRedirecting(true);
        setLocation("/");
      }
    }
  }, [user, isLoading, adminOnly, setLocation]);

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