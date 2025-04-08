import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LiveCoverage, insertLiveCoverageSchema, User } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  Edit, 
  Eye, 
  Pencil, 
  Plus, 
  Trash, 
  X, 
  CalendarIcon
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Form schema for live coverage
const liveCoverageFormSchema = insertLiveCoverageSchema.extend({
  endDate: z.date().nullable().optional(),
  selectedEditors: z.array(z.number()).optional(),
});

type LiveCoverageFormValues = z.infer<typeof liveCoverageFormSchema>;

export default function LiveCoveragesPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCoverage, setSelectedCoverage] = useState<LiveCoverage | null>(null);

  // Get all live coverages
  const { data: liveCoverages, isLoading } = useQuery<LiveCoverage[]>({
    queryKey: ["/api/admin/live-coverages"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Get all users for editor selection
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Form setup
  const form = useForm<LiveCoverageFormValues>({
    resolver: zodResolver(liveCoverageFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      subject: "",
      context: "",
      imageUrl: "",
      active: true,
      endDate: null,
      selectedEditors: [],
    },
  });

  // Create a new live coverage
  const createMutation = useMutation({
    mutationFn: async (values: LiveCoverageFormValues) => {
      const res = await apiRequest("POST", "/api/admin/live-coverages", values);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la création du suivi en direct");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-coverages"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Suivi en direct créé",
        description: "Le suivi en direct a été créé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update a live coverage
  const updateMutation = useMutation({
    mutationFn: async (values: LiveCoverageFormValues & { id: number }) => {
      const { id, ...data } = values;
      const res = await apiRequest("PUT", `/api/admin/live-coverages/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la mise à jour du suivi en direct");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-coverages"] });
      setIsDialogOpen(false);
      setSelectedCoverage(null);
      form.reset();
      toast({
        title: "Suivi en direct mis à jour",
        description: "Le suivi en direct a été mis à jour avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a live coverage
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/live-coverages/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erreur lors de la suppression du suivi en direct");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-coverages"] });
      toast({
        title: "Suivi en direct supprimé",
        description: "Le suivi en direct a été supprimé avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: LiveCoverageFormValues) => {
    if (selectedCoverage) {
      updateMutation.mutate({ ...values, id: selectedCoverage.id });
    } else {
      createMutation.mutate(values);
    }
  };

  // Open dialog for creating a new live coverage
  const handleCreateClick = () => {
    form.reset({
      title: "",
      slug: "",
      subject: "",
      context: "",
      imageUrl: "",
      active: true,
      endDate: null,
      selectedEditors: [],
    });
    setSelectedCoverage(null);
    setIsDialogOpen(true);
  };

  // Open dialog for editing a live coverage
  const handleEditClick = (coverage: LiveCoverage) => {
    // Fetch the current editors for this coverage
    const fetchEditors = async () => {
      try {
        const res = await fetch(`/api/admin/live-coverages/${coverage.id}/editors`);
        if (res.ok) {
          const editors = await res.json();
          const editorIds = editors.map((editor: any) => editor.editorId);
          
          form.reset({
            title: coverage.title,
            slug: coverage.slug,
            subject: coverage.subject,
            context: coverage.context,
            imageUrl: coverage.imageUrl || "",
            active: coverage.active,
            endDate: coverage.endDate ? new Date(coverage.endDate) : null,
            selectedEditors: editorIds || [],
          });
        } else {
          form.reset({
            title: coverage.title,
            slug: coverage.slug,
            subject: coverage.subject,
            context: coverage.context,
            imageUrl: coverage.imageUrl || "",
            active: coverage.active,
            endDate: coverage.endDate ? new Date(coverage.endDate) : null,
            selectedEditors: [],
          });
        }
      } catch (error) {
        console.error("Error fetching editors:", error);
        form.reset({
          title: coverage.title,
          slug: coverage.slug,
          subject: coverage.subject,
          context: coverage.context,
          imageUrl: coverage.imageUrl || "",
          active: coverage.active,
          endDate: coverage.endDate ? new Date(coverage.endDate) : null,
          selectedEditors: [],
        });
      }
      
      setSelectedCoverage(coverage);
      setIsDialogOpen(true);
    };
    
    fetchEditors();
  };

  // Auto-generate slug from title
  const handleTitleChange = (value: string) => {
    const slug = value
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    form.setValue("slug", slug);
  };

  // Generate form groups
  const renderFormFields = () => (
    <>
      <div className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Titre du suivi en direct" 
                  {...field} 
                  onChange={(e) => {
                    field.onChange(e);
                    handleTitleChange(e.target.value);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Identifiant URL (slug)</FormLabel>
              <FormControl>
                <Input placeholder="identifiant-url" {...field} />
              </FormControl>
              <FormDescription>
                L'identifiant qui sera utilisé dans l'URL (sans espaces ni caractères spéciaux)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sujet</FormLabel>
              <FormControl>
                <Input placeholder="Sujet du suivi en direct" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="context"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contexte</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Contexte détaillé du suivi en direct" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image</FormLabel>
              <FormControl>
                <Input placeholder="https://exemple.com/image.jpg" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                Image de couverture pour le suivi en direct
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de fin (optionnelle)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: fr })
                      ) : (
                        <span>Choisir une date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Date à laquelle le suivi ne sera plus affiché comme actif
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Actif</FormLabel>
                <FormDescription>
                  Afficher ce suivi en direct sur le site
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-3 pt-4">
          <FormLabel className="text-base">Éditeurs du suivi en direct</FormLabel>
          <FormDescription>
            Sélectionnez les utilisateurs qui pourront éditer ce suivi en direct
          </FormDescription>
          
          {isLoadingUsers ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : users && users.length > 0 ? (
            <div className="grid gap-2 pt-2">
              <FormField
                control={form.control}
                name="selectedEditors"
                render={() => (
                  <FormItem>
                    {users.map((user) => (
                      <FormField
                        key={user.id}
                        control={form.control}
                        name="selectedEditors"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={user.id}
                              className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(user.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value || [], user.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== user.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <div className="flex items-center gap-2">
                                {user.avatarUrl && (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.displayName}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                )}
                                <div className="space-y-1 leading-none">
                                  <FormLabel className="font-medium">
                                    {user.displayName}
                                  </FormLabel>
                                  <p className="text-xs text-muted-foreground">
                                    {user.title || user.role}
                                  </p>
                                </div>
                              </div>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucun utilisateur disponible</p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suivis en direct</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les suivis d'événements en direct sur le site
          </p>
        </div>
        
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau suivi
        </Button>
      </div>
      
      <Separator className="my-6" />
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : liveCoverages && liveCoverages.length > 0 ? (
        <Table>
          <TableCaption>Liste de tous les suivis en direct</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Sujet</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {liveCoverages.map((coverage) => (
              <TableRow key={coverage.id}>
                <TableCell className="font-medium">{coverage.title}</TableCell>
                <TableCell>{coverage.subject}</TableCell>
                <TableCell>
                  {coverage.active ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                      <Activity className="h-3 w-3 mr-1" /> Actif
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                      <Clock className="h-3 w-3 mr-1" /> Inactif
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleEditClick(coverage)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action ne peut pas être annulée. Cela supprimera définitivement
                            le suivi en direct et toutes les mises à jour associées.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => deleteMutation.mutate(coverage.id)}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Aucun suivi en direct</CardTitle>
            <CardDescription>
              Vous n'avez pas encore créé de suivi d'événement en direct
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" /> Créer un suivi
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Dialog for creating/editing a live coverage */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedCoverage ? "Modifier un suivi en direct" : "Créer un suivi en direct"}
            </DialogTitle>
            <DialogDescription>
              {selectedCoverage 
                ? "Modifiez les informations du suivi en direct existant" 
                : "Remplissez les informations pour créer un nouveau suivi en direct"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {renderFormFields()}
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  )}
                  {selectedCoverage ? "Mettre à jour" : "Créer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}