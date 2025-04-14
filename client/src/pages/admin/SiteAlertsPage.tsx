import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Trash2, 
  PenSquare,
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle,
  BellRing
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Définition du schéma de validation pour les Alertes de site
const siteAlertSchema = z.object({
  message: z.string().min(3, "Le message doit contenir au moins 3 caractères"),
  active: z.boolean().default(true),
  priority: z.coerce.number().int().min(1).max(10).default(1),
  backgroundColor: z.string().min(1, "La couleur de fond est requise").default("#dc2626"),
  textColor: z.string().min(1, "La couleur du texte est requise").default("#ffffff"),
  url: z.string().url("L'URL doit être valide").optional().or(z.literal("")),
});

type SiteAlert = {
  id: number;
  message: string;
  active: boolean;
  priority: number;
  backgroundColor: string;
  textColor: string;
  url: string | null;
  createdAt: string;
  createdBy: number | null;
}

const SiteAlertsPage = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<SiteAlert | null>(null);

  // Récupérer toutes les alertes
  const { data: alerts, isLoading, isError } = useQuery<SiteAlert[]>({
    queryKey: ["/api/site-alerts"],
    queryFn: async () => {
      const res = await fetch("/api/site-alerts");
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des alertes");
      }
      return res.json();
    },
  });

  // Formulaire pour la création d'alerte
  const createForm = useForm<z.infer<typeof siteAlertSchema>>({
    resolver: zodResolver(siteAlertSchema),
    defaultValues: {
      message: "",
      backgroundColor: "#dc2626",
      textColor: "#ffffff",
      url: "",
      active: true,
      priority: 1,
    },
  });

  // Formulaire pour l'édition d'alerte
  const editForm = useForm<z.infer<typeof siteAlertSchema>>({
    resolver: zodResolver(siteAlertSchema),
    defaultValues: {
      message: "",
      backgroundColor: "#dc2626",
      textColor: "#ffffff",
      url: "",
      active: true,
      priority: 1,
    },
  });

  // Mutation pour créer une alerte
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof siteAlertSchema>) => {
      const response = await apiRequest("POST", "/api/site-alerts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alerte créée",
        description: "L'alerte a été créée avec succès.",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/site-alerts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création de l'alerte: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour une alerte
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof siteAlertSchema> }) => {
      const response = await apiRequest("PUT", `/api/site-alerts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Alerte mise à jour",
        description: "L'alerte a été mise à jour avec succès.",
      });
      setIsEditDialogOpen(false);
      setSelectedAlert(null);
      queryClient.invalidateQueries({ queryKey: ["/api/site-alerts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour de l'alerte: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une alerte
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/site-alerts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Alerte supprimée",
        description: "L'alerte a été supprimée avec succès.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedAlert(null);
      queryClient.invalidateQueries({ queryKey: ["/api/site-alerts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de l'alerte: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour activer/désactiver une alerte
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: number; active: boolean }) => {
      const response = await apiRequest("PATCH", `/api/site-alerts/${id}/toggle`, { active });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.active ? "Alerte activée" : "Alerte désactivée",
        description: `L'alerte a été ${data.active ? "activée" : "désactivée"} avec succès.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/site-alerts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la modification du statut de l'alerte: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: z.infer<typeof siteAlertSchema>) => {
    // Si l'URL est vide, on met null
    const submissionData = {
      ...data,
      url: data.url === "" ? null : data.url,
    };
    
    createMutation.mutate(submissionData);
  };

  const onEditSubmit = (data: z.infer<typeof siteAlertSchema>) => {
    if (!selectedAlert) return;
    
    // Si l'URL est vide, on met null
    const submissionData = {
      ...data,
      url: data.url === "" ? null : data.url,
    };
    
    updateMutation.mutate({ id: selectedAlert.id, data: submissionData });
  };

  const openEditDialog = (alert: SiteAlert) => {
    setSelectedAlert(alert);
    editForm.reset({
      message: alert.message,
      backgroundColor: alert.backgroundColor,
      textColor: alert.textColor,
      url: alert.url || "",
      active: alert.active,
      priority: alert.priority,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (alert: SiteAlert) => {
    setSelectedAlert(alert);
    setIsDeleteDialogOpen(true);
  };

  const toggleAlertStatus = (alert: SiteAlert) => {
    toggleStatusMutation.mutate({ id: alert.id, active: !alert.active });
  };

  // Fonction d'aide pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fonction pour générer les options de priorité
  const priorityOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Affichage des états de chargement et d'erreur
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Alertes de site</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 mb-2" />
                  <div className="flex items-center gap-2 mt-2">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 flex items-center justify-between">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-16" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Alertes de site</h1>
          </div>
          <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <CardTitle className="text-red-700 dark:text-red-400">
                  Erreur de chargement
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-300 mt-1">
                  Impossible de charger les alertes. Veuillez essayer de rafraîchir la page.
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Alertes de site</h1>
            <p className="text-muted-foreground mt-1">Gérez les alertes qui s'affichent en haut du site</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouvelle Alerte
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle alerte</DialogTitle>
                <DialogDescription>
                  Les alertes s'affichent en haut du site pour informer les utilisateurs de messages importants.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                  <FormField
                    control={createForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Input placeholder="Message de l'alerte" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={createForm.control}
                      name="backgroundColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur de fond</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                            <Input 
                              placeholder="#dc2626" 
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={createForm.control}
                      name="textColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Couleur du texte</FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input type="color" {...field} />
                            </FormControl>
                            <Input 
                              placeholder="#ffffff" 
                              value={field.value}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={createForm.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priorité (1-10)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez une priorité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priorityOptions.map((priority) => (
                              <SelectItem key={priority} value={priority.toString()}>
                                {priority} {priority === 10 ? "(Le plus important)" : priority === 1 ? "(Le moins important)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Les alertes avec une priorité plus élevée apparaîtront en premier.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL "En savoir plus" (optionnel)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/article" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Si renseignée, l'alerte sera cliquable et redirigera vers cette URL.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Actif</FormLabel>
                          <FormDescription>
                            Afficher cette alerte sur le site
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
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createMutation.isPending}
                    >
                      Annuler
                    </Button>
                    <Button 
                      type="submit"
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? "Création..." : "Créer"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Prévisualisation d'une alerte */}
        {createForm.watch("message") && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Prévisualisation :</p>
            <div 
              className="p-2 text-center rounded-md cursor-pointer"
              style={{
                backgroundColor: createForm.watch("backgroundColor"),
                color: createForm.watch("textColor"),
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <BellRing className="h-4 w-4" />
                <span>{createForm.watch("message")}</span>
                {createForm.watch("url") && (
                  <span className="text-xs underline">En savoir plus</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Liste des Alertes */}
        {alerts && alerts.length === 0 ? (
          <Card className="border-muted-foreground/20">
            <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                <BellRing className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">Aucune Alerte</CardTitle>
                <CardDescription className="mt-1">
                  Vous n'avez pas encore créé d'alerte. Cliquez sur "Nouvelle Alerte" pour commencer.
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une Alerte
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alerts?.map((alert) => (
              <Card key={alert.id} className={`overflow-hidden ${!alert.active ? 'border-dashed opacity-70' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant={alert.active ? "default" : "outline"}>
                      {alert.active ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Actif</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Inactif</>
                      )}
                    </Badge>
                    <Badge variant="outline" className="ml-2">Priorité: {alert.priority}</Badge>
                  </div>
                  <CardDescription>
                    Créée le {formatDate(alert.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="p-2 text-center rounded-md mb-2"
                    style={{
                      backgroundColor: alert.backgroundColor,
                      color: alert.textColor,
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <BellRing className="h-4 w-4" />
                      <span>{alert.message}</span>
                      {alert.url && (
                        <span className="text-xs underline">En savoir plus</span>
                      )}
                    </div>
                  </div>
                  {alert.url && (
                    <div className="mt-2 text-xs text-muted-foreground truncate">
                      URL: <a href={alert.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                        {alert.url}
                      </a>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openEditDialog(alert)}
                    >
                      <PenSquare className="h-4 w-4 mr-1" /> Modifier
                    </Button>
                    <AlertDialog open={isDeleteDialogOpen && selectedAlert?.id === alert.id} onOpenChange={setIsDeleteDialogOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => openDeleteDialog(alert)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement l'alerte.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => selectedAlert && deleteMutation.mutate(selectedAlert.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <Button
                    variant={alert.active ? "secondary" : "default"}
                    size="sm"
                    onClick={() => toggleAlertStatus(alert)}
                    disabled={toggleStatusMutation.isPending}
                  >
                    {alert.active ? (
                      <><XCircle className="h-4 w-4 mr-1" /> Désactiver</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 mr-1" /> Activer</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Modifier l'alerte</DialogTitle>
            <DialogDescription>
              Modifiez les détails de l'alerte sélectionnée.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Input placeholder="Message de l'alerte" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur de fond</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <Input 
                          placeholder="#dc2626" 
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="textColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur du texte</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <Input 
                          placeholder="#ffffff" 
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité (1-10)</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority} value={priority.toString()}>
                            {priority} {priority === 10 ? "(Le plus important)" : priority === 1 ? "(Le moins important)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Les alertes avec une priorité plus élevée apparaîtront en premier.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL "En savoir plus" (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/article" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Si renseignée, l'alerte sera cliquable et redirigera vers cette URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Actif</FormLabel>
                      <FormDescription>
                        Afficher cette alerte sur le site
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

              {/* Prévisualisation */}
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Prévisualisation :</p>
                <div 
                  className="p-2 text-center rounded-md cursor-pointer"
                  style={{
                    backgroundColor: editForm.watch("backgroundColor"),
                    color: editForm.watch("textColor"),
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BellRing className="h-4 w-4" />
                    <span>{editForm.watch("message")}</span>
                    {editForm.watch("url") && (
                      <span className="text-xs underline">En savoir plus</span>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={updateMutation.isPending}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default SiteAlertsPage;