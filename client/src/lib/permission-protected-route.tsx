import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Route, useLocation } from "wouter";
import { useEffect, useState } from "react";

interface PermissionProtectedRouteProps {
  path: string;
  component: React.ComponentType;
  adminOnly?: boolean; // Pour la compatibilité avec l'ancien système
  editorsAllowed?: boolean; // Pour la compatibilité avec l'ancien système
  permissionCode?: string; // Nouveau - code de permission spécifique
}

export function PermissionProtectedRoute({
  path,
  component: Component,
  adminOnly = false,
  editorsAllowed = true,
  permissionCode
}: PermissionProtectedRouteProps) {
  return (
    <Route path={path}>
      <AuthenticationCheck 
        Component={Component} 
        adminOnly={adminOnly} 
        editorsAllowed={editorsAllowed}
        path={path}
        permissionCode={permissionCode}
      />
    </Route>
  );
}

// Première couche : vérification de l'authentification
function AuthenticationCheck({
  Component,
  adminOnly,
  editorsAllowed,
  path,
  permissionCode
}: {
  Component: React.ComponentType;
  adminOnly?: boolean;
  editorsAllowed?: boolean;
  path: string;
  permissionCode?: string;
}) {
  const { user, isLoading, hasPermission } = useAuth();
  const [_, setLocation] = useLocation();
  const [redirecting, setRedirecting] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingPermission, setCheckingPermission] = useState(true);
  
  // Vérification d'authentification
  useEffect(() => {
    if (!isLoading && !user) {
      // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
      console.log("Utilisateur non connecté, redirection vers /auth");
      setRedirecting(true);
      setLocation("/auth");
    }
  }, [user, isLoading, setLocation]);

  // Vérification des permissions
  useEffect(() => {
    async function checkAccess() {
      if (!user || isLoading) {
        setHasAccess(false);
        setCheckingPermission(false);
        return;
      }

      // Utiliser uniquement le système de permissions basé sur les rôles personnalisés
      if (permissionCode) {
        try {
          const permitted = await hasPermission(permissionCode);
          console.log(`Vérification permission ${permissionCode} pour ${path}:`, permitted);
          setHasAccess(permitted);
        } catch (error) {
          console.error("Erreur lors de la vérification des permissions:", error);
          setHasAccess(false);
        }
      } else {
        // Si pas de code de permission spécifié, vérifier l'accès général à l'admin
        try {
          // Vérifier l'accès au dashboard par défaut
          const permitted = await hasPermission("dashboard");
          console.log(`Vérification permission 'dashboard' par défaut pour ${path}:`, permitted);
          setHasAccess(permitted);
        } catch (error) {
          console.error("Erreur lors de la vérification des permissions par défaut:", error);
          setHasAccess(false);
        }
      }
      
      setCheckingPermission(false);
    }

    if (user) {
      setCheckingPermission(true);
      checkAccess();
    }
  }, [user, isLoading, adminOnly, editorsAllowed, permissionCode, hasPermission, path]);

  // Afficher un écran de chargement pendant le chargement ou la redirection
  if (isLoading || redirecting || checkingPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Chargement..." : redirecting ? "Redirection..." : "Vérification des permissions..."}
          </span>
        </div>
      </div>
    );
  }

  // Vérification des permissions
  if (!hasAccess) {
    return <PermissionDenied />;
  }

  // L'utilisateur est connecté et a les permissions nécessaires
  return <Component />;
}

// Composant affiché en cas de refus de permission
function PermissionDenied() {
  const [_, setLocation] = useLocation();
  
  // Rediriger vers la page d'accueil après un court délai
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLocation("/");
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, [setLocation]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <div className="bg-card border border-border rounded-lg p-8 max-w-md w-full shadow-lg">
        <h1 className="text-2xl font-semibold mb-4 text-center">Accès refusé</h1>
        <p className="text-muted-foreground text-center mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Redirection vers la page d'accueil dans quelques secondes...
        </p>
      </div>
    </div>
  );
}