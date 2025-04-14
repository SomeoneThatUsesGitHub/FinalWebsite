import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, Search, Trash } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableCaption,
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
import { queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Election {
  id: number;
  country: string;
  countryCode: string;
  title: string;
  date: string;
  type: string;
}

interface ElectionReaction {
  id: number;
  electionId: number;
  author: string;
  content: string;
  createdAt: string;
}

export default function ElectionReactionsPage() {
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Récupérer la liste des élections
  const { data: elections, isLoading: electionsLoading } = useQuery<Election[]>({
    queryKey: ["/api/elections"],
  });

  // Récupérer les réactions pour l'élection sélectionnée
  const { data: reactions, isLoading: reactionsLoading } = useQuery<ElectionReaction[]>({
    queryKey: ["/api/elections", selectedElectionId, "reactions"],
    queryFn: async () => {
      if (!selectedElectionId) return [];
      const response = await fetch(`/api/elections/${selectedElectionId}/reactions`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des réactions");
      }
      return response.json();
    },
    enabled: !!selectedElectionId,
  });

  // Mutation pour supprimer une réaction
  const deleteReactionMutation = useMutation({
    mutationFn: async (reactionId: number) => {
      const response = await fetch(`/api/elections/reactions/${reactionId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la réaction");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Réaction supprimée",
        description: "La réaction a été supprimée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/elections", selectedElectionId, "reactions"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrer les réactions par le terme de recherche
  const filteredReactions = reactions?.filter((reaction) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      reaction.author.toLowerCase().includes(searchLower) ||
      reaction.content.toLowerCase().includes(searchLower)
    );
  });

  // Formatter la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gérer les réactions aux élections</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Réactions aux élections</CardTitle>
            <CardDescription>
              Gérez les réactions des utilisateurs aux résultats des élections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sélection de l'élection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Sélectionner une élection
                  </label>
                  <Select
                    value={selectedElectionId}
                    onValueChange={setSelectedElectionId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une élection" />
                    </SelectTrigger>
                    <SelectContent>
                      {electionsLoading ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        elections?.map((election) => (
                          <SelectItem
                            key={election.id}
                            value={election.id.toString()}
                          >
                            {election.title} ({election.country})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {selectedElectionId && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">
                      Rechercher
                    </label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par nom ou contenu..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tableau des réactions */}
              {selectedElectionId && (
                <div className="border rounded-md">
                  <Table>
                    <TableCaption>
                      {reactionsLoading
                        ? "Chargement des réactions..."
                        : filteredReactions?.length
                        ? `Liste des réactions (${filteredReactions.length})`
                        : "Aucune réaction trouvée"}
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{ width: "20%" }}>Auteur</TableHead>
                        <TableHead style={{ width: "50%" }}>Contenu</TableHead>
                        <TableHead style={{ width: "20%" }}>Date</TableHead>
                        <TableHead style={{ width: "10%" }}>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reactionsLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredReactions?.length ? (
                        filteredReactions.map((reaction) => (
                          <TableRow key={reaction.id}>
                            <TableCell className="font-medium">
                              {reaction.author}
                            </TableCell>
                            <TableCell>{reaction.content}</TableCell>
                            <TableCell>
                              {formatDate(reaction.createdAt)}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Confirmer la suppression
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Êtes-vous sûr de vouloir supprimer cette
                                      réaction ? Cette action ne peut pas être
                                      annulée.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        deleteReactionMutation.mutate(reaction.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {deleteReactionMutation.isPending
                                        ? "Suppression..."
                                        : "Supprimer"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground py-8"
                          >
                            Aucune réaction trouvée
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}