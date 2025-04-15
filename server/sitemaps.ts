import { db } from './db';
import { articles } from '../shared/schema';
import { eq, and, gte } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import express from 'express';

/**
 * Cette fonction génère un sitemap XML spécifique pour Google News
 * Inclut uniquement les articles publiés durant les 2 derniers jours
 */
export async function generateNewsSitemap(): Promise<string> {
  // Obtenir la date d'il y a 2 jours
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  // Récupérer les articles publiés dans les 2 derniers jours
  const twoDaysAgoStr = twoDaysAgo.toISOString();
  const recentArticles = await db
    .select()
    .from(articles)
    .where(
      and(
        eq(articles.published, true)
      )
    )
    // Filtrer manuellement les articles par date
    .then(results => results.filter(article => 
      new Date(article.createdAt) >= twoDaysAgo
    ));
  
  // Création du sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
`;
  
  recentArticles.forEach(article => {
    const publicationDate = new Date(article.createdAt);
    const formattedDate = format(publicationDate, "yyyy-MM-dd'T'HH:mm:ssxxx");
    
    sitemap += `  <url>
    <loc>https://politiquensemble.be/articles/${article.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Politiquensemble</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${formattedDate}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>
`;
  });
  
  sitemap += '</urlset>';
  
  // Écrire le sitemap dans un fichier statique
  const sitemapPath = path.join(process.cwd(), 'public', 'news-sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  
  return sitemap;
}

/**
 * Cette fonction génère un sitemap XML standard pour tous les articles
 */
export async function generateSitemap(): Promise<string> {
  // Récupérer tous les articles publiés
  const publishedArticles = await db
    .select()
    .from(articles)
    .where(eq(articles.published, true));
  
  // Création du sitemap XML
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://politiquensemble.fr/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://politiquensemble.fr/articles</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://politiquensemble.fr/elections</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://politiquensemble.fr/apprendre</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://politiquensemble.fr/team</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://politiquensemble.fr/a-propos</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://politiquensemble.fr/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;
  
  // Ajouter tous les articles au sitemap
  publishedArticles.forEach(article => {
    const lastMod = article.updatedAt || article.createdAt;
    sitemap += `  <url>
    <loc>https://politiquensemble.be/articles/${article.slug}</loc>
    <lastmod>${new Date(lastMod).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  });
  
  sitemap += '</urlset>';
  
  // Écrire le sitemap dans un fichier statique
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemap);
  
  return sitemap;
}

// Fonction d'échappement des caractères spéciaux XML
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Fonction pour configurer les routes de sitemap
export function setupSitemapRoutes(app: express.Express) {
  // Route pour le sitemap standard
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const sitemap = await generateSitemap();
      res.header('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error('Erreur lors de la génération du sitemap:', error);
      res.status(500).send('Erreur lors de la génération du sitemap');
    }
  });
  
  // Route pour le sitemap Google News
  app.get('/news-sitemap.xml', async (req, res) => {
    try {
      const newsSitemap = await generateNewsSitemap();
      res.header('Content-Type', 'application/xml');
      res.send(newsSitemap);
    } catch (error) {
      console.error('Erreur lors de la génération du sitemap Google News:', error);
      res.status(500).send('Erreur lors de la génération du sitemap Google News');
    }
  });
  
  // Générer les sitemaps initiaux au démarrage
  generateSitemap().catch(err => console.error('Erreur lors de la génération du sitemap initial:', err));
  generateNewsSitemap().catch(err => console.error('Erreur lors de la génération du sitemap news initial:', err));
}