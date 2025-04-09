import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LiveCoverage } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { queryClient } from "@/lib/queryClient";
import { Pencil, Plus, Radio, Trash2, Users, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function DirectsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [directToDelete, setDirectToDelete] = useState<number | null>(null);
  const [userEditorAssignments, setUserEditorAssignments] = useState<Record<number, boolean>>({});
  const isAdmin = user?.isAdmin || user?.role === "admin";

  // Récupérer tous les suivis en direct
  const { data: directs, isLoading, error } = useQuery<LiveCoverage[]>({
    queryKey: ["/api/admin/live-coverages"],
  });
  
  // Pour chaque suivi en direct, vérifier si l'utilisateur actuel est un éditeur
  // (seulement nécessaire pour les éditeurs, pas pour les admins qui ont accès à tout)
  useEffect(() => {
    if (!isAdmin && user && directs && directs.length > 0) {
      const checkEditorStatus = async () => {
        const editorAssignments: Record<number, boolean> = {};
        
        // Pour chaque suivi en direct, vérifier si l'utilisateur est éditeur
        for (const direct of directs) {
          try {
            const response = await fetch(`/api/live-coverages/${direct.id}/editors`);
            if (response.ok) {
              const editors = await response.json();
              // Vérifier si l'utilisateur actuel est dans la liste des éditeurs de ce suivi
              const isEditor = editors.some((editor: any) => editor.editorId === user.id);
              editorAssignments[direct.id] = isEditor;
            }
          } catch (error) {
            console.error(`Erreur lors de la vérification des éditeurs pour le direct ${direct.id}:`, error);
            editorAssignments[direct.id] = false;
          }
        }
        
        setUserEditorAssignments(editorAssignments);
      };
      
      checkEditorStatus();
    }
  }, [directs, user, isAdmin]);

  // Mutation pour supprimer un suivi en direct
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/live-coverages/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression du suivi en direct");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-coverages"] });
      toast({
        title: "Suivi en direct supprimé",
        description: "Le suivi en direct a été supprimé avec succès.",
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

  const handleDeleteClick = (id: number) => {
    setDirectToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (directToDelete !== null) {
      deleteMutation.mutate(directToDelete);
    }
  };

  const activeDirectsCount = directs?.filter(direct => direct.active).length || 0;

  return (
    <AdminLayout title="Suivis en direct">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-muted-foreground">
            {isAdmin ? "Créez et gérez" : "Gérez"} les suivis en direct d'événements, élections et actualités importantes.
            {activeDirectsCount > 0 && (
              <span className="font-medium"> {activeDirectsCount} suivi{activeDirectsCount > 1 ? "s" : ""} actif{activeDirectsCount > 1 ? "s" : ""} en ce moment.</span>
            )}
          </p>
        </div>
        {isAdmin && (
          <Button 
            onClick={() => navigate("/admin/directs/nouveau")}
            disabled={activeDirectsCount >= 3}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouveau suivi en direct
          </Button>
        )}
      </div>

      {activeDirectsCount >= 3 && (
        <div className="mb-6 p-4 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/30 rounded">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>Note :</strong> Vous avez atteint le maximum de 3 suivis en direct actifs. 
            Désactivez un suivi existant pour en créer un nouveau.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 w-full bg-muted rounded"></div>
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full bg-muted rounded"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <Radio className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Erreur lors du chargement des suivis en direct</h3>
          <p className="text-muted-foreground">
            Une erreur est survenue lors de la récupération des suivis en direct.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/live-coverages"] })}
          >
            Réessayer
          </Button>
        </div>
      ) : directs && directs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {directs.map(direct => (
            <Card key={direct.id} className={direct.active ? "border-primary/30" : "opacity-80"}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-2">{direct.title}</CardTitle>
                  <Badge variant={direct.active ? "default" : "outline"}>
                    {direct.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-1">
                  {direct.subject}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                {direct.imageUrl && (
                  <div className="aspect-video rounded-md overflow-hidden mb-4">
                    <img 
                      src={direct.imageUrl} 
                      alt={direct.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {direct.context}
                </p>
                <div className="mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Radio className="mr-2 h-4 w-4" />
                    <span>Créé le {formatDate(direct.createdAt)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                {/* Bouton Modifier - visible seulement pour les admins */}
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/directs/editer/${direct.id}`)}
                  >
                    <Pencil className="mr-2 h-4 w-4" /> Modifier
                  </Button>
                )}
                
                {/* Bouton Questions - visible pour les admins OU les éditeurs assignés à ce direct */}
                {(isAdmin || userEditorAssignments[direct.id]) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => navigate(`/admin/directs/${direct.id}/questions`)}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" /> Questions
                  </Button>
                )}
                
                {/* Bouton Éditeurs - visible seulement pour les admins */}
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => navigate(`/admin/directs/${direct.id}/editeurs`)}
                  >
                    <Users className="mr-2 h-4 w-4" /> Éditeurs
                  </Button>
                )}
                
                {/* Bouton Mises à jour - visible pour les admins OU les éditeurs assignés à ce direct */}
                {(isAdmin || userEditorAssignments[direct.id]) && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className={`flex-1 ${!isAdmin ? "w-full" : "mt-2 w-full"}`}
                    onClick={() => navigate(`/admin/directs/${direct.id}/mises-a-jour`)}
                  >
                    <Radio className="mr-2 h-4 w-4" /> Mises à jour
                  </Button>
                )}
                
                {/* Bouton Supprimer - visible seulement pour les admins */}
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:text-destructive mt-2"
                    onClick={() => handleDeleteClick(direct.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Radio className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Aucun suivi en direct</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isAdmin 
              ? "Créez votre premier suivi en direct pour couvrir un événement important en temps réel."
              : "Aucun suivi en direct n'est disponible pour le moment."}
          </p>
          {isAdmin && (
            <Button 
              className="mt-4"
              onClick={() => navigate("/admin/directs/nouveau")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un suivi en direct
            </Button>
          )}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce suivi en direct ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les mises à jour et contenus associés seront également supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}