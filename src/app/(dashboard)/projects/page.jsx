"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FolderKanban, ArrowRight, Users } from "lucide-react";
import { toast } from "sonner";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (res.ok) {
        toast.success("Project created successfully");
        setIsDialogOpen(false);
        setNewProject({ name: "", description: "" });
        fetchProjects();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create project");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">Projects</h1>
          <p className="mt-2 text-muted-foreground">The places where your team turns intent into finished work.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger 
            render={
              <Button className="h-10 rounded-lg bg-primary px-4 text-primary-foreground shadow-sm transition-all active:scale-95">
                <Plus className="mr-2 size-4" />
                New Project
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-lg p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">Create Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-medium text-foreground">Project Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  required
                  className="rounded-lg border-border bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium text-foreground">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What is this project about?"
                  className="rounded-lg border-border bg-background"
                />
              </div>
              <Button type="submit" disabled={creating} className="h-11 w-full rounded-lg bg-primary text-primary-foreground">
                {creating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {creating ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="soft-panel rounded-lg border-dashed py-24 text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-lg bg-muted">
            <FolderKanban className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">No projects yet</h3>
          <p className="mx-auto mb-6 max-w-sm text-muted-foreground">Create the first space for your team&apos;s work.</p>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-lg bg-primary text-primary-foreground">
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link key={project._id} href={`/projects/${project._id}`} className="group">
              <Card className="surface h-full cursor-pointer rounded-lg py-0 transition-all duration-200 hover:-translate-y-0.5">
                <CardHeader className="flex flex-row items-start justify-between p-5 pb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                        {project.name}
                      </CardTitle>
                      <Badge variant="outline" className={`rounded-md text-[10px] uppercase ${project.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-muted text-muted-foreground'}`}>
                        {project.status || 'ACTIVE'}
                      </Badge>
                    </div>
                    <p className="mt-2 min-h-[40px] line-clamp-2 text-sm leading-5 text-muted-foreground">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="-mr-2 -mt-2 size-8 text-muted-foreground">
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 px-5 pb-5">
                  <div className="mb-4 flex items-center rounded-lg border border-border/70 bg-muted/45 p-3 text-sm text-muted-foreground">
                    <div className="mr-3 flex size-9 items-center justify-center rounded-md bg-background font-semibold text-foreground">
                      {project._count?.tasks || 0}
                    </div>
                    <span className="font-medium">Tasks on board</span>
                  </div>
                </CardContent>
                <CardFooter className="mt-auto flex items-center justify-between rounded-b-lg border-t border-border/70 bg-muted/35 px-5 py-3">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member, i) => (
                      <div key={i} className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-xs font-semibold text-primary-foreground" title={member.user.name}>
                        {member.user.name.charAt(0)}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="flex size-8 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-semibold text-muted-foreground">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-xs font-medium text-muted-foreground">
                    <Users className="mr-1 size-3" />
                    {project.members.length} {project.members.length === 1 ? 'Member' : 'Members'}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
