import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Video, insertVideoSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, Plus, Film, ExternalLink, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Extension du schéma avec validation
const videoFormSchema = insertVideoSchema.extend({
  title: z.string().min(3, {
    message: "Le titre doit contenir au moins 3 caractères",
  }),
  videoId: z.string().min(5, {
    message: "L'ID de la vidéo YouTube est requis",
  }),
});

// Type dérivé du schéma
type VideoFormValues = z.infer<typeof videoFormSchema>;

// Formatage des vues
const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
};

// Extraction de l'ID YouTube d'une URL
const extractYouTubeID = (url: string): string => {
  // Regex pour extraire l'ID YouTube à partir d'une URL complète
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  
  return match ? match[1] : url; // Retourner l'ID ou l'URL originale si pas de correspondance
};

const VideosPage: React.FC = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  // Récupérer la liste des vidéos
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/admin/videos'],
    refetchOnWindowFocus: false,
  });
  
  // Formulaire pour ajouter une nouvelle vidéo
  const addForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema),
    defaultValues: {
      title: "",
      videoId: "",
      views: 0,
    },
  });
  
  // Formulaire pour éditer une vidéo existante
  const editForm = useForm<VideoFormValues>({
    resolver: zodResolver(videoFormSchema.partial()),
    defaultValues: {
      title: "",
      videoId: "",
      views: 0,
    },
  });
  
  // Mutation pour ajouter une vidéo
  const addVideoMutation = useMutation({
    mutationFn: async (data: VideoFormValues) => {
      // Si l'utilisateur a entré une URL YouTube complète, extraire l'ID
      if (data.videoId && data.videoId.includes('youtube.com') || data.videoId.includes('youtu.be')) {
        data.videoId = extractYouTubeID(data.videoId);
      }
      
      const res = await apiRequest("POST", "/api/admin/videos", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Vidéo ajoutée",
        description: "La vidéo a été ajoutée avec succès.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de l'ajout de la vidéo: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour mettre à jour une vidéo
  const updateVideoMutation = useMutation({
    mutationFn: async (data: VideoFormValues & { id: number }) => {
      const { id, ...videoData } = data;
      
      // Si l'utilisateur a entré une URL YouTube complète, extraire l'ID
      if (videoData.videoId && (videoData.videoId.includes('youtube.com') || videoData.videoId.includes('youtu.be'))) {
        videoData.videoId = extractYouTubeID(videoData.videoId);
      }
      
      const res = await apiRequest("PUT", `/api/admin/videos/${id}`, videoData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Vidéo mise à jour",
        description: "La vidéo a été mise à jour avec succès.",
      });
      setIsEditDialogOpen(false);
      setSelectedVideo(null);
      editForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la mise à jour de la vidéo: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour supprimer une vidéo
  const deleteVideoMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/videos/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Vidéo supprimée",
        description: "La vidéo a été supprimée avec succès.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedVideo(null);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/videos'] });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de la vidéo: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  // Fonction pour soumettre le formulaire d'ajout
  function onAddSubmit(data: VideoFormValues) {
    addVideoMutation.mutate(data);
  }
  
  // Fonction pour soumettre le formulaire d'édition
  function onEditSubmit(data: VideoFormValues) {
    if (selectedVideo) {
      updateVideoMutation.mutate({ ...data, id: selectedVideo.id });
    }
  }
  
  // Fonction pour ouvrir le dialogue d'édition
  const handleEditClick = (video: Video) => {
    setSelectedVideo(video);
    editForm.reset({
      title: video.title,
      videoId: video.videoId,
      views: video.views || 0,
    });
    setIsEditDialogOpen(true);
  };
  
  // Fonction pour ouvrir le dialogue de suppression
  const handleDeleteClick = (video: Video) => {
    setSelectedVideo(video);
    setIsDeleteDialogOpen(true);
  };
  
  // Fonction pour ouvrir la vidéo sur YouTube
  const openOnYouTube = (videoId: string) => {
    window.open(`https://youtube.com/watch?v=${videoId}`, '_blank');
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Gestion des Vidéos</h2>
            <p className="text-muted-foreground mt-2">
              Gérez les vidéos YouTube qui apparaissent sur le site.
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une vidéo
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Liste des vidéos</CardTitle>
            <CardDescription>
              Les vidéos sont affichées sur la page d'accueil, dans la section "Nos Vidéos".
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <Skeleton key={index} className="w-full h-16" />
                  ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                <h3 className="text-lg font-semibold">Erreur lors du chargement des vidéos</h3>
                <p className="text-muted-foreground">
                  Veuillez rafraîchir la page ou réessayer plus tard.
                </p>
              </div>
            ) : videos?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Film className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-semibold">Aucune vidéo</h3>
                <p className="text-muted-foreground">
                  Ajoutez votre première vidéo YouTube en cliquant sur le bouton "Ajouter une vidéo".
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titre</TableHead>
                      <TableHead>ID YouTube</TableHead>
                      <TableHead>Vues</TableHead>
                      <TableHead>Date de publication</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos?.map((video: Video) => (
                      <TableRow key={video.id}>
                        <TableCell className="font-medium">{video.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="text-sm text-muted-foreground font-mono">
                              {video.videoId}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openOnYouTube(video.videoId)}
                              title="Voir sur YouTube"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatViews(video.views || 0)}</TableCell>
                        <TableCell>
                          {video.publishedAt 
                            ? formatDistanceToNow(new Date(video.publishedAt), { 
                                addSuffix: true, 
                                locale: fr 
                              })
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditClick(video)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteClick(video)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog pour ajouter une vidéo */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Ajouter une vidéo</DialogTitle>
            <DialogDescription>
              Ajoutez une nouvelle vidéo YouTube à afficher sur le site.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de la vidéo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="videoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID ou URL YouTube</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ID YouTube ou URL complète" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Vous pouvez entrer l'ID de la vidéo (ex: dQw4w9WgXcQ) ou l'URL complète.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="views"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de vues</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre initial de vues pour cette vidéo (optionnel).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={addVideoMutation.isPending}
                >
                  {addVideoMutation.isPending ? "Ajout en cours..." : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour éditer une vidéo */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Modifier la vidéo</DialogTitle>
            <DialogDescription>
              Modifiez les informations de la vidéo sélectionnée.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de la vidéo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="videoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID ou URL YouTube</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="ID YouTube ou URL complète" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Vous pouvez entrer l'ID de la vidéo (ex: dQw4w9WgXcQ) ou l'URL complète.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="views"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de vues</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Nombre de vues pour cette vidéo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateVideoMutation.isPending}
                >
                  {updateVideoMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Dialog pour confirmer la suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette vidéo ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          {selectedVideo && (
            <div className="py-4">
              <p className="font-medium">{selectedVideo.title}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedVideo.videoId}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              disabled={deleteVideoMutation.isPending}
              onClick={() => selectedVideo && deleteVideoMutation.mutate(selectedVideo.id)}
            >
              {deleteVideoMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default VideosPage;