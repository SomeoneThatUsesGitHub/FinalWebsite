/**
 * Ce script ajoute la colonne sources à la table articles
 */
import { pool } from "../server/db";
import { hashPassword } from "../server/auth";

async function main() {
  try {
    console.log('Vérification et ajout de la colonne sources à la table articles...');
    
    // Vérifier si la colonne sources existe déjà
    const checkSourcesColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'sources'
    `);
    
    if (checkSourcesColumn.rows.length === 0) {
      console.log('Ajout de la colonne "sources"...');
      await pool.query(`ALTER TABLE articles ADD COLUMN sources TEXT`);
      console.log('Colonne "sources" ajoutée avec succès.');
    } else {
      console.log('La colonne "sources" existe déjà.');
    }
    
    console.log('Opération terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
});