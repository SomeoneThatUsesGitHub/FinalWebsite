import { db } from "./db";
import { users, type User, type InsertUser } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

/**
 * Utilitaire pour gérer les utilisateurs en toute sécurité
 */
export async function createUser(userData: {
  username: string;
  displayName: string;
  password: string;
  role: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  isTeamMember?: boolean;
}): Promise<{ success: boolean; user?: User; message?: string }> {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select().from(users).where(eq(users.username, userData.username));
    
    if (existingUser.length > 0) {
      return {
        success: false,
        message: "Un utilisateur avec ce nom d'utilisateur existe déjà."
      };
    }
    
    // Hasher le mot de passe
    const hashedPassword = await hashPassword(userData.password);
    
    // Créer l'utilisateur
    const [newUser] = await db.insert(users).values({
      username: userData.username,
      displayName: userData.displayName,
      password: hashedPassword,
      role: userData.role as any,
      avatarUrl: userData.avatarUrl || null,
      title: userData.title || null,
      bio: userData.bio || null,
      isTeamMember: userData.isTeamMember || false,
    }).returning();
    
    return {
      success: true,
      user: {
        ...newUser,
        password: "********" // Ne jamais renvoyer le mot de passe, même haché
      }
    };
    
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de l'utilisateur."
    };
  }
}

/**
 * Mettre à jour le mot de passe d'un utilisateur existant
 */
export async function updateUserPassword(username: string, newPassword: string) {
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUser.length === 0) {
      return {
        success: false,
        message: "Utilisateur introuvable."
      };
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);
    
    // Mettre à jour le mot de passe
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, username));
    
    return {
      success: true,
      message: "Mot de passe mis à jour avec succès."
    };
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du mot de passe."
    };
  }
}

/**
 * Liste tous les utilisateurs (sans leurs mots de passe)
 */
export async function listUsers() {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      avatarUrl: users.avatarUrl,
      title: users.title,
      bio: users.bio,
      isTeamMember: users.isTeamMember
    }).from(users);
    
    return {
      success: true,
      users: allUsers
    };
    
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la récupération des utilisateurs."
    };
  }
}

/**
 * Mettre à jour le profil d'un utilisateur
 */
export async function updateUserProfile(username: string, userData: {
  displayName?: string;
  role?: string;
  avatarUrl?: string;
  title?: string;
  bio?: string;
  isTeamMember?: boolean;
}) {
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUser.length === 0) {
      return {
        success: false,
        message: "Utilisateur introuvable."
      };
    }
    
    // Mettre à jour le profil
    const [updatedUser] = await db.update(users)
      .set({
        displayName: userData.displayName !== undefined ? userData.displayName : existingUser[0].displayName,
        role: userData.role !== undefined ? userData.role as any : existingUser[0].role,
        avatarUrl: userData.avatarUrl !== undefined ? userData.avatarUrl : existingUser[0].avatarUrl,
        title: userData.title !== undefined ? userData.title : existingUser[0].title,
        bio: userData.bio !== undefined ? userData.bio : existingUser[0].bio,
        isTeamMember: userData.isTeamMember !== undefined ? userData.isTeamMember : existingUser[0].isTeamMember,
      })
      .where(eq(users.username, username))
      .returning();
    
    return {
      success: true,
      user: {
        ...updatedUser,
        password: "********" // Ne jamais renvoyer le mot de passe, même haché
      }
    };
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du profil."
    };
  }
}

/**
 * Récupérer les membres de l'équipe
 */
export async function getTeamMembers() {
  try {
    const teamMembers = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      role: users.role,
      avatarUrl: users.avatarUrl,
      title: users.title,
      bio: users.bio
    }).from(users)
      .where(eq(users.isTeamMember, true));
    
    return {
      success: true,
      members: teamMembers
    };
    
  } catch (error) {
    console.error("Erreur lors de la récupération des membres de l'équipe:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la récupération des membres de l'équipe."
    };
  }
}

/**
 * Supprimer un utilisateur
 */
export async function deleteUser(username: string) {
  try {
    // Vérifier si l'utilisateur existe
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUser.length === 0) {
      return {
        success: false,
        message: "Utilisateur introuvable."
      };
    }
    
    // Supprimer l'utilisateur
    await db.delete(users).where(eq(users.username, username));
    
    return {
      success: true,
      message: "Utilisateur supprimé avec succès."
    };
    
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression de l'utilisateur."
    };
  }
}