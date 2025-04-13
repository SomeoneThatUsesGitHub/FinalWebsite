/**
 * Ce script crée la table educational_quizzes dans la base de données
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Création de la table educational_quizzes...");
    
    // Créer la table directement avec IF NOT EXISTS
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS educational_quizzes (
        id SERIAL PRIMARY KEY,
        content_id INTEGER NOT NULL REFERENCES educational_content(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        option1 TEXT NOT NULL,
        option2 TEXT NOT NULL,
        option3 TEXT NOT NULL,
        correct_option INTEGER NOT NULL,
        explanation TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log("Table educational_quizzes créée avec succès !");
  } catch (error) {
    console.error("Erreur lors de la création de la table:", error);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Erreur non gérée:", error);
  process.exit(1);
});