import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { LiveCoverage, LiveCoverageUpdate, Article } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Loader2, Radio, Clock, Trash2, AlertTriangle, User as UserIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, cn } from "@/lib/utils";
import { z } from "zod";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Schéma de validation pour les mises à jour
const updateSchema = z.object({
  content: z.string().min(3, "Le contenu est requis (minimum 3 caractères)"),
  imageUrl: z.string().optional(),
  important: z.boolean().default(false),
  youtubeUrl: z.string().optional(),
  articleId: z.number().optional(),
  updateType: z.enum(["normal", "youtube", "article"]).default("normal"),
});

type UpdateFormValues = z.infer<typeof updateSchema>;

export default function DirectUpdatesPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id) : 0;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateToDelete, setUpdateToDelete] = useState<number | null>(null);

  // Récupérer les détails du suivi en direct
  const { data: coverage, isLoading: isLoadingCoverage } = useQuery<LiveCoverage>({
    queryKey: [`/api/admin/live-coverages/${id}`],
    enabled: !isNaN(id),
  });

  // Récupérer les mises à jour du suivi en direct
  const { data: updates, isLoading: isLoadingUpdates } = useQuery<(LiveCoverageUpdate & {
    author?: { displayName: string, title: string | null, avatarUrl: string | null }
  })[]>({
    queryKey: [`/api/live-coverages/${id}/updates`],
    enabled: !isNaN(id),
    refetchInterval: 10000, // Rafraîchir toutes les 10 secondes
  });
  
  // Récupérer les articles pour le menu déroulant
  const { data: articles, isLoading: isLoadingArticles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    enabled: !isNaN(id),
  });

  // Initialiser le formulaire
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
      important: false,
      youtubeUrl: "",
      articleId: undefined,
      updateType: "normal",
    },
  });

  // Mutation pour ajouter une mise à jour
  const addUpdateMutation = useMutation({
    mutationFn: async (data: UpdateFormValues) => {
      const response = await fetch(`/api/admin/live-coverages/${id}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'ajout de la mise à jour");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/live-coverages/${id}/updates`] });
      toast({
        title: "Mise à jour publiée",
        description: "Votre mise à jour a été publiée avec succès",
      });
      form.reset({
        content: "",
        imageUrl: "",
        important: false,
        youtubeUrl: "",
        articleId: undefined,
        updateType: "normal",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une mise à jour
  const deleteUpdateMutation = useMutation({
    mutationFn: async (updateId: number) => {
      const response = await fetch(`/api/admin/live-coverages/updates/${updateId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression de la mise à jour");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/live-coverages/${id}/updates`] });
      toast({
        title: "Mise à jour supprimée",
        description: "La mise à jour a été supprimée avec succès",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateFormValues) => {
    addUpdateMutation.mutate(data);
  };

  const handleDeleteClick = (updateId: number) => {
    setUpdateToDelete(updateId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (updateToDelete !== null) {
      deleteUpdateMutation.mutate(updateToDelete);
    }
  };

  const isLoading = isLoadingCoverage || isLoadingUpdates;
  const pageTitle = coverage ? `Mises à jour : ${coverage.title}` : "Mises à jour du suivi en direct";

  if (isLoadingCoverage) {
    return (
      <AdminLayout title={pageTitle}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!coverage) {
    return (
      <AdminLayout title="Suivi en direct non trouvé">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium">Suivi en direct non trouvé</h3>
              <p className="text-muted-foreground mt-2">
                Le suivi en direct que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Button 
                className="mt-4"
                onClick={() => navigate("/admin/directs")}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux suivis en direct
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={pageTitle}>
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/admin/directs")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux suivis en direct
      </Button>

      <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Ajouter une mise à jour</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="updateType"
                  render={({ field }) => (
                    <FormItem className="mb-6">
                      <FormLabel>Type de mise à jour</FormLabel>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant={field.value === "normal" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-20 w-full"
                          onClick={() => {
                            field.onChange("normal");
                            form.setValue("youtubeUrl", "");
                            form.setValue("articleId", undefined);
                          }}
                        >
                          <span className="text-sm">Texte/Image</span>
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "youtube" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-20 w-full"
                          onClick={() => {
                            field.onChange("youtube");
                            form.setValue("articleId", undefined);
                          }}
                        >
                          <span className="text-sm">Vidéo YouTube</span>
                        </Button>
                        <Button
                          type="button"
                          variant={field.value === "article" ? "default" : "outline"}
                          className="flex flex-col items-center justify-center h-20 w-full"
                          onClick={() => {
                            field.onChange("article");
                            form.setValue("youtubeUrl", "");
                          }}
                        >
                          <span className="text-sm">Article Intégré</span>
                        </Button>
                      </div>
                      <FormDescription>
                        Choisissez le type de contenu principal pour cette mise à jour.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu de la mise à jour *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Saisissez votre mise à jour ici..." 
                          {...field} 
                          rows={5}
                        />
                      </FormControl>
                      <FormDescription>
                        Texte de la mise à jour. Soyez concis et factuel.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("updateType") === "normal" && (
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de l'image (optionnel)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://exemple.com/image.jpg" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          URL d'une image à joindre à cette mise à jour.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("updateType") === "youtube" && (
                  <FormField
                    control={form.control}
                    name="youtubeUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vidéo YouTube *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXXX" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          URL complète de la vidéo YouTube à intégrer.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("updateType") === "article" && (
                  <FormField
                    control={form.control}
                    name="articleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Article à intégrer *</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value) || undefined)} 
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un article à intégrer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">Aucun article</SelectItem>
                            {articles?.map(article => (
                              <SelectItem key={article.id} value={article.id.toString()}>
                                {article.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Sélectionnez l'article à intégrer dans cette mise à jour.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="important"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Mise à jour importante</FormLabel>
                        <FormDescription>
                          Marquer comme importante pour mettre en évidence cette mise à jour.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={addUpdateMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    {addUpdateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Publier la mise à jour
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Titre</h3>
              <p>{coverage.title}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
              <p className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                coverage.active 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              )}>
                {coverage.active ? "Actif" : "Inactif"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">URL publique</h3>
              <a 
                href={`/suivis-en-direct/${coverage.slug}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                /suivis-en-direct/{coverage.slug}
              </a>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Sujet</h3>
              <p>{coverage.subject}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Auteur de la mise à jour</h3>
              <div className="flex items-center gap-2 mt-1">
                <Avatar className="h-8 w-8">
                  {user?.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                  ) : (
                    <AvatarFallback>{user?.displayName.charAt(0) || "U"}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user?.displayName || "Anonyme"}</p>
                  {user?.title && (
                    <p className="text-xs text-muted-foreground">{user.title}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <Radio className="h-5 w-5 mr-2 text-primary" />
            Mises à jour publiées
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/live-coverages/${id}/updates`] })}
          >
            Rafraîchir
          </Button>
        </div>

        {isLoadingUpdates ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-6">
                  <div className="h-4 w-1/4 bg-muted rounded mb-4"></div>
                  <div className="h-24 w-full bg-muted rounded mb-2"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : updates && updates.length > 0 ? (
          <div className="space-y-4">
            {updates.map(update => {
              const updateTime = new Date(update.timestamp);
              const timeAgo = formatDistanceToNow(updateTime, { addSuffix: true, locale: fr });
              const formattedTime = format(updateTime, "HH:mm", { locale: fr });
              
              return (
                <Card 
                  key={update.id} 
                  className={update.important ? "border-primary" : undefined}
                >
                  <CardContent className="py-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        {update.important && (
                          <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                            Important
                          </div>
                        )}
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span title={formatDate(update.timestamp)}>
                            {formattedTime} ({timeAgo})
                          </span>
                        </div>
                      </div>
                      {update.author && (
                        <div className="flex items-center gap-2">
                          <div className="text-right text-sm">
                            <span className="font-medium">{update.author.displayName}</span>
                            {update.author.title && (
                              <div className="text-xs text-muted-foreground">
                                {update.author.title}
                              </div>
                            )}
                          </div>
                          <Avatar className="h-8 w-8">
                            {update.author.avatarUrl ? (
                              <AvatarImage src={update.author.avatarUrl} alt={update.author.displayName} />
                            ) : (
                              <AvatarFallback>{update.author.displayName.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <p className="whitespace-pre-line">{update.content}</p>
                      {update.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={update.imageUrl} 
                            alt="Mise à jour" 
                            className="rounded-md max-h-80 object-contain"
                          />
                        </div>
                      )}
                      {update.youtubeUrl && (
                        <div className="mt-2 aspect-video">
                          <iframe
                            className="w-full h-full rounded-md"
                            src={update.youtubeUrl.replace("watch?v=", "embed/")}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      )}
                      {update.articleId && articles?.find(a => a.id === update.articleId) && (
                        <a 
                          href={`/articles/${articles.find(a => a.id === update.articleId)?.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <Card className="mt-4 overflow-hidden border shadow-sm hover:shadow rounded-xl transition-shadow duration-200">
                            <div className="flex flex-col sm:flex-row">
                              <div className="sm:w-1/3 bg-muted">
                                <div className="h-32 sm:h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                  <UserIcon className="h-12 w-12 text-muted-foreground/40" />
                                </div>
                              </div>
                              <div className="sm:w-2/3 p-4">
                                <h3 className="text-lg font-semibold line-clamp-2">{articles.find(a => a.id === update.articleId)?.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                                  {articles.find(a => a.id === update.articleId)?.excerpt}
                                </p>
                                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                                  <div className="flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    <span>Article lié</span>
                                  </div>
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span>Voir l'article</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </a>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDeleteClick(update.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Aucune mise à jour publiée</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Utilisez le formulaire ci-dessus pour publier votre première mise à jour 
                sur ce suivi en direct.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette mise à jour ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La mise à jour sera définitivement supprimée du suivi en direct.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUpdateMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteUpdateMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteUpdateMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}