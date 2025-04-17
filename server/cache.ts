/**
 * Configuration du système de cache pour le serveur
 */
import { Request, Response, NextFunction } from 'express';
import mcache from 'memory-cache';
import cacheControl from 'express-cache-controller';

// Durée par défaut du cache en secondes
const DEFAULT_CACHE_DURATION = 60 * 5; // 5 minutes

// Configurer le middleware de cache pour les réponses HTTP
export const setupCacheControl = () => {
  return cacheControl({
    maxAge: DEFAULT_CACHE_DURATION,
    mustRevalidate: true,
    private: false,
  });
};

// Middleware de cache en mémoire pour les routes d'API
export const cacheMiddleware = (duration: number = DEFAULT_CACHE_DURATION) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Ne pas mettre en cache les requêtes POST, PUT ou DELETE ou si l'utilisateur est connecté
    if (req.method !== 'GET' || req.isAuthenticated()) {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = mcache.get(key);

    if (cachedBody) {
      res.send(cachedBody);
      return;
    }

    const originalSend = res.send;
    res.send = function(body: any): Response {
      mcache.put(key, body, duration * 1000);
      return originalSend.call(this, body);
    };

    next();
  };
};

// Fonction pour invalider le cache pour une clé spécifique
export const invalidateCache = (key: string) => {
  mcache.del(`__express__${key}`);
};

// Fonction pour invalider plusieurs clés de cache qui commencent par un préfixe
export const invalidateCacheByPrefix = (prefix: string) => {
  const keys = mcache.keys();
  keys.forEach((key: string) => {
    if (key.startsWith(`__express__${prefix}`)) {
      mcache.del(key);
    }
  });
};

// Fonction pour invalider tout le cache
export const invalidateAllCache = () => {
  mcache.clear();
};