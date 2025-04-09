// Implémentation des méthodes de suivi en direct pour DatabaseStorage

import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  liveCoverages, type LiveCoverage, type InsertLiveCoverage,
  liveCoverageEditors, type LiveCoverageEditor, type InsertLiveCoverageEditor,
  liveCoverageUpdates, type LiveCoverageUpdate, type InsertLiveCoverageUpdate,
  liveCoverageQuestions, type LiveCoverageQuestion, type InsertLiveCoverageQuestion,
  users
} from "@shared/schema";

// Live Coverage operations
export async function getAllLiveCoverages(): Promise<LiveCoverage[]> {
  return db.select().from(liveCoverages).orderBy(desc(liveCoverages.createdAt));
}

export async function getActiveLiveCoverages(): Promise<LiveCoverage[]> {
  return db.select().from(liveCoverages)
    .where(eq(liveCoverages.active, true))
    .orderBy(desc(liveCoverages.createdAt));
}

export async function getLiveCoverageBySlug(slug: string): Promise<LiveCoverage | undefined> {
  const [coverage] = await db.select().from(liveCoverages)
    .where(eq(liveCoverages.slug, slug));
  return coverage;
}

export async function getLiveCoverageById(id: number): Promise<LiveCoverage | undefined> {
  const [coverage] = await db.select().from(liveCoverages)
    .where(eq(liveCoverages.id, id));
  return coverage;
}

export async function createLiveCoverage(insertCoverage: InsertLiveCoverage): Promise<LiveCoverage> {
  const [coverage] = await db.insert(liveCoverages)
    .values({
      ...insertCoverage,
      imageUrl: insertCoverage.imageUrl || null,
    })
    .returning();
  return coverage;
}

export async function updateLiveCoverage(id: number, data: Partial<InsertLiveCoverage>): Promise<LiveCoverage | undefined> {
  const [coverage] = await db.select().from(liveCoverages)
    .where(eq(liveCoverages.id, id));
  
  if (!coverage) {
    return undefined;
  }
  
  const [updatedCoverage] = await db.update(liveCoverages)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(liveCoverages.id, id))
    .returning();
  
  return updatedCoverage;
}

export async function deleteLiveCoverage(id: number): Promise<boolean> {
  // D'abord supprimer les entrées liées dans la table des éditeurs
  await db.delete(liveCoverageEditors)
    .where(eq(liveCoverageEditors.coverageId, id));
  
  // Puis supprimer les mises à jour liées
  await db.delete(liveCoverageUpdates)
    .where(eq(liveCoverageUpdates.coverageId, id));
  
  // Enfin supprimer le suivi lui-même
  const result = await db.delete(liveCoverages)
    .where(eq(liveCoverages.id, id))
    .returning({ id: liveCoverages.id });
  
  return result.length > 0;
}

// Live Coverage Editors operations
export async function getLiveCoverageEditors(coverageId: number): Promise<(LiveCoverageEditor & { 
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

export async function addEditorToLiveCoverage(insertEditor: InsertLiveCoverageEditor): Promise<LiveCoverageEditor> {
  const [editor] = await db.insert(liveCoverageEditors)
    .values(insertEditor)
    .returning();
  return editor;
}

export async function removeEditorFromLiveCoverage(coverageId: number, editorId: number): Promise<boolean> {
  const result = await db.delete(liveCoverageEditors)
    .where(
      and(
        eq(liveCoverageEditors.coverageId, coverageId),
        eq(liveCoverageEditors.editorId, editorId)
      )
    )
    .returning({ id: liveCoverageEditors.id });
  
  return result.length > 0;
}

// Live Coverage Updates operations
export async function getLiveCoverageUpdates(coverageId: number): Promise<(LiveCoverageUpdate & {
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

export async function createLiveCoverageUpdate(insertUpdate: InsertLiveCoverageUpdate): Promise<LiveCoverageUpdate> {
  const [update] = await db.insert(liveCoverageUpdates)
    .values({
      ...insertUpdate,
      imageUrl: insertUpdate.imageUrl || null,
      important: insertUpdate.important || false
    })
    .returning();
  return update;
}

export async function deleteLiveCoverageUpdate(id: number): Promise<boolean> {
  const result = await db.delete(liveCoverageUpdates)
    .where(eq(liveCoverageUpdates.id, id))
    .returning({ id: liveCoverageUpdates.id });
  
  return result.length > 0;
}

// Live Coverage Questions operations
export async function getLiveCoverageQuestions(coverageId: number, status?: string): Promise<LiveCoverageQuestion[]> {
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

export async function createLiveCoverageQuestion(insertQuestion: InsertLiveCoverageQuestion): Promise<LiveCoverageQuestion> {
  const [question] = await db.insert(liveCoverageQuestions)
    .values({
      ...insertQuestion,
      timestamp: new Date(),
    })
    .returning();
  return question;
}

export async function updateLiveCoverageQuestionStatus(id: number, status: string, answered: boolean = false): Promise<LiveCoverageQuestion | undefined> {
  const [question] = await db.update(liveCoverageQuestions)
    .set({ 
      status, 
      answered,
      ...(answered ? { answered: true } : {})
    })
    .where(eq(liveCoverageQuestions.id, id))
    .returning();
  
  return question;
}

export async function createAnswerToQuestion(
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
  await updateLiveCoverageQuestionStatus(questionId, "approved", true);
  
  return update;
}