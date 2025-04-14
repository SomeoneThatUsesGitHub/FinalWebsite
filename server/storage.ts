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
  educationalQuizzes, type EducationalQuiz, type InsertEducationalQuiz,
  videos, type Video, type InsertVideo,
  liveCoverages, type LiveCoverage, type InsertLiveCoverage,
  liveCoverageEditors, type LiveCoverageEditor, type InsertLiveCoverageEditor,
  liveCoverageUpdates, type LiveCoverageUpdate, type InsertLiveCoverageUpdate,
  liveCoverageQuestions, type LiveCoverageQuestion, type InsertLiveCoverageQuestion,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  teamApplications, type TeamApplication, type InsertTeamApplication,
  contactMessages, type ContactMessage, type InsertContactMessage,
  articleSubmissions, type ArticleSubmission, type InsertArticleSubmission
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
  updateElection(id: number, data: Partial<InsertElection>): Promise<Election | undefined>;
  deleteElection(id: number): Promise<boolean>;
  
  // Educational Topics operations
  getAllEducationalTopics(): Promise<EducationalTopic[]>;
  getEducationalTopicBySlug(slug: string): Promise<EducationalTopic | undefined>;
  getEducationalTopicById(id: number): Promise<EducationalTopic | undefined>;
  createEducationalTopic(topic: InsertEducationalTopic): Promise<EducationalTopic>;
  updateEducationalTopic(id: number, data: Partial<InsertEducationalTopic>): Promise<EducationalTopic | undefined>;
  deleteEducationalTopic(id: number): Promise<boolean>;
  
  // Educational Content operations
  getAllEducationalContent(topicId?: number): Promise<EducationalContent[]>;
  getEducationalContentById(id: number): Promise<EducationalContent | undefined>;
  getEducationalContentBySlug(slug: string): Promise<EducationalContent | undefined>;
  createEducationalContent(content: InsertEducationalContent): Promise<EducationalContent>;
  updateEducationalContent(id: number, data: Partial<InsertEducationalContent>): Promise<EducationalContent | undefined>;
  deleteEducationalContent(id: number): Promise<boolean>;
  incrementEducationalContentViews(id: number): Promise<void>;
  
  // Quiz éducatifs operations
  getQuizzesByContentId(contentId: number): Promise<EducationalQuiz[]>;
  getQuizById(id: number): Promise<EducationalQuiz | undefined>;
  createQuiz(quiz: InsertEducationalQuiz): Promise<EducationalQuiz>;
  updateQuiz(id: number, data: Partial<InsertEducationalQuiz>): Promise<EducationalQuiz | undefined>;
  deleteQuiz(id: number): Promise<boolean>;
  
  // Videos operations
  getAllVideos(limit?: number): Promise<Video[]>;
  getVideoById(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoViews(id: number): Promise<void>;
  
  // Article Submissions operations
  getAllArticleSubmissions(): Promise<ArticleSubmission[]>;
  getArticleSubmissionsByUser(userId: number): Promise<ArticleSubmission[]>;
  getArticleSubmissionById(id: number): Promise<ArticleSubmission | undefined>;
  createArticleSubmission(submission: InsertArticleSubmission): Promise<ArticleSubmission>;
  updateArticleSubmissionStatus(id: number, status: string, editorComments?: string, assignedTo?: number): Promise<ArticleSubmission | undefined>;
  deleteArticleSubmission(id: number): Promise<boolean>;
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
        .values({ email, subscriptionDate: new Date() })
        .returning();
      return subscriber;
    } catch (error) {
      console.error("Error creating newsletter subscriber:", error);
      throw new Error("Failed to create newsletter subscriber");
    }
  }
  
  async deleteNewsletterSubscriber(id: number): Promise<boolean> {
    const result = await db.delete(newsletterSubscribers)
      .where(eq(newsletterSubscribers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Team Applications operations
  async getAllTeamApplications(): Promise<TeamApplication[]> {
    return db.select().from(teamApplications).orderBy(desc(teamApplications.submissionDate));
  }
  
  async getTeamApplicationById(id: number): Promise<TeamApplication | undefined> {
    const applications = await db.select().from(teamApplications)
      .where(eq(teamApplications.id, id));
    return applications[0];
  }
  
  async createTeamApplication(application: InsertTeamApplication): Promise<TeamApplication> {
    const [newApplication] = await db
      .insert(teamApplications)
      .values({
        ...application,
        submissionDate: new Date(),
        status: "pending"
      })
      .returning();
    return newApplication;
  }
  
  async updateTeamApplicationStatus(id: number, status: string, reviewedBy?: number, notes?: string): Promise<TeamApplication | undefined> {
    const updateData: Record<string, any> = { 
      status,
      reviewedAt: new Date()
    };
    
    if (reviewedBy !== undefined) {
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
    const result = await db.delete(teamApplications)
      .where(eq(teamApplications.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const users_list = await db.select().from(users).where(eq(users.id, id));
    return users_list[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const users_list = await db.select().from(users).where(eq(users.username, username));
    return users_list[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const userData = { ...insertUser };
    
    // Hash the password if it's provided and not already hashed
    if (userData.password && !userData.password.includes('.')) {
      userData.password = await hashPassword(userData.password);
    }
    
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    
    return user;
  }
  
  // Category operations
  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories).orderBy(categories.order);
  }
  
  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const cats = await db.select().from(categories).where(eq(categories.slug, slug));
    return cats[0];
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    
    return category;
  }
  
  // Article operations
  async getAllArticles(filters?: {categoryId?: number, search?: string, sort?: string, year?: number, showUnpublished?: boolean, authorId?: number}): Promise<Article[]> {
    let query = db.select().from(articles);
    
    if (filters) {
      const conditions = [];
      
      // Filter by category
      if (filters.categoryId) {
        conditions.push(eq(articles.categoryId, filters.categoryId));
      }
      
      // Filter by author
      if (filters.authorId) {
        conditions.push(eq(articles.authorId, filters.authorId));
      }
      
      // Filter by search term
      if (filters.search) {
        conditions.push(
          or(
            like(articles.title, `%${filters.search}%`),
            like(articles.content, `%${filters.search}%`)
          )
        );
      }
      
      // Filter by year
      if (filters.year) {
        const startDate = new Date(filters.year, 0, 1);
        const endDate = new Date(filters.year, 11, 31, 23, 59, 59);
        conditions.push(
          and(
            gte(articles.publishedAt, startDate),
            lte(articles.publishedAt, endDate)
          )
        );
      }
      
      // Filter published/unpublished
      if (!filters.showUnpublished) {
        conditions.push(not(isNull(articles.publishedAt)));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply sorting
      if (filters.sort === 'oldest') {
        query = query.orderBy(articles.publishedAt);
      } else if (filters.sort === 'title') {
        query = query.orderBy(articles.title);
      } else if (filters.sort === 'views') {
        query = query.orderBy(desc(articles.views));
      } else {
        // Default sort by newest first
        query = query.orderBy(desc(articles.publishedAt));
      }
    } else {
      // Default filter: only published articles
      query = query.where(not(isNull(articles.publishedAt))).orderBy(desc(articles.publishedAt));
    }
    
    return query;
  }
  
  async getFeaturedArticles(limit: number = 3): Promise<Article[]> {
    return db.select()
      .from(articles)
      .where(
        and(
          eq(articles.featured, true),
          not(isNull(articles.publishedAt))
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }
  
  async getRecentArticles(limit: number = 9): Promise<Article[]> {
    return db.select()
      .from(articles)
      .where(not(isNull(articles.publishedAt)))
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }
  
  async getArticlesByCategory(categoryId: number, limit: number = 6): Promise<Article[]> {
    return db.select()
      .from(articles)
      .where(
        and(
          eq(articles.categoryId, categoryId),
          not(isNull(articles.publishedAt))
        )
      )
      .orderBy(desc(articles.publishedAt))
      .limit(limit);
  }
  
  async getArticlesByAuthor(authorId: number, showUnpublished: boolean = false): Promise<Article[]> {
    let query = db.select()
      .from(articles)
      .where(eq(articles.authorId, authorId));
    
    if (!showUnpublished) {
      query = query.where(not(isNull(articles.publishedAt)));
    }
    
    return query.orderBy(desc(articles.publishedAt));
  }
  
  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const articles_list = await db.select()
      .from(articles)
      .where(eq(articles.slug, slug));
    
    return articles_list[0];
  }
  
  async getArticleById(id: number): Promise<Article | undefined> {
    const articles_list = await db.select()
      .from(articles)
      .where(eq(articles.id, id));
    
    return articles_list[0];
  }
  
  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values({
        ...insertArticle,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return article;
  }
  
  async updateArticle(id: number, articleData: Partial<InsertArticle>): Promise<Article | undefined> {
    const [updatedArticle] = await db
      .update(articles)
      .set({
        ...articleData,
        updatedAt: new Date()
      })
      .where(eq(articles.id, id))
      .returning();
    
    return updatedArticle;
  }
  
  async deleteArticle(id: number): Promise<boolean> {
    const result = await db.delete(articles)
      .where(eq(articles.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async updateArticleViews(id: number): Promise<void> {
    await db
      .update(articles)
      .set({
        views: sql`${articles.views} + 1`
      })
      .where(eq(articles.id, id));
  }
  
  // News Updates operations
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
        createdAt: new Date(),
        active: true
      })
      .returning();
    
    return newsUpdate;
  }
  
  // Flash Info operations
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
    const flashInfos_list = await db.select()
      .from(flashInfos)
      .where(eq(flashInfos.id, id));
    
    return flashInfos_list[0];
  }
  
  async createFlashInfo(insertFlashInfo: InsertFlashInfo): Promise<FlashInfo> {
    const [flashInfo] = await db
      .insert(flashInfos)
      .values({
        ...insertFlashInfo,
        createdAt: new Date(),
        active: true
      })
      .returning();
    
    return flashInfo;
  }
  
  // Live Events operations
  async getActiveLiveEvent(): Promise<LiveEvent | undefined> {
    const liveEvents_list = await db.select()
      .from(liveEvents)
      .where(eq(liveEvents.active, true))
      .orderBy(desc(liveEvents.createdAt));
    
    return liveEvents_list[0];
  }
  
  async getLiveEventById(id: number): Promise<LiveEvent | undefined> {
    const liveEvents_list = await db.select()
      .from(liveEvents)
      .where(eq(liveEvents.id, id));
    
    return liveEvents_list[0];
  }
  
  async createLiveEvent(insertLiveEvent: InsertLiveEvent): Promise<LiveEvent> {
    const [liveEvent] = await db
      .insert(liveEvents)
      .values({
        ...insertLiveEvent,
        createdAt: new Date(),
        active: true
      })
      .returning();
    
    return liveEvent;
  }
  
  // Election operations
  async getAllElections(): Promise<Election[]> {
    return db.select()
      .from(elections)
      .orderBy(desc(elections.date));
  }
  
  async getUpcomingElections(limit: number = 4): Promise<Election[]> {
    const today = new Date();
    return db.select()
      .from(elections)
      .where(gte(elections.date, today))
      .orderBy(elections.date)
      .limit(limit);
  }
  
  async getRecentElections(limit: number = 2): Promise<Election[]> {
    const today = new Date();
    return db.select()
      .from(elections)
      .where(lt(elections.date, today))
      .orderBy(desc(elections.date))
      .limit(limit);
  }
  
  async getElectionById(id: number): Promise<Election | undefined> {
    const elections_list = await db.select()
      .from(elections)
      .where(eq(elections.id, id));
    
    return elections_list[0];
  }
  
  async createElection(insertElection: InsertElection): Promise<Election> {
    const [election] = await db
      .insert(elections)
      .values(insertElection)
      .returning();
    
    return election;
  }
  
  async updateElection(id: number, data: Partial<InsertElection>): Promise<Election | undefined> {
    const [updatedElection] = await db
      .update(elections)
      .set(data)
      .where(eq(elections.id, id))
      .returning();
    
    return updatedElection;
  }
  
  async deleteElection(id: number): Promise<boolean> {
    const result = await db.delete(elections)
      .where(eq(elections.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Educational Topics operations
  async getAllEducationalTopics(): Promise<EducationalTopic[]> {
    return db.select()
      .from(educationalTopics)
      .orderBy(educationalTopics.order);
  }
  
  async getEducationalTopicById(id: number): Promise<EducationalTopic | undefined> {
    const topics = await db.select()
      .from(educationalTopics)
      .where(eq(educationalTopics.id, id));
    
    return topics[0];
  }
  
  async getEducationalTopicBySlug(slug: string): Promise<EducationalTopic | undefined> {
    const topics = await db.select()
      .from(educationalTopics)
      .where(eq(educationalTopics.slug, slug));
    
    return topics[0];
  }
  
  async createEducationalTopic(insertTopic: InsertEducationalTopic): Promise<EducationalTopic> {
    const [topic] = await db
      .insert(educationalTopics)
      .values({
        ...insertTopic,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return topic;
  }
  
  async updateEducationalTopic(id: number, updateData: Partial<InsertEducationalTopic>): Promise<EducationalTopic | undefined> {
    const [updatedTopic] = await db
      .update(educationalTopics)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(educationalTopics.id, id))
      .returning();
    
    return updatedTopic;
  }
  
  async deleteEducationalTopic(id: number): Promise<boolean> {
    const result = await db.delete(educationalTopics)
      .where(eq(educationalTopics.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Educational Content operations
  async getAllEducationalContent(topicId?: number): Promise<EducationalContent[]> {
    let query = db.select().from(educationalContent);
    
    if (topicId) {
      query = query.where(eq(educationalContent.topicId, topicId));
    }
    
    return query.orderBy(educationalContent.order);
  }
  
  async getEducationalContentById(id: number): Promise<EducationalContent | undefined> {
    const contents = await db.select()
      .from(educationalContent)
      .where(eq(educationalContent.id, id));
    
    return contents[0];
  }
  
  async getEducationalContentBySlug(slug: string): Promise<EducationalContent | undefined> {
    const contents = await db.select()
      .from(educationalContent)
      .where(eq(educationalContent.slug, slug));
    
    return contents[0];
  }
  
  async createEducationalContent(insertContent: InsertEducationalContent): Promise<EducationalContent> {
    const [content] = await db
      .insert(educationalContent)
      .values({
        ...insertContent,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return content;
  }
  
  async updateEducationalContent(id: number, updateData: Partial<InsertEducationalContent>): Promise<EducationalContent | undefined> {
    const [updatedContent] = await db
      .update(educationalContent)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(educationalContent.id, id))
      .returning();
    
    return updatedContent;
  }
  
  async deleteEducationalContent(id: number): Promise<boolean> {
    const result = await db.delete(educationalContent)
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
  
  // Quiz operations
  async getQuizzesByContentId(contentId: number): Promise<EducationalQuiz[]> {
    return db.select()
      .from(educationalQuizzes)
      .where(eq(educationalQuizzes.contentId, contentId))
      .orderBy(educationalQuizzes.order);
  }
  
  async getQuizById(id: number): Promise<EducationalQuiz | undefined> {
    const quizzes = await db.select()
      .from(educationalQuizzes)
      .where(eq(educationalQuizzes.id, id));
    
    return quizzes[0];
  }
  
  async createQuiz(insertQuiz: InsertEducationalQuiz): Promise<EducationalQuiz> {
    const [quiz] = await db
      .insert(educationalQuizzes)
      .values({
        ...insertQuiz,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return quiz;
  }
  
  async updateQuiz(id: number, updateData: Partial<InsertEducationalQuiz>): Promise<EducationalQuiz | undefined> {
    const [updatedQuiz] = await db
      .update(educationalQuizzes)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(educationalQuizzes.id, id))
      .returning();
    
    return updatedQuiz;
  }
  
  async deleteQuiz(id: number): Promise<boolean> {
    const result = await db.delete(educationalQuizzes)
      .where(eq(educationalQuizzes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Videos operations
  async getAllVideos(limit: number = 8): Promise<Video[]> {
    return db.select()
      .from(videos)
      .orderBy(desc(videos.publishedAt))
      .limit(limit);
  }
  
  async getVideoById(id: number): Promise<Video | undefined> {
    const videos_list = await db.select()
      .from(videos)
      .where(eq(videos.id, id));
    
    return videos_list[0];
  }
  
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const [video] = await db
      .insert(videos)
      .values({
        ...insertVideo,
        views: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return video;
  }
  
  async updateVideoViews(id: number): Promise<void> {
    await db
      .update(videos)
      .set({
        views: sql`${videos.views} + 1`
      })
      .where(eq(videos.id, id));
  }
  
  // Contact Messages operations
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return db.select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }
  
  async getContactMessageById(id: number): Promise<ContactMessage | undefined> {
    const messages = await db.select()
      .from(contactMessages)
      .where(eq(contactMessages.id, id));
    
    return messages[0];
  }
  
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values({
        ...message,
        isRead: false,
        createdAt: new Date()
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
    const result = await db.delete(contactMessages)
      .where(eq(contactMessages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Live Coverage operations
  async getAllLiveCoverages(): Promise<LiveCoverage[]> {
    return db.select()
      .from(liveCoverages)
      .orderBy(desc(liveCoverages.createdAt));
  }
  
  async getActiveLiveCoverages(): Promise<LiveCoverage[]> {
    return db.select()
      .from(liveCoverages)
      .where(eq(liveCoverages.active, true))
      .orderBy(desc(liveCoverages.createdAt));
  }
  
  async getLiveCoverageBySlug(slug: string): Promise<LiveCoverage | undefined> {
    const coverages = await db.select()
      .from(liveCoverages)
      .where(eq(liveCoverages.slug, slug));
    
    return coverages[0];
  }
  
  async getLiveCoverageById(id: number): Promise<LiveCoverage | undefined> {
    const coverages = await db.select()
      .from(liveCoverages)
      .where(eq(liveCoverages.id, id));
    
    return coverages[0];
  }
  
  async createLiveCoverage(coverage: InsertLiveCoverage): Promise<LiveCoverage> {
    const [newCoverage] = await db
      .insert(liveCoverages)
      .values({
        ...coverage,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return newCoverage;
  }
  
  async updateLiveCoverage(id: number, data: Partial<InsertLiveCoverage>): Promise<LiveCoverage | undefined> {
    const [updatedCoverage] = await db
      .update(liveCoverages)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(liveCoverages.id, id))
      .returning();
    
    return updatedCoverage;
  }
  
  async deleteLiveCoverage(id: number): Promise<boolean> {
    const result = await db.delete(liveCoverages)
      .where(eq(liveCoverages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Live Coverage Editors operations
  async getLiveCoverageEditors(coverageId: number): Promise<(LiveCoverageEditor & { editor?: any })[]> {
    const editors = await db.select()
      .from(liveCoverageEditors)
      .where(eq(liveCoverageEditors.coverageId, coverageId))
      .leftJoin(users, eq(liveCoverageEditors.editorId, users.id));
    
    return editors.map(editor => ({
      ...editor.live_coverage_editors,
      editor: editor.users ? {
        displayName: editor.users.displayName,
        title: editor.users.title,
        avatarUrl: editor.users.avatarUrl
      } : undefined
    }));
  }
  
  async addEditorToLiveCoverage(editor: InsertLiveCoverageEditor): Promise<LiveCoverageEditor> {
    const [newEditor] = await db
      .insert(liveCoverageEditors)
      .values(editor)
      .returning();
    
    return newEditor;
  }
  
  async removeEditorFromLiveCoverage(coverageId: number, editorId: number): Promise<boolean> {
    const result = await db.delete(liveCoverageEditors)
      .where(
        and(
          eq(liveCoverageEditors.coverageId, coverageId),
          eq(liveCoverageEditors.editorId, editorId)
        )
      );
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Live Coverage Updates operations
  async getLiveCoverageUpdates(coverageId: number): Promise<(LiveCoverageUpdate & { author?: any })[]> {
    const updates = await db.select()
      .from(liveCoverageUpdates)
      .where(eq(liveCoverageUpdates.coverageId, coverageId))
      .leftJoin(users, eq(liveCoverageUpdates.authorId, users.id))
      .orderBy(desc(liveCoverageUpdates.timestamp));
    
    return updates.map(update => ({
      ...update.live_coverage_updates,
      author: update.users ? {
        displayName: update.users.displayName,
        title: update.users.title,
        avatarUrl: update.users.avatarUrl
      } : undefined
    }));
  }
  
  async createLiveCoverageUpdate(update: InsertLiveCoverageUpdate): Promise<LiveCoverageUpdate> {
    const [newUpdate] = await db
      .insert(liveCoverageUpdates)
      .values({
        ...update,
        timestamp: new Date()
      })
      .returning();
    
    return newUpdate;
  }
  
  async deleteLiveCoverageUpdate(id: number): Promise<boolean> {
    const result = await db.delete(liveCoverageUpdates)
      .where(eq(liveCoverageUpdates.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Live Coverage Questions operations
  async getLiveCoverageQuestions(coverageId: number, status?: string): Promise<LiveCoverageQuestion[]> {
    let query = db.select()
      .from(liveCoverageQuestions)
      .where(eq(liveCoverageQuestions.coverageId, coverageId));
    
    if (status) {
      query = query.where(eq(liveCoverageQuestions.status, status));
    }
    
    return query.orderBy(desc(liveCoverageQuestions.timestamp));
  }
  
  async createLiveCoverageQuestion(question: InsertLiveCoverageQuestion): Promise<LiveCoverageQuestion> {
    const [newQuestion] = await db
      .insert(liveCoverageQuestions)
      .values({
        ...question,
        status: "pending",
        answered: false,
        timestamp: new Date()
      })
      .returning();
    
    return newQuestion;
  }
  
  async updateLiveCoverageQuestionStatus(id: number, status: string, answered: boolean = false): Promise<LiveCoverageQuestion | undefined> {
    const [updatedQuestion] = await db
      .update(liveCoverageQuestions)
      .set({ 
        status,
        answered
      })
      .where(eq(liveCoverageQuestions.id, id))
      .returning();
    
    return updatedQuestion;
  }
  
  async createAnswerToQuestion(
    questionId: number,
    coverageId: number,
    content: string,
    authorId: number,
    important: boolean = false
  ): Promise<LiveCoverageUpdate> {
    // Récupérer la question
    const [question] = await db.select()
      .from(liveCoverageQuestions)
      .where(eq(liveCoverageQuestions.id, questionId));
    
    // Marquer la question comme répondue
    await this.updateLiveCoverageQuestionStatus(questionId, "approved", true);
    
    // Créer la mise à jour avec la réponse
    const prefix = `<strong>Réponse à la question de ${question.username} :</strong> <em>${question.content}</em><br/><br/>`;
    
    const completeContent = prefix + content;
    
    return this.createLiveCoverageUpdate({
      coverageId,
      authorId,
      content: completeContent,
      important
    });
  }
  
  // Article Submissions operations
  async getAllArticleSubmissions(): Promise<ArticleSubmission[]> {
    return db.select()
      .from(articleSubmissions)
      .orderBy(desc(articleSubmissions.createdAt));
  }
  
  async getArticleSubmissionsByUser(userId: number): Promise<ArticleSubmission[]> {
    return db.select()
      .from(articleSubmissions)
      .where(eq(articleSubmissions.submittedBy, userId))
      .orderBy(desc(articleSubmissions.createdAt));
  }
  
  async getArticleSubmissionById(id: number): Promise<ArticleSubmission | undefined> {
    const submissions = await db.select()
      .from(articleSubmissions)
      .where(eq(articleSubmissions.id, id));
    return submissions[0];
  }
  
  async createArticleSubmission(submission: InsertArticleSubmission): Promise<ArticleSubmission> {
    const [newSubmission] = await db
      .insert(articleSubmissions)
      .values({
        ...submission,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return newSubmission;
  }
  
  async updateArticleSubmissionStatus(id: number, status: string, editorComments?: string, assignedTo?: number): Promise<ArticleSubmission | undefined> {
    const updateData: Record<string, any> = { 
      status,
      updatedAt: new Date()
    };
    
    if (editorComments !== undefined) {
      updateData.editorComments = editorComments;
    }
    
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo;
    }
    
    const [updatedSubmission] = await db
      .update(articleSubmissions)
      .set(updateData)
      .where(eq(articleSubmissions.id, id))
      .returning();
    return updatedSubmission;
  }
  
  async deleteArticleSubmission(id: number): Promise<boolean> {
    const result = await db
      .delete(articleSubmissions)
      .where(eq(articleSubmissions.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Initialize the database
async function initializeDb() {
  // Initialisation des catégories
  const categoriesCount = await db.select({ count: sql`count(*)` }).from(categories);
  
  if (!categoriesCount[0] || parseInt(categoriesCount[0].count.toString()) === 0) {
    console.log("Initializing categories...");
    await db.insert(categories).values([
      { name: "Politique", slug: "politique", description: "Actualités et analyses politiques" },
      { name: "Économie", slug: "economie", description: "Actualités et analyses économiques" },
      { name: "Société", slug: "societe", description: "Actualités et analyses sociales" }
    ]);
  }
  
  // Initialisation d'un utilisateur admin
  const usersCount = await db.select({ count: sql`count(*)` }).from(users);
  
  if (!usersCount[0] || parseInt(usersCount[0].count.toString()) === 0) {
    console.log("Initializing default admin user...");
    await db.insert(users).values({
      username: "admin",
      password: await hashPassword("adminpassword"), // A changer en production !
      displayName: "Admin",
      email: "admin@example.com",
      role: "admin",
      isTeamMember: true
    });
  }
}

// Initialiser spécifiquement les vidéos
async function initializeVideosOnly() {
  const videosCount = await db.select({ count: sql`count(*)` }).from(videos);
  
  if (!videosCount[0] || parseInt(videosCount[0].count.toString()) === 0) {
    console.log("Initializing sample videos...");
    await db.insert(videos).values([
      {
        title: "Introduction au système politique français",
        videoId: "RGsjQvEcUbQ",
        publishedAt: new Date('2023-01-15')
      },
      {
        title: "Comment fonctionne l'Union Européenne ?",
        videoId: "8G1cds52Ko0",
        publishedAt: new Date('2023-02-20')
      },
      {
        title: "Comprendre les élections présidentielles",
        videoId: "0AEfgGtGbNk",
        publishedAt: new Date('2023-03-10')
      }
    ]);
  }
}

// Initialiser les sujets éducatifs
async function initializeEducationalTopics() {
  const topicsCount = await db.select({ count: sql`count(*)` }).from(educationalTopics);
  
  if (!topicsCount[0] || parseInt(topicsCount[0].count.toString()) === 0) {
    console.log("Initializing educational topics...");
    await db.insert(educationalTopics).values([
      { 
        title: "Institutions françaises",
        slug: "institutions-francaises",
        description: "Tout sur le fonctionnement des institutions en France",
        imageUrl: "/images/topics/institutions.jpg",
        icon: "institution",
        color: "#2563EB",
        order: 1
      },
      { 
        title: "Union Européenne",
        slug: "union-europeenne",
        description: "Comprendre l'Union Européenne et son fonctionnement",
        imageUrl: "/images/topics/eu.jpg",
        icon: "eu",
        color: "#3B82F6",
        order: 2
      },
      { 
        title: "Économie",
        slug: "economie",
        description: "Bases de l'économie et concepts essentiels",
        imageUrl: "/images/topics/economy.jpg",
        icon: "chart-line",
        color: "#10B981",
        order: 3
      }
    ]);
  }
}

// Initialiser la base de données
initializeDb()
  .then(() => console.log("Database initialization complete or not needed"))
  .catch(err => console.error("Error initializing database:", err));

// Initialiser spécifiquement les vidéos
initializeVideosOnly()
  .then(() => console.log("Videos initialization complete or not needed"))
  .catch(err => console.error("Error initializing videos:", err));

// Initialiser les sujets éducatifs
initializeEducationalTopics()
  .then(() => console.log("Educational topics initialization complete or not needed"))
  .catch(err => console.error("Error initializing educational topics:", err));

export const storage = new DatabaseStorage();