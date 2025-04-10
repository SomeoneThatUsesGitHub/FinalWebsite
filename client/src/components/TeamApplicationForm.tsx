import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { insertTeamApplicationSchema } from "@shared/schema";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

// Schéma avec validations
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
      <div className="w-full flex items-center justify-center my-8">
        <div className="max-w-lg bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-xl p-10 text-center">
          <div className="bg-blue-100 rounded-full p-4 mx-auto w-20 h-20 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold mb-3 text-gray-800">Candidature envoyée !</h3>
          <p className="text-gray-600 mb-6">Nous vous contacterons dès que possible.</p>
          <Button 
            onClick={() => setSubmitSuccess(false)} 
            className="bg-blue-600 hover:bg-blue-700 text-white border-none"
          >
            Nouvelle candidature
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-8">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-t-lg p-8">
        <h2 className="text-white text-xl font-semibold">Candidature</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-b-lg shadow-xl">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Nom et prénom</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Votre nom complet" 
                        className="border border-gray-300 rounded-md px-4 py-2 focus-visible:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Votre adresse email" 
                        className="border border-gray-300 rounded-md px-4 py-2 focus-visible:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Téléphone</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Votre numéro de téléphone" 
                        className="border border-gray-300 rounded-md px-4 py-2 focus-visible:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Poste souhaité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="border border-gray-300 focus:ring-blue-500 w-full h-10 rounded-md">
                          <SelectValue placeholder="Choisir un poste" />
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
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-8">
              <FormField
                control={form.control}
                name="motivation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-gray-700">Votre motivation</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez pourquoi vous souhaitez rejoindre notre équipe" 
                        className="border border-gray-300 rounded-md px-4 py-2 min-h-[200px] focus-visible:ring-blue-500" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="p-8 bg-gray-50 rounded-b-lg border-t border-gray-100">
            <Button 
              type="submit" 
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium border-none transition-all duration-200" 
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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