import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { PoliticalGlossaryTerm } from "@shared/schema";
import DOMPurify from 'dompurify';

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
          `<span class="glossary-term" data-term-id="${term.id}" style="background-color: rgba(59, 130, 246, 0.1); border-bottom: 1px dashed rgba(59, 130, 246, 0.5); cursor: pointer;">$1</span>`
        );
      });
      
      // Sanitiser le HTML final avant de l'insérer
      const sanitizedHtml = DOMPurify.sanitize(processedHtml);
      
      // Mettre à jour le contenu
      contentRef.current.innerHTML = sanitizedHtml;
      
      // Ajouter des écouteurs d'événements aux termes surlignés
      const terms = contentRef.current.querySelectorAll('[data-term-id]');
      terms.forEach(termElement => {
        termElement.addEventListener('click', (e) => {
          e.preventDefault();
          
          const termId = parseInt(termElement.getAttribute('data-term-id') || '0', 10);
          const term = glossaryTerms.find(t => t.id === termId);
          
          if (term) {
            setActiveTerm(term);
          }
        });
      });
    }, 100);
  }, [glossaryTerms]);

  const handleClose = () => {
    setActiveTerm(null);
  };

  // Ce style force l'élément à ne pas dépasser de l'écran
  const modalStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '85vw',
    width: '300px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    padding: '1rem',
    zIndex: 9999,
    boxSizing: 'border-box',
    margin: '0 auto',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 9998,
  };

  return (
    <>
      <div ref={contentRef} className="glossary-highlighter w-full">
        {children}
      </div>
      
      {/* Overlay et modal */}
      {activeTerm && (
        <>
          <div style={overlayStyle} onClick={handleClose} />
          <div
            style={modalStyle}
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-title"
          >
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#f1f5f9',
                border: 'none',
                color: '#64748b',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            
            <h3
              id="glossary-title"
              style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#3b82f6',
                margin: '0 0 0.5rem 0',
                paddingRight: '1.5rem',
                wordBreak: 'break-word',
              }}
            >
              {activeTerm.term}
            </h3>
            
            {activeTerm.category && (
              <div
                style={{
                  display: 'inline-block',
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.5rem',
                  background: '#f1f5f9',
                  borderRadius: '4px',
                  marginBottom: '0.5rem',
                }}
              >
                {activeTerm.category}
              </div>
            )}
            
            <p
              style={{
                fontSize: '0.9rem',
                marginBottom: '0.75rem',
                wordBreak: 'break-word',
              }}
            >
              {activeTerm.definition}
            </p>
            
            {activeTerm.examples && (
              <div
                style={{
                  fontSize: '0.8rem',
                  padding: '0.5rem',
                  background: '#f8fafc',
                  borderRadius: '4px',
                  marginBottom: '0.75rem',
                }}
              >
                <strong>Exemple : </strong>
                {activeTerm.examples}
              </div>
            )}
            
            <div
              style={{
                fontSize: '0.7rem',
                color: '#64748b',
                textAlign: 'center',
                marginBottom: '0.5rem',
              }}
            >
              Décodeur politique de Politiquensemble
            </div>
            
            <button
              onClick={handleClose}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              Fermer
            </button>
          </div>
        </>
      )}
    </>
  );
}