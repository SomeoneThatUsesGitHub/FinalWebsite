import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { staggerChildren, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

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
  content: string;
  imageUrl: string | null;
  authorId: number;
  categoryId: number;
  published: boolean;
  featured: boolean;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
};

const ArticlesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles', selectedCategory, searchTerm, sortOrder],
    queryFn: async ({ queryKey }) => {
      const [_, categoryId, search, sort] = queryKey;
      let url = '/api/articles?';
      
      if (categoryId && categoryId !== 'all') url += `categoryId=${categoryId}&`;
      if (search) url += `search=${encodeURIComponent(search as string)}&`;
      if (sort) url += `sort=${sort}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    }
  });
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleSortChange = (value: string) => {
    setSortOrder(value);
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
  
  const isLoading = categoriesLoading || articlesLoading;
  
  return (
    <section id="articles" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark mb-2">Tous nos articles</h2>
        <p className="text-dark/70 mb-8">Explorez notre collection d'articles pour comprendre les enjeux politiques actuels</p>
        
        {/* Filters and Search */}
        <div className="mb-8 bg-white p-4 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <Input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories?.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sortOrder} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Les plus récents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Les plus récents</SelectItem>
                  <SelectItem value="popular">Les plus populaires</SelectItem>
                  <SelectItem value="commented">Les plus commentés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Articles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            {articles && articles.length > 0 ? (
              articles.map((article, index) => (
                <motion.article 
                  key={article.id}
                  className="rounded-xl overflow-hidden shadow-md bg-white hover:shadow-lg transition-all duration-300 flex flex-col"
                  variants={staggerItem}
                  custom={index}
                >
                  <div className="relative overflow-hidden h-48">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span 
                        className="inline-block px-2 py-1 text-white text-xs font-semibold rounded-full"
                        style={{ backgroundColor: getCategoryColor(article.categoryId) }}
                      >
                        {getCategoryName(article.categoryId)}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 
                      className="text-lg font-bold text-dark mb-2 hover:text-primary transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/articles/${article.slug}`}
                    >
                      {article.title}
                    </h3>
                    <p className="text-dark/70 text-sm mb-4 line-clamp-3 flex-1">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-dark/60 text-xs pt-3 border-t border-light">
                      <div className="flex items-center">
                        <img 
                          src="https://randomuser.me/api/portraits/men/32.jpg" 
                          alt="Author" 
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span>Jean Dupont</span>
                      </div>
                      <span>{formatDate(article.createdAt, "d MMMM yyyy")}</span>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <h3 className="text-xl font-medium mb-2">Aucun article trouvé</h3>
                <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
              </div>
            )}
          </motion.div>
        )}
        
        {/* Pagination */}
        {articles && articles.length > 0 && (
          <div className="mt-10 flex justify-center">
            <nav className="flex items-center space-x-1">
              <button className="px-3 py-1 rounded-md bg-light text-dark hover:bg-primary/10 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="px-3 py-1 rounded-md bg-primary text-white font-medium">1</button>
              <button className="px-3 py-1 rounded-md bg-light text-dark hover:bg-primary/10 transition-colors">2</button>
              <button className="px-3 py-1 rounded-md bg-light text-dark hover:bg-primary/10 transition-colors">3</button>
              <span className="px-2">...</span>
              <button className="px-3 py-1 rounded-md bg-light text-dark hover:bg-primary/10 transition-colors">12</button>
              <button className="px-3 py-1 rounded-md bg-light text-dark hover:bg-primary/10 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticlesSection;
