import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Undo, Redo, Heading1, Heading2, Heading3, Minus, Image as ImageIcon, Instagram } from 'lucide-react';
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
      const caption = window.prompt('Légende de l\'image (optionnel):') || '';
      
      // Créer un élément DOM pour l'image plutôt que d'insérer du HTML brut
      const figure = document.createElement('figure');
      figure.className = 'my-6 text-center';
      
      const img = document.createElement('img');
      img.src = url;
      img.alt = 'Image insérée';
      img.className = 'mx-auto max-w-full h-auto rounded-lg shadow-md';
      img.style.maxHeight = '400px';
      img.style.objectFit = 'contain';
      
      const figcaption = document.createElement('figcaption');
      figcaption.className = 'text-sm text-gray-600 mt-2';
      figcaption.textContent = caption;
      
      figure.appendChild(img);
      figure.appendChild(figcaption);
      
      // Insérer le nœud DOM dans l'éditeur
      const htmlContent = figure.outerHTML;
      editor.chain().focus().insertContent(htmlContent).run();
    }
  };
  
  const handleAddInstagram = () => {
    const url = window.prompt('URL de la publication Instagram:');
    if (url && editor) {
      // Extrait l'ID de la publication Instagram depuis l'URL
      // Format: https://www.instagram.com/p/[POST_ID]/ ou https://www.instagram.com/reel/[POST_ID]/
      const regex = /instagram\.com\/(p|reel)\/([^\/\?]+)/i;
      const match = url.match(regex);
      
      if (match && match[2]) {
        const postId = match[2];
        
        // Créer un conteneur pour l'intégration Instagram
        const container = document.createElement('div');
        container.className = 'instagram-embed-container my-8 mx-auto max-w-xl';
        container.style.minHeight = '500px'; // Espace minimum pour éviter le sautillement pendant le chargement
        
        // Créer le bloc d'intégration Instagram avec le code blockquote recommandé par Instagram
        const embedCode = `
          <blockquote 
            class="instagram-media" 
            data-instgrm-permalink="https://www.instagram.com/p/${postId}/" 
            data-instgrm-version="14" 
            style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"
          >
            <div style="padding:16px;">
              <a href="https://www.instagram.com/p/${postId}/" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
                <div style="display: flex; flex-direction: row; align-items: center;">
                  <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 40px; margin-right: 14px; width: 40px;"></div>
                  <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                    <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                    <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 60px;"></div>
                  </div>
                </div>
                <div style="padding: 19% 0;"></div>
                <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
                  <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlns:xlink="https://www.w3.org/1999/xlink">
                    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                      <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                        <g>
                          <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                        </g>
                      </g>
                    </g>
                  </svg>
                </div>
                <div style="padding-top: 8px;">
                  <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:550; line-height:18px;">Voir cette publication sur Instagram</div>
                </div>
                <div style="padding: 12.5% 0;"></div>
                <div style="display: flex; flex-direction: row; margin-bottom: 14px; align-items: center;">
                  <div>
                    <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(0px) translateY(7px);"></div>
                    <div style="background-color: #F4F4F4; height: 12.5px; transform: rotate(-45deg) translateX(3px) translateY(1px); width: 12.5px; flex-grow: 0; margin-right: 14px; margin-left: 2px;"></div>
                    <div style="background-color: #F4F4F4; border-radius: 50%; height: 12.5px; width: 12.5px; transform: translateX(9px) translateY(-18px);"></div>
                  </div>
                  <div style="margin-left: 8px;">
                    <div style="background-color: #F4F4F4; border-radius: 50%; flex-grow: 0; height: 20px; width: 20px;"></div>
                    <div style="width: 0; height: 0; border-top: 2px solid transparent; border-left: 6px solid #f4f4f4; border-bottom: 2px solid transparent; transform: translateX(16px) translateY(-4px) rotate(30deg)"></div>
                  </div>
                  <div style="margin-left: auto;">
                    <div style="width: 0px; border-top: 8px solid #F4F4F4; border-right: 8px solid transparent; transform: translateY(16px);"></div>
                    <div style="background-color: #F4F4F4; flex-grow: 0; height: 12px; width: 16px; transform: translateY(-4px);"></div>
                    <div style="width: 0; height: 0; border-top: 8px solid #F4F4F4; border-left: 8px solid transparent; transform: translateY(-4px) translateX(8px);"></div>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center; margin-bottom: 24px;">
                  <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; margin-bottom: 6px; width: 224px;"></div>
                  <div style="background-color: #F4F4F4; border-radius: 4px; flex-grow: 0; height: 14px; width: 144px;"></div>
                </div>
              </a>
            </div>
          </blockquote>
          <script async src="//www.instagram.com/embed.js"></script>
        `;
        
        container.innerHTML = embedCode;
        
        // Ajouter une instruction pour l'utilisateur
        const notice = document.createElement('p');
        notice.className = 'text-center text-xs text-muted-foreground mt-2';
        notice.textContent = 'Publication Instagram - peut prendre quelques secondes à charger';
        
        // Créer un wrapper pour tout
        const wrapper = document.createElement('div');
        wrapper.className = 'instagram-embed-wrapper my-8 flex flex-col items-center';
        wrapper.appendChild(container);
        wrapper.appendChild(notice);
        
        // Insérer dans l'éditeur
        editor.chain().focus().insertContent(wrapper.outerHTML).run();
        
        // Notifier l'utilisateur
        toast({
          title: "Publication Instagram intégrée",
          description: "Le contenu Instagram sera affiché dans la version finale.",
        });
      } else {
        toast({
          title: "URL Instagram invalide",
          description: "L'URL doit être au format https://www.instagram.com/p/CODE/ ou https://www.instagram.com/reel/CODE/",
          variant: "destructive",
        });
      }
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
              
              <Toggle
                onPressedChange={handleAddInstagram}
                aria-label="Intégrer une publication Instagram"
              >
                <Instagram className="h-4 w-4" />
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