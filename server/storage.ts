import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  articles, type Article, type InsertArticle,
  newsUpdates, type NewsUpdate, type InsertNewsUpdate,
  flashInfos, type FlashInfo, type InsertFlashInfo,
  liveEvents, type LiveEvent, type InsertLiveEvent,
  elections, type Election, type InsertElection,
  educationalTopics, type EducationalTopic, type InsertEducationalTopic,
  educationalContent, type EducationalContent, type InsertEducationalContent,
  videos, type Video, type InsertVideo,
  liveCoverages, type LiveCoverage, type InsertLiveCoverage,
  liveCoverageEditors, type LiveCoverageEditor, type InsertLiveCoverageEditor,
  liveCoverageUpdates, type LiveCoverageUpdate, type InsertLiveCoverageUpdate,
  liveCoverageQuestions, type LiveCoverageQuestion, type InsertLiveCoverageQuestion,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  teamApplications, type TeamApplication, type InsertTeamApplication,
  contactMessages, type ContactMessage, type InsertContactMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, isNull, not, gte, lte, sql, lt } from "drizzle-orm";
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
  
  // Newsletter operations
  getNewsletterSubscribers(): Promise<NewsletterSubscriber[]>;
  createNewsletterSubscriber(email: string): Promise<NewsletterSubscriber>;
  deleteNewsletterSubscriber(id: number): Promise<boolean>;
  
  // Team Applications operations
  getAllTeamApplications(): Promise<TeamApplication[]>;
  getTeamApplicationById(id: number): Promise<TeamApplication | undefined>;
  createTeamApplication(application: InsertTeamApplication): Promise<TeamApplication>;
  updateTeamApplicationStatus(id: number, status: string, reviewedBy?: number, notes?: string): Promise<TeamApplication | undefined>;
  deleteTeamApplication(id: number): Promise<boolean>;
  
  // Contact Messages operations
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessageById(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markContactMessageAsRead(id: number): Promise<ContactMessage | undefined>;
  assignMessageToAdmin(id: number, adminId: number): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
  
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
  getAllFlashInfos(): Promise<FlashInfo[]>; 
  getFlashInfoById(id: number): Promise<FlashInfo | undefined>;
  createFlashInfo(flashInfo: InsertFlashInfo): Promise<FlashInfo>;
  
  // Live Events operations
  getActiveLiveEvent(): Promise<LiveEvent | undefined>;
  getLiveEventById(id: number): Promise<LiveEvent | undefined>;
  createLiveEvent(liveEvent: InsertLiveEvent): Promise<LiveEvent>;
  
  // Live Coverage operations (Suivis en direct)
  getAllLiveCoverages(): Promise<LiveCoverage[]>;
  getActiveLiveCoverages(): Promise<LiveCoverage[]>;
  getLiveCoverageBySlug(slug: string): Promise<LiveCoverage | undefined>;
  getLiveCoverageById(id: number): Promise<LiveCoverage | undefined>;
  createLiveCoverage(coverage: InsertLiveCoverage): Promise<LiveCoverage>;
  updateLiveCoverage(id: number, data: Partial<InsertLiveCoverage>): Promise<LiveCoverage | undefined>;
  deleteLiveCoverage(id: number): Promise<boolean>;
  
  // Live Coverage Editors operations
  getLiveCoverageEditors(coverageId: number): Promise<(LiveCoverageEditor & { 
    editor?: { displayName: string, title: string | null, avatarUrl: string | null } 
  })[]>;
  addEditorToLiveCoverage(editor: InsertLiveCoverageEditor): Promise<LiveCoverageEditor>;
  removeEditorFromLiveCoverage(coverageId: number, editorId: number): Promise<boolean>;
  
  // Live Coverage Updates operations
  getLiveCoverageUpdates(coverageId: number): Promise<(LiveCoverageUpdate & {
    author?: { displayName: string, title: string | null, avatarUrl: string | null }
  })[]>;
  createLiveCoverageUpdate(update: InsertLiveCoverageUpdate): Promise<LiveCoverageUpdate>;
  deleteLiveCoverageUpdate(id: number): Promise<boolean>;
  
  // Live Coverage Questions operations
  getLiveCoverageQuestions(coverageId: number, status?: string): Promise<LiveCoverageQuestion[]>;
  createLiveCoverageQuestion(question: InsertLiveCoverageQuestion): Promise<LiveCoverageQuestion>;
  updateLiveCoverageQuestionStatus(id: number, status: string, answered?: boolean): Promise<LiveCoverageQuestion | undefined>;
  createAnswerToQuestion(questionId: number, coverageId: number, content: string, authorId: number, important?: boolean): Promise<LiveCoverageUpdate>;
  
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
  // Newsletter Subscribers operations
  async getNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return db.select().from(newsletterSubscribers).orderBy(desc(newsletterSubscribers.subscriptionDate));
  }
  
  async createNewsletterSubscriber(email: string): Promise<NewsletterSubscriber> {
    try {
      const [subscriber] = await db
        .insert(newsletterSubscribers)
        .values({ email, active: true })
        .returning();
      return subscriber;
    } catch (error) {
      // Gérer le cas où l'email existe déjà (contrainte unique)
      if (error.code === '23505') { // Code PostgreSQL pour violation de contrainte unique
        // Récupérer l'abonné existant
        const [existingSubscriber] = await db
          .select()
          .from(newsletterSubscribers)
          .where(eq(newsletterSubscribers.email, email));
        return existingSubscriber;
      }
      throw error;
    }
  }
  
  async deleteNewsletterSubscriber(id: number): Promise<boolean> {
    const result = await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
    return result.rowCount > 0;
  }
  
  // Team Applications operations
  async getAllTeamApplications(): Promise<TeamApplication[]> {
    return db.select().from(teamApplications).orderBy(desc(teamApplications.submissionDate));
  }
  
  async getTeamApplicationById(id: number): Promise<TeamApplication | undefined> {
    const [application] = await db.select().from(teamApplications).where(eq(teamApplications.id, id));
    return application;
  }
  
  async createTeamApplication(application: InsertTeamApplication): Promise<TeamApplication> {
    const [newApplication] = await db
      .insert(teamApplications)
      .values({
        ...application,
        status: "pending"
      })
      .returning();
    return newApplication;
  }
  
  async updateTeamApplicationStatus(id: number, status: string, reviewedBy?: number, notes?: string): Promise<TeamApplication | undefined> {
    const updateData: any = { 
      status, 
      reviewedAt: new Date()
    };
    
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }
    
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    
    const [updatedApplication] = await db
      .update(teamApplications)
      .set(updateData)
      .where(eq(teamApplications.id, id))
      .returning();
      
    return updatedApplication;
  }
  
  async deleteTeamApplication(id: number): Promise<boolean> {
    const result = await db.delete(teamApplications).where(eq(teamApplications.id, id));
    return result.rowCount > 0;
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        password: await hashPassword(insertUser.password),
      })
      .returning();
    return user;
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.name);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async getAllArticles(filters?: {categoryId?: number, search?: string, sort?: string, year?: number, showUnpublished?: boolean, authorId?: number}): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    let query = db.select({
      article: articles,
      author: {
        displayName: users.displayName,
        title: users.title,
        avatarUrl: users.avatarUrl
      }
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id));

    const conditions = [];

    if (filters?.categoryId) {
      conditions.push(eq(articles.categoryId, filters.categoryId));
    }

    if (filters?.authorId) {
      conditions.push(eq(articles.authorId, filters.authorId));
    }

    if (filters?.search) {
      conditions.push(like(articles.title, `%${filters.search}%`));
    }

    if (filters?.year) {
      const startDate = new Date(filters.year, 0, 1);
      const endDate = new Date(filters.year + 1, 0, 1);
      conditions.push(and(
        gte(articles.createdAt, startDate),
        lt(articles.createdAt, endDate)
      ));
    }

    if (!filters?.showUnpublished) {
      conditions.push(eq(articles.published, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Trier les résultats
    if (filters?.sort === 'newest') {
      query = query.orderBy(desc(articles.createdAt));
    } else if (filters?.sort === 'oldest') {
      query = query.orderBy(articles.createdAt);
    } else if (filters?.sort === 'views') {
      query = query.orderBy(desc(articles.viewCount));
    } else if (filters?.sort === 'title') {
      query = query.orderBy(articles.title);
    } else {
      // Par défaut, trier par date de création (les plus récents d'abord)
      query = query.orderBy(desc(articles.createdAt));
    }

    const results = await query;
    
    return results.map(row => {
      // Safe handling of possible null author
      const authorData = row.author && row.author.displayName ? row.author : undefined;
      
      return {
        ...row.article,
        author: authorData
      };
    });
  }

  async getFeaturedArticles(limit: number = 3): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    const results = await db.select({
      article: articles,
      author: {
        displayName: users.displayName,
        title: users.title,
        avatarUrl: users.avatarUrl
      }
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      and(
        eq(articles.featured, true),
        eq(articles.published, true)
      )
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit);
    
    return results.map(row => {
      // Safe handling of possible null author
      const authorData = row.author && row.author.displayName ? row.author : undefined;
      
      return {
        ...row.article,
        author: authorData
      };
    });
  }

  async getRecentArticles(limit: number = 9): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    const results = await db.select({
      article: articles,
      author: {
        displayName: users.displayName,
        title: users.title,
        avatarUrl: users.avatarUrl
      }
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      and(
        eq(articles.published, true),
        eq(articles.featured, false) // Exclure les articles à la une
      )
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit);
    
    return results.map(row => {
      // Safe handling of possible null author
      const authorData = row.author && row.author.displayName ? row.author : undefined;
      
      return {
        ...row.article,
        author: authorData
      };
    });
  }

  async getArticlesByCategory(categoryId: number, limit: number = 6): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    const results = await db.select({
      article: articles,
      author: {
        displayName: users.displayName,
        title: users.title,
        avatarUrl: users.avatarUrl
      }
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(
      and(
        eq(articles.categoryId, categoryId),
        eq(articles.published, true)
      )
    )
    .orderBy(desc(articles.createdAt))
    .limit(limit);
    
    return results.map(row => {
      // Safe handling of possible null author
      const authorData = row.author && row.author.displayName ? row.author : undefined;
      
      return {
        ...row.article,
        author: authorData
      };
    });
  }

  async getArticlesByAuthor(authorId: number, showUnpublished: boolean = false): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } })[]> {
    let query = db.select({
      article: articles,
      author: {
        displayName: users.displayName,
        title: users.title,
        avatarUrl: users.avatarUrl
      }
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.authorId, authorId));

    if (!showUnpublished) {
      query = query.where(eq(articles.published, true));
    }

    const results = await query.orderBy(desc(articles.createdAt));
    
    return results.map(row => {
      // Safe handling of possible null author
      const authorData = row.author && row.author.displayName ? row.author : undefined;
      
      return {
        ...row.article,
        author: authorData
      };
    });
  }

  async getArticleBySlug(slug: string): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } }) | undefined> {
    const [result] = await db.select({
      article: articles,
      author: {
        displayName: users.displayName,
        title: users.title,
        avatarUrl: users.avatarUrl
      }
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.slug, slug));
    
    if (!result) return undefined;
    
    // Safe handling of possible null author
    const authorData = result.author && result.author.displayName ? result.author : undefined;
    
    return {
      ...result.article,
      author: authorData
    };
  }

  async getArticleById(id: number): Promise<(Article & { author?: { displayName: string, title: string | null, avatarUrl: string | null } }) | undefined> {
    const [result] = await db.select({
      article: articles,
      author: {
        displayName: users.displayName,
        title: users.title,
        avatarUrl: users.avatarUrl
      }
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.id, id));
    
    if (!result) return undefined;
    
    // Safe handling of possible null author
    const authorData = result.author && result.author.displayName ? result.author : undefined;
    
    return {
      ...result.article,
      author: authorData
    };
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    // Si le nouvel article est défini comme "à la une", décocher tous les autres articles
    if (insertArticle.featured === true) {
      // Mettre à jour tous les articles pour désactiver leur statut "à la une"
      await db.update(articles)
        .set({ featured: false })
        .where(eq(articles.featured, true));
    }
    
    const [article] = await db
      .insert(articles)
      .values({
        ...insertArticle,
        published: insertArticle.published ?? false,
        featured: insertArticle.featured ?? false,
        viewCount: 0,
        commentCount: 0,
        imageUrl: insertArticle.imageUrl || null,
        categoryId: insertArticle.categoryId || null,
        authorId: insertArticle.authorId || null
      })
      .returning();
    return article;
  }

  async updateArticle(id: number, articleData: Partial<InsertArticle>): Promise<Article | undefined> {
    // Si l'article est défini comme "à la une", décocher tous les autres articles
    if (articleData.featured === true) {
      // Mettre à jour tous les autres articles pour désactiver leur statut "à la une"
      await db.update(articles)
        .set({ featured: false })
        .where(
          and(
            eq(articles.featured, true),  // Qui sont actuellement définis comme "à la une"
            sql`${articles.id} <> ${id}`  // Tous les articles sauf celui en cours de modification
          )
        );
    }
    
    // Mise à jour de l'article demandé
    const [article] = await db.update(articles)
      .set({
        ...articleData,
        updatedAt: new Date(),
        imageUrl: articleData.imageUrl || null,
        categoryId: articleData.categoryId || null,
        authorId: articleData.authorId || null
      })
      .where(eq(articles.id, id))
      .returning();
    return article;
  }

  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles).where(eq(articles.id, id));
    return result.rowCount > 0;
  }

  async updateArticleViews(id: number): Promise<void> {
    await db.update(articles)
      .set({
        viewCount: sql`${articles.viewCount} + 1`
      })
      .where(eq(articles.id, id));
  }

  async getActiveNewsUpdates(): Promise<NewsUpdate[]> {
    return db.select()
      .from(newsUpdates)
      .where(eq(newsUpdates.active, true))
      .orderBy(desc(newsUpdates.createdAt));
  }

  async createNewsUpdate(insertNewsUpdate: InsertNewsUpdate): Promise<NewsUpdate> {
    const [newsUpdate] = await db
      .insert(newsUpdates)
      .values({
        ...insertNewsUpdate,
        active: insertNewsUpdate.active ?? true
      })
      .returning();
    return newsUpdate;
  }

  async getActiveFlashInfos(): Promise<FlashInfo[]> {
    return db.select()
      .from(flashInfos)
      .where(eq(flashInfos.active, true))
      .orderBy(desc(flashInfos.createdAt));
  }

  async getAllFlashInfos(): Promise<FlashInfo[]> {
    return db.select()
      .from(flashInfos)
      .orderBy(desc(flashInfos.createdAt));
  }

  async getFlashInfoById(id: number): Promise<FlashInfo | undefined> {
    const [flashInfo] = await db.select()
      .from(flashInfos)
      .where(eq(flashInfos.id, id));
    return flashInfo;
  }

  async createFlashInfo(insertFlashInfo: InsertFlashInfo): Promise<FlashInfo> {
    const [flashInfo] = await db
      .insert(flashInfos)
      .values({
        ...insertFlashInfo,
        active: insertFlashInfo.active ?? true,
        imageUrl: insertFlashInfo.imageUrl || null
      })
      .returning();
    return flashInfo;
  }

  async getActiveLiveEvent(): Promise<(LiveEvent & { editors?: any[] }) | undefined> {
    try {
      // D'abord chercher un direct actif dans live_coverages
      const activeCoverages = await this.getActiveLiveCoverages();
      
      if (activeCoverages && activeCoverages.length > 0) {
        // Trier les directs actifs par date de création (le plus récent en premier)
        const sortedCoverages = [...activeCoverages].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        // Convertir le direct le plus récent en format LiveEvent
        const coverage = sortedCoverages[0];
        
        // Récupérer les éditeurs du direct
        const editors = await this.getLiveCoverageEditors(coverage.id);
        
        // Créer un objet LiveEvent à partir des données du LiveCoverage
        const liveEvent: LiveEvent & { editors?: any[], slug?: string } = {
          id: coverage.id,
          title: coverage.title,
          description: coverage.subject || "",  // Utiliser subject comme description
          imageUrl: coverage.imageUrl,
          liveUrl: `/suivis-en-direct/${coverage.slug}`, // URL relative pour le direct
          active: coverage.active,
          scheduledFor: null, // Pas d'équivalent dans LiveCoverage
          categoryId: null,   // Pas d'équivalent dans LiveCoverage
          createdAt: coverage.createdAt,
          updatedAt: coverage.updatedAt,
          editors: editors,
          slug: coverage.slug  // Ajout de la propriété slug pour pouvoir l'utiliser dans le lien
        };
        
        return liveEvent;
      }
      
      // Si aucun direct actif dans live_coverages, chercher dans live_events
      const [liveEvent] = await db.select()
        .from(liveEvents)
        .where(eq(liveEvents.active, true))
        .orderBy(desc(liveEvents.createdAt))
        .limit(1);
      
      return liveEvent;
    } catch (error) {
      console.error("Erreur dans getActiveLiveEvent:", error);
      return undefined;
    }
  }

  async getLiveEventById(id: number): Promise<LiveEvent | undefined> {
    const [liveEvent] = await db.select()
      .from(liveEvents)
      .where(eq(liveEvents.id, id));
    
    return liveEvent;
  }

  async createLiveEvent(insertLiveEvent: InsertLiveEvent): Promise<LiveEvent> {
    const [liveEvent] = await db
      .insert(liveEvents)
      .values({
        ...insertLiveEvent,
        active: insertLiveEvent.active ?? false,
        imageUrl: insertLiveEvent.imageUrl || null
      })
      .returning();
    return liveEvent;
  }

  async getAllElections(): Promise<Election[]> {
    return db.select().from(elections).orderBy(elections.date);
  }

  async getUpcomingElections(limit: number = 4): Promise<Election[]> {
    return db.select()
      .from(elections)
      .where(gte(elections.date, new Date()))
      .orderBy(elections.date)
      .limit(limit);
  }

  async getRecentElections(limit: number = 2): Promise<Election[]> {
    return db.select()
      .from(elections)
      .where(lte(elections.date, new Date()))
      .orderBy(desc(elections.date))
      .limit(limit);
  }

  async getElectionById(id: number): Promise<Election | undefined> {
    const [election] = await db.select()
      .from(elections)
      .where(eq(elections.id, id));
    
    return election;
  }

  async createElection(insertElection: InsertElection): Promise<Election> {
    const [election] = await db
      .insert(elections)
      .values({
        ...insertElection,
        imageUrl: insertElection.imageUrl || null
      })
      .returning();
    return election;
  }

  // Gestion des sujets éducatifs
  async getAllEducationalTopics(): Promise<EducationalTopic[]> {
    return db.select()
      .from(educationalTopics)
      .orderBy(educationalTopics.order);
  }

  async getEducationalTopicById(id: number): Promise<EducationalTopic | undefined> {
    const [topic] = await db.select()
      .from(educationalTopics)
      .where(eq(educationalTopics.id, id));
    
    return topic;
  }

  async getEducationalTopicBySlug(slug: string): Promise<EducationalTopic | undefined> {
    const [topic] = await db.select()
      .from(educationalTopics)
      .where(eq(educationalTopics.slug, slug));
    
    return topic;
  }

  async createEducationalTopic(insertTopic: InsertEducationalTopic): Promise<EducationalTopic> {
    const [topic] = await db
      .insert(educationalTopics)
      .values({
        ...insertTopic,
        imageUrl: insertTopic.imageUrl,
        icon: insertTopic.icon || null
      })
      .returning();
    return topic;
  }

  async updateEducationalTopic(id: number, updateData: Partial<InsertEducationalTopic>): Promise<EducationalTopic | undefined> {
    const [topic] = await db
      .update(educationalTopics)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(educationalTopics.id, id))
      .returning();
    
    return topic;
  }

  async deleteEducationalTopic(id: number): Promise<boolean> {
    const result = await db
      .delete(educationalTopics)
      .where(eq(educationalTopics.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Gestion du contenu éducatif
  async getAllEducationalContent(topicId?: number): Promise<EducationalContent[]> {
    let query = db.select().from(educationalContent);
    
    if (topicId) {
      query = query.where(eq(educationalContent.topicId, topicId));
    }
    
    return query.orderBy(educationalContent.title);
  }

  async getEducationalContentById(id: number): Promise<EducationalContent | undefined> {
    const [content] = await db.select()
      .from(educationalContent)
      .where(eq(educationalContent.id, id));
    
    return content;
  }

  async getEducationalContentBySlug(slug: string): Promise<EducationalContent | undefined> {
    const [content] = await db.select()
      .from(educationalContent)
      .where(eq(educationalContent.slug, slug));
    
    return content;
  }

  async createEducationalContent(insertContent: InsertEducationalContent): Promise<EducationalContent> {
    const [content] = await db
      .insert(educationalContent)
      .values({
        ...insertContent,
        imageUrl: insertContent.imageUrl
      })
      .returning();
    return content;
  }

  async updateEducationalContent(id: number, updateData: Partial<InsertEducationalContent>): Promise<EducationalContent | undefined> {
    const [content] = await db
      .update(educationalContent)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(educationalContent.id, id))
      .returning();
    
    return content;
  }

  async deleteEducationalContent(id: number): Promise<boolean> {
    const result = await db
      .delete(educationalContent)
      .where(eq(educationalContent.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  async incrementEducationalContentViews(id: number): Promise<void> {
    await db
      .update(educationalContent)
      .set({
        views: sql`${educationalContent.views} + 1`
      })
      .where(eq(educationalContent.id, id));
  }

  async getAllVideos(limit: number = 8): Promise<Video[]> {
    return db.select()
      .from(videos)
      .orderBy(desc(videos.createdAt))
      .limit(limit);
  }

  async getVideoById(id: number): Promise<Video | undefined> {
    const [video] = await db.select()
      .from(videos)
      .where(eq(videos.id, id));
    
    return video;
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db
      .insert(videos)
      .values({
        ...insertVideo,
        thumbnailUrl: insertVideo.thumbnailUrl || null,
        viewCount: 0
      })
      .returning();
    return video;
  }

  async updateVideoViews(id: number): Promise<void> {
    await db.update(videos)
      .set({
        viewCount: sql`${videos.viewCount} + 1`
      })
      .where(eq(videos.id, id));
  }

  // Contact Messages operations
  async getAllContactMessages(): Promise<(ContactMessage & { assignedToAdmin?: { username: string, displayName: string } })[]> {
    const messagesWithAdmins = await db.select({
      ...contactMessages,
      assignedToAdmin: {
        username: users.username,
        displayName: users.displayName
      },
    })
    .from(contactMessages)
    .leftJoin(users, eq(contactMessages.assignedTo, users.id))
    .orderBy(desc(contactMessages.createdAt));
    
    return messagesWithAdmins;
  }
  
  async getContactMessageById(id: number): Promise<(ContactMessage & { assignedToAdmin?: { username: string, displayName: string } }) | undefined> {
    const [message] = await db.select({
      ...contactMessages,
      assignedToAdmin: {
        username: users.username,
        displayName: users.displayName
      },
    })
    .from(contactMessages)
    .leftJoin(users, eq(contactMessages.assignedTo, users.id))
    .where(eq(contactMessages.id, id));
    
    return message;
  }
  
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values({
        ...message,
        isRead: false
      })
      .returning();
    return newMessage;
  }
  
  async markContactMessageAsRead(id: number): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }
  
  async assignMessageToAdmin(id: number, adminId: number): Promise<ContactMessage | undefined> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ assignedTo: adminId })
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // LiveCoverage operations (Suivis en direct)
  async getAllLiveCoverages(): Promise<LiveCoverage[]> {
    return db.select().from(liveCoverages).orderBy(desc(liveCoverages.createdAt));
  }

  async getActiveLiveCoverages(): Promise<LiveCoverage[]> {
    return db.select()
      .from(liveCoverages)
      .where(eq(liveCoverages.active, true))
      .orderBy(desc(liveCoverages.createdAt));
  }

  async getLiveCoverageBySlug(slug: string): Promise<LiveCoverage | undefined> {
    const [coverage] = await db.select()
      .from(liveCoverages)
      .where(eq(liveCoverages.slug, slug));
    return coverage;
  }

  async getLiveCoverageById(id: number): Promise<LiveCoverage | undefined> {
    const [coverage] = await db.select()
      .from(liveCoverages)
      .where(eq(liveCoverages.id, id));
    return coverage;
  }

  async createLiveCoverage(coverage: InsertLiveCoverage): Promise<LiveCoverage> {
    const [result] = await db.insert(liveCoverages)
      .values({
        ...coverage,
        imageUrl: coverage.imageUrl || null,
        context: coverage.context || "",  // Fournir une valeur par défaut pour le contexte
      })
      .returning();
    return result;
  }

  async updateLiveCoverage(id: number, data: Partial<InsertLiveCoverage>): Promise<LiveCoverage | undefined> {
    const [updated] = await db.update(liveCoverages)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(liveCoverages.id, id))
      .returning();
    return updated;
  }

  async deleteLiveCoverage(id: number): Promise<boolean> {
    try {
      // D'abord supprimer les mises à jour associées (incluant celles liées aux questions)
      await db.delete(liveCoverageUpdates)
        .where(eq(liveCoverageUpdates.coverageId, id));
      
      // Ensuite supprimer les questions associées
      await db.delete(liveCoverageQuestions)
        .where(eq(liveCoverageQuestions.coverageId, id));
        
      // Puis supprimer les éditeurs associés
      await db.delete(liveCoverageEditors)
        .where(eq(liveCoverageEditors.coverageId, id));
      
      // Enfin supprimer le direct lui-même
      const result = await db.delete(liveCoverages)
        .where(eq(liveCoverages.id, id));
        
      return result.rowCount > 0;
    } catch (error) {
      console.error("Erreur lors de la suppression du direct:", error);
      throw error;
    }
  }

  async getLiveCoverageEditors(coverageId: number): Promise<(LiveCoverageEditor & { 
    editor?: { displayName: string, title: string | null, avatarUrl: string | null } 
  })[]> {
    const result = await db.select({
      editor: liveCoverageEditors,
      editorDisplayName: users.displayName,
      editorTitle: users.title,
      editorAvatarUrl: users.avatarUrl
    })
    .from(liveCoverageEditors)
    .leftJoin(users, eq(liveCoverageEditors.editorId, users.id))
    .where(eq(liveCoverageEditors.coverageId, coverageId));
    
    return result.map(row => {
      const editor = { ...row.editor } as any;
      
      if (row.editorDisplayName) {
        editor.editor = {
          displayName: row.editorDisplayName,
          title: row.editorTitle,
          avatarUrl: row.editorAvatarUrl
        };
      }
      
      return editor;
    });
  }

  async addEditorToLiveCoverage(editor: InsertLiveCoverageEditor): Promise<LiveCoverageEditor> {
    const [result] = await db.insert(liveCoverageEditors)
      .values(editor)
      .returning();
    return result;
  }

  async removeEditorFromLiveCoverage(coverageId: number, editorId: number): Promise<boolean> {
    const result = await db.delete(liveCoverageEditors)
      .where(
        and(
          eq(liveCoverageEditors.coverageId, coverageId),
          eq(liveCoverageEditors.editorId, editorId)
        )
      );
    return result.rowCount > 0;
  }

  async getLiveCoverageUpdates(coverageId: number): Promise<(LiveCoverageUpdate & {
    author?: { displayName: string, title: string | null, avatarUrl: string | null }
  })[]> {
    const result = await db.select({
      update: liveCoverageUpdates,
      authorDisplayName: users.displayName,
      authorTitle: users.title,
      authorAvatarUrl: users.avatarUrl
    })
    .from(liveCoverageUpdates)
    .leftJoin(users, eq(liveCoverageUpdates.authorId, users.id))
    .where(eq(liveCoverageUpdates.coverageId, coverageId))
    .orderBy(desc(liveCoverageUpdates.timestamp));
    
    return result.map(row => {
      const update = { ...row.update } as any;
      
      if (row.authorDisplayName) {
        update.author = {
          displayName: row.authorDisplayName,
          title: row.authorTitle,
          avatarUrl: row.authorAvatarUrl
        };
      }
      
      return update;
    });
  }

  async createLiveCoverageUpdate(update: InsertLiveCoverageUpdate): Promise<LiveCoverageUpdate> {
    const [result] = await db.insert(liveCoverageUpdates)
      .values({
        ...update,
        imageUrl: update.imageUrl || null,
        important: update.important || false
      })
      .returning();
    return result;
  }

  async deleteLiveCoverageUpdate(id: number): Promise<boolean> {
    const result = await db.delete(liveCoverageUpdates)
      .where(eq(liveCoverageUpdates.id, id));
    return result.rowCount > 0;
  }
  
  // Live Coverage Questions operations
  async getLiveCoverageQuestions(coverageId: number, status?: string): Promise<LiveCoverageQuestion[]> {
    if (status) {
      return db.select().from(liveCoverageQuestions)
        .where(and(
          eq(liveCoverageQuestions.coverageId, coverageId),
          eq(liveCoverageQuestions.status, status)
        ))
        .orderBy(desc(liveCoverageQuestions.timestamp));
    } else {
      return db.select().from(liveCoverageQuestions)
        .where(eq(liveCoverageQuestions.coverageId, coverageId))
        .orderBy(desc(liveCoverageQuestions.timestamp));
    }
  }
  
  async createLiveCoverageQuestion(question: InsertLiveCoverageQuestion): Promise<LiveCoverageQuestion> {
    const [newQuestion] = await db.insert(liveCoverageQuestions)
      .values({
        ...question,
        timestamp: new Date(),
        answered: false
      })
      .returning();
    return newQuestion;
  }
  
  async updateLiveCoverageQuestionStatus(id: number, status: string, answered: boolean = false): Promise<LiveCoverageQuestion | undefined> {
    const [question] = await db.update(liveCoverageQuestions)
      .set({ 
        status, 
        answered,
        updatedAt: new Date()
      })
      .where(eq(liveCoverageQuestions.id, id))
      .returning();
    
    return question;
  }
  
  async createAnswerToQuestion(
    questionId: number, 
    coverageId: number, 
    content: string, 
    authorId: number,
    important: boolean = false
  ): Promise<LiveCoverageUpdate> {
    // Créer une mise à jour de type réponse
    const [update] = await db.insert(liveCoverageUpdates)
      .values({
        coverageId,
        content,
        authorId,
        timestamp: new Date(),
        important,
        isAnswer: true,
        questionId
      })
      .returning();
    
    // Marquer la question comme répondue
    await this.updateLiveCoverageQuestionStatus(questionId, "approved", true);
    
    return update;
  }
}

// Initialize the database with default values if needed
async function initializeDb() {
  // Check if there are any categories
  const categoriesCount = await db.select({ count: sql<number>`count(*)` }).from(categories);
  
  if (categoriesCount[0].count === 0) {
    console.log("Initializing categories...");
    
    // Insert default categories
    await db.insert(categories).values([
      { name: "Politique", slug: "politique", description: "Actualités et analyses politiques" },
      { name: "Économie", slug: "economie", description: "Analyses économiques et financières" },
      { name: "International", slug: "international", description: "L'actualité internationale" },
      { name: "Société", slug: "societe", description: "Enjeux sociétaux contemporains" },
      { name: "Histoire", slug: "histoire", description: "Analyses historiques" }
    ]);
  }
  
  // Check if there are any users
  const usersCount = await db.select({ count: sql<number>`count(*)` }).from(users);
  
  if (usersCount[0].count === 0) {
    console.log("Initializing users...");
    
    // Insert default admin user
    await db.insert(users).values({
      username: "admin",
      password: await hashPassword("admin"),
      email: "admin@politiquensemble.fr",
      displayName: "Administrateur",
      role: "admin",
      title: "Administrateur du site",
      bio: "Compte administrateur principal",
      avatarUrl: null
    });
  }
  
  // Vérification s'il y a des sujets éducatifs
  await initializeEducationalTopics();
}

// Initialiser spécifiquement les vidéos
async function initializeVideosOnly() {
  // Check if there are any videos
  const videosCount = await db.select({ count: sql<number>`count(*)` }).from(videos);
  
  if (videosCount[0].count === 0) {
    console.log("Initializing videos...");
    
    // Insert default videos
    await db.insert(videos).values([
      { 
        title: "Le rôle des institutions européennes", 
        description: "Une explication claire du fonctionnement de l'UE et de ses institutions", 
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
        thumbnailUrl: "https://picsum.photos/id/1/600/400", 
        viewCount: 0,
        categoryId: 1
      },
      { 
        title: "Les élections présidentielles expliquées", 
        description: "Comment fonctionne le système électoral français", 
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 
        thumbnailUrl: "https://picsum.photos/id/2/600/400", 
        viewCount: 0,
        categoryId: 1
      }
    ]);
  }
}

// Initialiser les sujets éducatifs
async function initializeEducationalTopics() {
  // Vérifier s'il y a déjà des sujets éducatifs
  const topicsCount = await db.select({ count: sql<number>`count(*)` }).from(educationalTopics);
  
  if (topicsCount[0].count === 0) {
    console.log("Initializing educational topics...");
    
    // Insérer des sujets éducatifs par défaut
    await db.insert(educationalTopics).values([
      { 
        title: "Institutions politiques", 
        slug: "institutions-politiques", 
        description: "Tout ce qu'il faut savoir sur le fonctionnement des institutions politiques françaises et européennes.",
        imageUrl: "https://picsum.photos/id/10/800/400",
        icon: "GavelIcon",
        color: "#3B82F6",
        order: 1
      },
      { 
        title: "Élections", 
        slug: "elections", 
        description: "Comprendre les différents systèmes électoraux et les enjeux des élections.",
        imageUrl: "https://picsum.photos/id/20/800/400",
        icon: "VoteIcon",
        color: "#10B981",
        order: 2
      },
      { 
        title: "Budget et finances publiques", 
        slug: "finances-publiques", 
        description: "Décryptage du budget de l'État et des finances publiques.",
        imageUrl: "https://picsum.photos/id/30/800/400",
        icon: "BarChart2Icon",
        color: "#F59E0B",
        order: 3
      },
      { 
        title: "Union européenne", 
        slug: "union-europeenne", 
        description: "Fonctionnement et enjeux de l'Union européenne.",
        imageUrl: "https://picsum.photos/id/40/800/400",
        icon: "GlobeIcon",
        color: "#6366F1",
        order: 4
      }
    ]);

    // Ajouter des contenus pour ces sujets
    const topics = await db.select().from(educationalTopics);
    
    if (topics.length > 0) {
      for (const topic of topics) {
        await db.insert(educationalContent).values({
          title: `Introduction à ${topic.title}`,
          slug: `introduction-a-${topic.slug}`,
          content: `<h2>Introduction à ${topic.title}</h2><p>Ce contenu vous explique les bases sur ${topic.title}.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.</p><h3>Points clés</h3><ul><li>Point 1</li><li>Point 2</li><li>Point 3</li></ul>`,
          summary: `Une introduction complète aux concepts fondamentaux de ${topic.title}.`,
          imageUrl: topic.imageUrl,
          topicId: topic.id,
          authorId: 1, // Administrateur
          published: true
        });
      }
    }
  }
}

// Initialize the database
initializeDb()
  .then(() => console.log("Database initialization complete or not needed"))
  .catch(err => console.error("Error initializing database:", err));

// Initialiser spécifiquement les vidéos
initializeVideosOnly()
  .then(() => console.log("Videos initialization complete or not needed"))
  .catch(err => console.error("Error initializing videos:", err));

export const storage = new DatabaseStorage();