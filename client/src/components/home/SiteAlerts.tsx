import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { BellRing } from "lucide-react";
import { Link } from "wouter";

interface SiteAlert {
  id: number;
  content: string;
  backgroundColor: string;
  textColor: string;
  url: string | null;
  active: boolean;
  priority: number;
  createdAt: string;
  createdBy: number | null;
}

const SiteAlerts: React.FC = () => {
  const { data: alerts = [], isLoading, error } = useQuery<SiteAlert[]>({
    queryKey: ["/api/site-alerts/active"],
  });

  if (isLoading || error || alerts.length === 0) {
    return null;
  }

  // Trier les alertes par priorité (décroissant)
  const sortedAlerts = [...alerts].sort((a, b) => b.priority - a.priority);

  return (
    <div className="site-alerts-container space-y-2 mb-4">
      {sortedAlerts.map((alert) => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

const AlertItem: React.FC<{ alert: SiteAlert }> = ({ alert }) => {
  const { content, backgroundColor, textColor, url } = alert;

  const alertContent = (
    <div
      className="p-2 text-center rounded-md cursor-pointer transition-all hover:opacity-90"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <BellRing className="h-4 w-4" />
        <span>{content}</span>
        {url && <span className="text-xs underline">En savoir plus</span>}
      </div>
    </div>
  );

  if (url) {
    const isExternal = url.startsWith("http");
    if (isExternal) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {alertContent}
        </a>
      );
    } else {
      return <Link href={url}>{alertContent}</Link>;
    }
  }

  return alertContent;
};

export default SiteAlerts;