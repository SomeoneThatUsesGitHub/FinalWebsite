import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { staggerChildren, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getTimeAgo } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "@/hooks/use-media-query";
import { ScrollAnimation } from "@/hooks/use-scroll-animation";

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

type FlashInfo = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  url: string | null;
  active: boolean;
  priority: number;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
};

type LiveEvent = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  active: boolean;
  scheduledFor: string | null;
  categoryId: number | null;
  createdAt: string;
  updatedAt: string;
  editors?: Array<{
    editor?: {
      displayName: string;
      title: string | null;
      avatarUrl: string | null;
    }
  }>;
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

  const { data: flashInfos, isLoading: flashInfosLoading } = useQuery<FlashInfo[]>({
    queryKey: ['/api/flash-infos'],
  });

  const { data: liveEvent, isLoading: liveEventLoading } = useQuery<LiveEvent>({
    queryKey: ['/api/live-event'],
    throwOnError: false,
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

  const isMobile = useMediaQuery("(max-width: 768px)");
  const isReallyMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  
  // Check if we have an active live event
  const hasLiveEvent = !!liveEvent;
  
  // Prepare featured content - Live Event takes precedence, then featured article
  const featuredContent = useMemo(() => {
    if (hasLiveEvent) {
      return { type: 'liveEvent', data: liveEvent };
    } else if (featured && featured.length > 0) {
      return { type: 'article', data: featured[0] };
    } else if (recent && recent.length > 0) {
      return { type: 'article', data: recent[0] };
    }
    return null;
  }, [featured, recent, liveEvent, hasLiveEvent]);
  
  // Determine articles to display based on mobile or desktop
  const displayedArticles = useMemo(() => {
    if (!recent) return [];
    
    // Skip the featured article if it comes from recent (to avoid duplication)
    const articlesToDisplay = 
      featuredContent?.type === 'article' && 
      !featured?.length && 
      recent.length > 0
        ? recent.filter(a => a.id !== (featuredContent.data as Article).id)
        : recent;
    
    if (isMobile) {
      // Show only 4 articles on mobile
      return articlesToDisplay.slice(0, 4); 
    }
    
    // Pour desktop, nous devons prendre en compte le nombre de Flash Infos présents
    // Afficher un maximum de 6 cartes au total (Flash Infos + articles)
    // Le nombre d'articles à afficher est : 6 - nombre de Flash Infos
    const flashInfosCount = flashInfos?.length || 0;
    const maxArticles = Math.max(0, 6 - flashInfosCount); // Au moins 0, même si on a plus de 6 Flash Infos
    return articlesToDisplay.slice(0, maxArticles);
  }, [recent, featured, featuredContent, isMobile, flashInfos]);

  const isLoading = categoriesLoading || featuredLoading || recentLoading || flashInfosLoading || liveEventLoading;

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
    <section id="actualites" className="pt-6 pb-16 md:pt-12 md:pb-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">

        <ScrollAnimation className="mb-10" threshold={0.1}>
          <div className="mb-4">
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark inline-block">Notre sélection</h2>
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-500 mb-6">Restez informé des dernières informations politiques en France et à l'international</p>
        </ScrollAnimation>

        {/* Featured Content - Live Event or Featured Article */}
        {isLoading ? (
          <Skeleton className="h-96 w-full rounded-xl mb-10" />
        ) : featuredContent && (
          <ScrollAnimation className="mb-10" threshold={0.1} delay={0.2}>
            {featuredContent.type === 'liveEvent' ? (
              // Live Event Card
              <div className="group bg-white overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200">
                <div className="flex flex-col md:grid md:grid-cols-2 h-auto md:h-[360px]">
                  <div className="relative h-64 md:h-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                    {(featuredContent.data as LiveEvent).imageUrl ? (
                      <img
                        src={(featuredContent.data as LiveEvent).imageUrl || ''}
                        alt={(featuredContent.data as LiveEvent).title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="bg-secondary/10 h-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="text-9xl text-secondary/30" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md animate-pulse">
                        EN DIRECT
                      </span>
                    </div>
                  </div>
                  <div className="p-6 md:p-8 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                          {(featuredContent.data as LiveEvent).title.startsWith("DIRECT") ? "Événement en direct" : "EN DIRECT"} 
                        </span>
                        <span className="text-gray-500 text-xs">
                          {(featuredContent.data as LiveEvent).scheduledFor ? getTimeAgo((featuredContent.data as LiveEvent).scheduledFor || '') : "En cours"}
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl font-bold text-dark mb-4 transition-colors duration-300 group-hover:text-blue-600">
                        {(featuredContent.data as LiveEvent).title}
                      </h2>
                      <p className="text-dark/70 text-base mb-4">
                        {(featuredContent.data as LiveEvent).description}
                      </p>
                      
                      {/* Informations supplémentaires */}
                      <div className="border-t border-gray-100 pt-4 mb-4">
                        <h3 className="font-semibold text-dark mb-2">À propos de cet événement</h3>
                        <ul className="space-y-2 text-dark/70 text-sm">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>Diffusé simultanément sur notre chaîne YouTube</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span>
                              Animé par {(featuredContent.data as LiveEvent).editors && (featuredContent.data as LiveEvent).editors.length > 0 
                                ? (featuredContent.data as LiveEvent).editors.map(e => e.editor?.displayName).filter(Boolean).join(', ')
                                : "l'équipe éditoriale"}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-2">
                      {(featuredContent.data as LiveEvent).liveUrl && (
                        <Link href={(featuredContent.data as LiveEvent).liveUrl || ''}>
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                            <div className="flex items-center">
                              <div className="mr-2 w-2 h-2 rounded-full bg-white animate-pulse"></div>
                              Suivre l'événement
                            </div>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Featured Article Card
              <div className="group bg-white overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-200">
                <Link href={`/articles/${(featuredContent.data as Article).slug}`} className="block">
                  <div className="flex flex-col md:grid md:grid-cols-2 h-auto md:h-[360px]">
                    <div className="relative h-64 md:h-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                      {(featuredContent.data as Article).imageUrl ? (
                        <img
                          src={(featuredContent.data as Article).imageUrl}
                          alt={(featuredContent.data as Article).title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="bg-secondary/10 h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="text-9xl text-secondary/30" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 z-20">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                          En vedette
                        </span>
                      </div>
                    </div>
                    <div className="p-6 md:p-8 flex flex-col justify-between h-full">
                      <div>
                        <span
                          className="inline-block px-2 py-1 text-xs font-semibold rounded-full mb-4"
                          style={{
                            backgroundColor: getCategoryColor((featuredContent.data as Article).categoryId),
                            color: "#FFFFFF"
                          }}
                        >
                          {getCategoryName((featuredContent.data as Article).categoryId)}
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-dark mb-4 transition-colors duration-300 group-hover:text-blue-600">
                          {(featuredContent.data as Article).title}
                        </h2>
                        <p className="text-dark/70 text-base mb-6">
                          {(featuredContent.data as Article).excerpt}
                          <span className="hidden xl:inline"> 
                            Cette analyse approfondie explore les implications politiques, économiques et sociales de cet enjeu majeur.
                            Découvrez comment les différents acteurs politiques se positionnent et quelles pourraient être les conséquences 
                            à moyen et long terme pour notre société.
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-dark/60 text-sm">{getTimeAgo((featuredContent.data as Article).createdAt)}</span>
                        <span className="text-blue-600 text-sm font-medium group-hover:underline">Lire l'article complet</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </ScrollAnimation>
        )}

        {/* Recent News Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {/* Flash Info Cards (en premier dans la grille) */}
          {!isLoading && flashInfos && flashInfos.map((flashInfo, index) => (
            <ScrollAnimation threshold={0.1} delay={0.1 * index} key={flashInfo.id}>
              <div className="bg-white overflow-hidden rounded-xl shadow-xl border border-red-200 relative hover:shadow-2xl transition-all duration-300 h-full">
                <div className="absolute inset-y-0 left-0 w-2 bg-red-600"></div>
                <div className="p-5 pl-6 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                      Flash info
                    </span>
                    <span className="text-gray-500 text-xs">
                      {getTimeAgo(flashInfo.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-2 line-clamp-2 min-h-[3.5rem]">
                    {flashInfo.title}
                  </h3>
                  <p className="text-dark/70 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {flashInfo.content}
                  </p>
                  {flashInfo.imageUrl && (
                    <div className="overflow-hidden h-32 mb-4 rounded-lg">
                      <img 
                        src={flashInfo.imageUrl}
                        alt={flashInfo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="mt-auto flex justify-end">
                    {flashInfo.url ? (
                      <a 
                        href={flashInfo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 text-xs font-medium hover:underline cursor-pointer"
                      >
                        En savoir plus
                      </a>
                    ) : (
                      <span className="text-red-600 text-xs font-medium">En savoir plus</span>
                    )}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
          
          {/* Articles récents */}
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-80 w-full rounded-xl" />
                ))
            : displayedArticles.map((article, index) => (
                <ScrollAnimation 
                  key={article.id} 
                  threshold={0.1} 
                  delay={0.1 * index}
                >
                  <div className="news-card group rounded-xl overflow-hidden shadow-xl bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                    <Link href={`/articles/${article.slug}`} className="block w-full h-full">
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
                  </div>
                </ScrollAnimation>
              ))}
        </div>

        {/* Bouton "Voir tous nos articles" - uniquement sur mobile */}
        {isMobile && recent && recent.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link href="/articles">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Voir tous nos articles
              </Button>
            </Link>
          </div>
        )}

      </div>
    </section>
  );
};

export default NewsWall;