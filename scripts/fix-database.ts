import { pool, db } from '../server/db';
import { hashPassword } from '../server/auth';

/**
 * Ce script permet de corriger la structure de la base de données et d'ajouter un administrateur temporaire
 */
async function main() {
  try {
    console.log('Tentative de correction de la structure de la table users...');
    
    // Vérifier si la colonne title existe déjà
    const checkTitleColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'title'
    `);
    
    if (checkTitleColumn.rows.length === 0) {
      console.log('Ajout de la colonne "title"...');
      await pool.query(`ALTER TABLE users ADD COLUMN title TEXT`);
    } else {
      console.log('La colonne "title" existe déjà.');
    }
    
    // Vérifier si la colonne is_team_member existe déjà
    const checkTeamMemberColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_team_member'
    `);
    
    if (checkTeamMemberColumn.rows.length === 0) {
      console.log('Ajout de la colonne "is_team_member"...');
      await pool.query(`ALTER TABLE users ADD COLUMN is_team_member BOOLEAN DEFAULT FALSE`);
    } else {
      console.log('La colonne "is_team_member" existe déjà.');
    }
    
    // Vérifier si la colonne bio existe déjà
    const checkBioColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'bio'
    `);
    
    if (checkBioColumn.rows.length === 0) {
      console.log('Ajout de la colonne "bio"...');
      await pool.query(`ALTER TABLE users ADD COLUMN bio TEXT`);
    } else {
      console.log('La colonne "bio" existe déjà.');
    }
    
    // Création d'un administrateur temporaire
    console.log('Création de l\'utilisateur admin temporaire...');
    
    // Vérifier si l'utilisateur tempAdmin existe déjà
    const checkAdmin = await pool.query(`
      SELECT * FROM users WHERE username = 'tempAdmin'
    `);
    
    if (checkAdmin.rows.length === 0) {
      const hashedPassword = await hashPassword('Admin123!');
      
      await pool.query(`
        INSERT INTO users (username, password, display_name, role, avatar_url, title, bio, is_team_member) 
        VALUES ('tempAdmin', $1, 'Administrateur Temporaire', 'admin', NULL, 'Administrateur', 'Compte administrateur temporaire', FALSE)
      `, [hashedPassword]);
      
      console.log('Administrateur temporaire créé avec succès!');
      console.log('Utilisateur: tempAdmin');
      console.log('Mot de passe: Admin123!');
    } else {
      console.log('L\'utilisateur tempAdmin existe déjà.');
    }
    
    console.log('Opération terminée avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error);
  } finally {
    await pool.end();
  }
}

main();