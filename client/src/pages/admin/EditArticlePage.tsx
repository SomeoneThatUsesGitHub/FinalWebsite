import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { insertArticleSchema, Article, Category } from "@shared/schema";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ArticlePreview } from "@/components/admin/ArticlePreview";

// Schéma de validation pour le formulaire d'article
const articleFormSchema = insertArticleSchema
  .extend({
    // Renforcer la validation du slug pour qu'il ait au moins 3 caractères
    slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères")
      .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"),
    content: z.string().min(20, "Le contenu doit contenir au moins 20 caractères"),
    imageUrl: z.string().url("Veuillez fournir une URL d'image valide").nullable().optional(),
    sources: z.string().optional(),  // Champ pour les sources (optionnel)
    categoryId: z.number().or(z.string().transform(val => parseInt(val, 10))),
    published: z.boolean().default(false),
    featured: z.boolean().default(false),
  });

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
      sources: "",  // Champ pour les sources
      categoryId: 1,
      published: false,
      featured: false,
    }
  });
  
  const [editorKey, setEditorKey] = useState(0);
  
  // Génération automatique du slug à partir du titre
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "title" && value.title && !form.getValues("slug")) {
        // Simple version sans bibliothèque
        const slug = value.title
          .toLowerCase()
          .replace(/[àáâãäå]/g, 'a')
          .replace(/[èéêë]/g, 'e')
          .replace(/[ìíîï]/g, 'i')
          .replace(/[òóôõö]/g, 'o')
          .replace(/[ùúûü]/g, 'u')
          .replace(/[ç]/g, 'c')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        form.setValue("slug", slug, { shouldDirty: true });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Mutation pour créer un article
  const createArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      const response = await apiRequest("POST", "/api/admin/articles", data);
      const result = await response.json();
      return result;
    },
    onSuccess: (savedArticle) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/recent"] });
      toast({
        title: "Article créé avec succès",
        description: "L'article a été créé dans la base de données.",
      });
      
      // Redirection vers la page d'édition
      setLocation(`/admin/articles/edit/${savedArticle.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: ArticleFormValues) => {
    console.log("Soumission du formulaire article", data);
    createArticleMutation.mutate(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Créer un nouvel article</h1>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={createArticleMutation.isPending}
            >
              {createArticleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer l'article
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6 space-y-4">
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
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="slug-de-l-article"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Le slug est utilisé dans l'URL: https://politiquensemble.fr/articles/{form.watch("slug")}
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
                <Label htmlFor="sources">Sources</Label>
                <Textarea
                  id="sources"
                  placeholder="Listez les sources utilisées pour cet article"
                  rows={3}
                  {...form.register("sources")}
                />
                {form.formState.errors.sources && (
                  <p className="text-sm text-red-500">{form.formState.errors.sources.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Séparez les différentes sources par des sauts de ligne ou des virgules
                </p>
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
                  <Label htmlFor="content">Contenu de l'article</Label>
                  <div className="relative">
                    {/* Indicateur de longueur et debugging */}
                    <div className="absolute top-0 right-0 z-10 text-xs p-1 bg-amber-100 text-amber-900 rounded flex gap-1">
                      <span>Contenu: {(form.watch("content") || "").length} caractères</span>
                    </div>
                    
                    <RichTextEditor
                      key={`editor-${editorKey}`} // Forcer la recréation de l'éditeur
                      value={form.watch("content") || ""}
                      onChange={(value) => {
                        console.log("RichTextEditor onChange:", {
                          value_length: value.length,
                          prev_length: (form.watch("content") || "").length
                        });
                        form.setValue("content", value, { shouldDirty: true, shouldTouch: true });
                      }}
                      placeholder="Commencez à rédiger votre article..."
                    />
                  </div>
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                  )}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md overflow-hidden">
                    {/* Utiliser le nouveau composant de prévisualisation d article */}
                    <div className="bg-background relative">
                      {/* Badge "Prévisualisation" */}
                      <div className="absolute top-2 right-2 z-50 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                        Prévisualisation
                      </div>
                      
                      {/* Importer le composant ArticlePreview */}
                      {form.watch("title") ? (
                        <ArticlePreview 
                          article={{
                            title: form.watch("title"),
                            slug: form.watch("slug"),
                            excerpt: form.watch("excerpt"),
                            content: form.watch("content"),
                            imageUrl: form.watch("imageUrl"),
                            categoryId: form.watch("categoryId"),
                            published: form.watch("published"),
                            featured: form.watch("featured"),
                            createdAt: new Date().toISOString(),
                          }}
                          category={categories.find(c => c.id === Number(form.watch("categoryId")))}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-10">
                          Remplissez au moins le titre de l article pour voir la prévisualisation.
                        </p>
                      )}
                    </div>
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

// Formulaire d'édition d'article (existant)
function EditArticleForm({ article, categories }: { article: Article, categories: Category[] }) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewHtml, setPreviewHtml] = useState("");
  const [editorKey, setEditorKey] = useState(0); // Pour forcer le remontage de l'éditeur
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article.title || "",
      slug: article.slug || "",
      excerpt: article.excerpt || "",
      content: article.content || "",
      imageUrl: article.imageUrl || "",
      sources: article.sources || "",
      categoryId: typeof article.categoryId === 'number' ? article.categoryId : 1,
      published: Boolean(article.published),
      featured: Boolean(article.featured),
    }
  });
  
  // Mutation pour mettre à jour un article
  const updateArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      const response = await apiRequest("PATCH", `/api/admin/articles/${article.id}`, data);
      const result = await response.json();
      return result;
    },
    onSuccess: (updatedArticle) => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/articles/featured"] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${form.getValues("slug")}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles", article.id] });
      
      toast({
        title: "Article mis à jour",
        description: "Les modifications ont été enregistrées avec succès.",
      });
      
      // Réinitialiser le formulaire pour réduire les différences d'état
      setEditorKey(prev => prev + 1);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de la mise à jour",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: ArticleFormValues) => {
    console.log("Mise à jour de l'article", article.id, data);
    updateArticleMutation.mutate(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Modifier l'article #{article.id}</h1>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={updateArticleMutation.isPending}
            >
              {updateArticleMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Mettre à jour
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contenu principal */}
          <Card className="lg:col-span-2">
            <CardContent className="pt-6 space-y-4">
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
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="slug-de-l-article"
                  {...form.register("slug")}
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-red-500">{form.formState.errors.slug.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Le slug est utilisé dans l'URL: https://politiquensemble.fr/articles/{form.watch("slug")}
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
                <Label htmlFor="sources">Sources</Label>
                <Textarea
                  id="sources"
                  placeholder="Listez les sources utilisées pour cet article"
                  rows={3}
                  {...form.register("sources")}
                />
                {form.formState.errors.sources && (
                  <p className="text-sm text-red-500">{form.formState.errors.sources.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Séparez les différentes sources par des sauts de ligne ou des virgules
                </p>
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
                  <Label htmlFor="content">Contenu de l'article</Label>
                  <div className="relative">
                    {/* Indicateur de longueur et debugging */}
                    <div className="absolute top-0 right-0 z-10 text-xs p-1 bg-amber-100 text-amber-900 rounded flex gap-1">
                      <span>ID: {article.id}</span>
                      <span>•</span>
                      <span>Contenu: {(form.watch("content") || "").length} caractères</span>
                    </div>
                    
                    <RichTextEditor
                      key={`editor-${editorKey}`} // Forcer la recréation de l'éditeur
                      value={form.watch("content") || ""}
                      onChange={(value) => {
                        console.log("RichTextEditor onChange:", {
                          value_length: value.length,
                          prev_length: (form.watch("content") || "").length
                        });
                        form.setValue("content", value, { shouldDirty: true, shouldTouch: true });
                      }}
                      placeholder="Commencez à rédiger votre article..."
                    />
                  </div>
                  {form.formState.errors.content && (
                    <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                  )}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md overflow-hidden">
                    {/* Utiliser le nouveau composant de prévisualisation d article */}
                    <div className="bg-background relative">
                      {/* Badge "Prévisualisation" */}
                      <div className="absolute top-2 right-2 z-50 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                        Prévisualisation
                      </div>
                      
                      {/* Importer le composant ArticlePreview */}
                      {form.watch("title") ? (
                        <ArticlePreview 
                          article={{
                            title: form.watch("title"),
                            slug: form.watch("slug"),
                            excerpt: form.watch("excerpt"),
                            content: form.watch("content"),
                            imageUrl: form.watch("imageUrl"),
                            categoryId: form.watch("categoryId"),
                            published: form.watch("published"),
                            featured: form.watch("featured"),
                            createdAt: article?.createdAt || new Date().toISOString(),
                          }}
                          category={categories.find(c => c.id === Number(form.watch("categoryId")))}
                        />
                      ) : (
                        <p className="text-muted-foreground text-center py-10">
                          Remplissez au moins le titre de l article pour voir la prévisualisation.
                        </p>
                      )}
                    </div>
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

// Page d'édition d'article (composant principal)
export default function EditArticlePage() {
  const params = useParams();
  
  // Récupérer les catégories pour les listes déroulantes
  const categoriesQuery = useQuery({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Récupérer l'article à modifier (si ID présent)
  const articleQuery = useQuery({
    queryKey: ["/api/admin/articles", params.id],
    queryFn: async () => {
      console.log("Fetching article with ID:", params.id);
      try {
        const response = await fetch(`/api/admin/articles/${params.id}`, {
          credentials: 'include' // Important pour envoyer les cookies d'authentification
        });
        
        if (!response.ok) {
          console.error("Error response:", response.status, response.statusText);
          const errorText = await response.text();
          console.error("Error fetching article:", errorText);
          throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Article data received:", {
          id: data.id,
          title: data.title,
          content_length: data.content ? data.content.length : 0,
          content_preview: data.content ? data.content.substring(0, 50) + "..." : "EMPTY CONTENT"
        });
        return data;
      } catch (error) {
        console.error("Error in custom query function:", error);
        throw error;
      }
    },
    // Ne pas exécuter la requête si pas d'ID
    enabled: !!params.id,
  });
  
  // Affichage - Chargement en cours
  if ((params.id && articleQuery.isLoading) || categoriesQuery.isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }
  
  // Affichage - Erreur
  if (categoriesQuery.error || (params.id && articleQuery.error)) {
    return (
      <AdminLayout>
        <div className="p-6 bg-destructive/10 border border-destructive rounded-md max-w-2xl mx-auto my-4">
          <h2 className="text-xl font-bold text-destructive">Erreur</h2>
          <p>
            {categoriesQuery.error?.message || articleQuery.error?.message || "Une erreur est survenue lors du chargement des données."}
          </p>
        </div>
      </AdminLayout>
    );
  }
  
  // Mode édition - Article non trouvé
  if (params.id && !articleQuery.isLoading && !articleQuery.data) {
    return (
      <AdminLayout>
        <div className="p-6 bg-destructive/10 border border-destructive rounded-md max-w-2xl mx-auto my-4">
          <h2 className="text-xl font-bold text-destructive">Article non trouvé</h2>
          <p>
            L'article avec l'identifiant {params.id} n'a pas été trouvé ou vous n'avez pas les droits d'accès nécessaires.
          </p>
        </div>
      </AdminLayout>
    );
  }
  
  // Mode édition - Article trouvé
  if (params.id && articleQuery.data) {
    // Afficher les données complètes de l'article pour débogage
    console.log("Données de l'article à modifier:", articleQuery.data);
    console.log("Contenu de l'article à modifier:", {
      content: articleQuery.data.content, 
      content_length: articleQuery.data.content ? articleQuery.data.content.length : 0,
      content_sample: articleQuery.data.content ? articleQuery.data.content.substring(0, 100) : "VIDE"
    });
    
    return (
      <AdminLayout>
        <EditArticleForm 
          article={articleQuery.data} 
          categories={categoriesQuery.data || []} 
        />
      </AdminLayout>
    );
  }
  
  // Mode création
  return (
    <AdminLayout>
      <NewArticleForm categories={categoriesQuery.data || []} />
    </AdminLayout>
  );
}
