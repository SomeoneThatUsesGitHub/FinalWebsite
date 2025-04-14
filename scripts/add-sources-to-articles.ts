/**
 * Ce script ajoute la colonne 'sources' à la table articles
 */
import { pool } from "../server/db";

async function main() {
  console.log("Vérification de la colonne 'sources' pour la table 'articles'...");
  
  try {
    // Vérifier si la colonne sources existe déjà
    const checkSourcesColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'sources'
    `);
    
    if (checkSourcesColumn.rows.length === 0) {
      console.log("Ajout de la colonne 'sources' à la table 'articles'...");
      await pool.query(`ALTER TABLE articles ADD COLUMN sources TEXT`);
      console.log("Colonne 'sources' ajoutée avec succès!");
    } else {
      console.log("La colonne 'sources' existe déjà dans la table 'articles'.");
    }
    
    console.log("Opération terminée avec succès!");
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la table 'articles':", error);
  } finally {
    await pool.end();
  }
}

main().catch(error => {
  console.error("Erreur non gérée:", error);
  process.exit(1);
});