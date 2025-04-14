import { useState, useEffect, useRef } from "react";
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
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { ArticlePreview } from "@/components/admin/ArticlePreview";
import { SourcesInput } from "@/components/admin/SourcesInput";

// Schéma de validation étendu pour le formulaire
const articleFormSchema = insertArticleSchema
  .extend({
    // Renforcer la validation du slug pour qu'il ait au moins 3 caractères
    slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères")
      .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"),
    content: z.string().min(20, "Le contenu doit contenir au moins 20 caractères"),
    imageUrl: z.string().url("Veuillez fournir une URL d'image valide").nullable().optional(),
    sources: z.string().optional(), // Ajout du champ sources comme optionnel
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
      sources: "",
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
        published: Boolean(data.published),
        featured: Boolean(data.featured),
        imageUrl: data.imageUrl || null,
      };
      console.log("Données pour création:", formattedData);
      
      // Utiliser fetch directement au lieu d'apiRequest qui peut avoir des problèmes avec les booléens
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur de création:", errorText);
        throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalider à la fois les requêtes publiques et admin
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      
      toast({
        title: "Article créé",
        description: "L'article a été créé avec succès"
      });
      
      setLocation(`/admin/articles/${data.id}`);
    },
    onError: (error: Error) => {
      console.error("Erreur de mutation:", error);
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
                Créez un nouvel article pour le site
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
                Renseignez les informations principales de l'article
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
              
              <div className="space-y-2">
                <Label htmlFor="sources">Sources</Label>
                <SourcesInput
                  value={form.watch("sources") || ""}
                  onChange={(value) => form.setValue("sources", value)}
                />
                {form.formState.errors.sources && (
                  <p className="text-sm text-red-500">{form.formState.errors.sources.message}</p>
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
                    {/* Indicateur de longueur */}
                    <div className="absolute top-0 right-0 z-10 text-xs p-1 bg-amber-100 text-amber-900 rounded">
                      Contenu: {(form.watch("content") || "").length} caractères
                    </div>
                    <RichTextEditor
                      key="new-article-editor"
                      value={form.watch("content") || ""}
                      onChange={(value) => {
                        console.log("RichTextEditor onChange - Nouveau contenu:", value.length);
                        form.setValue("content", value);
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
                          Remplissez au moins le titre de l'article pour voir la prévisualisation.
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

// Formulaire de modification d'article
function EditArticleForm({ article, categories }: { article: Article, categories: Category[] }) {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewHtml, setPreviewHtml] = useState("");
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || "",
      content: article.content || "",
      imageUrl: article.imageUrl || "",
      sources: article.sources || "",
      categoryId: article.categoryId,
      published: article.published || false,
      featured: article.featured || false,
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
        published: Boolean(data.published),
        featured: Boolean(data.featured),
        imageUrl: data.imageUrl || null,
      };
      console.log("Données validées pour mise à jour:", formattedData);
      
      // Utiliser fetch directement au lieu d'apiRequest qui peut avoir des problèmes avec les booléens
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
        credentials: "include"
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Erreur de mise à jour:", errorText);
        throw new Error(`Erreur ${res.status}: ${errorText || res.statusText}`);
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      // Invalider à la fois les requêtes publiques et admin
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/articles"] });
      
      toast({
        title: "Article mis à jour",
        description: "L'article a été mis à jour avec succès"
      });
    },
    onError: (error: Error) => {
      console.error("Erreur de mutation:", error);
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
                Modifier l'article
              </h1>
              <p className="text-muted-foreground mt-2">
                Modifiez les informations de l'article
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`/articles/${article.slug}`, "_blank")}
            >
              <Eye className="mr-2 h-4 w-4" /> Voir
            </Button>
            
            <Button
              type="submit"
              disabled={updateArticleMutation.isPending}
            >
              {updateArticleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mise à jour...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Mettre à jour
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
                <Label htmlFor="sources">Sources</Label>
                <SourcesInput
                  value={form.watch("sources") || ""}
                  onChange={(value) => form.setValue("sources", value)}
                />
                {form.formState.errors.sources && (
                  <p className="text-sm text-red-500">{form.formState.errors.sources.message}</p>
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
                  <Label htmlFor="content">Contenu de l'article</Label>
                  <div className="relative">
                    {/* Indicateur de longueur */}
                    <div className="absolute top-0 right-0 z-10 text-xs p-1 bg-amber-100 text-amber-900 rounded">
                      Contenu: {(form.watch("content") || "").length} caractères
                    </div>
                    <RichTextEditor
                      key={`edit-article-${article.id}`}
                      value={form.watch("content") || ""}
                      onChange={(value) => {
                        form.setValue("content", value);
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
                    {/* Utiliser le nouveau composant de prévisualisation d'article */}
                    <div className="bg-background relative">
                      {/* Badge "Prévisualisation" */}
                      <div className="absolute top-2 right-2 z-50 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                        Prévisualisation
                      </div>
                      
                      {/* Importer le composant ArticlePreview */}
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
                          createdAt: article.createdAt,
                        }}
                        category={categories.find(c => c.id === Number(form.watch("categoryId")))}
                      />
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
            
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-sm space-y-4">
                  <div>
                    <span className="text-muted-foreground">ID:</span> {article.id}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Créé le:</span> {new Date(article.createdAt).toLocaleString("fr-FR")}
                  </div>
                  {article.updatedAt && (
                    <div>
                      <span className="text-muted-foreground">Mis à jour le:</span> {new Date(article.updatedAt).toLocaleString("fr-FR")}
                    </div>
                  )}
                  {article.viewCount !== undefined && (
                    <div>
                      <span className="text-muted-foreground">Vues:</span> {article.viewCount || 0}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}

// Récupération des catégories et affichage de la page de création ou de modification d'article
export default function EditArticlePage() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const articleId = params.id ? parseInt(params.id, 10) : null;
  
  // Récupération des catégories pour les sélecteurs
  const { data: categories, isLoading: isCategoriesLoading, error: categoriesError } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn(),
  });
  
  // Récupération de l'article à modifier, si on est en mode édition
  const { data: article, isLoading: isArticleLoading, error: articleError } = useQuery<Article>({
    queryKey: ["/api/admin/articles", articleId],
    queryFn: getQueryFn(),
    enabled: !!articleId, // Ne pas exécuter la requête si on est en mode création
  });
  
  // Gestion des états de chargement et d'erreur
  if (isCategoriesLoading || (articleId && isArticleLoading)) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }
  
  if (categoriesError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-xl font-bold text-destructive">
            Erreur lors du chargement des catégories
          </div>
          <p className="text-muted-foreground">
            {(categoriesError as Error).message || "Une erreur est survenue"}
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  if (articleId && articleError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-xl font-bold text-destructive">
            Erreur lors du chargement de l'article
          </div>
          <p className="text-muted-foreground">
            {(articleError as Error).message || "Une erreur est survenue"}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
            <Button 
              onClick={() => setLocation("/admin/articles")}
            >
              Retour à la liste
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="p-6">
        {articleId && article ? (
          <EditArticleForm article={article} categories={categories || []} />
        ) : (
          <NewArticleForm categories={categories || []} />
        )}
      </div>
    </AdminLayout>
  );
}