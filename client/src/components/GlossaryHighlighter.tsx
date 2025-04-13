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
  const [dialogPosition, setDialogPosition] = useState({ top: 0, left: 0 });

  // Récupérer tous les termes du glossaire
  const { data: glossaryTerms } = useQuery<PoliticalGlossaryTerm[]>({
    queryKey: ["/api/glossary"],
    refetchOnWindowFocus: false,
  });

  // Surligner les termes du glossaire dans le contenu HTML
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
      .glossary-dialog {
        position: fixed;
        z-index: 50;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        max-width: 90%;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        padding: 1rem;
        border: 1px solid #e2e8f0;
      }
      .glossary-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 40;
      }
      .glossary-close {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: #f1f5f9;
        border: none;
        color: #64748b;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .glossary-title {
        font-size: 1.25rem;
        font-weight: bold;
        color: #3b82f6;
        margin: 0 0 0.5rem 0;
        padding-right: 1.5rem;
        word-break: break-word;
      }
      .glossary-category {
        display: inline-block;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        background: #f1f5f9;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }
      .glossary-definition {
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
        word-break: break-word;
      }
      .glossary-examples {
        font-size: 0.8rem;
        padding: 0.5rem;
        background: #f8fafc;
        border-radius: 4px;
        margin-bottom: 0.75rem;
      }
      .glossary-footer {
        font-size: 0.7rem;
        color: #64748b;
        text-align: center;
        margin-bottom: 0.5rem;
      }
      .glossary-btn {
        display: block;
        width: 100%;
        padding: 0.5rem;
        background: #f1f5f9;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
        text-align: center;
      }
      .glossary-btn:hover {
        background: #e2e8f0;
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
            setActiveTerm(term);
            
            // Bloquer le défilement
            document.body.style.overflow = 'hidden';
          }
        });
      });
    }, 100);

    // Nettoyer les styles lors du démontage
    return () => {
      document.head.removeChild(style);
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