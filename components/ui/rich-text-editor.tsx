'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Emoji from '@tiptap/extension-emoji';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from './button';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Smile,
  Undo,
  Redo
} from 'lucide-react';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value?: any;
  onChange?: (value: any) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Start writing...",
  className 
}: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Emoji,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const addImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      editor.chain().focus().setImage({ src: result }).run();
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      addImage(file);
    }
  };

  const addEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
  };

  const commonEmojis = ['😊', '👍', '❤️', '🔥', '💡', '🚀', '✅', '❌', '⚠️', '💻'];

  return (
    <div className={cn("border rounded-lg", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/50">
        {/* Text Formatting */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className="h-8 w-8 p-0"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Lists */}
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Text Alignment */}
        <Button
          variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Link */}
        <Button
          variant={editor.isActive('link') ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
          className="h-8 w-8 p-0"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        {/* Image */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Emoji */}
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <div className="absolute top-full left-0 mt-1 bg-background border rounded-lg shadow-lg p-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="grid grid-cols-5 gap-1">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="w-6 h-6 text-sm hover:bg-muted rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="p-2 border-b bg-muted/30">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 px-3 py-1 text-sm border rounded-md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addLink();
                }
              }}
            />
            <Button size="sm" onClick={addLink}>
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowLinkInput(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="p-4 min-h-[200px]">
        <EditorContent editor={editor} className="prose prose-sm max-w-none" />
      </div>

      {/* Hidden file input for image upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
} 