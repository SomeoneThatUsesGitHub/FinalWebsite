import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, Star, Clock, Award, CheckCircle, BookOpen, Target } from 'lucide-react';
import { Link } from 'wouter';

// Interface pour les leçons
interface Lesson {
  id: number;
  title: string;
  type: 'lecture' | 'quiz' | 'interactive';
  completed: boolean;
  duration: string;
  points: number;
  description: string;
}

// Interface pour les sections
interface Section {
  id: number;
  title: string;
  lessons: Lesson[];
  completed: boolean;
}

// Composant pour le module individuel (leçon)
const LessonCard: React.FC<{ lesson: Lesson; courseSlug: string; sectionId: number; onClick: () => void }> = ({ 
  lesson, 
  courseSlug,
  sectionId,
  onClick 
}) => {
  const iconMap = {
    'lecture': <BookOpen className="h-5 w-5" />,
    'quiz': <Target className="h-5 w-5" />,
    'interactive': <BookOpen className="h-5 w-5" />
  };

  return (
    <motion.div
      className={`relative flex flex-col p-5 rounded-xl shadow-sm border ${
        lesson.completed ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
      } hover:shadow-md transition-all duration-300 cursor-pointer`}
      whileHover={{ y: -5 }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${
            lesson.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
          }`}>
            {lesson.completed ? <CheckCircle className="h-5 w-5" /> : iconMap[lesson.type]}
          </div>
          <h3 className="font-medium text-gray-800">{lesson.title}</h3>
        </div>
        
        {lesson.completed && (
          <div className="bg-green-500 text-white text-xs py-1 px-2 rounded-full">
            Complété
          </div>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{lesson.description}</p>
      
      <div className="flex justify-between items-center mt-auto text-sm">
        <div className="flex items-center text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>{lesson.duration}</span>
        </div>
        
        <div className="flex items-center text-amber-500">
          <Star className="h-4 w-4 mr-1 fill-current" />
          <span>{lesson.points} pts</span>
        </div>
      </div>
      
      {lesson.completed && (
        <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
      )}
    </motion.div>
  );
};

// Composant pour l'affichage des sections de cours
const SectionAccordion: React.FC<{ 
  section: Section; 
  isOpen: boolean; 
  toggleOpen: () => void;
  courseSlug: string;
  navigate: (path: string) => void;
}> = ({ section, isOpen, toggleOpen, courseSlug, navigate }) => {
  const completedLessons = section.lessons.filter(lesson => lesson.completed).length;
  const progress = (completedLessons / section.lessons.length) * 100;
  
  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <div 
        className={`flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors ${section.completed ? 'bg-green-50' : ''}`}
        onClick={toggleOpen}
      >
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${section.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            {section.completed ? <CheckCircle className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{section.title}</h3>
            <p className="text-xs text-gray-500">{completedLessons} sur {section.lessons.length} modules complétés</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="h-2 w-24 bg-gray-200 rounded-full mr-3 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          {isOpen ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
        </div>
      </div>
      
      {isOpen && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {section.lessons.map((lesson) => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              courseSlug={courseSlug}
              sectionId={section.id}
              onClick={() => navigate(`/apprendre/${courseSlug}/lecon/${lesson.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Composant pour la barre de progression
const ProgressBar: React.FC<{ course: any; sections: Section[] }> = ({ course, sections }) => {
  const totalLessons = sections.reduce((total, section) => total + section.lessons.length, 0);
  const completedLessons = sections.reduce((total, section) => 
    total + section.lessons.filter(lesson => lesson.completed).length, 0);
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">Votre progression</h3>
        <div className="text-sm text-gray-600">{completedLessons}/{totalLessons} modules</div>
      </div>
      
      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        ></motion.div>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center">
          <Award className="h-5 w-5 text-amber-500 mr-1" />
          <span className="text-sm text-gray-600">Points gagnés: {completedLessons * 10}</span>
        </div>
        
        {progress === 100 && (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-1" />
            <span className="text-sm font-semibold">Cours complété !</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant principal pour les détails du cours
const CourseDetailPage: React.FC = () => {
  const [match, params] = useRoute('/apprendre/:courseSlug');
  const courseSlug = params?.courseSlug || '';
  const [openSectionId, setOpenSectionId] = useState<number | null>(1);
  const [, navigate] = useLocation();

  // Exemple de données de cours (À remplacer par des données réelles à l'avenir)
  const courseData: {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: string;
    level: string;
    duration: string;
    image: string;
    sections: Section[];
  } = {
    id: 1,
    title: "L'Assemblée Nationale",
    slug: "assemblee-nationale",
    description: "Découvrez le fonctionnement et le rôle de l'Assemblée Nationale dans la démocratie française.",
    category: "Institutions",
    level: "Débutant",
    duration: "2h",
    image: "https://via.placeholder.com/800x400",
    sections: [
      {
        id: 1,
        title: "Introduction à l'Assemblée Nationale",
        completed: false,
        lessons: [
          {
            id: 101,
            title: "Histoire de l'Assemblée Nationale",
            type: 'lecture',
            completed: true,
            duration: "15 min",
            points: 10,
            description: "Découvrez comment l'Assemblée Nationale a évolué depuis la Révolution française."
          },
          {
            id: 102,
            title: "Rôle constitutionnel",
            type: 'lecture',
            completed: false,
            duration: "10 min",
            points: 10,
            description: "Comprendre le rôle de l'Assemblée dans la Constitution de la Ve République."
          },
          {
            id: 103,
            title: "Quiz - Introduction",
            type: 'quiz',
            completed: false,
            duration: "5 min",
            points: 15,
            description: "Testez vos connaissances sur les fondamentaux de l'Assemblée Nationale."
          }
        ]
      },
      {
        id: 2,
        title: "Fonctionnement et Organisation",
        completed: false,
        lessons: [
          {
            id: 201,
            title: "Les députés",
            type: 'lecture',
            completed: false,
            duration: "12 min",
            points: 10,
            description: "Qui sont les députés et comment sont-ils élus?"
          },
          {
            id: 202,
            title: "Les commissions parlementaires",
            type: 'lecture',
            completed: false,
            duration: "10 min",
            points: 10,
            description: "Fonctionnement et rôle des commissions parlementaires."
          },
          {
            id: 203,
            title: "Le processus législatif",
            type: 'interactive',
            completed: false,
            duration: "20 min",
            points: 20,
            description: "Apprenez comment une loi est créée et adoptée à l'Assemblée."
          }
        ]
      },
      {
        id: 3,
        title: "Applications pratiques",
        completed: false,
        lessons: [
          {
            id: 301,
            title: "Étude de cas - Une loi récente",
            type: 'lecture',
            completed: false,
            duration: "15 min",
            points: 15,
            description: "Analysez le parcours d'une loi récemment adoptée."
          },
          {
            id: 302,
            title: "Quiz final",
            type: 'quiz',
            completed: false,
            duration: "10 min",
            points: 25,
            description: "Évaluez votre compréhension globale du fonctionnement de l'Assemblée Nationale."
          }
        ]
      }
    ]
  };

  // Trouver le cours correspondant au slug (simulation)
  const course = courseData.slug === courseSlug ? courseData : null;
  
  // Gérer le changement de section ouverte
  const toggleSection = (sectionId: number) => {
    setOpenSectionId(openSectionId === sectionId ? null : sectionId);
  };

  // Si le cours n'est pas trouvé
  if (!course) {
    return (
      <motion.div 
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="container mx-auto px-4 py-12 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Cours non trouvé</h1>
        <p className="text-gray-600 mb-6">Le cours que vous recherchez n'existe pas ou a été déplacé.</p>
        <Link href="/apprendre">
          <a className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Retour aux cours
          </a>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>{course.title} | Apprendre | Politiquensemble</title>
        <meta name="description" content={course.description} />
      </Helmet>
      
      {/* En-tête du cours */}
      <div className="bg-blue-600 text-white py-10 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="md:w-2/3">
              <Link href="/apprendre">
                <a className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors">
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Retour aux cours
                </a>
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
              <p className="text-blue-100 mb-4">{course.description}</p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="bg-blue-700 rounded-full px-3 py-1 text-sm font-medium">
                  {course.category}
                </div>
                <div className="bg-blue-700 rounded-full px-3 py-1 text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.duration}
                </div>
                <div className="bg-blue-700 rounded-full px-3 py-1 text-sm font-medium">
                  Niveau: {course.level}
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 md:w-1/3 flex justify-center md:justify-end">
              <motion.button
                className="bg-white text-blue-600 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Trouver la première leçon non complétée
                  for (const section of course.sections) {
                    for (const lesson of section.lessons) {
                      if (!lesson.completed) {
                        navigate(`/apprendre/${course.slug}/lecon/${lesson.id}`);
                        return;
                      }
                    }
                  }
                  // Si tout est complété, commencer par la première leçon
                  navigate(`/apprendre/${course.slug}/lecon/${course.sections[0].lessons[0].id}`);
                }}
              >
                Commencer
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-10">
        {/* Barre de progression */}
        <ProgressBar course={course} sections={course.sections} />
        
        {/* Sections du cours */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Modules du cours</h2>
          
          {course.sections.map((section) => (
            <SectionAccordion
              key={section.id}
              section={section}
              isOpen={openSectionId === section.id}
              toggleOpen={() => toggleSection(section.id)}
              courseSlug={course.slug}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Icônes pour l'accordéon
const ChevronDown: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronUp: React.FC<{ className?: string }> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

export default CourseDetailPage;