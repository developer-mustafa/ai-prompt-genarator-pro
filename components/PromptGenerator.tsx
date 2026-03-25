"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db, handleFirestoreError, OperationTypeEnum } from '@/lib/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { generateAIResponse } from '@/lib/ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wand2, Copy, Trash2, History, Settings, Loader2, Check, AlertCircle, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

interface Prompt {
  id: string;
  uid: string;
  title: string;
  inputCriteria: Record<string, unknown>;
  generatedPrompt: string;
  modelUsed: string;
  createdAt: unknown;
}

interface GlobalSettings {
  superAdminApiKey?: string;
  isSuperAdminApiKeyEnabled?: boolean;
  isSuperAdminApiKeyBlocked?: boolean;
}

interface DeveloperInfo {
  developerName?: string;
  developerAddress?: string;
  developerMobile?: string;
  developerUrl?: string;
  developerPhoto?: string;
  developerSkills?: string;
}

export function PromptGenerator() {
  const { user, profile, updateProfile } = useAuth();
  const [model, setModel] = useState('gemini-3.1-pro-preview');
  const [criteria, setCriteria] = useState({
    task: '',
    context: '',
    constraints: '',
    format: '',
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Prompt[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings & DeveloperInfo | null>(null);
  const [userApiKey, setUserApiKey] = useState(profile?.userApiKey || '');

  // Load history from localStorage on mount (Smart Caching)
  useEffect(() => {
    if (!user) return;
    const cachedHistory = localStorage.getItem(`prompt_history_${user.uid}`);
    if (cachedHistory) {
      try {
        setHistory(JSON.parse(cachedHistory));
      } catch (e) {
        console.error("Failed to parse cached history", e);
      }
    }
  }, [user]);

  // Fetch history
  useEffect(() => {
    if (!user) return;
    
    const q = profile?.role === 'admin' 
      ? query(collection(db, 'prompts'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'prompts'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prompts = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          // Handle Firestore Timestamp for local storage serialization
          createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
        } as Prompt;
      });
      setHistory(prompts);
      // Save to localStorage for smart caching
      localStorage.setItem(`prompt_history_${user.uid}`, JSON.stringify(prompts));
    }, (err) => handleFirestoreError(err, OperationTypeEnum.LIST, 'prompts'));

    return () => unsubscribe();
  }, [user, profile?.role]);

  // Fetch global settings
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalSettings(docSnap.data() as GlobalSettings & DeveloperInfo);
      }
    }, (err) => handleFirestoreError(err, OperationTypeEnum.GET, 'settings/global'));

    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!criteria.task) {
      toast.error("Please enter a task description.");
      return;
    }

    setIsGenerating(true);
    try {
      // API Key Logic
      let apiKeyToUse = profile?.userApiKey;
      
      if (!apiKeyToUse) {
        if (globalSettings?.isSuperAdminApiKeyEnabled && !globalSettings?.isSuperAdminApiKeyBlocked) {
          apiKeyToUse = globalSettings.superAdminApiKey;
        }
      }

      if (!apiKeyToUse) {
        throw new Error("No API key available. Please set your own API key in settings or contact admin.");
      }

      const promptToAI = `
        Act as a professional prompt engineer. Generate a high-quality, structured prompt based on the following criteria:
        Task: ${criteria.task}
        Context: ${criteria.context}
        Constraints: ${criteria.constraints}
        Format: ${criteria.format}
        
        The output should be the prompt itself, ready to be used with an AI model.
      `;

      const response = await generateAIResponse(promptToAI, model, apiKeyToUse);
      setGeneratedPrompt(response);

      // Save to Firestore
      await addDoc(collection(db, 'prompts'), {
        uid: user?.uid,
        title: criteria.task.substring(0, 50),
        inputCriteria: criteria,
        generatedPrompt: response,
        modelUsed: model,
        createdAt: new Date(),
      });

      toast.success("Prompt generated and saved!");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate prompt.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'prompts', id));
      toast.success("Prompt deleted.");
    } catch (error) {
      handleFirestoreError(error, OperationTypeEnum.DELETE, `prompts/${id}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handlePrint = (prompt: string, title: string = "AI Generated Prompt") => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Please allow popups to print.");
      return;
    }

    // Dynamic font size based on length
    let fontSize = "12pt";
    if (prompt.length > 2000) fontSize = "10pt";
    if (prompt.length > 4000) fontSize = "9pt";
    if (prompt.length < 500) fontSize = "14pt";

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            font-size: ${fontSize};
          }
          .header {
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .dev-branding {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .dev-photo {
            width: 50px;
            height: 50px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid #e5e7eb;
          }
          .dev-info {
            display: flex;
            flex-direction: column;
          }
          .dev-name {
            font-size: 14pt;
            font-weight: bold;
            color: #1e40af;
            margin: 0;
          }
          .dev-contact {
            font-size: 8pt;
            color: #6b7280;
          }
          .doc-meta {
            text-align: right;
          }
          .doc-title {
            font-size: 10pt;
            color: #3b82f6;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .doc-date {
            font-size: 8pt;
            color: #9ca3af;
          }
          .content {
            white-space: pre-wrap;
            word-wrap: break-word;
            text-align: justify;
            background: #fff;
          }
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
            font-size: 8pt;
            color: #9ca3af;
            text-align: center;
            display: flex;
            justify-content: space-between;
            background: white;
          }
          @media print {
            .no-print { display: none; }
            body { -webkit-print-color-adjust: exact; }
          }
          /* Smart Page Breaks */
          h1, h2, h3 { page-break-after: avoid; }
          p { orphans: 3; widows: 3; }
          .content { page-break-inside: auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="dev-branding">
            ${globalSettings?.developerPhoto ? `<img src="${globalSettings.developerPhoto}" class="dev-photo" />` : ''}
            <div class="dev-info">
              <h1 class="dev-name">${globalSettings?.developerName || 'AI Prompt Pro'}</h1>
              <div class="dev-contact">
                ${globalSettings?.developerAddress ? `<span>${globalSettings.developerAddress}</span>` : ''}
                ${globalSettings?.developerMobile ? `<span> • ${globalSettings.developerMobile}</span>` : ''}
              </div>
              ${globalSettings?.developerUrl ? `<div class="dev-contact">${globalSettings.developerUrl}</div>` : ''}
            </div>
          </div>
          <div class="doc-meta">
            <div class="doc-title">${title}</div>
            <div class="doc-date">Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        
        <div class="content">
          ${prompt}
        </div>

        <div class="footer">
          <span>Handcrafted by ${globalSettings?.developerName || 'AI Prompt Pro'}</span>
          <span>Page 1 of 1</span>
        </div>

        <script>
          window.onload = () => {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const saveApiKey = async () => {
    await updateProfile({ userApiKey });
    toast.success("API Key updated!");
  };

  const handleLoadHistory = (item: Prompt) => {
    setCriteria({
      task: (item.inputCriteria?.task as string) || '',
      context: (item.inputCriteria?.context as string) || '',
      constraints: (item.inputCriteria?.constraints as string) || '',
      format: (item.inputCriteria?.format as string) || '',
    });
    setModel(item.modelUsed || 'gemini-3.1-pro-preview');
    setGeneratedPrompt(item.generatedPrompt);
    toast.info("Prompt loaded from history");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Section */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Configuration
            </CardTitle>
            <CardDescription>Set your criteria and model.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Model Selection</Label>
              <Select value={model} onValueChange={(val) => val && setModel(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-3.1-pro-preview">Gemini 3.1 Pro</SelectItem>
                  <SelectItem value="gemini-3-flash-preview">Gemini 3 Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Your API Key (Optional)</Label>
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  placeholder="Enter your Gemini API Key" 
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                />
                <Button variant="outline" size="icon" onClick={saveApiKey}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">If not set, system default key will be used (if enabled).</p>
            </div>

            <div className="space-y-2">
              <Label>Task / Objective</Label>
              <Textarea 
                placeholder="What do you want the AI to do?" 
                value={criteria.task}
                onChange={(e) => setCriteria({...criteria, task: e.target.value})}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Context (Optional)</Label>
              <Input 
                placeholder="Background info, target audience..." 
                value={criteria.context}
                onChange={(e) => setCriteria({...criteria, context: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Constraints (Optional)</Label>
              <Input 
                placeholder="Word count, tone, things to avoid..." 
                value={criteria.constraints}
                onChange={(e) => setCriteria({...criteria, constraints: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Output Format (Optional)</Label>
              <Input 
                placeholder="Markdown, JSON, Bullet points..." 
                value={criteria.format}
                onChange={(e) => setCriteria({...criteria, format: e.target.value})}
              />
            </div>

            <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              Generate Prompt
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Result & History Section */}
      <div className="lg:col-span-2 space-y-6">
        <AnimatePresence mode="wait">
          {generatedPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-primary/20 bg-primary/5 shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Generated Prompt</CardTitle>
                    <CardDescription>Ready to use with {model}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handlePrint(generatedPrompt)} className="h-8 border-primary/20 hover:bg-primary/5">
                      <Printer className="mr-2 h-4 w-4" />
                      Print A4
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedPrompt)} className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-background rounded-lg border">
                    {generatedPrompt}
                  </pre>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              History
            </CardTitle>
            <CardDescription>Your recently generated prompts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No prompts generated yet.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                    onClick={() => handleLoadHistory(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(item.createdAt as string).toLocaleString()} • {item.modelUsed}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLoadHistory(item);
                          }}
                          title="Load into generator"
                        >
                          <History className="h-3 w-3 text-primary" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrint(item.generatedPrompt, item.title);
                          }}
                          title="Print A4"
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(item.generatedPrompt);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs line-clamp-2 text-muted-foreground italic">
                      {item.generatedPrompt}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
