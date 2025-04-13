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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

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
  reviewerName?: string;
  notes?: string;
};

export default function ApplicationsPage() {
  const [viewApplication, setViewApplication] = useState<TeamApplication | null>(null);
  const [reviewApplication, setReviewApplication] = useState<TeamApplication | null>(null);
  const [deleteApplication, setDeleteApplication] = useState<TeamApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [currentTab, setCurrentTab] = useState("pending");
  
  // Formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy à HH:mm", { locale: fr });
  };
  
  // Obtenir le texte du poste en français
  const getPositionText = (position: string) => {
    const positions: Record<string, string> = {
      "journalist": "Journaliste",
      "editor": "Éditeur",
      "graphic_designer": "Designer graphique",
      "web_developer": "Développeur web",
      "social_media_manager": "Gestionnaire de médias sociaux",
      "other": "Autre poste"
    };
    return positions[position] || position;
  };
  
  // Récupérer les candidatures
  const { data: applications = [], isLoading } = useQuery<TeamApplication[]>({
    queryKey: ["/api/admin/team/applications"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/team/applications");
      return await response.json();
    },
  });
  
  // Mettre à jour le statut d'une candidature
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/team/applications/${id}/status`, { status, notes });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la candidature a été mis à jour avec succès",
      });
      setReviewApplication(null);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team/applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Supprimer une candidature
  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/team/applications/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidature supprimée",
        description: "La candidature a été supprimée avec succès",
      });
      setDeleteApplication(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/team/applications"] });
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
  const filteredApplications = applications.filter(application => {
    if (currentTab === "pending") return application.status === "pending";
    if (currentTab === "approved") return application.status === "approved";
    if (currentTab === "rejected") return application.status === "rejected";
    return true;
  });
  
  // Gérer l'évaluation d'une candidature
  const handleReview = (status: "approved" | "rejected") => {
    if (reviewApplication) {
      updateStatusMutation.mutate({
        id: reviewApplication.id,
        status,
        notes: reviewNotes
      });
    }
  };
  
  // Gérer la suppression d'une candidature
  const handleDelete = () => {
    if (deleteApplication) {
      deleteApplicationMutation.mutate(deleteApplication.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Candidatures</h1>
            <p className="text-muted-foreground">
              Gérez les candidatures pour rejoindre l'équipe de Politiquensemble.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="pending" onValueChange={setCurrentTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Toutes <Badge variant="outline">{applications.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En attente <Badge variant="outline">{applications.filter(a => a.status === "pending").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              Approuvées <Badge variant="outline">{applications.filter(a => a.status === "approved").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Refusées <Badge variant="outline">{applications.filter(a => a.status === "rejected").length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Chargement des candidatures...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucune candidature</h3>
                <p className="text-muted-foreground">
                  Il n'y a pas encore de candidatures à afficher.
                </p>
              </div>
            ) : (
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
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.fullName}</TableCell>
                      <TableCell>{getPositionText(application.position)}</TableCell>
                      <TableCell>{format(new Date(application.submissionDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        {application.status === "pending" && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="h-3 w-3 mr-1" />
                            En attente
                          </Badge>
                        )}
                        {application.status === "approved" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Approuvée
                          </Badge>
                        )}
                        {application.status === "rejected" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            <X className="h-3 w-3 mr-1" />
                            Refusée
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewApplication(application)}
                        >
                          Voir
                        </Button>
                        
                        {application.status === "pending" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setReviewApplication(application);
                              setReviewNotes("");
                            }}
                          >
                            Évaluer
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700" 
                          onClick={() => setDeleteApplication(application)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Chargement des candidatures...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucune candidature en attente</h3>
                <p className="text-muted-foreground">
                  Toutes les candidatures ont été traitées.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{application.fullName}</CardTitle>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente
                        </Badge>
                      </div>
                      <CardDescription>
                        {getPositionText(application.position)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{format(new Date(application.submissionDate), "dd MMMM yyyy", { locale: fr })}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-1" />
                        <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">
                          {application.email}
                        </a>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setViewApplication(application)}
                      >
                        Voir détails
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => {
                          setReviewApplication(application);
                          setReviewNotes("");
                        }}
                      >
                        Évaluer
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="approved" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Chargement des candidatures...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucune candidature approuvée</h3>
                <p className="text-muted-foreground">
                  Il n'y a pas encore de candidatures approuvées.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{application.fullName}</CardTitle>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Check className="h-3 w-3 mr-1" />
                          Approuvée
                        </Badge>
                      </div>
                      <CardDescription>
                        {getPositionText(application.position)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{format(new Date(application.submissionDate), "dd MMMM yyyy", { locale: fr })}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-1" />
                        <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">
                          {application.email}
                        </a>
                      </div>
                      {application.reviewedAt && (
                        <div className="mt-2 pt-2 border-t text-sm">
                          <p className="text-green-600">
                            Approuvée le {format(new Date(application.reviewedAt), "dd/MM/yyyy")}
                            {application.reviewerName && ` par ${application.reviewerName}`}
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setViewApplication(application)}
                      >
                        Voir détails
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setDeleteApplication(application)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <p>Chargement des candidatures...</p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <X className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucune candidature refusée</h3>
                <p className="text-muted-foreground">
                  Il n'y a pas encore de candidatures refusées.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id} className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{application.fullName}</CardTitle>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <X className="h-3 w-3 mr-1" />
                          Refusée
                        </Badge>
                      </div>
                      <CardDescription>
                        {getPositionText(application.position)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{format(new Date(application.submissionDate), "dd MMMM yyyy", { locale: fr })}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-1" />
                        <a href={`mailto:${application.email}`} className="text-blue-600 hover:underline">
                          {application.email}
                        </a>
                      </div>
                      {application.reviewedAt && (
                        <div className="mt-2 pt-2 border-t text-sm">
                          <p className="text-red-600">
                            Refusée le {format(new Date(application.reviewedAt), "dd/MM/yyyy")}
                            {application.reviewerName && ` par ${application.reviewerName}`}
                          </p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setViewApplication(application)}
                      >
                        Voir détails
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setDeleteApplication(application)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog de visualisation d'une candidature */}
      <Dialog open={!!viewApplication} onOpenChange={(open) => !open && setViewApplication(null)}>
        {viewApplication && (
          <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Candidature de {viewApplication.fullName}</DialogTitle>
              <DialogDescription>
                Soumise le {formatDate(viewApplication.submissionDate)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-2 pr-4 space-y-6">
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
                  <ScrollArea className="h-[150px]">
                    <p className="whitespace-pre-wrap pr-4">{viewApplication.message}</p>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {viewApplication.additionalInfo && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Informations supplémentaires</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[150px]">
                      <p className="whitespace-pre-wrap pr-4">{viewApplication.additionalInfo}</p>
                    </ScrollArea>
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
                        {viewApplication.reviewerName && (
                          <> par <span className="font-medium">{viewApplication.reviewerName}</span></>
                        )}
                      </CardDescription>
                    )}
                  </CardHeader>
                  {viewApplication.notes && (
                    <CardContent>
                      <ScrollArea className="h-[100px]">
                        <p className="whitespace-pre-wrap pr-4">{viewApplication.notes}</p>
                      </ScrollArea>
                    </CardContent>
                  )}
                </Card>
              )}
            </div>
            
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
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
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