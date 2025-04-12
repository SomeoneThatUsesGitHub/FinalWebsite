import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { type User } from "@shared/schema";
import { db } from "./db";
import { customRoles, rolePermissions, adminPermissions } from "@shared/schema";
import { eq, and } from "drizzle-orm";

// Configuration de Passport avec une stratégie locale
export function configurePassport() {
  // Serialization des utilisateurs pour la session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Stratégie d'authentification locale
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Tentative de connexion pour:", username);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log("Utilisateur non trouvé:", username);
          return done(null, false, { message: "Nom d'utilisateur incorrect" });
        }
        
        console.log("Utilisateur trouvé:", username);
        console.log("Mot de passe fourni:", password);
        console.log("Mot de passe stocké:", user.password);
        
        // Vérification directe pour le développement uniquement
        if (password === user.password) {
          console.log("Correspondance directe du mot de passe réussie");
          
          // Obtenir le rôle personnalisé si présent
          let isAdmin = user.role === "admin";
          
          // Enrichir l'utilisateur avec les informations de rôle personnalisé
          if (user.customRoleId) {
            try {
              const [customRole] = await db.select().from(customRoles).where(eq(customRoles.id, user.customRoleId));
              if (customRole) {
                // Si le rôle personnalisé est 'administrator', alors l'utilisateur est admin
                if (customRole.name === "administrator" || customRole.isSystem) {
                  isAdmin = true;
                }
              }
            } catch (roleError) {
              console.error("Erreur lors de la récupération du rôle personnalisé:", roleError);
            }
          }
          
          // Ajouter la propriété isAdmin utilisée pour les vérifications d'accès
          const userWithRole = {
            ...user,
            isAdmin
          };
          
          return done(null, userWithRole);
        }
        
        // Si la comparaison directe a échoué, essayez de comparer avec bcrypt
        try {
          const isMatch = await compare(password, user.password);
          console.log("Résultat de la comparaison bcrypt:", isMatch);
          
          if (isMatch) {
            // Obtenir le rôle personnalisé si présent
            let isAdmin = user.role === "admin";
            
            // Enrichir l'utilisateur avec les informations de rôle personnalisé
            if (user.customRoleId) {
              try {
                const [customRole] = await db.select().from(customRoles).where(eq(customRoles.id, user.customRoleId));
                if (customRole) {
                  // Si le rôle personnalisé est 'administrator', alors l'utilisateur est admin
                  if (customRole.name === "administrator" || customRole.isSystem) {
                    isAdmin = true;
                  }
                }
              } catch (roleError) {
                console.error("Erreur lors de la récupération du rôle personnalisé:", roleError);
              }
            }
            
            // Ajouter la propriété isAdmin utilisée pour les vérifications d'accès
            const userWithRole = {
              ...user,
              isAdmin
            };
            
            return done(null, userWithRole);
          } else {
            return done(null, false, { message: "Mot de passe incorrect" });
          }
        } catch (compareError) {
          console.error("Erreur lors de la comparaison bcrypt:", compareError);
          return done(null, false, { message: "Erreur de vérification du mot de passe" });
        }
      } catch (error) {
        console.error("Erreur lors de l'authentification:", error);
        return done(error);
      }
    })
  );

  return passport;
}

// Middleware pour vérifier si l'utilisateur est authentifié
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Non autorisé" });
}

// Middleware pour vérifier si l'utilisateur est un admin ou un éditeur
export function isAdmin(req: any, res: any, next: any) {
  console.log("Vérification admin - User:", req.user);
  
  // Compatibilité avec l'ancien système (en attendant la migration complète)
  if (req.isAuthenticated() && (req.user.role === "admin" || req.user.role === "editor" || Boolean(req.user.isAdmin))) {
    console.log("Utilisateur authentifié comme admin ou éditeur (ancien système)");
    return next();
  }
  
  // Le isAdmin sera géré par hasPermission dans la version future
  console.log("Accès admin refusé");
  res.status(403).json({ message: "Accès refusé" });
}

// Middleware pour vérifier si l'utilisateur est uniquement admin (pas éditeur)
export function isAdminOnly(req: any, res: any, next: any) {
  console.log("Vérification admin uniquement - User:", req.user);
  
  // Compatibilité avec l'ancien système (en attendant la migration complète)
  if (req.isAuthenticated() && (req.user.role === "admin" || Boolean(req.user.isAdmin))) {
    console.log("Utilisateur authentifié comme admin (ancien système)");
    return next();
  }
  
  // Le isAdminOnly sera géré par hasPermission dans la version future
  console.log("Accès admin uniquement refusé");
  res.status(403).json({ message: "Accès refusé - Réservé aux administrateurs" });
}

// Middleware pour vérifier une permission spécifique
export function hasPermissionMiddleware(permissionCode: string) {
  return async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    
    const userId = req.user.id;
    const hasAccess = await hasPermission(userId, permissionCode);
    
    if (hasAccess) {
      return next();
    }
    
    console.log(`Accès refusé pour la permission ${permissionCode}`);
    res.status(403).json({ message: "Accès refusé - Permission insuffisante" });
  };
}

// Middleware pour vérifier une ou plusieurs permissions
export function hasAnyPermissionMiddleware(permissionCodes: string[]) {
  return async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    
    const userId = req.user.id;
    const hasAccess = await hasAnyPermission(userId, permissionCodes);
    
    if (hasAccess) {
      return next();
    }
    
    console.log(`Accès refusé pour les permissions ${permissionCodes.join(', ')}`);
    res.status(403).json({ message: "Accès refusé - Permissions insuffisantes" });
  };
}

// Fonction pour hacher un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

// Types pour le contexte utilisateur
export type AuthUser = Omit<User, "password"> & { isAdmin: boolean };

// Fonction pour vérifier si un utilisateur a une permission spécifique
export async function hasPermission(userId: number, permissionCode: string): Promise<boolean> {
  try {
    // Si pas d'ID utilisateur, pas de permission
    if (!userId) return false;
    
    // Récupérer l'utilisateur
    const user = await storage.getUser(userId);
    if (!user) return false;
    
    // Compatible avec l'ancien système: admin a toutes les permissions
    if (user.role === "admin") return true;

    // Compatible avec l'ancien système: editor a certaines permissions de contenu
    if (user.role === "editor" && [
      "dashboard", "articles", "flash_infos", "videos", 
      "categories", "educational_topics", "educational_content", "live_coverage"
    ].includes(permissionCode)) {
      return true;
    }
    
    // Vérifier le rôle personnalisé
    if (!user.customRoleId) return false;
    
    // Récupérer l'ID de la permission
    const [permission] = await db.select()
      .from(adminPermissions)
      .where(eq(adminPermissions.code, permissionCode));
    
    if (!permission) return false;
    
    // Vérifier si le rôle a cette permission
    const [rolePermission] = await db.select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, user.customRoleId), 
          eq(rolePermissions.permissionId, permission.id)
        )
      );
    
    return Boolean(rolePermission);
  } catch (error) {
    console.error("Erreur lors de la vérification des permissions:", error);
    return false;
  }
}

// Fonction pour vérifier si l'utilisateur a l'une des permissions listées
export async function hasAnyPermission(userId: number, permissionCodes: string[]): Promise<boolean> {
  for (const code of permissionCodes) {
    if (await hasPermission(userId, code)) {
      return true;
    }
  }
  return false;
}