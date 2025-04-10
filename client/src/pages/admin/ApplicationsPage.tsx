import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Check, 
  X, 
  Clock, 
  Trash2, 
  FileText, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  Briefcase, 
  ExternalLink, 
  UserPlus,
  Award,
  ClipboardList,
  MessageSquareQuote,
  Loader2 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

// Type pour les candidatures
type TeamApplication = {
  id: number;
  fullName: string;
  email: string;
  position: string;
  message: string;
  phone?: string;
  portfolio?: string;
  additionalInfo?: string;
  status: "pending" | "approved" | "rejected";
  submissionDate: string;
  reviewedAt?: string;
  reviewedBy?: number;
  notes?: string;
};

export default function ApplicationsPage() {
  const [viewApplication, setViewApplication] = useState<TeamApplication | null>(null);
  const [reviewApplication, setReviewApplication] = useState<TeamApplication | null>(null);
  const [deleteApplication, setDeleteApplication] = useState<TeamApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [statusTab, setStatusTab] = useState<"all" | "pending" | "approved" | "rejected">("all");

  // Récupérer toutes les candidatures
  const { data: applications = [], isLoading, isError } = useQuery<TeamApplication[]>({
    queryKey: ['/api/admin/team/applications'],
    refetchOnWindowFocus: false,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/team/applications/${id}/status`, { status, notes });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour du statut");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la candidature a été mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team/applications'] });
      setReviewApplication(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/team/applications/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidature supprimée",
        description: "La candidature a été supprimée avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/team/applications'] });
      setDeleteApplication(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrer les candidatures selon l'onglet actif
  const filteredApplications = applications.filter(app => {
    if (statusTab === "all") return true;
    return app.status === statusTab;
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr });
  };

  // Obtenir la couleur de badge selon le statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Approuvé
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <X className="h-3 w-3" />
            Refusé
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Obtenir le texte du poste
  const getPositionText = (position: string) => {
    const positions: Record<string, string> = {
      "rédacteur": "Rédacteur",
      "graphiste": "Graphiste",
      "community-manager": "Community Manager",
      "vidéaste": "Vidéaste",
      "analyste-politique": "Analyste politique",
      "développeur": "Développeur",
      "autre": "Autre"
    };
    return positions[position] || position;
  };

  // Gérer la revue d'une candidature
  const handleReview = (status: "approved" | "rejected") => {
    if (!reviewApplication) return;
    
    updateStatusMutation.mutate({
      id: reviewApplication.id,
      status,
      notes: reviewNotes
    });
  };

  // Gérer la suppression d'une candidature
  const handleDelete = () => {
    if (!deleteApplication) return;
    deleteApplicationMutation.mutate(deleteApplication.id);
  };

  // Obtenir le nombre de candidatures par statut
  const pendingCount = applications.filter(app => app.status === "pending").length;
  const approvedCount = applications.filter(app => app.status === "approved").length;
  const rejectedCount = applications.filter(app => app.status === "rejected").length;

  return (
    <AdminLayout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-primary">Gestion des candidatures</h1>
            <p className="text-muted-foreground">
              Gérez les candidatures pour rejoindre l'équipe Politiquensemble
            </p>
          </div>
        </div>

        <Tabs 
          value={statusTab} 
          onValueChange={(value) => setStatusTab(value as "all" | "pending" | "approved" | "rejected")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Toutes ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En attente ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Approuvées ({approvedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Refusées ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusTab}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : isError ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-destructive">
                    Erreur lors du chargement des candidatures
                  </div>
                </CardContent>
              </Card>
            ) : filteredApplications.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    Aucune candidature {statusTab !== "all" ? `avec le statut "${statusTab}"` : ""} à afficher
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">{application.fullName}</TableCell>
                          <TableCell>{getPositionText(application.position)}</TableCell>
                          <TableCell>{formatDate(application.submissionDate)}</TableCell>
                          <TableCell>{getStatusBadge(application.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewApplication(application)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                              {application.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setReviewApplication(application);
                                    setReviewNotes(application.notes || "");
                                  }}
                                >
                                  <ClipboardList className="h-4 w-4 mr-1" />
                                  Évaluer
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteApplication(application)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de visualisation d'une candidature */}
      <Dialog open={!!viewApplication} onOpenChange={(open) => !open && setViewApplication(null)}>
        {viewApplication && (
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">Candidature de {viewApplication.fullName}</DialogTitle>
              <DialogDescription>
                Soumise le {formatDate(viewApplication.submissionDate)}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-grow mt-2 pr-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Informations personnelles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Nom complet:</span>
                        <p>{viewApplication.fullName}</p>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>
                        <p className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <a href={`mailto:${viewApplication.email}`} className="text-blue-600 hover:underline">
                            {viewApplication.email}
                          </a>
                        </p>
                      </div>
                      {viewApplication.phone && (
                        <div>
                          <span className="font-medium">Téléphone:</span>
                          <p className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {viewApplication.phone}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Informations professionnelles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-medium">Poste souhaité:</span>
                        <p>{getPositionText(viewApplication.position)}</p>
                      </div>

                      {viewApplication.portfolio && (
                        <div>
                          <span className="font-medium">Portfolio:</span>
                          <p className="flex items-center">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            <a 
                              href={viewApplication.portfolio} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              {viewApplication.portfolio}
                            </a>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <MessageSquareQuote className="h-4 w-4 mr-2" />
                      Motivation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{viewApplication.message}</p>
                  </CardContent>
                </Card>
                
                {viewApplication.additionalInfo && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Informations supplémentaires</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{viewApplication.additionalInfo}</p>
                    </CardContent>
                  </Card>
                )}
                
                {viewApplication.status !== "pending" && (
                  <Card className={`border-l-4 ${
                    viewApplication.status === "approved" ? "border-l-green-500" : "border-l-red-500"
                  }`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center">
                        {viewApplication.status === "approved" ? (
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 mr-2 text-red-500" />
                        )}
                        {viewApplication.status === "approved" ? "Candidature approuvée" : "Candidature refusée"}
                      </CardTitle>
                      {viewApplication.reviewedAt && (
                        <CardDescription>
                          Revue le {formatDate(viewApplication.reviewedAt)}
                        </CardDescription>
                      )}
                    </CardHeader>
                    {viewApplication.notes && (
                      <CardContent>
                        <p className="whitespace-pre-wrap">{viewApplication.notes}</p>
                      </CardContent>
                    )}
                  </Card>
                )}
              </div>
            </ScrollArea>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewApplication(null)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialog d'évaluation d'une candidature */}
      <Dialog open={!!reviewApplication} onOpenChange={(open) => !open && setReviewApplication(null)}>
        {reviewApplication && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Évaluer la candidature</DialogTitle>
              <DialogDescription>
                Candidature de {reviewApplication.fullName} pour le poste de {getPositionText(reviewApplication.position)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Notes d'évaluation (optionnel)</label>
                <Textarea 
                  placeholder="Entrez vos commentaires sur cette candidature..." 
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={5}
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
              <Button variant="outline" onClick={() => setReviewApplication(null)}>
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleReview("rejected")}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending && updateStatusMutation.variables?.status === "rejected" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <X className="h-4 w-4 mr-2" />
                )}
                Refuser
              </Button>
              <Button 
                variant="default" 
                onClick={() => handleReview("approved")}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending && updateStatusMutation.variables?.status === "approved" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approuver
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteApplication} onOpenChange={(open) => !open && setDeleteApplication(null)}>
        {deleteApplication && (
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement la candidature de {deleteApplication.fullName} ?
                Cette action ne peut pas être annulée.
              </DialogDescription>
            </DialogHeader>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteApplication(null)}>
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteApplicationMutation.isPending}
              >
                {deleteApplicationMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
}