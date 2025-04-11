/**
 * Ce script ajoute la colonne assignedTo à la table contact_messages
 */

import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import ws from "ws";

// Configuration de NeonDB avec WebSockets pour Serverless
neonConfig.webSocketConstructor = ws;

// Fonction principale
async function main() {
  console.log("Ajout de la colonne 'assigned_to' à la table contact_messages...");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    // Vérifier si la colonne existe déjà
    const checkColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contact_messages' 
      AND column_name = 'assigned_to'
    `);

    if (checkColumn.rows.length === 0) {
      // La colonne n'existe pas, l'ajouter
      await db.execute(sql`
        ALTER TABLE contact_messages 
        ADD COLUMN assigned_to INTEGER REFERENCES users(id)
      `);
      console.log("✅ Colonne 'assigned_to' ajoutée avec succès");
    } else {
      console.log("ℹ️ La colonne 'assigned_to' existe déjà");
    }

    await pool.end();
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout de la colonne:", error);
    await pool.end();
    process.exit(1);
  }
}

// Exécuter la fonction principale
main()
  .then(() => {
    console.log("Script terminé avec succès");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Erreur dans le script:", err);
    process.exit(1);
  });