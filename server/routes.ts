import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import passport from "passport";
import { isAuthenticated, isAdmin, isAdminOnly, loginSchema, hashPassword } from "./auth";
import * as schema from "@shared/schema";
import { 
  insertArticleSchema, insertCategorySchema, insertFlashInfoSchema, flashInfos, 
  insertVideoSchema, videos, insertLiveCoverageSchema, insertLiveCoverageEditorSchema, 
  insertLiveCoverageUpdateSchema, insertNewsletterSubscriberSchema, insertTeamApplicationSchema,
  insertContactMessageSchema, insertEducationalTopicSchema, insertEducationalContentSchema,
  insertEducationalQuizSchema, insertElectionSchema, electionReactions, insertElectionReactionSchema,
  insertSiteAlertSchema, siteAlerts
} from "@shared/schema";
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
    } = {
      // Par défaut, ne montrer que les articles publiés 
      // (sauf si explicitement écrasé ci-dessous)
      showUnpublished: false 
    };
    
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
    
    console.log("Récupération des articles avec filtres:", filters);
    const articles = await storage.getAllArticles(filters);
    
    // Double vérification de ne retourner que les articles publiés sauf pour les admins
    // avec showAll=true
    const filteredArticles = showAll === 'true' && req.isAuthenticated() && (req.user as any)?.role === 'admin'
      ? articles
      : articles.filter(article => article.published === true);
      
    res.json(filteredArticles);
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
    // Double vérification pour ne renvoyer que les articles publiés
    const filteredArticles = articles.filter(article => article.published === true);
    res.json(filteredArticles);
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
  
  // Crée une nouvelle élection (requiert authentification admin)
  app.post("/api/elections", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const electionData = insertElectionSchema.parse(req.body);
      const election = await storage.createElection(electionData);
      res.status(201).json(election);
    } catch (error) {
      console.error("Erreur lors de la création de l'élection:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur lors de la création de l'élection" });
    }
  });
  
  // Met à jour une élection existante (requiert authentification admin)
  app.put("/api/elections/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: "ID d'élection invalide" });
    }
    
    try {
      const updatedElection = await storage.updateElection(Number(id), req.body);
      
      if (!updatedElection) {
        return res.status(404).json({ message: "Élection non trouvée" });
      }
      
      res.json(updatedElection);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'élection:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur lors de la mise à jour de l'élection" });
    }
  });
  
  // Supprime une élection (requiert authentification admin)
  app.delete("/api/elections/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: "ID d'élection invalide" });
    }
    
    try {
      const success = await storage.deleteElection(Number(id));
      
      if (!success) {
        return res.status(404).json({ message: "Élection non trouvée" });
      }
      
      res.status(200).json({ message: "Élection supprimée avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'élection:", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'élection" });
    }
  });
  
  // Educational Topics
  app.get("/api/educational-topics", async (_req: Request, res: Response) => {
    try {
      const topics = await storage.getAllEducationalTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching educational topics:", error);
      res.status(500).json({ error: "Error fetching educational topics" });
    }
  });
  
  app.get("/api/educational-topics/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const topic = await storage.getEducationalTopicBySlug(slug);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json(topic);
    } catch (error) {
      console.error("Error fetching educational topic:", error);
      res.status(500).json({ error: "Error fetching educational topic" });
    }
  });

  // Educational Content
  app.get("/api/educational-content", async (req: Request, res: Response) => {
    try {
      const { topicId } = req.query;
      
      let topicIdNum: number | undefined = undefined;
      if (topicId && !isNaN(Number(topicId))) {
        topicIdNum = Number(topicId);
      }
      
      const content = await storage.getAllEducationalContent(topicIdNum);
      res.json(content);
    } catch (error) {
      console.error("Error fetching educational content:", error);
      res.status(500).json({ error: "Error fetching educational content" });
    }
  });
  
  app.get("/api/educational-content/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if the id is a number or a slug
      if (!isNaN(Number(id))) {
        // If it's a number, get content by id
        const content = await storage.getEducationalContentById(Number(id));
        
        if (!content) {
          return res.status(404).json({ message: "Content not found" });
        }
        
        await storage.incrementEducationalContentViews(content.id);
        res.json(content);
      } else {
        // If it's not a number, assume it's a slug
        const content = await storage.getEducationalContentBySlug(id);
        
        if (!content) {
          return res.status(404).json({ message: "Content not found" });
        }
        
        await storage.incrementEducationalContentViews(content.id);
        res.json(content);
      }
    } catch (error) {
      console.error("Error fetching educational content:", error);
      res.status(500).json({ error: "Error fetching educational content" });
    }
  });
  
  // Admin routes for educational content
  app.post("/api/educational-topics", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const topicData = insertEducationalTopicSchema.parse(req.body);
      const newTopic = await storage.createEducationalTopic(topicData);
      res.status(201).json(newTopic);
    } catch (error) {
      console.error("Error creating educational topic:", error);
      res.status(400).json({ error: "Invalid topic data" });
    }
  });
  
  app.post("/api/educational-content", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const contentData = insertEducationalContentSchema.parse(req.body);
      const newContent = await storage.createEducationalContent(contentData);
      res.status(201).json(newContent);
    } catch (error) {
      console.error("Error creating educational content:", error);
      res.status(400).json({ error: "Invalid content data" });
    }
  });
  
  app.put("/api/educational-topics/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const updateData = req.body;
      const updated = await storage.updateEducationalTopic(Number(id), updateData);
      
      if (!updated) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating educational topic:", error);
      res.status(500).json({ error: "Error updating educational topic" });
    }
  });
  
  app.put("/api/educational-content/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const updateData = req.body;
      const updated = await storage.updateEducationalContent(Number(id), updateData);
      
      if (!updated) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating educational content:", error);
      res.status(500).json({ error: "Error updating educational content" });
    }
  });
  
  app.delete("/api/educational-topics/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid topic ID" });
      }
      
      const deleted = await storage.deleteEducationalTopic(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting educational topic:", error);
      res.status(500).json({ error: "Error deleting educational topic" });
    }
  });
  
  app.delete("/api/educational-content/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      const deleted = await storage.deleteEducationalContent(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting educational content:", error);
      res.status(500).json({ error: "Error deleting educational content" });
    }
  });
  
  // Quiz éducatifs
  app.get("/api/educational-content/:contentId/quiz", async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;
      
      if (isNaN(Number(contentId))) {
        return res.status(400).json({ message: "ID de contenu invalide" });
      }
      
      const quizzes = await storage.getQuizzesByContentId(Number(contentId));
      res.json(quizzes);
    } catch (error) {
      console.error("Erreur lors de la récupération des quiz:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des quiz" });
    }
  });

  app.post("/api/educational-content/:contentId/quiz", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { contentId } = req.params;
      const quizData = req.body;
      
      if (isNaN(Number(contentId))) {
        return res.status(400).json({ message: "ID de contenu invalide" });
      }
      
      // Vérifier si le contenu existe
      const content = await storage.getEducationalContentById(Number(contentId));
      if (!content) {
        return res.status(404).json({ message: "Contenu éducatif non trouvé" });
      }
      
      // S'assurer que l'option correcte est valide (1, 2 ou 3)
      if (![1, 2, 3].includes(quizData.correctOption)) {
        return res.status(400).json({ message: "L'option correcte doit être 1, 2 ou 3" });
      }
      
      const quiz = await storage.createQuiz({
        ...quizData,
        contentId: Number(contentId)
      });
      
      res.status(201).json(quiz);
    } catch (error) {
      console.error("Erreur lors de la création du quiz:", error);
      res.status(500).json({ error: "Erreur lors de la création du quiz" });
    }
  });

  app.put("/api/educational-content/:contentId/quiz/:quizId", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { contentId, quizId } = req.params;
      const quizData = req.body;
      
      if (isNaN(Number(contentId)) || isNaN(Number(quizId))) {
        return res.status(400).json({ message: "ID invalide" });
      }
      
      // Vérifier si le quiz existe
      const quiz = await storage.getQuizById(Number(quizId));
      if (!quiz) {
        return res.status(404).json({ message: "Quiz non trouvé" });
      }
      
      // Vérifier si le contenu existe
      const content = await storage.getEducationalContentById(Number(contentId));
      if (!content) {
        return res.status(404).json({ message: "Contenu éducatif non trouvé" });
      }
      
      // S'assurer que l'option correcte est valide (1, 2 ou 3)
      if (quizData.correctOption && ![1, 2, 3].includes(quizData.correctOption)) {
        return res.status(400).json({ message: "L'option correcte doit être 1, 2 ou 3" });
      }
      
      const updatedQuiz = await storage.updateQuiz(Number(quizId), quizData);
      
      if (!updatedQuiz) {
        return res.status(404).json({ message: "Quiz non trouvé" });
      }
      
      res.json(updatedQuiz);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du quiz:", error);
      res.status(500).json({ error: "Erreur lors de la mise à jour du quiz" });
    }
  });

  app.delete("/api/educational-content/:contentId/quiz/:quizId", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { contentId, quizId } = req.params;
      
      if (isNaN(Number(contentId)) || isNaN(Number(quizId))) {
        return res.status(400).json({ message: "ID invalide" });
      }
      
      // Vérifier si le quiz existe
      const quiz = await storage.getQuizById(Number(quizId));
      if (!quiz) {
        return res.status(404).json({ message: "Quiz non trouvé" });
      }
      
      // Vérifier si le contenu existe
      const content = await storage.getEducationalContentById(Number(contentId));
      if (!content) {
        return res.status(404).json({ message: "Contenu éducatif non trouvé" });
      }
      
      const deleted = await storage.deleteQuiz(Number(quizId));
      
      if (!deleted) {
        return res.status(404).json({ message: "Quiz non trouvé" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur lors de la suppression du quiz:", error);
      res.status(500).json({ error: "Erreur lors de la suppression du quiz" });
    }
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
        // Renvoyer un objet vide plutôt qu'une erreur 404
        // Cela permet au frontend de savoir qu'il n'y a pas de direct actif
        // sans avoir à gérer une erreur
        return res.json({ id: 0, title: "", description: "", active: false });
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
  
  // Route pour récupérer les articles d'un utilisateur connecté
  app.get("/api/auth/my-articles", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      console.log("Récupération des articles pour l'utilisateur:", user);
      
      if (!user || !user.id) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }
      
      // Récupérer tous les articles de l'utilisateur (publiés ou non)
      const articles = await storage.getArticlesByAuthor(user.id, true);
      console.log("Articles trouvés:", articles.length, articles);
      res.json(articles);
    } catch (error) {
      console.error("Erreur lors de la récupération des articles de l'utilisateur:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des articles" });
    }
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
      // Utiliser l'ID de l'utilisateur connecté comme ID de l'auteur
      const user = req.user as any;
      const articleData = {
        ...validation.data,
        authorId: user.id, // Définir l'auteur comme l'utilisateur connecté
        published: req.body.published === true || req.body.published === "true",
        featured: req.body.featured === true || req.body.featured === "true"
      };
      
      console.log("Données validées pour création:", articleData, "par l'utilisateur:", user.displayName);
      
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
      console.log("Requête API /team reçue");
      const result = await getTeamMembers();
      
      if (result.success) {
        console.log("Membres de l'équipe récupérés avec succès, envoi au client");
        
        // Vérification des champs sociaux avant envoi
        const members = result.members;
        
        // Ajouter des header pour éviter le cache
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        
        return res.json(members);
      } else {
        console.error("Erreur dans le résultat:", result.message);
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
      
      // Ajouter l'utilisateur à l'équipe
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
      
      // Retirer l'utilisateur de l'équipe
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

  // Suivis en direct (Live Coverage) routes
  
  // Routes publiques pour les suivis en direct
  app.get("/api/live-coverages", async (req: Request, res: Response) => {
    try {
      const liveCoverages = await storage.getActiveLiveCoverages();
      res.json(liveCoverages);
    } catch (error) {
      console.error("Error fetching live coverages:", error);
      res.status(500).json({ error: "Error fetching live coverages" });
    }
  });
  
  app.get("/api/live-coverages/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      
      const coverage = await storage.getLiveCoverageBySlug(slug);
      
      if (!coverage) {
        return res.status(404).json({ message: "Suivi en direct non trouvé" });
      }
      
      res.json(coverage);
    } catch (error) {
      console.error("Error fetching live coverage:", error);
      res.status(500).json({ error: "Error fetching live coverage" });
    }
  });
  
  app.get("/api/live-coverages/:coverageId/updates", async (req: Request, res: Response) => {
    try {
      const { coverageId } = req.params;
      
      if (isNaN(Number(coverageId))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      const updates = await storage.getLiveCoverageUpdates(Number(coverageId));
      
      // Pour chaque mise à jour qui est une réponse à une question, récupérer la question correspondante
      const updatesWithQuestions = await Promise.all(updates.map(async (update) => {
        if (update.isAnswer && update.questionId) {
          try {
            const questions = await storage.getLiveCoverageQuestions(Number(coverageId));
            const question = questions.find(q => q.id === update.questionId);
            
            if (question) {
              return {
                ...update,
                questionContent: question.content,
                questionUsername: question.username
              };
            }
          } catch (err) {
            console.error("Error fetching question for update:", err);
          }
        }
        return update;
      }));
      
      res.json(updatesWithQuestions);
    } catch (error) {
      console.error("Error fetching live coverage updates:", error);
      res.status(500).json({ error: "Error fetching live coverage updates" });
    }
  });
  
  app.get("/api/live-coverages/:coverageId/editors", async (req: Request, res: Response) => {
    try {
      const { coverageId } = req.params;
      
      if (isNaN(Number(coverageId))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      const editors = await storage.getLiveCoverageEditors(Number(coverageId));
      res.json(editors);
    } catch (error) {
      console.error("Error fetching live coverage editors:", error);
      res.status(500).json({ error: "Error fetching live coverage editors" });
    }
  });
  
  // Routes admin pour les suivis en direct
  app.get("/api/admin/live-coverages", isAdmin, async (req: Request, res: Response) => {
    try {
      const liveCoverages = await storage.getAllLiveCoverages();
      res.json(liveCoverages);
    } catch (error) {
      console.error("Error fetching all live coverages:", error);
      res.status(500).json({ error: "Error fetching all live coverages" });
    }
  });
  
  app.get("/api/admin/live-coverages/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      const coverage = await storage.getLiveCoverageById(Number(id));
      
      if (!coverage) {
        return res.status(404).json({ message: "Suivi en direct non trouvé" });
      }
      
      res.json(coverage);
    } catch (error) {
      console.error("Error fetching live coverage by ID:", error);
      res.status(500).json({ error: "Error fetching live coverage" });
    }
  });
  
  app.post("/api/admin/live-coverages", isAdmin, async (req: Request, res: Response) => {
    try {
      // Validation du schéma
      const validation = insertLiveCoverageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const liveCoverage = await storage.createLiveCoverage(validation.data);
      res.status(201).json(liveCoverage);
    } catch (error) {
      console.error("Error creating live coverage:", error);
      res.status(500).json({ error: "Error creating live coverage" });
    }
  });
  
  app.put("/api/admin/live-coverages/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      const validation = insertLiveCoverageSchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const updatedCoverage = await storage.updateLiveCoverage(Number(id), validation.data);
      
      if (!updatedCoverage) {
        return res.status(404).json({ message: "Suivi en direct non trouvé" });
      }
      
      res.json(updatedCoverage);
    } catch (error) {
      console.error("Error updating live coverage:", error);
      res.status(500).json({ error: "Error updating live coverage" });
    }
  });
  
  app.delete("/api/admin/live-coverages/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      const result = await storage.deleteLiveCoverage(Number(id));
      
      if (!result) {
        return res.status(404).json({ message: "Suivi en direct non trouvé" });
      }
      
      res.json({ message: "Suivi en direct supprimé avec succès" });
    } catch (error) {
      console.error("Error deleting live coverage:", error);
      res.status(500).json({ error: "Error deleting live coverage" });
    }
  });
  
  // Gestion des éditeurs pour les suivis en direct
  app.post("/api/admin/live-coverages/:coverageId/editors", isAdmin, async (req: Request, res: Response) => {
    try {
      const { coverageId } = req.params;
      
      if (isNaN(Number(coverageId))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      const validation = insertLiveCoverageEditorSchema.safeParse({
        ...req.body,
        coverageId: Number(coverageId)
      });
      
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const editor = await storage.addEditorToLiveCoverage(validation.data);
      res.status(201).json(editor);
    } catch (error) {
      console.error("Error adding editor to live coverage:", error);
      res.status(500).json({ error: "Error adding editor to live coverage" });
    }
  });
  
  app.delete("/api/admin/live-coverages/:coverageId/editors/:editorId", isAdmin, async (req: Request, res: Response) => {
    try {
      const { coverageId, editorId } = req.params;
      
      if (isNaN(Number(coverageId)) || isNaN(Number(editorId))) {
        return res.status(400).json({ message: "IDs invalides" });
      }
      
      const result = await storage.removeEditorFromLiveCoverage(Number(coverageId), Number(editorId));
      
      if (!result) {
        return res.status(404).json({ message: "Éditeur non trouvé pour ce suivi" });
      }
      
      res.json({ message: "Éditeur retiré avec succès" });
    } catch (error) {
      console.error("Error removing editor from live coverage:", error);
      res.status(500).json({ error: "Error removing editor from live coverage" });
    }
  });
  
  // Gestion des mises à jour pour les suivis en direct
  app.post("/api/admin/live-coverages/:coverageId/updates", isAdmin, async (req: Request, res: Response) => {
    try {
      const { coverageId } = req.params;
      const user = req.user as any;
      
      if (isNaN(Number(coverageId))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      const validation = insertLiveCoverageUpdateSchema.safeParse({
        ...req.body,
        coverageId: Number(coverageId),
        authorId: user.id
      });
      
      if (!validation.success) {
        return res.status(400).json({ errors: validation.error.errors });
      }
      
      const update = await storage.createLiveCoverageUpdate(validation.data);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating live coverage update:", error);
      res.status(500).json({ error: "Error creating live coverage update" });
    }
  });
  
  app.delete("/api/admin/live-coverages/updates/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de mise à jour invalide" });
      }
      
      const result = await storage.deleteLiveCoverageUpdate(Number(id));
      
      if (!result) {
        return res.status(404).json({ message: "Mise à jour non trouvée" });
      }
      
      res.json({ message: "Mise à jour supprimée avec succès" });
    } catch (error) {
      console.error("Error deleting live coverage update:", error);
      res.status(500).json({ error: "Error deleting live coverage update" });
    }
  });
  
  // ===== API pour les questions des utilisateurs =====
  // Récupérer les questions pour un suivi en direct (filtré par status pour les admins)
  app.get("/api/admin/live-coverages/:coverageId/questions", isAdmin, async (req: Request, res: Response) => {
    try {
      const { coverageId } = req.params;
      const { status } = req.query;
      
      if (isNaN(Number(coverageId))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      const questions = await storage.getLiveCoverageQuestions(
        Number(coverageId), 
        status ? String(status) : undefined
      );
      res.json(questions);
    } catch (error) {
      console.error("Error fetching live coverage questions:", error);
      res.status(500).json({ error: "Error fetching live coverage questions" });
    }
  });

  // Soumettre une question pour un suivi en direct (accès public)
  app.post("/api/live-coverages/:coverageId/questions", async (req: Request, res: Response) => {
    try {
      const { coverageId } = req.params;
      const { username, content } = req.body;
      
      console.log("Réception d'une question:", { coverageId, username, content });
      
      if (isNaN(Number(coverageId))) {
        return res.status(400).json({ message: "ID de suivi invalide" });
      }
      
      if (!username || !content) {
        return res.status(400).json({ message: "Le nom d'utilisateur et le contenu sont requis" });
      }
      
      // Vérifier que le suivi en direct existe et est actif
      const coverage = await storage.getLiveCoverageById(Number(coverageId));
      if (!coverage || !coverage.active) {
        return res.status(404).json({ message: "Suivi en direct non trouvé ou inactif" });
      }
      
      const newQuestion = await storage.createLiveCoverageQuestion({
        coverageId: Number(coverageId),
        username,
        content,
        status: "pending", // Toutes les questions sont en attente de modération par défaut
      });
      
      // Forcer explicitement le type de contenu pour être sûr
      res.setHeader('Content-Type', 'application/json');
      
      return res.status(201).json({ 
        success: true,
        message: "Question soumise avec succès et en attente de modération",
        questionId: newQuestion.id
      });
    } catch (error) {
      console.error("Erreur lors de la soumission d'une question:", error);
      
      // Forcer explicitement le type de contenu pour être sûr
      res.setHeader('Content-Type', 'application/json');
      
      return res.status(500).json({ 
        success: false,
        message: "Erreur lors de la soumission de la question" 
      });
    }
  });

  // Modifier le statut d'une question (admin uniquement)
  app.put("/api/admin/live-coverages/questions/:questionId/status", isAdmin, async (req: Request, res: Response) => {
    try {
      const { questionId } = req.params;
      const { status } = req.body;
      
      if (isNaN(Number(questionId))) {
        return res.status(400).json({ message: "ID de question invalide" });
      }
      
      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
      }
      
      const updatedQuestion = await storage.updateLiveCoverageQuestionStatus(Number(questionId), status);
      
      if (!updatedQuestion) {
        return res.status(404).json({ message: "Question non trouvée" });
      }
      
      res.json(updatedQuestion);
    } catch (error) {
      console.error("Error updating question status:", error);
      res.status(500).json({ error: "Error updating question status" });
    }
  });

  // Répondre à une question (admins et éditeurs du direct uniquement)
  app.post("/api/admin/live-coverages/questions/:questionId/answer", async (req: Request, res: Response) => {
    // Cette route nécessite une authentification, mais on vérifie si l'utilisateur est
    // soit admin soit un éditeur du suivi en direct concerné
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Non authentifié" });
      }
      
      const user = req.user as any;
      
      const { questionId } = req.params;
      const { content, important, coverageId } = req.body;
      
      if (isNaN(Number(questionId)) || isNaN(Number(coverageId))) {
        return res.status(400).json({ message: "IDs invalides" });
      }
      
      if (!content) {
        return res.status(400).json({ message: "Le contenu est requis" });
      }
      
      // Vérifier que l'utilisateur est soit admin soit un éditeur du suivi en direct
      const isUserAdmin = user.role === 'admin';
      let isEditor = false;
      
      if (!isUserAdmin) {
        const editors = await storage.getLiveCoverageEditors(Number(coverageId));
        isEditor = editors.some((e: any) => e.editorId === user.id);
        
        if (!isEditor) {
          return res.status(403).json({ message: "Vous n'êtes pas autorisé à répondre aux questions pour ce suivi" });
        }
      }
      
      // Créer la réponse et mettre à jour le statut de la question
      const answer = await storage.createAnswerToQuestion(
        Number(questionId),
        Number(coverageId),
        content,
        user.id,
        important || false
      );
      
      res.status(201).json({ 
        message: "Réponse publiée avec succès", 
        answer 
      });
    } catch (error) {
      console.error("Error answering question:", error);
      res.status(500).json({ error: "Error answering question" });
    }
  });

  // Routes pour la newsletter
  app.post("/api/newsletter/subscribe", async (req: Request, res: Response) => {
    try {
      // Vérifier si l'email est fourni
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false,
          message: "Adresse e-mail requise" 
        });
      }
      
      // Valider le format de l'email
      const emailSchema = z.string().email();
      const result = emailSchema.safeParse(email);
      
      if (!result.success) {
        return res.status(400).json({ 
          success: false,
          message: "Adresse e-mail invalide" 
        });
      }
      
      // Créer ou récupérer l'abonné
      const subscriber = await storage.createNewsletterSubscriber(email);
      
      res.status(201).json({ 
        success: true,
        message: "Inscription à la newsletter réussie", 
        subscriber 
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription à la newsletter:", error);
      res.status(500).json({ 
        success: false,
        message: "Erreur lors de l'inscription à la newsletter" 
      });
    }
  });
  
  // Route admin pour récupérer tous les abonnés à la newsletter
  app.get("/api/admin/newsletter/subscribers", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const subscribers = await storage.getNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnés à la newsletter:", error);
      res.status(500).json({ 
        message: "Erreur lors de la récupération des abonnés à la newsletter" 
      });
    }
  });
  
  // Route admin pour supprimer un abonné à la newsletter
  app.delete("/api/admin/newsletter/subscribers/:id", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'abonné invalide" });
      }
      
      const result = await storage.deleteNewsletterSubscriber(Number(id));
      
      if (!result) {
        return res.status(404).json({ message: "Abonné non trouvé" });
      }
      
      res.json({ message: "Abonné supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression d'un abonné:", error);
      res.status(500).json({ message: "Erreur lors de la suppression d'un abonné" });
    }
  });
  
  // Routes pour les candidatures d'équipe
  // Route publique pour soumettre une candidature
  app.post("/api/team/applications", async (req: Request, res: Response) => {
    try {
      // Validation des données
      const validatedData = insertTeamApplicationSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({
          success: false,
          message: "Données de candidature invalides",
          errors: validatedData.error.errors
        });
      }
      
      // Créer la candidature
      const application = await storage.createTeamApplication(validatedData.data);
      
      res.status(201).json({
        success: true,
        message: "Candidature envoyée avec succès",
        application
      });
    } catch (error) {
      console.error("Erreur lors de la soumission de candidature:", error);
      res.status(500).json({
        success: false,
        message: "Erreur lors de la soumission de votre candidature"
      });
    }
  });
  
  // Routes admin pour gérer les candidatures
  app.get("/api/admin/team/applications", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const applications = await storage.getAllTeamApplications();
      
      // Enrichir les candidatures avec les noms des réviseurs
      const enrichedApplications = await Promise.all(applications.map(async (app) => {
        if (app.reviewedBy) {
          const reviewer = await storage.getUser(app.reviewedBy);
          return {
            ...app,
            reviewerName: reviewer ? reviewer.displayName : undefined
          };
        }
        return app;
      }));
      
      res.json(enrichedApplications);
    } catch (error) {
      console.error("Erreur lors de la récupération des candidatures:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération des candidatures"
      });
    }
  });
  
  app.get("/api/admin/team/applications/:id", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de candidature invalide" });
      }
      
      const application = await storage.getTeamApplicationById(Number(id));
      
      if (!application) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }
      
      // Enrichir avec le nom du réviseur si la candidature a été révisée
      let enrichedApplication = application;
      if (application.reviewedBy) {
        const reviewer = await storage.getUser(application.reviewedBy);
        enrichedApplication = {
          ...application,
          reviewerName: reviewer ? reviewer.displayName : undefined
        };
      }
      
      res.json(enrichedApplication);
    } catch (error) {
      console.error("Erreur lors de la récupération de la candidature:", error);
      res.status(500).json({
        message: "Erreur lors de la récupération de la candidature"
      });
    }
  });
  
  app.patch("/api/admin/team/applications/:id/status", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de candidature invalide" });
      }
      
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Statut de candidature invalide" });
      }
      
      const user = req.user as any;
      const updatedApplication = await storage.updateTeamApplicationStatus(
        Number(id),
        status,
        user.id,
        notes
      );
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }
      
      res.json({
        message: "Statut de candidature mis à jour avec succès",
        application: updatedApplication
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de candidature:", error);
      res.status(500).json({
        message: "Erreur lors de la mise à jour du statut de candidature"
      });
    }
  });
  
  app.delete("/api/admin/team/applications/:id", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de candidature invalide" });
      }
      
      const result = await storage.deleteTeamApplication(Number(id));
      
      if (!result) {
        return res.status(404).json({ message: "Candidature non trouvée" });
      }
      
      res.json({ message: "Candidature supprimée avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de la candidature:", error);
      res.status(500).json({
        message: "Erreur lors de la suppression de la candidature"
      });
    }
  });

  // Routes pour les messages de contact
  // Route publique pour soumettre un message de contact
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      // Validation des données
      const validatedData = insertContactMessageSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({
          message: "Données du message invalides",
          errors: validatedData.error.errors
        });
      }
      
      // Créer le message
      const message = await storage.createContactMessage(validatedData.data);
      
      res.status(201).json({
        message: "Message envoyé avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message de contact:", error);
      res.status(500).json({
        message: "Une erreur est survenue lors de l'envoi de votre message"
      });
    }
  });
  
  // Route admin pour récupérer tous les messages de contact
  app.get("/api/admin/contact-messages", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Erreur lors de la récupération des messages de contact:", error);
      res.status(500).json({
        message: "Une erreur est survenue lors de la récupération des messages de contact"
      });
    }
  });
  
  // Route admin pour récupérer un message spécifique
  app.get("/api/admin/contact-messages/:id", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de message invalide" });
      }
      
      const message = await storage.getContactMessageById(Number(id));
      if (!message) {
        return res.status(404).json({ message: "Message non trouvé" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Erreur lors de la récupération du message de contact:", error);
      res.status(500).json({
        message: "Une erreur est survenue lors de la récupération du message"
      });
    }
  });
  
  // Route admin pour marquer un message comme lu
  app.patch("/api/admin/contact-messages/:id/read", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de message invalide" });
      }
      
      const message = await storage.markContactMessageAsRead(Number(id));
      if (!message) {
        return res.status(404).json({ message: "Message non trouvé" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Erreur lors du marquage du message comme lu:", error);
      res.status(500).json({
        message: "Une erreur est survenue lors du marquage du message comme lu"
      });
    }
  });
  
  // Route admin pour assigner un message à un administrateur
  app.patch("/api/admin/contact-messages/:id/assign", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { adminId } = req.body;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de message invalide" });
      }
      
      if (!adminId || isNaN(Number(adminId))) {
        return res.status(400).json({ message: "ID d'administrateur invalide" });
      }
      
      const message = await storage.assignMessageToAdmin(Number(id), Number(adminId));
      if (!message) {
        return res.status(404).json({ message: "Message non trouvé" });
      }
      
      res.json(message);
    } catch (error) {
      console.error("Erreur lors de l'assignation du message:", error);
      res.status(500).json({
        message: "Une erreur est survenue lors de l'assignation du message"
      });
    }
  });
  
  // Route admin pour supprimer un message
  app.delete("/api/admin/contact-messages/:id", isAdminOnly, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID de message invalide" });
      }
      
      const result = await storage.deleteContactMessage(Number(id));
      if (!result) {
        return res.status(404).json({ message: "Message non trouvé" });
      }
      
      res.json({ message: "Message supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du message:", error);
      res.status(500).json({
        message: "Une erreur est survenue lors de la suppression du message"
      });
    }
  });

  // Routes pour le glossaire politique
  app.get("/api/glossary", async (_req: Request, res: Response) => {
    try {
      const terms = await db.select().from(schema.politicalGlossary).orderBy(schema.politicalGlossary.term);
      res.json(terms);
    } catch (error) {
      console.error("Erreur lors de la récupération du glossaire:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du glossaire" });
    }
  });
  
  app.get("/api/glossary/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [term] = await db.select().from(schema.politicalGlossary).where(eq(schema.politicalGlossary.id, parseInt(id)));
      
      if (!term) {
        return res.status(404).json({ message: "Terme non trouvé" });
      }
      
      res.json(term);
    } catch (error) {
      console.error("Erreur lors de la récupération du terme:", error);
      res.status(500).json({ message: "Erreur lors de la récupération du terme" });
    }
  });
  
  app.post("/api/admin/glossary", isAdmin, async (req: Request, res: Response) => {
    try {
      const termData = schema.insertPoliticalGlossarySchema.parse(req.body);
      
      // Vérifier si le terme existe déjà
      const existingTerm = await db.select()
        .from(schema.politicalGlossary)
        .where(eq(schema.politicalGlossary.term, termData.term));
        
      if (existingTerm.length > 0) {
        return res.status(400).json({ message: "Ce terme existe déjà dans le glossaire" });
      }
      
      const [newTerm] = await db.insert(schema.politicalGlossary)
        .values(termData)
        .returning();
        
      res.status(201).json(newTerm);
    } catch (error) {
      console.error("Erreur lors de l'ajout du terme:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Erreur lors de l'ajout du terme" });
    }
  });
  
  app.put("/api/admin/glossary/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const termData = schema.insertPoliticalGlossarySchema.parse(req.body);
      
      // Vérifier que le terme existe
      const existingTerm = await db.select()
        .from(schema.politicalGlossary)
        .where(eq(schema.politicalGlossary.id, parseInt(id)));
        
      if (existingTerm.length === 0) {
        return res.status(404).json({ message: "Terme non trouvé" });
      }
      
      // Vérifier si le nouveau terme n'est pas déjà utilisé par un autre enregistrement
      if (termData.term !== existingTerm[0].term) {
        const termCheck = await db.select()
          .from(schema.politicalGlossary)
          .where(eq(schema.politicalGlossary.term, termData.term));
          
        if (termCheck.length > 0) {
          return res.status(400).json({ message: "Ce terme existe déjà dans le glossaire" });
        }
      }
      
      const [updatedTerm] = await db.update(schema.politicalGlossary)
        .set({
          ...termData,
          updatedAt: new Date()
        })
        .where(eq(schema.politicalGlossary.id, parseInt(id)))
        .returning();
        
      res.json(updatedTerm);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du terme:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Données invalides", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Erreur lors de la mise à jour du terme" });
    }
  });
  
  app.delete("/api/admin/glossary/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Vérifier que le terme existe
      const existingTerm = await db.select()
        .from(schema.politicalGlossary)
        .where(eq(schema.politicalGlossary.id, parseInt(id)));
        
      if (existingTerm.length === 0) {
        return res.status(404).json({ message: "Terme non trouvé" });
      }
      
      await db.delete(schema.politicalGlossary)
        .where(eq(schema.politicalGlossary.id, parseInt(id)));
        
      res.status(200).json({ message: "Terme supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du terme:", error);
      res.status(500).json({ message: "Erreur lors de la suppression du terme" });
    }
  });

  // API pour les réactions aux élections
  app.get("/api/elections/:electionId/reactions", async (req: Request, res: Response) => {
    try {
      const { electionId } = req.params;
      
      if (isNaN(Number(electionId))) {
        return res.status(400).json({ message: "ID d'élection invalide" });
      }
      
      const reactions = await db.select().from(electionReactions)
        .where(eq(electionReactions.electionId, Number(electionId)))
        .orderBy(electionReactions.createdAt, 'desc');
      
      res.json(reactions);
    } catch (error) {
      console.error("Erreur lors de la récupération des réactions:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des réactions" });
    }
  });
  
  app.post("/api/elections/:electionId/reactions", async (req: Request, res: Response) => {
    try {
      const { electionId } = req.params;
      
      if (isNaN(Number(electionId))) {
        return res.status(400).json({ message: "ID d'élection invalide" });
      }
      
      const reactionData = insertElectionReactionSchema.parse({
        ...req.body,
        electionId: Number(electionId)
      });
      
      const [reaction] = await db.insert(electionReactions)
        .values(reactionData)
        .returning();
      
      res.status(201).json(reaction);
    } catch (error) {
      console.error("Erreur lors de la création d'une réaction:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ error: "Erreur lors de la création d'une réaction" });
    }
  });
  
  // Route pour supprimer une réaction
  app.delete("/api/elections/reactions/:reactionId", isAdmin, async (req: Request, res: Response) => {
    try {
      const { reactionId } = req.params;
      
      if (isNaN(Number(reactionId))) {
        return res.status(400).json({ message: "ID de réaction invalide" });
      }
      
      // Vérifier si la réaction existe
      const existingReactions = await db.select()
        .from(electionReactions)
        .where(eq(electionReactions.id, Number(reactionId)));
      
      if (existingReactions.length === 0) {
        return res.status(404).json({ message: "Réaction non trouvée" });
      }
      
      // Supprimer la réaction
      await db.delete(electionReactions)
        .where(eq(electionReactions.id, Number(reactionId)));
      
      res.status(200).json({ message: "Réaction supprimée avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de la réaction:", error);
      res.status(500).json({ error: "Erreur lors de la suppression de la réaction" });
    }
  });

  // Alertes de site
  app.get("/api/site-alerts/active", async (_req: Request, res: Response) => {
    try {
      const alerts = await storage.getActiveAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes actives:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des alertes actives" });
    }
  });
  
  app.get("/api/site-alerts", isAuthenticated, isAdmin, async (_req: Request, res: Response) => {
    try {
      const alerts = await storage.getAllAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("Erreur lors de la récupération des alertes:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des alertes" });
    }
  });
  
  app.get("/api/site-alerts/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'alerte invalide" });
      }
      
      const alert = await storage.getAlertById(Number(id));
      
      if (!alert) {
        return res.status(404).json({ message: "Alerte non trouvée" });
      }
      
      res.json(alert);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'alerte:", error);
      res.status(500).json({ error: "Erreur lors de la récupération de l'alerte" });
    }
  });
  
  app.post("/api/site-alerts", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const alertData = insertSiteAlertSchema.parse(req.body);
      
      // Ajouter l'ID de l'utilisateur créateur si disponible
      if (req.user && (req.user as any).id) {
        alertData.createdBy = (req.user as any).id;
      }
      
      const newAlert = await storage.createAlert(alertData);
      res.status(201).json(newAlert);
    } catch (error) {
      console.error("Erreur lors de la création de l'alerte:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ error: "Erreur lors de la création de l'alerte" });
    }
  });
  
  app.put("/api/site-alerts/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'alerte invalide" });
      }
      
      const alertData = req.body;
      const updatedAlert = await storage.updateAlert(Number(id), alertData);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alerte non trouvée" });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'alerte:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ error: "Erreur lors de la mise à jour de l'alerte" });
    }
  });
  
  app.patch("/api/site-alerts/:id/toggle", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { active } = req.body;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'alerte invalide" });
      }
      
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: "Le paramètre 'active' doit être un booléen" });
      }
      
      const updatedAlert = await storage.toggleAlertStatus(Number(id), active);
      
      if (!updatedAlert) {
        return res.status(404).json({ message: "Alerte non trouvée" });
      }
      
      res.json(updatedAlert);
    } catch (error) {
      console.error("Erreur lors de la modification du statut de l'alerte:", error);
      res.status(500).json({ error: "Erreur lors de la modification du statut de l'alerte" });
    }
  });
  
  app.delete("/api/site-alerts/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      if (isNaN(Number(id))) {
        return res.status(400).json({ message: "ID d'alerte invalide" });
      }
      
      const success = await storage.deleteAlert(Number(id));
      
      if (!success) {
        return res.status(404).json({ message: "Alerte non trouvée" });
      }
      
      res.status(200).json({ message: "Alerte supprimée avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'alerte:", error);
      res.status(500).json({ error: "Erreur lors de la suppression de l'alerte" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
