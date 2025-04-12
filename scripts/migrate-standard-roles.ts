/**
 * Ce script migre les utilisateurs ayant des rôles standards (admin, editor, user)
 * vers le système de rôles personnalisés et supprime la dépendance aux rôles standards.
 */

import { db } from "../server/db";
import { users, customRoles } from "../shared/schema.ts";
import { eq, isNull } from "drizzle-orm";

async function main() {
  try {
    console.log("🔄 Migration des rôles standards vers les rôles personnalisés...");

    // 1. Récupérer tous les rôles personnalisés pour faire la correspondance
    const roles = await db.select().from(customRoles);
    
    // Trouver les rôles équivalents
    const administratorRole = roles.find(r => r.name === "administrator");
    const editorRole = roles.find(r => r.name === "editor" || r.name === "editeur");
    const userRole = roles.find(r => r.name === "user" || r.name === "utilisateur");
    
    if (!administratorRole) {
      throw new Error("Le rôle administrateur n'a pas été trouvé dans la base de données");
    }

    console.log("Rôles trouvés:");
    console.log(`- Administrator: ID=${administratorRole.id}`);
    console.log(`- Editor: ID=${editorRole?.id || 'Non trouvé'}`);
    console.log(`- User: ID=${userRole?.id || 'Non trouvé'}`);

    // 2. Migrer les utilisateurs avec rôle 'admin' vers le rôle personnalisé 'administrator'
    const adminUsers = await db.select()
      .from(users)
      .where(eq(users.role, "admin"));
    
    console.log(`🔍 Trouvé ${adminUsers.length} utilisateurs avec le rôle 'admin'`);
    
    for (const user of adminUsers) {
      if (!user.customRoleId) {
        await db.update(users)
          .set({ customRoleId: administratorRole.id })
          .where(eq(users.id, user.id));
        console.log(`✅ Utilisateur ${user.username} migré vers le rôle 'administrator'`);
      } else {
        console.log(`ℹ️ L'utilisateur ${user.username} a déjà un rôle personnalisé (ID=${user.customRoleId})`);
      }
    }

    // 3. Migrer les utilisateurs avec rôle 'editor' vers le rôle personnalisé 'editor' s'il existe
    if (editorRole) {
      const editorUsers = await db.select()
        .from(users)
        .where(eq(users.role, "editor"));
      
      console.log(`🔍 Trouvé ${editorUsers.length} utilisateurs avec le rôle 'editor'`);
      
      for (const user of editorUsers) {
        if (!user.customRoleId) {
          await db.update(users)
            .set({ customRoleId: editorRole.id })
            .where(eq(users.id, user.id));
          console.log(`✅ Utilisateur ${user.username} migré vers le rôle 'editor' personnalisé`);
        } else {
          console.log(`ℹ️ L'utilisateur ${user.username} a déjà un rôle personnalisé (ID=${user.customRoleId})`);
        }
      }
    }

    // 4. Migrer les utilisateurs avec rôle 'user' vers le rôle personnalisé 'user' s'il existe
    if (userRole) {
      const regularUsers = await db.select()
        .from(users)
        .where(eq(users.role, "user"));
      
      console.log(`🔍 Trouvé ${regularUsers.length} utilisateurs avec le rôle 'user'`);
      
      for (const user of regularUsers) {
        if (!user.customRoleId) {
          await db.update(users)
            .set({ customRoleId: userRole.id })
            .where(eq(users.id, user.id));
          console.log(`✅ Utilisateur ${user.username} migré vers le rôle 'user' personnalisé`);
        } else {
          console.log(`ℹ️ L'utilisateur ${user.username} a déjà un rôle personnalisé (ID=${user.customRoleId})`);
        }
      }
    }

    // 5. Vérifier s'il reste des utilisateurs sans rôle personnalisé
    const usersWithoutCustomRole = await db.select()
      .from(users)
      .where(isNull(users.customRoleId));
    
    if (usersWithoutCustomRole.length > 0) {
      console.log(`⚠️ Il reste ${usersWithoutCustomRole.length} utilisateurs sans rôle personnalisé`);
      for (const user of usersWithoutCustomRole) {
        console.log(`- ${user.username} (rôle: ${user.role})`);
        
        // Assigner le rôle utilisateur par défaut ou administrateur selon le cas
        const roleToAssign = (user.role === "admin" || user.role === "editor") 
          ? administratorRole.id 
          : (userRole?.id || administratorRole.id);
        
        await db.update(users)
          .set({ customRoleId: roleToAssign })
          .where(eq(users.id, user.id));
        
        console.log(`✅ Utilisateur ${user.username} assigné au rôle ID=${roleToAssign}`);
      }
    } else {
      console.log("✅ Tous les utilisateurs ont un rôle personnalisé");
    }

    // 6. Initialiser la colonne role à 'none' pour tous les utilisateurs
    // Ce n'est pas encore la suppression définitive, mais cela permettra de ne plus l'utiliser
    await db.update(users)
      .set({ role: "none" });
    
    console.log("✅ Migration terminée: tous les utilisateurs utilisent maintenant le système de rôles personnalisés");
    console.log("⚠️ Note: La colonne 'role' a été définie à 'none' pour tous les utilisateurs");
    console.log("⚠️ Note: Vous devrez modifier le schéma de la base de données pour supprimer complètement cette colonne");

  } catch (error) {
    console.error("❌ Erreur lors de la migration des rôles:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });