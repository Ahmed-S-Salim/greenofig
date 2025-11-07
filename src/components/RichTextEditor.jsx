import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { evaluate } from 'mathjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  Table as TableIcon,
  Eraser,
  Unlink,
  ChevronDown,
  Type,
  MoreHorizontal,
  Trash2,
  Grid3x3,
  Calculator
} from 'lucide-react';

// Custom extension for font size that only applies to selected text
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: element => element.style.fontSize,
        renderHTML: attributes => {
          if (!attributes.fontSize) {
            return {};
          }
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize: fontSize => ({ commands, state }) => {
        // Only apply if there's a selection
        const { from, to } = state.selection;
        if (from === to) {
          return false; // No selection, don't apply
        }
        return commands.setMark(this.name, { fontSize });
      },
      unsetFontSize: () => ({ commands }) => {
        return commands.unsetMark(this.name);
      },
    };
  },
});

const MenuBar = ({ editor }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showMathDialog, setShowMathDialog] = useState(false);
  const [mathExpression, setMathExpression] = useState('');

  if (!editor) return null;

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || '');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({
      rows: parseInt(tableRows),
      cols: parseInt(tableCols),
      withHeaderRow: true
    }).run();
    setShowTableDialog(false);
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const addColumnBefore = () => {
    editor.chain().focus().addColumnBefore().run();
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const addRowBefore = () => {
    editor.chain().focus().addRowBefore().run();
  };

  const addRowAfter = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  const calculateMath = () => {
    try {
      // SECURE: Using mathjs for safe math evaluation (no code injection)
      const result = evaluate(mathExpression);
      editor.chain().focus().insertContent(String(result)).run();
      setMathExpression('');
      setShowMathDialog(false);
    } catch (error) {
      alert('Invalid math expression');
    }
  };

  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'];
  const highlights = ['transparent', '#FFE066', '#66FFE0', '#FF6666', '#66FF66', '#6666FF', '#FFAA66', '#FF66FF'];
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px'];

  const isInTable = editor.isActive('table');

  return (
    <div className="border-b border-white/10 p-2 space-y-2">
      {/* Row 1: Essential Formatting */}
      <div className="flex flex-wrap gap-1 items-center">
        {/* Font Size Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Font Size - Select text first, then choose size"
              className="gap-1"
            >
              <Type className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border-white/10">
            <div className="px-2 py-1 text-xs text-text-secondary">
              Select text first, then click size
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            {fontSizes.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => {
                  const { from, to } = editor.state.selection;
                  if (from === to) {
                    alert('Please select text first before applying font size');
                    return;
                  }
                  editor.chain().focus().setFontSize(size).run();
                }}
                className="cursor-pointer hover:bg-white/10"
              >
                <span style={{ fontSize: size }}>{size}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().unsetFontSize().run()}
              className="cursor-pointer hover:bg-white/10 text-red-400"
            >
              Reset Size
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-white/10' : ''}
          title="Bold (Ctrl+B) - Make text bold"
        >
          <Bold className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-white/10' : ''}
          title="Italic (Ctrl+I) - Make text italic"
        >
          <Italic className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'bg-white/10' : ''}
          title="Underline (Ctrl+U) - Underline text"
        >
          <UnderlineIcon className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-white/10' : ''}
          title="Strikethrough - Strike through text"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Headings Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Headings - Different heading levels"
              className="gap-1"
            >
              <Heading1 className="w-4 h-4" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border-white/10">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`cursor-pointer hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'bg-white/10' : ''}`}
            >
              <Heading1 className="w-4 h-4 mr-2" />
              Heading 1 (Large)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`cursor-pointer hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'bg-white/10' : ''}`}
            >
              <Heading2 className="w-4 h-4 mr-2" />
              Heading 2 (Medium)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`cursor-pointer hover:bg-white/10 ${editor.isActive('heading', { level: 3 }) ? 'bg-white/10' : ''}`}
            >
              <Heading3 className="w-4 h-4 mr-2" />
              Heading 3 (Small)
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setParagraph().run()}
              className="cursor-pointer hover:bg-white/10"
            >
              Normal Text
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Color Picker */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color - Change text color"
          >
            <Palette className="w-4 h-4" />
          </Button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-background border border-white/10 rounded-lg shadow-lg z-50 flex gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  title={`Set color to ${color}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Highlight Picker */}
        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowHighlightPicker(!showHighlightPicker)}
            className={editor.isActive('highlight') ? 'bg-white/10' : ''}
            title="Highlight - Highlight text background"
          >
            <Highlighter className="w-4 h-4" />
          </Button>
          {showHighlightPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-background border border-white/10 rounded-lg shadow-lg z-50 flex gap-1">
              {highlights.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-6 h-6 rounded border border-white/20 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    if (color === 'transparent') {
                      editor.chain().focus().unsetHighlight().run();
                    } else {
                      editor.chain().focus().setHighlight({ color }).run();
                    }
                    setShowHighlightPicker(false);
                  }}
                  title={color === 'transparent' ? 'Remove highlight' : `Highlight with ${color}`}
                />
              ))}
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          title="Clear Formatting - Remove all text formatting"
        >
          <Eraser className="w-4 h-4" />
        </Button>
      </div>

      {/* Row 2: Alignment, Lists & Advanced Features */}
      <div className="flex flex-wrap gap-1 items-center">
        {/* Alignment Buttons */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-white/10' : ''}
          title="Align Left - Align text to the left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-white/10' : ''}
          title="Align Center - Center align text"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-white/10' : ''}
          title="Align Right - Align text to the right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-white/10' : ''}
          title="Justify - Justify text alignment"
        >
          <AlignJustify className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-white/10' : ''}
          title="Bullet List - Create an unordered list"
        >
          <List className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-white/10' : ''}
          title="Numbered List - Create a numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-white/10' : ''}
          title="Add Link - Insert or edit a hyperlink"
        >
          <Link2 className="w-4 h-4" />
        </Button>

        {editor.isActive('link') && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove Link - Remove the hyperlink"
          >
            <Unlink className="w-4 h-4" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImage}
          title="Insert Image - Add an image from URL"
        >
          <ImageIcon className="w-4 h-4" />
        </Button>

        {/* Table Controls */}
        <Dialog open={showTableDialog} onOpenChange={setShowTableDialog}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="Insert Table - Create a custom table"
            >
              <TableIcon className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background border-white/10">
            <DialogHeader>
              <DialogTitle>Insert Table</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rows">Number of Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cols">Number of Columns</Label>
                <Input
                  id="cols"
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button onClick={insertTable} className="w-full">
                Insert Table
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Table Management Dropdown (only show when in table) */}
        {isInTable && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Table Options - Manage table"
                className="gap-1 bg-white/10"
              >
                <Grid3x3 className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-background border-white/10">
              <DropdownMenuItem
                onClick={addColumnBefore}
                className="cursor-pointer hover:bg-white/10"
              >
                Add Column Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={addColumnAfter}
                className="cursor-pointer hover:bg-white/10"
              >
                Add Column After
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={deleteColumn}
                className="cursor-pointer hover:bg-white/10 text-red-400"
              >
                Delete Column
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={addRowBefore}
                className="cursor-pointer hover:bg-white/10"
              >
                Add Row Before
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={addRowAfter}
                className="cursor-pointer hover:bg-white/10"
              >
                Add Row After
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={deleteRow}
                className="cursor-pointer hover:bg-white/10 text-red-400"
              >
                Delete Row
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={deleteTable}
                className="cursor-pointer hover:bg-white/10 text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Entire Table
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Math Calculator (for table cells) */}
        {isInTable && (
          <Dialog open={showMathDialog} onOpenChange={setShowMathDialog}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                title="Calculate - Insert math result"
              >
                <Calculator className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-white/10">
              <DialogHeader>
                <DialogTitle>Calculate Math Expression</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="math">Math Expression</Label>
                  <Input
                    id="math"
                    placeholder="e.g., 25 + 30 * 2"
                    value={mathExpression}
                    onChange={(e) => setMathExpression(e.target.value)}
                    className="bg-background/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        calculateMath();
                      }
                    }}
                  />
                  <p className="text-xs text-text-secondary">
                    Supported: +, -, *, /, (), Math functions
                  </p>
                </div>
                <Button onClick={calculateMath} className="w-full">
                  Calculate & Insert
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              title="More Options - Additional formatting tools"
              className="gap-1"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background border-white/10">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`cursor-pointer hover:bg-white/10 ${editor.isActive('blockquote') ? 'bg-white/10' : ''}`}
            >
              <Quote className="w-4 h-4 mr-2" />
              Blockquote
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`cursor-pointer hover:bg-white/10 ${editor.isActive('codeBlock') ? 'bg-white/10' : ''}`}
            >
              <Code className="w-4 h-4 mr-2" />
              Code Block
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="cursor-pointer hover:bg-white/10"
            >
              Horizontal Rule
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z) - Undo last action"
        >
          <Undo className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y) - Redo last action"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const RichTextEditor = ({ content, onChange, placeholder = 'Write your content here...' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      FontSize,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer hover:text-primary/80',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full my-4',
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-white/20 bg-white/5 px-4 py-2 font-bold',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-white/20 px-4 py-2',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[400px] p-4 focus:outline-none [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:my-6 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:my-5 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:my-4 [&_p]:text-base [&_p]:my-2 [&_table]:border-collapse [&_table]:w-full [&_th]:border [&_th]:border-white/20 [&_th]:bg-white/5 [&_th]:px-4 [&_th]:py-2 [&_td]:border [&_td]:border-white/20 [&_td]:px-4 [&_td]:py-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6',
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
