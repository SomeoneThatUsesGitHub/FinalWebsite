import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Election, ElectionResult, ElectionResultsData } from '@/components/ElectionResultsChart';
import AdminLayout from '@/components/admin/AdminLayout';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Trash2, Edit, Plus, Save, MapPin, ChevronDown, AlertCircle, Check } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Schéma de validation pour les élections
const electionFormSchema = z.object({
  country: z.string().min(1, "Le pays est requis"),
  countryCode: z.string().min(2, "Le code pays est requis").max(2, "Le code pays ne doit pas dépasser 2 caractères"),
  title: z.string().min(3, "Le titre est requis (min. 3 caractères)"),
  date: z.date(),
  type: z.string().min(1, "Le type d'élection est requis"),
  description: z.string().optional(),
  upcoming: z.boolean().default(false),
});

// Schéma pour les résultats d'élection
const electionResultSchema = z.object({
  candidate: z.string().min(1, "Le nom du candidat est requis"),
  party: z.string().min(1, "Le nom du parti est requis"),
  percentage: z.number().min(0, "Le pourcentage doit être positif").max(100, "Le pourcentage ne peut pas dépasser 100%"),
  votes: z.number().optional(),
  color: z.string().min(1, "Une couleur est requise"),
});

// Type pour l'état du formulaire
type ElectionFormValues = z.infer<typeof electionFormSchema>;
type ElectionResultFormValues = z.infer<typeof electionResultSchema>;

// Type pour les élections avec ID
type ElectionData = {
  id: number;
  country: string;
  countryCode: string;
  title: string;
  date: string;
  type: string;
  results: string | any;
  description: string | null;
  upcoming: boolean;
  createdAt: string;
};

const ElectionsAdminPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedElection, setSelectedElection] = useState<ElectionData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [electionResults, setElectionResults] = useState<ElectionResult[]>([]);
  const [currentTab, setCurrentTab] = useState<string>('liste');
  
  // État pour le formulaire d'ajout de résultat
  const [newResult, setNewResult] = useState<ElectionResultFormValues>({
    candidate: '',
    party: '',
    percentage: 0,
    votes: undefined,
    color: '#3b82f6',
  });
  
  // Récupérer toutes les élections
  const { data: elections, isLoading } = useQuery<ElectionData[]>({
    queryKey: ['/api/elections'],
  });
  
  // Formulaire pour l'ajout/modification d'élection
  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: {
      country: '',
      countryCode: '',
      title: '',
      date: new Date(),
      type: '',
      description: '',
      upcoming: false,
    },
  });
  
  // Mutation pour créer une nouvelle élection
  const createElectionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/elections', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Élection créée avec succès",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/elections'] });
      setIsCreating(false);
      setElectionResults([]);
      form.reset();
      setCurrentTab('liste');
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la création",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour mettre à jour une élection
  const updateElectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest('PATCH', `/api/elections/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Élection mise à jour avec succès",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/elections'] });
      setSelectedElection(null);
      setElectionResults([]);
      form.reset();
      setCurrentTab('liste');
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la mise à jour",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Mutation pour supprimer une élection
  const deleteElectionMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/elections/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Élection supprimée avec succès",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/elections'] });
    },
    onError: (error) => {
      toast({
        title: "Erreur lors de la suppression",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Fonction pour ajouter un résultat à l'élection
  const addElectionResult = () => {
    if (!newResult.candidate || !newResult.party || newResult.percentage <= 0) {
      toast({
        title: "Données incomplètes",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }
    
    setElectionResults([...electionResults, { ...newResult }]);
    
    // Réinitialiser le formulaire de résultat
    setNewResult({
      candidate: '',
      party: '',
      percentage: 0,
      votes: undefined,
      color: '#3b82f6',
    });
  };
  
  // Fonction pour supprimer un résultat
  const removeElectionResult = (index: number) => {
    const newResults = [...electionResults];
    newResults.splice(index, 1);
    setElectionResults(newResults);
  };
  
  // Fonction pour calculer le total des pourcentages
  const calculateTotalPercentage = () => {
    return electionResults.reduce((total, result) => total + result.percentage, 0);
  };
  
  // Fonction pour éditer une élection existante
  const editElection = (election: ElectionData) => {
    setSelectedElection(election);
    setIsCreating(false);
    
    // Analyse des résultats
    let results: ElectionResult[] = [];
    if (typeof election.results === 'string') {
      try {
        const parsedResults = JSON.parse(election.results);
        results = Array.isArray(parsedResults.results) ? parsedResults.results : [];
      } catch (e) {
        console.error("Erreur lors de l'analyse des résultats:", e);
        results = [];
      }
    } else if (election.results && Array.isArray(election.results.results)) {
      results = election.results.results;
    }
    
    setElectionResults(results);
    
    // Initialisation du formulaire avec les données de l'élection
    form.reset({
      country: election.country,
      countryCode: election.countryCode,
      title: election.title,
      date: new Date(election.date),
      type: election.type,
      description: election.description || '',
      upcoming: election.upcoming,
    });
    
    setCurrentTab('edition');
  };
  
  // Fonction pour initialiser la création d'une nouvelle élection
  const startCreateElection = () => {
    setSelectedElection(null);
    setIsCreating(true);
    setElectionResults([]);
    
    form.reset({
      country: '',
      countryCode: '',
      title: '',
      date: new Date(),
      type: '',
      description: '',
      upcoming: false,
    });
    
    setCurrentTab('edition');
  };
  
  // Fonction pour annuler l'édition ou la création
  const cancelEdit = () => {
    setSelectedElection(null);
    setIsCreating(false);
    setElectionResults([]);
    form.reset();
    setCurrentTab('liste');
  };
  
  // Fonction de soumission du formulaire
  const onSubmit = (data: ElectionFormValues) => {
    // Vérifier si des résultats ont été ajoutés
    if (electionResults.length === 0) {
      toast({
        title: "Résultats manquants",
        description: "Veuillez ajouter au moins un résultat à l'élection",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier si le total des pourcentages est proche de 100%
    const totalPercentage = calculateTotalPercentage();
    if (totalPercentage < 95 || totalPercentage > 105) {
      toast({
        title: "Problème de pourcentages",
        description: `La somme des pourcentages est de ${totalPercentage.toFixed(2)}%. Ce total devrait être proche de 100%.`,
        variant: "destructive",
      });
      return;
    }
    
    // Préparer les données de l'élection
    const electionData = {
      ...data,
      date: format(data.date, 'yyyy-MM-dd'),
      results: JSON.stringify({
        title: data.title,
        date: format(data.date, 'dd MMMM yyyy', { locale: fr }),
        type: data.type,
        results: electionResults,
      }),
    };
    
    // Créer ou mettre à jour l'élection
    if (isCreating) {
      createElectionMutation.mutate(electionData);
    } else if (selectedElection) {
      updateElectionMutation.mutate({ id: selectedElection.id, data: electionData });
    }
  };
  
  return (
    <AdminLayout title="Gestion des Élections">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="liste">Liste des élections</TabsTrigger>
          <TabsTrigger value="edition" disabled={!isCreating && !selectedElection}>
            {isCreating ? "Nouvelle élection" : selectedElection ? "Modifier l'élection" : "Édition"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="liste">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Liste des élections</h1>
            <Button onClick={startCreateElection}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle élection
            </Button>
          </div>
          
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Chargement des élections...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {elections && elections.length > 0 ? (
                <Card>
                  <CardContent className="p-0 overflow-hidden">
                    <ScrollArea className="h-[600px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">Pays</TableHead>
                            <TableHead className="whitespace-nowrap">Titre</TableHead>
                            <TableHead className="whitespace-nowrap">Date</TableHead>
                            <TableHead className="whitespace-nowrap">Type</TableHead>
                            <TableHead className="whitespace-nowrap">Statut</TableHead>
                            <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {elections.map((election) => (
                            <TableRow key={election.id}>
                              <TableCell className="whitespace-nowrap font-medium">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getCountryFlag(election.countryCode)}</span>
                                  {election.country}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{election.title}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {new Date(election.date).toLocaleDateString('fr-FR')}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">{election.type}</TableCell>
                              <TableCell>
                                {election.upcoming ? (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    À venir
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Passée
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => editElection(election)}
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Modifier</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                          onClick={() => {
                                            if (confirm(`Êtes-vous sûr de vouloir supprimer l'élection "${election.title}" ?`)) {
                                              deleteElectionMutation.mutate(election.id);
                                            }
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>Supprimer</TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-xl font-medium">Aucune élection</h3>
                    <p className="mt-2 text-muted-foreground">
                      Il n'y a aucune élection dans la base de données.
                    </p>
                    <Button className="mt-6" onClick={startCreateElection}>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer une élection
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="edition">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {isCreating ? "Nouvelle élection" : "Modifier l'élection"}
            </h1>
            <Button variant="outline" onClick={cancelEdit}>
              Annuler
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulaire principal */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'élection</CardTitle>
                <CardDescription>
                  Renseignez les informations générales de l'élection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays</FormLabel>
                            <FormControl>
                              <Input placeholder="France, Allemagne, États-Unis..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code pays (2 lettres)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="FR, DE, US..." 
                                maxLength={2}
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e.target.value.toUpperCase());
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              Code ISO à 2 lettres (ex: FR pour France)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre de l'élection</FormLabel>
                          <FormControl>
                            <Input placeholder="Élection présidentielle 2023..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date de l'élection</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? (
                                      format(field.value, "d MMMM yyyy", { locale: fr })
                                    ) : (
                                      <span>Sélectionner une date</span>
                                    )}
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  locale={fr}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type d'élection</FormLabel>
                            <FormControl>
                              <Input placeholder="Présidentielle, Législative..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (optionnelle)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Informations complémentaires sur l'élection..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="upcoming"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Élection à venir</FormLabel>
                            <FormDescription>
                              Activez cette option si l'élection n'a pas encore eu lieu
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button type="submit" disabled={createElectionMutation.isPending || updateElectionMutation.isPending}>
                        {createElectionMutation.isPending || updateElectionMutation.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            {/* Gestion des résultats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Résultats de l'élection</CardTitle>
                  <CardDescription>
                    Ajoutez les candidats et leurs résultats
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Formulaire d'ajout de résultat */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <FormLabel>Candidat</FormLabel>
                          <Input
                            placeholder="Nom du candidat"
                            value={newResult.candidate}
                            onChange={(e) => setNewResult({ ...newResult, candidate: e.target.value })}
                          />
                        </div>
                        <div>
                          <FormLabel>Parti</FormLabel>
                          <Input
                            placeholder="Nom du parti"
                            value={newResult.party}
                            onChange={(e) => setNewResult({ ...newResult, party: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-6 gap-4">
                        <div className="col-span-2">
                          <FormLabel>Pourcentage (%)</FormLabel>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.01"
                            value={newResult.percentage || ''}
                            onChange={(e) => setNewResult({ ...newResult, percentage: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormLabel>Votes (optionnel)</FormLabel>
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={newResult.votes || ''}
                            onChange={(e) => setNewResult({ ...newResult, votes: parseInt(e.target.value) || undefined })}
                          />
                        </div>
                        <div className="col-span-2">
                          <FormLabel>Couleur</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-16 p-1 h-10"
                              value={newResult.color}
                              onChange={(e) => setNewResult({ ...newResult, color: e.target.value })}
                            />
                            <Input
                              value={newResult.color}
                              onChange={(e) => setNewResult({ ...newResult, color: e.target.value })}
                              placeholder="#HEX"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button 
                          variant="secondary" 
                          className="w-full"
                          onClick={addElectionResult}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Ajouter ce résultat
                        </Button>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Affichage des résultats ajoutés */}
                    <div>
                      <h3 className="font-medium mb-2">Résultats ajoutés ({electionResults.length})</h3>
                      
                      {electionResults.length === 0 ? (
                        <div className="text-center py-8 border rounded-md bg-muted/40">
                          <p className="text-muted-foreground">Aucun résultat ajouté</p>
                        </div>
                      ) : (
                        <>
                          <div className="rounded-md border mb-4 overflow-hidden">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Candidat / Parti</TableHead>
                                  <TableHead className="text-right">%</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {electionResults.map((result, index) => (
                                  <TableRow key={index}>
                                    <TableCell className="whitespace-nowrap">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-4 h-4 rounded-full"
                                          style={{ backgroundColor: result.color }}
                                        ></div>
                                        <div>
                                          <div className="font-medium">{result.candidate}</div>
                                          <div className="text-xs text-muted-foreground">{result.party}</div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {result.percentage.toFixed(2)}%
                                      {result.votes && (
                                        <div className="text-xs text-muted-foreground">
                                          {result.votes.toLocaleString()} votes
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => removeElectionResult(index)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                
                                {/* Ligne du total */}
                                <TableRow>
                                  <TableCell className="whitespace-nowrap font-medium">
                                    Total
                                  </TableCell>
                                  <TableCell className="text-right font-medium">
                                    {calculateTotalPercentage().toFixed(2)}%
                                    {Math.abs(calculateTotalPercentage() - 100) > 5 && (
                                      <div className="text-xs text-red-500">
                                        Le total devrait être proche de 100%
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div>
                    {Math.abs(calculateTotalPercentage() - 100) > 5 && (
                      <p className="text-sm text-red-500">
                        <AlertCircle className="inline-block h-4 w-4 mr-1" />
                        Le total des pourcentages devrait être proche de 100%
                      </p>
                    )}
                    {Math.abs(calculateTotalPercentage() - 100) <= 5 && electionResults.length > 0 && (
                      <p className="text-sm text-green-600">
                        <Check className="inline-block h-4 w-4 mr-1" />
                        Le total des pourcentages est correct
                      </p>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

// Fonction helper pour obtenir l'emoji du drapeau à partir du code pays
const getCountryFlag = (countryCode: string): string => {
  // Les codes pays sont en majuscules et ont 2 caractères
  const uppercaseCode = countryCode.toUpperCase();
  const codePoints = [];
  
  for (let i = 0; i < uppercaseCode.length; i++) {
    codePoints.push(127397 + uppercaseCode.charCodeAt(i));
  }
  
  return String.fromCodePoint(...codePoints);
};

export default ElectionsAdminPage;