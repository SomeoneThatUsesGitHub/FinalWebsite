import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BrainCircuit, Trash, Plus, Pencil, Save, XCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Quiz {
  id: number;
  contentId: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  correctOption: number;
  explanation: string;
  createdAt: string;
  updatedAt: string;
}

interface NewQuiz {
  question: string;
  option1: string;
  option2: string;
  option3: string;
  correctOption: number;
  explanation: string;
}

interface QuizManagerProps {
  contentId: number;
}

export default function QuizManager({ contentId }: QuizManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [newQuiz, setNewQuiz] = useState<NewQuiz>({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    correctOption: 1,
    explanation: ''
  });

  // Récupérer les quiz pour ce contenu
  const { data: quizzes, isLoading, error } = useQuery<Quiz[]>({
    queryKey: [`/api/educational-content/${contentId}/quiz`],
    enabled: !!contentId
  });

  // Mutation pour créer un nouveau quiz
  const createQuizMutation = useMutation({
    mutationFn: async (quiz: NewQuiz) => {
      const res = await apiRequest(
        'POST',
        `/api/educational-content/${contentId}/quiz`,
        quiz
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/educational-content/${contentId}/quiz`] });
      setIsAdding(false);
      setNewQuiz({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        correctOption: 1,
        explanation: ''
      });
      toast({
        title: 'Quiz ajouté',
        description: 'Le quiz a été ajouté avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de l'ajout du quiz: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour mettre à jour un quiz
  const updateQuizMutation = useMutation({
    mutationFn: async ({ id, quiz }: { id: number; quiz: Partial<NewQuiz> }) => {
      const res = await apiRequest(
        'PUT',
        `/api/educational-content/${contentId}/quiz/${id}`,
        quiz
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/educational-content/${contentId}/quiz`] });
      setIsEditing(null);
      toast({
        title: 'Quiz mis à jour',
        description: 'Le quiz a été mis à jour avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la mise à jour du quiz: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Mutation pour supprimer un quiz
  const deleteQuizMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(
        'DELETE',
        `/api/educational-content/${contentId}/quiz/${id}`
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/educational-content/${contentId}/quiz`] });
      toast({
        title: 'Quiz supprimé',
        description: 'Le quiz a été supprimé avec succès',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la suppression du quiz: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewQuiz(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (value: string) => {
    setNewQuiz(prev => ({
      ...prev,
      correctOption: parseInt(value)
    }));
  };

  const handleAddQuiz = () => {
    // Validation des champs obligatoires
    if (!newQuiz.question || !newQuiz.option1 || !newQuiz.option2 || !newQuiz.option3) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    createQuizMutation.mutate(newQuiz);
  };

  const handleUpdateQuiz = (id: number) => {
    const quiz = quizzes?.find(q => q.id === id);
    if (!quiz) return;

    // Valider les champs obligatoires
    if (
      !newQuiz.question && !newQuiz.option1 && !newQuiz.option2 && 
      !newQuiz.option3 && !newQuiz.explanation
    ) {
      setIsEditing(null);
      return;
    }

    // Créer un objet avec uniquement les champs modifiés
    const updatedFields: Partial<NewQuiz> = {};
    if (newQuiz.question) updatedFields.question = newQuiz.question;
    if (newQuiz.option1) updatedFields.option1 = newQuiz.option1;
    if (newQuiz.option2) updatedFields.option2 = newQuiz.option2;
    if (newQuiz.option3) updatedFields.option3 = newQuiz.option3;
    if (newQuiz.explanation !== quiz.explanation) updatedFields.explanation = newQuiz.explanation;
    if (newQuiz.correctOption !== quiz.correctOption) updatedFields.correctOption = newQuiz.correctOption;

    updateQuizMutation.mutate({ id, quiz: updatedFields });
  };

  const startEditing = (quiz: Quiz) => {
    setIsEditing(quiz.id);
    setNewQuiz({
      question: quiz.question,
      option1: quiz.option1,
      option2: quiz.option2,
      option3: quiz.option3,
      correctOption: quiz.correctOption,
      explanation: quiz.explanation
    });
  };

  const cancelEditing = () => {
    setIsEditing(null);
    setNewQuiz({
      question: '',
      option1: '',
      option2: '',
      option3: '',
      correctOption: 1,
      explanation: ''
    });
  };

  if (isLoading) {
    return (
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BrainCircuit className="mr-2" />
            Quiz et questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <p>Chargement des quiz...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BrainCircuit className="mr-2" />
            Quiz et questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <p className="text-red-500">Erreur lors du chargement des quiz</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BrainCircuit className="mr-2" />
          Quiz et questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {/* Liste des quiz existants */}
          {quizzes && quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className={`border-l-4 ${isEditing === quiz.id ? 'border-l-blue-500' : 'border-l-green-500'}`}>
                  {isEditing === quiz.id ? (
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="edit-question">Question:</Label>
                          <Textarea
                            id="edit-question"
                            name="question"
                            value={newQuiz.question}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-option1">Option 1:</Label>
                            <Input
                              id="edit-option1"
                              name="option1"
                              value={newQuiz.option1}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-option2">Option 2:</Label>
                            <Input
                              id="edit-option2"
                              name="option2"
                              value={newQuiz.option2}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-option3">Option 3:</Label>
                            <Input
                              id="edit-option3"
                              name="option3"
                              value={newQuiz.option3}
                              onChange={handleInputChange}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Réponse correcte:</Label>
                          <RadioGroup
                            value={newQuiz.correctOption.toString()}
                            onValueChange={handleRadioChange}
                            className="flex space-x-4 mt-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="1" id="edit-option1-correct" />
                              <Label htmlFor="edit-option1-correct">Option 1</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="2" id="edit-option2-correct" />
                              <Label htmlFor="edit-option2-correct">Option 2</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="3" id="edit-option3-correct" />
                              <Label htmlFor="edit-option3-correct">Option 3</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div>
                          <Label htmlFor="edit-explanation">Explication (optionnelle):</Label>
                          <Textarea
                            id="edit-explanation"
                            name="explanation"
                            value={newQuiz.explanation}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={cancelEditing}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Annuler
                          </Button>
                          <Button onClick={() => handleUpdateQuiz(quiz.id)}>
                            <Save className="mr-2 h-4 w-4" />
                            Enregistrer
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  ) : (
                    <>
                      <CardHeader>
                        <CardTitle className="text-lg font-medium">
                          {quiz.question}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className={`p-2 rounded-md ${quiz.correctOption === 1 ? 'bg-green-100 dark:bg-green-900/20' : ''}`}>
                            <span className={`font-medium ${quiz.correctOption === 1 ? 'text-green-700 dark:text-green-400' : ''}`}>Option 1:</span> {quiz.option1}
                          </div>
                          <div className={`p-2 rounded-md ${quiz.correctOption === 2 ? 'bg-green-100 dark:bg-green-900/20' : ''}`}>
                            <span className={`font-medium ${quiz.correctOption === 2 ? 'text-green-700 dark:text-green-400' : ''}`}>Option 2:</span> {quiz.option2}
                          </div>
                          <div className={`p-2 rounded-md ${quiz.correctOption === 3 ? 'bg-green-100 dark:bg-green-900/20' : ''}`}>
                            <span className={`font-medium ${quiz.correctOption === 3 ? 'text-green-700 dark:text-green-400' : ''}`}>Option 3:</span> {quiz.option3}
                          </div>
                          
                          {quiz.explanation && (
                            <div className="mt-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                              <p className="font-medium">Explication:</p>
                              <p>{quiz.explanation}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => startEditing(quiz)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Modifier
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash className="mr-2 h-4 w-4" />
                              Supprimer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action ne peut pas être annulée. Cela supprimera définitivement ce quiz.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteQuizMutation.mutate(quiz.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 border border-dashed rounded-lg">
              <p className="text-gray-500 mb-2">Aucun quiz n'a été créé pour ce contenu</p>
              <p className="text-gray-500 text-sm">Ajoutez des quiz pour tester les connaissances des lecteurs</p>
            </div>
          )}

          {/* Formulaire d'ajout de quiz */}
          {isAdding ? (
            <Card className="mt-6 border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle>Ajouter un nouveau quiz</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question:</Label>
                    <Textarea
                      id="question"
                      name="question"
                      value={newQuiz.question}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="Posez votre question ici..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="option1">Option 1:</Label>
                      <Input
                        id="option1"
                        name="option1"
                        value={newQuiz.option1}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Première option"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option2">Option 2:</Label>
                      <Input
                        id="option2"
                        name="option2"
                        value={newQuiz.option2}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Deuxième option"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option3">Option 3:</Label>
                      <Input
                        id="option3"
                        name="option3"
                        value={newQuiz.option3}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Troisième option"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Réponse correcte:</Label>
                    <RadioGroup
                      value={newQuiz.correctOption.toString()}
                      onValueChange={handleRadioChange}
                      className="flex space-x-4 mt-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="option1-correct" />
                        <Label htmlFor="option1-correct">Option 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="2" id="option2-correct" />
                        <Label htmlFor="option2-correct">Option 2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3" id="option3-correct" />
                        <Label htmlFor="option3-correct">Option 3</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div>
                    <Label htmlFor="explanation">Explication (optionnelle):</Label>
                    <Textarea
                      id="explanation"
                      name="explanation"
                      value={newQuiz.explanation}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="Explication de la réponse correcte..."
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddQuiz}>
                  Ajouter le quiz
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="mt-6">
              <Button onClick={() => setIsAdding(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un nouveau quiz
              </Button>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}