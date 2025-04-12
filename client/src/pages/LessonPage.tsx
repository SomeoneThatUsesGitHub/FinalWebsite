import React, { useState, useEffect } from 'react';
import { useRoute, Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Helmet } from 'react-helmet';
import { ChevronLeft, ChevronRight, Star, Clock, Award, CheckCircle, BookOpen, HelpCircle, AlertTriangle, Heart } from 'lucide-react';

// Types de contenu de leçon
interface LessonContent {
  id: number;
  type: 'text' | 'image' | 'video' | 'quiz' | 'interactive';
  content: any;
}

// Interface pour les questions de quiz
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Composant pour le contenu de type texte
const TextContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-blue max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

// Composant pour le contenu de type image
const ImageContent: React.FC<{ src: string; alt: string; caption?: string }> = ({ src, alt, caption }) => {
  return (
    <figure className="mb-6">
      <img src={src} alt={alt} className="w-full rounded-lg shadow-md" />
      {caption && <figcaption className="text-sm text-gray-500 mt-2 text-center">{caption}</figcaption>}
    </figure>
  );
};

// Composant pour le contenu de type vidéo
const VideoContent: React.FC<{ src: string; title: string }> = ({ src, title }) => {
  return (
    <div className="mb-6">
      <div className="aspect-w-16 aspect-h-9 mb-2">
        <iframe 
          src={src} 
          title={title} 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          className="w-full h-full rounded-lg shadow-md"
        ></iframe>
      </div>
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
    </div>
  );
};

// Composant pour le contenu de type quiz
const QuizContent: React.FC<{ 
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean) => void;
}> = ({ question, onAnswer }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  
  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };
  
  const handleSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    setIsAnswered(true);
    const isCorrect = selectedOption === question.correctAnswer;
    onAnswer(isCorrect);
    setShowExplanation(true);
  };
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{question.question}</h3>
      
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <div 
            key={index}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              isAnswered
                ? index === question.correctAnswer
                  ? 'bg-green-50 border-green-300'
                  : selectedOption === index
                    ? 'bg-red-50 border-red-300'
                    : 'border-gray-200'
                : selectedOption === index
                  ? 'bg-blue-50 border-blue-300'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
            }`}
            onClick={() => handleSelectOption(index)}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 h-6 w-6 rounded-full mr-3 flex items-center justify-center ${
                isAnswered
                  ? index === question.correctAnswer
                    ? 'bg-green-500 text-white'
                    : selectedOption === index
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  : selectedOption === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {String.fromCharCode(65 + index)}
              </div>
              <div className="text-gray-700">{option}</div>
            </div>
          </div>
        ))}
      </div>
      
      {showExplanation && (
        <div className={`p-4 rounded-lg mb-6 ${
          selectedOption === question.correctAnswer
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-start">
            <div className={`flex-shrink-0 p-1 rounded-full mr-3 ${
              selectedOption === question.correctAnswer
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            }`}>
              {selectedOption === question.correctAnswer
                ? <CheckCircle className="h-5 w-5" />
                : <AlertTriangle className="h-5 w-5" />
              }
            </div>
            <div>
              <h4 className={`font-semibold ${
                selectedOption === question.correctAnswer
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {selectedOption === question.correctAnswer
                  ? 'Bonne réponse !'
                  : 'Réponse incorrecte'
                }
              </h4>
              <p className="text-gray-700 mt-1">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button 
          className={`px-6 py-2 rounded-lg font-medium ${
            selectedOption === null || isAnswered
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          onClick={handleSubmit}
          disabled={selectedOption === null || isAnswered}
        >
          Valider
        </button>
      </div>
    </div>
  );
};

// Composant pour afficher la barre de progression
const ProgressBar: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Progression</span>
        <span className="text-sm font-medium text-gray-800">{currentStep}/{totalSteps}</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-blue-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        ></motion.div>
      </div>
    </div>
  );
};

// Composant principal pour une leçon
const LessonPage: React.FC = () => {
  const [match, params] = useRoute('/apprendre/:courseSlug/lecon/:lessonId');
  const courseSlug = params?.courseSlug || '';
  const lessonId = params?.lessonId ? parseInt(params.lessonId) : 0;
  const [, navigate] = useLocation();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [userScore, setUserScore] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [heartCount, setHeartCount] = useState(3); // Vies restantes (comme Duolingo)
  
  // Données simulées pour la leçon
  const lessonData = {
    id: lessonId,
    title: "Histoire de l'Assemblée Nationale",
    courseSlug: "assemblee-nationale",
    duration: "15 min",
    points: 20,
    content: [
      {
        id: 1,
        type: 'text' as const,
        content: `
          <h2>Les origines de l'Assemblée Nationale</h2>
          <p>L'Assemblée nationale française est née officiellement le 17 juin 1789, lorsque les députés du tiers état se sont proclamés "Assemblée nationale" pendant la Révolution française.</p>
          <p>C'est le résultat direct des États généraux convoqués par Louis XVI pour résoudre la crise financière que traversait le royaume. Les députés du tiers état, rejoints par quelques membres du clergé et de la noblesse, ont décidé de se constituer en une assemblée représentant la nation tout entière.</p>
        `
      },
      {
        id: 2,
        type: 'image' as const,
        content: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Le_Serment_du_Jeu_de_paume.jpg/800px-Le_Serment_du_Jeu_de_paume.jpg",
          alt: "Le Serment du Jeu de paume",
          caption: "Le Serment du Jeu de paume par Jacques-Louis David, un moment fondateur dans l'histoire de l'Assemblée nationale."
        }
      },
      {
        id: 3,
        type: 'text' as const,
        content: `
          <h2>L'évolution au fil des régimes</h2>
          <p>L'Assemblée nationale a connu de nombreuses transformations au cours de l'histoire de France :</p>
          <ul>
            <li>Sous la Révolution : Assemblée nationale constituante (1789-1791) puis Assemblée législative (1791-1792)</li>
            <li>Sous la Convention nationale (1792-1795)</li>
            <li>Sous le Directoire : Conseil des Cinq-Cents (1795-1799)</li>
            <li>Sous le Second Empire : Corps législatif (1852-1870)</li>
            <li>Sous la IIIe République : Chambre des députés (1870-1940)</li>
            <li>Sous la IVe République : Assemblée nationale (1946-1958)</li>
            <li>Sous la Ve République : Assemblée nationale (depuis 1958)</li>
          </ul>
        `
      },
      {
        id: 4,
        type: 'quiz' as const,
        content: {
          id: 1,
          question: "Quand l'Assemblée nationale française a-t-elle été officiellement créée ?",
          options: [
            "Le 14 juillet 1789, jour de la prise de la Bastille",
            "Le 17 juin 1789, lorsque les députés du tiers état se sont autoproclamés Assemblée nationale",
            "Le 26 août 1789, jour de la Déclaration des droits de l'homme et du citoyen",
            "Le 4 août 1789, nuit de l'abolition des privilèges"
          ],
          correctAnswer: 1,
          explanation: "L'Assemblée nationale a été officiellement créée le 17 juin 1789 lorsque les députés du tiers état, rejoints par quelques membres du clergé et de la noblesse, ont décidé de se constituer en une assemblée représentant la nation tout entière."
        }
      },
      {
        id: 5,
        type: 'text' as const,
        content: `
          <h2>L'Assemblée nationale sous la Ve République</h2>
          <p>Depuis 1958 et l'avènement de la Ve République, l'Assemblée nationale constitue, avec le Sénat, le Parlement français. Elle est composée de 577 députés élus pour un mandat de cinq ans au suffrage universel direct.</p>
          <p>Ses principales missions sont :</p>
          <ul>
            <li>Voter les lois</li>
            <li>Contrôler l'action du gouvernement</li>
            <li>Évaluer les politiques publiques</li>
          </ul>
          <p>L'Assemblée nationale siège au Palais Bourbon, situé sur le quai d'Orsay à Paris, face à la place de la Concorde.</p>
        `
      },
      {
        id: 6,
        type: 'image' as const,
        content: {
          src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Paris_-_Palais_Bourbon_-_Assemblée_nationale_-_façade_-_2064.jpg/800px-Paris_-_Palais_Bourbon_-_Assemblée_nationale_-_façade_-_2064.jpg",
          alt: "Le Palais Bourbon",
          caption: "Le Palais Bourbon, siège de l'Assemblée nationale française depuis 1798."
        }
      },
      {
        id: 7,
        type: 'quiz' as const,
        content: {
          id: 2,
          question: "Combien de députés siègent à l'Assemblée nationale sous la Ve République ?",
          options: [
            "348 députés",
            "577 députés",
            "925 députés",
            "434 députés"
          ],
          correctAnswer: 1,
          explanation: "Depuis la réforme de 2010, l'Assemblée nationale est composée de 577 députés (575 pour la France métropolitaine et d'outre-mer, plus 2 pour les Français établis hors de France). Avant cette réforme, il y avait 576 députés."
        }
      }
    ],
    nextLessonId: 102,
    prevLessonId: null
  };
  
  // Gérer la navigation entre les étapes
  const goToNextStep = () => {
    if (currentStep < lessonData.content.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      completeLesson();
    }
  };
  
  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Marquer la leçon comme terminée
  const completeLesson = () => {
    setLessonCompleted(true);
    // Ici, on pourrait envoyer une requête à l'API pour marquer la leçon comme terminée
  };
  
  // Gérer les réponses aux quiz
  const handleQuizAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setUserScore(userScore + 5);
    } else {
      // Réduire le nombre de vies, comme dans Duolingo
      setHeartCount(Math.max(0, heartCount - 1));
    }
  };
  
  // Récupérer le contenu actuel
  const currentContent = lessonData.content[currentStep - 1];
  
  // Si on a épuisé toutes les vies
  if (heartCount === 0) {
    return (
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vous avez épuisé toutes vos vies !</h2>
          <p className="text-gray-600 mb-6">Il semble que cette leçon soit un peu difficile. Pourquoi ne pas réviser le contenu et réessayer ?</p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
            <button
              onClick={() => {
                setHeartCount(3);
                setCurrentStep(1);
                setUserScore(0);
              }}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Recommencer la leçon
            </button>
            <Link href={`/apprendre/${courseSlug}`}>
              <a className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                Retour au cours
              </a>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // Si la leçon est terminée
  if (lessonCompleted) {
    return (
      <motion.div
        variants={pageTransition}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="container mx-auto px-4 py-12"
      >
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Félicitations !</h2>
          <p className="text-lg text-gray-700 mb-4">Vous avez terminé la leçon "{lessonData.title}"</p>
          <div className="flex justify-center items-center mb-6">
            <Star className="h-6 w-6 text-amber-500 fill-current" />
            <span className="ml-2 text-xl font-bold text-amber-500">{userScore} points gagnés</span>
          </div>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 justify-center">
            {lessonData.nextLessonId && (
              <button
                onClick={() => navigate(`/apprendre/${courseSlug}/lecon/${lessonData.nextLessonId}`)}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Leçon suivante
              </button>
            )}
            <Link href={`/apprendre/${courseSlug}`}>
              <a className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                Retour au cours
              </a>
            </Link>
          </div>
        </div>
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
        <title>{lessonData.title} | Apprendre | Politiquensemble</title>
        <meta name="description" content={`Leçon sur ${lessonData.title}`} />
      </Helmet>
      
      {/* En-tête fixe */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <Link href={`/apprendre/${courseSlug}`}>
              <a className="text-gray-600 hover:text-gray-800 flex items-center">
                <ChevronLeft className="h-5 w-5 mr-1" />
                Retour au cours
              </a>
            </Link>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-red-500">
                <Heart className="h-5 w-5 mr-1 fill-current" />
                <span className="font-medium">{heartCount}</span>
              </div>
              <div className="flex items-center text-amber-500">
                <Star className="h-5 w-5 mr-1 fill-current" />
                <span className="font-medium">{userScore}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{lessonData.title}</h1>
          
          <ProgressBar currentStep={currentStep} totalSteps={lessonData.content.length} />
          
          {/* Affichage du contenu selon son type */}
          {currentContent.type === 'text' && (
            <TextContent content={currentContent.content} />
          )}
          
          {currentContent.type === 'image' && (
            <ImageContent 
              src={currentContent.content.src} 
              alt={currentContent.content.alt} 
              caption={currentContent.content.caption} 
            />
          )}
          
          {currentContent.type === 'quiz' && (
            <QuizContent 
              question={currentContent.content} 
              onAnswer={handleQuizAnswer} 
            />
          )}
          
          {/* Boutons de navigation */}
          <div className="flex justify-between mt-10">
            <button
              onClick={goToPrevStep}
              className={`flex items-center px-5 py-2 rounded-lg font-medium ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Précédent
            </button>
            
            <button
              onClick={goToNextStep}
              className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {currentStep === lessonData.content.length ? 'Terminer' : 'Suivant'}
              <ChevronRight className="h-5 w-5 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LessonPage;