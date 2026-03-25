"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { db, handleFirestoreError, OperationTypeEnum } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Shield, Key, Eye, EyeOff, Save, AlertTriangle, Users, History } from 'lucide-react';
import { toast } from 'sonner';

interface GlobalSettings {
  superAdminApiKey?: string;
  isSuperAdminApiKeyEnabled?: boolean;
  isSuperAdminApiKeyBlocked?: boolean;
  developerName?: string;
  developerAddress?: string;
  developerMobile?: string;
  developerUrl?: string;
  developerPhoto?: string;
  developerSkills?: string;
}

export function AdminDashboard() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<GlobalSettings>({
    superAdminApiKey: '',
    isSuperAdminApiKeyEnabled: false,
    isSuperAdminApiKeyBlocked: false,
    developerName: '',
    developerAddress: '',
    developerMobile: '',
    developerUrl: '',
    developerPhoto: '',
    developerSkills: '',
  });
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ users: 0, prompts: 0 });

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as GlobalSettings);
      }
    }, (err) => handleFirestoreError(err, OperationTypeEnum.GET, 'settings/global'));

    // Fetch stats
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const promptsSnap = await getDocs(collection(db, 'prompts'));
        setStats({
          users: usersSnap.size,
          prompts: promptsSnap.size,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();

    return () => unsubscribe();
  }, [profile?.role]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
      toast.success("Settings updated successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationTypeEnum.UPDATE, 'settings/global');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500KB limit for base64 in firestore
        toast.error("Photo is too large. Please use a photo under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, developerPhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <Shield className="mr-2 h-5 w-5" />
        Access Denied. Admin only.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Key Management */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              Super Admin API Key
            </CardTitle>
            <CardDescription>
              Manage the default API key used when users haven&apos;t provided their own.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Gemini API Key</Label>
              <div className="flex gap-2">
                <Input 
                  type={showKey ? "text" : "password"} 
                  placeholder="Enter Super Admin API Key" 
                  value={settings.superAdminApiKey || ''}
                  onChange={(e) => setSettings({...settings, superAdminApiKey: e.target.value})}
                />
                <Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="space-y-0.5">
                <Label>Enable Fallback</Label>
                <p className="text-xs text-muted-foreground">Allow users to use this key if they don&apos;t have one.</p>
              </div>
              <Switch 
                checked={settings.isSuperAdminApiKeyEnabled} 
                onCheckedChange={(checked) => setSettings({...settings, isSuperAdminApiKeyEnabled: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20 bg-destructive/5">
              <div className="space-y-0.5">
                <Label className="text-destructive">Block Key</Label>
                <p className="text-xs text-muted-foreground">Completely disable this key for all operations.</p>
              </div>
              <Switch 
                checked={settings.isSuperAdminApiKeyBlocked} 
                onCheckedChange={(checked) => setSettings({...settings, isSuperAdminApiKeyBlocked: checked})}
                className="data-[state=checked]:bg-destructive"
              />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* System Stats */}
        <Card className="border-primary/10 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              System Overview
            </CardTitle>
            <CardDescription>Real-time system usage and stats.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="p-6 border rounded-xl bg-primary/5 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary opacity-50" />
              <h3 className="text-3xl font-bold">{stats.users}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Users</p>
            </div>
            <div className="p-6 border rounded-xl bg-primary/5 text-center">
              <History className="h-8 w-8 mx-auto mb-2 text-primary opacity-50" />
              <h3 className="text-3xl font-bold">{stats.prompts}</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Prompts</p>
            </div>
            
            <div className="col-span-2 p-4 border rounded-lg bg-amber-500/5 border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-semibold mb-1">Security Warning</p>
                <p>Ensure the Super Admin key is kept private. Blocking the key will immediately stop all AI generation for users without their own keys.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Developer Credit Management */}
        <Card className="border-primary/20 shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Developer Credit
            </CardTitle>
            <CardDescription>
              Set the developer information shown in the footer and header.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Developer Name</Label>
                <Input 
                  placeholder="Enter Name" 
                  value={settings.developerName || ''}
                  onChange={(e) => setSettings({...settings, developerName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Developer Mobile</Label>
                <Input 
                  placeholder="Enter Mobile Number" 
                  value={settings.developerMobile || ''}
                  onChange={(e) => setSettings({...settings, developerMobile: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Developer Address</Label>
                <Input 
                  placeholder="Enter Address" 
                  value={settings.developerAddress || ''}
                  onChange={(e) => setSettings({...settings, developerAddress: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Developer URL</Label>
                <Input 
                  placeholder="Enter Website URL" 
                  value={settings.developerUrl || ''}
                  onChange={(e) => setSettings({...settings, developerUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Developer Skills</Label>
                <Input 
                  placeholder="Enter Skills (e.g. React, Next.js, Firebase)" 
                  value={settings.developerSkills || ''}
                  onChange={(e) => setSettings({...settings, developerSkills: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Developer Photo</Label>
                <div className="flex items-center gap-4">
                  {settings.developerPhoto && (
                    <Image 
                      src={settings.developerPhoto} 
                      alt="Preview" 
                      width={48} 
                      height={48} 
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-full object-cover border" 
                    />
                  )}
                  <Input 
                    type="file" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Max size 500KB. Recommended square aspect ratio.</p>
              </div>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? "Saving..." : "Save Developer Credit"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
