import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { 
  LiveCoverage, 
  LiveCoverageUpdate, 
  insertLiveCoverageUpdateSchema 
} from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash,
  Eye
} from "lucide-react";

// Form schema for live coverage updates
const liveCoverageUpdateFormSchema = insertLiveCoverageUpdateSchema.omit({
  authorId: true,
  coverageId: true,
  timestamp: true,
}).extend({
  content: z.string().min(1, "Le contenu est requis"),
  imageUrl: z.string().optional(),
  important: z.boolean().default(false),
});

type LiveCoverageUpdateFormValues = z.infer<typeof liveCoverageUpdateFormSchema>;

export default function LiveCoverageDetailPage() {
  const [_, params] = useRoute("/admin/suivis-en-direct/:id");
  const coverageId = params?.id ? parseInt(params.id, 10) : null;
  const { toast } = useToast();
  const [refreshInterval, setRefreshInterval] = useState<number>(15000); // 15 secondes par défaut

  // Form state
  const form = useForm<LiveCoverageUpdateFormValues>({
    resolver: zodResolver(liveCoverageUpdateFormSchema),
    defaultValues: {
      content: "",
      imageUrl: "",
      important: false,
    },
  });

  // Récupérer les détails du suivi en direct
  const { 
    data: coverage,
    isLoading: coverageLoading,
    isError: coverageError,
    refetch: refetchCoverage
  } = useQuery<LiveCoverage>({
    queryKey: [`/api/admin/live-coverages/${coverageId}`],
    queryFn: getQueryFn,
    enabled: !!coverageId,
  });
  
  // Récupérer les mises à jour du suivi en direct
  const { 
    data: updates,
    isLoading: updatesLoading,
    isError: updatesError,
    refetch: refetchUpdates
  } = useQuery<LiveCoverageUpdate[]>({
    queryKey: [`/api/live-coverages/${coverageId}/updates`],
    queryFn: getQueryFn,
    enabled: !!coverageId,
    refetchInterval: refreshInterval,
  });

  // Récupérer les éditeurs du suivi en direct
  const { 
    data: editors,
    isLoading: editorsLoading
  } = useQuery<any[]>({
    queryKey: [`/api/live-coverages/${coverageId}/editors`],
    queryFn: getQueryFn,
    enabled: !!coverageId,
  });

  // Mutation pour ajouter une mise à jour
  const createUpdateMutation = useMutation({
    mutationFn: async (data: LiveCoverageUpdateFormValues) => {
      if (!coverageId) throw new Error("ID du suivi manquant");
      const res = await apiRequest("POST", `/api/admin/live-coverages/${coverageId}/updates`, data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la création de la mise à jour");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Mise à jour ajoutée",
        description: "La mise à jour a été ajoutée avec succès.",
      });
      form.reset({
        content: "",
        imageUrl: "",
        important: false,
      });
      refetchUpdates();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une mise à jour
  const deleteUpdateMutation = useMutation({
    mutationFn: async (updateId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/live-coverages/updates/${updateId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la suppression de la mise à jour");
      }
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Mise à jour supprimée",
        description: "La mise à jour a été supprimée avec succès.",
      });
      refetchUpdates();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de la mise à jour: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Set page title
  useEffect(() => {
    if (coverage) {
      document.title = `${coverage.title} - Administration | Politiquensemble`;
    }
    return () => {
      document.title = "Administration | Politiquensemble";
    };
  }, [coverage]);

  // Format date for updates
  const formatUpdateDate = (date: string | Date) => {
    try {
      return format(new Date(date), "d MMMM yyyy à HH:mm", { locale: fr });
    } catch (error) {
      console.error("Date format error:", error);
      return "Date indisponible";
    }
  };
  
  // Handle form submission
  const onSubmit = (values: LiveCoverageUpdateFormValues) => {
    createUpdateMutation.mutate(values);
  };

  // Handle preview click
  const handlePreviewClick = () => {
    if (coverage) {
      window.open(`/suivis-en-direct/${coverage.slug}`, '_blank');
    }
  };

  // If loading
  if (coverageLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary/70" />
        </div>
      </AdminLayout>
    );
  }

  // If error or coverage not found
  if (coverageError || !coverage) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Suivi en direct non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            Le suivi en direct demandé n'existe pas ou n'est plus disponible.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = "/admin/suivis-en-direct"}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = "/admin/suivis-en-direct"}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="uppercase">
                Suivi en direct
              </Badge>
              {coverage.active ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
              ) : (
                <Badge variant="outline">Inactif</Badge>
              )}
            </div>
          </div>
          
          <h1 className="text-3xl font-bold tracking-tight">{coverage.title}</h1>
          <p className="text-muted-foreground mt-1">{coverage.subject}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handlePreviewClick}
          >
            <Eye className="mr-2 h-4 w-4" />
            Voir sur le site
          </Button>
          <Button 
            onClick={() => refetchUpdates()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
        </div>
      </div>
      
      <div className="mb-4 flex items-center text-muted-foreground gap-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span className="text-sm">
            Créé le {formatUpdateDate(coverage.createdAt)}
          </span>
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar - Info & Options */}
        <div>
          {/* Formulaire d'ajout de mise à jour */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ajouter une mise à jour</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Contenu de la mise à jour..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
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
                            value={field.value || ''} 
                          />
                        </FormControl>
                        <FormDescription>
                          Laisser vide si pas d'image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="important"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Mise à jour importante</FormLabel>
                          <FormDescription>
                            Mettre en évidence cette mise à jour
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
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createUpdateMutation.isPending}
                  >
                    {createUpdateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Publier la mise à jour
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
          
          {/* Options de rafraîchissement */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Options de rafraîchissement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Rafraîchissement automatique</p>
                  <div className="flex gap-2">
                    <Button 
                      variant={refreshInterval === 5000 ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setRefreshInterval(5000)}
                      className="flex-1"
                    >
                      5s
                    </Button>
                    <Button 
                      variant={refreshInterval === 15000 ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setRefreshInterval(15000)}
                      className="flex-1"
                    >
                      15s
                    </Button>
                    <Button 
                      variant={refreshInterval === 30000 ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setRefreshInterval(30000)}
                      className="flex-1"
                    >
                      30s
                    </Button>
                    <Button 
                      variant={refreshInterval === 0 ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setRefreshInterval(0)}
                      className="flex-1"
                    >
                      Off
                    </Button>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => {
                    refetchUpdates();
                    toast({
                      title: "Mise à jour",
                      description: "Les données ont été rafraîchies.",
                    });
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Rafraîchir maintenant
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Équipe éditoriale */}
          <Card>
            <CardHeader>
              <CardTitle>Équipe éditoriale</CardTitle>
            </CardHeader>
            <CardContent>
              {editorsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary/70" />
                </div>
              ) : editors && Array.isArray(editors) && editors.length > 0 ? (
                <div className="space-y-4">
                  {editors.map((editor) => (
                    <div key={editor.editorId} className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {editor.editor?.avatarUrl ? (
                          <AvatarImage src={editor.editor.avatarUrl} alt={editor.editor.displayName} />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {editor.editor?.displayName.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{editor.editor?.displayName || "Éditeur"}</p>
                        {editor.editor?.title && (
                          <p className="text-xs text-muted-foreground">{editor.editor.title}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-2">Aucun éditeur assigné.</p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Timeline des mises à jour */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mises à jour</CardTitle>
                
                {updatesLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mise à jour...
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {updatesError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-red-700">Erreur lors du chargement des mises à jour</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={() => refetchUpdates()}
                  >
                    Réessayer
                  </Button>
                </div>
              ) : updates && updates.length > 0 ? (
                <div className="space-y-8 py-2">
                  {[...updates].sort((a, b) => {
                    try {
                      // Sort by timestamp (most recent first)
                      const dateA = a.timestamp || a.createdAt;
                      const dateB = b.timestamp || b.createdAt;
                      return new Date(dateB).getTime() - new Date(dateA).getTime();
                    } catch (error) {
                      return 0;
                    }
                  }).map((update) => (
                    <div 
                      key={update.id} 
                      className={`relative pl-6 border-l-2 ${
                        update.important ? 'border-primary' : 'border-muted'
                      }`}
                    >
                      <div 
                        className={`absolute left-[-8px] top-0 ${
                          update.important 
                            ? 'w-4 h-4 rounded-full bg-primary' 
                            : 'w-3 h-3 rounded-full bg-muted-foreground'
                        }`}
                      ></div>
                      
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {formatUpdateDate(update.timestamp || update.createdAt)}
                          </span>
                          
                          {update.important && (
                            <Badge className="text-xs bg-primary/20 text-primary hover:bg-primary/30">
                              Important
                            </Badge>
                          )}
                          
                          {update.author && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">par</span>
                              <span className="text-xs font-medium">{update.author.displayName}</span>
                            </div>
                          )}
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cette mise à jour ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. La mise à jour sera définitivement supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => deleteUpdateMutation.mutate(update.id)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      
                      <div className="mt-2 text-base">
                        <p className="whitespace-pre-wrap">{update.content}</p>
                      </div>
                      
                      {update.imageUrl && (
                        <div className="mt-3 max-w-md">
                          <img 
                            src={update.imageUrl} 
                            alt="Mise à jour" 
                            className="rounded-md w-full"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-muted/30 border border-border rounded-lg p-8 text-center my-4">
                  <p className="text-muted-foreground">Aucune mise à jour pour le moment</p>
                  <p className="text-sm mt-2 text-muted-foreground">
                    Utilisez le formulaire pour ajouter des mises à jour à ce suivi en direct
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}