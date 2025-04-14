import React, { useState } from "react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre adresse e-mail",
        variant: "destructive"
      });
      return;
    }
    
    // Vérification simple du format email avec regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Format invalide",
        description: "Veuillez entrer une adresse e-mail valide",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const response = await apiRequest("POST", "/api/newsletter/subscribe", { email });
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Succès !",
          description: "Merci pour votre inscription à notre newsletter",
          variant: "default"
        });
        setEmail(""); // Réinitialiser le champ après succès
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Une erreur est survenue lors de l'inscription",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription à la newsletter:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de s'inscrire à la newsletter pour le moment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-3">À propos</h3>
            <p className="text-gray-400 mb-4 text-sm">
              Nous rendons la politique accessible aux jeunes de 16 à 30 ans.
            </p>
            <div className="flex space-x-4">
              {/* TikTok */}
              <a href="https://www.tiktok.com/@politiquensemble_off" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
              {/* Twitter / X */}
              <a href="https://x.com/Politiquensembl" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://www.instagram.com/politiquensemble/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-3">Menu</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors duration-300">Accueil</Link>
              <Link href="/a-propos" className="text-gray-400 hover:text-white transition-colors duration-300">À propos</Link>
              <Link href="/team" className="text-gray-400 hover:text-white transition-colors duration-300">Notre équipe</Link>
              <Link href="/articles" className="text-gray-400 hover:text-white transition-colors duration-300">Articles</Link>
              <Link href="/elections" className="text-gray-400 hover:text-white transition-colors duration-300">Élections</Link>
              <Link href="/apprendre" className="text-gray-400 hover:text-white transition-colors duration-300">Apprentissage</Link>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-3">Newsletter</h3>
            <p className="text-gray-400 mb-3 text-sm">Inscrivez-vous pour recevoir nos derniers articles.</p>
            <form className="flex" onSubmit={handleSubmit}>
              <input
                type="email"
                className="bg-gray-800 text-white px-3 py-2 text-sm rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre email"
                value={email}
                onChange={handleEmailChange}
                disabled={isSubmitting}
              />
              <button
                type="submit"
                className={`text-white px-3 py-2 rounded-r-md transition-colors duration-300 ${
                  isSubmitting 
                    ? "bg-blue-500 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin">⟳</span>
                ) : (
                  "→"
                )}
              </button>
            </form>
            <p className="text-gray-500 mt-2 text-xs">contact@politiquensemble.fr</p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} Politiquensemble. Tous droits réservés.
          </p>
          <div className="flex space-x-4 text-sm">
            <Link href="/mentions-legales" className="text-gray-500 hover:text-white transition-colors duration-300">Mentions légales</Link>
            <Link href="/confidentialite" className="text-gray-500 hover:text-white transition-colors duration-300">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;