/**
 * Ce script crée les tables nécessaires pour le module d'apprentissage
 */

import { db, pool } from "../server/db";
import {
  learningTopics,
  learningModules,
  learningContents,
  userLearningProgress
} from "../shared/schema";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🚀 Création des tables pour le module d'apprentissage...");
  
  try {
    // Création des tables dans le bon ordre (pour les contraintes de clés étrangères)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS learning_topics (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        image_url TEXT,
        difficulty TEXT NOT NULL DEFAULT 'intermédiaire',
        category TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_published BOOLEAN NOT NULL DEFAULT FALSE,
        estimated_time INTEGER DEFAULT 10,
        popularity INTEGER DEFAULT 0
      );
      
      CREATE TABLE IF NOT EXISTS learning_modules (
        id SERIAL PRIMARY KEY,
        topic_id INTEGER NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS learning_contents (
        id SERIAL PRIMARY KEY,
        module_id INTEGER NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        content JSONB NOT NULL,
        "order" INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      
      CREATE TABLE IF NOT EXISTS user_learning_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        topic_id INTEGER NOT NULL REFERENCES learning_topics(id) ON DELETE CASCADE,
        module_id INTEGER REFERENCES learning_modules(id) ON DELETE CASCADE,
        content_id INTEGER REFERENCES learning_contents(id) ON DELETE CASCADE,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        score INTEGER,
        last_interaction TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    
    console.log("✅ Tables créées avec succès!");
  } catch (error) {
    console.error("❌ Erreur lors de la création des tables:", error);
  } finally {
    await pool.end();
  }
}

main();