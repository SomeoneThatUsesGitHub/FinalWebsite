import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { fadeIn, staggerChildren, staggerItem } from "@/lib/animations";
import { Search } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <motion.footer 
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="bg-dark text-white"
    >
      <div className="container mx-auto px-4 md:px-6 py-10">
        <motion.div 
          variants={staggerChildren}
          className="grid grid-cols-1 md:grid-cols-4 gap-8"
        >
          <motion.div variants={staggerItem} className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold font-heading">PJ</div>
              <span className="text-xl font-bold text-white font-heading">Politique Jeune</span>
            </div>
            <p className="text-white/70 text-sm mb-4">Comprendre la politique, simplement.</p>
            <div className="flex space-x-3">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <h4 className="font-bold mb-4">Contenu</h4>
            <ul className="space-y-2">
              <li><div onClick={() => window.location.href = "/"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Actualités</div></li>
              <li><div onClick={() => window.location.href = "/articles"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Articles</div></li>
              <li><div onClick={() => window.location.href = "/elections"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Élections</div></li>
              <li><div onClick={() => window.location.href = "/apprendre"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Apprendre</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Podcasts</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Vidéos</div></li>
            </ul>
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <h4 className="font-bold mb-4">À propos</h4>
            <ul className="space-y-2">
              <li><div onClick={() => window.location.href = "/a-propos"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Notre mission</div></li>
              <li><div onClick={() => window.location.href = "/equipe"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">L'équipe</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Nous rejoindre</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Partenariats</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Presse</div></li>
            </ul>
          </motion.div>
          
          <motion.div variants={staggerItem}>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2">
              <li><div onClick={() => window.location.href = "/contact"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Nous contacter</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">FAQ</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Mentions légales</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Politique de confidentialité</div></li>
              <li><div onClick={() => window.location.href = "#"} className="text-white/70 hover:text-white transition-colors text-sm cursor-pointer">Conditions d'utilisation</div></li>
            </ul>
          </motion.div>
        </motion.div>
        
        <motion.div 
          variants={fadeIn}
          className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-white/50 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} Politique Jeune. Tous droits réservés.</p>
          <div className="flex space-x-6">
            <div onClick={() => window.location.href = "#"} className="text-white/50 hover:text-white transition-colors text-sm cursor-pointer">Mentions légales</div>
            <div onClick={() => window.location.href = "#"} className="text-white/50 hover:text-white transition-colors text-sm cursor-pointer">Confidentialité</div>
            <div onClick={() => window.location.href = "#"} className="text-white/50 hover:text-white transition-colors text-sm cursor-pointer">Cookies</div>
          </div>
        </motion.div>
      </div>
      
      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 z-50 md:hidden">
        <button className="w-14 h-14 rounded-full bg-primary text-white shadow-lg flex items-center justify-center">
          <Search className="h-6 w-6" />
        </button>
      </div>
    </motion.footer>
  );
};

export default Footer;
