"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { useAuth } from "@/providers/auth/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const session = await authApi.login(form);
      login(session.user, session.accessToken);
      const next = new URLSearchParams(window.location.search).get("next") ?? "/";
      router.replace(next);
    } catch {
      setMessage("Invalid email/password, or the backend auth server is not running.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="lb-container grid min-h-[70vh] place-items-center py-12"><div className="w-full max-w-sm rounded-[4px] border border-border-muted bg-[#101820] p-6"><div className="mb-6 text-center"><Logo href="/" className="justify-center" /><h1 className="mt-5 text-xl font-semibold text-[#d8e0e8]">Welcome back</h1><p className="mt-1 lb-caption">Sign in to continue your Ethiopian cinema diary.</p></div><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required autoComplete="email" /></div><div className="space-y-1.5"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required autoComplete="current-password" className="pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>{message && <p className="rounded-[4px] border border-[#e0362d]/30 bg-[#e0362d]/10 px-3 py-2 text-sm text-[#ffb4ae]">{message}</p>}<Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button></form><p className="mt-4 rounded-[4px] border border-border-muted bg-[#0b1117] px-3 py-2 text-xs text-text-muted">Seed account: <span className="text-[#d8e0e8]">abel@letterboxd-et.local</span> / <span className="text-[#d8e0e8]">Password123!</span></p><p className="mt-6 text-center text-sm text-text-muted"><Link href="/forgot-password" className="text-accent hover:text-accent-muted">Forgot password?</Link></p><p className="mt-2 text-center text-sm text-text-muted">Don&apos;t have an account? <Link href="/register" className="text-accent hover:text-accent-muted">Create one</Link></p></div></div>;
}
