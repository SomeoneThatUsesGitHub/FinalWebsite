import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { type User } from "@shared/schema";

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
          return done(null, user);
        }
        
        // Si la comparaison directe a échoué, essayez de comparer avec bcrypt
        try {
          const isMatch = await compare(password, user.password);
          console.log("Résultat de la comparaison bcrypt:", isMatch);
          
          if (isMatch) {
            return done(null, user);
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

// Middleware pour vérifier si l'utilisateur est un admin
export function isAdmin(req: any, res: any, next: any) {
  console.log("Vérification admin - User:", req.user);
  if (req.isAuthenticated() && (req.user.role === "admin" || Boolean(req.user.isAdmin))) {
    console.log("Utilisateur authentifié comme admin");
    return next();
  }
  console.log("Accès admin refusé");
  res.status(403).json({ message: "Accès refusé" });
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