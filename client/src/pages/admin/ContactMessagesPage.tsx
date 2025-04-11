import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquareText,
  Trash2,
  Check,
  Mail,
  Phone,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  CalendarDays
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";

// Type pour les messages
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
  const { toast } = useToast();
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  
  // Récupérer tous les messages de contact
  const { data: messages, isLoading, isError } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/contact-messages"],
    retry: false
  });
  
  // Mutation pour marquer un message comme lu
  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PATCH", `/api/admin/contact-messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      toast({
        title: "Message marqué comme lu",
        description: "Le message a été marqué comme lu avec succès.",
      });
    },
    onError: (error) => {
      console.error("Erreur lors du marquage du message comme lu:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du marquage du message comme lu.",
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour supprimer un message
  const deleteMessageMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/contact-messages/${id}`);
    },
    onSuccess: () => {
      setMessageToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] });
      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès.",
      });
    },
    onError: (error) => {
      setMessageToDelete(null);
      console.error("Erreur lors de la suppression du message:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du message.",
        variant: "destructive",
      });
    },
  });
  
  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };
  
  const handleDelete = (id: number) => {
    setMessageToDelete(id);
  };
  
  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete);
    }
  };
  
  const cancelDelete = () => {
    setMessageToDelete(null);
  };
  
  // Affichage de l'état de chargement
  if (isLoading) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Messages de contact | Administration</title>
        </Helmet>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messages de contact</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <Skeleton className="h-6 w-4/5 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-4 flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </AdminLayout>
    );
  }
  
  // Affichage des erreurs
  if (isError) {
    return (
      <AdminLayout>
        <Helmet>
          <title>Messages de contact | Administration</title>
        </Helmet>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messages de contact</h1>
        </div>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6 flex flex-col items-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Erreur lors du chargement des messages</h2>
          <p className="text-center">
            Une erreur est survenue lors de la récupération des messages de contact. Veuillez réessayer ultérieurement ou contacter le support technique.
          </p>
          <Button 
            variant="outline"
            className="mt-4"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/contact-messages"] })}
          >
            Réessayer
          </Button>
        </div>
      </AdminLayout>
    );
  }
  
  // Tri des messages: non lus en premier, puis par date (les plus récents en premier)
  const sortedMessages = [...(messages || [])].sort((a, b) => {
    // D'abord, trier par statut (non lu -> lu)
    if (a.read !== b.read) {
      return a.read ? 1 : -1;
    }
    // Ensuite, trier par date (du plus récent au plus ancien)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Messages de contact | Administration</title>
      </Helmet>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Messages de contact</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className={`px-3 py-1 ${!sortedMessages.length ? 'bg-gray-100' : sortedMessages.some(m => !m.read) ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
            {!sortedMessages.length 
              ? 'Aucun message' 
              : sortedMessages.some(m => !m.read)
                ? `${sortedMessages.filter(m => !m.read).length} non lu${sortedMessages.filter(m => !m.read).length > 1 ? 's' : ''}`
                : 'Tous lus'}
          </Badge>
          <Badge variant="outline" className="px-3 py-1 bg-gray-50">
            {sortedMessages.length} message{sortedMessages.length > 1 ? 's' : ''} au total
          </Badge>
        </div>
      </div>
      
      {sortedMessages.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <MessageSquareText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Aucun message de contact</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Vous n'avez reçu aucun message de contact pour le moment. Les messages envoyés via le formulaire de contact apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedMessages.map((message) => (
            <Card 
              key={message.id} 
              className={`overflow-hidden border ${!message.read ? 'border-blue-300 shadow-md' : 'border-gray-200'}`}
            >
              <CardHeader className={`${!message.read ? 'bg-blue-50' : 'bg-gray-50'} border-b p-4`}>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{message.name}</CardTitle>
                  {!message.read && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Nouveau
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center mt-1">
                  <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                  {format(new Date(message.createdAt), "dd MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">{message.subject}</h3>
                  <p className="text-gray-600 line-clamp-4 text-sm">{message.message}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline">
                      {message.email}
                    </a>
                  </div>
                  
                  {message.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a href={`tel:${message.phone}`} className="text-blue-600 hover:underline">
                        {message.phone}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className={`${!message.read ? 'bg-blue-50' : 'bg-gray-50'} border-t p-4 flex justify-between`}>
                {!message.read ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600 border-blue-300 hover:bg-blue-50" 
                    onClick={() => handleMarkAsRead(message.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Marquer comme lu
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-gray-600" 
                    disabled
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Déjà lu
                  </Button>
                )}
                
                <AlertDialog open={messageToDelete === message.id} onOpenChange={() => messageToDelete === message.id && setMessageToDelete(null)}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50" 
                      onClick={() => handleDelete(message.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={cancelDelete}>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}