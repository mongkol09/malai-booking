import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import './RichTextEditor.scss'; // Import the new stylesheet

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const getButtonClass = (name, params = {}) => {
    return editor.isActive(name, params) ? 'is-active' : '';
  };

  return (
    <div className="tiptap-toolbar">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} className={getButtonClass('bold')}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} className={getButtonClass('italic')}>I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline().run()} className={getButtonClass('underline')}>U</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} className={getButtonClass('strike')}>S</button>
      <div className="divider" />
      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={getButtonClass('paragraph')}>P</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={getButtonClass('heading', { level: 1 })}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getButtonClass('heading', { level: 2 })}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={getButtonClass('heading', { level: 3 })}>H3</button>
      <div className="divider" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={getButtonClass('bulletList')}>• List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={getButtonClass('orderedList')}>1. List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={getButtonClass('blockquote')}>❝</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={getButtonClass('codeBlock')}>{'<>'}</button>
      <div className="divider" />
      <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>Undo</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>Redo</button>
    </div>
  );
};

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    onUpdate: ({ editor }) => {
      onChange && onChange(editor.getHTML());
    },
  });

  return (
    <div className="tiptap-editor-wrapper">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;