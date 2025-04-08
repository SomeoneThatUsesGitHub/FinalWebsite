import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages publiques
import Home from "@/pages/Home";
import ArticlesList from "@/pages/ArticlesList";
import Article from "@/pages/Article";
import TeamPage from "@/pages/TeamPage";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import TestEditor from "@/pages/test-editor";

// Pages admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ArticlesPage from "@/pages/admin/ArticlesPage";
import EditArticlePage from "@/pages/admin/EditArticlePage";
import FlashInfosPage from "@/pages/admin/FlashInfosPage";
import VideosPage from "@/pages/admin/VideosPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import UsersPage from "@/pages/admin/UsersPage";

// Team admin page
import AdminTeamPage from "@/pages/admin/TeamPage";

// Layout
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Redirection composant
const Redirector = ({ to }: { to: string }) => {
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  
  return null;
};

function App() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top on page change
    window.scrollTo(0, 0);
  }, [location]);

  // Déterminer si la page actuelle est une page admin
  const isAdminPage = location.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          {/* N'afficher le header et le footer que sur les pages publiques */}
          {!isAdminPage && <Header />}
          <main className={`flex-grow ${!isAdminPage ? "" : "bg-background"}`}>
            <Switch>
              {/* Routes publiques */}
              <Route path="/" component={() => <Redirector to="/home" />} />
              <Route path="/home" component={Home} />
              <Route path="/articles" component={ArticlesList} />
              <Route path="/articles/:slug" component={Article} />
              <Route path="/team" component={TeamPage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/test-editor" component={TestEditor} />
              
              {/* Routes admin protégées - accessibles aux admins et éditeurs */}
              <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
              <ProtectedRoute path="/admin/articles" component={ArticlesPage} adminOnly />
              <ProtectedRoute path="/admin/articles/new" component={EditArticlePage} adminOnly />
              <ProtectedRoute path="/admin/articles/:id" component={EditArticlePage} adminOnly />
              <ProtectedRoute path="/admin/flash-infos" component={FlashInfosPage} adminOnly />
              <ProtectedRoute path="/admin/videos" component={VideosPage} adminOnly />

              
              {/* Routes admin protégées - accessibles uniquement aux admins */}
              <ProtectedRoute path="/admin/categories" component={CategoriesPage} adminOnly />
              <ProtectedRoute path="/admin/users" component={UsersPage} adminOnly />
              <ProtectedRoute path="/admin/team" component={AdminTeamPage} adminOnly />
              
              {/* Fallback */}
              <Route path="/:rest*" component={NotFound} />
            </Switch>
          </main>
          {!isAdminPage && <Footer />}
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
