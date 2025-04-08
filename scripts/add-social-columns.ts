import { pool } from '../server/db';

/**
 * Ce script ajoute les colonnes pour les réseaux sociaux à la table utilisateurs
 */
async function main() {
  try {
    console.log('Ajout des colonnes pour les réseaux sociaux à la table users...');
    
    // Vérifier si la colonne twitter_handle existe déjà
    const checkTwitterColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'twitter_handle'
    `);
    
    if (checkTwitterColumn.rows.length === 0) {
      console.log('Ajout de la colonne "twitter_handle"...');
      await pool.query(`ALTER TABLE users ADD COLUMN twitter_handle TEXT`);
    } else {
      console.log('La colonne "twitter_handle" existe déjà.');
    }
    
    // Vérifier si la colonne instagram_handle existe déjà
    const checkInstagramColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'instagram_handle'
    `);
    
    if (checkInstagramColumn.rows.length === 0) {
      console.log('Ajout de la colonne "instagram_handle"...');
      await pool.query(`ALTER TABLE users ADD COLUMN instagram_handle TEXT`);
    } else {
      console.log('La colonne "instagram_handle" existe déjà.');
    }
    
    // Vérifier si la colonne email existe déjà
    const checkEmailColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    `);
    
    if (checkEmailColumn.rows.length === 0) {
      console.log('Ajout de la colonne "email"...');
      await pool.query(`ALTER TABLE users ADD COLUMN email TEXT`);
    } else {
      console.log('La colonne "email" existe déjà.');
    }
    
    console.log('Opération terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
  } finally {
    await pool.end();
  }
}

main();