import React, { useState } from "react";
import { motion } from "framer-motion";
import { pageTransition, fadeInWithDelay } from "@/lib/animations";
import { Helmet } from "react-helmet";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare, 
  Send,
  CheckCircle2
} from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Schéma de validation pour le formulaire de contact
const contactFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit comporter au moins 2 caractères",
  }),
  email: z.string().email({
    message: "Veuillez entrer une adresse e-mail valide",
  }),
  subject: z.string().min(5, {
    message: "Le sujet doit comporter au moins 5 caractères",
  }),
  message: z.string().min(20, {
    message: "Votre message doit comporter au moins 20 caractères",
  }),
  phone: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const ContactPage: React.FC = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Configuration du formulaire avec validation
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
      phone: "",
    },
  });

  // Mutation pour envoyer le formulaire
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ContactFormData) => {
      // Simulation d'envoi - En production, remplacer par un appel API réel
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Message envoyé",
        description: "Nous avons bien reçu votre message. Nous vous répondrons dans les plus brefs délais.",
        variant: "default",
      });
      form.reset();
      setSubmitSuccess(true);
      
      // Réinitialiser l'état de succès après 5 secondes
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  // Gérer la soumission du formulaire
  const onSubmit = (data: ContactFormData) => {
    mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Contactez-nous | Politiquensemble</title>
        <meta 
          name="description" 
          content="Contactez l'équipe de Politiquensemble pour toute question, suggestion ou collaboration." 
        />
      </Helmet>

      {/* En-tête de la page */}
      <div className="bg-blue-50 py-12 md:py-20 shadow-md mb-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              variants={fadeInWithDelay}
              initial="hidden"
              animate="visible"
              className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary mb-4 relative"
            >
              Contactez-nous
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { delay: 0.3, duration: 0.5 } 
              }}
              className="h-1 w-20 bg-blue-500 mx-auto rounded-full mb-6"
            ></motion.div>
            <motion.p 
              variants={fadeInWithDelay}
              initial="hidden"
              animate="visible"
              custom={0.4}
              className="text-dark/70 max-w-2xl mx-auto"
            >
              Vous avez une question, une suggestion ou souhaitez collaborer avec nous ? 
              N'hésitez pas à nous contacter, notre équipe vous répondra dans les plus brefs délais.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Contenu principal - Informations de contact et formulaire */}
      <section className="py-12 md:py-16 mb-16 md:mb-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            
            {/* Informations de contact */}
            <motion.div 
              className="lg:col-span-4"
              variants={fadeInWithDelay}
              initial="hidden"
              animate="visible"
              custom={0.1}
            >
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl p-8 shadow-xl h-full">
                <h2 className="text-2xl font-bold mb-6">Nos coordonnées</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 flex-shrink-0 text-blue-200" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-blue-100">contact@politiquensemble.fr</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 flex-shrink-0 text-blue-200" />
                    <div>
                      <h3 className="font-semibold mb-1">Téléphone</h3>
                      <p className="text-blue-100">+33 (0)1 23 45 67 89</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 flex-shrink-0 text-blue-200" />
                    <div>
                      <h3 className="font-semibold mb-1">Adresse</h3>
                      <p className="text-blue-100">
                        15 rue de la République<br />
                        75001 Paris<br />
                        France
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <MessageSquare className="h-6 w-6 flex-shrink-0 text-blue-200" />
                    <div>
                      <h3 className="font-semibold mb-1">Réseaux sociaux</h3>
                      <p className="text-blue-100">
                        Suivez-nous sur Instagram pour rester informé de nos dernières actualités.
                      </p>
                      <div className="mt-3">
                        <a 
                          href="https://www.instagram.com/politiquensemble/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-white text-blue-600 rounded-full font-medium text-sm inline-flex items-center hover:bg-blue-50 transition-colors"
                        >
                          Nous suivre
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Formulaire de contact */}
            <motion.div 
              className="lg:col-span-8"
              variants={fadeInWithDelay}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-dark mb-6">Envoyez-nous un message</h2>
                
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <CheckCircle2 className="h-16 w-16 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800 mb-2">Message envoyé avec succès !</h3>
                    <p className="text-green-700">
                      Merci de nous avoir contactés. Notre équipe vous répondra dans les plus brefs délais.
                    </p>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom complet</FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom" {...field} />
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
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="votre.email@exemple.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Téléphone (optionnel)</FormLabel>
                              <FormControl>
                                <Input placeholder="+33 6 12 34 56 78" {...field} />
                              </FormControl>
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
                                <Input placeholder="Objet de votre message" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Détaillez votre demande ici..." 
                                className="min-h-[150px]" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            Envoi en cours...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer le message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
              
              {/* Texte d'information supplémentaire */}
              <div className="mt-6 text-dark/60 text-sm">
                <p>
                  Tous les champs marqués sont obligatoires. Nous respectons votre vie privée et ne partagerons jamais vos informations avec des tiers.
                  Consultez notre politique de confidentialité pour plus d'informations.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;