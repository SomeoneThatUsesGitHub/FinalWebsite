import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import passport from "passport";
import { isAuthenticated, isAdmin, loginSchema, hashPassword } from "./auth";
import * as schema from "@shared/schema";
import { insertArticleSchema, insertCategorySchema, insertFlashInfoSchema, flashInfos, insertVideoSchema, videos } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { createUser, updateUserPassword, listUsers, deleteUser, updateUserProfile, getTeamMembers } from "./userManagement";

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
    const { categoryId, search, sort, year, showAll } = req.query;
    
    const filters: {
      categoryId?: number;
      search?: string;
      sort?: string;
      year?: number;
      showUnpublished?: boolean;
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
    
    // Pour l'administration, montrer tous les articles (brouillons inclus)
    // quand le paramètre showAll est présent et que l'utilisateur est admin
    if (showAll === 'true' && req.isAuthenticated() && (req.user as any)?.role === 'admin') {
      console.log("Admin view - Showing all articles including drafts");
      filters.showUnpublished = true;
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
    
    // Ajouter les propriétés explicitement pour s'assurer qu'elles existent
    const safeUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role || "user",
      avatarUrl: user.avatarUrl || null,
      isAdmin: user.role === "admin" || !!user.isAdmin
    };
    
    // Log pour debugging
    console.log("Session active -", req.sessionID, "- Utilisateur:", safeUser);
    
    // Retourner l'utilisateur directement (sans l'encapsuler dans un objet)
    res.json(safeUser);
  });
  
  // Routes admin pour les articles
  app.get("/api/admin/articles", isAdmin, async (req: Request, res: Response) => {
    try {
      // Montrer tous les articles, y compris les brouillons
      const articles = await storage.getAllArticles({ showUnpublished: true });
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles for admin:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des articles" });
    }
  });
  
  app.get("/api/admin/articles/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'article invalide" });
      }
      
      console.log(`Récupération de l'article ID: ${id} pour édition`);
      const article = await storage.getArticleById(Number(id));
      
      if (!article) {
        console.log(`Article ID: ${id} non trouvé`);
        return res.status(404).json({ message: "Article non trouvé" });
      }
      
      console.log(`Article trouvé:`, {
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content ? article.content.substring(0, 50) + "..." : "Contenu vide", 
        excerpt: article.excerpt,
        categoryId: article.categoryId
      });
      
      res.json(article);
    } catch (error) {
      console.error("Error fetching article for admin:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de l'article" });
    }
  });
  
  app.post("/api/admin/articles", isAdmin, async (req: Request, res: Response) => {
    try {
      console.log("Données reçues pour création d'article:", req.body);
      
      // Validation du schéma d'article
      const validation = insertArticleSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("Erreur de validation pour création:", validation.error.errors);
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      // S'assurer que le slug est valide et assez long
      if (!req.body.slug || req.body.slug.length < 3) {
        return res.status(400).json({ 
          message: "Slug invalide", 
          details: "Le slug doit contenir au moins 3 caractères" 
        });
      }
      
      // Vérifier si un article avec ce slug existe déjà
      const existingArticle = await storage.getArticleBySlug(req.body.slug);
      if (existingArticle) {
        return res.status(400).json({ 
          message: "Slug déjà utilisé", 
          details: "Un article avec ce slug existe déjà. Veuillez en choisir un autre." 
        });
      }
      
      // S'assurer que le statut de publication est correctement géré
      const articleData = {
        ...validation.data,
        published: req.body.published === true || req.body.published === "true",
        featured: req.body.featured === true || req.body.featured === "true"
      };
      
      console.log("Données validées pour création:", articleData);
      
      const article = await storage.createArticle(articleData);
      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      
      // Retourner un message d'erreur plus détaillé
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      
      // Détecter les erreurs de contrainte d'unicité
      if (errorMessage.includes("unique constraint") && errorMessage.includes("slug")) {
        return res.status(400).json({ 
          message: "Slug déjà utilisé", 
          details: "Un article avec ce slug existe déjà. Veuillez en choisir un autre." 
        });
      }
      
      res.status(500).json({ 
        message: "Erreur lors de la création de l'article",
        details: errorMessage
      });
    }
  });
  
  app.put("/api/admin/articles/:id", isAdmin, async (req: Request, res: Response) => {
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
      
      // S'assurer que le slug est valide et assez long
      if (!req.body.slug || req.body.slug.length < 3) {
        return res.status(400).json({ 
          message: "Slug invalide", 
          details: "Le slug doit contenir au moins 3 caractères" 
        });
      }
      
      // Obtenir l'article actuel pour vérifier si le slug a changé
      const currentArticle = await storage.getArticleById(Number(id));
      if (!currentArticle) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      
      // Si le slug a changé, vérifier qu'il n'est pas déjà utilisé par un autre article
      if (currentArticle.slug !== req.body.slug) {
        const existingArticle = await storage.getArticleBySlug(req.body.slug);
        if (existingArticle && existingArticle.id !== Number(id)) {
          return res.status(400).json({ 
            message: "Slug déjà utilisé", 
            details: "Un autre article utilise déjà ce slug. Veuillez en choisir un autre." 
          });
        }
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
      
      // Conversion explicite de categoryId en nombre et gestion correcte du statut publié/brouillon
      const updateData = {
        ...validation.data,
        categoryId: Number(req.body.categoryId),
        published: req.body.published === true || req.body.published === "true",
        featured: req.body.featured === true || req.body.featured === "true"
      };
      
      console.log("Données validées pour mise à jour:", updateData);
      
      const updatedArticle = await storage.updateArticle(Number(id), updateData);
      
      if (!updatedArticle) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      
      res.json(updatedArticle);
    } catch (error) {
      console.error("Error updating article:", error);
      
      // Retourner un message d'erreur plus détaillé
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      
      // Détecter les erreurs de contrainte d'unicité
      if (errorMessage.includes("unique constraint") && errorMessage.includes("slug")) {
        return res.status(400).json({ 
          message: "Slug déjà utilisé", 
          details: "Un article avec ce slug existe déjà. Veuillez en choisir un autre." 
        });
      }
      
      res.status(500).json({ 
        message: "Erreur lors de la mise à jour de l'article",
        details: errorMessage
      });
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
  app.get("/api/admin/categories", isAdmin, async (req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des catégories" });
    }
  });
  
  app.get("/api/admin/categories/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de catégorie invalide" });
      }
      
      // Étant donné que nous n'avons pas de méthode getCategoryById, nous allons récupérer toutes les catégories
      // et filtrer celle qui correspond à l'ID demandé
      const categories = await storage.getAllCategories();
      const category = categories.find(c => c.id === Number(id));
      
      if (!category) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Erreur lors de la récupération de la catégorie" });
    }
  });
  
  app.post("/api/admin/categories", isAdmin, async (req: Request, res: Response) => {
    try {
      // Validation du schéma de catégorie
      const validation = insertCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      // Vérifier si le slug existe déjà
      const categories = await storage.getAllCategories();
      const slugExists = categories.some(c => c.slug === validation.data.slug);
      
      if (slugExists) {
        return res.status(400).json({ 
          message: "Slug déjà utilisé", 
          details: "Une catégorie avec ce slug existe déjà. Veuillez en choisir un autre." 
        });
      }
      
      const category = await storage.createCategory(validation.data);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Erreur lors de la création de la catégorie" });
    }
  });
  
  app.put("/api/admin/categories/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de catégorie invalide" });
      }
      
      // Validation du schéma de catégorie
      const validation = insertCategorySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const categoryId = Number(id);
      
      // Vérifier si la catégorie existe
      const categories = await storage.getAllCategories();
      const categoryExists = categories.some(c => c.id === categoryId);
      
      if (!categoryExists) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      // Vérifier si le slug est déjà utilisé par une autre catégorie
      const slugConflict = categories.some(c => c.slug === validation.data.slug && c.id !== categoryId);
      
      if (slugConflict) {
        return res.status(400).json({ 
          message: "Slug déjà utilisé", 
          details: "Une autre catégorie utilise déjà ce slug. Veuillez en choisir un autre." 
        });
      }
      
      // Mise à jour de la catégorie avec Drizzle directement
      const [updatedCategory] = await db
        .update(schema.categories)
        .set(validation.data)
        .where(eq(schema.categories.id, categoryId))
        .returning();
      
      res.json(updatedCategory);
    } catch (error) {
      console.error("Error updating category:", error);
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      
      res.status(500).json({ 
        message: "Erreur lors de la mise à jour de la catégorie",
        details: errorMessage
      });
    }
  });
  
  app.delete("/api/admin/categories/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de catégorie invalide" });
      }
      
      const categoryId = Number(id);
      
      // Vérifier si la catégorie existe
      const allCategories = await storage.getAllCategories();
      const categoryExists = allCategories.some(c => c.id === categoryId);
      
      if (!categoryExists) {
        return res.status(404).json({ message: "Catégorie non trouvée" });
      }
      
      // Vérifier si des articles sont liés à cette catégorie
      const articlesWithCategory = await db
        .select()
        .from(schema.articles)
        .where(eq(schema.articles.categoryId, categoryId));
      
      if (articlesWithCategory.length > 0) {
        return res.status(400).json({ 
          message: "Impossible de supprimer cette catégorie", 
          details: `${articlesWithCategory.length} article(s) utilisent cette catégorie. Veuillez d'abord modifier ou supprimer ces articles.`
        });
      }
      
      // Supprimer la catégorie
      await db
        .delete(schema.categories)
        .where(eq(schema.categories.id, categoryId));
      
      res.json({ message: "Catégorie supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de la catégorie" });
    }
  });
  
  // Routes d'administration des Flash Infos
  app.get("/api/admin/flash-infos", isAdmin, async (req: Request, res: Response) => {
    try {
      console.log("Récupération de tous les flash infos pour l'admin");
      // Récupérer tous les flash infos, pas seulement les actifs, en utilisant l'interface de stockage
      const allFlashInfos = await storage.getAllFlashInfos();
      res.json(allFlashInfos || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des flash infos:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des flash infos" });
    }
  });
  
  app.post("/api/admin/flash-infos", isAdmin, async (req: Request, res: Response) => {
    try {
      console.log("Données reçues pour création de flash info:", req.body);
      
      // Validation du schéma de flash info
      const validation = insertFlashInfoSchema.safeParse(req.body);
      if (!validation.success) {
        console.error("Erreur de validation pour création:", validation.error.errors);
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      // Flash info validé, création
      console.log("Données validées pour création:", validation.data);
      const newFlashInfo = await storage.createFlashInfo(validation.data);
      res.status(201).json(newFlashInfo);
      
    } catch (error) {
      console.error("Erreur lors de la création du flash info:", error);
      res.status(500).json({ message: "Erreur lors de la création du flash info" });
    }
  });
  
  app.get("/api/admin/flash-infos/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de flash info invalide" });
      }
      
      const flashInfo = await storage.getFlashInfoById(Number(id));
      
      if (!flashInfo) {
        return res.status(404).json({ message: "Flash info non trouvé" });
      }
      
      res.json(flashInfo);
    } catch (error) {
      console.error("Erreur lors de la récupération du flash info:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du flash info" });
    }
  });
  
  app.delete("/api/admin/flash-infos/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de flash info invalide" });
      }
      
      // Suppression du flash info via DELETE
      // Nous devrions ajouter une méthode deleteFlashInfo à l'interface IStorage, mais pour l'instant,
      // nous utilisons directement l'accès à la base de données
      const result = await db
        .delete(flashInfos)
        .where(eq(flashInfos.id, Number(id)))
        .returning();
        
      if (!result.length) {
        return res.status(404).json({ message: "Flash info non trouvé" });
      }
      
      res.json({ message: "Flash info supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du flash info:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du flash info" });
    }
  });
  
  app.put("/api/admin/flash-infos/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de flash info invalide" });
      }
      
      // Validation du schéma de flash info
      const validation = insertFlashInfoSchema.partial().safeParse(req.body);
      if (!validation.success) {
        console.error("Erreur de validation pour mise à jour:", validation.error.errors);
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      // Mise à jour du flash info
      // Nous devrions ajouter une méthode updateFlashInfo à l'interface IStorage, mais pour l'instant,
      // nous utilisons directement l'accès à la base de données
      const [updatedFlashInfo] = await db
        .update(flashInfos)
        .set(validation.data)
        .where(eq(flashInfos.id, Number(id)))
        .returning();
        
      if (!updatedFlashInfo) {
        return res.status(404).json({ message: "Flash info non trouvé" });
      }
      
      res.json(updatedFlashInfo);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du flash info:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du flash info" });
    }
  });
  
  // Routes pour les vidéos (administration)
  app.get("/api/admin/videos", isAdmin, async (req: Request, res: Response) => {
    try {
      const videos = await storage.getAllVideos();
      res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des vidéos" });
    }
  });
  
  app.get("/api/admin/videos/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de vidéo invalide" });
      }
      
      const video = await storage.getVideoById(Number(id));
      
      if (!video) {
        return res.status(404).json({ message: "Vidéo non trouvée" });
      }
      
      res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de la vidéo" });
    }
  });
  
  app.post("/api/admin/videos", isAdmin, async (req: Request, res: Response) => {
    try {
      // Valider les données avec le schéma Zod
      const videoData = insertVideoSchema.parse(req.body);
      
      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      
      // Retourner un message d'erreur détaillé
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      
      res.status(400).json({ 
        message: "Erreur lors de la création de la vidéo",
        details: errorMessage
      });
    }
  });
  
  app.put("/api/admin/videos/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de vidéo invalide" });
      }
      
      // Validation du schéma de vidéo
      const validation = insertVideoSchema.partial().safeParse(req.body);
      if (!validation.success) {
        console.error("Erreur de validation pour mise à jour:", validation.error.errors);
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const videoId = Number(id);
      const existingVideo = await storage.getVideoById(videoId);
      
      if (!existingVideo) {
        return res.status(404).json({ message: "Vidéo non trouvée" });
      }
      
      // Mettre à jour la vidéo
      const [updatedVideo] = await db
        .update(videos)
        .set(validation.data)
        .where(eq(videos.id, videoId))
        .returning();
      
      res.json(updatedVideo);
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour de la vidéo" });
    }
  });
  
  app.delete("/api/admin/videos/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de vidéo invalide" });
      }
      
      const videoId = Number(id);
      const result = await db
        .delete(videos)
        .where(eq(videos.id, videoId))
        .returning();
      
      if (!result.length) {
        return res.status(404).json({ message: "Vidéo non trouvée" });
      }
      
      res.json({ message: "Vidéo supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting video:", error);
      res.status(500).json({ error: "Erreur lors de la suppression de la vidéo" });
    }
  });

  // Routes d'administration des utilisateurs
  app.get("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const result = await listUsers();
      if (result.success) {
        return res.json(result.users);
      } else {
        return res.status(500).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs" });
    }
  });

  app.post("/api/admin/users", isAdmin, async (req: Request, res: Response) => {
    try {
      const userData = req.body;
      if (!userData.username || !userData.password || !userData.displayName || !userData.role) {
        return res.status(400).json({ 
          message: "Données incomplètes",
          details: "Tous les champs (username, password, displayName, role) sont requis"
        });
      }

      // Vérifier que le rôle est valide
      if (!["admin", "editor", "user"].includes(userData.role)) {
        return res.status(400).json({ 
          message: "Rôle invalide",
          details: "Le rôle doit être 'admin', 'editor' ou 'user'"
        });
      }

      const result = await createUser(userData);
      if (result.success) {
        return res.status(201).json(result.user);
      } else {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Erreur lors de la création de l'utilisateur" });
    }
  });

  app.delete("/api/admin/users/:username", isAdmin, async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      
      // Vérifier qu'on ne supprime pas le dernier utilisateur admin
      const usersResult = await listUsers();
      if (usersResult.success && usersResult.users) {
        const adminUsers = usersResult.users.filter(user => user.role === "admin");
        const targetUser = usersResult.users.find(user => user.username === username);
        
        if (adminUsers.length === 1 && targetUser && targetUser.role === "admin") {
          return res.status(400).json({ 
            message: "Impossible de supprimer le dernier administrateur",
            details: "Il doit y avoir au moins un utilisateur avec le rôle 'admin'"
          });
        }
      }
      
      const result = await deleteUser(username);
      if (result.success) {
        return res.json({ message: result.message });
      } else {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
    }
  });

  app.put("/api/admin/users/:username/password", isAdmin, async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const { password } = req.body;
      
      if (!password || password.length < 8) {
        return res.status(400).json({ 
          message: "Mot de passe invalide", 
          details: "Le mot de passe doit contenir au moins 8 caractères" 
        });
      }
      
      const result = await updateUserPassword(username, password);
      if (result.success) {
        return res.json({ message: result.message });
      } else {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du mot de passe" });
    }
  });

  // Route pour mettre à jour le profil d'un utilisateur
  app.put("/api/admin/users/:username/profile", isAdmin, async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const profileData = req.body;
      
      // Validation de base
      if (profileData.role && !["admin", "editor", "user"].includes(profileData.role)) {
        return res.status(400).json({ 
          message: "Rôle invalide",
          details: "Le rôle doit être 'admin', 'editor' ou 'user'"
        });
      }
      
      // Mettre à jour le profil
      const result = await updateUserProfile(username, profileData);
      if (result.success) {
        return res.json(result.user);
      } else {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
    }
  });

  // Routes pour l'équipe
  // Récupérer tous les membres de l'équipe (public)
  app.get("/api/team", async (req: Request, res: Response) => {
    try {
      const result = await getTeamMembers();
      if (result.success) {
        return res.json(result.members);
      } else {
        return res.status(500).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des membres de l'équipe" });
    }
  });

  // Ajouter un utilisateur à l'équipe
  app.post("/api/admin/team/add/:username", isAdmin, async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const result = await updateUserProfile(username, { isTeamMember: true });
      
      if (result.success) {
        return res.json({ message: "Utilisateur ajouté à l'équipe avec succès", user: result.user });
      } else {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error adding user to team:", error);
      res.status(500).json({ message: "Erreur lors de l'ajout à l'équipe" });
    }
  });

  // Retirer un utilisateur de l'équipe
  app.post("/api/admin/team/remove/:username", isAdmin, async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const result = await updateUserProfile(username, { isTeamMember: false });
      
      if (result.success) {
        return res.json({ message: "Utilisateur retiré de l'équipe avec succès", user: result.user });
      } else {
        return res.status(400).json({ message: result.message });
      }
    } catch (error) {
      console.error("Error removing user from team:", error);
      res.status(500).json({ message: "Erreur lors du retrait de l'équipe" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
