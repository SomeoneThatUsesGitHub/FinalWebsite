import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, Sparkles, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Quiz {
  id: number;
  contentId: number;
  question: string;
  option1: string;
  option2: string;
  option3: string;
  correctOption: number;
  explanation: string;
}

interface QuizDisplayProps {
  contentId: number;
}

export default function QuizDisplay({ contentId }: QuizDisplayProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({});
  const [showResults, setShowResults] = useState<{[key: number]: boolean}>({});
  
  const { data: quizzes, isLoading, error } = useQuery<Quiz[]>({
    queryKey: [`/api/educational-content/${contentId}/quiz`],
    enabled: !!contentId
  });

  const handleAnswerSelection = (quizId: number, value: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [quizId]: parseInt(value)
    });
  };

  const checkAnswer = (quizId: number) => {
    setShowResults({
      ...showResults,
      [quizId]: true
    });
  };

  const resetQuiz = (quizId: number) => {
    const newSelectedAnswers = { ...selectedAnswers };
    delete newSelectedAnswers[quizId];
    setSelectedAnswers(newSelectedAnswers);
    
    const newShowResults = { ...showResults };
    delete newShowResults[quizId];
    setShowResults(newShowResults);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-pulse flex flex-col items-center">
          <BrainCircuit className="h-8 w-8 text-primary mb-2" />
          <p>Chargement des quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-red-500">Erreur lors du chargement des quiz.</p>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="flex items-center mb-6">
        <BrainCircuit className="h-6 w-6 mr-2 text-primary" />
        <h2 className="text-2xl font-bold">Quiz et auto-évaluation</h2>
      </div>
      
      <div className="space-y-8">
        {quizzes.map((quiz) => (
          <Card 
            key={quiz.id}
            className={cn(
              "border-2",
              showResults[quiz.id] ? (
                selectedAnswers[quiz.id] === quiz.correctOption 
                  ? "border-green-500 dark:border-green-600"
                  : "border-red-500 dark:border-red-600"
              ) : "border-primary/20"
            )}
          >
            <CardHeader>
              <CardTitle className="flex items-start">
                <span className="mr-2">🧠</span>
                {quiz.question}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <RadioGroup
                value={selectedAnswers[quiz.id]?.toString()}
                onValueChange={(value) => handleAnswerSelection(quiz.id, value)}
                className="space-y-3"
                disabled={showResults[quiz.id]}
              >
                <div className={cn(
                  "flex items-start space-x-2 rounded-md border p-3",
                  showResults[quiz.id] && quiz.correctOption === 1 ? "bg-green-50 border-green-500 dark:bg-green-900/20" : "",
                  showResults[quiz.id] && selectedAnswers[quiz.id] === 1 && quiz.correctOption !== 1 ? "bg-red-50 border-red-500 dark:bg-red-900/20" : ""
                )}>
                  <RadioGroupItem value="1" id={`option1-${quiz.id}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`option1-${quiz.id}`} className="flex items-center">
                      {showResults[quiz.id] && quiz.correctOption === 1 && (
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      {showResults[quiz.id] && selectedAnswers[quiz.id] === 1 && quiz.correctOption !== 1 && (
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      {quiz.option1}
                    </Label>
                  </div>
                </div>
                
                <div className={cn(
                  "flex items-start space-x-2 rounded-md border p-3",
                  showResults[quiz.id] && quiz.correctOption === 2 ? "bg-green-50 border-green-500 dark:bg-green-900/20" : "",
                  showResults[quiz.id] && selectedAnswers[quiz.id] === 2 && quiz.correctOption !== 2 ? "bg-red-50 border-red-500 dark:bg-red-900/20" : ""
                )}>
                  <RadioGroupItem value="2" id={`option2-${quiz.id}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`option2-${quiz.id}`} className="flex items-center">
                      {showResults[quiz.id] && quiz.correctOption === 2 && (
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      {showResults[quiz.id] && selectedAnswers[quiz.id] === 2 && quiz.correctOption !== 2 && (
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      {quiz.option2}
                    </Label>
                  </div>
                </div>
                
                <div className={cn(
                  "flex items-start space-x-2 rounded-md border p-3",
                  showResults[quiz.id] && quiz.correctOption === 3 ? "bg-green-50 border-green-500 dark:bg-green-900/20" : "",
                  showResults[quiz.id] && selectedAnswers[quiz.id] === 3 && quiz.correctOption !== 3 ? "bg-red-50 border-red-500 dark:bg-red-900/20" : ""
                )}>
                  <RadioGroupItem value="3" id={`option3-${quiz.id}`} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={`option3-${quiz.id}`} className="flex items-center">
                      {showResults[quiz.id] && quiz.correctOption === 3 && (
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      {showResults[quiz.id] && selectedAnswers[quiz.id] === 3 && quiz.correctOption !== 3 && (
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      )}
                      {quiz.option3}
                    </Label>
                  </div>
                </div>
              </RadioGroup>
              
              {showResults[quiz.id] && (
                <div className={cn(
                  "mt-4 p-4 rounded-md",
                  selectedAnswers[quiz.id] === quiz.correctOption 
                    ? "bg-green-50 dark:bg-green-900/20" 
                    : "bg-red-50 dark:bg-red-900/20"
                )}>
                  <div className="flex items-start mb-2">
                    <div className={cn(
                      "h-6 w-6 flex items-center justify-center rounded-full mr-2",
                      selectedAnswers[quiz.id] === quiz.correctOption ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    )}>
                      {selectedAnswers[quiz.id] === quiz.correctOption ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <h4 className="font-medium">
                      {selectedAnswers[quiz.id] === quiz.correctOption 
                        ? "Bonne réponse !" 
                        : "Ce n'est pas la bonne réponse."}
                    </h4>
                  </div>
                  
                  {selectedAnswers[quiz.id] !== quiz.correctOption && (
                    <p className="mb-2 ml-8">
                      La bonne réponse était: <span className="font-medium">
                        {quiz.correctOption === 1 ? quiz.option1 : (quiz.correctOption === 2 ? quiz.option2 : quiz.option3)}
                      </span>
                    </p>
                  )}
                  
                  {quiz.explanation && (
                    <div className="ml-8">
                      <p className="text-sm font-medium mb-1">Explication:</p>
                      <p className="text-sm">{quiz.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2">
              {!showResults[quiz.id] ? (
                <Button 
                  onClick={() => checkAnswer(quiz.id)}
                  disabled={!selectedAnswers[quiz.id]}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Vérifier ma réponse
                </Button>
              ) : (
                <Button variant="outline" onClick={() => resetQuiz(quiz.id)}>
                  Réessayer
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}