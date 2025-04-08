import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  articles, type Article, type InsertArticle,
  newsUpdates, type NewsUpdate, type InsertNewsUpdate,
  flashInfos, type FlashInfo, type InsertFlashInfo,
  liveEvents, type LiveEvent, type InsertLiveEvent,
  elections, type Election, type InsertElection,
  educationalContent, type EducationalContent, type InsertEducationalContent,
  videos, type Video, type InsertVideo
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, isNull, not, gte, lte } from "drizzle-orm";
import { hashPassword } from "./auth";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getAllCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Article operations
  getAllArticles(filters?: {categoryId?: number, search?: string, sort?: string, year?: number, showUnpublished?: boolean, authorId?: number}): Promise<Article[]>;
  getFeaturedArticles(limit?: number): Promise<Article[]>;
  getRecentArticles(limit?: number): Promise<Article[]>;
  getArticlesByCategory(categoryId: number, limit?: number): Promise<Article[]>;
  getArticlesByAuthor(authorId: number, showUnpublished?: boolean): Promise<Article[]>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  getArticleById(id: number): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: number, articleData: Partial<InsertArticle>): Promise<Article | undefined>;
  deleteArticle(id: number): Promise<boolean>;
  updateArticleViews(id: number): Promise<void>;
  
  // News Updates operations
  getActiveNewsUpdates(): Promise<NewsUpdate[]>;
  createNewsUpdate(newsUpdate: InsertNewsUpdate): Promise<NewsUpdate>;
  
  // Flash Info operations
  getActiveFlashInfos(): Promise<FlashInfo[]>;
  getAllFlashInfos(): Promise<FlashInfo[]>; // Ajout de cette méthode pour récupérer tous les Flash Infos
  getFlashInfoById(id: number): Promise<FlashInfo | undefined>;
  createFlashInfo(flashInfo: InsertFlashInfo): Promise<FlashInfo>;
  
  // Live Events operations
  getActiveLiveEvent(): Promise<LiveEvent | undefined>;
  getLiveEventById(id: number): Promise<LiveEvent | undefined>;
  createLiveEvent(liveEvent: InsertLiveEvent): Promise<LiveEvent>;
  
  // Election operations
  getAllElections(): Promise<Election[]>;
  getUpcomingElections(limit?: number): Promise<Election[]>;
  getRecentElections(limit?: number): Promise<Election[]>;
  getElectionById(id: number): Promise<Election | undefined>;
  createElection(election: InsertElection): Promise<Election>;
  
  // Educational Content operations
  getAllEducationalContent(categoryId?: number): Promise<EducationalContent[]>;
  getEducationalContentById(id: number): Promise<EducationalContent | undefined>;
  createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent>;
  
  // Videos operations
  getAllVideos(limit?: number): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoViews(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash the password before storing it
    const hashedPassword = await hashPassword(insertUser.password);
    
    const [user] = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
      role: insertUser.role || "user",
      avatarUrl: insertUser.avatarUrl || null
    }).returning();
    return user;
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values({
      ...insertCategory,
      color: insertCategory.color || "#FF4D4D"
    }).returning();
    return category;
  }
  
  // Article operations
  async getAllArticles(filters?: {categoryId?: number, search?: string, sort?: string, year?: number, showUnpublished?: boolean}): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    // Récupération des articles avec jointure sur l'auteur
    const result = await db
      .select({
        article: articles,
        authorDisplayName: users.displayName,
        authorTitle: users.title,
        authorAvatarUrl: users.avatarUrl
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where((qb) => {
        // Par défaut, ne montrer que les articles publiés
        // Le paramètre doit être explicitement true pour montrer les non-publiés
        if (filters?.showUnpublished !== true) {
          return eq(articles.published, true);
        }
        return undefined;
      })
      .where((qb) => {
        // Filter by category
        if (filters?.categoryId) {
          return eq(articles.categoryId, filters.categoryId);
        }
        return undefined;
      })
      .where((qb) => {
        // Filter by search term
        if (filters?.search) {
          const searchTerm = `%${filters.search}%`;
          return or(
            like(articles.title, searchTerm),
            like(articles.excerpt, searchTerm),
            like(articles.content, searchTerm)
          );
        }
        return undefined;
      })
      .where((qb) => {
        // Filter by year
        if (filters?.year) {
          const startOfYear = new Date(filters.year, 0, 1);
          const endOfYear = new Date(filters.year, 11, 31, 23, 59, 59);
          
          return and(
            gte(articles.createdAt, startOfYear),
            lte(articles.createdAt, endOfYear)
          );
        }
        return undefined;
      })
      .orderBy(desc(articles.createdAt));
    
    // Transformation des résultats pour correspondre au format attendu
    const articlesWithAuthors = result.map(row => {
      const article = { ...row.article };
      
      if (row.authorDisplayName) {
        article.author = {
          displayName: row.authorDisplayName,
          title: row.authorTitle,
          avatarUrl: row.authorAvatarUrl
        };
      }
      
      return article;
    });
    
    // Apply custom sort (if needed)
    if (filters?.sort && filters.sort !== 'recent') {
      switch (filters.sort) {
        case 'popular':
          articlesWithAuthors.sort((a, b) => b.viewCount - a.viewCount);
          break;
        case 'commented':
          articlesWithAuthors.sort((a, b) => b.commentCount - a.commentCount);
          break;
      }
    }
    
    return articlesWithAuthors;
  }
  
  async getFeaturedArticles(limit: number = 3): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    // Récupération des articles avec jointure sur l'auteur
    const result = await db
      .select({
        article: articles,
        authorDisplayName: users.displayName,
        authorTitle: users.title,
        authorAvatarUrl: users.avatarUrl
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.featured, true))
      .orderBy(desc(articles.createdAt))
      .limit(limit);
    
    // Transformation des résultats pour correspondre au format attendu
    return result.map(row => {
      const article = { ...row.article };
      
      if (row.authorDisplayName) {
        article.author = {
          displayName: row.authorDisplayName,
          title: row.authorTitle,
          avatarUrl: row.authorAvatarUrl
        };
      }
      
      return article;
    });
  }
  
  async getRecentArticles(limit: number = 9): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    // Récupération des articles avec jointure sur l'auteur
    const result = await db
      .select({
        article: articles,
        authorDisplayName: users.displayName,
        authorTitle: users.title,
        authorAvatarUrl: users.avatarUrl
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(limit);
    
    // Transformation des résultats pour correspondre au format attendu
    return result.map(row => {
      const article = { ...row.article };
      
      if (row.authorDisplayName) {
        article.author = {
          displayName: row.authorDisplayName,
          title: row.authorTitle,
          avatarUrl: row.authorAvatarUrl
        };
      }
      
      return article;
    });
  }
  
  async getArticlesByCategory(categoryId: number, limit: number = 6): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    // Récupération des articles avec jointure sur l'auteur
    const result = await db
      .select({
        article: articles,
        authorDisplayName: users.displayName,
        authorTitle: users.title,
        authorAvatarUrl: users.avatarUrl
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          eq(articles.published, true),
          eq(articles.categoryId, categoryId)
        )
      )
      .orderBy(desc(articles.createdAt))
      .limit(limit);
    
    // Transformation des résultats pour correspondre au format attendu
    return result.map(row => {
      const article = { ...row.article };
      
      if (row.authorDisplayName) {
        article.author = {
          displayName: row.authorDisplayName,
          title: row.authorTitle,
          avatarUrl: row.authorAvatarUrl
        };
      }
      
      return article;
    });
  }
  
  async getArticlesByAuthor(authorId: number, showUnpublished: boolean = false): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    // Récupération des articles avec jointure sur l'auteur
    const result = await db
      .select({
        article: articles,
        authorDisplayName: users.displayName,
        authorTitle: users.title,
        authorAvatarUrl: users.avatarUrl
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          showUnpublished ? undefined : eq(articles.published, true),
          eq(articles.authorId, authorId)
        )
      )
      .orderBy(desc(articles.createdAt));
    
    // Transformation des résultats pour correspondre au format attendu
    return result.map(row => {
      const article = { ...row.article };
      
      if (row.authorDisplayName) {
        article.author = {
          displayName: row.authorDisplayName,
          title: row.authorTitle,
          avatarUrl: row.authorAvatarUrl
        };
      }
      
      return article;
    });
  }
  
  async getArticleBySlug(slug: string): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } }) | undefined> {
    // Récupération de l'article avec jointure sur l'auteur
    const result = await db
      .select({
        article: articles,
        authorDisplayName: users.displayName,
        authorTitle: users.title,
        authorAvatarUrl: users.avatarUrl
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(
        and(
          eq(articles.slug, slug),
          eq(articles.published, true)
        )
      );
    
    if (result.length === 0) {
      return undefined;
    }
    
    // Formatage du résultat pour inclure les informations de l'auteur
    const article = result[0].article;
    
    return {
      ...article,
      author: {
        displayName: result[0].authorDisplayName,
        title: result[0].authorTitle,
        avatarUrl: result[0].authorAvatarUrl
      }
    };
  }
  
  async getArticleById(id: number): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } }) | undefined> {
    // Récupération de l'article avec jointure sur l'auteur
    const result = await db
      .select({
        article: articles,
        authorDisplayName: users.displayName,
        authorTitle: users.title,
        authorAvatarUrl: users.avatarUrl
      })
      .from(articles)
      .leftJoin(users, eq(articles.authorId, users.id))
      .where(eq(articles.id, id));
    
    if (result.length === 0) {
      return undefined;
    }
    
    // Formatage du résultat pour inclure les informations de l'auteur
    const article = result[0].article;
    
    return {
      ...article,
      author: {
        displayName: result[0].authorDisplayName,
        title: result[0].authorTitle,
        avatarUrl: result[0].authorAvatarUrl
      }
    };
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values({
        ...insertArticle,
        imageUrl: insertArticle.imageUrl || null,
        authorId: insertArticle.authorId || null,
        categoryId: insertArticle.categoryId || null,
        published: insertArticle.published ?? true,
        featured: insertArticle.featured ?? false
      })
      .returning();
    return article;
  }
  
  async updateArticle(id: number, articleData: Partial<InsertArticle>): Promise<Article | undefined> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));
    
    if (!article) {
      return undefined;
    }
    
    const [updatedArticle] = await db
      .update(articles)
      .set(articleData)
      .where(eq(articles.id, id))
      .returning();
    
    return updatedArticle;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    const result = await db
      .delete(articles)
      .where(eq(articles.id, id))
      .returning({ id: articles.id });
    
    return result.length > 0;
  }
  
  async updateArticleViews(id: number): Promise<void> {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));
    
    if (article) {
      await db
        .update(articles)
        .set({ viewCount: article.viewCount + 1 })
        .where(eq(articles.id, id));
    }
  }
  
  // News Updates operations
  async getActiveNewsUpdates(): Promise<NewsUpdate[]> {
    return db
      .select()
      .from(newsUpdates)
      .where(eq(newsUpdates.active, true))
      .orderBy(desc(newsUpdates.createdAt));
  }
  
  async createNewsUpdate(insertNewsUpdate: InsertNewsUpdate): Promise<NewsUpdate> {
    const [newsUpdate] = await db
      .insert(newsUpdates)
      .values({
        ...insertNewsUpdate,
        content: insertNewsUpdate.content || null,
        icon: insertNewsUpdate.icon || null,
        active: insertNewsUpdate.active ?? true
      })
      .returning();
    return newsUpdate;
  }
  
  // Flash Info operations
  async getActiveFlashInfos(): Promise<FlashInfo[]> {
    return db
      .select()
      .from(flashInfos)
      .where(eq(flashInfos.active, true))
      .orderBy(desc(flashInfos.priority), desc(flashInfos.createdAt));
  }
  
  async getAllFlashInfos(): Promise<FlashInfo[]> {
    return db
      .select()
      .from(flashInfos)
      .orderBy(desc(flashInfos.priority), desc(flashInfos.createdAt));
  }
  
  async getFlashInfoById(id: number): Promise<FlashInfo | undefined> {
    const [flashInfo] = await db
      .select()
      .from(flashInfos)
      .where(eq(flashInfos.id, id));
    return flashInfo;
  }
  
  async createFlashInfo(insertFlashInfo: InsertFlashInfo): Promise<FlashInfo> {
    const [flashInfo] = await db
      .insert(flashInfos)
      .values({
        ...insertFlashInfo,
        imageUrl: insertFlashInfo.imageUrl || null,
        active: insertFlashInfo.active ?? true,
        priority: insertFlashInfo.priority ?? 1,
        categoryId: insertFlashInfo.categoryId || null
      })
      .returning();
    return flashInfo;
  }
  
  // Live Events operations
  async getActiveLiveEvent(): Promise<LiveEvent | undefined> {
    const [liveEvent] = await db
      .select()
      .from(liveEvents)
      .where(eq(liveEvents.active, true))
      .orderBy(desc(liveEvents.scheduledFor));
    return liveEvent;
  }
  
  async getLiveEventById(id: number): Promise<LiveEvent | undefined> {
    const [liveEvent] = await db
      .select()
      .from(liveEvents)
      .where(eq(liveEvents.id, id));
    return liveEvent;
  }
  
  async createLiveEvent(insertLiveEvent: InsertLiveEvent): Promise<LiveEvent> {
    const [liveEvent] = await db
      .insert(liveEvents)
      .values({
        ...insertLiveEvent,
        imageUrl: insertLiveEvent.imageUrl || null,
        liveUrl: insertLiveEvent.liveUrl || null,
        active: insertLiveEvent.active ?? false,
        scheduledFor: insertLiveEvent.scheduledFor || null,
        categoryId: insertLiveEvent.categoryId || null
      })
      .returning();
    return liveEvent;
  }
  
  // Election operations
  async getAllElections(): Promise<Election[]> {
    return db
      .select()
      .from(elections)
      .orderBy(desc(elections.date));
  }
  
  async getUpcomingElections(limit: number = 4): Promise<Election[]> {
    const now = new Date();
    return db
      .select()
      .from(elections)
      .where(
        and(
          eq(elections.upcoming, true)
        )
      )
      .orderBy(elections.date)
      .limit(limit);
  }
  
  async getRecentElections(limit: number = 2): Promise<Election[]> {
    const now = new Date();
    return db
      .select()
      .from(elections)
      .where(
        and(
          eq(elections.upcoming, false)
        )
      )
      .orderBy(desc(elections.date))
      .limit(limit);
  }
  
  async getElectionById(id: number): Promise<Election | undefined> {
    const [election] = await db
      .select()
      .from(elections)
      .where(eq(elections.id, id));
    return election;
  }
  
  async createElection(insertElection: InsertElection): Promise<Election> {
    const [election] = await db
      .insert(elections)
      .values({
        ...insertElection,
        description: insertElection.description || null,
        upcoming: insertElection.upcoming ?? false
      })
      .returning();
    return election;
  }
  
  // Educational Content operations
  async getAllEducationalContent(categoryId?: number): Promise<EducationalContent[]> {
    let query = db.select().from(educationalContent);
    
    if (categoryId) {
      query = query.where(eq(educationalContent.categoryId, categoryId));
    }
    
    return query.orderBy(desc(educationalContent.likes));
  }
  
  async getEducationalContentById(id: number): Promise<EducationalContent | undefined> {
    const [content] = await db
      .select()
      .from(educationalContent)
      .where(eq(educationalContent.id, id));
    return content;
  }
  
  async createEducationalContent(insertContent: InsertEducationalContent): Promise<EducationalContent> {
    const [content] = await db
      .insert(educationalContent)
      .values({
        ...insertContent,
        content: insertContent.content || null,
        categoryId: insertContent.categoryId || null
      })
      .returning();
    return content;
  }
  
  // Videos operations
  async getAllVideos(limit: number = 8): Promise<Video[]> {
    return db
      .select()
      .from(videos)
      .orderBy(desc(videos.publishedAt))
      .limit(limit);
  }
  
  async getVideoById(id: number): Promise<Video | undefined> {
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id));
    return video;
  }
  
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db
      .insert(videos)
      .values({
        ...insertVideo,
        views: insertVideo.views || 0
      })
      .returning();
    return video;
  }
  
  async updateVideoViews(id: number): Promise<void> {
    const [video] = await db
      .select()
      .from(videos)
      .where(eq(videos.id, id));
    
    if (video) {
      await db
        .update(videos)
        .set({ views: video.views + 1 })
        .where(eq(videos.id, id));
    }
  }
}

// Initialize sample database data
async function initializeDb() {
  // Check if we already have categories
  const existingCategories = await db.select().from(categories);
  
  if (existingCategories.length === 0) {
    // No data, we need to seed the database
    console.log("Initializing database with sample data...");
    
    // Add categories
    const categoriesList = [
      {
        name: "Politique France",
        slug: "politique-france",
        color: "#0D47A1"
      },
      {
        name: "International",
        slug: "international",
        color: "#E53935"
      },
      {
        name: "Économie",
        slug: "economie",
        color: "#2E7D32"
      },
      {
        name: "Environnement",
        slug: "environnement",
        color: "#00796B"
      },
      {
        name: "Société",
        slug: "societe",
        color: "#6A1B9A"
      },
      {
        name: "Culture",
        slug: "culture",
        color: "#FFC107"
      }
    ];
    
    // Insert all categories
    await db.insert(categories).values(categoriesList);
    
    // Add admin user with hashed password
    const adminPassword = await hashPassword("admin123");
    await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      displayName: "Administrator",
      role: "admin",
      avatarUrl: null
    });
    
    // Add editors with hashed passwords
    const editorPassword1 = await hashPassword("editor123");
    const editorPassword2 = await hashPassword("editor456");
    
    await db.insert(users).values([
      {
        username: "editor1",
        password: editorPassword1,
        displayName: "Sarah Martin",
        role: "editor",
        avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      {
        username: "editor2",
        password: editorPassword2,
        displayName: "Thomas Legrand",
        role: "editor",
        avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
      }
    ]);
    
    // Add articles with proper filtering by published
    const articlesList = [
      {
        title: "Débat sur l'éducation politique des jeunes",
        slug: "debat-education-politique-jeunes",
        content: "Débat sur l'importance d'éduquer les jeunes citoyens aux enjeux politiques dès le collège.",
        excerpt: "Débat sur l'importance d'éduquer les jeunes citoyens aux enjeux politiques dès le collège.",
        imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 5,
        viewCount: 1200,
        commentCount: 18,
        published: true
      },
      {
        title: "Les jeunes entrepreneurs au service d'une économie durable",
        slug: "jeunes-entrepreneurs-economie-durable",
        content: "Portrait de startups innovantes fondées par la nouvelle génération d'entrepreneurs engagés.",
        excerpt: "Portrait de startups innovantes fondées par la nouvelle génération d'entrepreneurs engagés.",
        imageUrl: "https://images.unsplash.com/photo-1607944024060-0450380ddd33?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80",
        authorId: 1,
        categoryId: 3,
        viewCount: 945,
        commentCount: 7,
        published: true
      },
      {
        title: "Comprendre les tensions internationales en 20 minutes",
        slug: "comprendre-tensions-internationales",
        content: "Thomas Legrand nous explique les enjeux géopolitiques actuels de façon simple et accessible.",
        excerpt: "Thomas Legrand nous explique les enjeux géopolitiques actuels de façon simple et accessible.",
        imageUrl: "",
        authorId: 1,
        categoryId: 2,
        viewCount: 763,
        commentCount: 12,
        published: true
      },
      {
        title: "Les réformes éducatives du nouveau gouvernement : ce qui va changer",
        slug: "reformes-educatives-nouveau-gouvernement",
        content: "Analyse détaillée des nouvelles mesures pour l'éducation nationale et leurs impacts pour les étudiants et professeurs.",
        excerpt: "Analyse détaillée des nouvelles mesures pour l'éducation nationale et leurs impacts pour les étudiants et professeurs.",
        imageUrl: "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        authorId: 1,
        categoryId: 1,
        published: true
      },
      {
        title: "Abstention des jeunes : comment inverser la tendance ?",
        slug: "abstention-jeunes-inverser-tendance",
        content: "Les chiffres de l'abstention chez les 18-25 ans sont alarmants. Décryptage des solutions proposées pour remobiliser la jeunesse.",
        excerpt: "Les chiffres de l'abstention chez les 18-25 ans sont alarmants. Décryptage des solutions proposées pour remobiliser la jeunesse.",
        imageUrl: "https://images.unsplash.com/photo-1600693606196-86c2a0c9293c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 5,
        published: true
      },
      {
        title: "Rapport du GIEC : ce que les politiques doivent faire maintenant",
        slug: "rapport-giec-mesures-politiques",
        content: "Les scientifiques sont formels : il reste peu de temps pour agir. Quelles sont les mesures urgentes que nos dirigeants devraient prendre ?",
        excerpt: "Les scientifiques sont formels : il reste peu de temps pour agir. Quelles sont les mesures urgentes que nos dirigeants devraient prendre ?",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 4,
        published: true
      },
      {
        title: "Les défis de la transition énergétique en Europe",
        slug: "defis-transition-energetique-europe",
        content: "Analyse des différentes stratégies adoptées par les pays européens pour atteindre la neutralité carbone.",
        excerpt: "Analyse des différentes stratégies adoptées par les pays européens pour atteindre la neutralité carbone.",
        imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 2,
        categoryId: 2,
        published: true
      },
      {
        title: "La crise des réfugiés : nouveaux développements",
        slug: "crise-refugies-nouveaux-developpements",
        content: "Point sur la situation des réfugiés en Europe et les politiques d'accueil des différents pays membres.",
        excerpt: "Point sur la situation des réfugiés en Europe et les politiques d'accueil des différents pays membres.",
        imageUrl: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 3,
        categoryId: 2,
        published: true
      },
      {
        title: "Nouvelles tensions diplomatiques au Moyen-Orient",
        slug: "tensions-diplomatiques-moyen-orient",
        content: "Analyse des récentes tensions entre grandes puissances et leur impact sur la stabilité régionale.",
        excerpt: "Analyse des récentes tensions entre grandes puissances et leur impact sur la stabilité régionale.",
        imageUrl: "https://images.unsplash.com/photo-1589262804704-c5aa9e6def89?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        authorId: 2,
        categoryId: 4,
        published: true
      },
      {
        title: "La réforme fiscale : gagnants et perdants",
        slug: "reforme-fiscale-gagnants-perdants",
        content: "Décryptage des nouvelles mesures fiscales et leurs impacts sur les différentes catégories de contribuables.",
        excerpt: "Décryptage des nouvelles mesures fiscales et leurs impacts sur les différentes catégories de contribuables.",
        imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 1,
        categoryId: 3,
        published: true
      },
      {
        title: "L'avenir des médias traditionnels face au numérique",
        slug: "avenir-medias-traditionnels-numerique",
        content: "Comment les journaux et chaînes de télévision s'adaptent-ils face à la montée en puissance des plateformes numériques ?",
        excerpt: "Comment les journaux et chaînes de télévision s'adaptent-ils face à la montée en puissance des plateformes numériques ?",
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        authorId: 3,
        categoryId: 5,
        published: true
      }
    ];
    
    // Insert all articles
    await db.insert(articles).values(articlesList);
    
    // Add some sample videos (YouTube shorts)
    const videosList = [
      {
        title: "Pourquoi les jeunes ne votent plus ?",
        videoId: "Emm3XznHJkM",
        views: 24500,
        publishedAt: new Date("2023-05-15")
      },
      {
        title: "Comment fonctionne l'Assemblée Nationale en 2 minutes",
        videoId: "nYAVMU5YYzw",
        views: 18300,
        publishedAt: new Date("2023-06-22")
      },
      {
        title: "L'Union Européenne expliquée simplement",
        videoId: "O37yJBFRrfg",
        views: 32100,
        publishedAt: new Date("2023-04-10")
      },
      {
        title: "La Constitution française en bref",
        videoId: "9MleNgLdQGE",
        views: 12700,
        publishedAt: new Date("2023-07-05")
      },
      {
        title: "Comment se prépare une élection présidentielle",
        videoId: "PwoQJP4e8Rk",
        views: 28900,
        publishedAt: new Date("2023-03-18")
      },
      {
        title: "Les institutions européennes expliquées",
        videoId: "_ZXeKXvUcx8",
        views: 19600,
        publishedAt: new Date("2023-06-03")
      }
    ];
    
    await db.insert(videos).values(videosList);
  }
}

// Fonction pour initialiser seulement les vidéos
async function initializeVideosOnly() {
  // Vérifier si les vidéos existent déjà
  const existingVideos = await db.select().from(videos);
  
  if (existingVideos.length === 0) {
    console.log("Initializing videos table with sample data...");
    
    // Ajouter des exemples de vidéos
    const videosList = [
      {
        title: "Pourquoi les jeunes ne votent plus ?",
        videoId: "Emm3XznHJkM",
        views: 24500,
        publishedAt: new Date("2023-05-15")
      },
      {
        title: "Comment fonctionne l'Assemblée Nationale en 2 minutes",
        videoId: "nYAVMU5YYzw",
        views: 18300,
        publishedAt: new Date("2023-06-22")
      },
      {
        title: "L'Union Européenne expliquée simplement",
        videoId: "O37yJBFRrfg",
        views: 32100,
        publishedAt: new Date("2023-04-10")
      },
      {
        title: "La Constitution française en bref",
        videoId: "9MleNgLdQGE",
        views: 12700,
        publishedAt: new Date("2023-07-05")
      },
      {
        title: "Comment se prépare une élection présidentielle",
        videoId: "PwoQJP4e8Rk",
        views: 28900,
        publishedAt: new Date("2023-03-18")
      },
      {
        title: "Les institutions européennes expliquées",
        videoId: "_ZXeKXvUcx8",
        views: 19600,
        publishedAt: new Date("2023-06-03")
      }
    ];
    
    await db.insert(videos).values(videosList);
    console.log("Videos table initialization complete");
  } else {
    console.log("Videos table already contains data, skipping initialization");
  }
}

// Initialize database with sample data
initializeDb()
  .then(() => console.log("Database initialization complete or not needed"))
  .catch(err => console.error("Error initializing database:", err));

// Initialiser spécifiquement les vidéos
initializeVideosOnly()
  .then(() => console.log("Videos initialization complete or not needed"))
  .catch(err => console.error("Error initializing videos:", err));

// Export the storage instance
export const storage = new DatabaseStorage();