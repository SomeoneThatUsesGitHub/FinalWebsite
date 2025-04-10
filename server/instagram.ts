/**
 * Module pour l'intégration avec l'API Instagram
 */
import axios from 'axios';
import { storage } from './storage';

// Durée de validité du cache en millisecondes (1 heure)
const CACHE_TTL = 60 * 60 * 1000;

/**
 * Récupère les publications Instagram depuis l'API ou le cache
 */
export async function fetchInstagramPosts() {
  try {
    // Vérifier si on a des données en cache encore valides
    const cachedData = await storage.getCachedPosts();
    const now = Date.now();

    // Si les données en cache sont encore valides, les utiliser
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
      console.log('Utilisation des données Instagram en cache');
      return { posts: cachedData.data, fromCache: true };
    }

    // Sinon, aller chercher de nouvelles données
    console.log('Récupération des données Instagram depuis l\'API');
    return await fetchInstagramData();
  } catch (error) {
    console.error('Erreur lors de la récupération des posts Instagram:', error);
    
    // En cas d'erreur, essayer quand même de récupérer les données en cache même si expirées
    try {
      const cachedData = await storage.getCachedPosts();
      if (cachedData) {
        console.log('Utilisation des données Instagram en cache (expirées)');
        return { posts: cachedData.data, fromCache: true, expired: true };
      }
    } catch (cacheError) {
      console.error('Erreur lors de la récupération du cache Instagram:', cacheError);
    }
    
    // Si tout échoue, renvoyer une erreur
    return { 
      posts: [], 
      error: "Impossible de récupérer les publications Instagram. Veuillez réessayer plus tard." 
    };
  }
}

/**
 * Interroge l'API Instagram Graph pour récupérer les posts
 */
async function fetchInstagramData() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;
  
  if (!accessToken || !userId) {
    throw new Error('Paramètres d\'authentification Instagram manquants');
  }
  
  try {
    // Récupérer les médias avec l'API Instagram Graph
    const mediaResponse = await axios.get(`https://graph.instagram.com/v18.0/${userId}/media`, {
      params: {
        access_token: accessToken,
        fields: 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type}'
      }
    });

    if (!mediaResponse.data || !mediaResponse.data.data) {
      throw new Error('Format de réponse Instagram invalide');
    }

    // Mettre en cache
    await storage.cachePosts(mediaResponse.data.data);
    
    return { posts: mediaResponse.data.data, fromCache: false };
  } catch (error) {
    console.error('Erreur lors de la récupération des posts Instagram:', error.response?.data || error);
    throw new Error('Erreur lors de la récupération des posts Instagram');
  }
}

/**
 * Force l'actualisation du cache Instagram
 */
export async function refreshInstagramCache() {
  try {
    const result = await fetchInstagramData();
    return { success: true, posts: result.posts };
  } catch (error) {
    console.error('Erreur lors de l\'actualisation du cache Instagram:', error);
    return { 
      success: false, 
      error: "Impossible de rafraîchir les données Instagram. Vérifiez vos identifiants Instagram." 
    };
  }
}