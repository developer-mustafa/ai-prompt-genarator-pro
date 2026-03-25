"use client";

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/AuthGuard';
import { PromptGenerator } from '@/components/PromptGenerator';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Button } from '@/components/ui/button';
import { Wand2, LogOut, Shield, LayoutDashboard, Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeveloperHeaderModal, DeveloperFooter } from '@/components/DeveloperCredit';

export default function Home() {
  const { profile, logout } = useAuth();
  const { setTheme, theme } = useTheme();
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-muted/20">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:inline-block">AI Prompt Pro</span>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="rounded-full"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>

              <DeveloperHeaderModal />

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage 
                          src={profile?.photoURL || (profile?.displayName ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}` : '')} 
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {profile?.displayName?.charAt(0) || <User className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.displayName || 'User'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
                        <p className="text-[10px] font-bold uppercase text-primary mt-1">{profile?.role}</p>
                      </div>
                    </DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {activeTab === 'generator' ? 'Prompt Generator' : 'Admin Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                  {activeTab === 'generator' 
                    ? 'Create professional AI prompts with Gemini models.' 
                    : 'Manage system settings and monitor usage.'}
                </p>
              </div>
              
              {profile?.role === 'admin' && (
                <TabsList className="grid w-full sm:w-[300px] grid-cols-2">
                  <TabsTrigger value="generator" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Generator
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>
              )}
            </div>

            <TabsContent value="generator" className="mt-0">
              <PromptGenerator />
            </TabsContent>

            {profile?.role === 'admin' && (
              <TabsContent value="admin" className="mt-0">
                <AdminDashboard />
              </TabsContent>
            )}
          </Tabs>
        </main>

        <DeveloperFooter />
      </div>
    </AuthGuard>
  );
}
