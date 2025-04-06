import { Toaster } from "@/components/ui/toaster";
import { Route, Switch, useLocation } from "wouter";
import Home from "@/pages/Home";
import ArticlesList from "@/pages/ArticlesList";
import Article from "@/pages/Article";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

// Redirection composant
const Redirector = ({ to }: { to: string }) => {
  const [_, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation(to);
  }, [to, setLocation]);
  
  return null;
};

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={() => <Redirector to="/home" />} />
          <Route path="/home" component={Home} />
          <Route path="/articles" component={ArticlesList} />
          <Route path="/articles/:slug" component={Article} />
          <Route path="/:rest*" component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
