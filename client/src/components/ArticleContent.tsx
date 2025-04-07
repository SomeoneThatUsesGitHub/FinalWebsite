import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Article } from '@shared/schema';
import { formatDate } from '@/lib/utils';

interface ArticleContentProps {
  content: string;
}

const ArticleContent: React.FC<ArticleContentProps> = ({ content }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { data: articles } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
  });

  useEffect(() => {
    if (!contentRef.current || !articles) return;

    // Trouve tous les éléments d'intégration d'articles
    const embeds = contentRef.current.querySelectorAll('div[data-type="article-embed"]');

    embeds.forEach(embed => {
      const articleId = Number(embed.getAttribute('data-article-id'));
      const articleSlug = embed.getAttribute('data-article-slug');
      
      if (!articleId && !articleSlug) return;

      // Trouve l'article correspondant
      const article = articles.find(a => 
        (articleId && a.id === articleId) || 
        (articleSlug && a.slug === articleSlug)
      );

      if (!article) return;

      // Crée un nouvel élément pour l'intégration
      const container = document.createElement('div');
      container.className = 'article-embed-container';
      
      // Remplace l'élément d'origine par le conteneur
      embed.replaceWith(container);
      
      // Création manuelle du DOM pour l'affichage de l'article intégré
      const embedCard = document.createElement('div');
      embedCard.className = 'w-full rounded-lg border border-blue-100 bg-white my-6 shadow-sm hover:shadow transition-all duration-200';
      
      // Création du lien
      const link = document.createElement('a');
      link.href = `/articles/${article.slug}`;
      
      // Structure de la carte d'article
      const flexContainer = document.createElement('div');
      flexContainer.className = 'flex flex-col sm:flex-row w-full';
      
      // Image (à gauche sur desktop, en haut sur mobile)
      if (article.imageUrl) {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'sm:w-1/3 md:w-1/4 h-48 shrink-0 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none p-0';
        
        // Utilisation du background CSS au lieu d'une image pour un meilleur contrôle
        imageContainer.style.background = `url(${article.imageUrl}) top/cover no-repeat`;
        imageContainer.style.backgroundPosition = '0 0';
        imageContainer.style.backgroundOrigin = 'border-box';
        imageContainer.style.margin = '0';
        imageContainer.style.padding = '0';
        
        flexContainer.appendChild(imageContainer);
      }
      
      // Section du contenu principal
      const contentSection = document.createElement('div');
      contentSection.className = 'p-4 flex flex-col justify-between flex-grow';
      
      // Div pour le titre et le résumé
      const textContent = document.createElement('div');
      
      // Titre de l'article
      const title = document.createElement('h3');
      title.textContent = article.title || '';
      title.className = 'font-bold text-gray-800 text-xl mb-2 line-clamp-2';
      textContent.appendChild(title);
      
      // Extrait de l'article
      if (article.excerpt) {
        const excerpt = document.createElement('p');
        excerpt.textContent = article.excerpt;
        excerpt.className = 'text-gray-600 mb-4 line-clamp-2 text-sm';
        textContent.appendChild(excerpt);
      }
      
      contentSection.appendChild(textContent);
      
      // Métadonnées (date et temps de lecture)
      const metaContainer = document.createElement('div');
      metaContainer.className = 'flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2';
      
      const dateContainer = document.createElement('span');
      dateContainer.className = 'flex items-center';
      
      const calendarIcon = document.createElement('span');
      calendarIcon.innerHTML = `<svg class="w-4 h-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" /></svg>`;
      
      const publishedDate = document.createElement('span');
      const dateStr = article.createdAt ? formatDate(article.createdAt, "dd MMM yyyy") : '';
      publishedDate.textContent = `Publié le ${dateStr}`;
      
      dateContainer.appendChild(calendarIcon);
      dateContainer.appendChild(publishedDate);
      metaContainer.appendChild(dateContainer);
      
      const readTimeContainer = document.createElement('span');
      readTimeContainer.className = 'flex items-center';
      
      const clockIcon = document.createElement('span');
      clockIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-1"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      
      const readTime = document.createElement('span');
      readTime.textContent = 'Lecture 3 min.';
      
      readTimeContainer.appendChild(clockIcon);
      readTimeContainer.appendChild(readTime);
      metaContainer.appendChild(readTimeContainer);
      
      contentSection.appendChild(metaContainer);
      
      // Assembler tous les éléments
      flexContainer.appendChild(contentSection);
      
      link.appendChild(flexContainer);
      embedCard.appendChild(link);
      container.appendChild(embedCard);
    });
  }, [content, articles]);

  return (
    <div className="article-content-wrapper">
      <div 
        ref={contentRef}
        className="article-content" 
        dangerouslySetInnerHTML={{ __html: content }} 
      />
      <style dangerouslySetInnerHTML={{ __html: `
        /* Styles supplémentaires pour assurer la compatibilité mobile */
        @media (max-width: 640px) {
          /* Assure que l'image est affichée en haut en mobile */
          .article-content-wrapper .sm\\:flex-row {
            flex-direction: column !important;
          }
          
          /* Garantit que l'image est bien arrondie en mobile */
          .article-content-wrapper .sm\\:rounded-l-lg {
            border-top-left-radius: 0.5rem !important;
            border-top-right-radius: 0.5rem !important;
            border-bottom-left-radius: 0 !important;
          }
          
          .article-content-wrapper .sm\\:rounded-tr-none {
            border-top-right-radius: 0.5rem !important;
          }
          
          /* Assure que l'image prend toute la largeur en mobile */
          .article-content-wrapper .sm\\:w-1\\/3,
          .article-content-wrapper .md\\:w-1\\/4 {
            width: 100% !important;
          }
          
          /* Garantit une bonne hauteur fixe pour l'image en mobile */
          .article-content-wrapper .h-48 {
            height: 12rem !important;
          }
          
          /* Ajuste les marges pour le mobile */
          .article-content-wrapper .flex-wrap {
            gap: 0.5rem !important;
          }
          
          .article-content-wrapper .gap-4 > * {
            margin-right: 1rem !important;
          }
        }
        
        /* Améliore l'apparence au survol */
        .article-content-wrapper a:hover {
          text-decoration: none;
        }
      ` }} />
    </div>
  );
};

export default ArticleContent;