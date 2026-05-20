"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckSquare, Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || data.message || "Failed to create account");
      } else {
        toast.success("Account created successfully");
        router.push("/login");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 selection:bg-accent selection:text-accent-foreground">
      <div className="z-10 grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card/90 shadow-2xl backdrop-blur-xl md:grid-cols-[0.85fr_1fr]">
        <section className="hidden border-r border-border bg-muted/35 p-10 md:flex md:flex-col md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckSquare className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">TeamFlow</span>
          </div>
          <div>
            <h1 className="max-w-sm text-4xl font-semibold tracking-tight text-foreground">
              Create a workspace that gets out of the way.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Bring projects, teammates, and tasks into one focused operating view.
            </p>
          </div>
          <div className="space-y-2">
            {["Create project", "Invite team", "Ship the first task"].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground">
                {item}
              </div>
            ))}
          </div>
        </section>
        
        <section className="p-7 sm:p-10">
          <div className="mb-8 md:hidden">
            <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckSquare className="size-5" />
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Create account</h2>
            <p className="mt-2 text-sm text-muted-foreground">Start with a clean workspace for your team&apos;s tasks.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 w-full rounded-lg border-border bg-background text-sm shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 w-full rounded-lg border-border bg-background text-sm shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 w-full rounded-lg border-border bg-background text-sm shadow-sm transition-all"
              />
            </div>
            
            <Button 
              type="submit" 
              className="h-11 w-full rounded-lg bg-primary font-medium text-primary-foreground shadow-sm transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          
          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-foreground transition-colors hover:text-muted-foreground">
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
