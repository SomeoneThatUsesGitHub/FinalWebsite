import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ArticlesList from "@/pages/ArticlesList";
import Article from "@/pages/Article";
import ElectionsPage from "@/pages/ElectionsPage";
import LearnPage from "@/pages/LearnPage";
import AboutPage from "@/pages/AboutPage";
import TeamPage from "@/pages/TeamPage";
import ContactPage from "@/pages/ContactPage";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/articles" component={ArticlesList} />
          <Route path="/articles/:slug" component={Article} />
          <Route path="/elections" component={ElectionsPage} />
          <Route path="/apprendre" component={LearnPage} />
          <Route path="/a-propos" component={AboutPage} />
          <Route path="/equipe" component={TeamPage} />
          <Route path="/contact" component={ContactPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
