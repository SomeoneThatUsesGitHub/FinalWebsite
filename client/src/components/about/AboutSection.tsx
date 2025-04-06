import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { fadeIn, staggerChildren, staggerItem } from "@/lib/animations";
import { Button } from "@/components/ui/button";

const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div 
          className="flex flex-col md:flex-row gap-10 items-center"
          variants={staggerChildren}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.div 
            className="md:w-1/2"
            variants={staggerItem}
          >
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark mb-4">À propos de Politique Jeune</h2>
            <p className="text-dark/80 mb-4">
              Politique Jeune est né d'un constat simple : la politique est souvent perçue comme complexe 
              et inaccessible par les jeunes générations. Notre mission est de changer cette perception 
              en proposant un contenu politique de qualité, simplifié et adapté à un public de 16 à 30 ans.
            </p>
            <p className="text-dark/80 mb-6">
              Fondé en 2021 par une équipe de jeunes passionnés par l'actualité et les enjeux politiques, 
              Politique Jeune s'est rapidement imposé comme une référence sur les réseaux sociaux grâce à 
              son approche pédagogique et son ton décalé.
            </p>
            
            <div className="flex space-x-4 mb-6">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </a>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Link href="/equipe">
                <Button variant="outline">L'équipe</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">Nous contacter</Button>
              </Link>
              <Link href="/mentions-legales">
                <Button variant="outline">Mentions légales</Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 grid grid-cols-2 gap-4"
            variants={staggerItem}
          >
            <div className="rounded-xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Notre équipe en réunion" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                alt="Interview politique" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md col-span-2">
              <img 
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80" 
                alt="L'équipe de Politique Jeune" 
                className="w-full h-48 object-cover"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
