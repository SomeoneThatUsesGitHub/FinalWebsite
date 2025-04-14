/**
 * Ce script ajoute la table site_alerts à la base de données
 */
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';

// Configuration pour Neon Database
neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL est absent des variables d\'environnement');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Création de la table site_alerts...');
  
  try {
    // Créer la table (s'il existe déjà, on ignorera l'erreur)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_alerts (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        priority INTEGER NOT NULL DEFAULT 1,
        background_color TEXT NOT NULL DEFAULT '#dc2626',
        text_color TEXT NOT NULL DEFAULT '#ffffff',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        created_by INTEGER REFERENCES users(id)
      )
    `);
    console.log('Table site_alerts créée avec succès.');
  } catch (error) {
    console.error('Erreur lors de la création de la table site_alerts:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => console.log('Création de la table site_alerts terminée'))
  .catch(err => {
    console.error('Erreur lors de la création de la table site_alerts:', err);
    process.exit(1);
  });