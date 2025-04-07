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
      embedCard.className = 'article-embed';
      
      // Création du lien
      const link = document.createElement('a');
      link.href = `/articles/${article.slug}`;
      link.className = 'article-embed-link';
      
      // Structure de la carte d'article
      const flexContainer = document.createElement('div');
      flexContainer.className = 'article-embed-flex';
      
      // Indication de catégorie (jaune à gauche)
      const categoryMarker = document.createElement('div');
      categoryMarker.className = 'article-embed-category';
      const categoryText = document.createElement('span');
      categoryText.textContent = 'CAT';
      categoryMarker.appendChild(categoryText);
      
      // Section du contenu principal
      const contentSection = document.createElement('div');
      contentSection.className = 'article-embed-content';
      
      // Titre de l'article
      const title = document.createElement('h3');
      title.textContent = article.title || '';
      title.className = 'article-embed-title';
      contentSection.appendChild(title);
      
      // Métadonnées (date et temps de lecture)
      const metaContainer = document.createElement('div');
      metaContainer.className = 'article-embed-meta';
      
      const publishedDate = document.createElement('span');
      const dateStr = article.createdAt ? formatDate(article.createdAt, "dd MMMM yyyy 'à' HH'h'mm") : '';
      publishedDate.textContent = `Publié le ${dateStr}`;
      metaContainer.appendChild(publishedDate);
      
      const readTimeContainer = document.createElement('div');
      readTimeContainer.className = 'article-embed-read-time';
      
      const clockIcon = document.createElement('span');
      clockIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
      clockIcon.className = 'article-embed-clock-icon';
      
      const readTime = document.createElement('span');
      readTime.textContent = 'Lecture 3 min.';
      
      readTimeContainer.appendChild(clockIcon);
      readTimeContainer.appendChild(readTime);
      metaContainer.appendChild(readTimeContainer);
      
      contentSection.appendChild(metaContainer);
      
      // Image de l'article à droite
      const imageContainer = document.createElement('div');
      imageContainer.className = 'article-embed-image';
      
      if (article.imageUrl) {
        const img = document.createElement('img');
        img.src = article.imageUrl;
        img.alt = article.title || '';
        imageContainer.appendChild(img);
      }
      
      // Assembler tous les éléments
      flexContainer.appendChild(categoryMarker);
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
        .article-embed {
          width: 100%;
          border: 1px solid #e5e7eb;
          background-color: white;
          margin: 1.5rem 0;
          transition: box-shadow 0.2s;
        }
        
        .article-embed:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .article-embed-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        
        .article-embed-flex {
          display: flex;
          align-items: stretch;
        }
        
        .article-embed-category {
          width: 3rem;
          background-color: #fbbf24;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .article-embed-category span {
          color: white;
          font-weight: bold;
          font-size: 0.75rem;
          text-transform: uppercase;
          transform: rotate(-90deg);
        }
        
        .article-embed-content {
          flex: 1;
          padding: 1rem;
        }
        
        .article-embed-title {
          font-weight: 600;
          font-size: 1.125rem;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1.4;
        }
        
        .article-embed-meta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }
        
        .article-embed-read-time {
          display: flex;
          align-items: center;
        }
        
        .article-embed-clock-icon {
          display: inline-flex;
          margin-right: 0.25rem;
        }
        
        .article-embed-clock-icon svg {
          width: 0.875rem;
          height: 0.875rem;
        }
        
        .article-embed-image {
          width: 8rem;
          background-color: #f3f4f6;
          overflow: hidden;
        }
        
        .article-embed-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        @media (max-width: 640px) {
          .article-embed-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }
          
          .article-embed-image {
            width: 6rem;
          }
        }
      ` }} />
    </div>
  );
};

export default ArticleContent;