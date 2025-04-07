import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
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
      className="w-full py-14 pb-20 bg-background"
    >
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center">
            <div className="w-2 h-8 bg-primary rounded-full mr-3"></div>
            <h2 className="text-2xl md:text-3xl font-bold">Nos Vidéos</h2>
          </div>
          <div className="h-[2px] w-12 bg-primary mt-2 mb-3"></div>
          <p className="text-muted-foreground">Découvrez nos shorts YouTube</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(limit)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex-shrink-0">
                  <Skeleton className="aspect-[9/16] w-full rounded-lg" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos && videos.map((video: Video) => (
              <YouTubeShort 
                key={video.id}
                videoId={video.videoId}
                title={video.title}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default VideosSection;
