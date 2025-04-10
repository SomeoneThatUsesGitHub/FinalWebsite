/**
 * Ce script permet de pousser les changements de schéma vers la base de données
 * Utilisez ce script après avoir modifié le schéma dans shared/schema.ts
 */

import { db } from "../server/db";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

async function main() {
  console.log("🚀 Début de la migration du schéma...");
  
  try {
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("✅ Migration réussie!");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:");
    console.error(error);
    process.exit(1);
  }
}

main();