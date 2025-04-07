import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, FileText, Users, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  delay?: number;
}

function StatsCard({ title, value, icon, description, className = "", delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="h-8 w-8 text-primary">{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { data: articlesData } = useQuery<any[]>({
    queryKey: ["/api/admin/articles"],
  });

  const { data: userData } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: false, // Désactivé pour le moment car l'API n'existe pas encore
  });

  // Données de statistiques par défaut
  const totalArticles = articlesData?.length || 0;
  const totalViews = articlesData?.reduce((sum, article) => sum + (article.viewCount || 0), 0) || 0;
  const publishedArticles = articlesData?.filter(article => article.published).length || 0;
  const draftArticles = totalArticles - publishedArticles;

  return (
    <AdminLayout title="Tableau de bord">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Articles totaux"
          value={totalArticles}
          icon={<FileText />}
          delay={0.1}
        />
        <StatsCard
          title="Articles publiés"
          value={publishedArticles}
          icon={<CalendarDays />}
          delay={0.2}
        />
        <StatsCard
          title="Brouillons"
          value={draftArticles}
          icon={<FileText className="text-yellow-500" />}
          delay={0.3}
        />
        <StatsCard
          title="Vues totales"
          value={totalViews}
          icon={<Eye />}
          delay={0.4}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Articles récents</h2>
        <div className="rounded-md border">
          <div className="py-2.5 grid grid-cols-12 gap-4 px-4 font-medium">
            <div className="col-span-5">Titre</div>
            <div className="col-span-3 hidden md:block">Catégorie</div>
            <div className="col-span-2 hidden md:block">Vues</div>
            <div className="col-span-2 text-right md:text-center">Statut</div>
          </div>
          <div className="divide-y">
            {articlesData && articlesData.length > 0 ? (
              articlesData.slice(0, 5).map((article, index) => (
                <div key={article.id} className="py-3 grid grid-cols-12 gap-4 px-4 items-center">
                  <div className="col-span-5 font-medium truncate">
                    {article.title}
                  </div>
                  <div className="col-span-3 text-muted-foreground hidden md:block">
                    {article.categoryId}
                  </div>
                  <div className="col-span-2 text-muted-foreground hidden md:block">
                    {article.viewCount || 0}
                  </div>
                  <div className="col-span-2 text-right md:text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        article.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {article.published ? "Publié" : "Brouillon"}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Aucun article trouvé
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}