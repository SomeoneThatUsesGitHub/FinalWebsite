import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, FileText, CheckCircle2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from '@/lib/queryClient';
import { Article, Category } from '@shared/schema';
import { Label } from '@/components/ui/label';

interface ArticleSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (article: Article) => void;
}

export function ArticleSelector({ open, onOpenChange, onSelect }: ArticleSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  // Récupération des articles et catégories
  const { data: articles = [] } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
  });

  // Filtrer les articles en fonction des critères de recherche
  const filteredArticles = articles.filter((article) => {
    // Filtre par catégorie
    if (selectedCategoryId && selectedCategoryId !== 'all' && article.categoryId !== parseInt(selectedCategoryId)) {
      return false;
    }
    
    // Filtre par terme de recherche
    if (searchTerm) {
      return (
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return true;
  });

  const handleSelect = () => {
    if (selectedArticle) {
      onSelect(selectedArticle);
      onOpenChange(false);
      // Réinitialiser l'état après la sélection
      setSelectedArticle(null);
      setSearchTerm('');
      setSelectedCategoryId('all');
    }
  };

  useEffect(() => {
    // Réinitialiser la sélection lorsque le dialogue s'ouvre
    if (open) {
      setSelectedArticle(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sélectionner un article à intégrer</DialogTitle>
          <DialogDescription>
            Recherchez et sélectionnez un article à intégrer dans votre contenu
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher des articles..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className={`relative p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedArticle?.id === article.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedArticle(article)}
              >
                <div className="flex items-start gap-3">
                  {article.imageUrl ? (
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{article.title}</h4>
                    {article.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {article.excerpt}
                      </p>
                    )}
                  </div>
                  {selectedArticle?.id === article.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary absolute top-3 right-3" />
                  )}
                </div>
              </div>
            ))}
            {filteredArticles.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun article trouvé correspondant à vos critères de recherche
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSelect} disabled={!selectedArticle}>
            Insérer l'article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ArticleSelector;