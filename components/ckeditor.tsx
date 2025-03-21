"use client"

import { useRef, useState, useEffect } from "react"
import { Editor } from "@tinymce/tinymce-react"
import type { Editor as TinyMCEEditor } from 'tinymce'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<TinyMCEEditor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Ensure TinyMCE is loaded in the browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force TinyMCE to load its resources
      require('tinymce/tinymce')
      require('tinymce/themes/silver')
      require('tinymce/models/dom')
    }
  }, [])

  return (
    <div className="min-h-[300px] border border-orange-200 rounded-md overflow-hidden">
      {isLoading && (
        <div className="h-[300px] w-full bg-orange-50 animate-pulse rounded flex items-center justify-center">
          <span className="text-orange-500">Loading editor...</span>
        </div>
      )}
      {error && (
        <div className="p-4 text-red-500 bg-red-50">
          {error}
        </div>
      )}
      <Editor
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY} // Move API key to environment variable
        onInit={(evt, editor) => {
          editorRef.current = editor
          setIsLoading(false)
        }}
        initialValue={value}
        onEditorChange={(newValue) => {
          onChange(newValue)
        }}
        init={{
          height: 500, // Increased height for better usability
          menubar: true, // Enable menu bar for more options
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: `
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              font-size: 16px;
              line-height: 1.5;
              padding: 1rem;
            }
          `,
          branding: false,
          statusbar: true,
          resize: true,
          paste_data_images: true,
          image_advtab: true,
          automatic_uploads: true,
          valid_elements: '*[*]', // Allow all elements and attributes
          extended_valid_elements: 'span[*]',
        }}
      />
    </div>
  )
}