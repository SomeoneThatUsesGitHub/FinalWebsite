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
      embedCard.className = 'w-full border border-gray-200 bg-white rounded-md shadow-sm overflow-hidden my-4';
      
      // Création du lien
      const link = document.createElement('a');
      link.href = `/articles/${article.slug}`;
      link.className = 'block';
      
      // Structure de la carte d'article
      const flexContainer = document.createElement('div');
      flexContainer.className = 'flex flex-col sm:flex-row';
      
      // Section du contenu principal
      const contentSection = document.createElement('div');
      contentSection.className = 'flex-1 p-4';
      
      // Titre de l'article
      const title = document.createElement('h3');
      title.textContent = article.title || '';
      title.className = 'font-semibold text-gray-800 text-lg mb-2 line-clamp-2';
      contentSection.appendChild(title);
      
      // Métadonnées (date et temps de lecture)
      const metaContainer = document.createElement('div');
      metaContainer.className = 'flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500 mt-2';
      
      const publishedDate = document.createElement('span');
      const dateStr = article.createdAt ? formatDate(article.createdAt, "dd MMMM yyyy 'à' HH'h'mm") : '';
      publishedDate.textContent = `Publié le ${dateStr}`;
      metaContainer.appendChild(publishedDate);
      
      const readTimeContainer = document.createElement('div');
      readTimeContainer.className = 'flex items-center';
      
      const clockIcon = document.createElement('span');
      clockIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      clockIcon.className = 'mr-1';
      
      const readTime = document.createElement('span');
      readTime.textContent = 'Lecture 3 min.';
      
      readTimeContainer.appendChild(clockIcon);
      readTimeContainer.appendChild(readTime);
      metaContainer.appendChild(readTimeContainer);
      
      contentSection.appendChild(metaContainer);
      
      // Image de l'article à droite
      const imageContainer = document.createElement('div');
      imageContainer.className = 'relative h-40 sm:h-auto sm:w-32 md:w-40 border-t sm:border-t-0 sm:border-l border-gray-100';
      
      if (article.imageUrl) {
        const img = document.createElement('img');
        img.src = article.imageUrl;
        img.alt = article.title || '';
        img.className = 'w-full h-full object-cover';
        imageContainer.appendChild(img);
      }
      
      // Assembler tous les éléments
      flexContainer.appendChild(contentSection);
      flexContainer.appendChild(imageContainer);
      
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
        /* Styles pour l'affichage mobile des classes Tailwind */
        @media (max-width: 640px) {
          .sm\\:h-auto {
            height: 180px !important;
          }
          
          .sm\\:w-32, .md\\:w-40 {
            width: 100% !important;
          }
          
          .sm\\:flex-row {
            flex-direction: column !important;
          }
          
          .sm\\:border-t-0 {
            border-top-width: 1px !important;
          }
          
          .sm\\:border-l {
            border-left-width: 0 !important;
          }
          
          .sm\\:items-center {
            align-items: flex-start !important;
          }
          
          .gap-2 > *:not(:first-child) {
            margin-top: 0.5rem !important;
            margin-left: 0 !important;
          }
        }
      ` }} />
    </div>
  );
};

export default ArticleContent;