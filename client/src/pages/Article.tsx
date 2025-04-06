import React, { useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import SubscriptionBanner from "@/components/shared/SubscriptionBanner";
import { ChevronLeft, Heart, MessageSquare, Share2, Eye } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  authorId: number;
  categoryId: number;
  published: boolean;
  featured: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

const Article: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: article, isLoading: articleLoading } = useQuery<Article>({
    queryKey: [`/api/articles/${slug}`],
  });
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!article,
  });
  
  const { data: relatedArticles } = useQuery<Article[]>({
    queryKey: ['/api/articles/by-category', article?.categoryId, 3],
    enabled: !!article?.categoryId,
    queryFn: async ({ queryKey }) => {
      const categoryId = queryKey[1] as number;
      const limit = queryKey[2] as number;
      const res = await fetch(`/api/articles/by-category/${categoryId}?limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch related articles');
      return res.json();
    }
  });
  
  const getCategory = (categoryId: number | undefined): Category | undefined => {
    if (!categoryId || !categories) return undefined;
    return categories.find(c => c.id === categoryId);
  };
  
  const category = article ? getCategory(article.categoryId) : undefined;
  
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {article && (
        <Helmet>
          <title>{article.title} | Politique Jeune</title>
          <meta name="description" content={article.excerpt} />
        </Helmet>
      )}
      
      <div className="bg-background min-h-screen pb-12">
        {/* Back button */}
        <div className="container mx-auto px-4 md:px-6 pt-6">
          <Link href="/articles">
            <Button variant="ghost" className="mb-6">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour aux articles
            </Button>
          </Link>
          
          {articleLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 max-w-lg" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-[400px] w-full rounded-xl mt-8" />
              <div className="space-y-2 mt-8">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
              </div>
            </div>
          ) : article ? (
            <div className="max-w-4xl mx-auto">
              {/* Article header */}
              <div className="mb-8">
                {category && (
                  <span 
                    className="inline-block px-3 py-1 text-white text-sm font-semibold rounded-full mb-4"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-dark mb-4">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center text-dark/60 text-sm gap-4">
                  <div className="flex items-center">
                    <img 
                      src="https://randomuser.me/api/portraits/men/32.jpg" 
                      alt="Author" 
                      className="w-8 h-8 rounded-full mr-2" 
                    />
                    <span>Jean Dupont</span>
                  </div>
                  <span>|</span>
                  <span>{formatDate(article.createdAt, "d MMMM yyyy")}</span>
                  <span>|</span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" /> {article.viewCount}
                    </span>
                    <span className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" /> {article.commentCount}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Article featured image */}
              {article.imageUrl && (
                <div className="mb-8">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-auto max-h-[500px] object-cover rounded-xl"
                  />
                </div>
              )}
              
              {/* Article content */}
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-xl font-medium text-dark/80 mb-6">{article.excerpt}</p>
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              </div>
              
              {/* Article footer */}
              <div className="flex justify-between items-center py-4 border-t border-b border-gray-200 mb-8">
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Heart className="mr-2 h-4 w-4" /> J'aime
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Share2 className="mr-2 h-4 w-4" /> Partager
                  </Button>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-dark/60">Mis à jour le {formatDate(article.updatedAt, "d MMMM yyyy")}</span>
                </div>
              </div>
              
              {/* Related articles */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold mb-6">Articles similaires</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {relatedArticles
                      .filter(a => a.id !== article.id)
                      .slice(0, 3)
                      .map(relatedArticle => (
                        <div key={relatedArticle.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                          {relatedArticle.imageUrl && (
                            <div className="h-40 overflow-hidden">
                              <img 
                                src={relatedArticle.imageUrl} 
                                alt={relatedArticle.title} 
                                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div 
                              className="text-lg font-bold text-dark hover:text-primary transition-colors cursor-pointer"
                              onClick={() => window.location.href = `/articles/${relatedArticle.slug}`}
                            >
                              {relatedArticle.title}
                            </div>
                            <p className="text-dark/70 text-sm mt-2 line-clamp-2">{relatedArticle.excerpt}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-dark mb-2">Article non trouvé</h2>
              <p className="text-dark/70 mb-6">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
              <Button onClick={() => window.location.href = '/articles'}>
                Voir tous les articles
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <SubscriptionBanner />
    </motion.div>
  );
};

export default Article;
