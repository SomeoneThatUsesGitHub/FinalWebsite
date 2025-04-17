import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { mobileMenu } from "@/lib/animations";
import { Menu, X, MessageCircle, Mail } from "lucide-react";

const NavItem: React.FC<{ href: string; label: string; active: boolean; highlighted?: boolean }> = ({ 
  href, 
  label, 
  active, 
  highlighted = false 
}) => (
  <Link href={href}>
    <div className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
      highlighted 
        ? "text-white bg-blue-600 hover:bg-blue-700" 
        : active 
          ? "text-blue-600 bg-blue-50" 
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-100"
    }`}>
      {label}
      {active && !highlighted && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full"></span>}
    </div>
  </Link>
);

const Header: React.FC = () => {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const navItems = [
    { href: "/home", label: "Accueil", active: location === "/home" || location === "/" },
    { href: "/a-propos", label: "A propos", active: location === "/a-propos" },
    { href: "/team", label: "Equipe", active: location === "/team" },
    { href: "/elections", label: "Elections", active: location === "/elections" },
    { href: "/articles", label: "Articles", active: location === "/articles" },
    { href: "/apprendre", label: "Apprendre", active: location === "/apprendre" },
    { href: "/contact", label: "Contact", active: location === "/contact", highlighted: true },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/home">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="bg-[#001158] rounded-full overflow-hidden w-10 h-10">
                <img 
                  src="/Logos%20Politiquensemble.png" 
                  alt="Logo Politiquensemble" 
                  className="w-full h-full object-contain p-0.5"
                />
              </div>
              <span className="text-xl font-bold text-dark font-heading hidden sm:inline-block">Politiquensemble</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <NavItem 
                key={item.href}
                href={item.href}
                label={item.label}
                active={item.active}
                highlighted={item.highlighted}
              />
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center text-gray-700 focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden bg-white shadow-lg"
            variants={mobileMenu}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <nav className="flex flex-col space-y-1 py-2 px-4">
              {/* Autres liens de navigation */}
              {navItems.slice(0, 6).map((item) => (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`py-1.5 px-3 rounded-md cursor-pointer flex items-center ${
                      item.active 
                        ? "bg-blue-50 text-blue-600 font-medium" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                    {item.active && <span className="ml-2 h-1.5 w-1.5 rounded-full bg-blue-600"></span>}
                  </div>
                </Link>
              ))}
              
              {/* Séparateur */}
              <div className="border-t border-gray-200 my-2.5"></div>
              
              {/* Bouton Contact spécial */}
              <div className="mt-2 px-1">
                <Link href="/contact">
                  <div 
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors cursor-pointer shadow-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Mail size={18} />
                    <span className="font-medium">Contact</span>
                  </div>
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
