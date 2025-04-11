import React from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Helmet } from "react-helmet";

// Animation avec effet de rebond
const fadeInWithBounce = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.175, 0.885, 0.32, 1.5], // Effet de rebond accentué
      bounce: 0.4,
      type: "spring",
      stiffness: 120
    }
  }
};

// Animation pour les cartes de cours
const cardAnimation = {
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -8,
    scale: 1.03,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

// Interface pour les catégories
interface CourseCategory {
  id: number;
  name: string;
  icon: string;
}

// Catégories de cours
const courseCategories: CourseCategory[] = [
  { id: 1, name: "Institutions", icon: "🏛️" },
  { id: 2, name: "Personnalités", icon: "👥" },
  { id: 3, name: "Événements", icon: "📅" },
  { id: 4, name: "Concepts", icon: "💡" }
];

// Interface pour les cours
interface Course {
  id: number;
  title: string;
  category: string;
  description: string;
  level: string;
  duration: string;
}

// Exemple de cours pour la maquette
const sampleCourses: Course[] = [
  {
    id: 1,
    title: "L'Assemblée Nationale",
    category: "Institutions",
    description: "Découvrez le fonctionnement et le rôle de l'Assemblée Nationale dans la démocratie française.",
    level: "Débutant",
    duration: "20 min"
  },
  {
    id: 2,
    title: "Le Sénat",
    category: "Institutions",
    description: "Comprendre la chambre haute du Parlement français et son importance.",
    level: "Débutant",
    duration: "15 min"
  },
  {
    id: 3,
    title: "Emmanuel Macron",
    category: "Personnalités",
    description: "Parcours et politique du Président de la République française.",
    level: "Intermédiaire",
    duration: "25 min"
  },
  {
    id: 4,
    title: "La Ve République",
    category: "Concepts",
    description: "Les principes fondamentaux du régime politique français actuel.",
    level: "Intermédiaire",
    duration: "30 min"
  },
  {
    id: 5,
    title: "Mai 68",
    category: "Événements",
    description: "L'histoire et les conséquences des événements de Mai 68 en France.",
    level: "Avancé",
    duration: "25 min"
  },
  {
    id: 6,
    title: "L'Union Européenne",
    category: "Institutions",
    description: "Structure, fonctionnement et influence de l'UE dans la politique française.",
    level: "Intermédiaire",
    duration: "35 min"
  }
];

const CourseCard: React.FC<{ course: Course; index: number }> = ({ course, index }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
      variants={cardAnimation}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ delay: index * 0.1 }}
    >
      <div className="h-3 bg-blue-500"></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {course.category}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{course.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {course.duration}
          </span>
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {course.level}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const LearnPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState<number | null>(null);
  
  const filteredCourses = activeCategory 
    ? sampleCourses.filter(course => course.category === courseCategories.find(cat => cat.id === activeCategory)?.name)
    : sampleCourses;

  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>Apprendre | Politiquensemble</title>
        <meta name="description" content="Des cours et ressources pour comprendre la politique, les institutions, et les personnalités qui façonnent notre paysage politique." />
      </Helmet>
      
      <div className="bg-blue-50 py-12 md:py-20 shadow-md mb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              variants={fadeInWithBounce}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative"
            >
              Apprendre
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 0.3, duration: 0.5 } 
              }}
              className="h-1 w-20 bg-blue-500 mx-auto rounded-full"
            ></motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { delay: 0.4, duration: 0.5 } 
              }}
              className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Explorez notre répertoire de cours et ressources pédagogiques pour comprendre
              les institutions, les personnalités et les événements politiques qui façonnent notre société.
            </motion.p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 mb-16">
        {/* Catégories */}
        <motion.div 
          className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.5 } }}
        >
          <motion.button
            onClick={() => setActiveCategory(null)}
            className={`px-5 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
              activeCategory === null 
                ? "bg-blue-600 text-white shadow-md" 
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Tous
          </motion.button>
          
          {courseCategories.map((category, index) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                activeCategory === category.id 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </motion.div>
        
        {/* Grille de cours */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredCourses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
        
        {filteredCourses.length === 0 && (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
          >
            <p className="text-gray-500 text-lg">Aucun cours trouvé dans cette catégorie.</p>
          </motion.div>
        )}
      </div>
      
      {/* Section suggestion de thèmes - Effet carnet de notes */}
      <div className="py-12 mt-8 bg-repeat" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0V0zm1 1v98h98V1H1zm9 9h80v80H10V10zm1 1v78h78V11H11z' fill='%23e0e0e0' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundColor: "#f8f9fa" 
      }}>
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-lg border-t-4 border-blue-500 relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            style={{ 
              backgroundImage: `repeating-linear-gradient(0deg, #cbd5e1, #cbd5e1 1px, transparent 1px, transparent 24px),
                              repeating-linear-gradient(90deg, #cbd5e1, #cbd5e1 1px, white 1px, white 24px)`,
              backgroundSize: "25px 25px",
              backgroundPosition: "0 5px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.5)"
            }}
          >
            {/* Trombone décoratif */}
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-8 h-16">
              <div className="w-5 h-10 border-l-2 border-t-2 border-r-2 border-gray-400 rounded-t-lg mx-auto"></div>
              <div className="w-8 h-4 bg-gray-400 rounded-b-lg mx-auto"></div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2 text-center mt-4">Un sujet à suggérer ?</h2>
            <p className="text-gray-600 mb-6 text-center">
              Vous souhaitez en apprendre plus sur un thème particulier ? Proposez-nous vos idées !
            </p>
            
            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Votre nom</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Comment vous appelez-vous ?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Votre email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Où pouvons-nous vous répondre ?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">Catégorie de sujet</label>
                <select
                  id="theme"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  <option value="institutions">Institutions</option>
                  <option value="personnalites">Personnalités</option>
                  <option value="evenements">Événements</option>
                  <option value="concepts">Concepts</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700">Votre suggestion</label>
                <textarea
                  id="suggestion"
                  rows={5}
                  placeholder="Décrivez le sujet qui vous intéresse..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                ></textarea>
              </div>
              
              <div className="flex justify-center">
                <motion.button
                  type="button"
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Envoyer ma suggestion
                </motion.button>
              </div>
            </form>
            
            {/* Badge NEW */}
            <div className="absolute -top-3 -right-3 h-8 w-8 bg-red-500 rounded-full flex items-center justify-center transform rotate-12 shadow-md">
              <span className="text-white text-xs font-bold">NEW</span>
            </div>
            
            {/* Coin replié */}
            <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[40px] border-r-[40px] border-b-blue-100 border-r-blue-100 shadow-inner"></div>
            <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[35px] border-l-[35px] border-t-white border-l-transparent"></div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LearnPage;
