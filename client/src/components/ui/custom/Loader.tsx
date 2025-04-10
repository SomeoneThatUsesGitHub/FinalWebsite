import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = "md", 
  color = "border-blue-600"
}) => {
  const sizeClass = {
    sm: "w-6 h-6 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3"
  };

  return (
    <div className={`${sizeClass[size]} ${color} border-t-transparent rounded-full animate-spin`}></div>
  );
};

export default Loader;