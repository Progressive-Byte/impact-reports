import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import SafeIcon from './SafeIcon';

const ToolbarBtn = ({ onMouseDown, active, title, children }) => (
  <button
    type="button"
    onMouseDown={onMouseDown}
    title={title}
    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
      active
        ? 'bg-[#E52321] text-white'
        : 'text-gray-500 hover:bg-gray-100 hover:text-[#0B0D0F]'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />;

const RichTextEditor = ({
  label,
  required,
  error,
  value = '',
  onChange,
  placeholder = '',
  minHeight = 120,
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ orderedList: false, blockquote: false, codeBlock: false, code: false, horizontalRule: false, heading: false }),
      Placeholder.configure({ placeholder }),
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

  const exec = (fn) => (e) => {
    e.preventDefault();
    fn();
  };

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

        {/* Toolbar */}
        {!readOnly && (
          <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50/70">
            <ToolbarBtn
              onMouseDown={exec(() => editor?.chain().focus().toggleBold().run())}
              active={editor?.isActive('bold')}
              title="Bold"
            >
              <strong className="text-[13px]">B</strong>
            </ToolbarBtn>

            <ToolbarBtn
              onMouseDown={exec(() => editor?.chain().focus().toggleItalic().run())}
              active={editor?.isActive('italic')}
              title="Italic"
            >
              <em className="text-[13px] not-italic font-medium" style={{ fontStyle: 'italic' }}>I</em>
            </ToolbarBtn>

            <ToolbarBtn
              onMouseDown={exec(() => editor?.chain().focus().toggleStrike().run())}
              active={editor?.isActive('strike')}
              title="Strikethrough"
            >
              <s className="text-[13px] font-medium">S</s>
            </ToolbarBtn>

            <Divider />

            <ToolbarBtn
              onMouseDown={exec(() => editor?.chain().focus().toggleBulletList().run())}
              active={editor?.isActive('bulletList')}
              title="Bullet list"
            >
              <SafeIcon icon="FiList" className="text-sm" />
            </ToolbarBtn>
          </div>
        )}

        {/* Editor area */}
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
