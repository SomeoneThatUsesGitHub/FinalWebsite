import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSearch, Home, ArrowLeft, Newspaper, GraduationCap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";

export default function NotFound() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-gray-50 py-12 px-4">
      {/* SEO optimizations */}
      <Helmet>
        <title>Page non trouvée | Politiquensemble</title>
        <meta name="description" content="La page que vous recherchez n'existe pas ou a été déplacée." />
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <motion.div
        className="w-full max-w-4xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden shadow-lg border-blue-100">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2">
              {/* Section visuelle */}
              <div className="bg-[#001158] p-6 md:p-10 flex flex-col justify-center items-center text-white">
                <motion.div variants={itemVariants} className="text-center">
                  <FileSearch className="h-24 w-24 mx-auto mb-6 text-white/90" />
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">404</h1>
                  <p className="text-xl md:text-2xl font-light mb-6">Page non trouvée</p>
                  <div className="h-1 w-20 bg-white/30 mx-auto"></div>
                </motion.div>
              </div>
              
              {/* Section informationnelle */}
              <div className="p-6 md:p-10 bg-white">
                <motion.div variants={itemVariants}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Cette page a peut-être été déplacée ou supprimée
                  </h2>
                  
                  <p className="text-gray-600 mb-8">
                    Nous n'avons pas pu trouver la page que vous recherchez. Elle a peut-être été déplacée ou supprimée, ou vous avez peut-être mal tapé l'adresse.
                  </p>
                  
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Que souhaitez-vous faire ?
                  </h3>
                  
                  <div className="space-y-3">
                    <Button asChild variant="default" className="w-full justify-start gap-2">
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        Retour à l'accueil
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                      <Link href="/articles">
                        <Newspaper className="h-4 w-4" />
                        Parcourir les articles
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                      <Link href="/apprendre">
                        <GraduationCap className="h-4 w-4" />
                        Espace apprentissage
                      </Link>
                    </Button>
                    
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                      <Link href="/elections">
                        <BarChart3 className="h-4 w-4" />
                        Espace élections
                      </Link>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-2 text-gray-500"
                      onClick={() => window.history.back()}
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Revenir en arrière
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
