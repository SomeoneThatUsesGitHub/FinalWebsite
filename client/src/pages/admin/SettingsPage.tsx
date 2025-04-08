import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Article, Category } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileEdit, Eye, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useLocation } from "wouter";

export default function SettingsPage() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("articles");

  // Récupérer les articles de l'utilisateur connecté
  const { data: userArticles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/auth/my-articles"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Récupérer les catégories pour l'affichage des étiquettes
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (!user) {
    return (
      <AdminLayout title="Paramètres">
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Session expirée</h3>
            <p className="text-muted-foreground mt-2">Veuillez vous reconnecter</p>
            <Button 
              variant="default" 
              className="mt-4"
              onClick={() => setLocation("/auth")}
            >
              Se connecter
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Trier et grouper les articles
  const publishedArticles = userArticles?.filter(article => article.published) || [];
  const draftArticles = userArticles?.filter(article => !article.published) || [];

  return (
    <AdminLayout title="Paramètres">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mon profil</CardTitle>
            <CardDescription>Informations sur votre compte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-2xl">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{user.displayName || user.username}</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant={user.role === "admin" || user.isAdmin ? "default" : "secondary"}>
                    {user.role === "admin" || user.isAdmin ? "Administrateur" : "Éditeur"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">@{user.username}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mes publications</CardTitle>
            <CardDescription>
              Gérez vos articles et suivez leurs statistiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="articles" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="articles">
                  Tous ({userArticles?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="published">
                  Publiés ({publishedArticles.length})
                </TabsTrigger>
                <TabsTrigger value="drafts">
                  Brouillons ({draftArticles.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="articles" className="space-y-4">
                {articlesLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : userArticles && userArticles.length > 0 ? (
                  <>
                    {userArticles.map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        categories={categories || []} 
                        onEdit={() => setLocation(`/admin/articles/${article.id}`)}
                        onView={() => setLocation(`/articles/${article.slug}`)}
                      />
                    ))}
                  </>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucun article</h3>
                    <p className="text-muted-foreground mt-2">Vous n'avez pas encore créé d'articles</p>
                    <Button 
                      variant="default" 
                      className="mt-4"
                      onClick={() => setLocation("/admin/articles/new")}
                    >
                      Créer un article
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="published" className="space-y-4">
                {articlesLoading ? (
                  <div className="space-y-4">
                    {Array(2).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : publishedArticles.length > 0 ? (
                  <>
                    {publishedArticles.map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        categories={categories || []} 
                        onEdit={() => setLocation(`/admin/articles/${article.id}`)}
                        onView={() => setLocation(`/articles/${article.slug}`)}
                      />
                    ))}
                  </>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucun article publié</h3>
                    <p className="text-muted-foreground mt-2">Vous n'avez pas encore d'articles publiés</p>
                    <Button 
                      variant="default" 
                      className="mt-4"
                      onClick={() => setLocation("/admin/articles/new")}
                    >
                      Créer un article
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="drafts" className="space-y-4">
                {articlesLoading ? (
                  <div className="space-y-4">
                    {Array(2).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : draftArticles.length > 0 ? (
                  <>
                    {draftArticles.map(article => (
                      <ArticleCard 
                        key={article.id} 
                        article={article} 
                        categories={categories || []} 
                        onEdit={() => setLocation(`/admin/articles/${article.id}`)}
                        isDraft
                      />
                    ))}
                  </>
                ) : (
                  <div className="text-center py-10">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucun brouillon</h3>
                    <p className="text-muted-foreground mt-2">Vous n'avez pas de brouillons en cours</p>
                    <Button 
                      variant="default" 
                      className="mt-4"
                      onClick={() => setLocation("/admin/articles/new")}
                    >
                      Créer un article
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface ArticleCardProps {
  article: Article;
  categories: Category[];
  onEdit: () => void;
  onView?: () => void;
  isDraft?: boolean;
}

function ArticleCard({ article, categories, onEdit, onView, isDraft }: ArticleCardProps) {
  const category = categories.find(c => c.id === article.categoryId);
  
  return (
    <div className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {category && (
              <Badge 
                variant="outline"
                style={{ 
                  backgroundColor: `${category.color}15`,
                  color: category.color,
                  borderColor: category.color
                }}
              >
                {category.name}
              </Badge>
            )}
            {article.featured && (
              <Badge variant="secondary">À la une</Badge>
            )}
            {isDraft && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                Brouillon
              </Badge>
            )}
          </div>
          <h3 className="font-medium text-lg">{article.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(article.createdAt), "d MMMM yyyy", { locale: fr })}</span>
            </div>
            {article.published && (
              <>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{article.viewCount}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <FileEdit className="h-4 w-4" />
            <span className="sr-only md:not-sr-only md:ml-2">Modifier</span>
          </Button>
          {onView && article.published && (
            <Button variant="ghost" size="sm" onClick={onView}>
              <Eye className="h-4 w-4" />
              <span className="sr-only md:not-sr-only md:ml-2">Voir</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}