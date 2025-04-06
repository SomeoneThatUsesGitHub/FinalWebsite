import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { mobileMenu } from "@/lib/animations";
import { Menu, X, MessageCircle } from "lucide-react";

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
    { href: "/a-propos", label: "A propos", active: location === "/a-propos" },
    { href: "/equipe", label: "Equipe", active: location === "/equipe" },
    { href: "/elections", label: "Elections", active: location === "/elections" },
    { href: "/articles", label: "Articles", active: location === "/articles" },
    { href: "/apprendre", label: "Apprendre", active: location === "/apprendre" },
  ];
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold font-heading">PJ</div>
              <span className="text-xl font-bold text-dark font-heading hidden sm:inline-block">Politique Jeune</span>
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
              />
            ))}
            
            <NavItem 
              href="/contact"
              label="Contact"
              active={location === "/contact"}
              highlighted={true}
            />
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
            <nav className="flex flex-col space-y-3 py-4 px-6">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={`py-2 px-4 rounded-md cursor-pointer ${item.active ? "bg-blue-50 text-blue-600" : "text-gray-700"}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
              
              <Link href="/contact">
                <div 
                  className="py-2 px-4 rounded-md cursor-pointer bg-blue-600 text-white flex items-center justify-center space-x-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <MessageCircle size={16} />
                  <span>Contact</span>
                </div>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
