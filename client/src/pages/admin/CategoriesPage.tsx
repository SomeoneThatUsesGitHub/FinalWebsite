import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Category, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import AdminLayout from "@/components/admin/AdminLayout";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Trash2, Plus, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Champ de formulaire supplémentaire pour la couleur
const colorOptions = [
  { value: "#1e40af", name: "Bleu" },
  { value: "#047857", name: "Vert" },
  { value: "#b91c1c", name: "Rouge" },
  { value: "#7e22ce", name: "Violet" },
  { value: "#0369a1", name: "Bleu clair" },
  { value: "#0891b2", name: "Cyan" },
  { value: "#4d7c0f", name: "Vert foncé" },
  { value: "#a16207", name: "Orange" },
  { value: "#0f172a", name: "Bleu marine" },
  { value: "#84cc16", name: "Vert clair" },
];

// Schéma Zod pour la validation du formulaire
const formSchema = insertCategorySchema.extend({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  slug: z.string().min(2, "Le slug doit contenir au moins 2 caractères").regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets"),
  color: z.string().min(1, "Veuillez sélectionner une couleur"),
});

type FormValues = z.infer<typeof formSchema>;

const CategoriesPage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Récupération de toutes les catégories
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
      return await res.json();
    },
  });

  // Formulaire pour ajouter une catégorie
  const addForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      color: colorOptions[0].value,
    },
  });

  // Formulaire pour éditer une catégorie
  const editForm = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      color: colorOptions[0].value,
    },
  });

  // Mutation pour ajouter une catégorie
  const addMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/admin/categories", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Catégorie ajoutée",
        description: "La catégorie a été ajoutée avec succès",
      });
    },
    onError: (error: Error) => {
      console.error("Erreur lors de l'ajout de la catégorie:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de l'ajout de la catégorie",
        variant: "destructive",
      });
    },
  });

  // Mutation pour éditer une catégorie
  const editMutation = useMutation({
    mutationFn: async (data: FormValues & { id: number }) => {
      const { id, ...categoryData } = data;
      const res = await apiRequest("PUT", `/api/admin/categories/${id}`, categoryData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedCategory(null);
      toast({
        title: "Catégorie modifiée",
        description: "La catégorie a été modifiée avec succès",
      });
    },
    onError: (error: Error) => {
      console.error("Erreur lors de la modification de la catégorie:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modification de la catégorie",
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer une catégorie
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/categories/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.details || error.message || "Erreur lors de la suppression");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès",
      });
    },
    onError: (error: Error) => {
      console.error("Erreur lors de la suppression de la catégorie:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la suppression de la catégorie",
        variant: "destructive",
      });
    },
  });

  // Génération automatique du slug à partir du nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Handlers pour les formulaires
  const onAddSubmit = (data: FormValues) => {
    addMutation.mutate(data);
  };

  const onEditSubmit = (data: FormValues) => {
    if (!selectedCategory) return;
    editMutation.mutate({ ...data, id: selectedCategory.id });
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    editForm.reset({
      name: category.name,
      slug: category.slug,
      color: category.color,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  };

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gestion des catégories</h1>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter une catégorie
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aucune catégorie trouvée</p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Couleur</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className="w-6 h-6 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        />
                        {colorOptions.find((option) => option.value === category.color)?.name || category.color}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog d'ajout */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter une catégorie</DialogTitle>
              <DialogDescription>
                Créez une nouvelle catégorie pour vos articles.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Politique"
                          onChange={(e) => {
                            field.onChange(e);
                            // Générer le slug automatiquement si le champ slug est vide ou identique à l'ancien slug généré
                            const currentSlug = addForm.getValues("slug");
                            const oldName = field.value;
                            const oldSlug = generateSlug(oldName);
                            
                            if (!currentSlug || currentSlug === oldSlug) {
                              addForm.setValue("slug", generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: politique" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur</FormLabel>
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`w-full h-10 rounded-md cursor-pointer flex items-center justify-center ${
                              field.value === option.value
                                ? "ring-2 ring-primary ring-offset-2"
                                : ""
                            }`}
                            style={{ backgroundColor: option.value }}
                            onClick={() => addForm.setValue("color", option.value)}
                            title={option.name}
                          >
                            {field.value === option.value && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Ajouter
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Modifier la catégorie</DialogTitle>
              <DialogDescription>
                Modifiez les détails de la catégorie sélectionnée.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex: Politique"
                          onChange={(e) => {
                            field.onChange(e);
                            
                            // Ne générer le slug que si le slug est identique à l'ancien nom slugifié
                            const currentSlug = editForm.getValues("slug");
                            const oldName = field.value;
                            const oldSlug = generateSlug(oldName);
                            
                            if (currentSlug === oldSlug) {
                              editForm.setValue("slug", generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: politique" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur</FormLabel>
                      <div className="grid grid-cols-5 gap-2">
                        {colorOptions.map((option) => (
                          <div
                            key={option.value}
                            className={`w-full h-10 rounded-md cursor-pointer flex items-center justify-center ${
                              field.value === option.value
                                ? "ring-2 ring-primary ring-offset-2"
                                : ""
                            }`}
                            style={{ backgroundColor: option.value }}
                            onClick={() => editForm.setValue("color", option.value)}
                            title={option.name}
                          >
                            {field.value === option.value && (
                              <Check className="h-4 w-4 text-white" />
                            )}
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={editMutation.isPending}>
                    {editMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. La suppression d'une catégorie peut échouer si des articles utilisent cette catégorie.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default CategoriesPage;