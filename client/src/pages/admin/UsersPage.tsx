import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Trash2, Pencil, UserPlus, Key, UserCog } from "lucide-react";

import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Schéma pour la création d'un utilisateur
const createUserSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  displayName: z.string().min(2, "Le nom d'affichage doit contenir au moins 2 caractères"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["admin", "editor", "user"]),
  customRoleId: z.number().nullable().optional(),
});

// Schéma pour la mise à jour du mot de passe
const updatePasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

// Type pour les utilisateurs
interface User {
  id: number;
  username: string;
  displayName: string;
  role: "admin" | "editor" | "user";
  customRoleId: number | null;
  avatarUrl: string | null;
}

function UsersPage() {
  const { toast } = useToast();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Récupérer les informations de l'utilisateur connecté
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/auth/me");
      const userData = await response.json();
      // Stocker le nom d'utilisateur dans le localStorage pour le retrouver facilement
      if (userData && userData.username) {
        window.localStorage.setItem("currentUsername", userData.username);
      }
      return userData;
    },
  });

  // Récupérer la liste des utilisateurs
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return await response.json();
    },
  });

  // Mutation pour créer un utilisateur
  const createUserMutation = useMutation({
    mutationFn: async (values: CreateUserFormValues) => {
      const response = await apiRequest("POST", "/api/admin/users", values);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création de l'utilisateur");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès",
      });
      setOpenCreateModal(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour changer le mot de passe
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${username}/password`, { password });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la modification du mot de passe");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Mot de passe modifié",
        description: "Le mot de passe a été modifié avec succès",
      });
      setOpenPasswordModal(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${username}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression de l'utilisateur");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour changer le rôle d'un utilisateur
  const updateRoleMutation = useMutation({
    mutationFn: async ({ username, role, customRoleId }: { username: string; role: string; customRoleId?: number | null }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${username}/profile`, { role, customRoleId });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la modification du rôle");
      }
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Rôle modifié",
        description: "Le rôle de l'utilisateur a été modifié avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      
      // Si l'utilisateur a changé son propre rôle, il faut mettre à jour les données de session
      if (data.user && data.user.username === window.localStorage.getItem("currentUsername")) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Récupérer les rôles personnalisés
  const { data: customRoles } = useQuery({
    queryKey: ["/api/admin/roles"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/roles");
      return response.ok ? await response.json() : [];
    },
  });
  
  // Formulaire de création d'utilisateur
  const createForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      displayName: "",
      password: "",
      role: "editor",
      customRoleId: null,
    },
  });

  // Formulaire de modification de mot de passe
  const passwordForm = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  // Soumission du formulaire de création d'utilisateur
  const onCreateSubmit = (values: CreateUserFormValues) => {
    createUserMutation.mutate(values);
  };

  // Soumission du formulaire de modification de mot de passe
  const onPasswordSubmit = (values: UpdatePasswordFormValues) => {
    if (selectedUser) {
      updatePasswordMutation.mutate({
        username: selectedUser.username,
        password: values.password,
      });
    }
  };

  // Gestion de la suppression d'un utilisateur
  const handleDeleteUser = (user: User) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.displayName} ?`)) {
      deleteUserMutation.mutate(user.username);
    }
  };

  // Fonction pour obtenir l'initiale du nom d'utilisateur pour l'avatar
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  // Fonction pour obtenir la couleur en fonction du rôle
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 hover:bg-red-600";
      case "editor":
        return "bg-blue-500 hover:bg-blue-600";
      case "user":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Fonction pour obtenir le libellé du rôle en français
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrateur";
      case "editor":
        return "Éditeur";
      case "user":
        return "Utilisateur";
      default:
        return role;
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">
            Créez, modifiez et supprimez les comptes utilisateurs de la plateforme.
          </p>
        </div>
        <Button onClick={() => setOpenCreateModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users && users.map((user) => (
            <Card key={user.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {user.avatarUrl ? (
                        <AvatarImage src={user.avatarUrl} alt={user.displayName} />
                      ) : (
                        <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{user.displayName}</CardTitle>
                      <CardDescription className="text-sm">@{user.username}</CardDescription>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleLabel(user.role)}
                    </Badge>
                    {user.customRoleId && customRoles && (
                      <Badge variant="outline" className="border-gray-300 text-xs">
                        {customRoles.find((role: any) => role.id === user.customRoleId)?.displayName || "Rôle personnalisé"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 w-full"
                        >
                          <UserCog className="mr-2 h-4 w-4" />
                          Changer le rôle
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                        <DropdownMenuLabel>Rôles principaux</DropdownMenuLabel>
                        <DropdownMenuItem
                          disabled={user.role === "admin"}
                          onClick={() => {
                            if (user.role !== "admin") {
                              updateRoleMutation.mutate({ username: user.username, role: "admin" });
                            }
                          }}
                          className={user.role === "admin" ? "bg-red-50" : ""}
                        >
                          <Badge className="bg-red-500 hover:bg-red-600 mr-2">A</Badge>
                          Administrateur
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.role === "editor"}
                          onClick={() => {
                            if (user.role !== "editor") {
                              // Si l'utilisateur est admin et veut changer son propre rôle
                              if (user.role === "admin" && user.username === currentUser?.username) {
                                if (window.confirm("En changeant votre rôle d'administrateur à éditeur, vous allez perdre l'accès à certaines fonctionnalités administratives. Êtes-vous sûr de vouloir continuer ?")) {
                                  updateRoleMutation.mutate({ username: user.username, role: "editor" });
                                }
                              } else {
                                updateRoleMutation.mutate({ username: user.username, role: "editor" });
                              }
                            }
                          }}
                          className={user.role === "editor" ? "bg-blue-50" : ""}
                        >
                          <Badge className="bg-blue-500 hover:bg-blue-600 mr-2">E</Badge>
                          Éditeur
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={user.role === "user"}
                          onClick={() => {
                            if (user.role !== "user") {
                              // Si l'utilisateur est admin et veut changer son propre rôle
                              if (user.role === "admin" && user.username === currentUser?.username) {
                                if (window.confirm("En changeant votre rôle d'administrateur à utilisateur standard, vous allez perdre l'accès aux fonctionnalités administratives. Êtes-vous sûr de vouloir continuer ?")) {
                                  updateRoleMutation.mutate({ username: user.username, role: "user" });
                                }
                              } else {
                                updateRoleMutation.mutate({ username: user.username, role: "user" });
                              }
                            }
                          }}
                          className={user.role === "user" ? "bg-green-50" : ""}
                        >
                          <Badge className="bg-green-500 hover:bg-green-600 mr-2">U</Badge>
                          Utilisateur
                        </DropdownMenuItem>
                        
                        {customRoles && customRoles.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Rôles personnalisés</DropdownMenuLabel>
                            
                            {/* Option pour supprimer le rôle personnalisé */}
                            <DropdownMenuItem
                              onClick={() => {
                                // Mise à jour du rôle personnalisé à null
                                if (user.customRoleId !== null) {
                                  // Ici on pourrait ajouter une API spécifique pour mettre à jour uniquement customRoleId
                                  // Pour l'instant, on utilise la mutation existante de mise à jour du profil
                                  updateRoleMutation.mutate({ 
                                    username: user.username, 
                                    role: user.role,
                                    customRoleId: null 
                                  });
                                }
                              }}
                              className={user.customRoleId === null ? "bg-gray-50" : ""}
                            >
                              <Badge variant="outline" className="mr-2">-</Badge>
                              Aucun rôle personnalisé
                            </DropdownMenuItem>
                            
                            {/* Liste des rôles personnalisés */}
                            {customRoles.map((role: any) => (
                              <DropdownMenuItem
                                key={role.id}
                                disabled={user.customRoleId === role.id}
                                onClick={() => {
                                  if (user.customRoleId !== role.id) {
                                    // Mise à jour du rôle personnalisé
                                    updateRoleMutation.mutate({ 
                                      username: user.username, 
                                      role: user.role,
                                      customRoleId: role.id 
                                    });
                                  }
                                }}
                                className={user.customRoleId === role.id ? "bg-purple-50" : ""}
                              >
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-200 mr-2">
                                  {role.name.charAt(0).toUpperCase()}
                                </Badge>
                                {role.displayName}
                              </DropdownMenuItem>
                            ))}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setOpenPasswordModal(true);
                      }}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Mot de passe
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de création d'utilisateur */}
      <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Créez un nouvel utilisateur avec les informations ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="nom.utilisateur" {...field} />
                    </FormControl>
                    <FormDescription>
                      Identifiant unique utilisé pour la connexion
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'affichage</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom Nom" {...field} />
                    </FormControl>
                    <FormDescription>
                      Nom qui sera affiché publiquement
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="•••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Au moins 8 caractères
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle principal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="editor">Éditeur</SelectItem>
                        <SelectItem value="user">Utilisateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Les droits d'accès principaux de l'utilisateur
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="customRoleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle personnalisé</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)} 
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle personnalisé (optionnel)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucun rôle personnalisé</SelectItem>
                        {customRoles && customRoles.map((role: any) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Permissions supplémentaires spécifiques
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? "Création en cours..." : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de modification de mot de passe */}
      <Dialog open={openPasswordModal} onOpenChange={setOpenPasswordModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le mot de passe</DialogTitle>
            <DialogDescription>
              {selectedUser && `Définir un nouveau mot de passe pour ${selectedUser.displayName}`}
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="•••••••••" {...field} />
                    </FormControl>
                    <FormDescription>
                      Au moins 8 caractères
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending ? "Modification en cours..." : "Modifier"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default UsersPage;