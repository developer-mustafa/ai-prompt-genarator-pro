import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download } from 'lucide-react';

interface PromptPreviewProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onCopy: () => void;
  onExport: () => void;
}

export function PromptPreview({ prompt, setPrompt, onCopy, onExport }: PromptPreviewProps) {
  if (!prompt) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg text-muted-foreground p-8 text-center">
        <p>Fill in the form and click &quot;Generate Prompt&quot; to see the output here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generated Prompt</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export .txt
          </Button>
        </div>
      </div>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="flex-1 min-h-[400px] font-mono text-sm resize-none"
        placeholder="Your generated prompt will appear here..."
      />
      <p className="text-xs text-muted-foreground">
        You can manually edit the prompt above before copying or exporting.
      </p>
    </div>
  );
}
