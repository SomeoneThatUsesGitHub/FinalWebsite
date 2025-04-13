import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2, Info } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PoliticalGlossaryTerm } from "@shared/schema";

const GlossaryFormSchema = z.object({
  term: z.string().min(2, {
    message: "Le terme doit contenir au moins 2 caractères"
  }),
  definition: z.string().min(10, {
    message: "La définition doit contenir au moins 10 caractères"
  }),
  examples: z.string().optional(),
  category: z.string().optional()
});

type GlossaryFormValues = z.infer<typeof GlossaryFormSchema>;

export default function GlossaryPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<PoliticalGlossaryTerm | null>(null);
  const [termToDelete, setTermToDelete] = useState<PoliticalGlossaryTerm | null>(null);
  const [termToView, setTermToView] = useState<PoliticalGlossaryTerm | null>(null);

  const form = useForm<GlossaryFormValues>({
    resolver: zodResolver(GlossaryFormSchema),
    defaultValues: {
      term: "",
      definition: "",
      examples: "",
      category: ""
    }
  });

  const { data: glossaryTerms, isLoading, error } = useQuery<PoliticalGlossaryTerm[]>({
    queryKey: ["/api/glossary"],
    refetchOnWindowFocus: false,
  });

  const addMutation = useMutation({
    mutationFn: async (data: GlossaryFormValues) => {
      const response = await apiRequest("POST", "/api/admin/glossary", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de l'ajout du terme");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Terme ajouté",
        description: "Le terme a été ajouté au glossaire avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: GlossaryFormValues & { id: number }) => {
      const { id, ...termData } = data;
      const response = await apiRequest("PUT", `/api/admin/glossary/${id}`, termData);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la mise à jour du terme");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Terme mis à jour",
        description: "Le terme a été mis à jour avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
      setIsDialogOpen(false);
      setCurrentTerm(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/glossary/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors de la suppression du terme");
      }
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Terme supprimé",
        description: "Le terme a été supprimé du glossaire avec succès",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/glossary"] });
      setTermToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  function openAddDialog() {
    setCurrentTerm(null);
    form.reset({
      term: "",
      definition: "",
      examples: "",
      category: ""
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(term: PoliticalGlossaryTerm) {
    setCurrentTerm(term);
    form.reset({
      term: term.term,
      definition: term.definition,
      examples: term.examples || "",
      category: term.category || ""
    });
    setIsDialogOpen(true);
  }

  function openViewDialog(term: PoliticalGlossaryTerm) {
    setTermToView(term);
  }

  function openDeleteDialog(term: PoliticalGlossaryTerm) {
    setTermToDelete(term);
  }

  function onSubmit(data: GlossaryFormValues) {
    if (currentTerm) {
      updateMutation.mutate({ ...data, id: currentTerm.id });
    } else {
      addMutation.mutate(data);
    }
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Glossaire Politique</CardTitle>
            <CardDescription>
              Gérez les termes et définitions du décodeur politique pour les utilisateurs
            </CardDescription>
          </div>
          <Button onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un terme
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Une erreur est survenue lors du chargement du glossaire
            </div>
          ) : (
            <Table>
              <TableCaption>Liste des termes du glossaire politique</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Terme</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Dernière modification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {glossaryTerms && glossaryTerms.length > 0 ? (
                  glossaryTerms.map((term) => (
                    <TableRow key={term.id}>
                      <TableCell className="font-medium">{term.term}</TableCell>
                      <TableCell>
                        {term.category ? (
                          <Badge variant="outline">{term.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Non catégorisé</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(term.updatedAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewDialog(term)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(term)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(term)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Aucun terme n'a été ajouté au glossaire
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour ajouter/modifier un terme */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {currentTerm ? "Modifier un terme" : "Ajouter un terme"}
            </DialogTitle>
            <DialogDescription>
              {currentTerm
                ? "Modifiez les informations du terme politique"
                : "Ajoutez un nouveau terme au glossaire politique"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terme</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Motion de censure" {...field} />
                    </FormControl>
                    <FormDescription>
                      Le terme politique à définir
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="definition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Définition</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Définition claire et concise du terme..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Explication simple et accessible pour les jeunes lecteurs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="examples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exemples (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Exemples concrets d'utilisation..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Exemples concrets pour illustrer l'usage du terme
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Institutions, Élections, International..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Catégorie thématique du terme
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Annuler
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={addMutation.isPending || updateMutation.isPending}
                >
                  {(addMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {currentTerm ? "Mettre à jour" : "Ajouter"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation détaillée */}
      <Dialog open={!!termToView} onOpenChange={(open) => !open && setTermToView(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{termToView?.term}</DialogTitle>
            {termToView?.category && (
              <Badge variant="outline" className="mt-1">
                {termToView.category}
              </Badge>
            )}
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <h4 className="text-sm font-medium">Définition</h4>
              <p className="mt-1 text-sm">{termToView?.definition}</p>
            </div>
            
            {termToView?.examples && (
              <div>
                <h4 className="text-sm font-medium">Exemples</h4>
                <p className="mt-1 text-sm">{termToView.examples}</p>
              </div>
            )}
            
            <Separator />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Créé le: {termToView && new Date(termToView.createdAt).toLocaleDateString()}</span>
              <span>Mis à jour le: {termToView && new Date(termToView.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation de suppression */}
      <AlertDialog open={!!termToDelete} onOpenChange={(open) => !open && setTermToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce terme ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Le terme "{termToDelete?.term}" sera définitivement
              supprimé du glossaire politique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => termToDelete && deleteMutation.mutate(termToDelete.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}