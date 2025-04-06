import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { staggerChildren, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getTimeAgo, truncateText } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Eye, MessageSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    className={`category-pill px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
      isActive
        ? `bg-[${category.color}] text-white`
        : `bg-light text-dark hover:bg-light/80`
    }`}
    style={{ backgroundColor: isActive ? category.color : "" }}
  >
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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark">Actualités récentes</h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              aria-label="Suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
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

        {/* Featured News */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full rounded-xl" />
            </div>
            <div className="lg:col-span-1 grid grid-rows-2 gap-6">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-44 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Featured Article */}
            {featured && featured[0] && (
              <motion.div 
                className="lg:col-span-2"
                variants={staggerItem}
                initial="hidden"
                animate="visible"
              >
                <div className="news-card group rounded-xl overflow-hidden shadow-lg relative h-96">
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent z-10"></div>
                  <div className="overflow-hidden h-full">
                    {featured[0].imageUrl ? (
                      <img
                        src={featured[0].imageUrl}
                        alt={featured[0].title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">Aucune image</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <span
                      className="inline-block px-3 py-1 text-white text-xs font-semibold rounded-full mb-3"
                      style={{ backgroundColor: getCategoryColor(featured[0].categoryId) }}
                    >
                      {getCategoryName(featured[0].categoryId)}
                    </span>
                    <Link href="#">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 hover:underline cursor-pointer">
                        {featured[0].title}
                      </h3>
                    </Link>
                    <p className="text-white/80 text-sm md:text-base mb-4">
                      {featured[0].excerpt}
                    </p>
                    <div className="flex items-center text-white/70 text-sm">
                      <span>Par Sarah Martin</span>
                      <span className="mx-2">•</span>
                      <span>{getTimeAgo(featured[0].createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Secondary Featured Articles */}
            <div className="lg:col-span-1 grid grid-rows-2 gap-6">
              {featured && 
                featured.slice(1, 3).map((article, index) => (
                  <motion.div 
                    key={article.id}
                    className="news-card group rounded-xl overflow-hidden shadow-lg relative h-44"
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                    custom={index + 1}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/50 to-transparent z-10"></div>
                    <div className="overflow-hidden h-full">
                      {article.imageUrl ? (
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Aucune image</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                      <span
                        className="inline-block px-2 py-1 text-white text-xs font-semibold rounded-full mb-2"
                        style={{ backgroundColor: getCategoryColor(article.categoryId) }}
                      >
                        {getCategoryName(article.categoryId)}
                      </span>
                      <Link href="#">
                        <h3 className="text-base md:text-lg font-bold text-white hover:underline cursor-pointer">
                          {article.title}
                        </h3>
                      </Link>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        )}

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
            : recent &&
              recent.map((article, index) => (
                <motion.div
                  key={article.id}
                  className="news-card rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-300"
                  variants={staggerItem}
                  custom={index}
                >
                  <div className="overflow-hidden h-48 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-dark/20 to-transparent z-10"></div>
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
                  </div>
                  <div className="p-4">
                    <span
                      className="inline-block px-2 py-1 text-xs font-semibold rounded-full mb-2"
                      style={{
                        backgroundColor: getCategoryColor(article.categoryId),
                        color: "#FFFFFF"
                      }}
                    >
                      {getCategoryName(article.categoryId)}
                    </span>
                    <Link href="#">
                      <h3 className="text-lg font-bold text-dark mb-2 hover:text-primary transition-colors cursor-pointer">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-dark/70 text-sm mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-dark/60 text-xs">
                      <span>{getTimeAgo(article.createdAt)}</span>
                      <div className="flex items-center">
                        <span className="flex items-center mr-3">
                          <Eye className="h-3 w-3 mr-1" /> {article.viewCount}
                        </span>
                        <span className="flex items-center">
                          <MessageSquare className="h-3 w-3 mr-1" /> {article.commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
        </motion.div>

        <div className="mt-8 text-center">
          <Link href="#">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
              Voir tous les articles <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsWall;
