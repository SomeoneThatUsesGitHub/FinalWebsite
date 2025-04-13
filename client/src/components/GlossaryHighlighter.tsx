import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { PoliticalGlossaryTerm } from "@shared/schema";
import { getQueryFn } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Composant qui permet de surligner des termes dans un contenu et d'afficher
 * leur définition lorsqu'ils sont sélectionnés
 */
export default function GlossaryHighlighter({ children }: { children: React.ReactNode }) {
  const [selectedText, setSelectedText] = useState("");
  const [glossaryTerm, setGlossaryTerm] = useState<PoliticalGlossaryTerm | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Récupérer tous les termes du glossaire
  const { data: glossaryTerms, isLoading } = useQuery<PoliticalGlossaryTerm[]>({
    queryKey: ["/api/glossary"],
    refetchOnWindowFocus: false,
  });

  // Fonction pour vérifier si un texte sélectionné correspond à un terme du glossaire
  const findGlossaryTerm = useCallback((text: string) => {
    if (!glossaryTerms || !text) return null;
    
    // Normaliser le texte (supprimer la ponctuation, mettre en minuscule)
    const normalizedText = text.trim().toLowerCase();
    
    // Vérifier si le texte correspond exactement à un terme du glossaire
    const exactMatch = glossaryTerms.find(
      term => term.term.toLowerCase() === normalizedText
    );
    if (exactMatch) return exactMatch;
    
    // Vérifier si le texte contient un terme du glossaire
    for (const term of glossaryTerms) {
      const termLower = term.term.toLowerCase();
      if (normalizedText.includes(termLower)) {
        return term;
      }
    }
    
    return null;
  }, [glossaryTerms]);

  // Gérer la sélection de texte
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      // Pas de sélection, on garde le tooltip affiché si l'utilisateur est en train de le consulter
      if (tooltipRef.current && tooltipRef.current.contains(document.activeElement)) {
        return;
      }
      
      // Sinon, on efface la sélection actuelle
      setSelectedText("");
      setGlossaryTerm(null);
      return;
    }
    
    const text = selection.toString().trim();
    if (text.length > 1) {
      setSelectedText(text);
      
      // Calculer la position pour le tooltip
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setPosition({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.bottom + window.scrollY,
      });
      
      // Chercher si un terme correspond
      const term = findGlossaryTerm(text);
      setGlossaryTerm(term);
    }
  }, [findGlossaryTerm]);

  // Ajouter des event listeners pour la sélection de texte
  useEffect(() => {
    const contentElement = contentRef.current;
    if (!contentElement) return;
    
    contentElement.addEventListener("mouseup", handleTextSelection);
    contentElement.addEventListener("touchend", handleTextSelection);
    
    return () => {
      contentElement.removeEventListener("mouseup", handleTextSelection);
      contentElement.removeEventListener("touchend", handleTextSelection);
    };
  }, [handleTextSelection]);

  // Gérer le clic à l'extérieur pour fermer le tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setSelectedText("");
        setGlossaryTerm(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div ref={contentRef} className="glossary-highlighter">
        {children}
      </div>
      
      {/* Tooltip pour afficher la définition */}
      {selectedText && glossaryTerm && (
        <div
          ref={tooltipRef}
          className="absolute z-50 w-80 animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y + 10}px`,
            transform: "translateX(-50%)",
          }}
        >
          <Card className="border-primary/20 shadow-lg">
            <CardContent className="pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-primary">{glossaryTerm.term}</h3>
                {glossaryTerm.category && (
                  <Badge variant="outline" className="ml-2">
                    {glossaryTerm.category}
                  </Badge>
                )}
              </div>
              <p className="text-sm">{glossaryTerm.definition}</p>
              
              {glossaryTerm.examples && (
                <div className="mt-2 text-sm text-muted-foreground">
                  <strong>Exemple:</strong> {glossaryTerm.examples}
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