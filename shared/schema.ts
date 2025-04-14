import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema - for admin functionality
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("editor"),
  avatarUrl: text("avatar_url"),
  title: text("title"),  // Grade (Journaliste politique, éditeur, etc.)
  bio: text("bio"),      // Courte biographie
  isTeamMember: boolean("is_team_member").default(false),  // Indique si l'utilisateur doit être affiché dans l'équipe
  // Colonnes des réseaux sociaux supprimées
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  role: true,
  avatarUrl: true,
  title: true,
  bio: true,
  isTeamMember: true,
  // Champs des réseaux sociaux supprimés
});

// Category schema - for categorizing content
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  color: text("color").notNull().default("#FF4D4D"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  color: true,
});

// Articles schema - for main content
export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url"),
  sources: text("sources"), // Ajout du champ pour les sources de l'article
  authorId: integer("author_id").references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
  published: boolean("published").notNull().default(true),
  featured: boolean("featured").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertArticleSchema = createInsertSchema(articles).pick({
  title: true,
  slug: true,
  content: true,
  excerpt: true,
  imageUrl: true,
  sources: true, // Ajout du champ sources au schéma d'insertion
  authorId: true,
  categoryId: true,
  published: true,
  featured: true,
});

// News Updates schema - for breaking news and ticker items
export const newsUpdates = pgTable("news_updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  icon: text("icon"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertNewsUpdateSchema = createInsertSchema(newsUpdates).pick({
  title: true,
  content: true,
  icon: true,
  active: true,
});

// Flash Info schema - for breaking news alerts
export const flashInfos = pgTable("flash_infos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  url: text("url"), // URL pour le lien "En savoir plus"
  active: boolean("active").notNull().default(true),
  priority: integer("priority").notNull().default(1), // Higher value = higher priority
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFlashInfoSchema = createInsertSchema(flashInfos).pick({
  title: true,
  content: true,
  imageUrl: true,
  url: true,
  active: true,
  priority: true,
  categoryId: true,
});

// Live Broadcasts schema - for live announcements
export const liveEvents = pgTable("live_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  liveUrl: text("live_url"), // URL for the live stream or embed
  active: boolean("active").notNull().default(false),
  scheduledFor: timestamp("scheduled_for"),
  categoryId: integer("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLiveEventSchema = createInsertSchema(liveEvents).pick({
  title: true,
  description: true,
  imageUrl: true,
  liveUrl: true,
  active: true,
  scheduledFor: true,
  categoryId: true,
});

// Elections schema - for election data
export const elections = pgTable("elections", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  countryCode: text("country_code").notNull(),
  title: text("title").notNull(),
  date: text("date").notNull(), // Maintenant une chaîne de caractères
  type: text("type").notNull(), // presidential, legislative, local, etc.
  results: json("results").notNull(),
  description: text("description"),
  upcoming: boolean("upcoming").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Création du schéma de base
const baseInsertElectionSchema = createInsertSchema(elections).pick({
  country: true,
  countryCode: true,
  title: true,
  date: true,
  type: true,
  results: true,
  description: true,
  upcoming: true,
});

// Modification du schéma pour accepter une chaîne de texte
export const insertElectionSchema = baseInsertElectionSchema.extend({
  // Accepter une chaîne de caractères pour la date
  date: z.string().min(1, "La date est requise"),
});

// Educational Topics schema - for main topics in the "Learn" section
export const educationalTopics = pgTable("educational_topics", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  icon: text("icon"), // Icône pour représenter le sujet (nom de l'icône Lucide-React)
  color: text("color").notNull().default("#3B82F6"), // Couleur d'accentuation
  order: integer("order").notNull().default(0), // Pour ordonner les sujets
  authorId: integer("author_id").references(() => users.id), // Auteur du sujet
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEducationalTopicSchema = createInsertSchema(educationalTopics).pick({
  title: true,
  slug: true,
  description: true,
  imageUrl: true,
  icon: true,
  color: true,
  order: true,
  authorId: true,
});

// Educational Content schema - for specific lessons within topics
export const educationalContent = pgTable("educational_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  summary: text("summary").notNull(), // Résumé court du contenu
  imageUrl: text("image_url").notNull(),
  topicId: integer("topic_id").references(() => educationalTopics.id).notNull(),
  authorId: integer("author_id").references(() => users.id),
  published: boolean("published").notNull().default(true),
  likes: integer("likes").notNull().default(0),
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertEducationalContentSchema = createInsertSchema(educationalContent).pick({
  title: true,
  slug: true,
  content: true,
  summary: true,
  imageUrl: true,
  topicId: true,
  authorId: true,
  published: true,
});

// Define exported types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type NewsUpdate = typeof newsUpdates.$inferSelect;
export type InsertNewsUpdate = z.infer<typeof insertNewsUpdateSchema>;

export type FlashInfo = typeof flashInfos.$inferSelect;
export type InsertFlashInfo = z.infer<typeof insertFlashInfoSchema>;

export type LiveEvent = typeof liveEvents.$inferSelect;
export type InsertLiveEvent = z.infer<typeof insertLiveEventSchema>;

export type Election = typeof elections.$inferSelect;
export type InsertElection = z.infer<typeof insertElectionSchema>;

export type EducationalTopic = typeof educationalTopics.$inferSelect;
export type InsertEducationalTopic = z.infer<typeof insertEducationalTopicSchema>;

export type EducationalContent = typeof educationalContent.$inferSelect;
export type InsertEducationalContent = z.infer<typeof insertEducationalContentSchema>;

// Video model (YouTube shorts)
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  videoId: text("video_id").notNull(), // YouTube video ID
  views: integer("views").default(0),
  publishedAt: timestamp("published_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  title: true,
  videoId: true,
  views: true,
  publishedAt: true,
});

export type Video = typeof videos.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;

// Suivi en direct (Live Coverage) schema
export const liveCoverages = pgTable("live_coverages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  subject: text("subject").notNull(),
  context: text("context").default(""), // Rendu optionnel
  imageUrl: text("image_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertLiveCoverageSchema = createInsertSchema(liveCoverages).pick({
  title: true,
  slug: true,
  subject: true,
  context: true,
  imageUrl: true,
  active: true,
});

// Équipe de rédacteurs pour chaque suivi en direct
export const liveCoverageEditors = pgTable("live_coverage_editors", {
  id: serial("id").primaryKey(),
  coverageId: integer("coverage_id").notNull().references(() => liveCoverages.id),
  editorId: integer("editor_id").notNull().references(() => users.id),
  role: text("role"), // Rôle spécifique pour ce suivi (optionnel)
});

export const insertLiveCoverageEditorSchema = createInsertSchema(liveCoverageEditors).pick({
  coverageId: true,
  editorId: true,
  role: true,
});

// Questions des visiteurs pour un suivi en direct
export const liveCoverageQuestions = pgTable("live_coverage_questions", {
  id: serial("id").primaryKey(),
  coverageId: integer("coverage_id").notNull().references(() => liveCoverages.id),
  username: text("username").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  answered: boolean("answered").default(false),
});

export const insertLiveCoverageQuestionSchema = createInsertSchema(liveCoverageQuestions).pick({
  coverageId: true,
  username: true,
  content: true,
  status: true,
});

// Mises à jour en direct pour chaque suivi
export const liveCoverageUpdates = pgTable("live_coverage_updates", {
  id: serial("id").primaryKey(),
  coverageId: integer("coverage_id").notNull().references(() => liveCoverages.id),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  imageUrl: text("image_url"),
  important: boolean("important").default(false),
  // Pour les réponses aux questions
  isAnswer: boolean("is_answer").default(false),
  questionId: integer("question_id").references(() => liveCoverageQuestions.id),
  // Nouveaux types de contenu et leur type
  updateType: text("update_type").default("normal"),
  youtubeUrl: text("youtube_url"),
  articleId: integer("article_id").references(() => articles.id),
  electionResults: text("election_results"),
});

export const insertLiveCoverageUpdateSchema = createInsertSchema(liveCoverageUpdates).pick({
  coverageId: true,
  content: true,
  authorId: true,
  timestamp: true,
  imageUrl: true,
  important: true,
  isAnswer: true,
  questionId: true,
  updateType: true,
  youtubeUrl: true,
  articleId: true,
  electionResults: true,
});

export type LiveCoverage = typeof liveCoverages.$inferSelect;
export type InsertLiveCoverage = z.infer<typeof insertLiveCoverageSchema>;

export type LiveCoverageEditor = typeof liveCoverageEditors.$inferSelect;
export type InsertLiveCoverageEditor = z.infer<typeof insertLiveCoverageEditorSchema>;

export type LiveCoverageQuestion = typeof liveCoverageQuestions.$inferSelect;
export type InsertLiveCoverageQuestion = z.infer<typeof insertLiveCoverageQuestionSchema>;

export type LiveCoverageUpdate = typeof liveCoverageUpdates.$inferSelect;
export type InsertLiveCoverageUpdate = z.infer<typeof insertLiveCoverageUpdateSchema>;

// Schéma pour les abonnés à la newsletter
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  subscriptionDate: timestamp("subscription_date").defaultNow().notNull(),
  active: boolean("active").default(true).notNull(),
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).pick({
  email: true,
  active: true,
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;

// Schéma pour les candidatures d'équipe
export const teamApplications = pgTable("team_applications", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  position: text("position").notNull(), // Poste souhaité
  message: text("message").notNull(),
  cvUrl: text("cv_url"), // Lien vers CV (optionnel)
  status: text("status").notNull().default("pending"), // pending, reviewed, accepted, rejected
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  notes: text("notes"), // Notes internes pour les administrateurs
});

export const insertTeamApplicationSchema = createInsertSchema(teamApplications).pick({
  fullName: true,
  email: true,
  phone: true,
  position: true,
  message: true,
  cvUrl: true,
});

export type TeamApplication = typeof teamApplications.$inferSelect;
export type InsertTeamApplication = z.infer<typeof insertTeamApplicationSchema>;

// Schéma pour les messages de contact
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
  assignedTo: integer("assigned_to").references(() => users.id),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Glossaire politique - termes et définitions
export const politicalGlossary = pgTable('political_glossary', {
  id: serial('id').primaryKey(),
  term: text('term').notNull().unique(),
  definition: text('definition').notNull(),
  examples: text('examples'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertPoliticalGlossarySchema = createInsertSchema(politicalGlossary);

// Quiz pour contenu éducatif
export const educationalQuizzes = pgTable('educational_quizzes', {
  id: serial('id').primaryKey(),
  contentId: integer('content_id').references(() => educationalContent.id).notNull(),
  question: text('question').notNull(),
  option1: text('option1').notNull(),
  option2: text('option2').notNull(),
  option3: text('option3').notNull(),
  correctOption: integer('correct_option').notNull(), // 1, 2 ou 3
  explanation: text('explanation'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertEducationalQuizSchema = createInsertSchema(educationalQuizzes).pick({
  contentId: true,
  question: true,
  option1: true,
  option2: true,
  option3: true,
  correctOption: true,
  explanation: true,
});

export type EducationalQuiz = typeof educationalQuizzes.$inferSelect;
export type InsertEducationalQuiz = z.infer<typeof insertEducationalQuizSchema>;

export type PoliticalGlossaryTerm = typeof politicalGlossary.$inferSelect;
export type InsertPoliticalGlossaryTerm = z.infer<typeof insertPoliticalGlossarySchema>;

// Schema pour les réactions d'élections
export const electionReactions = pgTable("election_reactions", {
  id: serial("id").primaryKey(),
  electionId: integer("election_id").notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertElectionReactionSchema = createInsertSchema(electionReactions).pick({
  electionId: true,
  author: true,
  content: true,
});

export type InsertElectionReaction = z.infer<typeof insertElectionReactionSchema>;
export type ElectionReaction = typeof electionReactions.$inferSelect;

// Alertes pour la bannière d'en-tête de la page d'accueil
export const siteAlerts = pgTable("site_alerts", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  priority: integer("priority").notNull().default(1), // Plus la valeur est élevée, plus l'alerte est prioritaire
  backgroundColor: text("background_color").notNull().default("#dc2626"), // Couleur d'arrière-plan par défaut (rouge)
  textColor: text("text_color").notNull().default("#ffffff"), // Couleur de texte par défaut (blanc)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").references(() => users.id),
});

export const insertSiteAlertSchema = createInsertSchema(siteAlerts).pick({
  content: true,
  active: true,
  priority: true,
  backgroundColor: true,
  textColor: true,
  createdBy: true,
});

export type SiteAlert = typeof siteAlerts.$inferSelect;
export type InsertSiteAlert = z.infer<typeof insertSiteAlertSchema>;
