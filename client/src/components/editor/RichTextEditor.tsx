import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, Extension, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ArticleEmbedNode from './ArticleEmbedExtension';
import ArticleSelector from './ArticleSelector';
import './RichTextEditor.css';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  Link as LinkIcon, 
  Undo, 
  Redo, 
  Code,
  Newspaper
} from 'lucide-react';
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Commencez à rédiger...' }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [showLinkInput, setShowLinkInput] = useState<boolean>(false);
  const [showArticleSelector, setShowArticleSelector] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const initialContentRef = useRef<string>(value || "");
  const editorInstanceRef = useRef<any>(null);
  
  // Conserver la valeur initiale pour référence
  useEffect(() => {
    initialContentRef.current = value || "";
    console.log("RichTextEditor - Initial content reference set:", {
      content_length: (value || "").length,
      content_preview: value ? value.substring(0, 50) + "..." : "EMPTY"
    });
  }, []);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
      }),
      ArticleEmbedNode.configure({
        HTMLAttributes: {
          class: 'article-embed',
        },
      }),
    ],
    content: initialContentRef.current,
    editorProps: {
      attributes: {
        class: 'min-h-[300px] max-h-[600px] overflow-y-auto p-4 focus:outline-none rounded-md border border-input bg-background prose prose-stone max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      // Ne pas déclencher onChange pendant l'initialisation
      if (isInitialized) {
        onChange(editor.getHTML());
      }
    },
    onCreate: ({ editor }) => {
      editorInstanceRef.current = editor;
      console.log("RichTextEditor - Editor created with content:", {
        content: editor.getHTML(),
        length: editor.getHTML().length,
        preview: editor.getHTML().substring(0, 50) + "..."
      });
      
      // Définir l'état initialisé après un court délai
      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    }
  });
  
  // Fonction pour forcer la mise à jour du contenu de manière explicite
  const forceContentUpdate = (newContent: string) => {
    if (editorInstanceRef.current) {
      console.log("RichTextEditor - Forcing content update:", {
        new_content_length: (newContent || "").length,
        new_content_preview: newContent ? newContent.substring(0, 50) + "..." : "EMPTY"
      });
      
      editorInstanceRef.current.commands.setContent(newContent || "");
    }
  };
  
  // Synchroniser le contenu de façon robuste lors des changements de valeur
  useEffect(() => {
    if (!editor || !isInitialized) return;
    
    const currentContent = editor.getHTML();
    const isDifferent = value !== currentContent;
    
    console.log("RichTextEditor - Value change detected:", {
      is_initialized: isInitialized,
      value_length: (value || "").length,
      current_length: currentContent.length,
      is_different: isDifferent,
      value_preview: value ? value.substring(0, 40) + "..." : "EMPTY",
      current_preview: currentContent.substring(0, 40) + "..."
    });
    
    if (isDifferent) {
      const timer = setTimeout(() => {
        forceContentUpdate(value || "");
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [editor, value, isInitialized]);

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    setShowLinkInput(true);
  };

  const setLink = () => {
    if (linkUrl) {
      // Check if the URL has a protocol
      const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
        ? linkUrl
        : `https://${linkUrl}`;

      editor.chain().focus().setLink({ href: url }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setLink();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };
  
  const handleArticleSelect = (article: any, variant: 'default' | 'compact') => {
    if (!editor) return;
    
    editor.chain().focus().setArticleEmbed({
      articleId: article.id,
      articleSlug: article.slug,
      articleTitle: article.title,
      articleImageUrl: article.imageUrl,
      articleExcerpt: article.excerpt,
      variant,
    }).run();
  };

  return (
    <div className="rich-text-editor relative">
      <div className="toolbar sticky top-0 z-10 bg-background p-2 border-b rounded-t-md flex flex-wrap gap-1 items-center">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Gras"
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Italique"
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </Toggle>

        {/* L'extension Underline n'est pas disponible par défaut dans TipTap */}

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Titre 1"
          title="Titre 1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Titre 2"
          title="Titre 2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          aria-label="Titre 3"
          title="Titre 3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Liste à puces"
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Liste numérotée"
          title="Liste numérotée"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Citation"
          title="Citation"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Toggle
          size="sm"
          pressed={editor.isActive('code')}
          onPressedChange={() => editor.chain().focus().toggleCode().run()}
          aria-label="Code"
          title="Code"
        >
          <Code className="h-4 w-4" />
        </Toggle>

        <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
          <PopoverTrigger asChild>
            <Toggle
              size="sm"
              pressed={editor.isActive('link')}
              onPressedChange={toggleLink}
              aria-label="Lien"
              title="Lien"
            >
              <LinkIcon className="h-4 w-4" />
            </Toggle>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex gap-2">
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={handleLinkKeyDown}
                autoFocus
              />
              <Button type="button" onClick={setLink} size="sm">
                Ajouter
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Toggle
          size="sm"
          pressed={editor.isActive('articleEmbed')}
          onPressedChange={() => setShowArticleSelector(true)}
          aria-label="Insérer un article"
          title="Insérer un article"
        >
          <Newspaper className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Annuler"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rétablir"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent editor={editor} />

      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bg-background rounded-md shadow-md flex items-center p-1 gap-1">
            <Toggle
              size="sm"
              pressed={editor.isActive('bold')}
              onPressedChange={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('italic')}
              onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive('link')}
              onPressedChange={toggleLink}
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Toggle>
          </div>
        </BubbleMenu>
      )}
      
      <ArticleSelector 
        open={showArticleSelector} 
        onOpenChange={setShowArticleSelector} 
        onSelect={handleArticleSelect} 
      />
    </div>
  );
}