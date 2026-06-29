import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import EditorToolbar from './EditorToolbar';

const RichTextEditor = ({
  label,
  required,
  error,
  value = '',
  onChange,
  placeholder = '',
  minHeight = 120,
  readOnly = false,
  rightLabel,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: {},
        codeBlock: false,
        code: false,
        horizontalRule: false,
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      onChange?.(html === '<p></p>' ? '' : html);
    },
  });

  // Sync when value changes from outside (e.g. loading a different report)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const current = editor.getHTML();
    const incoming = value || '';
    if (incoming !== current) {
      editor.commands.setContent(incoming, false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Update editable flag if readOnly changes
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  return (
    <div>
      {label && (
        <label className="flex items-center gap-1.5 mb-1.5 text-sm font-medium text-gray-700">
          {label}
          {required && !readOnly && <span className="text-[#E52321]">*</span>}
        </label>
      )}

      <div className={`border rounded-xl overflow-hidden transition-all ${
        error
          ? 'border-red-400'
          : 'border-gray-200 focus-within:border-[#E52321] focus-within:ring-[3px] focus-within:ring-[#fdecec]'
      } ${readOnly ? 'bg-gray-50' : 'bg-white'}`}>

        {!readOnly && <EditorToolbar editor={editor} />}

        <div
          className="px-4 py-3 text-sm text-gray-700 tiptap-editor"
          style={{ '--editor-min-height': `${minHeight}px` }}
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && !readOnly && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
};

export default RichTextEditor;
