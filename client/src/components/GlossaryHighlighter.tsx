import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { PoliticalGlossaryTerm } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { X } from "lucide-react";
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

  // Gérer le clic en dehors pour fermer le tooltip
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.classList.contains('glossary-term')) {
        setActiveTerm(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div ref={contentRef} className="glossary-highlighter">
        {children}
      </div>
      
      {/* Tooltip pour afficher la définition */}
      {activeTerm && (
        <div
          className="fixed z-50 w-[calc(100%-32px)] sm:w-80 max-w-md animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: isMobile ? '50%' : `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y + 10}px`,
            transform: 'translateX(-50%)',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}
        >
          <Card className="border-primary/20 shadow-lg">
            <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={() => setActiveTerm(null)}
                className="rounded-full p-1 bg-gray-50 hover:bg-gray-100 text-gray-500"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>
            <CardContent className="pt-4 pb-2">
              <div className="flex items-center justify-between pr-6 mb-2">
                <h3 className="font-bold text-lg text-primary">{activeTerm.term}</h3>
                {activeTerm.category && (
                  <Badge variant="outline" className="ml-2 hidden sm:inline-flex">
                    {activeTerm.category}
                  </Badge>
                )}
              </div>
              {activeTerm.category && (
                <Badge variant="outline" className="mb-2 sm:hidden">
                  {activeTerm.category}
                </Badge>
              )}
              <p className="text-sm">{activeTerm.definition}</p>
              
              {activeTerm.examples && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <strong>Exemple:</strong> {activeTerm.examples}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 pb-2">
              <p className="text-xs text-muted-foreground">
                — Décodeur politique de Politiquensemble
              </p>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}