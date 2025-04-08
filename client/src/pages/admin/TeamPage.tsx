import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, User, UserPlus, Edit, Trash, Check, X } from 'lucide-react';

type User = {
  id: number;
  username: string;
  displayName: string;
  role: string;
  avatarUrl: string | null;
  title: string | null;
  bio: string | null;
  isTeamMember: boolean;
  twitterHandle?: string | null;
  instagramHandle?: string | null;
  email?: string | null;
};

function ProfileForm({ 
  user, 
  onClose,
  onSuccess 
}: { 
  user: User; 
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    role: user.role || 'editor',
    avatarUrl: user.avatarUrl || '',
    title: user.title || '',
    bio: user.bio || '',
    isTeamMember: user.isTeamMember || false,
    twitterHandle: user.twitterHandle || '',
    instagramHandle: user.instagramHandle || '',
    email: user.email || '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest(
        'PUT',
        `/api/admin/users/${user.username}/profile`,
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Profil mis à jour',
        description: 'Le profil a été mis à jour avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team'] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour du profil: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isTeamMember: checked }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Préparation des données avec vérification explicite pour les réseaux sociaux
    const dataToSend = {
      ...formData,
      // S'assurer que les valeurs vides sont préservées mais pas transformées en null
      twitterHandle: formData.twitterHandle,
      instagramHandle: formData.instagramHandle,
      email: formData.email
    };
    
    console.log("Envoi des données de profil:", JSON.stringify(dataToSend, null, 2));
    
    try {
      const result = await updateProfileMutation.mutateAsync(dataToSend);
      console.log("Résultat de la mise à jour:", result);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="displayName">Nom d'affichage</Label>
          <Input
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Rôle</Label>
          <Select
            value={formData.role}
            onValueChange={handleRoleChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrateur</SelectItem>
              <SelectItem value="editor">Éditeur</SelectItem>
              <SelectItem value="user">Utilisateur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">URL de l'avatar</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          value={formData.avatarUrl}
          onChange={handleChange}
          placeholder="https://exemple.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">
          URL d'une image pour l'avatar de l'utilisateur
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Titre / Grade</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Journaliste politique, Éditeur, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Biographie</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Courte biographie de l'utilisateur"
          rows={4}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isTeamMember" 
          checked={formData.isTeamMember}
          onCheckedChange={handleCheckboxChange}
        />
        <Label htmlFor="isTeamMember" className="cursor-pointer">
          Afficher dans l'équipe
        </Label>
      </div>
      
      <h3 className="font-medium text-lg mt-6 mb-2">Réseaux sociaux</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="twitterHandle">Twitter</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
              @
            </span>
            <Input
              id="twitterHandle"
              name="twitterHandle"
              value={formData.twitterHandle}
              onChange={handleChange}
              placeholder="pseudo"
              className="rounded-l-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Pseudo Twitter sans le @
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="instagramHandle">Instagram</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
              @
            </span>
            <Input
              id="instagramHandle"
              name="instagramHandle"
              value={formData.instagramHandle}
              onChange={handleChange}
              placeholder="pseudo"
              className="rounded-l-none"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Pseudo Instagram sans le @
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="exemple@politiquensemble.fr"
          />
          <p className="text-xs text-muted-foreground">
            Adresse email publique
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
            </>
          ) : (
            <>Enregistrer</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function TeamPage() {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des utilisateurs');
      }
      return response.json();
    },
  });

  const teamMembers = users.filter(user => user.isTeamMember);
  const availableUsers = users.filter(user => !user.isTeamMember);

  const addToTeamMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest(
        'POST',
        `/api/admin/team/add/${username}`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Membre ajouté',
        description: 'L\'utilisateur a été ajouté à l\'équipe avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'ajout à l\'équipe: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const removeFromTeamMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest(
        'POST',
        `/api/admin/team/remove/${username}`,
        {}
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Membre retiré',
        description: 'L\'utilisateur a été retiré de l\'équipe avec succès',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/team'] });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors du retrait de l\'équipe: ' + error.message,
        variant: 'destructive',
      });
    },
  });

  const openProfileDialog = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const closeProfileDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
  };

  const handleAddToTeam = async (username: string) => {
    try {
      await addToTeamMutation.mutateAsync(username);
    } catch (error) {
      console.error('Erreur lors de l\'ajout à l\'équipe:', error);
    }
  };

  const handleRemoveFromTeam = async (username: string) => {
    try {
      await removeFromTeamMutation.mutateAsync(username);
    } catch (error) {
      console.error('Erreur lors du retrait de l\'équipe:', error);
    }
  };

  if (isLoadingUsers) {
    return (
      <AdminLayout title="Gestion de l'équipe">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Chargement des utilisateurs...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestion de l'équipe">
      <Tabs defaultValue="team" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="team">Membres de l'équipe</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs disponibles</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Membres de l'équipe actuels</h2>
            <span className="text-sm text-muted-foreground">
              {teamMembers.length} membres
            </span>
          </div>

          {teamMembers.length === 0 ? (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">Aucun membre dans l'équipe</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ajoutez des utilisateurs à l'équipe pour qu'ils apparaissent ici.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Avatar className="h-12 w-12">
                        {user.avatarUrl ? (
                          <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                        ) : (
                          <AvatarFallback>
                            {user.displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openProfileDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFromTeam(user.username)}
                          disabled={removeFromTeamMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{user.displayName}</CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {user.title && (
                      <div className="text-sm font-medium">{user.title}</div>
                    )}
                    {user.bio && (
                      <p className="text-sm text-muted-foreground">{user.bio}</p>
                    )}
                    
                    {/* Afficher les réseaux sociaux si disponibles */}
                    <div className="flex space-x-1 mt-2">
                      {user.twitterHandle && (
                        <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">Twitter</span>
                      )}
                      {user.instagramHandle && (
                        <span className="text-xs bg-pink-100 text-pink-800 rounded-full px-2 py-1">Instagram</span>
                      )}
                      {user.email && (
                        <span className="text-xs bg-gray-100 text-gray-800 rounded-full px-2 py-1">Email</span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/50 px-6 py-3">
                    <div className="text-xs font-medium">
                      {user.role === 'admin'
                        ? 'Administrateur'
                        : user.role === 'editor'
                        ? 'Éditeur'
                        : 'Utilisateur'}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Utilisateurs disponibles</h2>
            <span className="text-sm text-muted-foreground">
              {availableUsers.length} utilisateurs
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Nom d'affichage</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground/50" />
                      <p className="mt-2 text-muted-foreground">
                        Aucun utilisateur disponible
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                availableUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          {user.avatarUrl ? (
                            <AvatarImage
                              src={user.avatarUrl}
                              alt={user.displayName}
                            />
                          ) : (
                            <AvatarFallback>
                              {user.displayName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span className="font-medium">@{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>
                      {user.role === 'admin'
                        ? 'Administrateur'
                        : user.role === 'editor'
                        ? 'Éditeur'
                        : 'Utilisateur'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProfileDialog(user)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Profil
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAddToTeam(user.username)}
                          disabled={addToTeamMutation.isPending}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Ajouter à l'équipe
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Modifiez les informations du profil de {selectedUser?.displayName}.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <ProfileForm 
              user={selectedUser} 
              onClose={closeProfileDialog} 
              onSuccess={() => {
                toast({
                  title: 'Profil mis à jour',
                  description: 'Le profil a été mis à jour avec succès.',
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}