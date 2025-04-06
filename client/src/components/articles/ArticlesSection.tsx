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
};

// Liste des années pour la barre de navigation temporelle
const years = [2025, 2024, 2023, 2022, 2021, 2020];

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
    <motion.div 
      className="flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
      variants={staggerItem}
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
    </motion.div>
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
      variants={staggerItem}
      className="rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col bg-white"
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
        <div className="absolute top-3 left-3" onClick={() => onCategoryClick(article.categoryId)}>
          <CategoryBadge categoryId={article.categoryId} categories={categories} />
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-dark mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        <p className="text-dark/70 text-sm mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
        <div className="flex items-center justify-between text-dark/60 text-xs pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <img 
              src="https://randomuser.me/api/portraits/men/32.jpg" 
              alt="Author" 
              className="w-6 h-6 rounded-full mr-2"
            />
            <span>Jean Dupont</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{getTimeAgo(article.createdAt)}</span>
          </div>
        </div>
      </div>
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
    <motion.div 
      className="flex flex-col md:flex-row gap-6 p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors"
      variants={staggerItem}
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
                src="https://randomuser.me/api/portraits/men/32.jpg" 
                alt="Author" 
                className="w-6 h-6 rounded-full mr-2"
              />
              <span>Jean Dupont</span>
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
    </motion.div>
  );
};

const ArticlesSection: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ['/api/articles', selectedCategory, searchTerm, sortOrder, selectedYear],
    queryFn: async ({ queryKey }) => {
      const [_, categoryId, search, sort, year] = queryKey;
      let url = '/api/articles?';
      
      if (categoryId && categoryId !== 'all') url += `categoryId=${categoryId}&`;
      if (search) url += `search=${encodeURIComponent(search as string)}&`;
      if (sort) url += `sort=${sort}&`;
      if (year && year !== 'all') url += `year=${year}`;
      
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark mb-2">Tous nos articles</h2>
            <p className="text-dark/70">
              Explorez notre collection complète d'articles politiques, économiques et historiques.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex items-center ${viewMode === 'compact' ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => setViewMode('compact')}
            >
              <List className="h-4 w-4 mr-1" />
              Compact
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex items-center ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Grille
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex items-center ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-1" />
              Liste
            </Button>
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
        </div>
        
        {/* Filtres de recherche */}
        {showFilters && (
          <div className="mb-8 bg-white p-4 md:p-6 rounded-xl shadow-md border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="relative md:col-span-5">
                <Input
                  type="text"
                  placeholder="Rechercher un article..."
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
                    <SelectItem value="popular">Les plus lus</SelectItem>
                    <SelectItem value="commented">Les plus commentés</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation par année - affichée seulement si les filtres sont cachés */}
        {!showFilters && (
          <div className="mb-8">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-1 py-1">
                <Button
                  variant={selectedYear === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleYearChange('all')}
                  className={selectedYear === 'all' ? 'bg-blue-600' : ''}
                >
                  Toutes les années
                </Button>
                {years.map(year => (
                  <Button
                    key={year}
                    variant={selectedYear === year.toString() ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleYearChange(year.toString())}
                    className={selectedYear === year.toString() ? 'bg-blue-600' : ''}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Affichage du contenu selon le mode de vue */}
        {isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(9).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
              ))}
            </div>
          ) : viewMode === 'list' ? (
            <div className="space-y-6">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Array(10).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-md" />
              ))}
            </div>
          )
        ) : articles && articles.length > 0 ? (
          <div>
            {viewMode === 'grid' && (
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
            )}
            
            {viewMode === 'list' && (
              <motion.div 
                className="bg-white rounded-xl overflow-hidden shadow-md"
                variants={staggerChildren}
                initial="hidden"
                animate="visible"
              >
                {articles.map((article, index) => (
                  <ListArticleCard 
                    key={article.id} 
                    article={article} 
                    categories={categories}
                    onCategoryClick={handleCategoryClick}
                  />
                ))}
              </motion.div>
            )}
            
            {viewMode === 'compact' && (
              <div className="bg-white rounded-xl overflow-hidden shadow-md">
                <Tabs defaultValue="chronological" className="w-full">
                  <div className="border-b border-gray-100 p-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="chronological">Par date</TabsTrigger>
                      <TabsTrigger value="all">Tous les articles</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="chronological" className="p-0">
                    {Object.keys(articlesByDate).length > 0 ? (
                      Object.entries(articlesByDate)
                        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                        .map(([date, dateArticles]) => (
                          <div key={date} className="mb-6">
                            <h3 className="px-4 pt-4 pb-2 text-lg font-semibold text-dark capitalize border-b border-gray-100">
                              {date}
                            </h3>
                            <motion.div
                              variants={staggerChildren}
                              initial="hidden"
                              animate="visible"
                              className="divide-y divide-gray-50"
                            >
                              {dateArticles.map(article => (
                                <CompactArticleCard 
                                  key={article.id} 
                                  article={article} 
                                  categories={categories}
                                  onCategoryClick={handleCategoryClick}
                                />
                              ))}
                            </motion.div>
                          </div>
                        ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        Aucun article trouvé pour cette période
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="all" className="p-0">
                    <motion.div
                      variants={staggerChildren}
                      initial="hidden"
                      animate="visible"
                      className="divide-y divide-gray-50"
                    >
                      {articles.map(article => (
                        <CompactArticleCard 
                          key={article.id} 
                          article={article} 
                          categories={categories}
                          onCategoryClick={handleCategoryClick}
                        />
                      ))}
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
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
