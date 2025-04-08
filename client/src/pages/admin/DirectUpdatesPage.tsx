import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { LiveCoverage, LiveCoverageUpdate } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { ChevronLeft, Loader2, Radio, Clock, Trash2, AlertTriangle } from "lucide-react";
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
});

type UpdateFormValues = z.infer<typeof updateSchema>;

export default function DirectUpdatesPage() {
  const params = useParams();
  const id = parseInt(params.id);
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

  // Initialiser le formulaire
  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
      important: false,
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