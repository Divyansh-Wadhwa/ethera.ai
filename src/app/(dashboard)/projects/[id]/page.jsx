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
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
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
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <Link href="/projects" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center w-fit transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{project.name}</h1>
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
                  <SelectTrigger className={`h-7 px-2 text-[10px] uppercase font-bold tracking-wider rounded-md border-0 w-[110px] ${project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE" className="text-xs font-medium text-blue-700">Active</SelectItem>
                    <SelectItem value="COMPLETED" className="text-xs font-medium text-emerald-700">Completed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={project.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-100 text-blue-700 hover:bg-blue-100'}>
                  {project.status || "ACTIVE"}
                </Badge>
              )}
            </div>
            <p className="text-slate-500 mt-1 max-w-2xl">{project.description}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 mr-2">
              {project.members.map((member, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm" title={member.user.name + ` (${member.role})`}>
                  {member.user.name.charAt(0)}
                </div>
              ))}
            </div>

            {isAdmin && (
              <Dialog>
                <DialogTrigger 
                  render={
                    <Button variant="outline" className="rounded-xl shadow-sm transition-all active:scale-95 bg-white border-slate-200">
                      <Users className="w-4 h-4 mr-1.5" />
                      Members
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Manage Members</DialogTitle>
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
                      <Input name="email" type="email" placeholder="Email address to add..." className="rounded-xl flex-1" required />
                      <Button type="submit" className="bg-slate-900 text-white rounded-xl">Add</Button>
                    </form>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Current Team</h4>
                      {project.members.map(member => (
                        <div key={member.user._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                              {member.user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{member.user.name}</p>
                              <p className="text-xs text-slate-500">{member.user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={member.role === "ADMIN" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                              {member.role}
                            </Badge>
                            {member.user._id !== session?.user?.id && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
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
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all active:scale-95">
                      <Plus className="w-5 h-5 mr-1.5" />
                      New Task
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">Create Task</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Task Title</Label>
                      <Input
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="What needs to be done?"
                        required
                        className="rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold text-slate-700">Description</Label>
                      <Input
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Add more details..."
                        className="rounded-xl"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-slate-700">Status</Label>
                        <Select value={newTask.status} onValueChange={(v) => setNewTask({...newTask, status: v})}>
                          <SelectTrigger className="rounded-xl">
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
                        <Label className="font-semibold text-slate-700">Priority</Label>
                        <Select value={newTask.priority} onValueChange={(v) => setNewTask({...newTask, priority: v})}>
                          <SelectTrigger className="rounded-xl">
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
                      <Label className="font-semibold text-slate-700">Assign To</Label>
                      <Select value={newTask.assigneeId} onValueChange={(v) => setNewTask({...newTask, assigneeId: v})}>
                        <SelectTrigger className="rounded-xl">
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

                    <Button type="submit" disabled={creatingTask} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 mt-4">
                      {creatingTask ? "Creating..." : "Create Task"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 overflow-x-auto pb-4">
        {[
          { id: 'TODO', title: 'To Do', tasks: tasksByStatus.TODO, color: 'bg-slate-200 text-slate-700', border: 'border-slate-200' },
          { id: 'IN_PROGRESS', title: 'In Progress', tasks: tasksByStatus.IN_PROGRESS, color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-100' },
          { id: 'DONE', title: 'Done', tasks: tasksByStatus.DONE, color: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-100' }
        ].map((column) => (
          <div key={column.id} className="bg-slate-100/50 rounded-2xl p-4 min-h-[500px] border border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-wider">
                {column.title}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${column.color}`}>
                  {column.tasks.length}
                </span>
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
              {column.tasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <p className="text-sm font-medium">No tasks</p>
                </div>
              ) : (
                column.tasks.map((task) => (
                  <div key={task._id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={`${getPriorityColor(task.priority)} font-bold text-[10px] uppercase border`}>
                        {task.priority}
                      </Badge>
                      <Select 
                        value={task.status} 
                        onValueChange={async (newStatus) => {
                          const oldStatus = task.status;
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
                        <SelectTrigger className="w-[110px] h-6 text-[10px] uppercase font-bold tracking-wider rounded border-slate-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TODO" className="text-xs font-medium">To Do</SelectItem>
                          <SelectItem value="IN_PROGRESS" className="text-xs font-medium">In Progress</SelectItem>
                          <SelectItem value="DONE" className="text-xs font-medium">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors leading-tight mb-1.5 mt-2">{task.title}</h4>
                    
                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                      {task.assignee ? (
                        <div className="flex items-center" title={task.assignee.name}>
                          <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-slate-600 ml-2 truncate max-w-[100px]">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          <span className="text-[10px] font-medium uppercase tracking-wider">Unassigned</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-slate-400 text-xs">
                        <Calendar className="w-3.5 h-3.5 mr-1" />
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
