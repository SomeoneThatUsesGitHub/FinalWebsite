import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { getQueryFn } from "@/lib/queryClient";
import { Article, Category, FlashInfo } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, FileText, Tag, Eye, AlertCircle, Calendar, ZapIcon, Zap } from "lucide-react";

export default function AdminDashboard() {
  const [_, setLocation] = useLocation();
  
  // Récupérer les articles
  const { data: articles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Récupérer les catégories
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Récupérer les flash infos
  const { data: flashInfos, isLoading: flashInfosLoading } = useQuery<FlashInfo[]>({
    queryKey: ["/api/admin/flash-infos"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Statistiques pour le dashboard
  const stats = {
    articlesCount: articles?.length || 0,
    publishedArticlesCount: articles?.filter(article => article.published).length || 0,
    activeFlashInfosCount: flashInfos?.filter(flash => flash.active).length || 0,
    categoriesCount: categories?.length || 0,
  };
  
  // Derniers articles publiés (6 maximum)
  const latestArticles = articles
    ?.filter(article => article.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenue sur l'interface d'administration de Politiquensemble
          </p>
        </div>
        
        {/* Cards statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.articlesCount}</div>
              <p className="text-xs text-muted-foreground">
                Total des articles sur le site
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Publiés</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedArticlesCount}</div>
              <p className="text-xs text-muted-foreground">
                Articles visibles sur le site
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Flash infos</CardTitle>
              <Zap className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeFlashInfosCount}</div>
              <p className="text-xs text-muted-foreground">
                Flash infos actifs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Catégories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.categoriesCount}</div>
              <p className="text-xs text-muted-foreground">
                Catégories d'articles
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Derniers articles */}
          <Card className="col-span-1">
            <CardHeader className="pb-3">
              <CardTitle>Articles récents</CardTitle>
              <CardDescription>
                Les derniers articles publiés sur le site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {articlesLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
                </div>
              ) : latestArticles && latestArticles.length > 0 ? (
                <>
                  {latestArticles.map((article) => {
                    const category = categories?.find(c => c.id === article.categoryId);
                    return (
                      <div key={article.id} className="flex items-start space-x-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium line-clamp-1">{article.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {category && (
                              <span 
                                className="text-xs px-1.5 py-0.5 rounded-full" 
                                style={{ 
                                  backgroundColor: `${category.color}15`,
                                  color: category.color,
                                }}
                              >
                                {category.name}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {new Date(article.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setLocation(`/admin/articles/${article.id}`)}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setLocation("/admin/articles")}
                  >
                    Voir tous les articles
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">Aucun article publié</p>
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/admin/articles/new")}
                    className="mt-4"
                  >
                    Créer un article
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Liens rapides */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
              <CardDescription>
                Raccourcis vers les principales fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setLocation("/admin/articles/new")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Nouvel article
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setLocation("/admin/articles")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Gérer les articles
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setLocation("/admin/categories")}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Gérer les catégories
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setLocation("/admin/flash-infos")}
                >
                  <Zap className="mr-2 h-4 w-4 text-red-500" />
                  Flash infos
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start col-span-1 md:col-span-2"
                  onClick={() => setLocation("/home")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir le site
                </Button>
              </div>
              
              {/* Calendrier éditorial - à implémenter dans une future mise à jour */}
              <Card className="border-dashed">
                <CardHeader className="py-3">
                  <CardTitle className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Calendrier éditorial
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3 pt-0">
                  <p className="text-xs text-muted-foreground">
                    Fonctionnalité à venir : planification des articles et des événements
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}