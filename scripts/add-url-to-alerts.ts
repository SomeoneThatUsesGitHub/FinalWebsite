/**
 * Ce script ajoute la colonne url à la table site_alerts
 */
import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Ajout de la colonne url à la table site_alerts...");
    
    await db.execute(sql`
      ALTER TABLE site_alerts 
      ADD COLUMN IF NOT EXISTS url TEXT;
    `);
    
    console.log("Colonne url ajoutée avec succès!");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la colonne url:", error);
  } finally {
    await pool.end();
  }
}

main();