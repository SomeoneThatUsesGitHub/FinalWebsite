import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Article, Category, insertArticleSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, ArrowLeft, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Schéma de validation étendu pour le formulaire
const articleFormSchema = insertArticleSchema
  .extend({
    content: z.string().min(20, "Le contenu doit contenir au moins 20 caractères"),
    imageUrl: z.string().url("Veuillez fournir une URL d'image valide").nullable().optional(),
    categoryId: z.number().or(z.string().transform(val => parseInt(val, 10))),
    published: z.boolean().default(false),
    featured: z.boolean().default(false),
  })
  .omit({ createdAt: true, updatedAt: true, viewCount: true, commentCount: true });

type ArticleFormValues = z.infer<typeof articleFormSchema>;

// Formulaire de création d'article (nouveau)
function NewArticleForm({ categories }: { categories: Category[] }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewHtml, setPreviewHtml] = useState("");
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      categoryId: 1,
      published: false,
      featured: false,
    }
  });
  
  // Observer les changements de contenu pour la prévisualisation
  form.watch((value) => {
    if (value.content) {
      setPreviewHtml(value.content as string);
    }
  });
  
  // Génération auto du slug depuis le titre
  form.watch((value, { name }) => {
    if (name === "title" && value.title && !form.getValues("slug")) {
      const slug = value.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    }
  });
  
  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      const formattedData = {
        ...data,
        categoryId: Number(data.categoryId),
        imageUrl: data.imageUrl || null,
      };
      console.log("Données pour création:", formattedData);
      const res = await apiRequest("POST", "/api/admin/articles", formattedData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article créé",
        description: "L'article a été créé avec succès"
      });
      setLocation(`/admin/articles/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la création",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: ArticleFormValues) => {
    createArticleMutation.mutate(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              variant="outline" 
              size="icon"
              onClick={() => setLocation("/admin/articles")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Nouvel article
              </h1>
              <p className="text-muted-foreground mt-2">
                Créez un nouvel article pour Politiquensemble
              </p>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={createArticleMutation.isPending}
          >
            {createArticleMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Créer
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informations de l'article</CardTitle>
              <CardDescription>
                Remplissez les informations principales de l'article
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Titre de l'article"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  placeholder="slug-de-article"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  L'URL de l'article sera : /articles/<span className="font-mono">{form.watch("slug") || "slug-de-article"}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Résumé</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Un bref résumé de l'article (affiché sur les cartes et les listes)"
                  rows={3}
                  {...form.register("excerpt")}
                />
                {form.formState.errors.excerpt && (
                  <p className="text-sm text-red-500">{form.formState.errors.excerpt.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de l'image principale</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  {...form.register("imageUrl")}
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
                )}
              </div>
              
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="editor">Éditeur</TabsTrigger>
                  <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="space-y-2">
                  <Label htmlFor="content">Contenu de l'article (HTML)</Label>
                  <Textarea
                    id="content"
                    placeholder="Contenu de l'article en HTML"
                    rows={15}
                    {...form.register("content")}
                    className="font-mono text-sm"
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                  )}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md p-4 min-h-[300px] prose max-w-none">
                    {previewHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    ) : (
                      <p className="text-muted-foreground text-center py-10">
                        Le contenu s'affichera ici lorsque vous commencerez à écrire.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Panneau latéral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Catégorie</CardTitle>
                <CardDescription>
                  Sélectionnez la catégorie de l'article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.watch("categoryId")?.toString() || ""}
                  onValueChange={(value) => form.setValue("categoryId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-red-500 mt-2">{form.formState.errors.categoryId.message}</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Visibilité</CardTitle>
                <CardDescription>
                  Paramètres de publication de l'article
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="published" 
                    checked={form.watch("published")}
                    onCheckedChange={(checked) => form.setValue("published", !!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="published">Publié</Label>
                    <p className="text-sm text-muted-foreground">
                      L'article sera visible sur le site
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="featured" 
                    checked={form.watch("featured")}
                    onCheckedChange={(checked) => form.setValue("featured", !!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="featured">À la une</Label>
                    <p className="text-sm text-muted-foreground">
                      L'article sera mis en avant sur la page d'accueil
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}

// Formulaire de modification d'article
function EditArticleForm({ article, categories }: { article: Article, categories: Category[] }) {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewHtml, setPreviewHtml] = useState(article.content || "");
  
  console.log("EDIT FORM - Article data:", article);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content,
      imageUrl: article.imageUrl || "",
      categoryId: article.categoryId,
      published: Boolean(article.published),
      featured: Boolean(article.featured),
    }
  });
  
  // Observer les changements de contenu pour la prévisualisation
  form.watch((value) => {
    if (value.content) {
      setPreviewHtml(value.content as string);
    }
  });
  
  const updateArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      const formattedData = {
        ...data,
        categoryId: Number(data.categoryId),
        imageUrl: data.imageUrl || null,
      };
      console.log("Données pour mise à jour:", formattedData);
      const res = await apiRequest("PUT", `/api/admin/articles/${params.id}`, formattedData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: "Article mis à jour",
        description: "L'article a été mis à jour avec succès"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la mise à jour",
        variant: "destructive"
      });
    }
  });
  
  const onSubmit = (data: ArticleFormValues) => {
    updateArticleMutation.mutate(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              variant="outline" 
              size="icon"
              onClick={() => setLocation("/admin/articles")}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Modifier l'article : {article.title}
              </h1>
              <p className="text-muted-foreground mt-2">
                Modifiez les informations de l'article
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <a href={`/articles/${article.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="mr-2 h-4 w-4" /> Voir l'article
              </a>
            </Button>
            
            <Button
              type="submit"
              disabled={updateArticleMutation.isPending}
            >
              {updateArticleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Enregistrer
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Informations de l'article</CardTitle>
              <CardDescription>
                Modifiez les informations principales de l'article
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  placeholder="Titre de l'article"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  placeholder="slug-de-article"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  L'URL de l'article sera : /articles/<span className="font-mono">{form.watch("slug") || article.slug}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excerpt">Résumé</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Un bref résumé de l'article (affiché sur les cartes et les listes)"
                  rows={3}
                  {...form.register("excerpt")}
                />
                {form.formState.errors.excerpt && (
                  <p className="text-sm text-red-500">{form.formState.errors.excerpt.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">URL de l'image principale</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  {...form.register("imageUrl")}
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
                )}
              </div>
              
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="editor">Éditeur</TabsTrigger>
                  <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="space-y-2">
                  <Label htmlFor="content">Contenu de l'article (HTML)</Label>
                  <Textarea
                    id="content"
                    placeholder="Contenu de l'article en HTML"
                    rows={15}
                    {...form.register("content")}
                    className="font-mono text-sm"
                  />
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                  )}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md p-4 min-h-[300px] prose max-w-none">
                    {previewHtml ? (
                      <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                    ) : (
                      <p className="text-muted-foreground text-center py-10">
                        Le contenu s'affichera ici lorsque vous commencerez à écrire.
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Panneau latéral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Catégorie</CardTitle>
                <CardDescription>
                  Sélectionnez la catégorie de l'article
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={form.watch("categoryId")?.toString() || (article.categoryId?.toString() || "1")}
                  onValueChange={(value) => form.setValue("categoryId", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-red-500 mt-2">{form.formState.errors.categoryId.message}</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Visibilité</CardTitle>
                <CardDescription>
                  Paramètres de publication de l'article
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="published" 
                    checked={form.watch("published")}
                    onCheckedChange={(checked) => form.setValue("published", !!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="published">Publié</Label>
                    <p className="text-sm text-muted-foreground">
                      L'article sera visible sur le site
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="featured" 
                    checked={form.watch("featured")}
                    onCheckedChange={(checked) => form.setValue("featured", !!checked)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="featured">À la une</Label>
                    <p className="text-sm text-muted-foreground">
                      L'article sera mis en avant sur la page d'accueil
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}

// Component principal qui décide quel formulaire afficher
export default function EditArticlePage() {
  const params = useParams();
  const isNewArticle = !params.id;
  const [location, setLocation] = useLocation();
  
  // Récupérer l'article si on est en mode édition
  const {
    data: article,
    isLoading: articleLoading,
    isError: articleError,
  } = useQuery<Article>({
    queryKey: ["/api/admin/articles", params.id],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !isNewArticle,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  console.log("Main component - Article data:", article);
  
  // Afficher un loader pendant le chargement initial
  if ((!isNewArticle && articleLoading) || categoriesLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // Afficher une erreur si l'article n'est pas trouvé
  if (!isNewArticle && articleError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <h1 className="text-2xl font-bold text-red-500">Article non trouvé</h1>
          <p className="text-muted-foreground mt-2">L'article que vous cherchez n'existe pas ou a été supprimé.</p>
          <Button className="mt-4" onClick={() => setLocation("/admin/articles")}>
            Retour à la liste des articles
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  // Retourner le formulaire approprié (nouveau ou édition)
  return (
    <AdminLayout>
      {isNewArticle ? (
        <NewArticleForm categories={categories || []} />
      ) : (
        article && <EditArticleForm article={article} categories={categories || []} />
      )}
    </AdminLayout>
  );
}