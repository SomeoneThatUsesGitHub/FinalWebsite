import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Helmet } from 'react-helmet';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Types pour les données de cours provenant de notre API
interface Lesson {
  id: number;
  title: string;
  content: string;
  order: number;
  chapterId: number;
}

interface Chapter {
  id: number;
  title: string;
  order: number;
  courseId: number;
  lessons: Lesson[];
}

interface CourseData {
  course: {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    published: boolean;
    authorId: number;
    author?: {
      displayName: string;
      title: string | null;
    };
  };
  chapters: Chapter[];
}

const CourseDetailPage: React.FC = () => {
  const [, params] = useRoute<{ slug: string }>('/cours/:slug');
  const slug = params?.slug || '';
  
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number | null>(null);

  // Fetch course data using the slug
  const { data: courseData, isLoading, error } = useQuery<CourseData>({
    queryKey: [`/api/courses/${slug}`],
    enabled: !!slug,
  });

  // Reset lesson selection when course or chapter changes
  useEffect(() => {
    if (courseData && courseData.chapters.length > 0 && currentChapterIndex === null) {
      setCurrentChapterIndex(0);
      
      if (courseData.chapters[0].lessons.length > 0) {
        setCurrentLessonIndex(0);
      }
    }
  }, [courseData, currentChapterIndex]);

  // Get current chapter and lesson
  const currentChapter = currentChapterIndex !== null && courseData?.chapters ? 
    courseData.chapters[currentChapterIndex] : null;
  
  const currentLesson = currentChapter && currentLessonIndex !== null && currentChapter.lessons ? 
    currentChapter.lessons[currentLessonIndex] : null;

  // Navigation functions
  const goToNextLesson = () => {
    if (!currentChapter || currentLessonIndex === null) return;
    
    if (currentLessonIndex < currentChapter.lessons.length - 1) {
      // Next lesson in current chapter
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else if (currentChapterIndex !== null && currentChapterIndex < (courseData?.chapters.length || 0) - 1) {
      // First lesson of next chapter
      setCurrentChapterIndex(currentChapterIndex + 1);
      setCurrentLessonIndex(0);
    }
  };

  const goToPrevLesson = () => {
    if (currentLessonIndex === null || currentChapterIndex === null) return;
    
    if (currentLessonIndex > 0) {
      // Previous lesson in current chapter
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentChapterIndex > 0) {
      // Last lesson of previous chapter
      const prevChapter = courseData?.chapters[currentChapterIndex - 1];
      if (prevChapter) {
        setCurrentChapterIndex(currentChapterIndex - 1);
        setCurrentLessonIndex(prevChapter.lessons.length - 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-blue-600 font-medium">Chargement du cours...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur lors du chargement du cours</h3>
              <p className="mt-2 text-sm text-red-700">
                {error instanceof Error ? error.message : "Impossible de charger les données du cours. Veuillez réessayer ultérieurement."}
              </p>
              <div className="mt-4">
                <Link href="/cours">
                  <a className="text-sm font-medium text-red-800 hover:underline">
                    Retour à la liste des cours
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 max-w-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Cours non trouvé</h3>
              <p className="mt-2 text-sm text-blue-700">
                Ce cours n'existe pas ou n'est pas disponible actuellement.
              </p>
              <div className="mt-4">
                <Link href="/cours">
                  <a className="text-sm font-medium text-blue-800 hover:underline">
                    Voir tous les cours disponibles
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      key="course-detail"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="bg-gray-50 min-h-screen"
    >
      <Helmet>
        <title>{courseData.course.title} | Politiquensemble</title>
        <meta name="description" content={courseData.course.description} />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/cours">
            <a className="inline-flex items-center text-blue-600 hover:text-blue-800">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Retour aux cours</span>
            </a>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{courseData.course.title}</h1>
          <p className="text-gray-600 mt-2">{courseData.course.description}</p>
          
          {courseData.course.author && (
            <div className="mt-4 text-sm text-gray-600">
              <span>Par </span>
              <span className="font-medium">{courseData.course.author.displayName}</span>
              {courseData.course.author.title && (
                <span>, {courseData.course.author.title}</span>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Navigation des chapitres et leçons */}
            <div className="bg-gray-50 p-4 border-r border-gray-200 md:min-h-[600px]">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Sommaire</h2>
              
              {courseData.chapters.length === 0 ? (
                <p className="text-gray-500">Aucun chapitre disponible</p>
              ) : (
                <div className="space-y-4">
                  {courseData.chapters.map((chapter, chapterIdx) => (
                    <div key={chapter.id} className="space-y-2">
                      <h3 
                        className={`font-medium flex items-center cursor-pointer ${
                          currentChapterIndex === chapterIdx ? 'text-blue-600' : 'text-gray-700'
                        }`}
                        onClick={() => {
                          setCurrentChapterIndex(chapterIdx);
                          if (chapter.lessons.length > 0) {
                            setCurrentLessonIndex(0);
                          }
                        }}
                      >
                        <span className="bg-blue-100 text-blue-800 w-6 h-6 flex items-center justify-center rounded-full mr-2 text-xs font-bold">
                          {chapter.order}
                        </span>
                        {chapter.title}
                      </h3>
                      
                      {chapter.lessons.length > 0 && (
                        <ul className="pl-8 space-y-1">
                          {chapter.lessons.map((lesson, lessonIdx) => (
                            <li key={lesson.id}>
                              <button 
                                className={`text-sm hover:text-blue-600 text-left ${
                                  currentChapterIndex === chapterIdx && currentLessonIndex === lessonIdx 
                                    ? 'text-blue-600 font-medium' 
                                    : 'text-gray-600'
                                }`}
                                onClick={() => {
                                  setCurrentChapterIndex(chapterIdx);
                                  setCurrentLessonIndex(lessonIdx);
                                }}
                              >
                                {lesson.title}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Contenu de la leçon */}
            <div className="p-6 md:col-span-3">
              {currentLesson ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentLesson.title}</h2>
                  
                  <div 
                    className="prose max-w-none lesson-content"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                  
                  <div className="mt-8 flex justify-between">
                    <button 
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={currentLessonIndex === 0 && currentChapterIndex === 0}
                      onClick={goToPrevLesson}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </button>
                    
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        currentChapterIndex === courseData.chapters.length - 1 && 
                        currentLessonIndex === (currentChapter?.lessons.length || 0) - 1
                      }
                      onClick={goToNextLesson}
                    >
                      Suivant
                      <ChevronLeft className="h-4 w-4 ml-1 transform rotate-180" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">Sélectionnez une leçon pour commencer</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseDetailPage;