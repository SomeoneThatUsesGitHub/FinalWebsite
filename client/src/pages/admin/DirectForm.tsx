import React, { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { z } from "zod";
import { LiveCoverage, InsertLiveCoverage, insertLiveCoverageSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronLeft, Radio } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/utils";

// Étendre le schema avec validation supplémentaire
const formSchema = insertLiveCoverageSchema.extend({
  title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
});

export default function DirectForm() {
  const params = useParams();
  const isEditing = !!params.id;
  const id = isEditing ? parseInt(params.id) : null;
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Récupérer les détails du suivi en direct si on est en mode édition
  const { data: direct, isLoading: isLoadingDirect } = useQuery<LiveCoverage>({
    queryKey: [`/api/admin/live-coverages/${id}`],
    enabled: isEditing,
  });

  // Récupérer le nombre de suivis actifs pour la validation
  const { data: allDirects } = useQuery<LiveCoverage[]>({
    queryKey: ["/api/admin/live-coverages"],
  });

  const activeDirectsCount = allDirects?.filter(d => d.active).length || 0;

  // Initialiser le formulaire
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      subject: "",
      imageUrl: "",
      context: "", // Ajout du champ context par défaut
      active: true,
    },
  });

  // Mutation pour ajouter un nouveau suivi en direct
  const createMutation = useMutation({
    mutationFn: async (data: InsertLiveCoverage) => {
      // Vérifier si l'activation est possible
      if (data.active && activeDirectsCount >= 3 && !isEditing) {
        throw new Error("Vous avez déjà 3 suivis actifs. Désactivez-en un avant d'en activer un nouveau.");
      }

      const response = await fetch("/api/admin/live-coverages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la création du suivi en direct");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-coverages"] });
      toast({
        title: "Suivi en direct créé",
        description: "Le suivi en direct a été créé avec succès",
      });
      navigate("/admin/directs");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour mettre à jour un suivi en direct
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertLiveCoverage>) => {
      // Vérifier si l'activation est possible
      if (direct && !direct.active && data.active && activeDirectsCount >= 3) {
        throw new Error("Vous avez déjà 3 suivis actifs. Désactivez-en un avant d'en activer un nouveau.");
      }

      const response = await fetch(`/api/admin/live-coverages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la mise à jour du suivi en direct");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/live-coverages"] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/live-coverages/${id}`] });
      toast({
        title: "Suivi en direct mis à jour",
        description: "Le suivi en direct a été mis à jour avec succès",
      });
      navigate("/admin/directs");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mettre à jour les valeurs du formulaire lorsqu'on récupère les données
  useEffect(() => {
    if (direct) {
      form.reset({
        title: direct.title,
        slug: direct.slug,
        subject: direct.subject,
        imageUrl: direct.imageUrl || "",
        context: direct.context || "", // Ajout du champ context
        active: direct.active,
      });
    }
  }, [direct, form]);

  // Générer automatiquement le slug à partir du titre
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    if (!form.getValues("slug") || !isEditing) {
      const newSlug = slugify(title);
      form.setValue("slug", newSlug);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (isEditing && id) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const pageTitle = isEditing ? "Modifier le suivi en direct" : "Nouveau suivi en direct";

  if (isEditing && isLoadingDirect) {
    return (
      <AdminLayout title={pageTitle}>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={pageTitle}>
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/admin/directs")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux suivis en direct
      </Button>

      {activeDirectsCount >= 3 && !isEditing && (
        <Card className="mb-6 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Radio className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800 dark:text-amber-300">
                  Limite de suivis actifs atteinte
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Vous avez déjà 3 suivis en direct actifs. Ce nouveau suivi sera créé en mode inactif. 
                  Vous pourrez l'activer ultérieurement en désactivant un autre suivi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre du suivi *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Élection Présidentielle 2027" 
                      {...field} 
                      onChange={handleTitleChange} 
                    />
                  </FormControl>
                  <FormDescription>
                    Titre affiché en haut de la page de suivi en direct.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL du suivi *</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">/suivis-en-direct/</span>
                      <Input 
                        placeholder="election-presidentielle-2027" 
                        {...field} 
                        disabled={isEditing}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Identifiant unique dans l'URL. Pas d'accents, d'espaces ou de caractères spéciaux.
                    {isEditing && " Non modifiable après création."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sujet *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Résultats en direct et analyses" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  Description courte qui apparaîtra sous le titre.
                </FormDescription>
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
                  <Input 
                    placeholder="https://exemple.com/image.jpg" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  URL de l'image de couverture qui sera affichée en haut de la page.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Activer le suivi en direct</FormLabel>
                  <FormDescription>
                    Un suivi actif est visible sur le site. Maximum 3 suivis actifs simultanément.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={(activeDirectsCount >= 3 && !isEditing) || (direct && !direct.active && activeDirectsCount >= 3)}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/directs")}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Mettre à jour" : "Créer"}
            </Button>
          </div>
        </form>
      </Form>
    </AdminLayout>
  );
}