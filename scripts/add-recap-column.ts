/**
 * Ce script ajoute la colonne recap_items à la table live_coverage_updates
 */

import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Ajout de la colonne recap_items à la table live_coverage_updates...");
    
    // Ajouter la colonne recap_items
    await db.execute(sql`
      ALTER TABLE live_coverage_updates 
      ADD COLUMN IF NOT EXISTS recap_items TEXT
    `);
    
    console.log("Colonne recap_items ajoutée avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout de la colonne:", error);
  } finally {
    process.exit(0);
  }
}

main();