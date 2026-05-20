"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckSquare, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 selection:bg-accent selection:text-accent-foreground">
      <div className="z-10 grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card/90 shadow-2xl backdrop-blur-xl md:grid-cols-[1fr_0.85fr]">
        <section className="hidden border-r border-border bg-muted/35 p-10 md:flex md:flex-col md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckSquare className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">TeamFlow</span>
          </div>
          <div>
            <h1 className="max-w-sm text-4xl font-semibold tracking-tight text-foreground">
              Small teams deserve quieter project software.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              Plan projects, assign ownership, and keep the board moving without the visual clutter.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[72, 44, 88, 58, 66, 36].map((height, index) => (
              <div key={index} className="h-24 rounded-lg bg-background/70 p-2">
                <div className="mt-auto rounded-md bg-primary/80" style={{ height: `${height}%` }} />
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
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">Welcome back. Enter your details to continue.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                <Link href="#" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Forgot password?
                </Link>
              </div>
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
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-foreground transition-colors hover:text-muted-foreground">
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
