/**
 * Ce script crée la table historical_events dans la base de données
 */
import { db, pool } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Création de la table historical_events...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS historical_events (
        id SERIAL PRIMARY KEY,
        year INTEGER NOT NULL,
        month INTEGER,
        day INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        category TEXT NOT NULL DEFAULT 'politique',
        importance INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id)
      );
    `);
    
    console.log("Table historical_events créée avec succès!");
  } catch (error) {
    console.error("Erreur lors de la création de la table historical_events:", error);
  } finally {
    await pool.end();
  }
}

main();