import { HistoryItem } from '@/lib/prompt-templates';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Trash2, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoad: (item: HistoryItem) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onLoad, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No history yet. Generated prompts will appear here.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Recent Prompts
        </h3>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive h-8 px-2">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All
        </Button>
      </div>
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => onLoad(item)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium uppercase tracking-wider text-primary">
                  {item.mode}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm line-clamp-2 text-muted-foreground mb-2">
                {item.generatedPrompt}
              </p>
              <div className="flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Load Prompt <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
