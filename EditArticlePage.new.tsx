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

// Schéma de validation étendu pour le formulaire
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
      sources: "",  // Champ pour les sources
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

// Formulaire de modification d'article
function EditArticleForm({ article, categories }: { article: Article, categories: Category[] }) {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewHtml, setPreviewHtml] = useState<string>("");
  const [editorKey, setEditorKey] = useState<number>(article.id); // Utiliser l'ID comme clé unique
  
  // Log détaillé pour le débogage
  console.log("EditArticleForm - Article reçu:", {
    id: article.id,
    title: article.title,
    content_length: article.content ? article.content.length : 0,
    content_type: typeof article.content,
    content_preview: article.content ? article.content.substring(0, 100) + "..." : "null",
    category: article.categoryId,
    published: article.published,
    featured: article.featured,
    sources: article.sources
  });
  
  // Configurer le formulaire avec les valeurs de l'article
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
      published: Boolean(article.published),
      featured: Boolean(article.featured)
    }
  });
  
  // Observer les changements de contenu pour la prévisualisation
  form.watch((value) => {
    if (value.content) {
      setPreviewHtml(value.content as string);
    }
  });
  
  // Génération auto du slug depuis le titre si le titre change et que le slug est vide ou identique à l'original
  form.watch((value, { name }) => {
    if (name === "title" && value.title && (form.getValues("slug") === article.slug || !form.getValues("slug"))) {
      const slug = value.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", slug);
    }
  });

  const updateArticleMutation = useMutation({
    mutationFn: async (data: ArticleFormValues) => {
      // Formater les données pour la mise à jour
      const formattedData = {
        ...data,
        categoryId: Number(data.categoryId),
        published: Boolean(data.published),
        featured: Boolean(data.featured),
        imageUrl: data.imageUrl || null,
      };
      
      console.log("Données pour mise à jour:", formattedData);
      
      // Utiliser fetch directement au lieu d'apiRequest
      const res = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
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
      
      // Régénérer une nouvelle clé pour l'éditeur pour forcer un rafraîchissement
      setEditorKey(prev => prev + 1);
      
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
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`/articles/${form.getValues("slug")}`, "_blank")}
            >
              <Eye className="mr-2 h-4 w-4" /> Voir sur le site
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
              
              <Tabs defaultValue="editor" className="w-full">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="editor">Éditeur</TabsTrigger>
                  <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="space-y-2">
                  <Label htmlFor="content">Contenu de l'article</Label>
                  <div className="relative">
                    {/* Indicateur de longueur et debugging */}
                    <div className="absolute top-0 right-0 z-10 text-xs p-1 bg-amber-100 text-amber-900 rounded">
                      Contenu: {(form.watch("content") || "").length} caractères
                    </div>
                    <RichTextEditor
                      key={`article-editor-${editorKey}`} // Utiliser une clé unique basée sur l'ID de l'article
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
                    {/* Utiliser le composant de prévisualisation */}
                    <div className="bg-background relative">
                      {/* Badge "Prévisualisation" */}
                      <div className="absolute top-2 right-2 z-50 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                        Prévisualisation
                      </div>
                      
                      <ArticlePreview 
                        article={{
                          title: form.watch("title") || article.title,
                          slug: form.watch("slug") || article.slug,
                          excerpt: form.watch("excerpt") || article.excerpt || "",
                          content: form.watch("content") || article.content || "",
                          imageUrl: form.watch("imageUrl") || article.imageUrl || "",
                          categoryId: form.watch("categoryId") || article.categoryId,
                          published: form.watch("published"),
                          featured: form.watch("featured"),
                          createdAt: article.createdAt || new Date().toISOString(),
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
                  value={form.watch("categoryId")?.toString() || article.categoryId.toString()}
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

export default function EditArticlePage() {
  const params = useParams<{ id?: string }>();
  const [location, setLocation] = useLocation();
  const isNewArticle = !params.id;
  
  // Récupérer les catégories pour le formulaire
  const { 
    data: categories = [], 
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Si c'est un nouvel article, on affiche le formulaire de création
  if (isNewArticle) {
    return (
      <AdminLayout currentPage="articles">
        {isCategoriesLoading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <NewArticleForm categories={categories} />
        )}
      </AdminLayout>
    );
  }

  // Si c'est une modification, on récupère l'article existant
  const { 
    data: article,
    isLoading: isArticleLoading,
    error: articleError
  } = useQuery<Article>({
    queryKey: [`/api/admin/articles/${params.id}`],
    queryFn: getQueryFn(),
  });
  
  // Afficher un état de chargement pendant la récupération de l'article
  if (isArticleLoading || isCategoriesLoading) {
    return (
      <AdminLayout currentPage="articles">
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }
  
  // Gérer les erreurs
  if (articleError) {
    return (
      <AdminLayout currentPage="articles">
        <div className="p-8 max-w-3xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">Erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700">
                Une erreur est survenue lors de la récupération de l'article:&nbsp;
                {articleError instanceof Error ? articleError.message : "Erreur inconnue"}
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setLocation("/admin/articles")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des articles
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }
  
  // Si l'article n'est pas trouvé
  if (!article) {
    return (
      <AdminLayout currentPage="articles">
        <div className="p-8 max-w-3xl mx-auto">
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-700">Article non trouvé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-700">
                L'article demandé n'a pas été trouvé. Il a peut-être été supprimé.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setLocation("/admin/articles")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la liste des articles
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }
  
  // Si tout va bien, afficher le formulaire de modification avec l'article pré-rempli
  return (
    <AdminLayout currentPage="articles">
      <EditArticleForm article={article} categories={categories} />
    </AdminLayout>
  );
}