import React, { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// Composant pour l'iframe YouTube Shorts
const YouTubeShort = ({ videoId, title }: { videoId: string; title: string }) => {
  return (
    <div className="flex-shrink-0 w-full sm:w-[280px] md:w-[320px] overflow-hidden">
      <div className="aspect-[9/16] relative">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0&amp;controls=1&amp;showinfo=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-lg shadow-md"
        ></iframe>
      </div>
    </div>
  );
};

const VideosSection: React.FC = () => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Animation au scroll
  const { controls, ref } = useScrollAnimation();

  // Limite de vidéos à afficher (3 sur mobile, 4 sur desktop)
  const limit = isMobile ? 3 : 4;

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
          <div className="flex items-center">
            <div className="w-2 h-8 bg-primary rounded-full mr-3"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Nos Vidéos</h2>
          </div>
          
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(limit)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <Skeleton className="aspect-[9/16] w-full rounded-lg" />
                  <Skeleton className="h-5 w-full mt-2" />
                </div>
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
            <div className="flex space-x-6 pb-4">
              {videos && videos.map((video: Video) => (
                <YouTubeShort 
                  key={video.id}
                  videoId={video.videoId}
                  title={video.title}
                />
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