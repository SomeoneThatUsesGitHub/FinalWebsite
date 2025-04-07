import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { 
  Trash2, 
  PenSquare,
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle 
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Définition du schéma de validation pour les Flash Infos
const flashInfoSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  content: z.string().min(10, "Le contenu doit contenir au moins 10 caractères"),
  imageUrl: z.string().url("L'URL de l'image doit être valide").optional().or(z.literal("")),
  active: z.boolean().default(true),
});

type FlashInfo = {
  id: number;
  title: string;
  content: string;
  imageUrl: string | null;
  active: boolean;
  createdAt: string;
}

const FlashInfosPage = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFlashInfo, setEditingFlashInfo] = useState<FlashInfo | null>(null);

  // Récupérer tous les flash infos
  const { data: flashInfos, isLoading, isError } = useQuery<FlashInfo[]>({
    queryKey: ["/api/admin/flash-infos"],
    queryFn: async () => {
      const res = await fetch("/api/admin/flash-infos");
      if (!res.ok) {
        throw new Error("Erreur lors de la récupération des flash infos");
      }
      return res.json();
    },
  });

  // Formulaire pour la création de flash info
  const createForm = useForm<z.infer<typeof flashInfoSchema>>({
    resolver: zodResolver(flashInfoSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      active: true,
    },
  });

  // Formulaire pour l'édition de flash info
  const editForm = useForm<z.infer<typeof flashInfoSchema>>({
    resolver: zodResolver(flashInfoSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
      active: true,
    },
  });

  // Mutation pour créer un flash info
  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof flashInfoSchema>) => {
      const response = await apiRequest("POST", "/api/admin/flash-infos", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Flash info créé",
        description: "Le flash info a été créé avec succès.",
      });
      setIsCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flash-infos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la création du flash info: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour un flash info
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof flashInfoSchema> }) => {
      const response = await apiRequest("PUT", `/api/admin/flash-infos/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Flash info mis à jour",
        description: "Le flash info a été mis à jour avec succès.",
      });
      setIsEditDialogOpen(false);
      setEditingFlashInfo(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flash-infos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour du flash info: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un flash info
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/flash-infos/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Flash info supprimé",
        description: "Le flash info a été supprimé avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flash-infos"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression du flash info: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: z.infer<typeof flashInfoSchema>) => {
    // Si l'URL de l'image est vide, on met null
    const submissionData = {
      ...data,
      imageUrl: data.imageUrl === "" ? null : data.imageUrl,
    };
    
    createMutation.mutate(submissionData);
  };

  const onEditSubmit = (data: z.infer<typeof flashInfoSchema>) => {
    if (!editingFlashInfo) return;
    
    // Si l'URL de l'image est vide, on met null
    const submissionData = {
      ...data,
      imageUrl: data.imageUrl === "" ? null : data.imageUrl,
    };
    
    updateMutation.mutate({ id: editingFlashInfo.id, data: submissionData });
  };

  const openEditDialog = (flashInfo: FlashInfo) => {
    setEditingFlashInfo(flashInfo);
    editForm.reset({
      title: flashInfo.title,
      content: flashInfo.content,
      imageUrl: flashInfo.imageUrl || "",
      active: flashInfo.active,
    });
    setIsEditDialogOpen(true);
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

  // Affichage des états de chargement et d'erreur
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Flash Infos</h1>
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
            <h1 className="text-2xl font-bold">Flash Infos</h1>
          </div>
          <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <CardTitle className="text-red-700 dark:text-red-400">
                  Erreur de chargement
                </CardTitle>
                <CardDescription className="text-red-600 dark:text-red-300 mt-1">
                  Impossible de charger les flash infos. Veuillez essayer de rafraîchir la page.
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
          <h1 className="text-2xl font-bold">Flash Infos</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nouveau Flash Info
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>Créer un nouveau Flash Info</DialogTitle>
                <DialogDescription>
                  Les Flash Infos sont des informations urgentes ou importantes qui apparaissent en haut de la page d'accueil.
                </DialogDescription>
              </DialogHeader>
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
                  <FormField
                    control={createForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input placeholder="Titre du flash info" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contenu</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Contenu détaillé du flash info" 
                            {...field} 
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL de l'image (optionnel)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            {...field} 
                          />
                        </FormControl>
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
                            Afficher ce flash info sur le site
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

        {/* Liste des Flash Infos */}
        {flashInfos && flashInfos.length === 0 ? (
          <Card className="border-muted-foreground/20">
            <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg font-medium">Aucun Flash Info</CardTitle>
                <CardDescription className="mt-1">
                  Vous n'avez pas encore créé de Flash Info. Cliquez sur "Nouveau Flash Info" pour commencer.
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer un Flash Info
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashInfos?.map((flashInfo) => (
              <Card key={flashInfo.id} className={`overflow-hidden ${!flashInfo.active ? 'border-dashed opacity-70' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{flashInfo.title}</CardTitle>
                    <Badge variant={flashInfo.active ? "default" : "outline"}>
                      {flashInfo.active ? (
                        <><CheckCircle2 className="h-3 w-3 mr-1" /> Actif</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Inactif</>
                      )}
                    </Badge>
                  </div>
                  <CardDescription>
                    Créé le {formatDate(flashInfo.createdAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {flashInfo.content}
                  </p>
                  {flashInfo.imageUrl && (
                    <div className="mt-2 h-24 rounded-md overflow-hidden">
                      <img 
                        src={flashInfo.imageUrl} 
                        alt={flashInfo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/300x150?text=Image+non+disponible";
                        }}
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex items-center justify-between">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-1">
                        <Trash2 className="h-4 w-4" />
                        Supprimer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action est irréversible. Cela supprimera définitivement le flash info
                          "{flashInfo.title}" et toutes ses données associées.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(flashInfo.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => openEditDialog(flashInfo)}
                  >
                    <PenSquare className="h-4 w-4" />
                    Modifier
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialogue de modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Modifier le Flash Info</DialogTitle>
            <DialogDescription>
              Modifiez les informations du flash info.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre du flash info" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Contenu détaillé du flash info" 
                        {...field} 
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                      />
                    </FormControl>
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
                        Afficher ce flash info sur le site
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
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingFlashInfo(null);
                  }}
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

export default FlashInfosPage;