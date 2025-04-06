import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

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
    const { categoryId, search, sort } = req.query;
    
    const filters: {
      categoryId?: number;
      search?: string;
      sort?: string;
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

  const httpServer = createServer(app);
  return httpServer;
}
