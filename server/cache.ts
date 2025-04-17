import { Request, Response, NextFunction } from 'express';

// Cache simple en mémoire, utilisé pour stocker les réponses des routes les plus utilisées
// Structure: { [key: string]: { data: any, timestamp: number } }
const cache: Record<string, { data: any, timestamp: number }> = {};

// Durée de cache par défaut pour l'admin (très courte)
const ADMIN_CACHE_DURATION = 2; // 2 secondes

export function cacheMiddleware(duration: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Uniquement mettre en cache les requêtes GET
    if (req.method !== 'GET') {
      return next();
    }

    // Pour les routes admin, utiliser une durée de cache très courte
    const effectiveDuration = req.path.includes('/admin/') ? ADMIN_CACHE_DURATION : duration;
    
    const key = req.originalUrl || req.url;
    const cachedResponse = cache[key];
    
    // Si on a une réponse en cache et qu'elle n'est pas expirée
    if (cachedResponse && Date.now() - cachedResponse.timestamp < effectiveDuration * 1000) {
      return res.json(cachedResponse.data);
    }

    // On sauvegarde la méthode json originale
    const originalJson = res.json;
    
    // On remplace res.json pour intercepter la réponse
    res.json = function(data: any) {
      // On stocke les données dans le cache
      cache[key] = { data, timestamp: Date.now() };
      // On appelle la méthode json originale
      return originalJson.call(res, data);
    };

    next();
  };
}

// Fonction pour invalider manuellement une entrée du cache
export function invalidateCache(path: string): void {
  if (cache[path]) {
    delete cache[path];
    console.log(`Cache invalidé pour: ${path}`);
  }
}

// Fonction pour invalider toutes les entrées du cache contenant un certain préfixe
export function invalidateCacheByPrefix(prefix: string): void {
  Object.keys(cache).forEach(key => {
    if (key.startsWith(prefix)) {
      delete cache[key];
      console.log(`Cache invalidé pour: ${key}`);
    }
  });
}

// Fonction pour invalider tout le cache lié à l'admin
export function invalidateAdminCache(): void {
  Object.keys(cache).forEach(key => {
    if (key.includes('/admin/')) {
      delete cache[key];
    }
  });
  console.log('Cache admin entièrement vidé');
}

// Fonction pour vider tout le cache
export function clearCache(): void {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
  console.log('Cache entièrement vidé');
}

// Fonction pour obtenir l'état actuel du cache (pour debugging)
export function getCacheStatus(): Record<string, { dataSize: string, age: string }> {
  const status: Record<string, { dataSize: string, age: string }> = {};
  
  Object.entries(cache).forEach(([key, value]) => {
    const dataSize = JSON.stringify(value.data).length;
    const formattedSize = dataSize > 1024 
      ? `${(dataSize / 1024).toFixed(2)} KB` 
      : `${dataSize} bytes`;
    
    const ageInSeconds = Math.floor((Date.now() - value.timestamp) / 1000);
    const ageDisplay = ageInSeconds < 60 
      ? `${ageInSeconds}s` 
      : `${Math.floor(ageInSeconds / 60)}m ${ageInSeconds % 60}s`;
    
    status[key] = {
      dataSize: formattedSize,
      age: ageDisplay
    };
  });
  
  return status;
}