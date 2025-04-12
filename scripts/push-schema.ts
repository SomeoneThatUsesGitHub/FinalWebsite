/**
 * Ce script permet de pousser les changements de schéma vers la base de données
 * Utilisez ce script après avoir modifié le schéma dans shared/schema.ts
 */
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }

  console.log("Connexion à la base de données...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  try {
    console.log("Poussée du schéma vers la base de données...");
    // Utiliser la migration automatique pour pousser le schéma
    await db.execute(
      // Table des sujets éducatifs
      `CREATE TABLE IF NOT EXISTS educational_topics (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        icon TEXT,
        color TEXT NOT NULL DEFAULT '#3B82F6',
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );`
    );

    // Modifier la table existante de contenu éducatif
    await db.execute(
      `DROP TABLE IF EXISTS educational_content;
       CREATE TABLE educational_content (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        summary TEXT NOT NULL,
        image_url TEXT NOT NULL,
        topic_id INTEGER NOT NULL REFERENCES educational_topics(id),
        author_id INTEGER REFERENCES users(id),
        published BOOLEAN NOT NULL DEFAULT TRUE,
        likes INTEGER NOT NULL DEFAULT 0,
        views INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );`
    );

    console.log("Schéma mis à jour avec succès!");
  } catch (error) {
    console.error("Erreur lors de la mise à jour du schéma:", error);
  } finally {
    await pool.end();
  }
}

main().catch(console.error);