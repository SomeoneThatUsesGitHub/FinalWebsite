import React from "react";
import { ScrollAnimation } from "@/hooks/use-scroll-animation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type ApiVideo = {
  id: number;
  title: string;
  videoId: string;
  views: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
};

const VideosSection: React.FC = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  // Afficher seulement 2 vidéos sur mobile, 4 sur desktop
  const showCount = isMobile ? 2 : 4;
  
  // Récupérer les vidéos depuis l'API
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos'],
    refetchOnWindowFocus: false
  });

  return (
    <section className="pt-12 pb-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">
        <ScrollAnimation className="mb-10" threshold={0.1}>
          <div className="mb-4">
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark inline-block">Nos Vidéos</h2>
              <div className="absolute -bottom-2 left-0 w-24 h-1 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-gray-500 mb-10">
            Découvrez nos explications politiques et économiques en format court
          </p>
        </ScrollAnimation>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {isLoading ? (
            // Afficher des skeletons pendant le chargement
            Array(showCount)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="video-card relative rounded-xl overflow-hidden">
                  <Skeleton className="h-80 w-full" />
                </div>
              ))
          ) : error ? (
            // Afficher un message d'erreur
            <div className="col-span-full text-center py-10">
              <p className="text-red-500">Erreur lors du chargement des vidéos</p>
            </div>
          ) : (
            // Afficher les vidéos
            videos?.slice(0, showCount).map((video: ApiVideo, index: number) => (
              <ScrollAnimation 
                key={video.id} 
                threshold={0.1} 
                delay={0.1 * index}
              >
                <div className="video-card group relative overflow-hidden rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-white">
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${video.videoId}?controls=0&showinfo=0&rel=0&modestbranding=1`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-dark mb-2 line-clamp-2 min-h-[3rem]">
                      {video.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-dark/60 text-xs">{formatViews(video.views)} vues</span>
                      <span className="text-blue-600 text-xs font-medium group-hover:underline">Regarder</span>
                    </div>
                  </div>
                </div>
              </ScrollAnimation>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default VideosSection;