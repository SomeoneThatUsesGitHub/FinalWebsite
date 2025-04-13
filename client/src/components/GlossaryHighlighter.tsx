import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { PoliticalGlossaryTerm } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import DOMPurify from 'dompurify';

/**
 * Composant qui surligne automatiquement les termes du glossaire dans le contenu
 * et affiche leur définition lorsque l'utilisateur clique dessus
 */
export default function GlossaryHighlighter({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTerm, setActiveTerm] = useState<PoliticalGlossaryTerm | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  
  // Détecter les appareils mobiles
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Récupérer tous les termes du glossaire
  const { data: glossaryTerms } = useQuery<PoliticalGlossaryTerm[]>({
    queryKey: ["/api/glossary"],
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!contentRef.current || !glossaryTerms || glossaryTerms.length === 0) return;

    // Créer une feuille de style pour les termes du glossaire
    const style = document.createElement('style');
    style.innerHTML = `
      .glossary-term {
        position: relative;
        display: inline;
        background-color: rgba(59, 130, 246, 0.1);
        border-bottom: 1px dashed rgba(59, 130, 246, 0.5);
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      .glossary-term:hover {
        background-color: rgba(59, 130, 246, 0.2);
      }
    `;
    document.head.appendChild(style);

    // Attendre que le contenu soit rendu
    setTimeout(() => {
      if (!contentRef.current) return;
      
      // Obtenir tout le texte HTML du contenu
      const contentHtml = contentRef.current.innerHTML;
      
      // Traiter le HTML pour surligner les termes
      let processedHtml = contentHtml;
      
      // Trier les termes par longueur décroissante pour éviter les substitutions partielles
      const sortedTerms = [...glossaryTerms].sort(
        (a, b) => b.term.length - a.term.length
      );
      
      // Surligner chaque occurrence des termes
      sortedTerms.forEach(term => {
        // Échapper les caractères spéciaux pour la regex
        const escapedTerm = term.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Créer un pattern qui respecte les limites de mots et est insensible à la casse
        const pattern = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
        
        // Remplacer par un span surligné avec data-id pour stocker l'ID du terme
        processedHtml = processedHtml.replace(
          pattern, 
          `<span class="glossary-term" data-term-id="${term.id}">$1</span>`
        );
      });
      
      // Sanitiser le HTML final avant de l'insérer
      const sanitizedHtml = DOMPurify.sanitize(processedHtml);
      
      // Mettre à jour le contenu
      contentRef.current.innerHTML = sanitizedHtml;
      
      // Ajouter des écouteurs d'événements aux termes surlignés
      const terms = contentRef.current.querySelectorAll('.glossary-term');
      terms.forEach(termElement => {
        termElement.addEventListener('click', (e) => {
          e.preventDefault();
          
          const termId = parseInt(termElement.getAttribute('data-term-id') || '0', 10);
          const term = glossaryTerms.find(t => t.id === termId);
          
          if (term) {
            // Calculer la position pour le tooltip
            const rect = termElement.getBoundingClientRect();
            setTooltipPosition({
              x: rect.left + window.scrollX + rect.width / 2,
              y: rect.bottom + window.scrollY,
            });
            
            setActiveTerm(term);
          }
        });
      });
    }, 100);

    // Nettoyer les styles lors du démontage
    return () => {
      document.head.removeChild(style);
    };
  }, [glossaryTerms]);

  // Bloquer le défilement du body quand le modal est ouvert
  useEffect(() => {
    if (activeTerm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTerm]);

  return (
    <div className="relative">
      <div 
        ref={contentRef} 
        className={`glossary-highlighter ${activeTerm ? 'blur-sm' : ''}`}
      >
        {children}
      </div>
      
      {/* Modal de définition du glossaire */}
      {activeTerm && (
        <>
          {/* Overlay sombre pour le fond */}
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setActiveTerm(null)}
          />
          
          {/* Contenu du modal */}
          <div className="fixed z-50 inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-300"
              style={{
                maxHeight: 'calc(100vh - 3rem)',
              }}
            >
              <Card className="border-primary/20 shadow-xl overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  <Button 
                    onClick={() => setActiveTerm(null)}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <X size={16} />
                  </Button>
                </div>
                
                <CardContent className="p-6 pt-5">
                  <div className="flex flex-col mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="font-bold text-xl text-primary">{activeTerm.term}</h2>
                      
                      {activeTerm.category && (
                        <Badge variant="outline" className="ml-2 mt-1">
                          {activeTerm.category}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="h-1 w-16 bg-primary/20 rounded mb-3" />
                  
                    <p className="text-base">{activeTerm.definition}</p>
                    
                    {activeTerm.examples && (
                      <div className="mt-4 text-sm bg-muted p-3 rounded-md">
                        <strong>Exemple :</strong> {activeTerm.examples}
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="p-6 pt-0 flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    — Décodeur politique de Politiquensemble
                  </p>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTerm(null)}
                  >
                    Fermer
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </>
      )}
      
      {/* Bouton flottant pour fermer (version mobile) */}
      {activeTerm && isMobile && (
        <div className="fixed bottom-4 inset-x-0 z-[60] flex justify-center">
          <Button 
            variant="default"
            size="lg"
            className="shadow-xl"
            onClick={() => setActiveTerm(null)}
          >
            Fermer
          </Button>
        </div>
      )}
    </div>
  );
}