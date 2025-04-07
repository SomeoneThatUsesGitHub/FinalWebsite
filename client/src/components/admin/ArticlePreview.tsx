import { Article, Category } from "@shared/schema";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ArticlePreviewProps {
  article: Partial<Article>;
  category?: Category | null;
}

export function ArticlePreview({ article, category }: ArticlePreviewProps) {
  if (!article) return null;
  
  return (
    <div className="preview-container max-w-4xl mx-auto">
      {/* Bannière d'article */}
      <div className="relative w-full h-[300px] mb-8">
        {/* Image de couverture avec overlay dégradé */}
        <div className="absolute inset-0 bg-slate-900">
          {article.imageUrl ? (
            <img 
              src={article.imageUrl} 
              alt={article.title || "Image de couverture"}
              className="w-full h-full object-cover opacity-70" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-slate-700 to-slate-900"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        </div>
        
        {/* Contenu de la bannière */}
        <div className="absolute bottom-0 left-0 w-full p-6 text-white">
          {/* Meta-informations */}
          <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
            {category && (
              <Badge 
                className="bg-blue-600 hover:bg-blue-700"
              >
                {category.name}
              </Badge>
            )}
            
            {article.published ? (
              <Badge variant="outline" className="text-green-300 border-green-300">
                Publié
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-300 border-yellow-300">
                Brouillon
              </Badge>
            )}
            
            {article.featured && (
              <Badge variant="outline" className="text-amber-300 border-amber-300">
                À la une
              </Badge>
            )}
            
            {article.createdAt && (
              <span className="text-gray-300">
                {formatDate(article.createdAt, "d MMMM yyyy")}
              </span>
            )}
          </div>
          
          {/* Titre */}
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {article.title || "Titre de l'article"}
          </h1>
          
          {/* Extrait */}
          {article.excerpt && (
            <p className="text-lg text-gray-200 max-w-3xl">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>
      
      {/* Corps de l'article */}
      <div className="px-4 md:px-8 pb-12">
        <div className={cn(
          "prose prose-lg max-w-3xl mx-auto",
          "prose-headings:text-slate-900 prose-headings:font-bold",
          "prose-p:text-slate-700 prose-p:leading-relaxed",
          "prose-a:text-blue-600 prose-a:font-medium",
          "prose-strong:text-slate-900 prose-strong:font-semibold",
          "prose-li:text-slate-700",
          "prose-blockquote:text-slate-700 prose-blockquote:border-blue-600",
          "prose-img:rounded-lg"
        )}>
          {article.content ? (
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          ) : (
            <p className="text-muted-foreground text-center py-10">
              Cet article n'a pas encore de contenu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}