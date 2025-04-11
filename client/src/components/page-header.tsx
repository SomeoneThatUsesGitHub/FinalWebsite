import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground max-w-3xl">{description}</p>
      )}
      <div className="h-1 w-20 bg-primary" />
    </div>
  );
}