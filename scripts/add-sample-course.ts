/**
 * Ce script ajoute un cours d'exemple à la base de données
 */

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  console.log("Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  // Trouver un administrateur pour être l'auteur
  const [adminUser] = await db.select().from(schema.users).where(eq(schema.users.role, "admin")).limit(1);
  
  if (!adminUser) {
    console.error("❌ Aucun administrateur trouvé. Veuillez créer un utilisateur administrateur avant d'ajouter un cours.");
    process.exit(1);
  }

  console.log(`Création d'un cours d'exemple avec l'auteur: ${adminUser.username}`);

  try {
    // Créer un cours sur l'Assemblée Nationale
    const [course] = await db.insert(schema.courses).values({
      title: "L'Assemblée Nationale",
      slug: "assemblee-nationale",
      description: "Découvrez le fonctionnement et le rôle de l'Assemblée Nationale dans la démocratie française.",
      category: "Institutions",
      authorId: adminUser.id,
      published: true
    }).returning();

    console.log(`✅ Cours créé: ${course.title} (ID: ${course.id})`);

    // Créer des chapitres
    const [chapitre1] = await db.insert(schema.chapters).values({
      title: "Histoire et rôle",
      order: 1,
      courseId: course.id
    }).returning();

    const [chapitre2] = await db.insert(schema.chapters).values({
      title: "Fonctionnement et composition",
      order: 2,
      courseId: course.id
    }).returning();

    console.log(`✅ Chapitres créés`);

    // Créer des leçons pour le chapitre 1
    await db.insert(schema.lessons).values({
      title: "Origines historiques",
      content: "L'Assemblée nationale trouve ses origines dans les États généraux de l'Ancien Régime. Le 17 juin 1789, les députés du tiers état se proclament « Assemblée nationale ». C'est le début de la Révolution française.\n\nAprès diverses évolutions (Assemblée nationale constituante, Assemblée nationale législative, Convention nationale, Conseil des Cinq-Cents, Corps législatif, Chambre des députés), l'Assemblée nationale actuelle est l'héritière directe de l'Assemblée nationale constituante de 1946 qui rédigea la Constitution de la IVe République.\n\nDans sa forme actuelle, l'Assemblée nationale existe depuis la Constitution du 4 octobre 1958 qui fonde la Ve République.",
      order: 1,
      chapterId: chapitre1.id
    });

    await db.insert(schema.lessons).values({
      title: "Rôle et pouvoirs",
      content: "L'Assemblée nationale constitue, avec le Sénat, le Parlement français. Ses principales fonctions sont :\n\n1. **Fonction législative** : Elle vote les lois et peut amender les projets présentés par le gouvernement.\n\n2. **Fonction de contrôle** : Elle contrôle l'action du gouvernement à travers les questions au gouvernement, les commissions d'enquête, et peut même censurer le gouvernement (ce que ne peut pas faire le Sénat).\n\n3. **Fonction d'évaluation** : Elle évalue les politiques publiques et leurs résultats.\n\nContrairement au Sénat, l'Assemblée nationale peut être dissoute par le Président de la République, ce qui entraîne de nouvelles élections législatives.",
      order: 2,
      chapterId: chapitre1.id
    });

    // Créer des leçons pour le chapitre 2
    await db.insert(schema.lessons).values({
      title: "Composition et élection",
      content: "L'Assemblée nationale est composée de 577 députés, élus pour 5 ans au suffrage universel direct par scrutin majoritaire à deux tours dans le cadre de circonscriptions législatives.\n\nPour être élu au premier tour, un candidat doit obtenir la majorité absolue des suffrages exprimés et un nombre de voix au moins égal au quart des électeurs inscrits. Au second tour, la majorité relative suffit.\n\nLes députés peuvent être réélus sans limitation de mandats, bien que des lois sur le non-cumul des mandats limitent la possibilité pour un député d'exercer simultanément d'autres fonctions électives importantes.",
      order: 1,
      chapterId: chapitre2.id
    });

    await db.insert(schema.lessons).values({
      title: "Organisation interne",
      content: "L'Assemblée nationale s'organise autour de plusieurs structures :\n\n1. **Le Président** : Élu pour la durée de la législature, il dirige les débats, fait respecter le règlement et représente l'Assemblée.\n\n2. **Le Bureau** : Composé du Président, de 6 vice-présidents, 3 questeurs et 12 secrétaires, il gère l'organisation interne.\n\n3. **La Conférence des Présidents** : Elle établit l'ordre du jour des travaux.\n\n4. **Les Commissions permanentes** : Au nombre de 8, elles examinent les projets et propositions de loi avant leur discussion en séance publique.\n\n5. **Les Groupes politiques** : Regroupements de députés partageant les mêmes affinités politiques (minimum 15 députés pour constituer un groupe).\n\nLe palais Bourbon à Paris est le siège de l'Assemblée nationale.",
      order: 2,
      chapterId: chapitre2.id
    });

    await db.insert(schema.lessons).values({
      title: "Le travail législatif",
      content: "Le processus législatif à l'Assemblée nationale comprend plusieurs étapes :\n\n1. **Dépôt** : Un projet (gouvernement) ou une proposition (parlementaires) de loi est déposé.\n\n2. **Examen en commission** : Le texte est examiné par une commission qui peut proposer des amendements.\n\n3. **Discussion en séance plénière** : Le texte est débattu article par article. Les députés peuvent proposer des amendements.\n\n4. **Vote** : L'Assemblée se prononce sur le texte amendé.\n\n5. **Navette parlementaire** : Le texte adopté est transmis au Sénat qui peut l'adopter tel quel, le rejeter ou le modifier.\n\n6. **Commission mixte paritaire** : En cas de désaccord persistant entre l'Assemblée et le Sénat, une CMP peut être convoquée.\n\n7. **Dernier mot** : Si la CMP échoue, l'Assemblée nationale peut statuer définitivement, ce qui lui confère un pouvoir supérieur à celui du Sénat.",
      order: 3,
      chapterId: chapitre2.id
    });

    console.log(`✅ Leçons créées`);
    console.log(`✅ Cours d'exemple ajouté avec succès!`);

  } catch (error) {
    console.error("❌ Erreur lors de la création du cours d'exemple:", error);
    throw error;
  }

  await pool.end();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Échec:", error);
    process.exit(1);
  });