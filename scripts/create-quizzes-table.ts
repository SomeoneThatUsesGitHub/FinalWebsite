/**
 * Ce script crée la table educational_quizzes dans la base de données
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Vérification de l'existence de la table des quiz...");

    // Vérifier si la table existe déjà
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'educational_quizzes'
      );
    `);

    if (tableExists[0].exists === false) {
      console.log("Création de la table educational_quizzes...");
      
      // Créer la table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS educational_quizzes (
          id SERIAL PRIMARY KEY,
          content_id INTEGER NOT NULL REFERENCES educational_content(id),
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
    } else {
      console.log("La table educational_quizzes existe déjà.");
    }
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