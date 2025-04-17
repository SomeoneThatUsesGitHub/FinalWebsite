/**
 * Ce script modifie la contrainte de clé étrangère sur la table educational_quizzes
 * pour permettre la suppression en cascade lors de la suppression d'un contenu éducatif
 */
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Mise à jour de la contrainte de clé étrangère pour les quiz éducatifs...");
    
    // 1. Identifier le nom de la contrainte
    const constraintResult = await db.execute(sql`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'educational_quizzes'::regclass 
      AND contype = 'f' 
      AND confrelid = 'educational_content'::regclass;
    `);
    
    if (!constraintResult.rows.length) {
      console.log("Contrainte non trouvée, vérification d'une autre méthode...");
      
      // Essai d'une autre méthode pour trouver la contrainte
      const altConstraintResult = await db.execute(sql`
        SELECT tc.constraint_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name = 'educational_quizzes'
          AND ccu.table_name = 'educational_content';
      `);
      
      if (!altConstraintResult.rows.length) {
        throw new Error("Impossible de trouver la contrainte de clé étrangère");
      }
      
      const constraintName = altConstraintResult.rows[0].constraint_name;
      console.log(`Contrainte trouvée: ${constraintName}`);
      
      // 2. Supprimer l'ancienne contrainte
      await db.execute(sql`
        ALTER TABLE educational_quizzes
        DROP CONSTRAINT ${sql.identifier(constraintName)};
      `);
      
      // 3. Ajouter la nouvelle contrainte avec ON DELETE CASCADE
      await db.execute(sql`
        ALTER TABLE educational_quizzes
        ADD CONSTRAINT ${sql.identifier(constraintName)}
        FOREIGN KEY (content_id) 
        REFERENCES educational_content(id) 
        ON DELETE CASCADE;
      `);
    } else {
      const constraintName = constraintResult.rows[0].conname;
      console.log(`Contrainte trouvée: ${constraintName}`);
      
      // 2. Supprimer l'ancienne contrainte
      await db.execute(sql`
        ALTER TABLE educational_quizzes
        DROP CONSTRAINT ${sql.identifier(constraintName)};
      `);
      
      // 3. Ajouter la nouvelle contrainte avec ON DELETE CASCADE
      await db.execute(sql`
        ALTER TABLE educational_quizzes
        ADD CONSTRAINT ${sql.identifier(constraintName)}
        FOREIGN KEY (content_id) 
        REFERENCES educational_content(id) 
        ON DELETE CASCADE;
      `);
    }
    
    console.log("Contrainte mise à jour avec succès!");
    
    // Vérifier également pour la table educational_content et educational_topics
    console.log("Vérifions également la contrainte entre educationalContent et educationalTopics...");
    
    const topicConstraintResult = await db.execute(sql`
      SELECT tc.constraint_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'educational_content'
        AND ccu.table_name = 'educational_topics';
    `);
    
    if (topicConstraintResult.rows.length) {
      const topicConstraintName = topicConstraintResult.rows[0].constraint_name;
      console.log(`Contrainte topic trouvée: ${topicConstraintName}`);
      
      // Supprimer l'ancienne contrainte
      await db.execute(sql`
        ALTER TABLE educational_content
        DROP CONSTRAINT ${sql.identifier(topicConstraintName)};
      `);
      
      // Ajouter la nouvelle contrainte avec ON DELETE CASCADE
      await db.execute(sql`
        ALTER TABLE educational_content
        ADD CONSTRAINT ${sql.identifier(topicConstraintName)}
        FOREIGN KEY (topic_id) 
        REFERENCES educational_topics(id) 
        ON DELETE CASCADE;
      `);
      
      console.log("Contrainte topic mise à jour avec succès!");
    } else {
      console.log("Aucune contrainte trouvée entre educational_content et educational_topics.");
    }
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la contrainte:", error);
    process.exit(1);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Erreur non gérée:", error);
  process.exit(1);
});