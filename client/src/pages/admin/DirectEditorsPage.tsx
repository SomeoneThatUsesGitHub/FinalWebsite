import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { LiveCoverage, LiveCoverageEditor, User } from "@shared/schema";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, Loader2, Plus, Trash2, User as UserIcon } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function DirectEditorsPage() {
  const params = useParams();
  const id = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAddEditorDialogOpen, setIsAddEditorDialogOpen] = useState(false);
  const [selectedEditorId, setSelectedEditorId] = useState<number | null>(null);
  const [editorRole, setEditorRole] = useState("");

  // Récupérer les détails du suivi en direct
  const { data: direct, isLoading: isLoadingDirect } = useQuery<LiveCoverage>({
    queryKey: [`/api/admin/live-coverages/${id}`],
    enabled: !isNaN(id),
  });

  // Récupérer les éditeurs assignés à ce suivi
  const { data: editors, isLoading: isLoadingEditors } = useQuery<(LiveCoverageEditor & { 
    editor?: { displayName: string, title: string | null, avatarUrl: string | null } 
  })[]>({
    queryKey: [`/api/live-coverages/${id}/editors`],
    enabled: !isNaN(id),
  });

  // Récupérer tous les utilisateurs pour le dropdown d'ajout d'éditeur
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Mutation pour ajouter un éditeur
  const addEditorMutation = useMutation({
    mutationFn: async (data: { editorId: number, role?: string }) => {
      const response = await fetch(`/api/admin/live-coverages/${id}/editors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          editorId: data.editorId,
          role: data.role || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'ajout de l'éditeur");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/live-coverages/${id}/editors`] });
      toast({
        title: "Éditeur ajouté",
        description: "L'éditeur a été ajouté au suivi en direct avec succès",
      });
      setIsAddEditorDialogOpen(false);
      setSelectedEditorId(null);
      setEditorRole("");
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation pour supprimer un éditeur
  const removeEditorMutation = useMutation({
    mutationFn: async (editorId: number) => {
      const response = await fetch(`/api/admin/live-coverages/${id}/editors/${editorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de la suppression de l'éditeur");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/live-coverages/${id}/editors`] });
      toast({
        title: "Éditeur retiré",
        description: "L'éditeur a été retiré du suivi en direct avec succès",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddEditor = () => {
    if (selectedEditorId) {
      addEditorMutation.mutate({
        editorId: selectedEditorId,
        role: editorRole || undefined,
      });
    }
  };

  // Filtrer les utilisateurs qui ne sont pas déjà des éditeurs de ce suivi
  const availableUsers = users?.filter(user => 
    !editors?.some(editor => editor.editorId === user.id)
  ) || [];

  const isLoading = isLoadingDirect || isLoadingEditors;

  return (
    <AdminLayout title={`Éditeurs du suivi en direct${direct ? ` : ${direct.title}` : ''}`}>
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate("/admin/directs")}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux suivis en direct
      </Button>

      {isLoading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !direct ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">Suivi en direct non trouvé</h3>
              <p className="text-muted-foreground mt-2">
                Le suivi en direct que vous recherchez n'existe pas ou a été supprimé.
              </p>
              <Button 
                className="mt-4"
                onClick={() => navigate("/admin/directs")}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux suivis en direct
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Détails du suivi</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Titre</dt>
                  <dd className="mt-1">{direct.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Sujet</dt>
                  <dd className="mt-1">{direct.subject}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Statut</dt>
                  <dd className="mt-1">
                    <Badge variant={direct.active ? "default" : "outline"}>
                      {direct.active ? "Actif" : "Inactif"}
                    </Badge>
                    <span className="text-sm text-muted-foreground ml-2">
                      URL publique : <a href={`/suivis-en-direct/${direct.slug}`} target="_blank" className="text-primary underline underline-offset-4">/suivis-en-direct/{direct.slug}</a>
                    </span>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Équipe éditoriale</h3>
            <Button 
              onClick={() => setIsAddEditorDialogOpen(true)}
              disabled={isLoadingUsers || availableUsers.length === 0}
            >
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un éditeur
            </Button>
          </div>

          {editors && editors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {editors.map((editor) => (
                <Card key={editor.id} className="flex">
                  <CardContent className="pt-6 flex-1">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        {editor.editor?.avatarUrl ? (
                          <AvatarImage src={editor.editor.avatarUrl} alt={editor.editor.displayName} />
                        ) : (
                          <AvatarFallback>
                            <UserIcon className="h-5 w-5" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{editor.editor?.displayName || `Éditeur #${editor.editorId}`}</h4>
                        {editor.editor?.title && (
                          <p className="text-sm text-muted-foreground">{editor.editor.title}</p>
                        )}
                        {editor.role && (
                          <Badge variant="outline" className="mt-2">
                            {editor.role}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeEditorMutation.mutate(editor.editorId)}
                        disabled={removeEditorMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <UserIcon className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucun éditeur assigné</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  Ajoutez des éditeurs pour permettre à d'autres membres de l'équipe de publier des mises à jour sur ce suivi en direct.
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsAddEditorDialogOpen(true)}
                  disabled={isLoadingUsers || availableUsers.length === 0}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un éditeur
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Dialogue pour ajouter un éditeur */}
          <Dialog open={isAddEditorDialogOpen} onOpenChange={setIsAddEditorDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un éditeur</DialogTitle>
                <DialogDescription>
                  Sélectionnez un utilisateur et assignez-lui un rôle optionnel pour ce suivi en direct.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="editor-select">Utilisateur</Label>
                  <Select
                    value={selectedEditorId?.toString() || ""}
                    onValueChange={(value) => setSelectedEditorId(parseInt(value))}
                  >
                    <SelectTrigger id="editor-select">
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingUsers ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : availableUsers.length === 0 ? (
                        <div className="text-center py-2 text-sm text-muted-foreground">
                          Tous les utilisateurs sont déjà assignés
                        </div>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.displayName} ({user.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role-input">Rôle (optionnel)</Label>
                  <Select
                    value={editorRole}
                    onValueChange={setEditorRole}
                  >
                    <SelectTrigger id="role-input">
                      <SelectValue placeholder="Sélectionner un rôle (optionnel)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Aucun rôle spécifique</SelectItem>
                      <SelectItem value="Coordinateur">Coordinateur</SelectItem>
                      <SelectItem value="Reporter">Reporter</SelectItem>
                      <SelectItem value="Analyste">Analyste</SelectItem>
                      <SelectItem value="Fact-checker">Fact-checker</SelectItem>
                      <SelectItem value="Expert thématique">Expert thématique</SelectItem>
                      <SelectItem value="Rédacteur en chef">Rédacteur en chef</SelectItem>
                      <SelectItem value="Journaliste">Journaliste</SelectItem>
                      <SelectItem value="Photographe">Photographe</SelectItem>
                      <SelectItem value="Vidéaste">Vidéaste</SelectItem>
                      <SelectItem value="Responsable réseaux sociaux">Responsable réseaux sociaux</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddEditorDialogOpen(false)}
                  disabled={addEditorMutation.isPending}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleAddEditor}
                  disabled={!selectedEditorId || addEditorMutation.isPending}
                >
                  {addEditorMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>Ajouter</>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </AdminLayout>
  );
}