import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Pencil, Plus, Trash2, Eye, BookOpen, FolderPlus, GraduationCap } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ContentEditor from '@/components/admin/ContentEditor';

type EducationalTopic = {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  icon: string | null;
  color: string;
  order: number;
};

type EducationalContent = {
  id: number;
  title: string;
  slug: string;
  content: string;
  summary: string;
  imageUrl: string;
  topicId: number;
  authorId: number | null;
  published: boolean;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
};

const createTopicSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  description: z.string().min(1, "La description est requise"),
  imageUrl: z.string().min(1, "L'URL de l'image est requise"),
  icon: z.string().nullable().optional(),
  color: z.string().min(1, "La couleur est requise"),
  order: z.coerce.number().int().min(0, "L'ordre doit être un nombre positif")
});

const createContentSchema = z.object({
  title: z.string().min(1, "Le titre est requis"),
  slug: z.string().min(1, "Le slug est requis"),
  summary: z.string().min(1, "Le résumé est requis"),
  content: z.string().min(1, "Le contenu est requis"),
  imageUrl: z.string().min(1, "L'URL de l'image est requise"),
  topicId: z.coerce.number().int().min(1, "Un sujet doit être sélectionné"),
  published: z.boolean().default(false)
});

type CreateTopicFormData = z.infer<typeof createTopicSchema>;
type CreateContentFormData = z.infer<typeof createContentSchema>;

const EducationalContentPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('topics');
  const [isCreateTopicDialogOpen, setIsCreateTopicDialogOpen] = useState(false);
  const [isCreateContentDialogOpen, setIsCreateContentDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<EducationalTopic | null>(null);
  const [selectedContent, setSelectedContent] = useState<EducationalContent | null>(null);
  const [editorContent, setEditorContent] = useState('');

  const { data: topics, isLoading: isTopicsLoading } = useQuery<EducationalTopic[]>({
    queryKey: ['/api/educational-topics'],
  });

  const { data: contents, isLoading: isContentsLoading } = useQuery<EducationalContent[]>({
    queryKey: ['/api/educational-content'],
  });

  // Form pour la création/modification d'un sujet
  const topicForm = useForm<CreateTopicFormData>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      imageUrl: '',
      icon: 'BookOpen',
      color: '#3B82F6',
      order: 0
    }
  });

  // Form pour la création/modification d'un contenu
  const contentForm = useForm<CreateContentFormData>({
    resolver: zodResolver(createContentSchema),
    defaultValues: {
      title: '',
      slug: '',
      summary: '',
      content: '',
      imageUrl: '',
      topicId: 0,
      published: false
    }
  });

  // Lorsqu'un sujet est sélectionné pour modification
  useEffect(() => {
    if (selectedTopic) {
      topicForm.reset({
        title: selectedTopic.title,
        slug: selectedTopic.slug,
        description: selectedTopic.description,
        imageUrl: selectedTopic.imageUrl,
        icon: selectedTopic.icon || 'BookOpen',
        color: selectedTopic.color,
        order: selectedTopic.order
      });
    }
  }, [selectedTopic, topicForm]);

  // Lorsqu'un contenu est sélectionné pour modification
  useEffect(() => {
    if (selectedContent) {
      contentForm.reset({
        title: selectedContent.title,
        slug: selectedContent.slug,
        summary: selectedContent.summary,
        content: selectedContent.content,
        imageUrl: selectedContent.imageUrl,
        topicId: selectedContent.topicId,
        published: selectedContent.published
      });
      setEditorContent(selectedContent.content);
    }
  }, [selectedContent, contentForm]);

  // Mise à jour du contenu de l'éditeur dans le formulaire
  useEffect(() => {
    contentForm.setValue('content', editorContent);
  }, [editorContent, contentForm]);

  // Fonction pour générer un slug à partir du titre
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[ùûü]/g, 'u')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Mutations pour les sujets
  const createTopicMutation = useMutation({
    mutationFn: async (data: CreateTopicFormData) => {
      const response = await apiRequest('POST', '/api/educational-topics', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-topics'] });
      topicForm.reset();
      setIsCreateTopicDialogOpen(false);
      toast({
        title: 'Sujet créé',
        description: 'Le sujet a été créé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const updateTopicMutation = useMutation({
    mutationFn: async (data: CreateTopicFormData & { id: number }) => {
      const { id, ...topicData } = data;
      const response = await apiRequest('PUT', `/api/educational-topics/${id}`, topicData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-topics'] });
      topicForm.reset();
      setSelectedTopic(null);
      setIsCreateTopicDialogOpen(false);
      toast({
        title: 'Sujet mis à jour',
        description: 'Le sujet a été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/educational-topics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-topics'] });
      toast({
        title: 'Sujet supprimé',
        description: 'Le sujet a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutations pour les contenus
  const createContentMutation = useMutation({
    mutationFn: async (data: CreateContentFormData) => {
      const response = await apiRequest('POST', '/api/educational-content', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-content'] });
      contentForm.reset();
      setEditorContent('');
      setIsCreateContentDialogOpen(false);
      toast({
        title: 'Contenu créé',
        description: 'Le contenu a été créé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const updateContentMutation = useMutation({
    mutationFn: async (data: CreateContentFormData & { id: number }) => {
      const { id, ...contentData } = data;
      const response = await apiRequest('PUT', `/api/educational-content/${id}`, contentData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-content'] });
      contentForm.reset();
      setEditorContent('');
      setSelectedContent(null);
      setIsCreateContentDialogOpen(false);
      toast({
        title: 'Contenu mis à jour',
        description: 'Le contenu a été mis à jour avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/educational-content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-content'] });
      toast({
        title: 'Contenu supprimé',
        description: 'Le contenu a été supprimé avec succès.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erreur',
        description: `Une erreur est survenue: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Gestion de la soumission du formulaire de sujet
  const handleTopicSubmit = (data: CreateTopicFormData) => {
    if (selectedTopic) {
      updateTopicMutation.mutate({ ...data, id: selectedTopic.id });
    } else {
      createTopicMutation.mutate(data);
    }
  };

  // Gestion de la soumission du formulaire de contenu
  const handleContentSubmit = (data: CreateContentFormData) => {
    if (selectedContent) {
      updateContentMutation.mutate({ ...data, id: selectedContent.id });
    } else {
      createContentMutation.mutate(data);
    }
  };

  // Ouverture du formulaire de création de sujet
  const openCreateTopicDialog = () => {
    setSelectedTopic(null);
    topicForm.reset({
      title: '',
      slug: '',
      description: '',
      imageUrl: '',
      icon: 'BookOpen',
      color: '#3B82F6',
      order: topics?.length || 0
    });
    setIsCreateTopicDialogOpen(true);
  };

  // Ouverture du formulaire de création de contenu
  const openCreateContentDialog = () => {
    setSelectedContent(null);
    contentForm.reset({
      title: '',
      slug: '',
      summary: '',
      content: '',
      imageUrl: '',
      topicId: 0,
      published: false
    });
    setEditorContent('');
    setIsCreateContentDialogOpen(true);
  };

  // Ouverture du formulaire de modification de sujet
  const openEditTopicDialog = (topic: EducationalTopic) => {
    setSelectedTopic(topic);
    setIsCreateTopicDialogOpen(true);
  };

  // Ouverture du formulaire de modification de contenu
  const openEditContentDialog = (content: EducationalContent) => {
    setSelectedContent(content);
    setEditorContent(content.content);
    setIsCreateContentDialogOpen(true);
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Gérer le contenu éducatif | Admin | Politiquensemble</title>
      </Helmet>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestion du contenu éducatif</h1>
        <p className="text-muted-foreground">Gérez les sujets et contenus de la section "Apprendre".</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Sujets
            </TabsTrigger>
            <TabsTrigger value="contents" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Contenus
            </TabsTrigger>
          </TabsList>

          <div>
            {activeTab === 'topics' ? (
              <Button onClick={openCreateTopicDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un sujet
              </Button>
            ) : (
              <Button onClick={openCreateContentDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Créer un contenu
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="topics" className="mt-4">
          {isTopicsLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : topics && topics.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics
                .sort((a, b) => a.order - b.order)
                .map((topic) => (
                <Card key={topic.id}>
                  <div 
                    className="w-full h-[120px] bg-cover bg-center"
                    style={{ backgroundImage: `url(${topic.imageUrl})` }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{topic.title}</CardTitle>
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: topic.color }}
                      >
                        <span className="text-xs text-white font-bold">{topic.order}</span>
                      </div>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {topic.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <span className="font-semibold mr-1">Slug:</span> {topic.slug}
                    </div>
                    {topic.icon && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span className="font-semibold mr-1">Icon:</span> {topic.icon}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/apprendre/${topic.slug}`} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" /> Voir
                      </a>
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openEditTopicDialog(topic)}
                      >
                        <Pencil className="h-4 w-4 mr-2" /> Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer ce sujet ?')) {
                            deleteTopicMutation.mutate(topic.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun sujet disponible.</p>
              <Button onClick={openCreateTopicDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Créer un sujet
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contents" className="mt-4">
          {isContentsLoading || isTopicsLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner />
            </div>
          ) : contents && contents.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {contents.map((content) => {
                const topicName = topics?.find(t => t.id === content.topicId)?.title || 'Sujet inconnu';
                
                return (
                  <Card key={content.id} className={content.published ? "" : "border-dashed opacity-70"}>
                    <div 
                      className="w-full h-[120px] bg-cover bg-center"
                      style={{ backgroundImage: `url(${content.imageUrl})` }}
                    />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="truncate">{content.title}</CardTitle>
                        {!content.published && (
                          <div className="px-2 py-1 text-xs bg-muted rounded-md">
                            Brouillon
                          </div>
                        )}
                      </div>
                      <CardDescription className="truncate">
                        {topicName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="line-clamp-2 text-sm mb-2">
                        {content.summary}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Eye className="h-3 w-3 mr-1" /> {content.views} vues
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button size="sm" variant="outline" asChild>
                        <a 
                          href={`/apprendre/${topics?.find(t => t.id === content.topicId)?.slug}/${content.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Eye className="h-4 w-4 mr-2" /> Voir
                        </a>
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditContentDialog(content)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
                              deleteContentMutation.mutate(content.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun contenu disponible.</p>
              <Button onClick={openCreateContentDialog} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Créer un contenu
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog pour créer/modifier un sujet */}
      <Dialog open={isCreateTopicDialogOpen} onOpenChange={setIsCreateTopicDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedTopic ? `Modifier le sujet: ${selectedTopic.title}` : 'Créer un nouveau sujet'}
            </DialogTitle>
            <DialogDescription>
              Les sujets sont les catégories principales du contenu éducatif.
            </DialogDescription>
          </DialogHeader>

          <Form {...topicForm}>
            <form onSubmit={topicForm.handleSubmit(handleTopicSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={topicForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Titre du sujet" 
                          onChange={(e) => {
                            field.onChange(e);
                            if (!selectedTopic) {
                              topicForm.setValue('slug', generateSlug(e.target.value));
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={topicForm.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="slug-du-sujet" />
                      </FormControl>
                      <FormDescription>
                        Identifiant unique pour l'URL (sans espaces ni caractères spéciaux)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={topicForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Description du sujet" 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={topicForm.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de l'image</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/image.jpg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={topicForm.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icône</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une icône" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BookOpen">Book Open</SelectItem>
                          <SelectItem value="GraduationCap">Graduation Cap</SelectItem>
                          <SelectItem value="Layers">Layers</SelectItem>
                          <SelectItem value="History">History</SelectItem>
                          <SelectItem value="LineChart">Line Chart</SelectItem>
                          <SelectItem value="ScrollText">Scroll Text</SelectItem>
                          <SelectItem value="PenTool">Pen Tool</SelectItem>
                          <SelectItem value="Award">Award</SelectItem>
                          <SelectItem value="Building">Building</SelectItem>
                          <SelectItem value="Landmark">Landmark</SelectItem>
                          <SelectItem value="User">User</SelectItem>
                          <SelectItem value="Users">Users</SelectItem>
                          <SelectItem value="Flag">Flag</SelectItem>
                          <SelectItem value="Library">Library</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={topicForm.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Input {...field} type="color" className="w-12 h-10 p-1" />
                          <Input 
                            value={field.value} 
                            onChange={field.onChange}
                            className="flex-1 ml-2"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={topicForm.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordre</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" step="1" />
                      </FormControl>
                      <FormDescription>
                        Position d'affichage (0 = premier)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateTopicDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  disabled={topicForm.formState.isSubmitting || createTopicMutation.isPending || updateTopicMutation.isPending}
                >
                  {topicForm.formState.isSubmitting || createTopicMutation.isPending || updateTopicMutation.isPending ? (
                    <LoadingSpinner className="mr-2" />
                  ) : null}
                  {selectedTopic ? 'Mettre à jour' : 'Créer'} le sujet
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog pour créer/modifier un contenu */}
      <Dialog 
        open={isCreateContentDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateContentDialogOpen(false);
            contentForm.reset();
            setEditorContent('');
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedContent ? `Modifier le contenu: ${selectedContent.title}` : 'Créer un nouveau contenu'}
            </DialogTitle>
            <DialogDescription>
              Créez du contenu éducatif pour un sujet spécifique.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            <Form {...contentForm}>
              <form onSubmit={contentForm.handleSubmit(handleContentSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={contentForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Titre du contenu" 
                            onChange={(e) => {
                              field.onChange(e);
                              if (!selectedContent) {
                                contentForm.setValue('slug', generateSlug(e.target.value));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={contentForm.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="slug-du-contenu" />
                        </FormControl>
                        <FormDescription>
                          Identifiant unique pour l'URL
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={contentForm.control}
                  name="topicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sujet</FormLabel>
                      <Select
                        value={field.value ? field.value.toString() : undefined}
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un sujet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {topics?.map((topic) => (
                            <SelectItem key={topic.id} value={topic.id.toString()}>
                              {topic.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contentForm.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Résumé</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Résumé du contenu" 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        Un court résumé qui sera affiché dans les listings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contentForm.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de l'image</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/image.jpg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contentForm.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Publier
                        </FormLabel>
                        <FormDescription>
                          Si activé, le contenu sera visible publiquement
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={contentForm.control}
                  name="content"
                  render={() => (
                    <FormItem>
                      <FormLabel>Contenu</FormLabel>
                      <FormControl>
                        <ContentEditor 
                          content={editorContent}
                          onChange={setEditorContent}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateContentDialogOpen(false);
                      contentForm.reset();
                      setEditorContent('');
                    }}
                  >
                    Annuler
                  </Button>
                  <Button 
                    type="submit"
                    disabled={contentForm.formState.isSubmitting || createContentMutation.isPending || updateContentMutation.isPending}
                  >
                    {contentForm.formState.isSubmitting || createContentMutation.isPending || updateContentMutation.isPending ? (
                      <LoadingSpinner className="mr-2" />
                    ) : null}
                    {selectedContent ? 'Mettre à jour' : 'Créer'} le contenu
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default EducationalContentPage;