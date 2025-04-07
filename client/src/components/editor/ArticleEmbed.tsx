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

  // Vérification d'URL valide pour éviter les problèmes d'affichage
  const hasValidImage = article.imageUrl && 
    (article.imageUrl.startsWith('http://') || 
     article.imageUrl.startsWith('https://') ||
     article.imageUrl.startsWith('/'));
  
  return (
    <div className={cn(
      "w-full rounded-lg border border-blue-100 bg-white my-6 shadow-sm hover:shadow transition-all duration-200",
      className
    )}>
      <Link href={`/articles/${article.slug}`}>
        <div className="flex flex-col sm:flex-row w-full">
          {/* Image (gauche sur desktop, haut sur mobile) */}
          {hasValidImage && (
            <div className="sm:w-1/3 md:w-1/4 h-48 shrink-0 rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none bg-gray-100 relative overflow-hidden">
              <div className="absolute inset-0">
                <img 
                  src={article.imageUrl}
                  alt={article.title || ''} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback en cas d'erreur de chargement de l'image
                    const target = e.target as HTMLImageElement;
                    target.onerror = null; // Évite les boucles infinies
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
          
          {/* Contenu principal */}
          <div className="p-4 flex flex-col justify-between flex-grow">
            <div>
              <h3 className="font-bold text-gray-800 text-xl mb-2 line-clamp-2">
                {article.title}
              </h3>
              
              {article.excerpt && (
                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                  {article.excerpt}
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>Publié le {formatDate(createdAt, "dd MMM yyyy")}</span>
              </span>
              
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Lecture {readTime}</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ArticleEmbed;