import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  Trash2, 
  FileText, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  MessageSquare, 
  Tag,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Filter
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
import { ScrollArea } from "@/components/ui/scroll-area";

// Type pour les messages de contact
type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function ContactMessagesPage() {
  const [viewMessage, setViewMessage] = useState<ContactMessage | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<ContactMessage | null>(null);
  const [statusTab, setStatusTab] = useState<"all" | "unread" | "read">("all");

  // Récupérer tous les messages de contact
  const { data: messages = [], isLoading, isError } = useQuery<ContactMessage[]>({
    queryKey: ['/api/admin/contact-messages'],
    refetchOnWindowFocus: false,
  });

  // Mutation pour marquer comme lu
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("PATCH", `/api/admin/contact-messages/${id}/read`, {});
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors du marquage comme lu");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message marqué comme lu",
        description: "Le message a été marqué comme lu avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] });
      // Ne pas fermer la boîte de dialogue pour permettre de continuer à lire
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un message
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/contact-messages/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la suppression");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/contact-messages'] });
      setDeleteMessage(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filtrer les messages selon l'onglet actif
  const filteredMessages = messages.filter(msg => {
    if (statusTab === "all") return true;
    if (statusTab === "read") return msg.read;
    if (statusTab === "unread") return !msg.read;
    return true;
  });

  // Formater la date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr });
  };

  // Gérer la visualisation et marquer comme lu
  const handleViewMessage = (message: ContactMessage) => {
    setViewMessage(message);
    
    // Si le message n'est pas encore lu, le marquer comme lu
    if (!message.read) {
      markAsReadMutation.mutate(message.id);
    }
  };

  // Gérer la suppression d'un message
  const handleDelete = () => {
    if (!deleteMessage) return;
    deleteMessageMutation.mutate(deleteMessage.id);
  };

  // Obtenir le nombre de messages par statut
  const unreadCount = messages.filter(msg => !msg.read).length;
  const readCount = messages.filter(msg => msg.read).length;

  return (
    <AdminLayout title="Messages de contact">
      <div className="flex flex-col">
        <p className="text-muted-foreground mb-6">
          Gérez les messages envoyés via le formulaire de contact
        </p>

        <Tabs 
          value={statusTab} 
          onValueChange={(value) => setStatusTab(value as "all" | "unread" | "read")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Tous ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex items-center gap-2">
              <EyeOff className="h-4 w-4" />
              Non lus ({unreadCount})
            </TabsTrigger>
            <TabsTrigger value="read" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Lus ({readCount})
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
                    Erreur lors du chargement des messages
                  </div>
                </CardContent>
              </Card>
            ) : filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    Aucun message {statusTab !== "all" ? `avec le statut "${statusTab === "read" ? "lu" : "non lu"}"` : ""} à afficher
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Expéditeur</TableHead>
                        <TableHead>Sujet</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMessages.map((message) => (
                        <TableRow key={message.id} className={!message.read ? "bg-blue-50/50" : ""}>
                          <TableCell className="font-medium">{message.name}</TableCell>
                          <TableCell>{message.subject}</TableCell>
                          <TableCell>{formatDate(message.createdAt)}</TableCell>
                          <TableCell>
                            {message.read ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Lu
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                                <EyeOff className="h-3 w-3" />
                                Non lu
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewMessage(message)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Voir
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setDeleteMessage(message)}
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

      {/* Dialog de visualisation d'un message */}
      <Dialog open={!!viewMessage} onOpenChange={(open) => !open && setViewMessage(null)}>
        {viewMessage && (
          <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">{viewMessage.subject}</DialogTitle>
              <DialogDescription>
                Envoyé par {viewMessage.name} le {formatDate(viewMessage.createdAt)}
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="flex-grow mt-4 pr-4">
              <div className="space-y-6">
                {/* Informations de contact */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Informations de contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="font-medium">Nom:</span>
                      <p>{viewMessage.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        <a href={`mailto:${viewMessage.email}`} className="text-blue-600 hover:underline">
                          {viewMessage.email}
                        </a>
                      </p>
                    </div>
                    {viewMessage.phone && (
                      <div>
                        <span className="font-medium">Téléphone:</span>
                        <p className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {viewMessage.phone}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Message */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap bg-muted/30 p-4 rounded-md border">
                      {viewMessage.message}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
            
            <DialogFooter className="flex items-center justify-between mt-4 gap-4">
              <div>
                {!viewMessage.read && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Message non lu
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteMessage(viewMessage)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteMessage} onOpenChange={(open) => !open && setDeleteMessage(null)}>
        {deleteMessage && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer définitivement ce message de {deleteMessage.name} ?
                Cette action ne peut pas être annulée.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDeleteMessage(null)}
                disabled={deleteMessageMutation.isPending}
              >
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMessageMutation.isPending}
              >
                {deleteMessageMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AdminLayout>
  );
}