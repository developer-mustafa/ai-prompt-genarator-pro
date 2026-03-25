"use client"

import * as React from "react"
import { auth, db } from "@/firebase"
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn, LogOut, Settings, User as UserIcon, Globe } from "lucide-react"
import { motion } from "motion/react"
import AdminPanel from "@/components/AdminPanel"

export default function Home() {
  const [user, setUser] = React.useState<User | null>(null)
  const [isAuthReady, setIsAuthReady] = React.useState(false)
  const [devData, setDevData] = React.useState<{ name: string; devPhotoURL: string } | null>(null)
  const [showAdmin, setShowAdmin] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthReady(true)
    })

    const unsubDev = onSnapshot(doc(db, "developers", "main"), (doc) => {
      if (doc.exists()) {
        setDevData(doc.data() as { name: string; devPhotoURL: string })
      }
    })

    return () => {
      unsubscribe()
      unsubDev()
    }
  }, [])

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Login failed:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setShowAdmin(false)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (!isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showAdmin && user?.email === "mustafa.rahman.official@gmail.com") {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-muted/40 p-4">
          <div className="container mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => setShowAdmin(false)}>
              Back to Home
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        <AdminPanel />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              AS
            </div>
            AI Studio
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.email === "mustafa.rahman.official@gmail.com" && (
                  <Button variant="ghost" size="sm" onClick={() => setShowAdmin(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Admin
                  </Button>
                )}
                <div className="hidden items-center gap-2 md:flex">
                  <span className="text-sm font-medium">{user.displayName || user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={handleLogin}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight lg:text-7xl">
            Build the Future with <span className="text-primary">AI Studio</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-muted-foreground">
            A comprehensive platform for building, managing, and deploying AI-powered applications with ease.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="h-12 px-8 text-lg">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              Documentation
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Developer Info Section */}
      {devData && (
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center">
              <h2 className="mb-12 text-3xl font-bold">Meet the Developer</h2>
              <Card className="w-full max-w-md overflow-hidden border-none bg-background shadow-xl">
                <CardHeader className="pb-0">
                  <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-primary/10 bg-muted">
                    {devData.devPhotoURL ? (
                      <img
                        src={devData.devPhotoURL}
                        alt={devData.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserIcon className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="text-center">
                  <CardTitle className="mb-2 text-2xl">{devData.name}</CardTitle>
                  <p className="mb-6 text-muted-foreground">Lead Developer & AI Enthusiast</p>
                  <div className="flex justify-center gap-4">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                      <Globe className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 AI Studio Applet. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
