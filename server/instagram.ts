import axios from 'axios';
import { db } from './db';
import { storage } from './storage';

/**
 * Récupère les dernières publications Instagram depuis l'API Meta Graph
 * Note: Nécessite un token d'accès Instagram valide
 */
export async function fetchInstagramPosts() {
  try {
    // Vérifier si nous avons un token d'accès
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('Token d\'accès Instagram manquant!');
      return { error: 'Configuration Instagram manquante', posts: [] };
    }

    // Vérifier si nous avons un cache récent (moins de 60 minutes)
    const cachedPosts = await storage.getCachedPosts();
    if (cachedPosts && cachedPosts.timestamp > Date.now() - 3600000) {
      return { posts: cachedPosts.data || [] };
    }

    // L'ID de l'utilisateur Instagram est nécessaire pour l'API
    const userID = process.env.INSTAGRAM_USER_ID;
    const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,children{media_url,media_type}';
    const limit = 24; // Nombre de publications à récupérer
    
    // Appel à l'API Instagram Graph
    const response = await axios.get(
      `https://graph.instagram.com/v13.0/${userID}/media`,
      {
        params: {
          fields,
          limit,
          access_token: accessToken
        }
      }
    );

    const posts = response.data.data || [];
    
    // Mise en cache des données pour éviter des appels excessifs à l'API
    await storage.cachePosts(posts);
    
    return { posts };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des posts Instagram:', error.response?.data || error.message);
    
    // Si le cache existe mais est expiré, on le renvoie quand même en cas d'erreur
    const cachedPosts = await storage.getCachedPosts();
    if (cachedPosts) {
      return { posts: cachedPosts.data || [], error: 'Données en cache (actualisation impossible)' };
    }
    
    return { 
      error: 'Impossible de récupérer les publications Instagram. Veuillez réessayer plus tard.',
      posts: []
    };
  }
}

/**
 * Actualise manuellement le cache Instagram si nécessaire
 */
export async function refreshInstagramCache() {
  try {
    const result = await fetchInstagramPosts();
    return { success: !result.error, message: result.error || 'Cache actualisé avec succès' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Erreur lors de l\'actualisation du cache' };
  }
}