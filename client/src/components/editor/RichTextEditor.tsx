import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import YouTube from '@tiptap/extension-youtube';
import CodeBlock from '@tiptap/extension-code-block';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextStyle from '@tiptap/extension-text-style';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Youtube as YoutubeIcon,
  Highlighter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  autofocus?: boolean;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [linkUrl, setLinkUrl] = useState('https://');
  const [imageUrl, setImageUrl] = useState('https://');
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=');
  const { toast } = useToast();

  if (!editor) {
    return null;
  }

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('https://');
    }
  };

  const setLink = () => {
    if (linkUrl) {
      // Check if the link is valid
      try {
        new URL(linkUrl);
        editor.chain().focus().setLink({ href: linkUrl }).run();
      } catch (e) {
        toast({
          title: "URL invalide",
          description: "Veuillez entrer une URL valide (ex: https://exemple.com)",
          variant: "destructive"
        });
      }
    } else {
      editor.chain().focus().unsetLink().run();
    }
  };

  const addYoutubeVideo = () => {
    if (youtubeUrl) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
      setYoutubeUrl('https://www.youtube.com/watch?v=');
    }
  };

  return (
    <div className="border border-input bg-background rounded-md p-1 mb-2 flex flex-wrap gap-1 sticky top-0 z-10">
      <TooltipProvider delayDuration={300}>
        <div className="flex flex-wrap gap-1">
          {/* Undo & Redo */}
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                >
                  <Undo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Annuler</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Rétablir</TooltipContent>
            </Tooltip>
          </div>

          <div className="border-r border-border mx-1 h-8" />

          {/* Headings */}
          <Select
            onValueChange={(value) => {
              if (value === 'paragraph') {
                editor.chain().focus().setParagraph().run();
              } else if (value === 'heading1') {
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              } else if (value === 'heading2') {
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              } else if (value === 'heading3') {
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }
            }}
            value={
              editor.isActive('heading', { level: 1 })
                ? 'heading1'
                : editor.isActive('heading', { level: 2 })
                ? 'heading2'
                : editor.isActive('heading', { level: 3 })
                ? 'heading3'
                : 'paragraph'
            }
          >
            <SelectTrigger className="w-[130px] h-8">
              <SelectValue placeholder="Style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraph">Paragraphe</SelectItem>
              <SelectItem value="heading1">Titre 1</SelectItem>
              <SelectItem value="heading2">Titre 2</SelectItem>
              <SelectItem value="heading3">Titre 3</SelectItem>
            </SelectContent>
          </Select>

          <div className="border-r border-border mx-1 h-8" />

          {/* Text formatting */}
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gras</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italique</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Souligné</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Barré</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleHighlight().run()}
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Surligner</TooltipContent>
            </Tooltip>
          </div>

          <div className="border-r border-border mx-1 h-8" />

          {/* Lists */}
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Liste à puces</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Liste numérotée</TooltipContent>
            </Tooltip>
          </div>

          <div className="border-r border-border mx-1 h-8" />

          {/* Alignment */}
          <ToggleGroup type="single" value={
            editor.isActive({ textAlign: 'left' }) ? 'left' :
            editor.isActive({ textAlign: 'center' }) ? 'center' :
            editor.isActive({ textAlign: 'right' }) ? 'right' :
            editor.isActive({ textAlign: 'justify' }) ? 'justify' : 'left'
          }>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="left" aria-label="Aligné à gauche" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                  <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Aligné à gauche</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="center" aria-label="Centré" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                  <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Centré</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="right" aria-label="Aligné à droite" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                  <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Aligné à droite</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem value="justify" aria-label="Justifié" onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
                  <AlignJustify className="h-4 w-4" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>Justifié</TooltipContent>
            </Tooltip>
          </ToggleGroup>

          <div className="border-r border-border mx-1 h-8" />

          {/* Special formats */}
          <div className="flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Citation</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('codeBlock') ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bloc de code</TooltipContent>
            </Tooltip>
          </div>

          <div className="border-r border-border mx-1 h-8" />

          {/* Link */}
          <div className="flex">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={editor.isActive('link') ? 'secondary' : 'ghost'}
                  size="icon"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label htmlFor="link" className="text-sm font-medium">
                      URL
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="link"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="col-span-3 h-8"
                      />
                      <Button size="sm" onClick={setLink}>
                        Appliquer
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Image */}
          <div className="flex">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label htmlFor="image" className="text-sm font-medium">
                      URL de l'image
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="image"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="col-span-3 h-8"
                      />
                      <Button size="sm" onClick={addImage}>
                        Insérer
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* YouTube */}
          <div className="flex">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <YoutubeIcon className="h-4 w-4 text-red-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-2">
                  <div className="grid gap-1">
                    <label htmlFor="youtube" className="text-sm font-medium">
                      URL YouTube
                    </label>
                    <div className="flex gap-2">
                      <Input
                        id="youtube"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="col-span-3 h-8"
                      />
                      <Button size="sm" onClick={addYoutubeVideo}>
                        Insérer
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Commencez à écrire...',
  className,
  autofocus = false,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-md max-w-full',
        },
      }),
      YouTube.configure({
        width: 640,
        height: 360,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-md',
        },
        controls: true,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-muted text-muted-foreground p-4 rounded-md font-mono my-4',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: 'bg-primary/20 text-primary px-1 py-0.5 rounded-sm',
        },
      }),
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable,
    autofocus,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  return (
    <div className={cn('border border-input rounded-md bg-background', className)}>
      {editor && editable && <MenuBar editor={editor} />}
      <EditorContent editor={editor} className="prose prose-sm max-w-none dark:prose-invert min-h-[250px] p-4" />
    </div>
  );
}