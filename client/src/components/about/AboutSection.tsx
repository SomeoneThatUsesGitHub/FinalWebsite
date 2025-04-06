import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { fadeIn, staggerChildren, staggerItem } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { 
  Users, Target, Globe, Zap, BookOpen, 
  Award, ArrowRight, Instagram, Twitter, Youtube 
} from "lucide-react";

const AboutSection: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <motion.section 
        className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">Notre mission</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Rendre la politique accessible et compréhensible pour tous les jeunes citoyens.
            </p>
            <div className="w-24 h-1 bg-primary mx-auto mb-10"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Clarté</h3>
                <p className="text-gray-600">Simplifier les concepts politiques sans les dénaturer</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Éducation</h3>
                <p className="text-gray-600">Donner les clés pour comprendre les enjeux démocratiques</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Engagement</h3>
                <p className="text-gray-600">Motiver les jeunes à participer à la vie démocratique</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* About Us */}
      <motion.section 
        className="py-16 md:py-24 bg-white"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <motion.div 
              className="md:w-1/2 order-2 md:order-1"
              variants={staggerItem}
            >
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Jeunes citoyens engagés" 
                  className="rounded-lg shadow-xl w-full object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl font-bold text-primary">37K+</div>
                    <div className="text-gray-800">
                      <div className="font-medium">Abonnés</div>
                      <div className="text-sm text-gray-500">Sur tous nos réseaux</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:w-1/2 order-1 md:order-2"
              variants={staggerItem}
            >
              <h2 className="text-3xl font-bold mb-6">Notre histoire</h2>
              <p className="text-gray-700 mb-4">
                Fondé en 2021 par une équipe de jeunes journalistes, politologues et passionnés d'actualité, 
                <strong> Politique Jeune</strong> est né d'un constat alarmant : moins de 40% des 18-25 ans s'intéressent à la politique traditionnelle.
              </p>
              <p className="text-gray-700 mb-6">
                Notre approche innovante combine rigueur journalistique et formats adaptés aux nouveaux modes de consommation de l'information. 
                En seulement deux ans, nous avons construit une communauté engagée de plus de 37 000 jeunes citoyens sur les réseaux sociaux.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Prix de l'innovation médiatique 2022</h4>
                    <p className="text-gray-600 text-sm">Pour notre approche pédagogique des sujets politiques complexes</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Partenariats avec 5 universités</h4>
                    <p className="text-gray-600 text-sm">Pour des interventions et ateliers sur l'éducation civique</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Couverture internationale</h4>
                    <p className="text-gray-600 text-sm">Analyse des élections et enjeux politiques dans plus de 15 pays</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Values */}
      <motion.section 
        className="py-16 md:py-24 bg-gray-50"
        variants={staggerChildren}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos valeurs</h2>
            <p className="text-gray-600">
              Ces principes guident notre travail quotidien et nous aident à rester fidèles à notre mission
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm"
              variants={staggerItem}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Neutralité</h3>
              <p className="text-gray-600">
                Nous présentons les faits sans parti pris, en donnant la parole à tous les courants politiques.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm"
              variants={staggerItem}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Rigueur</h3>
              <p className="text-gray-600">
                Toutes nos informations sont vérifiées et basées sur des sources fiables et diversifiées.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm"
              variants={staggerItem}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Clarté</h3>
              <p className="text-gray-600">
                Nous expliquons les concepts politiques de façon simple, sans jargon inutile.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-sm"
              variants={staggerItem}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Inclusivité</h3>
              <p className="text-gray-600">
                Nous nous adressons à tous les jeunes, quels que soient leur origine ou leur niveau d'éducation.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Team Intro & Call to Action */}
      <motion.section 
        className="py-16 md:py-20 bg-white"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 p-8 md:p-12 text-white">
                <h2 className="text-3xl font-bold mb-4">Découvrez notre équipe</h2>
                <p className="mb-6 opacity-90">
                  Des journalistes, politologues et créateurs de contenu passionnés par la démocratisation de l'information politique.
                </p>
                <Link href="/equipe">
                  <Button className="bg-white text-blue-700 hover:bg-blue-50">
                    Rencontrer l'équipe <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="md:w-1/2 relative">
                <img 
                  src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80" 
                  alt="L'équipe de Politique Jeune" 
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-blue-700/50"></div>
              </div>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-bold mb-6">Suivez-nous sur les réseaux sociaux</h3>
            <div className="flex justify-center space-x-4">
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6" />
              </a>
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="TikTok"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 448 512" fill="currentColor">
                  <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Links */}
          <div className="mt-12 flex justify-center flex-wrap gap-4">
            <Link href="/contact">
              <Button variant="outline">Nous contacter</Button>
            </Link>
            <Link href="/mentions-legales">
              <Button variant="outline">Mentions légales</Button>
            </Link>
            <Link href="/confidentialite">
              <Button variant="outline">Politique de confidentialité</Button>
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutSection;
