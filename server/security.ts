import { Express } from 'express';
import helmet from 'helmet';

/**
 * Configure les en-têtes de sécurité pour l'application
 * @param app L'application Express à configurer
 */
export function setupSecurity(app: Express): void {
  // Configuration de base de Helmet avec des défenses contre les attaques les plus courantes
  // Désactivation de certaines protections trop strictes en développement pour éviter les problèmes
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "http:"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:", "http:"],
          imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
          fontSrc: ["'self'", "https:", "http:", "data:"],
          connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
          frameSrc: ["'self'", "https:", "http:"],
          objectSrc: ["'none'"],
          // Dans un environnement de production, activez ce qui suit:
          // upgradeInsecureRequests: []
        },
      },
      // Les autres en-têtes de sécurité standards
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      hidePoweredBy: true,
      frameguard: { action: 'sameorigin' },
      dnsPrefetchControl: { allow: true }
    })
  );

  // Configuration contre les attaques de redirection ouverte
  app.use((req, res, next) => {
    if (req.query && req.query.redirect) {
      const redirect = req.query.redirect as string;
      // Vérifiez si la redirection est externe
      if (!redirect.startsWith('/') && !redirect.startsWith(`https://${req.hostname}`)) {
        return res.status(400).send('Redirection non autorisée');
      }
    }
    next();
  });

  // Limiter les méthodes HTTP autorisées
  app.use((req, res, next) => {
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'];
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({ message: 'Méthode non autorisée' });
    }
    next();
  });
}