import React from 'react';
import { BookOpen } from 'lucide-react';

interface ArticleSourcesProps {
  sources: string | null | undefined;
}

export function ArticleSources({ sources }: ArticleSourcesProps) {
  if (!sources) return null;

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <BookOpen className="h-4 w-4" />
        <h3 className="font-medium">Sources</h3>
      </div>
      <div className="text-sm text-muted-foreground">
        {sources}
      </div>
    </div>
  );
}