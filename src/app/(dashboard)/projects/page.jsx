"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FolderKanban, MoreVertical, Users } from "lucide-react";
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1 text-lg">Manage your team's projects and boards</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                New Project
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">Create Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold text-slate-700">Project Name</Label>
                <Input
                  id="name"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder="e.g. Website Redesign"
                  required
                  className="rounded-xl border-slate-200 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="font-semibold text-slate-700">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder="What is this project about?"
                  className="rounded-xl border-slate-200 focus:ring-indigo-500"
                />
              </div>
              <Button type="submit" disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-indigo-100">
                {creating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {creating ? "Creating..." : "Create Project"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FolderKanban className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No projects yet</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get started by creating a new project to organize your team's work.</p>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl">
            Create your first project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project._id} href={`/projects/${project._id}`}>
              <Card className="border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white cursor-pointer h-full flex flex-col group overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                        {project.name}
                      </CardTitle>
                      <Badge className={`text-[10px] uppercase ${project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}`}>
                        {project.status || 'ACTIVE'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2 min-h-[40px]">
                      {project.description || "No description provided."}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-slate-600 -mr-2 -mt-2">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pb-4 flex-1">
                  <div className="flex items-center text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="w-8 h-8 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mr-3">
                      {project._count?.tasks || 0}
                    </div>
                    <span className="font-medium">Total Tasks</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 border-t border-slate-100 mt-auto bg-slate-50/50 flex justify-between items-center py-3">
                  <div className="flex -space-x-2">
                    {project.members.slice(0, 3).map((member, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold" title={member.user.name}>
                        {member.user.name.charAt(0)}
                      </div>
                    ))}
                    {project.members.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-xs font-bold">
                        +{project.members.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-500 flex items-center">
                    <Users className="w-3 h-3 mr-1" />
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
