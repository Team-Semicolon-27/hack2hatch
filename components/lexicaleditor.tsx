import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { EditorState } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';

interface LexicalEditorProps {
  value: string;
  fontsize: string;
  textAlignment: string;
  formattingOptions: {
    headings: boolean,
    codeBlocks: boolean,
    quotes: boolean,
    tables: boolean,
    advanced: boolean,
    bold: boolean,
    italic: boolean,
    underline: boolean,
};
  onChange: (content: string) => void;
}

const MyOnChangePlugin = ({ onChange }: { onChange: (content: string) => void }) => {
  
  return (
    <OnChangePlugin
      onChange={(editorState: EditorState) => {
        editorState.read(() => {
          onChange(JSON.stringify(editorState));
        });
      }}
    />
  );
};

export default function LexicalEditor({ onChange }: LexicalEditorProps) {
  const initialConfig = {
    namespace: 'LexicalEditor',
    theme: {
      paragraph: 'mb-2',
    },
    onError(error: Error) {
      console.error(error);
    },
    nodes: [HeadingNode, QuoteNode],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="border border-gray-300 rounded-md p-2 min-h-[150px]">
        <RichTextPlugin contentEditable={<ContentEditable className="outline-none p-2" />} placeholder={<div className="text-gray-400">Start writing...</div>} ErrorBoundary={({ children }: { children: React.ReactNode }) => <>{children}</>} />
        <HistoryPlugin />
        <MyOnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}
