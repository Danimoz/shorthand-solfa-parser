'use client';

import { Music, Plus, Save } from "lucide-react";
import { Sidebar, SidebarHeader, SidebarGroup, SidebarContent, SidebarMenu, SidebarGroupContent, SidebarGroupLabel, SidebarMenuItem, SidebarMenuButton } from "./ui/sidebar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import db from "@/lib/storage";
import { useLiveQuery } from "dexie-react-hooks";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export function AppSidebar() {
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false)
  const [isCreateLoading, setIsCreateLoading] = useState(false)
  const [newProjectData, setNewProjectData] = useState({ 
    name: "", 
    key: "",
    time: "",
    composer: "",
    tempoText: "",
    tempoBpm: "",
  })
  const { prefetch, push } = useRouter()
  const projects = useLiveQuery(() => db.projects.toArray(), [])
  const params = useParams();

  useEffect(() => {
    prefetch('/projects/[id]')
  }, [])

  async function handleCreateProject() {
    if (!newProjectData.name) {
      toast.error("Please enter a project name")
      return
    }
    setIsCreateLoading(true)
    try {
      const newProject = await db.projects.add({
        title: newProjectData.name,
        key: newProjectData.key,
        time: newProjectData.time,
        composer: newProjectData.composer,
        tempoText: newProjectData.tempoText,
        tempoBpm: newProjectData.tempoBpm,
        measures: []
      })
      toast.success("Project created successfully")
      setNewProjectData({ name: "", key: "", time: "", composer: "", tempoText: "", tempoBpm: "" })
      setIsNewProjectDialogOpen(false)
      push(`/projects/${newProject}`)
    } catch (error) {
      console.error("Error creating project:", error)
      setIsCreateLoading(false)
      toast.error("Error creating project")
    }
  }

  return (
    <Sidebar className="border-r" style={{ width: '16rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <SidebarHeader className="border-b px-4 py-2">
        <div className="flex items-center justify-between">
          <Link href="/">
            <h1 className="text-xl font-bold">Solfa Parser</h1>
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="mb-2">
              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={() => setIsNewProjectDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-220px)]">
              <h4 className="py-4">History</h4>
              <SidebarMenu>
                {projects?.length === 0 ? (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No projects yet. Create your first project!
                  </div>
                ) : (
                  projects?.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <SidebarMenuButton
                        isActive={params?.id === project.id}
                        tooltip={project.title}
                        asChild
                      >
                        <Link href={`/projects/${project.id}`} className="flex items-center gap-2 p-2 hover:underline">
                          <Music className="h-4 w-4" />
                          <span>{project.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Dialog open={isNewProjectDialogOpen} onOpenChange={setIsNewProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Create a new project to store your solfa notation measures.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="Enter project name"
                value={newProjectData.name}
                onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-key">Project Key</Label>
              <Input
                id="project-key"
                placeholder="Enter project key"
                value={newProjectData.key}
                onChange={(e) => setNewProjectData({ ...newProjectData, key: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-composer">Project Composer</Label>
              <Input
                id="project-composer"
                placeholder="Enter project composer"
                value={newProjectData.composer}
                onChange={(e) => setNewProjectData({ ...newProjectData, composer: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-time">Project Time</Label>
              <Input
                id="project-time"
                placeholder="Enter project time"
                value={newProjectData.time}
                onChange={(e) => setNewProjectData({ ...newProjectData, time: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-time">Tempo Text</Label>
              <Input
                id="tempo-text"
                placeholder="Enter project tempo text"
                value={newProjectData.tempoText}
                onChange={(e) => setNewProjectData({ ...newProjectData, tempoText: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-time">Tempo BPM</Label>
              <Input
                id="tempo-bpm"
                placeholder="Enter project tempo bpm"
                value={newProjectData.tempoBpm}
                onChange={(e) => setNewProjectData({ ...newProjectData, tempoBpm: e.target.value })}
              />               
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewProjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={isCreateLoading}>
              <Save className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
  )
}