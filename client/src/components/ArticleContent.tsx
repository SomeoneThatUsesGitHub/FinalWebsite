import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import ArticleEmbed from './editor/ArticleEmbed';
import { Article } from '@shared/schema';

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
      const variant = embed.getAttribute('data-variant') as 'default' | 'compact' || 'default';
      
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
      
      // Rend le composant React dans cet élément
      const root = document.createElement('div');
      container.appendChild(root);
      
      // Remplace l'élément d'origine par le conteneur
      embed.replaceWith(container);
      
      // Utilisation d'une IIFE pour capturer les variables dans la closure
      (function(rootElement, articleData, variantType) {
        // Création manuelle du DOM pour l'affichage de l'article intégré
        const card = document.createElement('div');
        card.className = `article-embed ${variantType === 'compact' ? 'article-embed-compact' : 'article-embed-default'}`;
        
        // Création du lien et de l'image
        const link = document.createElement('a');
        link.href = `/articles/${articleData.slug}`;
        link.className = 'article-embed-link';
        
        // Structure de base
        const content = document.createElement('div');
        content.className = 'article-embed-content';
        
        // Image si disponible
        if (articleData.imageUrl) {
          const imgContainer = document.createElement('div');
          imgContainer.className = 'article-embed-image';
          
          const img = document.createElement('img');
          img.src = articleData.imageUrl;
          img.alt = articleData.title || '';
          
          imgContainer.appendChild(img);
          link.appendChild(imgContainer);
        }
        
        // Contenu textuel
        const title = document.createElement('h3');
        title.textContent = articleData.title || '';
        title.className = 'article-embed-title';
        content.appendChild(title);
        
        if (articleData.excerpt && variantType !== 'compact') {
          const excerpt = document.createElement('p');
          excerpt.textContent = articleData.excerpt;
          excerpt.className = 'article-embed-excerpt';
          content.appendChild(excerpt);
        }
        
        const readMore = document.createElement('div');
        readMore.className = 'article-embed-read-more';
        readMore.textContent = 'Lire l\'article →';
        content.appendChild(readMore);
        
        link.appendChild(content);
        card.appendChild(link);
        rootElement.appendChild(card);
      })(root, article, variant);
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
          overflow: hidden;
          border: 1px solid #e5f0ff;
          border-radius: 0.5rem;
          margin: 1rem 0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          transition: box-shadow 0.2s;
        }
        
        .article-embed:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .article-embed-default {
          max-width: 350px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .article-embed-compact {
          width: 100%;
        }
        
        .article-embed-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }
        
        .article-embed-compact .article-embed-link {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .article-embed-image {
          overflow: hidden;
          background-color: #f5f5f5;
        }
        
        .article-embed-default .article-embed-image {
          height: 180px;
        }
        
        .article-embed-compact .article-embed-image {
          width: 6rem;
          height: 6rem;
          min-width: 6rem;
        }
        
        .article-embed-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }
        
        .article-embed-link:hover .article-embed-image img {
          transform: scale(1.05);
        }
        
        .article-embed-content {
          padding: 1rem;
        }
        
        .article-embed-compact .article-embed-content {
          padding: 0.5rem;
          flex: 1;
        }
        
        .article-embed-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .article-embed-default .article-embed-title {
          font-size: 1.125rem;
        }
        
        .article-embed-compact .article-embed-title {
          font-size: 0.875rem;
        }
        
        .article-embed-excerpt {
          color: #666;
          font-size: 0.875rem;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .article-embed-read-more {
          color: #3b82f6;
          font-size: 0.875rem;
          font-weight: 500;
          display: flex;
          align-items: center;
        }
      ` }} />
    </div>
  );
};

export default ArticleContent;