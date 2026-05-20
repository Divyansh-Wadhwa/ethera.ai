"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Clock, Users, Loader2 } from "lucide-react";

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        
        let totalProjects = data.length;
        let totalTasks = 0;
        
        data.forEach(p => {
          totalTasks += p._count?.tasks || 0;
        });

        // In a real app, you'd fetch aggregated task stats from a dedicated endpoint.
        // For now, we'll just show the high-level project counts.
        setStats({
          totalProjects,
          totalTasks,
          completedTasks: Math.floor(totalTasks * 0.3), // Mock data for visual completeness
          inProgressTasks: Math.floor(totalTasks * 0.5),
        });
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      color: "text-blue-600",
      bg: "bg-blue-100",
      trend: "+2 this week",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: CheckSquare,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
      trend: "+12 this week",
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-100",
      trend: "4 near deadline",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: Users, // Using Users icon as a placeholder, could use CheckCircle
      color: "text-emerald-600",
      bg: "bg-emerald-100",
      trend: "+8 this week",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1 text-lg">Welcome back, {session?.user?.name}. Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1 font-medium">{stat.trend}</p>
            </CardContent>
            {/* Decorative bottom border */}
            <div className={`h-1 w-full bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-${stat.color.split('-')[1]}-400 group-hover:to-${stat.color.split('-')[1]}-600 transition-all duration-500 opacity-50`}></div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 border-0 shadow-sm bg-white min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <FolderKanban className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <p className="text-slate-500 mt-1">Activity chart will appear here</p>
          </div>
        </Card>
        
        <Card className="col-span-1 border-0 shadow-sm bg-white min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <CheckSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Upcoming Tasks</h3>
            <p className="text-slate-500 mt-1">Task list will appear here</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
