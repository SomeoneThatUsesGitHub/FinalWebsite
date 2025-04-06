import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Home />
      </main>
      <Toaster />
    </div>
  );
}

export default App;
