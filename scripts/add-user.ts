/**
 * Ce script permet d'ajouter un utilisateur à la base de données directement
 * Utile pour créer un utilisateur administrateur initial
 * 
 * Utilisation:
 * npx tsx scripts/add-user.ts username displayName password role
 *
 * Exemple:
 * npx tsx scripts/add-user.ts admin "Administrateur" MotDePasse123! admin
 */

import { hashPassword } from "../server/auth";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length !== 4) {
    console.error("Usage: npx tsx scripts/add-user.ts username \"displayName\" password role");
    console.error("Exemple: npx tsx scripts/add-user.ts admin \"Administrateur\" MotDePasse123! admin");
    process.exit(1);
  }
  
  const [username, displayName, password, role] = args;
  
  // Vérifier que le rôle est valide
  if (!["admin", "editor", "user"].includes(role)) {
    console.error("Rôle invalide. Les rôles valides sont: admin, editor, user");
    process.exit(1);
  }
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.select().from(users).where(eq(users.username, username));
    
    if (existingUser.length > 0) {
      console.error(`Un utilisateur avec le nom d'utilisateur "${username}" existe déjà.`);
      process.exit(1);
    }
    
    // Hasher le mot de passe
    const hashedPassword = await hashPassword(password);
    
    // Créer l'utilisateur
    const newUser = await db.insert(users).values({
      username,
      displayName,
      password: hashedPassword,
      role: role as any,
      avatarUrl: null,
    }).returning();
    
    console.log(`Utilisateur "${username}" créé avec succès avec le rôle "${role}".`);
    console.log("Utilisateur créé:", {
      id: newUser[0].id,
      username: newUser[0].username,
      displayName: newUser[0].displayName,
      role: newUser[0].role,
    });
    
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    process.exit(1);
  }
}

main().catch(console.error);