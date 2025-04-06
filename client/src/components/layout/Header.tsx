import React from "react";
import { Link } from "wouter";

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold font-heading">PJ</div>
              <span className="text-xl font-bold text-dark font-heading hidden sm:inline-block">Politique Jeune</span>
            </div>
          </Link>
          
          {/* Placeholder for future navigation */}
          <div className="h-10"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
