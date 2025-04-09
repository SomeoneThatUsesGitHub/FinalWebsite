import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { LiveCoverageQuestion, LiveCoverage } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ChevronLeft, Clock, CheckCircle, AlertTriangle, XCircle, MessageSquare } from "lucide-react";
import { formatDate, formatDistanceToNow } from "@/lib/utils";

export default function DirectQuestionsPage() {
  const { id } = useParams();
  const coverageId = id ? parseInt(id) : 0;
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<LiveCoverageQuestion | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [isImportant, setIsImportant] = useState(false);
  
  // Récupérer le suivi en direct
  const { data: coverage } = useQuery<LiveCoverage>({
    queryKey: [`/api/admin/live-coverages/${coverageId}`],
    enabled: !isNaN(coverageId),
  });
  
  // Récupérer toutes les questions
  const { data: questions, isLoading, error } = useQuery<LiveCoverageQuestion[]>({
    queryKey: [`/api/admin/live-coverages/${coverageId}/questions`],
    enabled: !isNaN(coverageId),
  });
  
  // Mutation pour changer le statut d'une question
  const updateStatusMutation = useMutation({
    mutationFn: async ({ questionId, status }: { questionId: number, status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/live-coverages/questions/${questionId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/live-coverages/${coverageId}/questions`] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la question a été mis à jour avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la question. " + error.message,
        variant: "destructive",
      });
    }
  });
  
  // Mutation pour répondre à une question
  const answerQuestionMutation = useMutation({
    mutationFn: async ({ questionId, content, important }: { questionId: number, content: string, important: boolean }) => {
      const res = await apiRequest("POST", `/api/admin/live-coverages/questions/${questionId}/answer`, {
        content,
        important,
        coverageId
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/live-coverages/${coverageId}/questions`] });
      queryClient.invalidateQueries({ queryKey: [`/api/live-coverages/${coverageId}/updates`] });
      setAnswerDialogOpen(false);
      setSelectedQuestion(null);
      setAnswerContent("");
      setIsImportant(false);
      
      toast({
        title: "Réponse publiée",
        description: "Votre réponse a été publiée avec succès.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: "Impossible de publier la réponse. " + error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleApprove = (question: LiveCoverageQuestion) => {
    updateStatusMutation.mutate({ questionId: question.id, status: "approved" });
  };
  
  const handleReject = (question: LiveCoverageQuestion) => {
    updateStatusMutation.mutate({ questionId: question.id, status: "rejected" });
  };
  
  const handleAnswerClick = (question: LiveCoverageQuestion) => {
    setSelectedQuestion(question);
    setAnswerDialogOpen(true);
  };
  
  const handleSubmitAnswer = () => {
    if (!selectedQuestion || !answerContent.trim()) return;
    
    answerQuestionMutation.mutate({
      questionId: selectedQuestion.id,
      content: answerContent.trim(),
      important: isImportant
    });
  };
  
  // Filtrer les questions par statut
  const pendingQuestions = questions?.filter(q => q.status === "pending") || [];
  const approvedQuestions = questions?.filter(q => q.status === "approved") || [];
  const rejectedQuestions = questions?.filter(q => q.status === "rejected") || [];
  
  // Afficher un message de statut pour chaque question
  const getStatusBadge = (status: string | null, answered: boolean | null) => {
    if (status === "pending") {
      return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">En attente</Badge>;
    } else if (status === "approved") {
      if (answered === true) {
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Répondue</Badge>;
      }
      return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Approuvée</Badge>;
    } else if (status === "rejected") {
      return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejetée</Badge>;
    }
    return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">En attente</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <XCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-muted-foreground mb-4">Impossible de charger les questions pour ce suivi en direct.</p>
          <Button onClick={() => navigate("/admin/directs")}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux directs
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Questions du direct
            </h1>
            <p className="text-muted-foreground mt-1">
              {coverage?.title && `Suivi: ${coverage.title}`}
            </p>
          </div>
          
          <Button variant="outline" onClick={() => navigate(`/admin/directs`)}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux directs
          </Button>
        </div>
        
        {/* Questions en attente */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
            Questions en attente ({pendingQuestions.length})
          </h2>
          
          {pendingQuestions.length > 0 ? (
            <div className="grid gap-4">
              {pendingQuestions.map(question => (
                <Card key={question.id} className="border-yellow-200 dark:border-yellow-900/50 bg-yellow-50/50 dark:bg-yellow-900/10">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{question.username}</div>
                      {getStatusBadge(question.status, question.answered)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">{question.content}</p>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(question.timestamp))}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-red-500 border-red-200 hover:bg-red-50"
                        onClick={() => handleReject(question)}
                      >
                        <XCircle className="h-4 w-4 mr-1" /> Rejeter
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-green-500 border-green-200 hover:bg-green-50"
                        onClick={() => handleApprove(question)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Approuver
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/50">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Aucune question en attente pour le moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Questions approuvées */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Questions approuvées ({approvedQuestions.length})
          </h2>
          
          {approvedQuestions.length > 0 ? (
            <div className="grid gap-4">
              {approvedQuestions.map(question => (
                <Card key={question.id} className={`${question.answered ? 'border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10' : 'border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-900/10'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{question.username}</div>
                      {getStatusBadge(question.status, question.answered)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">{question.content}</p>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(question.timestamp))}
                    </div>
                    <div className="flex space-x-2">
                      {!question.answered && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 text-primary"
                          onClick={() => handleAnswerClick(question)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" /> Répondre
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/50">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Aucune question approuvée pour le moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Questions rejetées */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-500" />
            Questions rejetées ({rejectedQuestions.length})
          </h2>
          
          {rejectedQuestions.length > 0 ? (
            <div className="grid gap-4">
              {rejectedQuestions.map(question => (
                <Card key={question.id} className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{question.username}</div>
                      {getStatusBadge(question.status, question.answered)}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">{question.content}</p>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(question.timestamp))}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-muted/50">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Aucune question rejetée pour le moment.</p>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Dialog pour répondre à une question */}
        <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Répondre à la question</DialogTitle>
              <DialogDescription>
                La réponse sera publiée comme une mise à jour dans le suivi en direct.
              </DialogDescription>
            </DialogHeader>
            
            {selectedQuestion && (
              <div className="bg-muted/50 p-3 rounded-md my-4">
                <div className="font-medium text-sm">{selectedQuestion.username} a demandé:</div>
                <p className="text-sm mt-1">{selectedQuestion.content}</p>
              </div>
            )}
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="answer">Votre réponse</Label>
                <Textarea
                  id="answer"
                  placeholder="Écrivez votre réponse ici..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="important"
                  checked={isImportant}
                  onCheckedChange={setIsImportant}
                />
                <Label htmlFor="important">Marquer comme mise à jour importante</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAnswerDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitAnswer}
                disabled={!answerContent.trim() || answerQuestionMutation.isPending}
              >
                {answerQuestionMutation.isPending ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-r-transparent rounded-full"></span>
                    Publication...
                  </>
                ) : "Publier la réponse"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}