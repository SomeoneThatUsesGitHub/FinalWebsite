import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface RouteGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

// Composant pour protéger les routes en fonction des permissions
export function RouteGuard({ children, fallback }: RouteGuardProps) {
  const { user, isLoading, checkPermissionForRoute } = useAuth();
  const [location] = useLocation();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checkingPermission, setCheckingPermission] = useState(true);

  useEffect(() => {
    async function verifyAccess() {
      // Si l'utilisateur n'est pas connecté ou en cours de chargement, on ne fait rien
      if (isLoading || !user) {
        setHasAccess(false);
        setCheckingPermission(false);
        return;
      }

      try {
        // Vérifier les permissions pour la route actuelle
        const permitted = await checkPermissionForRoute(location);
        console.log(`Vérification d'accès pour ${location}:`, permitted);
        setHasAccess(permitted);
      } catch (error) {
        console.error("Erreur lors de la vérification des permissions:", error);
        setHasAccess(false);
      } finally {
        setCheckingPermission(false);
      }
    }

    setCheckingPermission(true);
    verifyAccess();
  }, [location, user, isLoading, checkPermissionForRoute]);

  // Afficher un loader pendant la vérification
  if (checkingPermission) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Rediriger si l'utilisateur n'a pas accès
  if (!hasAccess) {
    return fallback ? <>{fallback}</> : (
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <h1 className="text-2xl font-semibold mb-4">Accès refusé</h1>
        <p className="text-muted-foreground">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  // Afficher le contenu si l'utilisateur a accès
  return <>{children}</>;
}