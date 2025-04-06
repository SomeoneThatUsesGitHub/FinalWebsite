import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import passport from "passport";
import { isAuthenticated, isAdmin, loginSchema, hashPassword } from "./auth";
import { insertArticleSchema, insertCategorySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - prefix all with /api
  
  // Categories
  app.get("/api/categories", async (req: Request, res: Response) => {
    const categories = await storage.getAllCategories();
    res.json(categories);
  });
  
  app.get("/api/categories/:slug", async (req: Request, res: Response) => {
    const { slug } = req.params;
    const category = await storage.getCategoryBySlug(slug);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  });
  
  // Articles
  app.get("/api/articles", async (req: Request, res: Response) => {
    const { categoryId, search, sort, year } = req.query;
    
    const filters: {
      categoryId?: number;
      search?: string;
      sort?: string;
      year?: number;
    } = {};
    
    if (categoryId && !isNaN(Number(categoryId))) {
      filters.categoryId = Number(categoryId);
    }
    
    if (search && typeof search === 'string') {
      filters.search = search;
    }
    
    if (sort && typeof sort === 'string') {
      filters.sort = sort;
    }
    
    if (year && !isNaN(Number(year))) {
      filters.year = Number(year);
    }
    
    const articles = await storage.getAllArticles(filters);
    res.json(articles);
  });
  
  app.get("/api/articles/featured", async (req: Request, res: Response) => {
    const { limit } = req.query;
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 3;
    
    const articles = await storage.getFeaturedArticles(limitNum);
    res.json(articles);
  });
  
  app.get("/api/articles/recent", async (req: Request, res: Response) => {
    const { limit } = req.query;
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 9;
    
    const articles = await storage.getRecentArticles(limitNum);
    res.json(articles);
  });
  
  app.get("/api/articles/by-category/:categoryId", async (req: Request, res: Response) => {
    const { categoryId } = req.params;
    const { limit } = req.query;
    
    if (isNaN(Number(categoryId))) {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 6;
    
    const articles = await storage.getArticlesByCategory(Number(categoryId), limitNum);
    res.json(articles);
  });
  
  app.get("/api/articles/:slug", async (req: Request, res: Response) => {
    const { slug } = req.params;
    const article = await storage.getArticleBySlug(slug);
    
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    
    // Increment view count asynchronously
    storage.updateArticleViews(article.id).catch(console.error);
    
    res.json(article);
  });
  
  // News Updates for ticker
  app.get("/api/news-updates", async (req: Request, res: Response) => {
    const newsUpdates = await storage.getActiveNewsUpdates();
    res.json(newsUpdates);
  });
  
  // Elections
  app.get("/api/elections", async (req: Request, res: Response) => {
    const elections = await storage.getAllElections();
    res.json(elections);
  });
  
  app.get("/api/elections/upcoming", async (req: Request, res: Response) => {
    const { limit } = req.query;
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 4;
    
    const elections = await storage.getUpcomingElections(limitNum);
    res.json(elections);
  });
  
  app.get("/api/elections/recent", async (req: Request, res: Response) => {
    const { limit } = req.query;
    const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 2;
    
    const elections = await storage.getRecentElections(limitNum);
    res.json(elections);
  });
  
  app.get("/api/elections/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid election ID" });
    }
    
    const election = await storage.getElectionById(Number(id));
    
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    
    res.json(election);
  });
  
  // Educational Content
  app.get("/api/educational-content", async (req: Request, res: Response) => {
    const { categoryId } = req.query;
    
    let categoryIdNum: number | undefined = undefined;
    if (categoryId && !isNaN(Number(categoryId))) {
      categoryIdNum = Number(categoryId);
    }
    
    const content = await storage.getAllEducationalContent(categoryIdNum);
    res.json(content);
  });
  
  app.get("/api/educational-content/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: "Invalid content ID" });
    }
    
    const content = await storage.getEducationalContentById(Number(id));
    
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }
    
    res.json(content);
  });
  
  // Videos
  app.get("/api/videos", async (req: Request, res: Response) => {
    try {
      const { limit } = req.query;
      const limitNum = limit && !isNaN(Number(limit)) ? Number(limit) : 8;
      
      const videos = await storage.getAllVideos(limitNum);
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: "Error fetching videos" });
    }
  });
  
  app.get("/api/videos/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid video ID" });
      }
      
      const video = await storage.getVideoById(Number(id));
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Increment view count asynchronously
      storage.updateVideoViews(video.id).catch(console.error);
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video by ID:", error);
      res.status(500).json({ error: "Error fetching video" });
    }
  });

  // Flash Info (Breaking News) routes
  app.get("/api/flash-infos", async (req: Request, res: Response) => {
    try {
      const flashInfos = await storage.getActiveFlashInfos();
      res.json(flashInfos);
    } catch (error) {
      console.error("Error fetching flash infos:", error);
      res.status(500).json({ error: "Error fetching flash infos" });
    }
  });

  app.get("/api/flash-infos/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid flash info ID" });
      }
      
      const flashInfo = await storage.getFlashInfoById(Number(id));
      
      if (!flashInfo) {
        return res.status(404).json({ message: "Flash info not found" });
      }
      
      res.json(flashInfo);
    } catch (error) {
      console.error("Error fetching flash info:", error);
      res.status(500).json({ error: "Error fetching flash info" });
    }
  });

  // Live Event routes
  app.get("/api/live-event", async (req: Request, res: Response) => {
    try {
      const liveEvent = await storage.getActiveLiveEvent();
      
      if (!liveEvent) {
        return res.status(404).json({ message: "No active live event" });
      }
      
      res.json(liveEvent);
    } catch (error) {
      console.error("Error fetching live event:", error);
      res.status(500).json({ error: "Error fetching live event" });
    }
  });

  app.get("/api/live-events/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid live event ID" });
      }
      
      const liveEvent = await storage.getLiveEventById(Number(id));
      
      if (!liveEvent) {
        return res.status(404).json({ message: "Live event not found" });
      }
      
      res.json(liveEvent);
    } catch (error) {
      console.error("Error fetching live event:", error);
      res.status(500).json({ error: "Error fetching live event" });
    }
  });

  // Routes d'authentification pour l'admin portal
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      // Validation des données d'entrée
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      // Authentification via Passport
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          console.error("Auth error:", err);
          return res.status(500).json({ message: "Erreur d'authentification" });
        }
        
        if (!user) {
          return res.status(401).json({ message: info.message || "Identifiants incorrects" });
        }
        
        // Connexion de l'utilisateur
        req.logIn(user, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Erreur de connexion" });
          }
          
          // Création d'un objet utilisateur sans le mot de passe
          const safeUser = {
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            avatarUrl: user.avatarUrl,
            isAdmin: user.role === "admin"
          };
          
          return res.json({ user: safeUser });
        });
      })(req, res);
    } catch (error) {
      console.error("Login route error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
  
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà pris" });
      }
      
      // Hacher le mot de passe
      const hashedPassword = await hashPassword(userData.password);
      
      // Créer le nouvel utilisateur
      const newUser = await storage.createUser({
        username: userData.username,
        password: hashedPassword,
        displayName: userData.displayName,
        role: "editor", // Par défaut, les nouveaux utilisateurs sont des éditeurs
        avatarUrl: null
      });
      
      // Connecter l'utilisateur automatiquement
      req.login(newUser, (err) => {
        if (err) {
          console.error("Error logging in after registration:", err);
          return res.status(500).json({ message: "Erreur lors de la connexion après inscription" });
        }
        
        // Création d'un objet utilisateur sans le mot de passe
        const safeUser = {
          id: newUser.id,
          username: newUser.username,
          displayName: newUser.displayName,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          isAdmin: newUser.role === "admin"
        };
        
        return res.status(201).json({ user: safeUser });
      });
    } catch (err) {
      console.error("Registration error:", err);
      res.status(400).json({ message: "Erreur lors de l'inscription" });
    }
  });
  
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erreur lors de la déconnexion" });
      }
      res.json({ message: "Déconnecté avec succès" });
    });
  });
  
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    
    const user = req.user as any;
    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isAdmin: user.role === "admin"
    };
    
    res.json({ user: safeUser });
  });
  
  // Routes admin pour les articles
  app.get("/api/admin/articles", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const articles = await storage.getAllArticles();
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles for admin:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des articles" });
    }
  });
  
  app.get("/api/admin/articles/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'article invalide" });
      }
      
      const article = await storage.getArticleById(Number(id));
      
      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching article for admin:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'article" });
    }
  });
  
  app.post("/api/admin/articles", isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validation du schéma d'article
      const validation = insertArticleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const article = await storage.createArticle(validation.data);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Erreur lors de la création de l'article" });
    }
  });
  
  app.put("/api/admin/articles/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'article invalide" });
      }
      
      console.log("Données reçues pour mise à jour d'article:", req.body);
      
      // S'assurer que les champs requis sont présents
      if (!req.body.title || !req.body.slug || !req.body.content || !req.body.categoryId) {
        return res.status(400).json({ 
          message: "Données incomplètes",
          details: "Les champs titre, slug, contenu et catégorie sont obligatoires" 
        });
      }
      
      // Validation partielle des données d'article
      const validation = insertArticleSchema.partial().safeParse(req.body);
      if (!validation.success) {
        console.error("Erreur de validation:", validation.error.errors);
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: validation.error.errors 
        });
      }
      
      // Conversion explicite de categoryId en nombre
      const updateData = {
        ...validation.data,
        categoryId: Number(req.body.categoryId)
      };
      
      console.log("Données validées pour mise à jour:", updateData);
      
      const updatedArticle = await storage.updateArticle(Number(id), updateData);
      
      if (!updatedArticle) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      
      res.json(updatedArticle);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'article" });
    }
  });
  
  app.delete("/api/admin/articles/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'article invalide" });
      }
      
      const result = await storage.deleteArticle(Number(id));
      
      if (!result) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      
      res.json({ message: "Article supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'article" });
    }
  });
  
  // Routes admin pour les catégories
  app.post("/api/admin/categories", isAdmin, async (req: Request, res: Response) => {
    try {
      // Validation du schéma de catégorie
      const validation = insertCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const category = await storage.createCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
