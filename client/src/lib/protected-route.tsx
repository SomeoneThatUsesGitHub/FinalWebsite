import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

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
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Si la route est réservée aux admins et que l'utilisateur n'est pas admin, rediriger vers la page d'accueil
  if (adminOnly && user.role !== "admin") {
    return (
      <Route path={path}>
        <Redirect to="/" />
      </Route>
    );
  }

  // L'utilisateur est connecté et a les droits nécessaires
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}