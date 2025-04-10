import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
// Cette page n'utilise pas de Layout car App.tsx ajoute déjà le Header et Footer
import { Card } from "@/components/ui/card";
import { Loader2, Instagram, AlertCircle, ExternalLink, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Type pour les posts Instagram
type InstagramPost = {
  id: string;
  media_type: string;
  media_url: string;
  permalink: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  children?: {
    media_url: string;
    media_type: string;
  }[];
};

const InstagramPage = () => {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  // Récupérer les posts Instagram via l'API
  const { data, isLoading, error } = useQuery<{ posts: InstagramPost[], error?: string }>({
    queryKey: ["/api/instagram"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Actualiser le cache Instagram
  const refreshCache = async () => {
    try {
      const response = await fetch("/api/instagram/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Cache actualisé",
          description: "Les publications Instagram ont été actualisées.",
        });
        
        // Recharger la page pour afficher les nouvelles données
        window.location.reload();
      } else {
        toast({
          title: "Erreur d'actualisation",
          description: result.message || "Une erreur est survenue lors de l'actualisation du cache.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur d'actualisation",
        description: "Une erreur est survenue lors de l'actualisation du cache.",
        variant: "destructive",
      });
    }
  };

  // Ferme la visionneuse d'image en grande taille
  const closeViewer = () => {
    setSelectedPost(null);
    setCurrentImageIndex(0);
  };

  // Naviguer entre les images d'un post carrousel
  const navigateCarousel = (direction: "next" | "prev") => {
    if (!selectedPost || !selectedPost.children) return;
    
    if (direction === "next") {
      setCurrentImageIndex(prev => 
        prev < selectedPost.children!.length - 1 ? prev + 1 : 0
      );
    } else {
      setCurrentImageIndex(prev => 
        prev > 0 ? prev - 1 : selectedPost.children!.length - 1
      );
    }
  };

  // Fermer la visionneuse quand on appuie sur Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeViewer();
      } else if (e.key === "ArrowRight" && selectedPost?.children) {
        navigateCarousel("next");
      } else if (e.key === "ArrowLeft" && selectedPost?.children) {
        navigateCarousel("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost]);

  // Formater la date de publication relative
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: fr
      });
    } catch (e) {
      return "Date inconnue";
    }
  };

  return (
    <>
      <Helmet>
        <title>Instagram | Politiquensemble</title>
        <meta name="description" content="Suivez-nous sur Instagram pour des actualités politiques en temps réel." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <Instagram className="mr-3 h-8 w-8 text-[#E1306C]" />
              Notre Instagram
            </h1>
            <p className="text-lg text-gray-600">
              Suivez nos publications Instagram pour des actualités et annonces exclusives
            </p>
          </div>
          
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={() => refreshCache()}
          >
            <span>Actualiser</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg text-gray-600">Chargement des publications Instagram...</p>
          </div>
        ) : error || data?.error ? (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Erreur de connexion</h2>
              <p className="text-gray-600 mb-6">
                {data?.error || "Impossible de récupérer les publications Instagram. Veuillez réessayer plus tard."}
              </p>
              <Button variant="default" onClick={() => refreshCache()}>
                Réessayer
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {data?.posts && data.posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {data.posts.map((post) => (
                  <div 
                    key={post.id}
                    className="relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <img
                      src={post.media_type === "VIDEO" ? post.thumbnail_url || post.media_url : post.media_url}
                      alt={post.caption || "Publication Instagram"}
                      className="w-full h-full object-cover"
                    />
                    {post.children && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                          <path d="M9 2v20" />
                        </svg>
                      </div>
                    )}
                    {post.media_type === "VIDEO" && (
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="6 3 18 12 6 21 6 3"></polygon>
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <p className="text-white text-sm font-medium line-clamp-1">
                        {formatDate(post.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-lg text-gray-600">Aucune publication Instagram disponible pour le moment.</p>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Visionneuse de post en grand */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={closeViewer}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative bg-black flex-1 aspect-square md:max-w-[60%]">
                {selectedPost.media_type === "VIDEO" ? (
                  <video 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain"
                    src={selectedPost.media_url}
                  />
                ) : (
                  <img 
                    src={selectedPost.children 
                      ? selectedPost.children[currentImageIndex].media_url 
                      : selectedPost.media_url
                    }
                    alt={selectedPost.caption || "Publication Instagram"}
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Boutons navigation carrousel */}
                {selectedPost.children && selectedPost.children.length > 1 && (
                  <>
                    <button 
                      className="absolute top-1/2 -translate-y-1/2 left-2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateCarousel("prev");
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button 
                      className="absolute top-1/2 -translate-y-1/2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateCarousel("next");
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                    
                    {/* Indicateur de position */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
                      {selectedPost.children.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-5 flex flex-col flex-1 max-h-[40vh] md:max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Publication Instagram</h3>
                  <div className="flex space-x-2">
                    <a 
                      href={selectedPost.permalink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink size={20} />
                    </a>
                    <button onClick={closeViewer} className="text-gray-600 hover:text-gray-800">
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500 mb-2">
                  {formatDate(selectedPost.timestamp)}
                </div>
                
                {selectedPost.caption && (
                  <p className="text-gray-800 whitespace-pre-line mb-4">
                    {selectedPost.caption}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Note: Cette page fonctionne sans <Layout> car App.tsx ajoute déjà le Header et Footer

export default InstagramPage;