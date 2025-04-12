import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo, Heading1, Heading2, Heading3, Minus, Image as ImageIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator as UISeparator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ContentEditorProps {
  initialContent?: {
    id?: number;
    title: string;
    slug: string;
    description: string;
    content: string;
    summary?: string;
    imageUrl?: string;
  };
  topicId: number;
  onSave: (content: { 
    id?: number; 
    title: string; 
    slug: string; 
    description: string; 
    content: string; 
    summary: string;
    imageUrl: string;
    topicId: number;
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ 
  initialContent, 
  topicId, 
  onSave, 
  onCancel, 
  isSaving 
}) => {
  const { toast } = useToast();
  const [title, setTitle] = useState(initialContent?.title || '');
  const [slug, setSlug] = useState(initialContent?.slug || '');
  const [description, setDescription] = useState(initialContent?.description || '');
  const [summary, setSummary] = useState(initialContent?.summary || '');
  const [imageUrl, setImageUrl] = useState(initialContent?.imageUrl || 'https://placehold.co/600x400/3b82f6/white?text=Contenu+%C3%A9ducatif');
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [isAutoSlug, setIsAutoSlug] = useState(!initialContent?.slug);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2',
        },
      }),
    ],
    content: initialContent?.content || '<p>Commencez à rédiger ici...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-blue focus:outline-none min-h-[300px] p-4 w-full break-words',
        style: 'width: 100%; max-width: 100%; white-space: pre-wrap; word-break: break-word; overflow-wrap: break-word;',
      },
    },
  });

  useEffect(() => {
    if (isAutoSlug && title) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(newSlug);
    }
  }, [title, isAutoSlug]);

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Titre requis",
        description: "Veuillez entrer un titre pour ce contenu éducatif.",
        variant: "destructive",
      });
      return;
    }

    if (!slug.trim()) {
      toast({
        title: "Slug requis",
        description: "Veuillez entrer un slug pour ce contenu éducatif.",
        variant: "destructive",
      });
      return;
    }

    if (!summary.trim()) {
      toast({
        title: "Résumé requis",
        description: "Veuillez entrer un résumé pour ce contenu éducatif.",
        variant: "destructive",
      });
      return;
    }

    if (!imageUrl.trim()) {
      toast({
        title: "URL d'image requise",
        description: "Veuillez entrer une URL d'image pour ce contenu éducatif.",
        variant: "destructive",
      });
      return;
    }

    if (!editor?.getHTML() || editor?.getHTML() === '<p></p>') {
      toast({
        title: "Contenu requis",
        description: "Veuillez ajouter du contenu à cet article éducatif.",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: initialContent?.id,
      title,
      slug,
      description,
      content: editor?.getHTML() || '',
      summary,
      imageUrl,
      topicId,
    });
  };

  const handleAddLink = () => {
    const url = window.prompt('URL:');
    if (url && editor) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };
  
  const handleAddImage = () => {
    const url = window.prompt('URL de l\'image:');
    if (url && editor) {
      // Insérer l'image avec un meilleur style et une figure complète
      editor.chain().focus().insertContent(`
        <figure class="my-6 text-center">
          <img src="${url}" alt="Image insérée" class="mx-auto max-w-full h-auto rounded-lg shadow-md" style="max-height: 400px; object-fit: contain;" />
          <figcaption class="text-sm text-gray-600 mt-2">
            ${window.prompt('Légende de l\'image (optionnel):') || ''}
          </figcaption>
        </figure>
      `).run();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du contenu"
              className="mt-1"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Slug</Label>
              <Toggle
                pressed={isAutoSlug}
                onPressedChange={setIsAutoSlug}
                size="sm"
                className="ml-2"
                aria-label="Auto-générer le slug"
              >
                Auto
              </Toggle>
            </div>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setIsAutoSlug(false);
                setSlug(e.target.value);
              }}
              placeholder="slug-du-contenu"
              className="mt-1"
              disabled={isAutoSlug}
            />
          </div>
        </div>
        <div className="mt-4">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brève description du contenu"
            className="mt-1"
            rows={3}
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="summary">Résumé</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Résumé court et accrocheur du contenu"
            className="mt-1"
            rows={2}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Ce résumé sera affiché dans les cartes et les aperçus (obligatoire).
          </p>
        </div>
        <div className="mt-4">
          <Label htmlFor="imageUrl">URL de l'image</Label>
          <Input
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            URL d'une image représentant ce contenu (obligatoire).
          </p>
        </div>
      </Card>

      <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-2">
          <TabsTrigger value="editor">Éditeur</TabsTrigger>
          <TabsTrigger value="preview">Aperçu</TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <Card className="p-2 w-full">
            <div className="flex flex-wrap gap-1 p-1 border-b w-full">
              <Toggle
                pressed={editor?.isActive('heading', { level: 1 })}
                onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                aria-label="Titre 1"
              >
                <Heading1 className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={editor?.isActive('heading', { level: 2 })}
                onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                aria-label="Titre 2"
              >
                <Heading2 className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={editor?.isActive('heading', { level: 3 })}
                onPressedChange={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                aria-label="Titre 3"
              >
                <Heading3 className="h-4 w-4" />
              </Toggle>

              <UISeparator orientation="vertical" className="mx-1 h-6" />

              <Toggle
                pressed={editor?.isActive('bold')}
                onPressedChange={() => editor?.chain().focus().toggleBold().run()}
                aria-label="Gras"
              >
                <Bold className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={editor?.isActive('italic')}
                onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
                aria-label="Italique"
              >
                <Italic className="h-4 w-4" />
              </Toggle>

              <UISeparator orientation="vertical" className="mx-1 h-6" />

              <Toggle
                pressed={editor?.isActive('bulletList')}
                onPressedChange={() => editor?.chain().focus().toggleBulletList().run()}
                aria-label="Liste à puces"
              >
                <List className="h-4 w-4" />
              </Toggle>
              <Toggle
                pressed={editor?.isActive('orderedList')}
                onPressedChange={() => editor?.chain().focus().toggleOrderedList().run()}
                aria-label="Liste numérotée"
              >
                <ListOrdered className="h-4 w-4" />
              </Toggle>

              <UISeparator orientation="vertical" className="mx-1 h-6" />

              <Toggle
                pressed={editor?.isActive('link')}
                onPressedChange={handleAddLink}
                aria-label="Ajouter un lien"
              >
                <LinkIcon className="h-4 w-4" />
              </Toggle>
              
              <Toggle
                onPressedChange={handleAddImage}
                aria-label="Insérer une image"
              >
                <ImageIcon className="h-4 w-4" />
              </Toggle>

              <UISeparator orientation="vertical" className="mx-1 h-6" />

              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor?.can().undo()}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor?.can().redo()}
              >
                <Redo className="h-4 w-4" />
              </Button>

              <UISeparator orientation="vertical" className="mx-1 h-6" />

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => editor?.chain().focus().setHorizontalRule().run()}
              >
                <Minus className="h-4 w-4 mr-1" />
                Séparateur
              </Button>
            </div>
            <EditorContent 
              editor={editor} 
              className="min-h-[400px] w-full px-4 py-3"
              style={{ 
                width: '100%', 
                maxWidth: '100%', 
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card className="p-6">
            <div className="prose prose-blue max-w-none">
              <h1>{title || "Sans titre"}</h1>
              {description && <p className="text-muted-foreground italic">{description}</p>}
              <hr className="my-4" />
              <div dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '' }} />
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Annuler
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
};

export default ContentEditor;