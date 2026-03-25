import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Download } from "lucide-react"

interface PromptPreviewProps {
  prompt: string
  setPrompt: (prompt: string) => void
  onCopy: () => void
  onExport: () => void
}

export function PromptPreview({ prompt, setPrompt, onCopy, onExport }: PromptPreviewProps) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Generated Prompt</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onCopy} disabled={!prompt}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={onExport} disabled={!prompt}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      <Textarea
        className="flex-1 font-mono text-sm resize-none bg-muted/50 p-4 leading-relaxed"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Your generated prompt will appear here..."
      />
    </div>
  )
}
