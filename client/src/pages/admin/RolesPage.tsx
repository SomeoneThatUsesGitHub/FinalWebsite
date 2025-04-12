import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/admin/AdminLayout";
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
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus, Edit, Trash2, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Type pour les permissions
type AdminPermission = {
  id: number;
  code: string;
  displayName: string;
  description: string;
  icon: string;
  category: string;
  createdAt: string;
};

// Type pour les rôles
type CustomRole = {
  id: number;
  name: string;
  displayName: string;
  description: string;
  color: string;
  isSystem: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  permissions: AdminPermission[];
};

// Schéma de validation du formulaire de rôle
const roleFormSchema = z.object({
  name: z.string().min(3, "Le nom doit contenir au moins 3 caractères").max(50),
  displayName: z.string().min(2, "Le nom d'affichage doit contenir au moins 2 caractères").max(50),
  description: z.string().max(200, "La description ne peut pas dépasser 200 caractères").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "La couleur doit être au format hexadécimal (#RRGGBB)"),
  priority: z.coerce.number().int().min(0).max(100),
  permissionIds: z.array(z.number()).optional(),
});

export default function RolesPage() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const { toast } = useToast();
  
  // Formulaire pour l'ajout/édition d'un rôle
  const form = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: "",
      displayName: "",
      description: "",
      color: "#3B82F6",
      priority: 10,
      permissionIds: [],
    },
  });
  
  // Fetch de tous les rôles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/admin/roles");
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des rôles");
      }
      
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les rôles. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch de toutes les permissions
  const fetchPermissions = async () => {
    try {
      const response = await apiRequest("GET", "/api/admin/roles/permissions/all");
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des permissions");
      }
      
      const data = await response.json();
      setPermissions(data);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les permissions.",
        variant: "destructive",
      });
    }
  };
  
  // Ouvrir la boîte de dialogue d'ajout
  const openAddDialog = () => {
    form.reset({
      name: "",
      displayName: "",
      description: "",
      color: "#3B82F6",
      priority: 10,
      permissionIds: [],
    });
    setEditingRole(null);
    setDialogOpen(true);
  };
  
  // Ouvrir la boîte de dialogue d'édition
  const openEditDialog = (role: CustomRole) => {
    form.reset({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      color: role.color,
      priority: role.priority,
      permissionIds: role.permissions.map(p => p.id),
    });
    setEditingRole(role);
    setDialogOpen(true);
  };
  
  // Soumission du formulaire
  const onSubmit = async (values: z.infer<typeof roleFormSchema>) => {
    try {
      let response;
      
      if (editingRole) {
        // Mise à jour d'un rôle existant
        response = await apiRequest("PUT", `/api/admin/roles/${editingRole.id}`, values);
      } else {
        // Création d'un nouveau rôle
        response = await apiRequest("POST", "/api/admin/roles", values);
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Une erreur est survenue");
      }
      
      toast({
        title: editingRole ? "Rôle mis à jour" : "Rôle créé",
        description: editingRole 
          ? `Le rôle "${values.displayName}" a été mis à jour avec succès.`
          : `Le rôle "${values.displayName}" a été créé avec succès.`,
      });
      
      // Rafraîchir la liste des rôles
      fetchRoles();
      setDialogOpen(false);
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'opération",
        variant: "destructive",
      });
    }
  };
  
  // Supprimer un rôle
  const deleteRole = async (id: number) => {
    try {
      const response = await apiRequest("DELETE", `/api/admin/roles/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Une erreur est survenue");
      }
      
      toast({
        title: "Rôle supprimé",
        description: "Le rôle a été supprimé avec succès.",
      });
      
      // Rafraîchir la liste des rôles
      fetchRoles();
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression",
        variant: "destructive",
      });
    }
  };
  
  // Récupérer les données au chargement de la page
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);
  
  // Groupe les permissions par catégorie pour l'affichage
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, AdminPermission[]>);
  
  // Catégories triées dans un ordre spécifique
  const categoryOrder = ["general", "content", "communication", "system"];
  const sortedCategories = Object.keys(permissionsByCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );
  
  // Traduction des catégories
  const categoryTranslation: Record<string, string> = {
    general: "Général",
    content: "Contenu",
    communication: "Communication",
    system: "Système"
  };
  
  return (
    <AdminLayout currentPage="roles">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestion des rôles</h1>
            <p className="text-muted-foreground">
              Créez et gérez les rôles et leurs permissions
            </p>
          </div>
          <Button onClick={openAddDialog} className="flex items-center gap-2">
            <Plus size={16} />
            <span>Nouveau rôle</span>
          </Button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6">
            {roles.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Aucun rôle trouvé</p>
                  <Button onClick={openAddDialog} variant="outline" className="mt-4">
                    Créer le premier rôle
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card key={role.id} className="overflow-hidden">
                    <div className="h-2" style={{ backgroundColor: role.color }} />
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {role.isSystem ? <ShieldCheck size={18} /> : <Shield size={18} />}
                            {role.displayName}
                          </CardTitle>
                          <CardDescription>{role.name}</CardDescription>
                        </div>
                        <Badge
                          variant={role.isSystem ? "secondary" : "outline"}
                          className="ml-2"
                        >
                          {role.isSystem ? "Système" : "Personnalisé"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {role.description || "Aucune description"}
                      </p>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Permissions ({role.permissions.length})</div>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.length > 0 ? (
                            role.permissions
                              .slice(0, 5)
                              .map((permission) => (
                                <Badge key={permission.id} variant="secondary" className="text-xs">
                                  {permission.displayName}
                                </Badge>
                              ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Aucune permission</span>
                          )}
                          {role.permissions.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 5} autres
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t bg-muted/20 p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(role)}
                        className="flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Modifier
                      </Button>
                      
                      {!role.isSystem && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-1"
                            >
                              <Trash2 size={14} />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer le rôle "{role.displayName}" ? 
                                Cette action ne peut pas être annulée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <Button
                                variant="destructive"
                                onClick={() => deleteRole(role.id)}
                              >
                                Supprimer
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Dialogue d'ajout/édition de rôle */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? `Modifier le rôle: ${editingRole.displayName}` : "Créer un nouveau rôle"}
            </DialogTitle>
            <DialogDescription>
              {editingRole 
                ? "Modifiez les détails et les permissions du rôle."
                : "Remplissez les détails ci-dessous pour créer un nouveau rôle."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'affichage</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Administrateur des articles"
                          {...field}
                          disabled={editingRole?.isSystem}
                        />
                      </FormControl>
                      <FormDescription>
                        Le nom visible aux utilisateurs
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identifiant technique</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: article_admin"
                          {...field}
                          disabled={editingRole?.isSystem}
                        />
                      </FormControl>
                      <FormDescription>
                        Identifiant unique (sans espaces)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Décrivez ce que ce rôle permet de faire..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur</FormLabel>
                      <div className="flex gap-2">
                        <div
                          className="w-10 h-10 rounded border"
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input placeholder="#3B82F6" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priorité</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} {...field} />
                      </FormControl>
                      <FormDescription>
                        Une valeur plus élevée = priorité plus haute
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div>
                <FormLabel>Permissions</FormLabel>
                <FormDescription className="mb-2">
                  Sélectionnez les permissions accordées à ce rôle
                </FormDescription>
                
                <ScrollArea className="h-[220px] border rounded-md p-4">
                  {sortedCategories.map((category) => (
                    <div key={category} className="mb-4">
                      <h4 className="text-sm font-medium mb-2">
                        {categoryTranslation[category] || category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {permissionsByCategory[category].map((permission) => (
                          <FormField
                            key={permission.id}
                            control={form.control}
                            name="permissionIds"
                            render={({ field }) => (
                              <FormItem
                                key={permission.id}
                                className="flex flex-row items-start space-x-2 space-y-0 rounded-md border p-2"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(permission.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValues, permission.id]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter((value) => value !== permission.id)
                                        );
                                      }
                                    }}
                                    disabled={editingRole?.isSystem}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="text-sm font-medium">
                                    {permission.displayName}
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                </div>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex items-center gap-1"
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingRole ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}