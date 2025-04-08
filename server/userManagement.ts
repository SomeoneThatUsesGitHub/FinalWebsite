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
      isTeamMember: users.isTeamMember,
      twitterHandle: users.twitterHandle,
      instagramHandle: users.instagramHandle,
      email: users.email
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
  twitterHandle?: string;
  instagramHandle?: string;
  email?: string;
}) {
  try {
    console.log("Mise à jour du profil de", username, "avec les données:", JSON.stringify(userData, null, 2));
    
    // Vérifier si l'utilisateur existe
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUser.length === 0) {
      return {
        success: false,
        message: "Utilisateur introuvable."
      };
    }
    
    // Afficher l'utilisateur existant pour le débogage
    console.log("Utilisateur existant avant la mise à jour:", JSON.stringify(existingUser[0], null, 2));
    
    // Préparer les données pour la mise à jour
    const updateData = {
      displayName: userData.displayName !== undefined ? userData.displayName : existingUser[0].displayName,
      role: userData.role !== undefined ? userData.role as any : existingUser[0].role,
      avatarUrl: userData.avatarUrl !== undefined ? userData.avatarUrl : existingUser[0].avatarUrl,
      title: userData.title !== undefined ? userData.title : existingUser[0].title,
      bio: userData.bio !== undefined ? userData.bio : existingUser[0].bio,
      isTeamMember: userData.isTeamMember !== undefined ? userData.isTeamMember : existingUser[0].isTeamMember,
      twitterHandle: userData.twitterHandle !== undefined ? userData.twitterHandle : existingUser[0].twitterHandle,
      instagramHandle: userData.instagramHandle !== undefined ? userData.instagramHandle : existingUser[0].instagramHandle,
      email: userData.email !== undefined ? userData.email : existingUser[0].email,
    };
    
    console.log("Données de mise à jour formatées:", JSON.stringify(updateData, null, 2));
    console.log("La valeur twitterHandle est:", updateData.twitterHandle);
    console.log("La valeur instagramHandle est:", updateData.instagramHandle);
    console.log("La valeur email est:", updateData.email);
    
    // Mettre à jour le profil avec tous les champs
    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.username, username))
      .returning();
      
    console.log("Profil mis à jour:", JSON.stringify(updatedUser, null, 2));
    
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
    console.log("getTeamMembers appelé à:", new Date().toISOString());

    // Requête SQL directe pour le débogage - récupère explicitement tous les champs nécessaires
    const completeData = await db.execute(`
      SELECT 
        id, 
        username, 
        display_name as "displayName", 
        role, 
        avatar_url as "avatarUrl", 
        title, 
        bio, 
        is_team_member as "isTeamMember", 
        twitter_handle as "twitterHandle", 
        instagram_handle as "instagramHandle", 
        email
      FROM users 
      WHERE is_team_member = true
    `);
    
    console.log("DONNÉES COMPLÈTES DES MEMBRES TEAM:", JSON.stringify(completeData.rows, null, 2));

    // Si les données sont correctes dans la base mais pas dans la réponse, on utilise les données SQL brutes
    // Mais on s'assure de la bonne structure avec des valeurs par défaut pour les champs manquants
    const teamMembers = completeData.rows.map(member => ({
      id: member.id,
      username: member.username,
      displayName: member.displayName,
      role: member.role || 'editor',
      avatarUrl: member.avatarUrl || null,
      title: member.title || null,
      bio: member.bio || null,
      twitterHandle: member.twitterHandle || '',
      instagramHandle: member.instagramHandle || '',
      email: member.email || ''
    }));
    
    console.log("Les membres d'équipe formatés:", JSON.stringify(teamMembers, null, 2));
    
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