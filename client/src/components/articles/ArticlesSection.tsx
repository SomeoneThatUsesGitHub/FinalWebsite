import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { staggerChildren, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, getTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ChevronLeft, ChevronRight, Clock, Eye, Grid3X3, List, MessageSquare, Search, Sliders } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  author?: {
    displayName: string;
    title: string | null;
    avatarUrl: string | null;
  };
};

// Liste des années pour la barre de navigation temporelle
const years = [2025, 2024];

// Composant pour les badges de catégories
const CategoryBadge: React.FC<{ categoryId: number; categories: Category[] | undefined }> = ({ categoryId, categories }) => {
  const category = categories?.find(c => c.id === categoryId);
  
  if (!category) return null;
  
  return (
    <Badge style={{ backgroundColor: category.color }}>
      {category.name}
    </Badge>
  );
};

// Articles en format compact
const CompactArticleCard: React.FC<{ 
  article: Article; 
  categories: Category[] | undefined;
  onCategoryClick: (categoryId: number) => void;
}> = ({ article, categories, onCategoryClick }) => {
  return (
    <motion.article 
      className="flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      variants={staggerItem}
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <div className="flex-shrink-0 hidden sm:block">
        <div className="h-20 w-28 overflow-hidden rounded-md">
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold text-dark mb-1 line-clamp-2 hover:text-blue-600 transition-colors">
          <Link href={`/articles/${article.slug}`}>
            {article.title}
          </Link>
        </h3>
        <div className="text-sm text-dark/60 mb-2 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(article.createdAt, "d MMM yyyy")}
          </span>
          <span 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => onCategoryClick(article.categoryId)}
          >
            <CategoryBadge categoryId={article.categoryId} categories={categories} />
          </span>
        </div>
        <div className="text-xs text-dark/50 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {article.viewCount} vues
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {article.commentCount} commentaires
          </span>
        </div>
      </div>
    </motion.article>
  );
};

// Articles en format grille
const GridArticleCard: React.FC<{ 
  article: Article; 
  categories: Category[] | undefined;
  onCategoryClick: (categoryId: number) => void;
}> = ({ article, categories, onCategoryClick }) => {
  return (
    <motion.article 
      variants={{
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { 
            type: "spring", 
            stiffness: 100, 
            damping: 25,
            duration: 0.4
          } 
        }
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className="rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col bg-white group cursor-pointer"
    >
      <Link href={`/articles/${article.slug}`} className="flex flex-col flex-1">
        <div className="relative overflow-hidden h-48">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
          {article.imageUrl ? (
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
          )}
          <div className="absolute top-2 right-2 z-20">
            <span
              className="inline-block px-2 py-1 text-xs font-semibold rounded-full transition-transform duration-300 hover:scale-110"
              style={{
                backgroundColor: categories?.find(c => c.id === article.categoryId)?.color || "#3b82f6",
                color: "#FFFFFF"
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCategoryClick(article.categoryId);
              }}
            >
              {categories?.find(c => c.id === article.categoryId)?.name || "Catégorie"}
            </span>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <motion.h3 
            className="text-lg font-bold text-dark mb-3 transition-colors duration-300 group-hover:text-blue-600 line-clamp-2 min-h-[3.5rem]"
            variants={{
              hidden: { opacity: 0, y: 5 },
              visible: { 
                opacity: 1, 
                y: 0,
                transition: { 
                  type: "spring",
                  stiffness: 120,
                  damping: 20
                }
              }
            }}
          >
            {article.title}
          </motion.h3>
          <p className="text-dark/70 text-sm mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
          <div className="flex items-center justify-between text-dark/60 text-xs pt-3 border-t border-gray-100">
            <div className="flex items-center">
              <img 
                src={article.author?.avatarUrl || '/assets/default-avatar.svg'} 
                alt={article.author?.displayName || "Auteur"} 
                className="w-6 h-6 rounded-full mr-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/default-avatar.svg';
                }}
              />
              <span>{article.author?.displayName || "Auteur inconnu"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{getTimeAgo(article.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

// Articles en format liste détaillée
const ListArticleCard: React.FC<{ 
  article: Article; 
  categories: Category[] | undefined;
  onCategoryClick: (categoryId: number) => void;
}> = ({ article, categories, onCategoryClick }) => {
  return (
    <motion.article 
      className="flex flex-col md:flex-row gap-6 p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
      variants={staggerItem}
      itemScope
      itemType="https://schema.org/NewsArticle"
    >
      <div className="flex-shrink-0">
        <div className="h-48 md:h-40 md:w-60 overflow-hidden rounded-lg">
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
        </div>
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap gap-2 mb-2">
          <span
            className="cursor-pointer"
            onClick={() => onCategoryClick(article.categoryId)}
          >
            <CategoryBadge categoryId={article.categoryId} categories={categories} />
          </span>
          {article.featured && (
            <Badge variant="outline" className="border-blue-600 text-blue-600">
              À la une
            </Badge>
          )}
        </div>
        <h3 className="text-xl font-bold text-dark mb-2 hover:text-blue-600 transition-colors">
          <Link href={`/articles/${article.slug}`}>
            {article.title}
          </Link>
        </h3>
        <p className="text-dark/70 mb-4 leading-relaxed">{article.excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-dark/60 text-sm">
            <div className="flex items-center">
              <img 
                src={article.author?.avatarUrl || '/assets/default-avatar.svg'} 
                alt={article.author?.displayName || "Auteur"} 
                className="w-6 h-6 rounded-full mr-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/default-avatar.svg';
                }}
              />
              <span>{article.author?.displayName || "Auteur inconnu"}</span>
            </div>
            <span className="mx-2">•</span>
            <span>{formatDate(article.createdAt, "d MMMM yyyy")}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-dark/50">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.viewCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {article.commentCount}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

const ArticlesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  // Récupérer tous les articles en une seule requête 
  // et appliquer les filtres côté client pour une meilleure réactivité
  const { data: articlesData, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
    queryFn: async () => {
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    }
  });
  
  // Filtrer explicitement pour ne garder que les articles publiés
  // et pour appliquer les filtres côté client
  const articles = useMemo(() => {
    if (!articlesData) return [];
    
    // Filtrer d'abord par statut de publication
    let filtered = articlesData.filter(article => article.published === true);
    
    // Ensuite appliquer les autres filtres
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(article => 
        article.categoryId === parseInt(selectedCategory)
      );
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchLower)
      );
    }
    
    if (selectedYear && selectedYear !== 'all') {
      const year = parseInt(selectedYear);
      filtered = filtered.filter(article => {
        const articleDate = new Date(article.createdAt);
        return articleDate.getFullYear() === year;
      });
    }
    
    // Tri par date de création
    if (sortOrder === 'oldest') {
      // Tri par date de création (plus ancien d'abord)
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      // Par défaut, tri par date de création (plus récent d'abord)
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    return filtered;
  }, [articlesData, selectedCategory, searchTerm, sortOrder, selectedYear]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };
  
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
  };
  
  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId.toString());
  };
  
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const isLoading = categoriesLoading || articlesLoading;
  
  // Grouper les articles par date
  const articlesByDate = useMemo(() => {
    if (!articles) return {};
    
    const grouped: { [key: string]: Article[] } = {};
    
    articles.forEach(article => {
      const date = new Date(article.createdAt);
      const month = date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      
      if (!grouped[month]) {
        grouped[month] = [];
      }
      
      grouped[month].push(article);
    });
    
    return grouped;
  }, [articles]);
  
  return (
    <section id="articles" className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        {/* Filtres de recherche */}
        {showFilters && (
          <div className="mb-8 bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-5">
                <Input
                  type="text"
                  placeholder="Rechercher par titre..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 w-full"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="md:col-span-3">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
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
              <div className="md:col-span-2">
                <Select value={selectedYear} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Toutes les années" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les années</SelectItem>
                    {years.map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Les plus récents</SelectItem>
                    <SelectItem value="oldest">Les plus anciens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation par année et bouton filtres sur la même ligne */}
        <motion.div 
          className="mb-6 flex justify-between items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.3
            }
          }}
        >
          {!showFilters && (
            <ScrollArea className="w-full whitespace-nowrap mr-4">
              <div className="flex space-x-1 py-1">
                <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                  <Button
                    variant={selectedYear === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleYearChange('all')}
                    className={selectedYear === 'all' ? 'bg-blue-600' : ''}
                  >
                    Toutes les années
                  </Button>
                </motion.div>
                {years.map(year => (
                  <motion.div 
                    key={year} 
                    whileHover={{ scale: 1.05 }} 
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Button
                      variant={selectedYear === year.toString() ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleYearChange(year.toString())}
                      className={selectedYear === year.toString() ? 'bg-blue-600' : ''}
                    >
                      {year}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          )}

          <div className="flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex items-center ${showFilters ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={toggleFilters}
            >
              <Sliders className="h-4 w-4 mr-1" />
              Filtres
            </Button>
          </div>
        </motion.div>
        
        {/* Affichage du contenu en mode grille uniquement */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            {articles.map((article, index) => (
              <GridArticleCard 
                key={article.id} 
                article={article} 
                categories={categories}
                onCategoryClick={handleCategoryClick}
              />
            ))}
          </motion.div>
        ) : (
          <div className="py-16 text-center bg-white rounded-xl shadow-md">
            <h3 className="text-xl font-medium mb-2">Aucun article trouvé</h3>
            <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
            {searchTerm || selectedCategory !== 'all' || selectedYear !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                  setSelectedYear("all");
                }}
                className="mt-4"
              >
                Réinitialiser les filtres
              </Button>
            ) : null}
          </div>
        )}
        
        {/* Pagination */}
        {articles && articles.length > 0 && (
          <div className="mt-10 flex justify-center">
            <nav className="flex items-center space-x-1">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="default" size="sm" className="bg-blue-600">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="px-2">...</span>
              <Button variant="outline" size="sm">12</Button>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        )}
      </div>
    </section>
  );
};

export default ArticlesSection;
