import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { PoliticalGlossaryTerm } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import parse from 'html-react-parser';
import DOMPurify from 'dompurify';

/**
 * Composant qui surligne automatiquement les termes du glossaire dans le contenu
 * et affiche leur définition lorsque l'utilisateur clique dessus
 */
export default function GlossaryHighlighter({ children }: { children: React.ReactNode }) {
  const [activeTermId, setActiveTermId] = useState<number | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Récupérer tous les termes du glossaire
  const { data: glossaryTerms, isLoading } = useQuery<PoliticalGlossaryTerm[]>({
    queryKey: ["/api/glossary"],
    refetchOnWindowFocus: false,
  });

  // Obtenir le terme actuellement actif
  const activeTerm = glossaryTerms?.find(term => term.id === activeTermId) || null;

  // Fonction pour gérer le clic sur un terme surligné
  const handleTermClick = (event: MouseEvent, termId: number) => {
    event.preventDefault();
    event.stopPropagation();

    // Calculer la position pour le tooltip
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    setPosition({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.bottom + window.scrollY,
    });
    
    setActiveTermId(termId);
  };

  // Fonction pour surligner les termes du glossaire dans le contenu HTML
  const highlightTermsInContent = useCallback((contentHtml: string) => {
    if (!glossaryTerms || glossaryTerms.length === 0) return contentHtml;

    // Trier les termes par longueur décroissante pour éviter les substitutions partielles
    const sortedTerms = [...glossaryTerms].sort(
      (a, b) => b.term.length - a.term.length
    );

    let highlightedHtml = contentHtml;

    // Remplacer chaque occurrence des termes par une version surlignée
    sortedTerms.forEach(term => {
      // Échapper les caractères spéciaux pour la regex
      const escapedTerm = term.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Créer un pattern qui respecte les limites de mots et est insensible à la casse
      const pattern = new RegExp(`\\b(${escapedTerm})\\b`, 'gi');
      
      // Remplacer par un span surligné avec data-id pour stocker l'ID du terme
      highlightedHtml = highlightedHtml.replace(
        pattern, 
        `<span class="glossary-term" data-term-id="${term.id}">$1</span>`
      );
    });

    return highlightedHtml;
  }, [glossaryTerms]);

  // Ajouter des event listeners pour les termes surlignés
  useEffect(() => {
    if (!contentRef.current) return;

    const handleClickOnTerm = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('glossary-term')) {
        const termId = parseInt(target.getAttribute('data-term-id') || '0', 10);
        if (termId) {
          handleTermClick(event as unknown as MouseEvent, termId);
        }
      }
    };

    contentRef.current.addEventListener('click', handleClickOnTerm);
    
    return () => {
      contentRef.current?.removeEventListener('click', handleClickOnTerm);
    };
  }, [glossaryTerms]);

  // Gérer le clic à l'extérieur pour fermer le tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).classList.contains('glossary-term')
      ) {
        setActiveTermId(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Ajouter des styles CSS pour les termes du glossaire
  useEffect(() => {
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

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Traiter le contenu React pour y insérer les termes surlignés
  const processContent = () => {
    if (!children || isLoading) return children;

    // Si l'enfant est un élément avec du HTML via dangerouslySetInnerHTML
    if (
      React.isValidElement(children) && 
      children.props && 
      children.props.dangerouslySetInnerHTML && 
      children.props.dangerouslySetInnerHTML.__html
    ) {
      const htmlContent = children.props.dangerouslySetInnerHTML.__html;
      const sanitizedHtml = DOMPurify.sanitize(htmlContent);
      const highlightedHtml = highlightTermsInContent(sanitizedHtml);
      
      // Cloner l'élément original avec le nouveau HTML traité
      return React.cloneElement(children, {
        dangerouslySetInnerHTML: { __html: highlightedHtml },
        suppressHydrationWarning: true
      });
    }

    // Pour les autres cas, retourner le contenu tel quel
    return children;
  };

  return (
    <div className="relative">
      <div ref={contentRef} className="glossary-highlighter">
        {processContent()}
      </div>
      
      {/* Tooltip pour afficher la définition */}
      {activeTerm && (
        <div
          ref={tooltipRef}
          className="fixed z-50 w-80 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y + 10}px`,
            transform: "translateX(-50%)",
          }}
        >
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-primary">{activeTerm.term}</h3>
                {activeTerm.category && (
                  <Badge variant="outline" className="ml-2">
                    {activeTerm.category}
                  </Badge>
                )}
              </div>
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