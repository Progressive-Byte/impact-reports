import { useEffect, useRef, useState } from 'react';
import SafeIcon from '../SafeIcon';
import ToolbarBtn from './ToolbarBtn';

const Divider = () => <span className="w-px h-5 bg-gray-200 mx-0.5 flex-shrink-0" />;

const EditorToolbar = ({ editor }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef(null);

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
    <>
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50/70 flex-wrap">
        {[1, 2, 3].map(level => (
          <ToolbarBtn
            key={level}
            onMouseDown={exec(() => editor?.chain().focus().toggleHeading({ level }).run())}
            active={editor?.isActive('heading', { level })}
            title={`Heading ${level}`}
          >
            <span className="text-[11px] font-bold leading-none">H{level}</span>
          </ToolbarBtn>
        ))}

        <Divider />

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
          <em className="text-[13px] font-medium">I</em>
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
  );
};

export default EditorToolbar;
