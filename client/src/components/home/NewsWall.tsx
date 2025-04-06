import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { staggerChildren, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getTimeAgo } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";

type Category = {
  id: number;
  name: string;
  slug: string;
  color: string;
};

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string;
  authorId: number;
  categoryId: number;
  viewCount: number;
  commentCount: number;
  createdAt: string;
};

const CategoryPill: React.FC<{
  category: Category;
  isActive: boolean;
  onClick: () => void;
}> = ({ category, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`category-pill flex items-center px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
      isActive
        ? `bg-[${category.color}] text-white shadow-md`
        : `bg-gray-100 text-dark hover:bg-gray-200 hover:shadow`
    }`}
    style={{ 
      backgroundColor: isActive ? category.color : "", 
      transform: isActive ? "scale(1.05)" : "scale(1)"
    }}
  >
    {isActive && <div className="mr-1 w-2 h-2 rounded-full bg-white"></div>}
    {category.name}
  </button>
);

const NewsWall: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: featured, isLoading: featuredLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles/featured'],
  });

  const { data: recent, isLoading: recentLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles/recent', selectedCategoryId],
    queryFn: async ({ queryKey }) => {
      const categoryId = queryKey[1] as number | null;
      const url = categoryId 
        ? `/api/articles/by-category/${categoryId}` 
        : '/api/articles/recent';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    }
  });

  const [showAllMobile, setShowAllMobile] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Determine articles to display based on mobile or desktop
  const displayedArticles = useMemo(() => {
    if (!recent) return [];
    if (!isMobile || showAllMobile) return recent;
    return recent.slice(0, 6); // Show only 6 articles on mobile
  }, [recent, isMobile, showAllMobile]);

  const isLoading = categoriesLoading || featuredLoading || recentLoading;

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  const getCategoryColor = (categoryId: number): string => {
    if (!categories) return "#FF4D4D";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : "#FF4D4D";
  };

  const getCategoryName = (categoryId: number): string => {
    if (!categories) return "";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "";
  };

  return (
    <section id="actualites" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark inline-block">Actualités récentes</h2>
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:bg-blue-50"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full hover:bg-blue-50"
                aria-label="Suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-500 mb-6">Restez informé des dernières informations politiques en France et à l'international</p>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 relative">
          <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            <CategoryPill
              category={{ id: 0, name: "Tout", slug: "all", color: "#FF4D4D" }}
              isActive={selectedCategoryId === null}
              onClick={() => handleCategoryClick(null)}
            />
            {categoriesLoading ? (
              Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-9 w-36 rounded-full" />
                ))
            ) : (
              categories?.map((category) => (
                <CategoryPill
                  key={category.id}
                  category={category}
                  isActive={selectedCategoryId === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Articles Grid */}

        {/* Recent News Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-xl" />
                ))
            : displayedArticles.map((article, index) => (
                <motion.div
                  key={article.id}
                  className="news-card group rounded-xl overflow-hidden shadow-md bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                  variants={staggerItem}
                  custom={index}
                >
                  <Link href="#" className="block">
                    <div className="overflow-hidden h-48 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="bg-secondary/10 h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="text-6xl text-secondary/30" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 z-20">
                        <span
                          className="inline-block px-2 py-1 text-xs font-semibold rounded-full transition-transform duration-300 group-hover:scale-110"
                          style={{
                            backgroundColor: getCategoryColor(article.categoryId),
                            color: "#FFFFFF"
                          }}
                        >
                          {getCategoryName(article.categoryId)}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-dark mb-3 transition-colors duration-300 group-hover:text-blue-600 line-clamp-2 min-h-[3.5rem]">
                        {article.title}
                      </h3>
                      <p className="text-dark/70 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-dark/60 text-xs">{getTimeAgo(article.createdAt)}</span>
                        <span className="text-blue-600 text-xs font-medium group-hover:underline">Lire l'article</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </motion.div>

        {/* "Voir tout" button for mobile */}
        {isMobile && !showAllMobile && recent && recent.length > 6 && (
          <div className="flex justify-center mt-8">
            <Button 
              onClick={() => setShowAllMobile(true)}
              className="rounded-full bg-blue-600 hover:bg-blue-700"
            >
              Voir tous les articles ({recent.length})
            </Button>
          </div>
        )}

      </div>
    </section>
  );
};

export default NewsWall;
