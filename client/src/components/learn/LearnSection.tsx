import React, { useState } from "react";
import { motion } from "framer-motion";
import { staggerChildren, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Heart, MessageSquare } from "lucide-react";

type Category = {
  id: number;
  name: string;
  slug: string;
  color: string;
};

type EducationalContent = {
  id: number;
  title: string;
  imageUrl: string;
  content: string;
  categoryId: number;
  likes: number;
  comments: number;
  createdAt: string;
};

const LearnSection: React.FC = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: content, isLoading: contentLoading } = useQuery<EducationalContent[]>({
    queryKey: ['/api/educational-content', selectedCategoryId],
    queryFn: async ({ queryKey }) => {
      const categoryId = queryKey[1] as number | null;
      const url = categoryId 
        ? `/api/educational-content?categoryId=${categoryId}` 
        : '/api/educational-content';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch educational content');
      return res.json();
    }
  });

  const isLoading = categoriesLoading || contentLoading;

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
  };

  return (
    <section id="apprendre" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-2xl md:text-3xl font-bold font-heading text-dark mb-2">Apprendre</h2>
        <p className="text-dark/70 mb-8">Retrouvez nos publications éducatives organisées par thématique</p>
        
        {/* Category Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Button
            variant={selectedCategoryId === null ? "default" : "outline"}
            onClick={() => handleCategoryClick(null)}
          >
            Tous les contenus
          </Button>
          
          {categoriesLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-10 w-40" />
            ))
          ) : (
            categories?.map(category => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                onClick={() => handleCategoryClick(category.id)}
                style={{ 
                  backgroundColor: selectedCategoryId === category.id ? category.color : "",
                  borderColor: selectedCategoryId !== category.id ? category.color : ""
                }}
              >
                {category.name}
              </Button>
            ))
          )}
        </div>
        
        {/* Instagram-style Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
            variants={staggerChildren}
            initial="hidden"
            animate="visible"
          >
            {content?.map((item, index) => (
              <motion.div 
                key={item.id}
                className="aspect-square rounded-xl overflow-hidden shadow-md relative group"
                variants={staggerItem}
                custom={index}
              >
                <img 
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div>
                    <p className="text-white font-medium text-sm">{item.title}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-white/70 text-xs flex items-center mr-3">
                        <Heart className="mr-1 h-3 w-3" /> {item.likes}
                      </span>
                      <span className="text-white/70 text-xs flex items-center">
                        <MessageSquare className="mr-1 h-3 w-3" /> {item.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        <div className="mt-8 text-center">
          <Button>
            Voir tous les posts éducatifs <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LearnSection;
