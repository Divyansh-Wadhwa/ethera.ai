"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ArrowLeft, MoreHorizontal, Calendar, AlertCircle, Users, XIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Task creation state
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    assigneeId: "unassigned"
  });
  const [creatingTask, setCreatingTask] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      if (res.status === 404) {
        toast.error("Project not found");
        router.push("/projects");
        return;
      }
      if (!res.ok) throw new Error("Failed to load project");
      
      const data = await res.json();
      setProject(data);
    } catch (error) {
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProject();
  }, [params.id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreatingTask(true);
    try {
      const taskData = {
        ...newTask,
        projectId: params.id,
        assigneeId: newTask.assigneeId === "unassigned" ? null : newTask.assigneeId
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (res.ok) {
        toast.success("Task created");
        setIsTaskDialogOpen(false);
        setNewTask({ title: "", description: "", status: "TODO", priority: "MEDIUM", assigneeId: "unassigned" });
        fetchProject();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create task");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setCreatingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) return null;

  const isAdmin = project.members.some(
    (m) => m.user._id === session?.user?.id && m.role === "ADMIN"
  );

  const tasksByStatus = {
    TODO: project.tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: project.tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: project.tasks.filter((t) => t.status === "DONE"),
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <Link href="/projects" className="flex w-fit items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="mr-1 size-4" />
          Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">{project.name}</h1>
              {isAdmin ? (
                <Select 
                  value={project.status || "ACTIVE"} 
                  onValueChange={async (newStatus) => {
                    const updatedProject = { ...project, status: newStatus };
                    setProject(updatedProject);
                    try {
                      await fetch(`/api/projects/${params.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: newStatus })
                      });
                      toast.success(`Project marked as ${newStatus.toLowerCase()}`);
                    } catch (err) {
                      toast.error("Failed to update project status");
                      fetchProject();
                    }
                  }}
                >
                  <SelectTrigger className={`h-7 w-[110px] rounded-md border px-2 text-[10px] font-bold uppercase tracking-wider ${project.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-muted text-muted-foreground'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-xs font-medium">Active</SelectItem>
                    <SelectItem value="COMPLETED" className="text-xs font-medium text-emerald-700">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className={project.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-border bg-muted text-muted-foreground'}>
                  {project.status || "ACTIVE"}
                </Badge>
              )}
            </div>
            <p className="mt-2 max-w-2xl text-muted-foreground">{project.description || "No description provided."}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-2">
              {project.members.map((member, i) => (
                <div key={i} className="flex size-9 items-center justify-center rounded-full border-2 border-background bg-primary text-xs font-semibold text-primary-foreground shadow-sm" title={member.user.name + ` (${member.role})`}>
                  {member.user.name.charAt(0)}
                </div>
              ))}
            </div>

            {isAdmin && (
              <Dialog>
                <DialogTrigger 
                  render={
                    <Button variant="outline" className="rounded-lg bg-card shadow-sm transition-all active:scale-95">
                      <Users className="mr-1.5 size-4" />
                      Members
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">Manage Members</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 mt-4">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const emailInput = e.target.elements.email;
                      const email = emailInput.value;
                      if(!email) return;
                      
                      try {
                        const res = await fetch(`/api/projects/${params.id}/members`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email })
                        });
                        const data = await res.json();
                        if(res.ok) {
                          toast.success("Member added");
                          emailInput.value = "";
                          fetchProject();
                        } else {
                          toast.error(data.message || "Failed to add member");
                        }
                      } catch(err) {
                        toast.error("Error adding member");
                      }
                    }} className="flex gap-2">
                      <Input name="email" type="email" placeholder="Email address to add..." className="flex-1 rounded-lg" required />
                      <Button type="submit" className="rounded-lg bg-primary text-primary-foreground">Add</Button>
                    </form>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Current Team</h4>
                      {project.members.map(member => (
                        <div key={member.user._id} className="flex items-center justify-between rounded-lg border border-border bg-muted/45 p-3">
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
                              {member.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{member.user.name}</p>
                              <p className="text-xs text-muted-foreground">{member.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={member.role === "ADMIN" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-border bg-background text-muted-foreground"}>
                              {member.role}
                            </Badge>
                            {member.user._id !== session?.user?.id && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="size-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/projects/${params.id}/members?userId=${member.user._id}`, {
                                      method: "DELETE"
                                    });
                                    if(res.ok) {
                                      toast.success("Member removed");
                                      fetchProject();
                                    } else {
                                      const data = await res.json();
                                      toast.error(data.message);
                                    }
                                  } catch(err) {
                                    toast.error("Error removing member");
                                  }
                                }}
                              >
                                <XIcon className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {isAdmin && (
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger 
                  render={
                    <Button className="rounded-lg bg-primary text-primary-foreground shadow-sm transition-all active:scale-95">
                      <Plus className="mr-1.5 size-4" />
                      New Task
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[500px] rounded-lg p-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold tracking-tight text-foreground">Create Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label className="font-medium text-foreground">Task Title</Label>
                      <Input
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="What needs to be done?"
                        required
                        className="rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium text-foreground">Description</Label>
                      <Input
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Add more details..."
                        className="rounded-lg"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-medium text-foreground">Status</Label>
                        <Select value={newTask.status} onValueChange={(v) => setNewTask({...newTask, status: v})}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="DONE">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="font-medium text-foreground">Priority</Label>
                        <Select value={newTask.priority} onValueChange={(v) => setNewTask({...newTask, priority: v})}>
                          <SelectTrigger className="rounded-lg">
                            <SelectValue placeholder="Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-medium text-foreground">Assign To</Label>
                      <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask({...newTask, assigneeId: v})}>
                        <SelectTrigger className="rounded-lg">
                          <SelectValue placeholder="Select member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {project.members.map((m) => (
                            <SelectItem key={m.user._id} value={m.user._id}>
                              {m.user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="submit" disabled={creatingTask} className="mt-4 h-11 w-full rounded-lg bg-primary text-primary-foreground">
                      {creatingTask ? "Creating..." : "Create Task"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 overflow-x-auto pb-4 md:grid-cols-3">
        {[
          { id: 'TODO', title: 'To Do', tasks: tasksByStatus.TODO, color: 'bg-muted text-muted-foreground' },
          { id: 'IN_PROGRESS', title: 'In Progress', tasks: tasksByStatus.IN_PROGRESS, color: 'bg-amber-50 text-amber-700' },
          { id: 'DONE', title: 'Done', tasks: tasksByStatus.DONE, color: 'bg-emerald-50 text-emerald-700' }
        ].map((column) => (
          <div key={column.id} className="soft-panel flex min-h-[500px] flex-col rounded-lg p-4">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="flex items-center text-sm font-semibold uppercase tracking-wider text-foreground">
                {column.title}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${column.color}`}>
                  {column.tasks.length}
                </span>
              </h3>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {column.tasks.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-muted-foreground">
                  <p className="text-sm font-medium">No tasks</p>
                </div>
              ) : (
                column.tasks.map((task) => (
                  <div key={task._id} className="group rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`${getPriorityColor(task.priority)} font-bold text-[10px] uppercase border`}>
                        {task.priority}
                      </Badge>
                      <Select 
                        value={task.status} 
                        onValueChange={async (newStatus) => {
                          try {
                            // Optimistic update
                            const updatedProject = { ...project };
                            const tIndex = updatedProject.tasks.findIndex(t => t._id === task._id);
                            if(tIndex > -1) updatedProject.tasks[tIndex].status = newStatus;
                            setProject(updatedProject);

                            const res = await fetch(`/api/tasks/${task._id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: newStatus })
                            });
                            if (!res.ok) throw new Error();
                            toast.success("Task moved");
                          } catch (err) {
                            toast.error("Failed to move task");
                            fetchProject(); // Revert
                          }
                        }}
                      >
                        <SelectTrigger className="h-6 w-[110px] rounded border-border text-[10px] font-bold uppercase tracking-wider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODO" className="text-xs font-medium">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS" className="text-xs font-medium">In Progress</SelectItem>
                          <SelectItem value="DONE" className="text-xs font-medium">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <h4 className="mb-1.5 mt-2 font-semibold leading-tight text-foreground">{task.title}</h4>
                    
                    {task.description && (
                      <p className="mb-4 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-border/70 pt-4">
                      {task.assignee ? (
                        <div className="flex items-center" title={task.assignee.name}>
                          <div className="flex size-6 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="ml-2 max-w-[100px] truncate text-xs font-medium text-muted-foreground">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground">
                          <AlertCircle className="mr-1 size-3.5" />
                          <span className="text-[10px] font-medium uppercase tracking-wider">Unassigned</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 size-3.5" />
                        {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
