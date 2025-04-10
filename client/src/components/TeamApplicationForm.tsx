import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { insertTeamApplicationSchema } from "@shared/schema";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

// Étendre le schéma pour ajouter des validations supplémentaires
const applicationFormSchema = insertTeamApplicationSchema.extend({
  fullName: z.string().min(2, {
    message: "Le nom complet doit comporter au moins 2 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse e-mail valide",
  }),
  position: z.string().min(1, {
    message: "Veuillez sélectionner un poste",
  }),
  motivation: z.string().min(20, {
    message: "Veuillez décrire votre motivation (minimum 20 caractères)",
  }),
  phoneNumber: z.string().optional(),
  portfolio: z.string().url({
    message: "Veuillez entrer une URL valide pour votre portfolio/profil",
  }).optional().or(z.literal("")),
});

type ApplicationFormData = z.infer<typeof applicationFormSchema>;

export default function TeamApplicationForm() {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Définir le formulaire avec validations
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      position: "",
      motivation: "",
      phoneNumber: "",
      portfolio: "",
    },
  });

  // Mutation pour soumettre la candidature
  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const res = await apiRequest("POST", "/api/team/applications", data);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erreur lors de la soumission de votre candidature");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Candidature envoyée !",
        description: "Votre candidature a été soumise avec succès. Nous vous contacterons bientôt.",
      });
      setSubmitSuccess(true);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Gérer la soumission du formulaire
  function onSubmit(data: ApplicationFormData) {
    submitMutation.mutate(data);
  }

  if (submitSuccess) {
    return (
      <div className="w-full bg-white shadow-lg rounded-xl p-8 flex flex-col items-center justify-center">
        <div className="mb-6 bg-green-50 p-4 rounded-full">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Candidature envoyée avec succès</h3>
        <p className="text-gray-600 text-center mb-8 max-w-md">
          Merci pour votre intérêt ! Nous examinerons votre candidature et vous recontacterons prochainement.
        </p>
        <Button onClick={() => setSubmitSuccess(false)} variant="outline" className="px-6">
          Soumettre une autre candidature
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-lg rounded-xl overflow-hidden">
      <div className="border-b border-gray-100">
        <h2 className="text-2xl font-bold px-8 py-6 text-gray-800">Rejoindre l'équipe</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Nom complet *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Jean Dupont" 
                      {...field} 
                      className="bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-primary py-6" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Email *</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="jean.dupont@exemple.com" 
                      {...field} 
                      className="bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-primary py-6" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Téléphone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="+33 6 12 34 56 78" 
                      {...field} 
                      className="bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-primary py-6" 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">Optionnel</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Poste souhaité *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-primary h-[54px]">
                        <SelectValue placeholder="Sélectionnez un poste" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="journaliste">Journaliste</SelectItem>
                      <SelectItem value="monteur-video">Monteur vidéo</SelectItem>
                      <SelectItem value="graphiste-designer">Graphiste et designer</SelectItem>
                      <SelectItem value="veilleur-actualite">Veilleur d'actualité</SelectItem>
                      <SelectItem value="ambassadeur">Ambassadeur</SelectItem>
                      <SelectItem value="photographe">Photographe</SelectItem>
                      <SelectItem value="spontanee">Candidature spontanée</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portfolio"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-gray-700 font-medium">Portfolio ou profil professionnel</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://..." 
                      {...field} 
                      className="bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-primary py-6" 
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">Lien vers vos travaux ou profil LinkedIn/Twitter (optionnel)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-gray-700 font-medium">Motivation *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Pourquoi souhaitez-vous rejoindre Politiquensemble ?" 
                      className="bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-primary min-h-[200px] resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-10">
            <Button 
              type="submit" 
              className="w-full py-7 text-lg font-medium shadow-md transition-all hover:shadow-lg" 
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  <span>Envoi en cours...</span>
                </div>
              ) : (
                "Envoyer ma candidature"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}