import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function PageHeader({ title, description, icon }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold flex items-center mb-2">
        {icon}
        {title}
      </h1>
      {description && <p className="text-muted-foreground max-w-3xl">{description}</p>}
    </div>
  );
}