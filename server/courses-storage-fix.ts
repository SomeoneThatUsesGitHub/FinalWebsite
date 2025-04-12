// Voici les implémentations correctes de stockage pour les cours éducatifs

import { 
  courses, type Course, type InsertCourse,
  chapters, type Chapter, type InsertChapter,
  lessons, type Lesson, type InsertLesson,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Courses operations
export async function getAllCourses(showUnpublished: boolean = false): Promise<(Course & { author?: { displayName: string, title: string | null } })[]> {
  const query = db.select({
    course: courses,
    author: {
      displayName: users.displayName,
      title: users.title
    }
  })
  .from(courses)
  .leftJoin(users, eq(courses.authorId, users.id));
  
  if (!showUnpublished) {
    query.where(eq(courses.published, true));
  }
  
  query.orderBy(desc(courses.createdAt));
  
  const results = await query;
  
  return results.map(row => {
    const authorData = row.author && row.author.displayName ? row.author : undefined;
    return {
      ...row.course,
      author: authorData
    };
  });
}

export async function getCourseById(id: number): Promise<(Course & { author?: { displayName: string, title: string | null } }) | undefined> {
  const results = await db.select({
    course: courses,
    author: {
      displayName: users.displayName,
      title: users.title
    }
  })
  .from(courses)
  .leftJoin(users, eq(courses.authorId, users.id))
  .where(eq(courses.id, id));
  
  if (results.length === 0) {
    return undefined;
  }
  
  const row = results[0];
  const authorData = row.author && row.author.displayName ? row.author : undefined;
  
  return {
    ...row.course,
    author: authorData
  };
}

export async function getCourseBySlug(slug: string): Promise<(Course & { author?: { displayName: string, title: string | null } }) | undefined> {
  const results = await db.select({
    course: courses,
    author: {
      displayName: users.displayName,
      title: users.title
    }
  })
  .from(courses)
  .leftJoin(users, eq(courses.authorId, users.id))
  .where(eq(courses.slug, slug));
  
  if (results.length === 0) {
    return undefined;
  }
  
  const row = results[0];
  const authorData = row.author && row.author.displayName ? row.author : undefined;
  
  return {
    ...row.course,
    author: authorData
  };
}

export async function createCourse(course: InsertCourse): Promise<Course> {
  const [newCourse] = await db
    .insert(courses)
    .values(course)
    .returning();
  return newCourse;
}

export async function updateCourse(id: number, courseData: Partial<InsertCourse>): Promise<Course | undefined> {
  const [updatedCourse] = await db
    .update(courses)
    .set(courseData)
    .where(eq(courses.id, id))
    .returning();
  return updatedCourse;
}

export async function deleteCourse(id: number): Promise<boolean> {
  // Les chapitres et leçons seront supprimés automatiquement grâce à ON DELETE CASCADE
  const result = await db.delete(courses).where(eq(courses.id, id));
  return result.rowCount ? result.rowCount > 0 : false;
}

// Chapters operations
export async function getChaptersByCourseId(courseId: number): Promise<Chapter[]> {
  return db
    .select()
    .from(chapters)
    .where(eq(chapters.courseId, courseId))
    .orderBy(chapters.order);
}

export async function getChapterById(id: number): Promise<Chapter | undefined> {
  const [chapter] = await db
    .select()
    .from(chapters)
    .where(eq(chapters.id, id));
  return chapter;
}

export async function createChapter(chapter: InsertChapter): Promise<Chapter> {
  const [newChapter] = await db
    .insert(chapters)
    .values(chapter)
    .returning();
  return newChapter;
}

export async function updateChapter(id: number, chapterData: Partial<InsertChapter>): Promise<Chapter | undefined> {
  const [updatedChapter] = await db
    .update(chapters)
    .set(chapterData)
    .where(eq(chapters.id, id))
    .returning();
  return updatedChapter;
}

export async function deleteChapter(id: number): Promise<boolean> {
  // Les leçons seront supprimées automatiquement grâce à ON DELETE CASCADE
  const result = await db.delete(chapters).where(eq(chapters.id, id));
  return result.rowCount ? result.rowCount > 0 : false;
}

// Lessons operations
export async function getLessonsByChapterId(chapterId: number): Promise<Lesson[]> {
  return db
    .select()
    .from(lessons)
    .where(eq(lessons.chapterId, chapterId))
    .orderBy(lessons.order);
}

export async function getLessonById(id: number): Promise<Lesson | undefined> {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id));
  return lesson;
}

export async function createLesson(lesson: InsertLesson): Promise<Lesson> {
  const [newLesson] = await db
    .insert(lessons)
    .values(lesson)
    .returning();
  return newLesson;
}

export async function updateLesson(id: number, lessonData: Partial<InsertLesson>): Promise<Lesson | undefined> {
  const [updatedLesson] = await db
    .update(lessons)
    .set(lessonData)
    .where(eq(lessons.id, id))
    .returning();
  return updatedLesson;
}

export async function deleteLesson(id: number): Promise<boolean> {
  const result = await db.delete(lessons).where(eq(lessons.id, id));
  return result.rowCount ? result.rowCount > 0 : false;
}

// Méthode spéciale pour récupérer toutes les données d'un cours
export async function getFullCourseDataBySlug(slug: string): Promise<{
  course: Course & { author?: { displayName: string, title: string | null } };
  chapters: (Chapter & { lessons: Lesson[] })[];
} | undefined> {
  // Récupérer le cours avec les détails de l'auteur
  const courseData = await getCourseBySlug(slug);
  if (!courseData) {
    return undefined;
  }
  
  // Récupérer tous les chapitres du cours
  const chaptersData = await getChaptersByCourseId(courseData.id);
  
  // Pour chaque chapitre, récupérer les leçons
  const chaptersWithLessons = await Promise.all(
    chaptersData.map(async (chapter) => {
      const lessonsList = await getLessonsByChapterId(chapter.id);
      return {
        ...chapter,
        lessons: lessonsList
      };
    })
  );
  
  return {
    course: courseData,
    chapters: chaptersWithLessons
  };
}

export async function getFullCourseData(courseId: number): Promise<{
  course: Course & { author?: { displayName: string, title: string | null } };
  chapters: (Chapter & { lessons: Lesson[] })[];
} | undefined> {
  // Récupérer le cours avec les détails de l'auteur
  const courseData = await getCourseById(courseId);
  if (!courseData) {
    return undefined;
  }
  
  // Récupérer tous les chapitres du cours
  const chaptersData = await getChaptersByCourseId(courseId);
  
  // Pour chaque chapitre, récupérer les leçons
  const chaptersWithLessons = await Promise.all(
    chaptersData.map(async (chapter) => {
      const lessonsList = await getLessonsByChapterId(chapter.id);
      return {
        ...chapter,
        lessons: lessonsList
      };
    })
  );
  
  return {
    course: courseData,
    chapters: chaptersWithLessons
  };
}