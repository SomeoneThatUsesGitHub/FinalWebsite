import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useEffect } from "react";

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

  // Gérer le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    // Utiliser useEffect pour la redirection au lieu de Redirect composant
    // pour éviter l'erreur de hooks
    useEffect(() => {
      setLocation("/auth");
    }, [setLocation]);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirection vers la page de connexion...</span>
      </div>
    );
  }

  // Si la route est réservée aux admins et que l'utilisateur n'est pas admin, rediriger vers la page d'accueil
  if (adminOnly && user.role !== "admin") {
    // Utiliser useEffect pour la redirection
    useEffect(() => {
      setLocation("/");
    }, [setLocation]);

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Redirection vers la page d'accueil...</span>
      </div>
    );
  }

  // L'utilisateur est connecté et a les droits nécessaires
  return <Component />;
}