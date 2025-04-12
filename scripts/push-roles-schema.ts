/**
 * Ce script permet de pousser les changements de schéma des rôles et permissions 
 * vers la base de données et d'initialiser les données de base
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { exec } from "child_process";
import { promisify } from "util";

neonConfig.webSocketConstructor = ws;

const execAsync = promisify(exec);

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL n'est pas défini");
  }

  console.log("Démarrage de la migration du schéma...");

  try {
    // Générer le schéma SQL pour les migrations
    console.log("Génération du schéma SQL...");
    await execAsync("npx drizzle-kit generate:pg");
    
    // Connexion à la base de données
    console.log("Connexion à la base de données...");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool, { schema });
    
    // Pousser le schéma vers la base de données (migration)
    console.log("Poussée du schéma vers la base de données...");
    await pool.query(`
      -- Création de la table des permissions si elle n'existe pas
      CREATE TABLE IF NOT EXISTS admin_permissions (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        description TEXT DEFAULT '',
        icon TEXT DEFAULT 'FileText',
        category TEXT DEFAULT 'content',
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Création de la table des rôles personnalisés si elle n'existe pas
      CREATE TABLE IF NOT EXISTS custom_roles (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        description TEXT DEFAULT '',
        color TEXT DEFAULT '#6366f1',
        is_system BOOLEAN DEFAULT FALSE,
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Création de la table des permissions par rôle si elle n'existe pas
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES custom_roles(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES admin_permissions(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
      
      -- Ajout de la colonne custom_role_id à la table users si elle n'existe pas
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'custom_role_id') THEN
          ALTER TABLE users ADD COLUMN custom_role_id INTEGER REFERENCES custom_roles(id);
        END IF;
      END
      $$;
    `);
    
    console.log("Migration terminée avec succès!");
    
    // Exécuter le script pour initialiser les données de base
    console.log("Initialisation des données de base...");
    await import("./update-schema-for-roles");
    
  } catch (error) {
    console.error("Erreur lors de la migration:", error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log("Tout est terminé!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erreur non gérée:", error);
    process.exit(1);
  });