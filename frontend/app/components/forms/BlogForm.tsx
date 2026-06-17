'use client';

import { useState, ChangeEvent, useRef, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export interface BlogData {
  title: string;
  category: string;
  metaDescription: string;
  content: string;
  existingCoverUrl?: string;
}

interface BlogFormProps {
  initialData?: BlogData;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancelHref: string;
  loading: boolean;
  submitLabel: string;
  error?: string;
}

export default function BlogForm({
  initialData,
  onSubmit,
  onCancelHref,
  loading,
  submitLabel,
  error
}: BlogFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'Real Estate Investment'); 
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [editMode, setEditMode] = useState<'write' | 'preview'>('write');
  
  const [existingCoverUrl, setExistingCoverUrl] = useState<string>(initialData?.existingCoverUrl || '');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [localError, setLocalError] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setCategory(initialData.category);
      setMetaDescription(initialData.metaDescription);
      setContent(initialData.content);
      setExistingCoverUrl(initialData.existingCoverUrl || '');
    }
  }, [initialData]);

  const injectSyntax = (syntax: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const selectedText = content.substring(startPos, endPos);

    let prefix = '';
    let suffix = '';
    let fallbackText = '';

    switch (syntax) {
      case 'heading': prefix = '\n## '; suffix = '\n'; fallbackText = 'New Section Heading'; break;
      case 'bold': prefix = '**'; suffix = '**'; fallbackText = 'bold text'; break;
      case 'italic': prefix = '*'; suffix = '*'; fallbackText = 'italic text'; break;
      case 'list': prefix = '\n* '; suffix = '\n'; fallbackText = 'List item entry'; break;
      case 'quote': prefix = '\n> '; suffix = '\n'; fallbackText = 'Important highlight callout quote'; break;
      default: return;
    }

    const textToInsert = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${fallbackText}${suffix}`;
    const updatedContent = content.substring(0, startPos) + textToInsert + content.substring(endPos);
    setContent(updatedContent);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!title || !metaDescription || !content) {
      setLocalError('Please populate all required structural blog fields.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);
    formData.append('meta_description', metaDescription);
    formData.append('content', content);
    
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }

    await onSubmit(formData);
  };

  const displayError = error || localError;

  return (
    <div className="space-y-6">
      {displayError && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl border border-red-100">
          ⚠️ {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
        
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Article Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Target Marketing Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            >
              <option value="Real Estate Investment">Real Estate Investment</option>
              <option value="Abuja Housing Market">Abuja Housing Market</option>
              <option value="Buying Guides">Buying Guides</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              SEO Meta Description ({metaDescription.length}/160)
            </label>
            <input 
              type="text" 
              maxLength={160}
              value={metaDescription} 
              onChange={(e) => setMetaDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Article Cover Banner</label>
          
          {existingCoverUrl && !previewUrl && (
            <div className="mb-4 relative rounded-xl overflow-hidden border border-gray-200 aspect-21/9 bg-gray-100">
              <img src={existingCoverUrl} alt="Existing Cover" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">Current Banner</div>
            </div>
          )}

          <div className="relative border-2 border-dashed border-gray-200 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-gray-50 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="text-2xl block mb-1">🖼️</span>
            <p className="text-sm font-bold text-gray-700">Click or drag a {initialData ? 'new' : ''} banner image here</p>
          </div>

          {previewUrl && (
            <div className="mt-4 relative rounded-xl overflow-hidden border border-gray-200 aspect-21/9 bg-gray-100">
              <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              {initialData && <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded">New Banner (Pending Save)</div>}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Full Content Core Text</label>
            <div className="bg-gray-100 p-0.5 rounded-lg flex items-center border border-gray-200">
              <button type="button" onClick={() => setEditMode('write')} className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition ${editMode === 'write' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>Write</button>
              <button type="button" onClick={() => setEditMode('preview')} className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md transition ${editMode === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}>Preview</button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex items-center gap-1">
              <button type="button" onClick={() => injectSyntax('heading')} className="p-1 px-2 rounded text-[11px] font-extrabold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition">H2</button>
              <button type="button" onClick={() => injectSyntax('bold')} className="p-1 px-2 rounded text-[11px] font-black text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition font-serif">B</button>
              <button type="button" onClick={() => injectSyntax('italic')} className="p-1 px-2 rounded text-[11px] italic font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition">I</button>
              <div className="h-3 w-px bg-gray-200 mx-1" />
              <button type="button" onClick={() => injectSyntax('list')} className="p-1 px-2 rounded text-[11px] font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition">• List</button>
              <button type="button" onClick={() => injectSyntax('quote')} className="p-1 px-2 rounded text-[11px] font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition">“ Quote</button>
            </div>

            {editMode === 'write' ? (
              <textarea 
                ref={textareaRef} 
                rows={10}
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-white text-sm focus:outline-none transition-all text-gray-900 font-mono resize-none leading-relaxed min-h-64"
              />
            ) : (
              <div className="p-4 bg-white min-h-64 max-h-96 overflow-y-auto text-gray-800 text-sm leading-relaxed space-y-4 font-medium">
                {content ? (
                  <div className="prose prose-blue max-w-none 
                    [&>h2]:text-base [&>h2]:font-black [&>h2]:text-gray-900 [&>h2]:mt-4 [&>h2]:mb-2
                    [&>p]:mb-3 [&>p]:leading-relaxed
                    [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ul]:mb-3
                    [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-gray-500 [&>blockquote]:bg-gray-50 [&>blockquote]:py-0.5 [&>blockquote]:my-3"
                  >
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-400 italic text-xs text-center py-12">Nothing to render. Write text first!</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={onCancelHref} className="px-5 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">Cancel</Link>
          <button type="submit" disabled={loading} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold text-sm rounded-xl shadow-md transition-all">
            {loading ? 'Processing...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
