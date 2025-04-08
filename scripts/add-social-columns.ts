/**
 * Ce script ajoute les colonnes pour les réseaux sociaux à la table utilisateurs
 */
import { pool, db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Ajout des colonnes pour les réseaux sociaux à la table users...");
  
  try {
    // Vérifier si les colonnes existent déjà
    const checkColumnsSQL = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('twitter_handle', 'instagram_handle', 'email');
    `;
    
    const result = await pool.query(checkColumnsSQL);
    const existingColumns = result.rows.map(row => row.column_name);
    
    console.log("Colonnes existantes:", existingColumns);
    
    // Ajouter les colonnes manquantes
    const queries: string[] = [];
    
    if (!existingColumns.includes('twitter_handle')) {
      queries.push("ALTER TABLE users ADD COLUMN twitter_handle TEXT;");
    }
    
    if (!existingColumns.includes('instagram_handle')) {
      queries.push("ALTER TABLE users ADD COLUMN instagram_handle TEXT;");
    }
    
    if (!existingColumns.includes('email')) {
      queries.push("ALTER TABLE users ADD COLUMN email TEXT;");
    }
    
    if (queries.length > 0) {
      console.log("Exécution des requêtes suivantes:");
      queries.forEach(q => console.log(" - " + q));
      
      // Exécuter chaque requête
      for (const query of queries) {
        await pool.query(query);
      }
      
      console.log("Colonnes ajoutées avec succès!");
    } else {
      console.log("Toutes les colonnes existent déjà.");
    }
    
  } catch (error) {
    console.error("Erreur lors de l'ajout des colonnes:", error);
  } finally {
    // Fermer la connexion
    await pool.end();
  }
}

main().catch(e => {
  console.error("Erreur non gérée:", e);
  process.exit(1);
});