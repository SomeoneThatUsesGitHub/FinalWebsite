/**
 * Ce script crée la table political_glossary dans la base de données
 */
import { pool } from "../server/db";

async function main() {
  console.log("Connexion à la base de données...");
  
  try {
    // Création de la table political_glossary
    await pool.query(`
      CREATE TABLE IF NOT EXISTS political_glossary (
        id SERIAL PRIMARY KEY,
        term TEXT NOT NULL UNIQUE,
        definition TEXT NOT NULL,
        examples TEXT,
        category TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log("Table political_glossary créée avec succès!");
  } catch (error) {
    console.error("Erreur lors de la création de la table political_glossary:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();