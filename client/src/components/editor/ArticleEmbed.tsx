import React from 'react';
import { Link } from 'wouter';
import { formatDate } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { Article } from '@shared/schema';
import { cn } from '@/lib/utils';

interface ArticleEmbedProps {
  article: Partial<Article>;
  className?: string;
}

const ArticleEmbed: React.FC<ArticleEmbedProps> = ({ 
  article, 
  className
}) => {
  if (!article || !article.slug) return null;
  
  // Utilisez la date actuelle si l'article n'a pas de date de création
  const createdAt = article.createdAt || new Date().toISOString();
  
  // Calcul du temps de lecture fictif (3 minutes par défaut)
  const readTime = "3 min.";
  
  return (
    <div className={cn(
      "w-full border border-gray-200 bg-white rounded-none my-4 hover:shadow-sm transition-shadow duration-200",
      className
    )}>
      <Link href={`/articles/${article.slug}`} className="block">
        <div className="flex items-stretch">
          {/* Catégorie sur la gauche */}
          <div className="w-12 h-auto bg-amber-400 flex items-center justify-center">
            <span className="text-white font-bold uppercase text-xs transform -rotate-90">CAT</span>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 p-4">
            <h3 className="font-semibold text-gray-800 text-lg mb-2">
              {article.title}
            </h3>
            
            <div className="flex items-center text-sm text-gray-500 mt-2">
              <span>Publié le {formatDate(createdAt, "dd MMMM yyyy 'à' HH'h'mm")}</span>
              <div className="flex items-center ml-4">
                <Clock className="h-4 w-4 mr-1" />
                <span>Lecture {readTime}</span>
              </div>
            </div>
          </div>

          {/* Image de droite */}
          {article.imageUrl && (
            <div className="w-32 md:w-40 bg-gray-200">
              <img 
                src={article.imageUrl} 
                alt={article.title || ''} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ArticleEmbed;