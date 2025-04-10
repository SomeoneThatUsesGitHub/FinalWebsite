import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

// Type pour les abonnés à la newsletter
interface NewsletterSubscriber {
  id: number;
  email: string;
  createdAt: string;
}

export default function NewsletterSubscribersPage() {
  const queryClient = useQueryClient();
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Requête pour récupérer les abonnés
  const { data: subscribers, isLoading, error } = useQuery<NewsletterSubscriber[]>({
    queryKey: ["/api/admin/newsletter/subscribers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/newsletter/subscribers");
      return response.json();
    }
  });

  // Mutation pour supprimer un abonné
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/newsletter/subscribers/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "L'abonné a été supprimé avec succès",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/subscribers"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'abonné",
        variant: "destructive",
      });
    }
  });

  // Fonction pour ouvrir la boîte de dialogue de confirmation de suppression
  const handleDeleteClick = (subscriber: NewsletterSubscriber) => {
    setSelectedSubscriber(subscriber);
    setIsDeleteDialogOpen(true);
  };

  // Fonction pour confirmer et exécuter la suppression
  const confirmDelete = () => {
    if (selectedSubscriber) {
      deleteMutation.mutate(selectedSubscriber.id);
    }
  };

  // Gérer l'état de chargement
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader size="lg" />
        </div>
      </AdminLayout>
    );
  }

  // Gérer les erreurs
  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Erreur lors du chargement des abonnés
          </h2>
          <p className="text-muted-foreground mb-4">
            Une erreur est survenue lors de la récupération des données.
          </p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter/subscribers"] })}
            variant="outline"
          >
            Réessayer
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Abonnés Newsletter</h1>
            <p className="text-muted-foreground mt-1">
              Gérez les abonnés à votre newsletter
            </p>
          </div>
        </div>

        {subscribers && subscribers.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">{subscriber.email}</TableCell>
                    <TableCell>
                      {format(new Date(subscriber.createdAt), 'PPP à HH:mm', { locale: fr })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(subscriber)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center border rounded-md bg-background">
            <p className="text-muted-foreground mb-6">
              Aucun abonné à la newsletter pour le moment.
            </p>
          </div>
        )}
      </div>

      {/* Boîte de dialogue de confirmation pour la suppression */}
      <AlertDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet abonné ? Cette action est irréversible.
              <br />
              <span className="font-medium text-primary">
                {selectedSubscriber?.email}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}