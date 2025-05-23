import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Helmet } from "react-helmet";

// Pages publiques
import Home from "@/pages/Home";
import ArticlesList from "@/pages/ArticlesList";
import Article from "@/pages/Article";
import TeamPage from "@/pages/TeamPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/AuthPage";
import TestEditor from "@/pages/test-editor";
import LiveCoveragePage from "@/pages/LiveCoveragePage";
import LearnPage from "@/pages/LearnPage";
import TopicPage from "@/pages/TopicPage";
import ContentPage from "@/pages/ContentPage";
import ElectionsPage from "@/pages/ElectionsPage";
import CountryElectionsPage from "@/pages/CountryElectionsPage";
import ElectionResultsPage from "@/pages/ElectionResultsPage";
import LegalPage from "@/pages/LegalPage";
import PrivacyPage from "@/pages/PrivacyPage";

// Pages admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ArticlesPage from "@/pages/admin/ArticlesPage";
import EditArticlePage from "@/pages/admin/EditArticlePage";
import FlashInfosPage from "@/pages/admin/FlashInfosPage";
import VideosPage from "@/pages/admin/VideosPage";
import CategoriesPage from "@/pages/admin/CategoriesPage";
import UsersPage from "@/pages/admin/UsersPage";
import DirectsPage from "@/pages/admin/DirectsPage";
import DirectForm from "@/pages/admin/DirectForm";
import DirectEditorsPage from "@/pages/admin/DirectEditorsPage";
import DirectUpdatesPage from "@/pages/admin/DirectUpdatesPage";
import DirectQuestionsPage from "@/pages/admin/DirectQuestionsPage";
import EducationalContentPage from "@/pages/admin/EducationalContentPage";
import GlossaryPage from "@/pages/admin/GlossaryPage";
import AdminElectionsPage from "@/pages/admin/ElectionsPage";
import ElectionReactionsPage from "@/pages/admin/ElectionReactionsPage";

// Team admin page
import AdminTeamPage from "@/pages/admin/TeamPage";
// Newsletter subscribers page
import NewsletterSubscribersPage from "@/pages/admin/NewsletterSubscribersPage";
// Applications page
import ApplicationsPage from "@/pages/admin/ApplicationsPage";
// Contact messages page
import ContactMessagesPage from "@/pages/admin/ContactMessagesPage";

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
          {/* Balises SEO globales */}
          <Helmet>
            <html lang="fr" />
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Politiquensemble - L'actualité politique simplifiée pour les 16-30 ans</title>
            <meta name="description" content="Comprendre les enjeux politiques d'aujourd'hui pour construire le monde de demain. Un média par et pour les jeunes citoyens." />
            
            {/* Balises hreflang pour indiquer la langue principale */}
            <link rel="alternate" hrefLang="fr" href="https://politiquensemble.be" />
            <link rel="alternate" hrefLang="x-default" href="https://politiquensemble.be" />
            
            {/* Balises de site vérifié pour les moteurs de recherche */}
            <meta name="google-site-verification" content="REMPLACER_PAR_CODE_VERIFICATION" />
          </Helmet>

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
              <Route path="/a-propos" component={AboutPage} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/test-editor" component={TestEditor} />
              <Route path="/suivis-en-direct/:slug" component={LiveCoveragePage} />
              <Route path="/apprendre" component={LearnPage} />
              <Route path="/apprendre/:slug" component={TopicPage} />
              <Route path="/apprendre/:topicSlug/:contentSlug" component={ContentPage} />
              <Route path="/elections" component={ElectionsPage} />
              <Route path="/elections/:countryCode" component={CountryElectionsPage} />
              <Route path="/elections/:countryCode/resultats/:id" component={ElectionResultsPage} />
              <Route path="/mentions-legales" component={LegalPage} />
              <Route path="/confidentialite" component={PrivacyPage} />
              
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
              <ProtectedRoute path="/admin/newsletter" component={NewsletterSubscribersPage} adminOnly />
              <ProtectedRoute path="/admin/applications" component={ApplicationsPage} adminOnly />
              <ProtectedRoute path="/admin/messages" component={ContactMessagesPage} adminOnly />
              <ProtectedRoute path="/admin/contenu-educatif" component={EducationalContentPage} adminOnly />
              <ProtectedRoute path="/admin/glossaire" component={GlossaryPage} adminOnly />
              <ProtectedRoute path="/admin/elections" component={AdminElectionsPage} adminOnly />
              <ProtectedRoute path="/admin/election-reactions" component={ElectionReactionsPage} adminOnly />
              
              {/* Routes pour les suivis en direct - accessibles aux éditeurs */}
              <ProtectedRoute path="/admin/directs" component={DirectsPage} />
              <ProtectedRoute path="/admin/directs/nouveau" component={DirectForm} adminOnly />
              <ProtectedRoute path="/admin/directs/editer/:id" component={DirectForm} adminOnly />
              <ProtectedRoute path="/admin/directs/:id/editeurs" component={DirectEditorsPage} adminOnly />
              <ProtectedRoute path="/admin/directs/:id/questions" component={DirectQuestionsPage} />
              <ProtectedRoute path="/admin/directs/:id/mises-a-jour" component={DirectUpdatesPage} />
              
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
