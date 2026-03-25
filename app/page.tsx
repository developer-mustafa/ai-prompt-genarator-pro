"use client";

import { useState } from 'react';
import { usePromptGenerator } from '@/hooks/usePromptGenerator';
import { ModeSelector } from '@/components/prompt-generator/ModeSelector';
import { DynamicForm } from '@/components/prompt-generator/DynamicForm';
import { PromptPreview } from '@/components/prompt-generator/PromptPreview';
import { HistoryPanel } from '@/components/prompt-generator/HistoryPanel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Wand2, History } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function Home() {
  const {
    mode,
    formData,
    generatedPrompt,
    history,
    isGenerating,
    setGeneratedPrompt,
    handleModeChange,
    handleInputChange,
    generate,
    copyToClipboard,
    exportAsTxt,
    loadFromHistory,
    clearHistory,
  } = usePromptGenerator();

  const { setTheme, theme } = useTheme();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-primary" />
            <span className="font-bold sm:inline-block tracking-tight">Smart AI Prompt Generator</span>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
              <DialogTrigger render={<Button variant="ghost" size="icon" title="History" />}>
                <History className="h-5 w-5" />
                <span className="sr-only">History</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>Prompt History</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden py-4">
                  <HistoryPanel
                    history={history}
                    onLoad={(item) => {
                      loadFromHistory(item);
                      setIsHistoryOpen(false);
                    }}
                    onClear={clearHistory}
                  />
                </div>
              </DialogContent>
            </Dialog>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              title="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-6">
            <Card className="flex-1 flex flex-col border-primary/10 shadow-md">
              <CardHeader className="pb-4 bg-muted/30">
                <CardTitle className="text-xl">Configure Prompt</CardTitle>
                <CardDescription>
                  Select a mode and fill in the details to generate an optimized prompt.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col space-y-6 pt-6">
                <ModeSelector mode={mode} onModeChange={handleModeChange} />
                <Separator />
                <div className="flex-1 overflow-y-auto pr-2 pb-2">
                  <DynamicForm mode={mode} formData={formData} onChange={handleInputChange} />
                </div>
                <Button onClick={generate} className="w-full mt-auto" size="lg" disabled={isGenerating}>
                  <Wand2 className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Generating with AI...' : 'Generate Prompt'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[calc(100vh-8rem)] lg:h-auto min-h-[500px]">
            <Card className="flex-1 flex flex-col shadow-md border-primary/10">
              <CardContent className="p-6 flex-1 flex flex-col h-full">
                <PromptPreview
                  prompt={generatedPrompt}
                  setPrompt={setGeneratedPrompt}
                  onCopy={copyToClipboard}
                  onExport={exportAsTxt}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
