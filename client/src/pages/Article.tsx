import React, { useEffect } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { pageTransition, staggerChildren, staggerItem, fadeIn } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Share2, Calendar, Clock, Bookmark, Facebook, Twitter } from "lucide-react";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import ArticleContent from "@/components/ArticleContent";

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
  
  // Effet pour scroller vers le haut lorsqu'un nouvel article est chargé
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
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
      
      {/* Navigation top bar */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-700 to-blue-500 backdrop-blur-md shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex justify-between items-center">
            <Link href="/articles">
              <Button variant="ghost" size="sm" className="flex items-center text-white hover:bg-blue-600 min-w-0 p-1 sm:p-2">
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline-block">Retour aux articles</span>
                <span className="sm:hidden ml-1 text-xs">Retour</span>
              </Button>
            </Link>
            <h2 className="text-white text-sm font-semibold truncate max-w-[180px] sm:max-w-[250px] md:max-w-none hidden xs:block">
              {article?.title || "Article"}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="flex items-center text-white hover:bg-blue-600 min-w-0 p-1 sm:p-2">
                <Bookmark className="h-4 w-4" />
                <span className="hidden lg:ml-1 lg:inline-block">Sauvegarder</span>
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center text-white hover:bg-blue-600 min-w-0 p-1 sm:p-2">
                <Share2 className="h-4 w-4" />
                <span className="hidden lg:ml-1 lg:inline-block">Partager</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background min-h-screen pb-12">
        {articleLoading ? (
          <div className="container mx-auto px-4 md:px-6 pt-6 space-y-4">
            <Skeleton className="h-10 w-3/4 max-w-lg mx-auto" />
            <Skeleton className="h-6 w-1/4 mx-auto" />
            <Skeleton className="h-[400px] w-full rounded-xl mt-8" />
            <div className="space-y-2 mt-8 max-w-3xl mx-auto">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        ) : article ? (
          <>
            {/* Article hero */}
            {article.imageUrl && (
              <div className="relative w-full h-[50vh] bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/40 z-10"></div>
                <img 
                  src={article.imageUrl} 
                  alt={article.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 container mx-auto">
                  <motion.div 
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {category && (
                      <Badge
                        className="mb-4 text-white px-3 py-1"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </Badge>
                    )}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-md">
                      {article.title}
                    </h1>
                  </motion.div>
                </div>
              </div>
            )}

            <div className="container mx-auto px-4 md:px-6 pt-8">
              <div className="max-w-3xl mx-auto">
                {/* Article header - only shown if no image */}
                {!article.imageUrl && (
                  <div className="mb-8">
                    {category && (
                      <Badge
                        className="mb-4 text-white px-3 py-1"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name}
                      </Badge>
                    )}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-dark mb-4">
                      {article.title}
                    </h1>
                  </div>
                )}

                {/* Author and meta */}
                <motion.div 
                  className="flex flex-wrap items-center justify-between py-4 mb-8 border-b border-gray-200"
                  variants={staggerChildren}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div variants={staggerItem} className="flex items-center mb-4 md:mb-0">
                    <div className="flex-shrink-0 mr-4">
                      <img 
                        src="https://randomuser.me/api/portraits/men/32.jpg" 
                        alt="Author" 
                        className="w-12 h-12 rounded-full border-2 border-primary/20" 
                      />
                    </div>
                    <div>
                      <div className="font-semibold text-dark">Jean Dupont</div>
                      <div className="text-sm text-dark/60">Journaliste politique</div>
                    </div>
                  </motion.div>
                  
                  <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-4 text-sm text-dark/60">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(article.createdAt, "d MMMM yyyy")}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>8 min de lecture</span>
                    </div>
                  </motion.div>
                </motion.div>
                
                {/* Article content */}
                <motion.div 
                  className="prose prose-lg max-w-none mb-12"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                >
                  <p className="text-xl font-medium text-dark/80 mb-8 leading-relaxed">{article.excerpt}</p>
                  <ArticleContent content={article.content} />
                </motion.div>
                
                {/* Social sharing */}
                <motion.div 
                  className="flex flex-col md:flex-row justify-between items-center py-6 px-6 md:px-8 bg-blue-50 rounded-xl mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="mb-4 md:mb-0">
                    <h4 className="font-semibold text-dark mb-1">Vous avez aimé cet article ?</h4>
                    <p className="text-sm text-dark/70">Partagez-le avec vos amis</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="bg-white">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="bg-white">
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </motion.div>
                
                {/* Related articles */}
                {relatedArticles && relatedArticles.length > 0 && (
                  <motion.div 
                    className="mt-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold mb-6 relative inline-block">
                      Articles similaires
                      <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-blue-500 rounded-full"></span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      {relatedArticles
                        .filter(a => a.id !== article.id)
                        .slice(0, 3)
                        .map(relatedArticle => (
                          <motion.div 
                            key={relatedArticle.id} 
                            className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            whileHover={{ scale: 1.02 }}
                          >
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
                              <Link href={`/articles/${relatedArticle.slug}`}>
                                <h4 className="text-lg font-bold text-dark hover:text-primary transition-colors">
                                  {relatedArticle.title}
                                </h4>
                              </Link>
                              <p className="text-dark/70 text-sm mt-2 line-clamp-2">{relatedArticle.excerpt}</p>
                              <div className="flex items-center mt-4 text-xs text-dark/60">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{formatDate(relatedArticle.createdAt, "d MMMM yyyy")}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="container mx-auto px-4 md:px-6 pt-16">
            <div className="text-center py-16 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-dark mb-2">Article non trouvé</h2>
              <p className="text-dark/70 mb-6">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
              <Link href="/articles">
                <Button>
                  Voir tous les articles
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Article;
