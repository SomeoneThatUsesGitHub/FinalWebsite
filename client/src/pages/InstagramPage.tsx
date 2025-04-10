import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Type pour les publications Instagram
type InstagramPost = {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  timestamp: string;
  children?: { data: { id: string; media_url: string; media_type: string }[] };
};

const InstagramPage: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    fetchInstagramPosts();
  }, []);

  // Cette fonction récupère les posts Instagram
  // Note: Vous aurez besoin d'une API réelle et d'un token
  const fetchInstagramPosts = async () => {
    try {
      setLoading(true);
      
      // À ce stade, nous utilisons des données statiques pour la démo
      // En production, cette partie serait remplacée par un appel API réel
      const samplePosts: InstagramPost[] = [
        {
          id: '1',
          media_url: '/assets/instagram-politiquensemble.jpg',
          permalink: 'https://www.instagram.com/p/sample1/',
          caption: 'Publication récente de Politiquensemble',
          media_type: 'IMAGE',
          timestamp: '2023-05-01T12:00:00Z'
        },
        // Nous simulons une collection pour la démonstration
        {
          id: '2',
          media_url: '/assets/instagram-politiquensemble.jpg',
          permalink: 'https://www.instagram.com/p/sample2/',
          caption: 'Une autre publication de Politiquensemble',
          media_type: 'CAROUSEL_ALBUM',
          timestamp: '2023-04-28T10:30:00Z',
          children: {
            data: [
              {
                id: '2.1',
                media_url: '/assets/instagram-politiquensemble.jpg',
                media_type: 'IMAGE'
              },
              {
                id: '2.2',
                media_url: '/assets/instagram-politiquensemble.jpg',
                media_type: 'IMAGE'
              }
            ]
          }
        }
      ];
      
      setPosts(samplePosts);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des posts Instagram:', err);
      setError('Impossible de charger les publications Instagram. Veuillez réessayer plus tard.');
      setLoading(false);
    }
  };

  const openPost = (post: InstagramPost) => {
    setSelectedPost(post);
    setCurrentSlideIndex(0);
  };

  const closePost = () => {
    setSelectedPost(null);
  };

  const nextSlide = () => {
    if (!selectedPost?.children?.data) return;
    setCurrentSlideIndex((prev) => 
      prev < selectedPost.children.data.length - 1 ? prev + 1 : prev
    );
  };

  const prevSlide = () => {
    if (!selectedPost?.children?.data) return;
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Obtenir la bonne URL d'image pour l'affichage actuel
  const getCurrentMediaUrl = () => {
    if (!selectedPost) return '';
    
    if (selectedPost.media_type === 'CAROUSEL_ALBUM' && selectedPost.children?.data) {
      return selectedPost.children.data[currentSlideIndex].media_url;
    }
    
    return selectedPost.media_url;
  };

  // Vérifier si le post actuel est un carrousel
  const isCarousel = () => {
    return selectedPost?.media_type === 'CAROUSEL_ALBUM' && 
           selectedPost.children?.data && 
           selectedPost.children.data.length > 1;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center">Notre Instagram</h1>
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => (
              <div 
                key={post.id} 
                className="aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer relative group"
                onClick={() => openPost(post)}
              >
                <img 
                  src={post.media_url} 
                  alt={post.caption || 'Publication Instagram Politiquensemble'} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Indicateur de carrousel */}
                {post.media_type === 'CAROUSEL_ALBUM' && (
                  <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Modal pour afficher la publication sélectionnée */}
          <Dialog open={!!selectedPost} onOpenChange={(open) => !open && closePost()}>
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
              <div className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                {/* Zone d'image/carousel */}
                <div className="relative w-full md:w-2/3 aspect-square md:aspect-auto bg-black">
                  <img 
                    src={getCurrentMediaUrl()} 
                    alt={selectedPost?.caption || 'Publication Instagram'} 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Boutons de navigation du carrousel */}
                  {isCarousel() && (
                    <>
                      <button 
                        onClick={prevSlide} 
                        disabled={currentSlideIndex === 0}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 disabled:opacity-50"
                        aria-label="Image précédente"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button 
                        onClick={nextSlide} 
                        disabled={currentSlideIndex === (selectedPost?.children?.data.length || 1) - 1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 disabled:opacity-50"
                        aria-label="Image suivante"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                      
                      {/* Indicateurs de position */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                        {selectedPost?.children?.data.map((_, idx) => (
                          <div 
                            key={idx} 
                            className={`h-2 w-2 rounded-full ${
                              idx === currentSlideIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  
                  {/* Bouton fermer */}
                  <button 
                    onClick={closePost}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-2"
                    aria-label="Fermer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Zone de texte et détails */}
                <div className="w-full md:w-1/3 p-4">
                  <ScrollArea className="h-full max-h-[300px] md:max-h-none">
                    <h3 className="font-bold text-lg mb-2">Politiquensemble</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {selectedPost?.caption || 'Aucune description disponible.'}
                    </p>
                    <div className="text-xs text-gray-500">
                      {selectedPost?.timestamp && new Date(selectedPost.timestamp).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <a 
                      href={selectedPost?.permalink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block mt-4 text-blue-600 hover:underline text-sm"
                    >
                      Voir sur Instagram
                    </a>
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
      
      <div className="mt-12 text-center">
        <a 
          href="https://www.instagram.com/politiquensemble/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="mr-2">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          Nous suivre sur Instagram
        </a>
      </div>
      
      <div className="mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-4">À propos de notre Instagram</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Suivez Politiquensemble sur Instagram pour découvrir nos dernières publications, 
          actualités et partager notre contenu pédagogique. Nous utilisons cette plateforme 
          pour rendre l'information politique accessible à tous.
        </p>
      </div>
    </div>
  );
};

export default InstagramPage;