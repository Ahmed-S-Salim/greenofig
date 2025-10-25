import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  ImageIcon,
  Undo,
  Redo,
  MinusSquare
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className="border-b border-white/10 p-2 flex flex-wrap gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-white/10' : ''}
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-white/10' : ''}
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'bg-white/10' : ''}
      >
        <Heading1 className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'bg-white/10' : ''}
      >
        <Heading2 className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'bg-white/10' : ''}
      >
        <Heading3 className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'bg-white/10' : ''}
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'bg-white/10' : ''}
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'bg-white/10' : ''}
      >
        <Quote className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={editor.isActive('codeBlock') ? 'bg-white/10' : ''}
      >
        <Code className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addLink}
        className={editor.isActive('link') ? 'bg-white/10' : ''}
      >
        <Link2 className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={addImage}
      >
        <ImageIcon className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <MinusSquare className="w-4 h-4" />
      </Button>

      <div className="flex-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Write your content here...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none',
      },
    },
  });

  return (
    <div className="border border-white/10 rounded-lg bg-background/50">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {editor && (
        <div className="border-t border-white/10 px-4 py-2 text-xs text-text-secondary flex justify-between">
          <span>{editor.storage.characterCount.characters()} characters</span>
          <span>{editor.storage.characterCount.words()} words</span>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
