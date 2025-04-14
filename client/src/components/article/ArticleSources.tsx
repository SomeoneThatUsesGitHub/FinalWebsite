import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

interface Source {
  url: string;
  name: string;
}

interface ArticleSourcesProps {
  sources: string | null | undefined;
}

export function ArticleSources({ sources }: ArticleSourcesProps) {
  if (!sources) return null;

  const renderSources = () => {
    try {
      // Essayer de parser comme JSON (nouveau format)
      const parsedSources = JSON.parse(sources) as Source[];
      
      if (Array.isArray(parsedSources) && parsedSources.length > 0) {
        return (
          <ul className="list-none space-y-1">
            {parsedSources.map((source, index) => (
              <li key={index} className="flex items-center gap-1">
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {source.name}
                </a>
              </li>
            ))}
          </ul>
        );
      }
      
      return <div className="text-sm text-muted-foreground">{sources}</div>;
    } catch (e) {
      // Si ce n'est pas du JSON valide, afficher comme texte simple (ancien format)
      return <div className="text-sm text-muted-foreground">{sources}</div>;
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <BookOpen className="h-4 w-4" />
        <h3 className="font-medium">Sources</h3>
      </div>
      <div className="text-sm">
        {renderSources()}
      </div>
    </div>
  );
}