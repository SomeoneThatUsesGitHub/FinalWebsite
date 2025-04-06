import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Connexion réussie",
          description: `Bienvenue, ${data.user.displayName || data.user.username}`,
        });
        setLocation("/admin/dashboard");
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "Échec de la connexion",
          description: error.message || "Identifiants incorrects",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
    >
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Administration</CardTitle>
          <CardDescription className="text-center">
            Connectez-vous pour accéder à l'espace d'administration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom d'utilisateur" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Mot de passe" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground">
          Retour au <a href="/" className="underline text-primary">site principal</a>
        </CardFooter>
      </Card>
    </motion.div>
  );
}