import { PromptMode } from "@/lib/prompt-templates"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ModeSelectorProps {
  mode: PromptMode
  onModeChange: (mode: PromptMode) => void
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <Tabs value={mode} onValueChange={(v) => onModeChange(v as PromptMode)}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="feature">Feature</TabsTrigger>
        <TabsTrigger value="bugfix">Bug Fix</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
