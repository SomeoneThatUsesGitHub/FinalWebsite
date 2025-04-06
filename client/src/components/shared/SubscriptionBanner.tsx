import React, { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SubscriptionBanner: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // This would connect to a newsletter service in production
    setTimeout(() => {
      toast({
        title: "Inscription réussie !",
        description: "Vous êtes maintenant inscrit à notre newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <motion.section 
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-10 bg-gradient-to-r from-primary to-secondary text-white"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Restez informé(e)</h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Inscrivez-vous à notre newsletter pour recevoir toutes les actualités politiques 
            importantes et nos analyses directement dans votre boîte mail.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-0 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Votre adresse email"
              value={email}
              onChange={handleEmailChange}
              className="flex-1 px-4 py-3 rounded-l-lg sm:rounded-r-none rounded-r-lg sm:rounded-l-lg border-0 
                focus:outline-none focus:ring-2 focus:ring-white/30 text-dark"
              required
            />
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-3 bg-white text-primary font-medium rounded-r-lg sm:rounded-l-none 
                rounded-l-lg sm:rounded-r-lg hover:bg-white/90 transition-colors"
            >
              {isSubmitting ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
          
          <p className="text-xs text-white/70 mt-3">
            En vous inscrivant, vous acceptez de recevoir nos emails et confirmez avoir lu notre politique de confidentialité.
          </p>
        </div>
      </div>
    </motion.section>
  );
};

export default SubscriptionBanner;
