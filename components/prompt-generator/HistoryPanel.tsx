import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { HistoryItem } from "@/lib/prompt-templates"
import { Trash2, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface HistoryPanelProps {
  history: HistoryItem[]
  onClear: () => void
  onLoad: (item: HistoryItem) => void
}

export function HistoryPanel({ history, onClear, onLoad }: HistoryPanelProps) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Recent Prompts</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p className="text-sm">No history yet.</p>
          </div>
        ) : (
          <div className="space-y-3 pr-4">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => onLoad(item)}
                className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary/70">
                    {item.mode}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-accent-foreground">
                  {item.generatedPrompt.substring(0, 100)}...
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
