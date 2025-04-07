import { db } from "./db";
import { users } from "@shared/schema";
import { hashPassword } from "./auth";
import { eq } from "drizzle-orm";

/**
 * Utilitaire pour gérer les utilisateurs en toute sécurité
 */
export async function createUser(userData: {
  username: string;
  password: string;
  displayName: string;
  role: "admin" | "editor" | "user";
  avatarUrl?: string | null;
}) {
  try {
    // Vérifier si l'utilisateur existe déjà
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, userData.username));

    if (existingUser) {
      console.error(`L'utilisateur '${userData.username}' existe déjà`);
      return { success: false, message: "Ce nom d'utilisateur est déjà pris" };
    }

    // Hasher le mot de passe
    const hashedPassword = await hashPassword(userData.password);

    // Insérer le nouvel utilisateur
    const [newUser] = await db
      .insert(users)
      .values({
        username: userData.username,
        password: hashedPassword,
        displayName: userData.displayName,
        role: userData.role,
        avatarUrl: userData.avatarUrl || null,
      })
      .returning();

    console.log(`Utilisateur '${userData.username}' créé avec succès`);
    
    // Retourner l'utilisateur sans le mot de passe
    const { password, ...safeUser } = newUser;
    return { success: true, user: safeUser };
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return { 
      success: false, 
      message: "Erreur lors de la création de l'utilisateur",
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Mettre à jour le mot de passe d'un utilisateur existant
 */
export async function updateUserPassword(username: string, newPassword: string) {
  try {
    // Vérifier si l'utilisateur existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!existingUser) {
      console.error(`L'utilisateur '${username}' n'existe pas`);
      return { success: false, message: "Cet utilisateur n'existe pas" };
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, username));

    console.log(`Mot de passe pour '${username}' mis à jour avec succès`);
    
    return { success: true, message: "Mot de passe mis à jour avec succès" };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du mot de passe:", error);
    return { 
      success: false, 
      message: "Erreur lors de la mise à jour du mot de passe",
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Liste tous les utilisateurs (sans leurs mots de passe)
 */
export async function listUsers() {
  try {
    const allUsers = await db.select().from(users);
    
    // Retourner les utilisateurs sans les mots de passe
    const safeUsers = allUsers.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    return { success: true, users: safeUsers };
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return { 
      success: false, 
      message: "Erreur lors de la récupération des utilisateurs",
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}

/**
 * Supprimer un utilisateur
 */
export async function deleteUser(username: string) {
  try {
    // Vérifier si l'utilisateur existe
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!existingUser) {
      console.error(`L'utilisateur '${username}' n'existe pas`);
      return { success: false, message: "Cet utilisateur n'existe pas" };
    }

    // Supprimer l'utilisateur
    await db
      .delete(users)
      .where(eq(users.username, username));

    console.log(`Utilisateur '${username}' supprimé avec succès`);
    
    return { success: true, message: "Utilisateur supprimé avec succès" };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return { 
      success: false, 
      message: "Erreur lors de la suppression de l'utilisateur",
      error: error instanceof Error ? error.message : String(error) 
    };
  }
}