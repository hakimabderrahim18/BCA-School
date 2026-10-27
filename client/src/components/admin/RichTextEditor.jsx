import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
} from 'lucide-react';

export const RichTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Rédigez votre contenu ici...',
  className = '',
  label,
  error,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-600 underline font-semibold hover:text-brand-700',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[180px] p-4 text-sm text-slate-800 leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
  });

  // Mise à jour si la valeur externe change (ex: lors du chargement d'un article)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-400">
        Chargement de l'éditeur de texte...
      </div>
    );
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Entrez l’URL du lien :', previousUrl || 'https://');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const ToolbarButton = ({ onClick, active = false, disabled = false, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition ${
        active ? 'bg-slate-200 text-brand-700 font-bold' : ''
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div
        className={`bg-white rounded-2xl border transition overflow-hidden shadow-sm ${
          error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100'
        }`}
      >
        {/* Toolbar */}
        <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap items-center gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Gras (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italique (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Barré"
          >
            <Strikethrough className="w-4 h-4" />
          </ToolbarButton>

          <span className="w-px h-5 bg-slate-300 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Titre de niveau 2 (H2)"
          >
            <Heading2 className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Titre de niveau 3 (H3)"
          >
            <Heading3 className="w-4 h-4" />
          </ToolbarButton>

          <span className="w-px h-5 bg-slate-300 mx-1" />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Liste à puces"
          >
            <List className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Liste numérotée"
          >
            <ListOrdered className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Citation"
          >
            <Quote className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Séparateur horizontal"
          >
            <Minus className="w-4 h-4" />
          </ToolbarButton>

          <span className="w-px h-5 bg-slate-300 mx-1" />

          <ToolbarButton
            onClick={setLink}
            active={editor.isActive('link')}
            title="Insérer un lien web"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>

          {editor.isActive('link') && (
            <ToolbarButton
              onClick={() => editor.chain().focus().unsetLink().run()}
              title="Supprimer le lien"
            >
              <Unlink className="w-4 h-4 text-red-500" />
            </ToolbarButton>
          )}

          <div className="ml-auto flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Annuler (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Rétablir (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor Body */}
        <EditorContent editor={editor} />
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

export default RichTextEditor;
