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
import { Wand2, Copy, Trash2, History, Settings, Loader2, Check, AlertCircle } from 'lucide-react';
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
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings | null>(null);
  const [userApiKey, setUserApiKey] = useState(profile?.userApiKey || '');

  // Fetch history
  useEffect(() => {
    if (!user) return;
    
    const q = profile?.role === 'admin' 
      ? query(collection(db, 'prompts'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'prompts'), where('uid', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prompts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prompt));
      setHistory(prompts);
    }, (err) => handleFirestoreError(err, OperationTypeEnum.LIST, 'prompts'));

    return () => unsubscribe();
  }, [user, profile?.role]);

  // Fetch global settings
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setGlobalSettings(docSnap.data() as GlobalSettings);
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

  const saveApiKey = async () => {
    await updateProfile({ userApiKey });
    toast.success("API Key updated!");
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
              <Select value={model} onValueChange={setModel}>
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
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(generatedPrompt)}>
                    <Copy className="h-4 w-4" />
                  </Button>
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
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-sm">{item.title}</h4>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(item.createdAt?.toDate()).toLocaleString()} • {item.modelUsed}
                        </p>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.generatedPrompt)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item.id)}>
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
