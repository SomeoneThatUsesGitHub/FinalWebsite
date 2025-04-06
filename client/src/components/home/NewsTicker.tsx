import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ticker } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

type NewsUpdate = {
  id: number;
  title: string;
  icon?: string;
  active: boolean;
  createdAt: string;
};

const NewsTicker: React.FC = () => {
  const { data: newsUpdates, isLoading, isError } = useQuery<NewsUpdate[]>({
    queryKey: ['/api/news-updates'],
  });

  return (
    <div className="bg-primary text-white py-2 overflow-hidden">
      <div className="ticker-container relative">
        <div className="flex items-center">
          <div className="flex-shrink-0 px-4 font-bold uppercase text-sm">À la une</div>
          <div className="ticker-content flex items-center overflow-hidden whitespace-nowrap">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                <span>Chargement des actualités...</span>
              </div>
            ) : isError ? (
              <div>Une erreur est survenue lors du chargement des actualités</div>
            ) : newsUpdates && newsUpdates.length > 0 ? (
              <motion.div
                className="flex"
                variants={ticker}
                initial="hidden"
                animate="visible"
              >
                {newsUpdates.map((item) => (
                  <div key={item.id} className="inline-block mr-8">
                    <span className="inline-block mr-4">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.title}
                    </span>
                  </div>
                ))}
                {/* Duplicate items for seamless looping */}
                {newsUpdates.map((item) => (
                  <div key={`duplicate-${item.id}`} className="inline-block mr-8">
                    <span className="inline-block mr-4">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.title}
                    </span>
                  </div>
                ))}
              </motion.div>
            ) : (
              <div>Aucune actualité disponible pour le moment</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
