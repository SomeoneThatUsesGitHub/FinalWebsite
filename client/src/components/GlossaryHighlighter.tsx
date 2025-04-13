import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { PoliticalGlossaryTerm } from "@shared/schema";
import DOMPurify from 'dompurify';
import './GlossaryModal.css';

/**
 * Composant qui surligne automatiquement les termes du glossaire dans le contenu
 * et affiche leur définition lorsque l'utilisateur clique dessus
 */
export default function GlossaryHighlighter({ children }: { children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTerm, setActiveTerm] = useState<PoliticalGlossaryTerm | null>(null);

  // Récupérer tous les termes du glossaire
  const { data: glossaryTerms } = useQuery<PoliticalGlossaryTerm[]>({
    queryKey: ["/api/glossary"],
    refetchOnWindowFocus: false,
  });

  // Surligner les termes du glossaire dans le contenu HTML
  useEffect(() => {
    if (!contentRef.current || !glossaryTerms || glossaryTerms.length === 0) return;

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
            setActiveTerm(term);
            
            // Bloquer le défilement
            document.body.style.overflow = 'hidden';
          }
        });
      });
    }, 100);

    return () => {
      // Réactiver le défilement au démontage
      document.body.style.overflow = '';
    };
  }, [glossaryTerms]);

  // Réinitialiser le défilement lorsque le modal est fermé
  useEffect(() => {
    if (!activeTerm) {
      document.body.style.overflow = '';
    }
  }, [activeTerm]);

  const handleClose = () => {
    setActiveTerm(null);
  };

  return (
    <div className="relative">
      <div 
        ref={contentRef} 
        className="glossary-highlighter"
      >
        {children}
      </div>
      
      {/* Modal de définition du glossaire */}
      {activeTerm && (
        <>
          <div className="glossary-overlay" onClick={handleClose}></div>
          <div className="glossary-dialog">
            <button className="glossary-close" onClick={handleClose}>×</button>
            
            <h3 className="glossary-title">{activeTerm.term}</h3>
            
            {activeTerm.category && (
              <div className="glossary-category">{activeTerm.category}</div>
            )}
            
            <p className="glossary-definition">{activeTerm.definition}</p>
            
            {activeTerm.examples && (
              <div className="glossary-examples">
                <strong>Exemple : </strong>{activeTerm.examples}
              </div>
            )}
            
            <div className="glossary-footer">
              Décodeur politique de Politiquensemble
            </div>
            
            <button className="glossary-btn" onClick={handleClose}>
              Fermer
            </button>
          </div>
        </>
      )}
    </div>
  );
}