"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Globe, Phone, MapPin, ExternalLink, Code2 } from 'lucide-react';

interface DeveloperInfo {
  developerName?: string;
  developerAddress?: string;
  developerMobile?: string;
  developerUrl?: string;
  developerPhoto?: string;
  developerSkills?: string;
}

export function DeveloperHeaderModal() {
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setDevInfo(docSnap.data() as DeveloperInfo);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!devInfo?.developerName) return null;

  const skills = devInfo.developerSkills?.split(',').map(s => s.trim()).filter(Boolean) || [];

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors">
            <Info className="h-5 w-5 text-primary" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px] border-primary/20 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
            <Code2 className="h-6 w-6 text-primary" />
            Developer Profile
          </DialogTitle>
          <DialogDescription>
            Information about the creator of this application.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-4">
            {devInfo.developerPhoto ? (
              <Image 
                src={devInfo.developerPhoto} 
                alt={devInfo.developerName} 
                width={80}
                height={80}
                unoptimized
                referrerPolicy="no-referrer"
                className="h-20 w-20 rounded-2xl object-cover border-2 border-primary/20 shadow-lg"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-lg">
                <Code2 className="h-10 w-10 text-primary/40" />
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-foreground">{devInfo.developerName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {devInfo.developerAddress}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {devInfo.developerMobile && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{devInfo.developerMobile}</span>
              </div>
            )}
            {devInfo.developerUrl && (
              <a 
                href={devInfo.developerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
              >
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium flex-1">{devInfo.developerUrl}</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
            )}
          </div>

          {skills.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Expertise & Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="bg-primary/5 text-primary border-primary/10 hover:bg-primary/10">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function DeveloperFooter() {
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setDevInfo(docSnap.data() as DeveloperInfo);
      }
    });
    return () => unsubscribe();
  }, []);

  if (!devInfo?.developerName) return null;

  return (
    <footer className="mt-auto py-8 border-t border-primary/5 bg-background/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {devInfo.developerPhoto ? (
              <Image 
                src={devInfo.developerPhoto} 
                alt={devInfo.developerName} 
                width={48}
                height={48}
                unoptimized
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full object-cover border border-primary/20"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/20">
                <Code2 className="h-6 w-6 text-primary/40" />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-foreground">{devInfo.developerName}</p>
              <p className="text-xs text-muted-foreground">{devInfo.developerAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {devInfo.developerMobile && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Phone className="h-3 w-3 text-primary/60" />
                {devInfo.developerMobile}
              </div>
            )}
            {devInfo.developerUrl && (
              <a 
                href={devInfo.developerUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <Globe className="h-3 w-3" />
                Portfolio
              </a>
            )}
          </div>

          <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} • Handcrafted with Precision
          </div>
        </div>
      </div>
    </footer>
  );
}
