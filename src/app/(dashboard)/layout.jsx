"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  const navigation = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderKanban },
    { name: "My Tasks", href: "/tasks", icon: CheckSquare },
  ];

  return (
    <div className="min-h-screen flex bg-transparent">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-border/80 bg-background/80 px-4 py-5 backdrop-blur-2xl md:flex md:flex-col">
        <div className="flex h-12 items-center px-2">
          <div className="mr-3 flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <CheckSquare className="size-5" />
          </div>
          <div>
            <span className="block text-lg font-semibold tracking-tight text-foreground">TeamFlow</span>
            <span className="text-xs font-medium text-muted-foreground">Workspace</span>
          </div>
        </div>

        <div className="mt-8 flex-1">
          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="mr-3 size-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 border-t border-border/80 pt-4">
          <div className="rounded-lg border border-border/70 bg-card/70 p-3">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-chart-2" />
              Focus mode ready
            </div>
            <div className="flex items-center">
            <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background text-sm font-semibold uppercase">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
            <div className="ml-3 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{session?.user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">{session?.user?.email}</p>
            </div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => signOut()}
          >
            <LogOut className="mr-3 size-4" />
            Log out
          </Button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden md:pl-72">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/80 bg-background/85 px-4 backdrop-blur-xl md:hidden">
          <div className="flex items-center">
            <div className="mr-3 flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckSquare className="size-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">TeamFlow</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Log out">
            <LogOut className="size-4 text-muted-foreground" />
          </Button>
        </header>

        <div className="flex-1 overflow-auto px-4 py-6 pb-24 sm:px-6 md:px-10 md:py-8">
          {children}
        </div>

        <nav className="fixed bottom-3 left-3 right-3 z-20 grid grid-cols-3 rounded-xl border border-border/80 bg-card/90 p-1 shadow-2xl backdrop-blur-xl md:hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex h-11 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <item.icon className="mr-1.5 size-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
