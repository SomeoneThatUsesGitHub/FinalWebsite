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
  experience: z.string().min(10, {
    message: "Veuillez décrire votre expérience (minimum 10 caractères)",
  }),
  motivation: z.string().min(20, {
    message: "Veuillez décrire votre motivation (minimum 20 caractères)",
  }),
  availability: z.string().min(1, {
    message: "Veuillez sélectionner votre disponibilité",
  }),
  phoneNumber: z.string().optional(),
  portfolio: z.string().url({
    message: "Veuillez entrer une URL valide pour votre portfolio/profil",
  }).optional().or(z.literal("")),
  additionalInfo: z.string().optional(),
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
      experience: "",
      motivation: "",
      availability: "",
      phoneNumber: "",
      portfolio: "",
      additionalInfo: "",
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
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow-md">
        <CheckCircle2 className="w-16 h-16 mb-4 text-green-500" />
        <h3 className="text-2xl font-bold">Candidature envoyée avec succès !</h3>
        <p className="mt-2 mb-6 text-gray-600">
          Merci pour votre intérêt à rejoindre notre équipe. Nous examinerons votre candidature et vous contacterons prochainement.
        </p>
        <Button onClick={() => setSubmitSuccess(false)} variant="outline">
          Soumettre une autre candidature
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-10 bg-white rounded-lg shadow-md">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-primary">Rejoignez l'équipe Politiquensemble</h2>
        <p className="mb-8 text-lg text-gray-600 text-center max-w-3xl mx-auto">
          Vous souhaitez contribuer à notre mission de rendre la politique accessible aux jeunes ? 
          Complétez ce formulaire pour rejoindre notre équipe dynamique.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Nom complet */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom Prénom *</FormLabel>
                    <FormControl>
                      <Input placeholder="Jean Dupont" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse e-mail *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jean.dupont@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Téléphone */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de téléphone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+33 6 12 34 56 78" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Poste */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poste souhaité *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
            </div>

            {/* Motivation */}
            <FormField
              control={form.control}
              name="motivation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivation *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Pourquoi souhaitez-vous rejoindre Politiquensemble ?" 
                      className="min-h-[150px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full py-6 text-lg" 
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer ma candidature"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}