/**
 * Ce script ajoute la colonne author_id à la table educational_topics
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Vérifiant si la colonne author_id existe déjà...");
    const columnExists = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'educational_topics' 
      AND column_name = 'author_id'
    `);

    if (columnExists.rows.length > 0) {
      console.log("La colonne author_id existe déjà.");
      return;
    }

    console.log("Ajout de la colonne author_id à la table educational_topics...");
    await db.execute(sql`
      ALTER TABLE educational_topics 
      ADD COLUMN author_id INTEGER REFERENCES users(id)
    `);

    console.log("Définition d'un auteur par défaut pour les sujets existants...");
    // Trouver un administrateur pour l'utiliser comme auteur par défaut
    const adminResult = await db.execute(sql`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `);

    if (adminResult.rows.length > 0) {
      const adminId = adminResult.rows[0].id;
      await db.execute(sql`
        UPDATE educational_topics
        SET author_id = ${adminId}
        WHERE author_id IS NULL
      `);
      console.log(`Auteur par défaut (ID: ${adminId}) assigné aux sujets existants.`);
    } else {
      console.log("Aucun administrateur trouvé, les sujets n'ont pas d'auteur par défaut.");
    }

    console.log("Migration terminée avec succès.");
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();