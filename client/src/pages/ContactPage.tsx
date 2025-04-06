import React, { useState } from "react";
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs du formulaire.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // This would connect to a backend service in production
    setTimeout(() => {
      toast({
        title: "Message envoyé !",
        description: "Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Helmet>
        <title>Contact | Politique Jeune</title>
        <meta name="description" content="Contactez l'équipe de Politique Jeune pour toute question, suggestion ou proposition de collaboration." />
      </Helmet>
      
      <div className="bg-background py-6 md:py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-dark mb-4">
              Contactez-nous
            </h1>
            <p className="text-dark/70">
              Une question, une suggestion ou une proposition de collaboration ?
              N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        </div>
      </div>
      
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    placeholder="Votre nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre.email@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet</Label>
                  <Select value={subject} onValueChange={setSubject} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un sujet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="question">Question générale</SelectItem>
                      <SelectItem value="suggestion">Suggestion</SelectItem>
                      <SelectItem value="collaboration">Proposition de collaboration</SelectItem>
                      <SelectItem value="press">Presse</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Votre message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Envoyer
                    </>
                  )}
                </Button>
              </form>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6">Informations de contact</h2>
              
              <div className="bg-light rounded-xl p-6 mb-6">
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <MapPin className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Adresse</h3>
                      <p className="text-dark/70">
                        123 Avenue de la République <br />
                        75011 Paris, France
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Mail className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Email</h3>
                      <p className="text-dark/70">
                        contact@politiquejeune.fr
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Phone className="h-6 w-6 text-primary mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium">Téléphone</h3>
                      <p className="text-dark/70">
                        +33 (0)1 23 45 67 89
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <h3 className="text-xl font-medium mb-4">Suivez-nous</h3>
              
              <div className="flex space-x-4 mb-8">
                <a 
                  href="#" 
                  className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
              </div>
              
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9914406081473!2d2.377020876888535!3d48.85837017133292!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66d0ff95dc61f%3A0x608bb0a0d42396fa!2s123%20Rue%20de%20la%20Republique%2C%2075011%20Paris%2C%20France!5e0!3m2!1sen!2sus!4v1684838723171!5m2!1sen!2sus" 
                  width="600" 
                  height="450" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps"
                  className="w-full h-full rounded-xl"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default ContactPage;
