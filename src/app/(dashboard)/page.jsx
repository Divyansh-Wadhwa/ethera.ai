"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { FolderKanban, CheckSquare, Clock, CheckCircle2, Loader2, ArrowUpRight } from "lucide-react";

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
        console.error(error);
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      accent: "bg-chart-3",
      trend: "+2 this week",
    },
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: CheckSquare,
      accent: "bg-chart-1",
      trend: "+12 this week",
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks,
      icon: Clock,
      accent: "bg-chart-2",
      trend: "4 near deadline",
    },
    {
      title: "Completed",
      value: stats.completedTasks,
      icon: CheckCircle2,
      accent: "bg-chart-1",
      trend: "+8 this week",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">Good to see you, {session?.user?.name}</p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          A quieter view of the work in motion.
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="surface rounded-lg py-0 transition-transform duration-200 hover:-translate-y-0.5">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <div className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{stat.value}</div>
                </div>
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <stat.icon className="size-5 text-foreground" />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">{stat.trend}</span>
                <span className={`h-1.5 w-16 rounded-full ${stat.accent}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.45fr_0.85fr]">
        <section className="surface rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Flow health</h2>
              <p className="text-sm text-muted-foreground">A simple read on current throughput.</p>
            </div>
            <ArrowUpRight className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-8 grid h-56 grid-cols-12 items-end gap-2">
            {[38, 54, 42, 68, 50, 74, 62, 80, 58, 72, 88, 76].map((height, index) => (
              <div key={index} className="flex h-full items-end rounded-md bg-muted/60">
                <div className="w-full rounded-md bg-primary/80" style={{ height: `${height}%` }} />
              </div>
            ))}
          </div>
        </section>
        
        <section className="surface rounded-lg p-6">
          <h2 className="text-lg font-semibold tracking-tight">Today</h2>
          <div className="mt-5 space-y-3">
            {[
              ["Review", `${stats.inProgressTasks} tasks moving`],
              ["Plan", `${stats.totalProjects} active projects`],
              ["Ship", `${stats.completedTasks} completed tasks`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border border-border/70 bg-background/60 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-chart-1" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
                <span className="text-sm text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-lg bg-muted/70 p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Keep the board light: move stale work forward, close the obvious wins, and make blockers visible.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
