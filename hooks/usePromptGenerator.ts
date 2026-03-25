import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PromptMode, PromptData, HistoryItem, generatePrompt } from '@/lib/prompt-templates';
import { toast } from 'sonner';
import { GoogleGenAI } from '@google/genai';
import { auth, db, googleProvider } from '@/lib/firebase';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, getDocs, writeBatch, orderBy, limit } from 'firebase/firestore';

export const usePromptGenerator = () => {
  const [mode, setMode] = useState<PromptMode>('general');
  const [formData, setFormData] = useState<Partial<PromptData>>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync history with Firestore if user is logged in
  useEffect(() => {
    if (!user) {
      // Load from local storage if not logged in
      const savedHistory = localStorage.getItem('prompt_history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Failed to parse history', e);
        }
      }
      return;
    }

    // Load from Firestore if logged in
    const q = query(
      collection(db, 'history'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: HistoryItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          mode: data.mode,
          data: data.data,
          generatedPrompt: data.generatedPrompt,
          timestamp: data.timestamp,
        });
      });
      setHistory(items);
    }, (error) => {
      console.error('Firestore error:', error);
      toast.error('Failed to sync history with cloud.');
    });

    return () => unsubscribe();
  }, [user]);

  // Save history to local storage when it changes (only for non-logged in users)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('prompt_history', JSON.stringify(history));
    }
  }, [history, user]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Signed in successfully!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Failed to sign in.');
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setHistory([]);
      toast.success('Signed out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to sign out.');
    }
  };

  const handleModeChange = (newMode: PromptMode) => {
    setMode(newMode);
    setFormData({}); // Reset form data when mode changes
    setGeneratedPrompt('');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generate = async () => {
    // Basic validation based on mode
    let isValid = true;
    if (mode === 'general') {
      const data = formData as any;
      if (!data.task || !data.context) isValid = false;
    } else if (mode === 'feature') {
      const data = formData as any;
      if (!data.projectDescription || !data.techStack || !data.newFeatureRequirement) isValid = false;
    } else if (mode === 'bugfix') {
      const data = formData as any;
      if (!data.projectDescription || !data.techStack || !data.bugDescription || !data.expectedBehavior) isValid = false;
    }

    if (!isValid) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || "" });
      const basePrompt = generatePrompt(mode, formData as PromptData);
      
      const metaPrompt = `You are an expert AI Prompt Engineer. Your task is to write a highly optimized, structured, and effective prompt based on the user's requirements.

The user wants to generate a prompt for the following scenario: ${mode.toUpperCase()}

Here are the details the user provided:
${JSON.stringify(formData, null, 2)}

Here is a basic draft of the prompt:
---
${basePrompt}
---

Please enhance and expand this draft into a professional, highly detailed, and structured prompt that the user can directly copy and paste into an LLM (like ChatGPT, Claude, or Gemini) to get the best possible results.
Do not include any conversational filler like "Here is your prompt", just output the final prompt itself. Use Markdown formatting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: metaPrompt,
      });

      const finalPrompt = response.text || basePrompt;
      setGeneratedPrompt(finalPrompt);

      // Save to history
      const newItemData = {
        mode,
        data: formData as PromptData,
        generatedPrompt: finalPrompt,
        timestamp: Date.now(),
      };

      if (user) {
        await addDoc(collection(db, 'history'), {
          ...newItemData,
          userId: user.uid,
        });
      } else {
        const newItem: HistoryItem = {
          id: uuidv4(),
          ...newItemData,
        };
        setHistory((prev) => [newItem, ...prev].slice(0, 50));
      }
      
      toast.success('Prompt generated successfully with AI!');
    } catch (error) {
      console.error('Error generating prompt with AI:', error);
      toast.error('Failed to generate prompt with AI. Falling back to template.');
      
      const prompt = generatePrompt(mode, formData as PromptData);
      setGeneratedPrompt(prompt);
      
      const newItemData = {
        mode,
        data: formData as PromptData,
        generatedPrompt: prompt,
        timestamp: Date.now(),
      };

      if (user) {
        await addDoc(collection(db, 'history'), {
          ...newItemData,
          userId: user.uid,
        });
      } else {
        const newItem: HistoryItem = {
          id: uuidv4(),
          ...newItemData,
        };
        setHistory((prev) => [newItem, ...prev].slice(0, 50));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard.');
    }
  };

  const exportAsTxt = () => {
    if (!generatedPrompt) return;
    const blob = new Blob([generatedPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${mode}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exported as .txt file!');
  };

  const loadFromHistory = (item: HistoryItem) => {
    setMode(item.mode);
    setFormData(item.data);
    setGeneratedPrompt(item.generatedPrompt);
    toast.info('Loaded prompt from history.');
  };

  const clearHistory = async () => {
    if (user) {
      try {
        const q = query(collection(db, 'history'), where('userId', '==', user.uid));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        toast.success('Cloud history cleared.');
      } catch (error) {
        console.error('Error clearing history:', error);
        toast.error('Failed to clear cloud history.');
      }
    } else {
      setHistory([]);
      toast.success('Local history cleared.');
    }
  };

  return {
    mode,
    formData,
    generatedPrompt,
    history,
    isGenerating,
    user,
    isAuthLoading,
    setGeneratedPrompt,
    handleModeChange,
    handleInputChange,
    generate,
    copyToClipboard,
    exportAsTxt,
    loadFromHistory,
    clearHistory,
    login,
    logout,
  };
};
