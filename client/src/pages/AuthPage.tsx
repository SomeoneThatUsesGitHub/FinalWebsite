import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogIn } from "lucide-react";

// Schémas de validation
const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  confirmPassword: z.string().min(1, "Veuillez confirmer votre mot de passe"),
  displayName: z.string().min(2, "Le nom d'affichage doit contenir au moins 2 caractères"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user, loginMutation } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  // N'utilisons plus d'onglets, uniquement la connexion
  
  // Utiliser useEffect pour la redirection pour éviter les erreurs de hook
  useEffect(() => {
    if (user && !isRedirecting) {
      // Vérifier si l'utilisateur est admin avant de rediriger
      if (user.isAdmin) {
        console.log("Utilisateur admin connecté:", user);
        setIsRedirecting(true);
        setLocation("/admin");
      } else {
        console.log("Utilisateur non-admin connecté:", user);
        setIsRedirecting(true);
        setLocation("/"); // Rediriger vers l'accueil pour les non-admins
      }
    }
  }, [user, setLocation, isRedirecting]);
  
  // Note: Nous ne retournons PAS prématurément ici comme avant
  // Au lieu de cela, nous utilisons isRedirecting pour afficher un message de chargement
  // tout en continuant à rendre le reste du composant (important pour les hooks)
  
  // Formulaire de connexion
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Soumission du formulaire de connexion
  const onLoginSubmit = (data: LoginValues) => {
    loginMutation.mutate(data);
  };
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Afficher l'indicateur de redirection si nécessaire */}
      {isRedirecting && (
        <div className="fixed inset-0 flex items-center justify-center bg-background/80 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">
              {user?.isAdmin ? "Redirection vers le tableau de bord..." : "Redirection vers l'accueil..."}</p>
          </div>
        </div>
      )}
      
      {/* Section de gauche: Formulaire */}
      <div className="flex flex-col justify-center w-full px-4 py-12 sm:px-6 lg:flex-none lg:w-[500px] xl:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-primary tracking-tight">Politiquensemble</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Espace d'administration
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Connexion</CardTitle>
              <CardDescription>
                Connectez-vous à votre compte pour accéder à l'administration
              </CardDescription>
            </CardHeader>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="login-username">Nom d'utilisateur</Label>
                  <Input
                    id="login-username"
                    type="text"
                    {...loginForm.register("username")}
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-sm text-red-500">
                      {loginForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                
                {loginMutation.isError && (
                  <div className="text-sm text-red-500 text-center">
                    Nom d'utilisateur ou mot de passe incorrect
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" /> Se connecter
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <a href="/" className="underline underline-offset-4 hover:text-primary">
              Retourner au site
            </a>
          </p>
        </div>
      </div>
      
      {/* Section de droite: Présentation */}
      <div className="relative hidden lg:block lg:flex-1">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-blue-500 opacity-90" />
        <div className="absolute inset-0 bg-[url('/images/auth-bg.jpg')] bg-cover bg-center mix-blend-overlay" />
        <div className="flex items-center justify-center h-full relative z-10 px-8">
          <div className="max-w-md text-white">
            <h2 className="text-3xl font-bold mb-6">
              Bienvenue dans l'espace administration
            </h2>
            <p className="mb-6">
              Gérez votre contenu, publiez des articles et gardez votre audience informée des dernières actualités politiques et économiques.
            </p>
            <ul className="space-y-3">
              <li className="flex">
                <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Publier et gérer les articles
              </li>
              <li className="flex">
                <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Diffuser des flash infos
              </li>
              <li className="flex">
                <div className="rounded-full bg-white bg-opacity-20 p-1 mr-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                Organiser le contenu par catégories
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}