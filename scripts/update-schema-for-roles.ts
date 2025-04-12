/**
 * Ce script permet de mettre à jour la base de données avec les nouvelles tables pour les rôles et permissions
 * Il crée également des rôles système par défaut
 */

import { db } from "../server/db";
import { adminPermissions, customRoles, rolePermissions, users } from "../shared/schema";
import { eq } from "drizzle-orm";

const DEFAULT_ADMIN_PERMISSIONS = [
  {
    code: "dashboard",
    displayName: "Tableau de bord",
    description: "Accès au tableau de bord admin",
    icon: "LayoutDashboard",
    category: "general"
  },
  {
    code: "articles",
    displayName: "Articles",
    description: "Gestion des articles",
    icon: "FileText",
    category: "content"
  },
  {
    code: "flash_infos",
    displayName: "Flash Infos",
    description: "Gestion des flash infos",
    icon: "AlertTriangle",
    category: "content"
  },
  {
    code: "videos",
    displayName: "Vidéos",
    description: "Gestion des vidéos",
    icon: "Video",
    category: "content"
  },
  {
    code: "categories",
    displayName: "Catégories",
    description: "Gestion des catégories",
    icon: "TagsIcon",
    category: "content"
  },
  {
    code: "educational_topics",
    displayName: "Sujets éducatifs",
    description: "Gestion des sujets éducatifs",
    icon: "GraduationCap",
    category: "content"
  },
  {
    code: "educational_content",
    displayName: "Contenu éducatif",
    description: "Gestion du contenu éducatif",
    icon: "Book",
    category: "content"
  },
  {
    code: "live_coverage",
    displayName: "Suivi en direct",
    description: "Gestion des suivis en direct",
    icon: "Radio",
    category: "content"
  },
  {
    code: "users",
    displayName: "Utilisateurs",
    description: "Gestion des utilisateurs",
    icon: "Users",
    category: "system"
  },
  {
    code: "roles",
    displayName: "Rôles",
    description: "Gestion des rôles et permissions",
    icon: "ShieldCheck",
    category: "system"
  },
  {
    code: "applications",
    displayName: "Candidatures",
    description: "Gestion des candidatures",
    icon: "FileCheck",
    category: "system"
  },
  {
    code: "messages",
    displayName: "Messages",
    description: "Gestion des messages de contact",
    icon: "MessageSquare",
    category: "communication"
  }
];

const DEFAULT_ROLES = [
  {
    name: "administrator",
    displayName: "Administrateur",
    description: "Accès complet à toutes les fonctionnalités",
    color: "#EF4444", // Rouge
    isSystem: true,
    priority: 100
  },
  {
    name: "editor",
    displayName: "Éditeur",
    description: "Accès à la gestion du contenu",
    color: "#3B82F6", // Bleu
    isSystem: true,
    priority: 50
  },
  {
    name: "content_manager",
    displayName: "Gestionnaire de contenu",
    description: "Peut gérer uniquement les articles et flash infos",
    color: "#10B981", // Vert
    isSystem: false,
    priority: 30
  },
  {
    name: "media_manager",
    displayName: "Gestionnaire de médias",
    description: "Peut gérer uniquement les vidéos",
    color: "#8B5CF6", // Violet
    isSystem: false,
    priority: 20
  }
];

async function main() {
  try {
    console.log("Migration des tables pour les rôles et permissions...");
    
    // 1. Création des permissions par défaut
    console.log("Création des permissions par défaut...");
    for (const permission of DEFAULT_ADMIN_PERMISSIONS) {
      // Vérifier si la permission existe déjà
      const existingPermission = await db.select().from(adminPermissions).where(eq(adminPermissions.code, permission.code));
      
      if (existingPermission.length === 0) {
        await db.insert(adminPermissions).values(permission);
        console.log(`Permission créée: ${permission.displayName}`);
      } else {
        console.log(`Permission existante mise à jour: ${permission.displayName}`);
        await db.update(adminPermissions)
          .set(permission)
          .where(eq(adminPermissions.code, permission.code));
      }
    }
    
    // 2. Création des rôles par défaut
    console.log("Création des rôles par défaut...");
    for (const role of DEFAULT_ROLES) {
      // Vérifier si le rôle existe déjà
      const existingRole = await db.select().from(customRoles).where(eq(customRoles.name, role.name));
      
      let roleId: number;
      
      if (existingRole.length === 0) {
        const result = await db.insert(customRoles).values(role).returning({ id: customRoles.id });
        roleId = result[0].id;
        console.log(`Rôle créé: ${role.displayName}`);
      } else {
        roleId = existingRole[0].id;
        console.log(`Rôle existant mis à jour: ${role.displayName}`);
        await db.update(customRoles)
          .set(role)
          .where(eq(customRoles.name, role.name));
      }
      
      // 3. Attribution des permissions selon le rôle
      if (role.name === "administrator") {
        // Les administrateurs ont toutes les permissions
        const allPermissions = await db.select().from(adminPermissions);
        for (const permission of allPermissions) {
          const existingRolePermission = await db.select()
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId))
            .where(eq(rolePermissions.permissionId, permission.id));
            
          if (existingRolePermission.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: permission.id
            });
            console.log(`Permission "${permission.displayName}" attribuée au rôle "Administrateur"`);
          }
        }
      } else if (role.name === "editor") {
        // Les éditeurs ont toutes les permissions de contenu, mais pas d'administration système
        const contentPermissions = await db.select()
          .from(adminPermissions)
          .where(eq(adminPermissions.category, "content"))
          .orWhere(eq(adminPermissions.category, "general"));
        
        for (const permission of contentPermissions) {
          const existingRolePermission = await db.select()
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId))
            .where(eq(rolePermissions.permissionId, permission.id));
            
          if (existingRolePermission.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: permission.id
            });
            console.log(`Permission "${permission.displayName}" attribuée au rôle "Éditeur"`);
          }
        }
      } else if (role.name === "content_manager") {
        // Les gestionnaires de contenu peuvent gérer les articles et flash infos
        const permissionCodes = ["dashboard", "articles", "flash_infos", "categories"];
        const relevantPermissions = await db.select()
          .from(adminPermissions)
          .where(
            permissionCodes.map(code => eq(adminPermissions.code, code)).reduce((prev, curr) => ({ ...prev, or: curr }))
          );
        
        for (const permission of relevantPermissions) {
          const existingRolePermission = await db.select()
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId))
            .where(eq(rolePermissions.permissionId, permission.id));
            
          if (existingRolePermission.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: permission.id
            });
            console.log(`Permission "${permission.displayName}" attribuée au rôle "Gestionnaire de contenu"`);
          }
        }
      } else if (role.name === "media_manager") {
        // Les gestionnaires de médias peuvent gérer les vidéos
        const permissionCodes = ["dashboard", "videos"];
        const relevantPermissions = await db.select()
          .from(adminPermissions)
          .where(
            permissionCodes.map(code => eq(adminPermissions.code, code)).reduce((prev, curr) => ({ ...prev, or: curr }))
          );
        
        for (const permission of relevantPermissions) {
          const existingRolePermission = await db.select()
            .from(rolePermissions)
            .where(eq(rolePermissions.roleId, roleId))
            .where(eq(rolePermissions.permissionId, permission.id));
            
          if (existingRolePermission.length === 0) {
            await db.insert(rolePermissions).values({
              roleId,
              permissionId: permission.id
            });
            console.log(`Permission "${permission.displayName}" attribuée au rôle "Gestionnaire de médias"`);
          }
        }
      }
    }
    
    // 4. Mise à jour des utilisateurs existants pour ajouter le rôle personnalisé
    console.log("Mise à jour des utilisateurs existants...");
    const adminRole = await db.select().from(customRoles).where(eq(customRoles.name, "administrator"));
    const editorRole = await db.select().from(customRoles).where(eq(customRoles.name, "editor"));
    
    if (adminRole.length > 0 && editorRole.length > 0) {
      // Mettre à jour les admins existants
      await db.update(users)
        .set({ customRoleId: adminRole[0].id })
        .where(eq(users.role, "admin"));
        
      // Mettre à jour les éditeurs existants
      await db.update(users)
        .set({ customRoleId: editorRole[0].id })
        .where(eq(users.role, "editor"));
      
      console.log("Utilisateurs mis à jour avec les rôles personnalisés");
    }
    
    console.log("Migration terminée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erreur non gérée:", error);
    process.exit(1);
  });