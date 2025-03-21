"use client"
// pages/create-blog.tsx
import React, {useState, useRef, ChangeEvent, KeyboardEvent, JSX} from 'react';
import Head from 'next/head';
import { X, Plus, Paperclip, Link as LinkIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { CldUploadWidget } from 'next-cloudinary';
import { Editor as TinyMCEEditor } from 'tinymce';
import {useParams, useRouter} from "next/navigation";
import axios from "axios";

// Types
interface AttachmentType {
  url: string;
  publicId: string;
  format: string;
  name: string;
}

interface BlogPostData {
  notionId: string;
  title: string;
  tags: string[];
  links: string[];
  content: string;
  attachments: string[];
}

interface UploadResult {
  info: {
    secure_url: string;
    public_id: string;
    format: string;
    original_filename: string;
  };
}

// Dynamically import TinyMCE to avoid SSR issues
const Editor = dynamic(
  () => import('@tinymce/tinymce-react').then(mod => mod.Editor),
  { ssr: false }
);

export default function CreateBlogPage(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>('');
  const [links, setLinks] = useState<string[]>([]);
  const [currentLink, setCurrentLink] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const editorRef = useRef<TinyMCEEditor | null>(null);
  const params = useParams();
  const notionId = params?.id;
  const router = useRouter();
  
  const handleAddTag = (): void => {
    if (currentTag.trim() !== '' && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string): void => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleAddLink = (): void => {
    if (currentLink.trim() !== '') {
      setLinks([...links, currentLink]);
      setCurrentLink('');
    }
  };
  
  const handleRemoveLink = (index: number): void => {
    setLinks(links.filter((_, i) => i !== index));
  };
  
  const handleUploadSuccess = (result: UploadResult): void => {
    const newAttachment: AttachmentType = {
      url: result.info.secure_url,
      publicId: result.info.public_id,
      format: result.info.format,
      name: result.info.original_filename
    };
    setAttachments([...attachments, newAttachment]);
  };
  
  const handleRemoveAttachment = (publicId: string): void => {
    setAttachments(attachments.filter(file => file.publicId !== publicId));
  };
  
  const handleSubmit = async (): Promise<void> => {
    if (!notionId || typeof notionId !== 'string' || title === '' || content === '') {
      return;
    }
    
    const blogPostData: BlogPostData = {
      notionId,
      title,
      tags,
      links,
      content,
      attachments: attachments.map(att => att.url),
    };
    
    try {
      setLoading(true);
      const res = await axios.post('/api/blogs/entrepreneur', blogPostData)
      if (res.status === 200) {
        router.push(`/blogs/${res.data._id.toString()}`)
      }
    } catch (e) {
      console.log(e);
      alert("failed to publsh blog")
    } finally {
      setLoading(false);
    }
  };
  
  
  if (loading) {
    return <div>
      Loading...
    </div>
  }
  return (
    <>
      <Head>
        <title>Create Blog Post</title>
        <meta name="description" content="Create a new blog post" />
      </Head>
      
      <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md my-8">
        <h1 className="text-2xl font-bold mb-6 text-orange-600">Create New Blog Post</h1>
        
        {/* Title Input */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            placeholder="Enter blog title"
          />
        </div>
        
        {/* Tags Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentTag(e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-l-md bg-white"
              placeholder="Add a tag"
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleAddTag()}
            />
            <button
              onClick={handleAddTag}
              className="bg-orange-500 text-white p-2 rounded-r-md hover:bg-orange-600"
              type="button"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {/* Display Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div key={index} className="bg-gray-200 px-3 py-1 rounded-full flex items-center">
                <span className="text-gray-800 text-sm">{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                  type="button"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Links Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Links
          </label>
          <div className="flex items-end gap-2 mb-2">
            <div className="flex-grow">
              <input
                type="url"
                value={currentLink}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentLink(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md bg-white"
                placeholder="https://example.com"
              />
            </div>
            <button
              onClick={handleAddLink}
              className="bg-orange-500 text-white p-2 h-10 rounded-md hover:bg-orange-600"
              type="button"
            >
              <Plus size={20} />
            </button>
          </div>
          
          {/* Display Links */}
          <div className="space-y-2">
            {links.map((link, index) => (
              <div key={index} className="bg-gray-200 p-2 rounded-md flex justify-between items-center">
                <div className="flex items-center">
                  <LinkIcon size={16} className="text-orange-600 mr-2" />
                  <a href={link} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
                    {link}
                  </a>
                </div>
                <button
                  onClick={() => handleRemoveLink(index)}
                  className="text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Attachments with Cloudinary Widget */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments
          </label>
          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(result: unknown) => handleUploadSuccess(result as UploadResult)}
          >
            {({ open }: { open: () => void }) => (
              <div
                onClick={() => open()}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
              >
                <Paperclip className="mx-auto h-12 w-12 text-orange-400" />
                <p className="mt-1 text-sm text-gray-500">
                  Click to upload files
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            )}
          </CldUploadWidget>
          
          {/* Display uploaded attachments */}
          <div className="mt-3 space-y-2">
            {attachments.map((file, index) => (
              <div key={index} className="bg-gray-200 p-2 rounded-md flex justify-between items-center">
                <div className="flex items-center">
                  <Paperclip size={16} className="text-orange-600 mr-2" />
                  <span className="text-gray-800">{file.name}.{file.format}</span>
                </div>
                <button
                  onClick={() => handleRemoveAttachment(file.publicId)}
                  className="text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Content with TinyMCE */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          {/* TinyMCE editor will only render client-side */}
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            onInit={(_, editor) => editorRef.current = editor}
            initialValue=""
            value={content}
            onEditorChange={(newContent: string) => setContent(newContent)}
            init={{
              height: 400,
              menubar: false,
              plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
              ],
              toolbar: 'undo redo | blocks | ' +
                'bold italic forecolor | alignleft aligncenter ' +
                'alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
              skin: "oxide",
              content_css: "default",
            }}
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700"
          >
            Publish
          </button>
        </div>
      </div>
    </>
  );
}