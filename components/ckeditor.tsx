"use client"

import { useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className="min-h-[300px] border border-orange-200 rounded-md overflow-hidden">
      {isLoading && (
        <div className="h-[300px] w-full bg-orange-50 animate-pulse rounded flex items-center justify-center">
          <span className="text-orange-500">Loading editor...</span>
        </div>
      )}
      <Editor
        apiKey="aii1o0p57wp1g77rq5sl4v3flz7kp5uyb9la4l7nzz0pdvw3" // Sign up for a free API key at https://www.tiny.cloud/
        onInit={(evt, editor) => {
          editorRef.current = editor
          setIsLoading(false)
        }}
        initialValue={value}
        onEditorChange={(newValue) => onChange(newValue)}
        init={{
          height: 300,
          menubar: false,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
        }}
      />
    </div>
  )
}

