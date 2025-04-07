import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Article } from '@shared/schema';
import { cn } from '@/lib/utils';

interface ArticleEmbedProps {
  article: Partial<Article>;
  className?: string;
  variant?: 'default' | 'compact';
}

const ArticleEmbed: React.FC<ArticleEmbedProps> = ({ 
  article, 
  className,
  variant = 'default'
}) => {
  if (!article || !article.slug) return null;

  const isCompact = variant === 'compact';
  
  return (
    <Card className={cn(
      "overflow-hidden border-blue-100 my-4 hover:shadow-md transition-shadow duration-200",
      isCompact ? "max-w-full" : "max-w-[350px] mx-auto",
      className
    )}>
      <Link href={`/articles/${article.slug}`} className="block">
        <div className={cn(
          "relative", 
          isCompact ? "flex items-center gap-4" : ""
        )}>
          {article.imageUrl && (
            <div className={cn(
              "overflow-hidden bg-muted",
              isCompact ? "w-24 h-24 min-w-[6rem]" : "h-[180px]"
            )}>
              <img 
                src={article.imageUrl} 
                alt={article.title} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
          )}
          
          <CardContent className={cn(
            isCompact ? "p-2 flex-1" : "p-4"
          )}>
            <h3 className={cn(
              "font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary",
              isCompact ? "text-sm" : "text-lg"
            )}>
              {article.title}
            </h3>
            
            {article.excerpt && !isCompact && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {article.excerpt}
              </p>
            )}
            
            <div className="text-primary flex items-center text-sm font-medium mt-auto">
              Lire l'article
              <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
};

export default ArticleEmbed;