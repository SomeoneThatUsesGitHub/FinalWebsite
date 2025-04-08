/**
 * Ce script supprime les colonnes de réseaux sociaux de la table utilisateurs
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Suppression des colonnes de réseaux sociaux de la table utilisateurs...");
  
  try {
    // Vérification de l'existence des colonnes avant de les supprimer
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('twitter_handle', 'instagram_handle', 'email');
    `;
    const existingColumns = await db.execute(sql.raw(checkColumnsQuery));
    console.log("Colonnes trouvées:", existingColumns.rows);
    
    if (existingColumns.rows.length > 0) {
      // Suppression des colonnes
      await db.execute(sql.raw(`
        ALTER TABLE users 
        DROP COLUMN IF EXISTS twitter_handle,
        DROP COLUMN IF EXISTS instagram_handle,
        DROP COLUMN IF EXISTS email;
      `));
      console.log("Colonnes supprimées avec succès!");
    } else {
      console.log("Les colonnes n'existent pas, aucune modification nécessaire.");
    }
  } catch (error) {
    console.error("Erreur lors de la suppression des colonnes:", error);
    process.exit(1);
  }
  
  console.log("Migration terminée avec succès!");
  process.exit(0);
}

main().catch((error) => {
  console.error("Erreur non gérée:", error);
  process.exit(1);
});