import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Article, Category } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  FileText,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function ArticlesPage() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "all">("all");
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Récupérer les articles
  const {
    data: articles,
    isLoading: articlesLoading,
    isError: articlesError,
  } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Récupérer les catégories
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Mutation pour supprimer un article
  const deleteArticleMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la suppression",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  // Filtrer les articles
  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || article.categoryId === categoryFilter;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Configuration de la table
  const columns = [
    {
      accessorKey: "title",
      header: "Titre",
      cell: ({ row }: any) => {
        const article = row.original as Article;
        return (
          <div className="max-w-[500px]">
            <div className="font-medium line-clamp-1">{article.title}</div>
            <div className="text-sm text-muted-foreground line-clamp-1">
              {article.excerpt}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "categoryId",
      header: "Catégorie",
      cell: ({ row }: any) => {
        const article = row.original as Article;
        const category = categories?.find(c => c.id === article.categoryId);
        
        if (!category) return <span className="text-muted-foreground">-</span>;
        
        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor: `${category.color}20`, // Add transparency
              color: category.color,
              borderColor: category.color,
            }}
          >
            {category.name}
          </Badge>
        );
      },
    },
    {
      accessorKey: "published",
      header: "Statut",
      cell: ({ row }: any) => {
        const article = row.original as Article;
        return article.published ? (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
            <Eye className="mr-1 h-3 w-3" /> Publié
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
            <EyeOff className="mr-1 h-3 w-3" /> Brouillon
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }: any) => {
        const article = row.original as Article;
        return <span>{formatDate(article.createdAt, "dd/MM/yyyy")}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const article = row.original as Article;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/articles/${article.slug}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" /> Voir
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/articles/${article.id}`}>
                  <Pencil className="mr-2 h-4 w-4" /> Modifier
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => {
                  setDeleteArticleId(article.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleDeleteConfirm = () => {
    if (deleteArticleId) {
      deleteArticleMutation.mutate(deleteArticleId);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
            <p className="text-muted-foreground mt-2">
              Gérez les articles publiés sur Politiquensemble
            </p>
          </div>
          <Button asChild>
            <Link href="/admin/articles/new">
              <Plus className="mr-2 h-4 w-4" /> Nouvel article
            </Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative w-full sm:w-auto flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Label htmlFor="category-filter" className="hidden sm:block whitespace-nowrap">
              Catégorie:
            </Label>
            <Select
              value={categoryFilter.toString()}
              onValueChange={(value) => setCategoryFilter(value === "all" ? "all" : parseInt(value))}
            >
              <SelectTrigger id="category-filter" className="w-full sm:w-[180px]">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {articlesLoading || categoriesLoading ? (
          <div className="flex items-center justify-center h-96">
            <FileText className="h-8 w-8 animate-pulse text-muted-foreground" />
          </div>
        ) : articlesError ? (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="text-red-500">Une erreur est survenue lors du chargement des articles.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/articles"] })}
            >
              Réessayer
            </Button>
          </div>
        ) : filteredArticles.length > 0 ? (
          <DataTable columns={columns} data={filteredArticles} />
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Aucun article trouvé</h3>
            <p className="text-muted-foreground mt-1 max-w-md">
              {searchTerm || categoryFilter !== "all" 
                ? "Essayez de modifier vos filtres de recherche." 
                : "Commencez par créer votre premier article."}
            </p>
            {!searchTerm && categoryFilter === "all" && (
              <Button className="mt-4" asChild>
                <Link href="/admin/articles/new">
                  <Plus className="mr-2 h-4 w-4" /> Créer un article
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'article</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteArticleMutation.isPending}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={deleteArticleMutation.isPending}
            >
              {deleteArticleMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}