/**
 * Ce script ajoute la table political_glossary à la base de données
 */
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { pool, db } from "../server/db";

async function main() {
  console.log("🔄 Migration en cours pour ajouter la table politique_glossary...");
  
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("✅ Table political_glossary ajoutée avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();