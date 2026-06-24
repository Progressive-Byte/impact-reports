import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
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
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: {},
        codeBlock: false,
        code: false,
        horizontalRule: false,
        heading: false,
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

  // Focus link input when it opens
  useEffect(() => {
    if (showLinkInput) {
      setTimeout(() => linkInputRef.current?.focus(), 0);
    }
  }, [showLinkInput]);

  const exec = (fn) => (e) => {
    e.preventDefault();
    fn();
  };

  const openLinkInput = (e) => {
    e.preventDefault();
    if (!editor) return;
    // If selection already has a link, remove it
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const existing = editor.getAttributes('link').href || '';
    setLinkUrl(existing);
    setShowLinkInput(true);
  };

  const applyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = url.startsWith('http') ? url : `https://${url}`;
      editor.chain().focus().setLink({ href, target: '_blank', rel: 'noopener noreferrer' }).run();
    }
    setShowLinkInput(false);
    setLinkUrl('');
  };

  const cancelLink = () => {
    setShowLinkInput(false);
    setLinkUrl('');
    editor?.chain().focus().run();
  };

  const handleLinkKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
    if (e.key === 'Escape') cancelLink();
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
          <>
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

              <ToolbarBtn
                onMouseDown={exec(() => editor?.chain().focus().toggleOrderedList().run())}
                active={editor?.isActive('orderedList')}
                title="Numbered list"
              >
                <span className="text-[11px] font-bold leading-none">1.</span>
              </ToolbarBtn>

              <Divider />

              <ToolbarBtn
                onMouseDown={exec(() => editor?.chain().focus().toggleBlockquote().run())}
                active={editor?.isActive('blockquote')}
                title="Blockquote"
              >
                <span className="text-[15px] font-serif leading-none">"</span>
              </ToolbarBtn>

              <ToolbarBtn
                onMouseDown={openLinkInput}
                active={editor?.isActive('link')}
                title={editor?.isActive('link') ? 'Remove link' : 'Add link'}
              >
                <SafeIcon icon="FiLink" className="text-sm" />
              </ToolbarBtn>
            </div>

            {/* Link input bar */}
            {showLinkInput && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-blue-50/30">
                <SafeIcon icon="FiLink" className="text-xs text-gray-400 flex-shrink-0" />
                <input
                  ref={linkInputRef}
                  type="url"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  onKeyDown={handleLinkKeyDown}
                  placeholder="https://example.com"
                  className="flex-1 text-xs bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); applyLink(); }}
                  className="text-xs font-semibold text-white bg-[#E52321] px-2.5 py-1 rounded-md hover:bg-[#c41d1b] transition-colors"
                >
                  Set
                </button>
                <button
                  type="button"
                  onMouseDown={e => { e.preventDefault(); cancelLink(); }}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </>
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
