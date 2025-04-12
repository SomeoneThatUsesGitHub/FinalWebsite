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

      {/* Bannière en entête - plus compacte sur mobile */}
      <div className="bg-blue-600 text-white py-6 sm:py-10 mb-6 sm:mb-8 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <Link href="/cours">
            <a className="inline-flex items-center text-white hover:text-blue-200 transition-colors mb-3">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Retour aux cours</span>
            </a>
          </Link>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3"
          >
            {courseData.course.title}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-base sm:text-lg text-blue-100 max-w-3xl line-clamp-3 sm:line-clamp-none"
          >
            {courseData.course.description}
          </motion.p>
          
          {courseData.course.author && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 sm:mt-6 flex items-center"
            >
              <div className="bg-white/20 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-lg sm:text-xl font-bold text-white">
                {courseData.course.author.displayName.charAt(0)}
              </div>
              <div className="ml-2 sm:ml-3">
                <div className="font-medium text-sm sm:text-base">{courseData.course.author.displayName}</div>
                {courseData.course.author.title && (
                  <div className="text-xs sm:text-sm text-blue-200">{courseData.course.author.title}</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Éléments décoratifs */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute right-[-10%] top-[-10%] w-1/2 h-1/2 rounded-full bg-blue-400"></div>
          <div className="absolute left-[-5%] bottom-[-10%] w-1/3 h-1/3 rounded-full bg-blue-300"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 sm:pb-16">
        {/* Contenu principal: sommaire à gauche, leçon à droite */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Menu des chapitres mobile - visible uniquement sur petits écrans */}
          <div className="block sm:hidden p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-blue-700 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Navigation
              </h2>
              
              {currentChapter && (
                <div className="text-sm text-gray-600">
                  {currentLesson && (
                    <span className="font-medium">
                      {currentChapter.title} - Leçon {currentLessonIndex + 1}/{currentChapter.lessons.length}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Menu déroulant pour sélectionner les chapitres et leçons */}
            <div className="mt-3">
              <select 
                className="w-full p-2 border border-gray-300 rounded-md"
                value={`${currentChapterIndex ?? 0}-${currentLessonIndex ?? 0}`}
                onChange={(e) => {
                  const [chapterIdx, lessonIdx] = e.target.value.split('-').map(Number);
                  setCurrentChapterIndex(chapterIdx);
                  setCurrentLessonIndex(lessonIdx);
                }}
              >
                {courseData.chapters.map((chapter, chapIdx) => 
                  chapter.lessons.map((lesson, lessIdx) => (
                    <option key={`${chapIdx}-${lessIdx}`} value={`${chapIdx}-${lessIdx}`}>
                      {chapter.title} - {lesson.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row">
            {/* Sidebar - Navigation des chapitres et leçons - caché sur mobile */}
            <div className="hidden sm:block sm:w-1/3 lg:w-1/4 bg-gray-50 p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-gray-200">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Sommaire
              </h2>
              
              {courseData.chapters.length === 0 ? (
                <div className="p-4 bg-blue-50 rounded-md text-blue-700">
                  Aucun chapitre disponible
                </div>
              ) : (
                <div className="space-y-5">
                  {courseData.chapters.map((chapter, chapterIdx) => (
                    <div key={chapter.id} className="space-y-2">
                      <button 
                        className={`w-full text-left font-medium flex items-center transition-colors ${
                          currentChapterIndex === chapterIdx 
                            ? 'text-blue-700' 
                            : 'text-gray-700 hover:text-blue-600'
                        }`}
                        onClick={() => {
                          setCurrentChapterIndex(chapterIdx);
                          if (chapter.lessons.length > 0) {
                            setCurrentLessonIndex(0);
                          }
                        }}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full mr-2 sm:mr-3 text-xs font-bold ${
                          currentChapterIndex === chapterIdx 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {chapter.order}
                        </span>
                        <span className="flex-grow">{chapter.title}</span>
                      </button>
                      
                      {chapter.lessons.length > 0 && (
                        <div className="ml-8 sm:ml-9 pl-3 sm:pl-4 border-l-2 border-gray-200 space-y-1 sm:space-y-2">
                          {chapter.lessons.map((lesson, lessonIdx) => (
                            <button 
                              key={lesson.id}
                              className={`block w-full text-sm text-left py-1 px-2 sm:px-3 rounded transition-colors ${
                                currentChapterIndex === chapterIdx && currentLessonIndex === lessonIdx 
                                  ? 'bg-blue-50 text-blue-700 font-medium' 
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                              }`}
                              onClick={() => {
                                setCurrentChapterIndex(chapterIdx);
                                setCurrentLessonIndex(lessonIdx);
                              }}
                            >
                              {lesson.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Contenu principal - Leçon */}
            <div className="sm:w-2/3 lg:w-3/4 p-4 sm:p-6 md:p-8">
              {currentLesson ? (
                <motion.div
                  key={`lesson-${currentLesson.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200">
                    {currentLesson.title}
                  </h2>
                  
                  <div 
                    className="prose prose-sm sm:prose prose-blue max-w-none lesson-content"
                    dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                  />
                  
                  <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                    <button 
                      className="px-3 sm:px-5 py-2 sm:py-2.5 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={currentLessonIndex === 0 && currentChapterIndex === 0}
                      onClick={goToPrevLesson}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1 sm:mr-2" />
                      <span className="sm:inline">Leçon précédente</span>
                      <span className="inline sm:hidden">Précédent</span>
                    </button>
                    
                    <button 
                      className="px-3 sm:px-5 py-2 sm:py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      disabled={
                        currentChapterIndex === courseData.chapters.length - 1 && 
                        currentLessonIndex === (currentChapter?.lessons.length || 0) - 1
                      }
                      onClick={goToNextLesson}
                    >
                      <span className="sm:inline">Leçon suivante</span>
                      <span className="inline sm:hidden">Suivant</span>
                      <ChevronLeft className="h-4 w-4 ml-1 sm:ml-2 transform rotate-180" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <p className="text-base sm:text-lg text-center px-4">Sélectionnez une leçon dans le sommaire pour commencer</p>
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