import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { navItem, mobileMenu } from "@/lib/animations";
import { Search } from "lucide-react";

const Header: React.FC = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { name: "Actualités", path: "/" },
    { name: "Articles", path: "/articles" },
    { name: "Élections", path: "/elections" },
    { name: "Apprendre", path: "/apprendre" },
    { name: "À propos", path: "/a-propos" }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold font-heading">PJ</div>
            <span className="text-xl font-bold text-dark font-heading hidden sm:inline-block">Politique Jeune</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.path}
                variants={navItem}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                <div 
                  className={`text-dark hover:text-primary font-medium transition-colors cursor-pointer ${location === link.path ? 'text-primary' : ''}`}
                  onClick={() => window.location.href = link.path}
                >
                  {link.name}
                </div>
              </motion.div>
            ))}
          </nav>

          {/* Search button and mobile menu toggle */}
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-light transition-colors" aria-label="Rechercher">
              <Search className="text-dark h-5 w-5" />
            </button>
            <button 
              className="md:hidden p-2 rounded-full hover:bg-light transition-colors" 
              aria-label="Menu" 
              onClick={toggleMobileMenu}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-dark"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            variants={mobileMenu}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="md:hidden bg-white shadow-lg rounded-b-lg absolute w-full left-0 z-50"
          >
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col space-y-3 pb-3">
                {navLinks.map(link => (
                  <div 
                    key={link.path}
                    className={`text-dark hover:text-primary font-medium py-2 px-3 rounded-md hover:bg-light transition-colors cursor-pointer ${location === link.path ? 'text-primary bg-light' : ''}`}
                    onClick={() => {
                      window.location.href = link.path;
                      setMobileMenuOpen(false);
                    }}
                  >
                    {link.name}
                  </div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
