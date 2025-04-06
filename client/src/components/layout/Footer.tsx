import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold font-heading">PJ</div>
          <span className="text-xl font-bold text-white font-heading">Politique Jeune</span>
        </div>
        <p className="text-white/70 text-sm mb-4">Comprendre la politique, simplement.</p>
        
        <div className="mt-8 pt-4 border-t border-white/10">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} Politique Jeune. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
