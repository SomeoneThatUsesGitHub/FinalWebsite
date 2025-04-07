import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Play, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// Fonction pour formatter le nombre de vues
const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
};

const VideosSection: React.FC = () => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Animation au scroll
  const { controls, ref } = useScrollAnimation();

  // Limite de vidéos à afficher (2 sur mobile, 4 sur desktop)
  const limit = isMobile ? 2 : 4;

  // Récupérer les vidéos depuis l'API
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos', limit],
    queryFn: async () => {
      const res = await fetch(`/api/videos?limit=${limit}`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des vidéos");
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  // Fonction pour vérifier si le scroll est possible
  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // Marge de 5px pour éviter les problèmes de précision
    }
  };

  // Fonction pour scroller horizontalement
  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400; // Quantité de scroll en pixels
      const newScrollLeft = 
        direction === "left" 
          ? scrollRef.current.scrollLeft - scrollAmount 
          : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth"
      });
    }
  };

  // Fonction pour ouvrir une vidéo YouTube
  const openYouTubeVideo = (videoId: string) => {
    window.open(`https://youtube.com/watch?v=${videoId}`, '_blank');
  };

  return (
    <motion.section 
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full py-14 bg-background"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Nos Vidéos</h2>
          
          {!isMobile && videos && videos.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className={cn(
                  "rounded-full",
                  !canScrollLeft && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className={cn(
                  "rounded-full",
                  !canScrollRight && "opacity-50 cursor-not-allowed"
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(limit)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/20 rounded-lg">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <h3 className="text-lg font-bold">Impossible de charger les vidéos</h3>
            <p className="text-muted-foreground">
              Veuillez réessayer ultérieurement.
            </p>
          </div>
        ) : (
          <ScrollArea 
            className="w-full" 
            ref={scrollRef} 
            onScroll={checkScrollButtons}
            onMouseEnter={checkScrollButtons}
          >
            <div className="flex space-x-4 pb-4">
              {videos && videos.map((video: Video) => (
                <Card
                  key={video.id}
                  className="flex-shrink-0 overflow-hidden w-full sm:w-[280px] md:w-[320px] cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => openYouTubeVideo(video.videoId)}
                >
                  <div className="relative aspect-video overflow-hidden group">
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-90 transition-opacity">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                        <Play className="h-6 w-6 fill-current" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold line-clamp-2 mb-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground">{formatViews(video.views || 0)} vues</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>
    </motion.section>
  );
};

export default VideosSection;