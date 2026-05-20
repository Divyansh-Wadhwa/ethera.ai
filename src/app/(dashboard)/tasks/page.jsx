"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, FolderKanban, Circle, CheckCircle2, Clock } from "lucide-react";
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
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'HIGH': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-semibold text-[10px] uppercase">High</Badge>;
      case 'MEDIUM': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-semibold text-[10px] uppercase">Medium</Badge>;
      case 'LOW': return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold text-[10px] uppercase">Low</Badge>;
      default: return <Badge variant="outline" className="bg-slate-50 text-slate-700 font-semibold text-[10px] uppercase">Normal</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'TODO': return <Circle className="w-4 h-4 text-slate-300" />;
      case 'IN_PROGRESS': return <Clock className="w-4 h-4 text-indigo-500" />;
      case 'DONE': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default: return <Circle className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Tasks</h1>
        <p className="text-slate-500 mt-1 text-lg">A consolidated view of everything assigned to you</p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">You're all caught up!</h3>
          <p className="text-slate-500 max-w-sm mx-auto">You have no tasks assigned to you across any of your projects.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div key={task._id} className="p-5 hover:bg-slate-50/50 transition-colors group flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-1/3">
                    {getStatusIcon(task.status)}
                    <span className="font-semibold text-slate-900 line-clamp-1">{task.title}</span>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-6 text-sm text-slate-500 pl-7 sm:pl-0">
                    <Link href={`/projects/${task.project._id}`} className="flex items-center hover:text-indigo-600 transition-colors">
                      <FolderKanban className="w-4 h-4 mr-2" />
                      <span className="line-clamp-1">{task.project.name}</span>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-7 sm:pl-0 sm:justify-end">
                  {getPriorityBadge(task.priority)}
                  
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(task._id, v)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs font-medium rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="DONE">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center text-xs text-slate-400 min-w-[100px] justify-end">
                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
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
