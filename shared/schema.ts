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
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // presidential, legislative, local, etc.
  results: json("results").notNull(),
  description: text("description"),
  upcoming: boolean("upcoming").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertElectionSchema = createInsertSchema(elections).pick({
  country: true,
  countryCode: true,
  title: true,
  date: true,
  type: true,
  results: true,
  description: true,
  upcoming: true,
});

// Educational Content schema - for the "Learn" section
export const educationalContent = pgTable("educational_content", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  content: text("content"),
  categoryId: integer("category_id").references(() => categories.id),
  likes: integer("likes").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEducationalContentSchema = createInsertSchema(educationalContent).pick({
  title: true,
  imageUrl: true,
  content: true,
  categoryId: true,
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
