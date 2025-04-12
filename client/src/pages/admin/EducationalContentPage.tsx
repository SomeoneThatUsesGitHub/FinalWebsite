import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Pencil, Trash, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import ContentEditor from '@/components/admin/ContentEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface EducationalTopic {
  id: number;
  title: string;  // Changé de 'name' à 'title' pour correspondre au schéma
  slug: string;
  description: string;
  imageUrl: string; // Ajouté car c'est un champ obligatoire
  color: string;
  icon?: string;    // Optionnel
  contentCount?: number;
}

interface EducationalContent {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  topicId: number;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_TOPIC_COLOR = '#3b82f6';

const EducationalContentPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [topicFormOpen, setTopicFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteContentDialogOpen, setDeleteContentDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<number | null>(null);
  const [contentToDelete, setContentToDelete] = useState<number | null>(null);

  // État du formulaire de sujet
  const [topicTitle, setTopicTitle] = useState('');
  const [topicSlug, setTopicSlug] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicColor, setTopicColor] = useState(DEFAULT_TOPIC_COLOR);
  const [topicImageUrl, setTopicImageUrl] = useState('https://placehold.co/600x400/3b82f6/white?text=Sujet+%C3%A9ducatif');

  // Requêtes
  const { data: topics, isLoading: isLoadingTopics } = useQuery<EducationalTopic[]>({
    queryKey: ['/api/educational-topics'],
  });

  const { data: contents, isLoading: isLoadingContents } = useQuery<EducationalContent[]>({
    queryKey: ['/api/educational-content', { topicId: selectedTopicId }],
    enabled: !!selectedTopicId,
  });

  // Mutations
  const createTopicMutation = useMutation({
    mutationFn: async (topic: Omit<EducationalTopic, 'id' | 'contentCount'>) => {
      const res = await apiRequest('POST', '/api/educational-topics', topic);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-topics'] });
      setTopicFormOpen(false);
      resetTopicForm();
      toast({
        title: 'Sujet créé',
        description: 'Le sujet a été créé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la création du sujet: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateTopicMutation = useMutation({
    mutationFn: async ({ id, ...topic }: EducationalTopic) => {
      const res = await apiRequest('PUT', `/api/educational-topics/${id}`, topic);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-topics'] });
      setTopicFormOpen(false);
      resetTopicForm();
      toast({
        title: 'Sujet mis à jour',
        description: 'Le sujet a été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la mise à jour du sujet: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/educational-topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-topics'] });
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
      if (selectedTopicId === topicToDelete) {
        setSelectedTopicId(null);
      }
      toast({
        title: 'Sujet supprimé',
        description: 'Le sujet et tous ses contenus associés ont été supprimés.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la suppression du sujet: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (content: { 
      title: string; 
      slug: string; 
      description: string; 
      content: string; 
      topicId: number;
    }) => {
      const res = await apiRequest('POST', '/api/educational-content', content);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/educational-content', { topicId: selectedTopicId }] 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/educational-topics'] });
      setIsAddingContent(false);
      toast({
        title: 'Contenu créé',
        description: 'Le contenu a été créé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la création du contenu: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async (content: { 
      id: number; 
      title: string; 
      slug: string; 
      description: string; 
      content: string; 
      topicId: number;
    }) => {
      const { id, ...contentData } = content;
      const res = await apiRequest('PUT', `/api/educational-content/${id}`, contentData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/educational-content', { topicId: selectedTopicId }] 
      });
      setEditingContentId(null);
      toast({
        title: 'Contenu mis à jour',
        description: 'Le contenu a été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la mise à jour du contenu: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/educational-content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/educational-content', { topicId: selectedTopicId }]
      });
      queryClient.invalidateQueries({ queryKey: ['/api/educational-topics'] });
      setDeleteContentDialogOpen(false);
      setContentToDelete(null);
      toast({
        title: 'Contenu supprimé',
        description: 'Le contenu a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la suppression du contenu: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handlers
  const handleCreateTopic = () => {
    if (!topicTitle.trim()) {
      toast({
        title: 'Titre requis',
        description: 'Veuillez entrer un titre pour ce sujet.',
        variant: 'destructive',
      });
      return;
    }

    if (!topicSlug.trim()) {
      toast({
        title: 'Slug requis',
        description: 'Veuillez entrer un slug pour ce sujet.',
        variant: 'destructive',
      });
      return;
    }

    const topic = {
      title: topicTitle,
      slug: topicSlug,
      description: topicDescription,
      color: topicColor,
      imageUrl: topicImageUrl,
    };

    if (editingTopicId) {
      updateTopicMutation.mutate({ ...topic, id: editingTopicId, contentCount: 0 });
    } else {
      createTopicMutation.mutate(topic);
    }
  };

  const handleEditTopic = (topic: EducationalTopic) => {
    setEditingTopicId(topic.id);
    setTopicTitle(topic.title);
    setTopicSlug(topic.slug);
    setTopicDescription(topic.description);
    setTopicColor(topic.color || DEFAULT_TOPIC_COLOR);
    setTopicImageUrl(topic.imageUrl);
    setTopicFormOpen(true);
  };

  const handleDeleteTopic = (id: number) => {
    setTopicToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteContent = (id: number) => {
    setContentToDelete(id);
    setDeleteContentDialogOpen(true);
  };

  const resetTopicForm = () => {
    setTopicTitle('');
    setTopicSlug('');
    setTopicDescription('');
    setTopicColor(DEFAULT_TOPIC_COLOR);
    setTopicImageUrl('https://placehold.co/600x400/3b82f6/white?text=Sujet+%C3%A9ducatif');
    setEditingTopicId(null);
  };

  const handleSaveContent = (content: { 
    id?: number; 
    title: string; 
    slug: string; 
    description: string; 
    content: string; 
    topicId: number;
  }) => {
    if (content.id) {
      updateContentMutation.mutate({
        id: content.id,
        title: content.title,
        slug: content.slug,
        description: content.description,
        content: content.content,
        topicId: content.topicId
      });
    } else {
      createContentMutation.mutate({
        title: content.title,
        slug: content.slug,
        description: content.description,
        content: content.content,
        topicId: content.topicId
      });
    }
  };

  // Génération automatique de slug basé sur le nom
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  return (
    <AdminLayout title="Contenu éducatif">
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="topics">Sujets</TabsTrigger>
          {selectedTopicId && (
            <TabsTrigger value="content">Contenu</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="topics" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-medium">Liste des sujets éducatifs</h2>
            <Dialog open={topicFormOpen} onOpenChange={setTopicFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  resetTopicForm();
                  setTopicFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau sujet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingTopicId ? 'Modifier le sujet' : 'Créer un nouveau sujet'}</DialogTitle>
                  <DialogDescription>
                    Les sujets organisent votre contenu éducatif en catégories thématiques.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="topicTitle">Titre du sujet</Label>
                    <Input
                      id="topicTitle"
                      value={topicTitle}
                      onChange={(e) => {
                        setTopicTitle(e.target.value);
                        if (!editingTopicId) {
                          setTopicSlug(generateSlug(e.target.value));
                        }
                      }}
                      placeholder="ex: Élections présidentielles"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicSlug">Slug (pour l'URL)</Label>
                    <Input
                      id="topicSlug"
                      value={topicSlug}
                      onChange={(e) => setTopicSlug(e.target.value)}
                      placeholder="ex: elections-presidentielles"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicDescription">Description</Label>
                    <Textarea
                      id="topicDescription"
                      value={topicDescription}
                      onChange={(e) => setTopicDescription(e.target.value)}
                      placeholder="Décrivez ce sujet en quelques mots..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicColor">Couleur (optionnel)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="topicColor"
                        type="color"
                        value={topicColor}
                        onChange={(e) => setTopicColor(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={topicColor}
                        onChange={(e) => setTopicColor(e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topicImageUrl">URL de l'image</Label>
                    <Input
                      id="topicImageUrl"
                      value={topicImageUrl}
                      onChange={(e) => setTopicImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <p className="text-xs text-muted-foreground">
                      URL d'une image représentant ce sujet (obligatoire)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTopicFormOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleCreateTopic} disabled={createTopicMutation.isPending || updateTopicMutation.isPending}>
                    {createTopicMutation.isPending || updateTopicMutation.isPending
                      ? 'Enregistrement...'
                      : editingTopicId
                        ? 'Mettre à jour'
                        : 'Créer'
                    }
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {isLoadingTopics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="relative">
                  <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-16 w-full" />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-10 w-20" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : topics && topics.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <Card key={topic.id} className="relative">
                  <div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: topic.color || DEFAULT_TOPIC_COLOR }}
                  />
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="line-clamp-1">{topic.title}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTopic(topic)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => handleDeleteTopic(topic.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardTitle>
                    <CardDescription>
                      {topic.contentCount || 0} ressource{topic.contentCount !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{topic.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setSelectedTopicId(topic.id)}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Voir le contenu
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedTopicId(topic.id);
                        setIsAddingContent(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Aucun sujet trouvé</CardTitle>
                <CardDescription>
                  Créez un nouveau sujet pour commencer à organiser votre contenu éducatif.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground mb-4">
                  Les sujets vous permettent d'organiser votre contenu éducatif en catégories thématiques.
                </p>
                <Button onClick={() => {
                  resetTopicForm();
                  setTopicFormOpen(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le premier sujet
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {selectedTopicId && (
          <TabsContent value="content" className="space-y-4">
            {isAddingContent || editingContentId ? (
              <>
                <div className="flex items-center mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsAddingContent(false);
                      setEditingContentId(null);
                    }}
                    className="mr-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <h2 className="text-xl font-medium">
                    {editingContentId ? 'Modifier le contenu' : 'Créer un nouveau contenu'}
                  </h2>
                </div>
                <ContentEditor
                  topicId={selectedTopicId}
                  initialContent={
                    editingContentId && contents
                      ? contents.find((c) => c.id === editingContentId)
                      : undefined
                  }
                  onSave={handleSaveContent}
                  onCancel={() => {
                    setIsAddingContent(false);
                    setEditingContentId(null);
                  }}
                  isSaving={createContentMutation.isPending || updateContentMutation.isPending}
                />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedTopicId(null)}
                      className="mr-4"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Retour aux sujets
                    </Button>
                    <h2 className="text-xl font-medium">
                      Contenu pour{' '}
                      <span className="text-primary">
                        {topics?.find((t) => t.id === selectedTopicId)?.title}
                      </span>
                    </h2>
                  </div>
                  <Button onClick={() => setIsAddingContent(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau contenu
                  </Button>
                </div>

                {isLoadingContents ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Card key={i}>
                        <CardHeader>
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent>
                          <Skeleton className="h-16 w-full" />
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                          <Skeleton className="h-10 w-24" />
                          <Skeleton className="h-10 w-24" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : contents && contents.length > 0 ? (
                  <div className="space-y-4">
                    {contents.map((content) => (
                      <Card key={content.id}>
                        <CardHeader>
                          <CardTitle className="flex justify-between items-center">
                            <span>{content.title}</span>
                            <span className="text-xs text-muted-foreground">
                              Mis à jour le {new Date(content.updatedAt).toLocaleDateString('fr-FR')}
                            </span>
                          </CardTitle>
                          <CardDescription>
                            {`/${topics?.find((t) => t.id === selectedTopicId)?.slug}/${content.slug}`}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {content.description}
                          </p>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => handleDeleteContent(content.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Supprimer
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setEditingContentId(content.id)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Aucun contenu trouvé</CardTitle>
                      <CardDescription>
                        Ce sujet ne contient pas encore de contenu éducatif.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground mb-4">
                        Ajoutez du contenu à ce sujet pour enrichir votre section éducative.
                      </p>
                      <Button onClick={() => setIsAddingContent(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Créer le premier contenu
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Dialog de confirmation pour la suppression d'un sujet */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce sujet ? Cette action supprimera également tout le contenu associé à ce sujet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => topicToDelete && deleteTopicMutation.mutate(topicToDelete)}
              disabled={deleteTopicMutation.isPending}
            >
              {deleteTopicMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation pour la suppression d'un contenu */}
      <Dialog open={deleteContentDialogOpen} onOpenChange={setDeleteContentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteContentDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => contentToDelete && deleteContentMutation.mutate(contentToDelete)}
              disabled={deleteContentMutation.isPending}
            >
              {deleteContentMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default EducationalContentPage;