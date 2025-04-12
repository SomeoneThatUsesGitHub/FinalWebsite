/**
 * Ce script pousse le schéma des cours éducatifs vers la base de données
 */

import { db, pool } from "../server/db";
import { courses, chapters, lessons } from "../shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";

async function main() {
  try {
    console.log("Démarrage de la migration pour les tables de cours...");
    
    // Vérifier si les tables existent déjà
    console.log("Vérification des tables existantes...");
    const client = await pool.connect();
    
    try {
      // On vérifie si les tables existent
      const tableCheckQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('courses', 'chapters', 'lessons')
      `;
      
      const result = await client.query(tableCheckQuery);
      const existingTables = result.rows.map(row => row.table_name);
      
      console.log("Tables existantes:", existingTables);
      
      // Créer les tables si elles n'existent pas
      if (!existingTables.includes('courses')) {
        console.log("Création de la table courses...");
        await db.execute(`
          CREATE TABLE IF NOT EXISTS courses (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
            author_id INTEGER NOT NULL REFERENCES users(id),
            published BOOLEAN NOT NULL DEFAULT FALSE
          )
        `);
      }
      
      if (!existingTables.includes('chapters')) {
        console.log("Création de la table chapters...");
        await db.execute(`
          CREATE TABLE IF NOT EXISTS chapters (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            "order" INTEGER NOT NULL,
            course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
      }
      
      if (!existingTables.includes('lessons')) {
        console.log("Création de la table lessons...");
        await db.execute(`
          CREATE TABLE IF NOT EXISTS lessons (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            "order" INTEGER NOT NULL,
            chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          )
        `);
      }
      
      console.log("Migration des tables de cours terminée avec succès!");
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();