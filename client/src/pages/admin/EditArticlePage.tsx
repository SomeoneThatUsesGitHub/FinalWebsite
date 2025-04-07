import { useState, useEffect } from "react";
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
import { Loader2, Save, ArrowLeft, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/editor/RichTextEditor";

// Schéma de validation étendu pour le formulaire
const articleFormSchema = insertArticleSchema
  .extend({
    // Renforcer la validation du slug pour qu'il ait au moins 3 caractères
    slug: z.string().min(3, "Le slug doit contenir au moins 3 caractères")
      .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"),
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
              
              <div className="space-y-2">
                <Label htmlFor="content">Contenu de l'article</Label>
                <input type="hidden" {...form.register("content")} />
                <RichTextEditor 
                  content={form.watch("content") || ""}
                  onChange={(html) => {
                    form.setValue("content", html);
                    setPreviewHtml(html);
                  }}
                  placeholder="Commencez à rédiger votre article ici..."
                  className="min-h-[500px]"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                )}
              </div>
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
      categoryId: typeof article.categoryId === 'number' ? article.categoryId : 1,
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
        published: Boolean(data.published),
        featured: Boolean(data.featured),
        imageUrl: data.imageUrl || null,
      };
      console.log("Données pour mise à jour:", formattedData);
      
      // Utiliser fetch directement au lieu d'apiRequest qui peut avoir des problèmes avec les booléens
      const res = await fetch(`/api/admin/articles/${params.id}`, {
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
    onSuccess: () => {
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
  
  const handleViewClick = () => {
    window.open(`/articles/${article.slug}`, '_blank');
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
                ID: {article.id} | Créé le: {new Date(article.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleViewClick}
            >
              <Eye className="mr-2 h-4 w-4" /> Voir
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
                Informations essentielles de l'article
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
                <Label htmlFor="content">Contenu de l'article</Label>
                <input type="hidden" {...form.register("content")} />
                <RichTextEditor 
                  content={form.watch("content") || ""}
                  onChange={(html) => {
                    form.setValue("content", html);
                    setPreviewHtml(html);
                  }}
                  placeholder="Commencez à rédiger votre article ici..."
                  className="min-h-[500px]"
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
                )}
              </div>
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

export default function EditArticlePage() {
  const params = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Requête pour obtenir les catégories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
    queryFn: getQueryFn<Category[]>({ on401: "throw" }),
  });
  
  // Si on a un ID d'article, c'est une modification, sinon c'est une création
  const isEditMode = !!params.id;
  
  const { 
    data: article, 
    isLoading, 
    isError, 
    error 
  } = useQuery<Article>({
    queryKey: ["/api/admin/articles", params.id],
    queryFn: getQueryFn<Article>({ on401: "throw" }),
    enabled: isEditMode,
  });
  
  if (isEditMode && isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }
  
  if (isEditMode && isError) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto p-4 space-y-6">
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
              <h1 className="text-3xl font-bold tracking-tight text-red-500">
                Erreur
              </h1>
              <p className="text-muted-foreground mt-2">
                Impossible de charger l'article
              </p>
            </div>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              <p>
                {error instanceof Error ? error.message : "Une erreur s'est produite lors du chargement de l'article."}
              </p>
              <Button className="mt-4" onClick={() => setLocation("/admin/articles")}>
                Retour à la liste des articles
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-4">
        {isEditMode && article 
          ? <EditArticleForm article={article} categories={categories} />
          : <NewArticleForm categories={categories} />
        }
      </div>
    </AdminLayout>
  );
}
