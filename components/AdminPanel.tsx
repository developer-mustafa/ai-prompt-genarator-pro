"use client"

import * as React from "react"
import { auth, db } from "@/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Upload, X, User as UserIcon, ShieldCheck } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

export default function AdminPanel() {
  const [user, setUser] = React.useState<User | null>(null)
  const [isAdmin, setIsAdmin] = React.useState(false)
  const [isAuthReady, setIsAuthReady] = React.useState(false)
  const [devName, setDevName] = React.useState("")
  const [devPhotoURL, setDevPhotoURL] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Check if user is admin (simplified for now)
        // In a real app, you'd check a custom claim or a users collection
        if (currentUser.email === "mustafa.rahman.official@gmail.com") {
          setIsAdmin(true)
        }
      } else {
        setIsAdmin(false)
      }
      setIsAuthReady(true)
    })

    return () => unsubscribe()
  }, [])

  React.useEffect(() => {
    if (!isAdmin) return

    const unsub = onSnapshot(doc(db, "developers", "main"), (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        setDevName(data.name || "")
        setDevPhotoURL(data.devPhotoURL || "")
      }
    })

    return () => unsub()
  }, [isAdmin])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 800 * 1024) {
      toast.error("File size too large (max 800KB)")
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setDevPhotoURL(reader.result as string)
      setIsUploading(false)
      toast.success("Photo uploaded successfully")
    }
    reader.onerror = () => {
      setIsUploading(false)
      toast.error("Failed to upload photo")
    }
    reader.readAsDataURL(file)
  }

  const handleSaveDevInfo = async () => {
    if (!devName.trim()) {
      toast.error("Developer name is required")
      return
    }

    setIsSaving(true)
    try {
      await setDoc(doc(db, "developers", "main"), {
        name: devName,
        devPhotoURL: devPhotoURL,
        updatedAt: serverTimestamp()
      }, { merge: true })
      toast.success("Developer info saved successfully")
    } catch (error) {
      console.error("Error saving dev info:", error)
      toast.error("Failed to save developer info")
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAuthReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <ShieldCheck className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access the Admin Panel.</p>
        <Button onClick={() => window.location.href = "/"}>Go Back Home</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <p className="text-muted-foreground">Manage your application settings and developer info.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm font-medium">
          <UserIcon className="h-4 w-4" />
          {user?.email}
        </div>
      </motion.div>

      <Tabs defaultValue="dev-info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="dev-info">Developer Info</TabsTrigger>
          <TabsTrigger value="settings">General Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dev-info">
          <Card>
            <CardHeader>
              <CardTitle>Developer Information</CardTitle>
              <CardDescription>
                Update the developer details shown in the application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="dev-name">Name</Label>
                <Input
                  id="dev-name"
                  placeholder="Enter developer name"
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <Label>Developer Photo</Label>
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/25 bg-muted">
                    {devPhotoURL ? (
                      <img
                        src={devPhotoURL}
                        alt="Developer"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserIcon className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    <AnimatePresence>
                      {isUploading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"
                        >
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="relative overflow-hidden"
                        disabled={isUploading}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photo
                        <input
                          type="file"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </Button>
                      {devPhotoURL && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDevPhotoURL("")}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or WebP. Max size 800KB.
                    </p>
                    <div className="mt-2">
                      <Label htmlFor="photo-url" className="text-xs">Or Photo URL</Label>
                      <Input
                        id="photo-url"
                        placeholder="https://example.com/photo.jpg"
                        value={devPhotoURL.startsWith("data:") ? "" : devPhotoURL}
                        onChange={(e) => setDevPhotoURL(e.target.value)}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveDevInfo} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage application-wide configurations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">General settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
