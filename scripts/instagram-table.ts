/**
 * Script pour créer la table instagram_cache dans la base de données
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Création de la table instagram_cache...");
  
  try {
    // Vérifier si la table existe déjà
    try {
      const existsResult = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'instagram_cache'
        );
      `);
      
      const exists = existsResult.rows?.[0]?.exists === true;
      
      if (exists) {
        console.log("La table instagram_cache existe déjà.");
        return;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'existence de la table:", error);
    }
    
    // Créer la table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS instagram_cache (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        data JSONB NOT NULL
      );
    `);
    
    console.log("Table instagram_cache créée avec succès.");
  } catch (error) {
    console.error("Erreur lors de la création de la table instagram_cache:", error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));