import { Request, Response, Router } from "express";
import { db } from "../../db";
import { adminPermissions, customRoles, rolePermissions } from "../../../shared/schema";
import { eq } from "drizzle-orm";
import { isAdminOnly } from "../../auth";

const router = Router();

/**
 * Middleware spécifique pour la gestion des rôles
 * Seuls les administrateurs avec la permission "roles" peuvent accéder à ces routes
 */
const canManageRoles = async (req: any, res: Response, next: any) => {
  // Pour le moment, on se contente de vérifier si c'est un admin
  // Plus tard, on implémentera une vérification des permissions
  isAdminOnly(req, res, next);
};

// Obtenir la liste de tous les rôles
router.get("/", canManageRoles, async (req: Request, res: Response) => {
  try {
    const roles = await db.select().from(customRoles).orderBy(customRoles.priority);
    
    // Pour chaque rôle, récupérer les permissions associées
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const rolePermissionsResult = await db
          .select({
            permission: adminPermissions
          })
          .from(rolePermissions)
          .innerJoin(
            adminPermissions,
            eq(rolePermissions.permissionId, adminPermissions.id)
          )
          .where(eq(rolePermissions.roleId, role.id));
        
        return {
          ...role,
          permissions: rolePermissionsResult.map(r => r.permission)
        };
      })
    );
    
    res.json(rolesWithPermissions);
  } catch (error) {
    console.error("Erreur lors de la récupération des rôles:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Obtenir un rôle spécifique par son ID
router.get("/:id", canManageRoles, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id);
    
    const [role] = await db.select().from(customRoles).where(eq(customRoles.id, roleId));
    
    if (!role) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }
    
    // Récupérer les permissions associées au rôle
    const rolePermissionsResult = await db
      .select({
        permission: adminPermissions
      })
      .from(rolePermissions)
      .innerJoin(
        adminPermissions,
        eq(rolePermissions.permissionId, adminPermissions.id)
      )
      .where(eq(rolePermissions.roleId, roleId));
    
    res.json({
      ...role,
      permissions: rolePermissionsResult.map(r => r.permission)
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Créer un nouveau rôle
router.post("/", canManageRoles, async (req: Request, res: Response) => {
  try {
    const { name, displayName, description, color, isSystem, priority, permissionIds } = req.body;
    
    // Vérifier si le nom du rôle est déjà utilisé
    const existingRole = await db.select().from(customRoles).where(eq(customRoles.name, name));
    if (existingRole.length > 0) {
      return res.status(400).json({ message: "Un rôle avec ce nom existe déjà" });
    }
    
    // Insérer le nouveau rôle
    const [newRole] = await db.insert(customRoles).values({
      name,
      displayName,
      description,
      color,
      isSystem: isSystem || false,
      priority: priority || 0
    }).returning();
    
    // Associer les permissions au rôle
    if (permissionIds && Array.isArray(permissionIds) && permissionIds.length > 0) {
      await Promise.all(
        permissionIds.map(permissionId => {
          return db.insert(rolePermissions).values({
            roleId: newRole.id,
            permissionId
          });
        })
      );
    }
    
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Erreur lors de la création du rôle:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Mettre à jour un rôle existant
router.put("/:id", canManageRoles, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id);
    const { name, displayName, description, color, isSystem, priority, permissionIds } = req.body;
    
    // Vérifier si le rôle existe
    const [existingRole] = await db.select().from(customRoles).where(eq(customRoles.id, roleId));
    if (!existingRole) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }
    
    // Mettre à jour le rôle
    const [updatedRole] = await db.update(customRoles)
      .set({
        name,
        displayName,
        description,
        color,
        isSystem,
        priority,
        updatedAt: new Date()
      })
      .where(eq(customRoles.id, roleId))
      .returning();
    
    // Mettre à jour les permissions
    if (permissionIds && Array.isArray(permissionIds)) {
      // Supprimer toutes les permissions existantes
      await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
      
      // Ajouter les nouvelles permissions
      if (permissionIds.length > 0) {
        await Promise.all(
          permissionIds.map(permissionId => {
            return db.insert(rolePermissions).values({
              roleId,
              permissionId
            });
          })
        );
      }
    }
    
    res.json(updatedRole);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Supprimer un rôle
router.delete("/:id", canManageRoles, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roleId = parseInt(id);
    
    // Vérifier si le rôle existe
    const [existingRole] = await db.select().from(customRoles).where(eq(customRoles.id, roleId));
    if (!existingRole) {
      return res.status(404).json({ message: "Rôle non trouvé" });
    }
    
    // Empêcher la suppression des rôles système
    if (existingRole.isSystem) {
      return res.status(403).json({ message: "Impossible de supprimer un rôle système" });
    }
    
    // Supprimer le rôle (la suppression cascadera aux permissions grâce à notre définition de schéma)
    await db.delete(customRoles).where(eq(customRoles.id, roleId));
    
    res.status(204).end();
  } catch (error) {
    console.error("Erreur lors de la suppression du rôle:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Obtenir toutes les permissions disponibles
router.get("/permissions/all", canManageRoles, async (req: Request, res: Response) => {
  try {
    const permissions = await db.select().from(adminPermissions).orderBy(adminPermissions.category);
    res.json(permissions);
  } catch (error) {
    console.error("Erreur lors de la récupération des permissions:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;