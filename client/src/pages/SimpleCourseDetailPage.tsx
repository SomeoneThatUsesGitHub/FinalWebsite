import React, { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Helmet } from 'react-helmet';
import { ChevronLeft } from 'lucide-react';

// Types pour les chapitres et leçons
interface Lesson {
  id: number;
  title: string;
  content: string;
}

interface Chapter {
  id: number;
  title: string;
  lessons: Lesson[];
}

// Données d'exemple pour un cours
const courseData = {
  id: 1,
  title: "L'Assemblée Nationale",
  slug: "assemblee-nationale",
  description: "Découvrez le fonctionnement et le rôle de l'Assemblée Nationale dans la démocratie française.",
  category: "Institutions",
  chapters: [
    {
      id: 1,
      title: "Introduction à l'Assemblée Nationale",
      lessons: [
        {
          id: 101,
          title: "Histoire de l'Assemblée Nationale",
          content: `
            <h2>Les origines de l'Assemblée Nationale</h2>
            <p>L'Assemblée nationale française est née officiellement le 17 juin 1789, lorsque les députés du tiers état se sont proclamés "Assemblée nationale" pendant la Révolution française.</p>
            <p>C'est le résultat direct des États généraux convoqués par Louis XVI pour résoudre la crise financière que traversait le royaume. Les députés du tiers état, rejoints par quelques membres du clergé et de la noblesse, ont décidé de se constituer en une assemblée représentant la nation tout entière.</p>
            
            <h2>Le Serment du Jeu de paume</h2>
            <p>Le 20 juin 1789, les députés se réunissent dans la salle du Jeu de paume à Versailles et jurent de ne pas se séparer avant d'avoir doté la France d'une Constitution. C'est le célèbre "Serment du Jeu de paume", immortalisé par le peintre Jacques-Louis David.</p>
            
            <div class="text-center my-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Le_Serment_du_Jeu_de_paume.jpg/800px-Le_Serment_du_Jeu_de_paume.jpg" alt="Le Serment du Jeu de paume" class="mx-auto max-w-full rounded-lg shadow-md" />
              <p class="text-sm text-gray-600 mt-2">Le Serment du Jeu de paume par Jacques-Louis David, un moment fondateur dans l'histoire de l'Assemblée nationale.</p>
            </div>
          `
        },
        {
          id: 102,
          title: "Rôle constitutionnel",
          content: `
            <h2>Le rôle de l'Assemblée Nationale dans la Constitution</h2>
            <p>Dans le cadre de la Ve République, l'Assemblée nationale exerce trois fonctions principales :</p>
            
            <h3>1. La fonction législative</h3>
            <p>L'Assemblée nationale vote les lois, soit sur proposition du gouvernement (projets de loi), soit à l'initiative des parlementaires eux-mêmes (propositions de loi). Elle a le dernier mot en cas de désaccord avec le Sénat, ce qui lui confère une position prééminente dans le processus législatif.</p>
            
            <h3>2. La fonction de contrôle</h3>
            <p>L'Assemblée nationale contrôle l'action du gouvernement par différents moyens :</p>
            <ul>
              <li>Questions au gouvernement</li>
              <li>Commissions d'enquête</li>
              <li>Motion de censure</li>
              <li>Contrôle de l'application des lois</li>
            </ul>
            
            <h3>3. L'évaluation des politiques publiques</h3>
            <p>Depuis la révision constitutionnelle de 2008, l'Assemblée nationale a également pour mission d'évaluer les politiques publiques. Elle vérifie leur efficacité, leur coût et leur pertinence.</p>
            
            <div class="bg-blue-50 p-4 rounded-lg my-4">
              <p class="font-semibold">Article 24 de la Constitution</p>
              <p>"Le Parlement vote la loi. Il contrôle l'action du Gouvernement. Il évalue les politiques publiques."</p>
            </div>
          `
        }
      ]
    },
    {
      id: 2,
      title: "Fonctionnement et Organisation",
      lessons: [
        {
          id: 201,
          title: "Les députés",
          content: `
            <h2>Les députés de l'Assemblée Nationale</h2>
            <p>L'Assemblée nationale comprend 577 députés élus pour un mandat de 5 ans au suffrage universel direct.</p>
            
            <h3>Mode d'élection</h3>
            <p>Les députés sont élus au scrutin uninominal majoritaire à deux tours dans le cadre de circonscriptions. La France métropolitaine et d'outre-mer est divisée en 577 circonscriptions :</p>
            <ul>
              <li>556 circonscriptions pour la France métropolitaine</li>
              <li>10 circonscriptions pour les DOM-TOM</li>
              <li>11 circonscriptions pour les Français établis hors de France</li>
            </ul>
            
            <h3>Statut du député</h3>
            <p>Le statut de député confère plusieurs droits et devoirs :</p>
            <ul>
              <li><strong>Immunité parlementaire</strong> : protection contre certaines poursuites judiciaires pendant l'exercice de leur mandat</li>
              <li><strong>Indemnité parlementaire</strong> : rémunération mensuelle (environ 7.200 euros bruts)</li>
              <li><strong>Non-cumul des mandats</strong> : depuis 2017, un député ne peut plus cumuler son mandat avec une fonction exécutive locale</li>
            </ul>
            
            <div class="text-center my-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5d/Hemicycle_of_the_National_Assembly_of_France%2C_27_November_2021.jpg" alt="Hémicycle de l'Assemblée nationale" class="mx-auto max-w-full rounded-lg shadow-md" />
              <p class="text-sm text-gray-600 mt-2">L'hémicycle de l'Assemblée nationale au Palais Bourbon</p>
            </div>
          `
        },
        {
          id: 202,
          title: "Les commissions parlementaires",
          content: `
            <h2>Les commissions parlementaires</h2>
            <p>Pour organiser efficacement son travail, l'Assemblée nationale est divisée en plusieurs commissions permanentes. Ces commissions jouent un rôle crucial dans l'examen des projets et propositions de loi avant leur discussion en séance plénière.</p>
            
            <h3>Les huit commissions permanentes</h3>
            <p>Depuis la révision constitutionnelle de 2008, l'Assemblée nationale compte huit commissions permanentes :</p>
            <ol>
              <li>Commission des affaires culturelles et de l'éducation</li>
              <li>Commission des affaires économiques</li>
              <li>Commission des affaires étrangères</li>
              <li>Commission des affaires sociales</li>
              <li>Commission de la défense nationale et des forces armées</li>
              <li>Commission du développement durable et de l'aménagement du territoire</li>
              <li>Commission des finances, de l'économie générale et du contrôle budgétaire</li>
              <li>Commission des lois constitutionnelles, de la législation et de l'administration générale de la République</li>
            </ol>
            
            <h3>Commissions spéciales et commissions d'enquête</h3>
            <p>En plus des commissions permanentes, l'Assemblée nationale peut créer :</p>
            <ul>
              <li><strong>Des commissions spéciales</strong> pour l'examen d'un projet ou d'une proposition de loi particulière</li>
              <li><strong>Des commissions d'enquête</strong> pour recueillir des informations sur des faits déterminés et formuler des conclusions</li>
            </ul>
            
            <div class="bg-yellow-50 p-4 rounded-lg my-4 border-l-4 border-yellow-400">
              <p class="font-semibold">À noter :</p>
              <p>Chaque député est membre d'une commission permanente, et une seule. La composition des commissions respecte la configuration politique de l'Assemblée.</p>
            </div>
          `
        }
      ]
    }
  ]
};

const SimpleCourseDetailPage: React.FC = () => {
  const [match, params] = useRoute('/apprendre/:courseSlug');
  const courseSlug = params?.courseSlug || '';
  const [activeChapterId, setActiveChapterId] = useState(1);
  const [activeLessonId, setActiveLessonId] = useState(101);
  
  // Trouver le cours correspondant au slug (simulation)
  const course = courseData.slug === courseSlug ? courseData : null;
  
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
  
  // Trouver le chapitre et la leçon actifs
  const activeChapter = course.chapters.find(chapter => chapter.id === activeChapterId);
  const activeLesson = activeChapter?.lessons.find(lesson => lesson.id === activeLessonId);

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-gray-50"
    >
      <Helmet>
        <title>{course.title} | Apprendre | Politiquensemble</title>
        <meta name="description" content={course.description} />
      </Helmet>
      
      {/* En-tête du cours */}
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <Link href="/apprendre">
            <a className="inline-flex items-center text-blue-100 hover:text-white mb-2 transition-colors">
              <ChevronLeft className="h-5 w-5 mr-1" />
              Retour aux cours
            </a>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
          <p className="text-blue-100 mt-1">{course.description}</p>
        </div>
      </div>
      
      {/* Contenu principal - Layout à deux colonnes */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Colonne de gauche - Liste des chapitres et leçons */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Sommaire</h2>
              
              <div className="space-y-4">
                {course.chapters.map((chapter) => (
                  <div key={chapter.id} className="space-y-2">
                    <h3 
                      className="font-medium text-gray-700 cursor-pointer hover:text-blue-600"
                      onClick={() => setActiveChapterId(chapter.id)}
                    >
                      {chapter.title}
                    </h3>
                    
                    {activeChapterId === chapter.id && (
                      <ul className="pl-4 space-y-1 border-l-2 border-gray-200">
                        {chapter.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            <button
                              className={`text-left text-sm w-full py-1 px-2 rounded ${
                                activeLessonId === lesson.id
                                  ? 'bg-blue-50 text-blue-600 font-medium'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                              onClick={() => setActiveLessonId(lesson.id)}
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
            </div>
          </div>
          
          {/* Colonne de droite - Contenu de la leçon */}
          <div className="md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeLesson ? (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b">
                    {activeLesson.title}
                  </h2>
                  
                  <div className="prose prose-blue max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                  </div>
                  
                  <div className="mt-8 flex justify-between">
                    <button
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      onClick={() => {
                        // Logique pour trouver la leçon précédente
                        const currentChapterIndex = course.chapters.findIndex(c => c.id === activeChapterId);
                        const currentLessonIndex = course.chapters[currentChapterIndex].lessons.findIndex(l => l.id === activeLessonId);
                        
                        if (currentLessonIndex > 0) {
                          // Leçon précédente dans le même chapitre
                          setActiveLessonId(course.chapters[currentChapterIndex].lessons[currentLessonIndex - 1].id);
                        } else if (currentChapterIndex > 0) {
                          // Dernière leçon du chapitre précédent
                          const prevChapter = course.chapters[currentChapterIndex - 1];
                          setActiveChapterId(prevChapter.id);
                          setActiveLessonId(prevChapter.lessons[prevChapter.lessons.length - 1].id);
                        }
                      }}
                    >
                      Précédent
                    </button>
                    
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => {
                        // Logique pour trouver la leçon suivante
                        const currentChapterIndex = course.chapters.findIndex(c => c.id === activeChapterId);
                        const currentLessonIndex = course.chapters[currentChapterIndex].lessons.findIndex(l => l.id === activeLessonId);
                        
                        if (currentLessonIndex < course.chapters[currentChapterIndex].lessons.length - 1) {
                          // Leçon suivante dans le même chapitre
                          setActiveLessonId(course.chapters[currentChapterIndex].lessons[currentLessonIndex + 1].id);
                        } else if (currentChapterIndex < course.chapters.length - 1) {
                          // Première leçon du chapitre suivant
                          const nextChapter = course.chapters[currentChapterIndex + 1];
                          setActiveChapterId(nextChapter.id);
                          setActiveLessonId(nextChapter.lessons[0].id);
                        }
                      }}
                    >
                      Suivant
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

export default SimpleCourseDetailPage;