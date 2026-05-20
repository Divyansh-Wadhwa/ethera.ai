"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, FolderKanban, Circle, CheckCircle2, Clock, ListFilter } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic update
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error();
      toast.success("Task updated");
    } catch (err) {
      toast.error("Failed to update task");
      fetchTasks(); // revert on failure
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'HIGH': return <Badge variant="outline" className="rounded-md border-red-200 bg-red-50 text-[10px] font-semibold uppercase text-red-700">High</Badge>;
      case 'MEDIUM': return <Badge variant="outline" className="rounded-md border-amber-200 bg-amber-50 text-[10px] font-semibold uppercase text-amber-700">Medium</Badge>;
      case 'LOW': return <Badge variant="outline" className="rounded-md border-emerald-200 bg-emerald-50 text-[10px] font-semibold uppercase text-emerald-700">Low</Badge>;
      default: return <Badge variant="outline" className="rounded-md bg-muted text-[10px] font-semibold uppercase text-muted-foreground">Normal</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'TODO': return <Circle className="size-4 text-muted-foreground" />;
      case 'IN_PROGRESS': return <Clock className="size-4 text-chart-2" />;
      case 'DONE': return <CheckCircle2 className="size-4 text-emerald-600" />;
      default: return <Circle className="size-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-500 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">My Tasks</h1>
          <p className="mt-2 text-muted-foreground">Everything assigned to you, stripped down to what matters.</p>
        </div>
        <div className="flex h-10 items-center gap-2 rounded-lg border border-border/80 bg-card px-3 text-sm text-muted-foreground">
          <ListFilter className="size-4" />
          {tasks.length} total
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="soft-panel rounded-lg border-dashed py-24 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-lg bg-muted">
            <CheckCircle2 className="size-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-foreground">You&apos;re all caught up</h3>
          <p className="mx-auto max-w-sm text-muted-foreground">You have no tasks assigned across your projects.</p>
        </div>
      ) : (
        <div className="surface overflow-hidden rounded-lg">
          <div className="divide-y divide-border/70">
            {tasks.map((task) => (
              <div key={task._id} className="group flex flex-col gap-4 p-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-center">
                <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex w-full items-center gap-3 sm:w-1/3">
                    {getStatusIcon(task.status)}
                    <span className="line-clamp-1 font-semibold text-foreground">{task.title}</span>
                  </div>
                  
                  <div className="flex flex-1 items-center gap-6 pl-7 text-sm text-muted-foreground sm:pl-0">
                    <Link href={`/projects/${task.project._id}`} className="flex items-center transition-colors hover:text-foreground">
                      <FolderKanban className="mr-2 size-4" />
                      <span className="line-clamp-1">{task.project.name}</span>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-3 pl-7 sm:justify-end sm:pl-0">
                  {getPriorityBadge(task.priority)}
                  
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(task._id, v)}>
                    <SelectTrigger className="h-8 w-[130px] rounded-lg text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex min-w-[92px] items-center justify-end text-xs text-muted-foreground">
                    <Calendar className="mr-1.5 size-3.5" />
                    {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
