import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as BaseUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Étendre le type User pour inclure seulement le rôle personnalisé
type User = BaseUser & { 
  customRoleId: number;
  customRoleName?: string; // Nom du rôle personnalisé pour l'affichage
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<any, Error, RegisterData>;
  // Nouvelles fonctions pour vérifier les permissions
  hasPermission: (permissionCode: string) => Promise<boolean>;
  hasAnyPermission: (permissionCodes: string[]) => Promise<boolean>;
  checkPermissionForRoute: (pathname: string) => Promise<boolean>;
};

type LoginData = Pick<InsertUser, "username" | "password">;
type RegisterData = Omit<InsertUser, "confirmPassword"> & { displayName: string };

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      // Adapter à la réponse modifiée de /api/auth/me
      const userData = data.user;
      
      console.log("Login réussi, données utilisateur:", userData);
      
      // Mettre à jour le cache avec les données utilisateur
      queryClient.setQueryData(["/api/auth/me"], userData);
      
      // Invalider le cache pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${userData.displayName || userData.username}`,
      });
    },
    onError: (error: Error) => {
      console.error("Erreur de connexion:", error);
      toast({
        title: "Échec de la connexion",
        description: error.message || "Identifiants incorrects",
        variant: "destructive",
      });
    },
  });
  
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], data.user);
      toast({
        title: "Inscription réussie",
        description: `Bienvenue, ${data.user.displayName || data.user.username}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de l'inscription",
        description: error.message || "Impossible de créer le compte",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Échec de la déconnexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fonction pour vérifier si l'utilisateur a une permission spécifique
  const hasPermission = async (permissionCode: string): Promise<boolean> => {
    if (!user) return false;
    
    // Uniquement se baser sur le rôle personnalisé
    if (!user.customRoleId) return false;
    
    try {
      // Appel API pour vérifier les permissions
      const response = await fetch(`/api/auth/check-permission?code=${permissionCode}`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      return data.hasPermission;
    } catch (error) {
      console.error("Erreur lors de la vérification des permissions:", error);
      return false;
    }
  };
  
  // Fonction pour vérifier si l'utilisateur a l'une des permissions listées
  const hasAnyPermission = async (permissionCodes: string[]): Promise<boolean> => {
    for (const code of permissionCodes) {
      if (await hasPermission(code)) {
        return true;
      }
    }
    return false;
  };
  
  // Fonction pour vérifier les permissions basées sur le chemin
  const checkPermissionForRoute = async (pathname: string): Promise<boolean> => {
    // Si c'est le tableau de bord principal
    if (pathname === "/admin") {
      return await hasPermission("dashboard");
    }
    
    // Map des chemins vers les codes de permission
    const routePermissionMap: Record<string, string> = {
      "/admin/articles": "articles",
      "/admin/categories": "categories",
      "/admin/flash-infos": "flash_infos",
      "/admin/videos": "videos",
      "/admin/directs": "live_coverage",
      "/admin/users": "users",
      "/admin/team": "team",
      "/admin/newsletter": "newsletter",
      "/admin/applications": "applications",
      "/admin/messages": "messages",
      "/admin/contenu-educatif": "educational_content",
      "/admin/roles": "roles"
    };
    
    // Vérifier la permission correspondante au chemin
    const permissionCode = routePermissionMap[pathname];
    if (permissionCode) {
      return await hasPermission(permissionCode);
    }
    
    // Pour les chemins non spécifiés, vérifier la permission "admin" générale
    return await hasPermission("admin");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        hasPermission,
        hasAnyPermission,
        checkPermissionForRoute
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
}