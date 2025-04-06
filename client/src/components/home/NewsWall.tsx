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
            : recent &&
              recent.map((article, index) => (
                <motion.div
                  key={article.id}
                  className="news-card rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-shadow duration-300"
                  variants={staggerItem}
                  custom={index}
                >
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
                      <h3 className="text-lg font-bold text-dark mb-2 hover:text-primary transition-colors cursor-pointer line-clamp-2 min-h-[3.5rem]">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-dark/70 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center text-dark/60 text-xs">
                      <span>{getTimeAgo(article.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
        </motion.div>


      </div>
    </section>
  );
};

export default NewsWall;
