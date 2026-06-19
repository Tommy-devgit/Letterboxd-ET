"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await authApi.prepareRegister(form);
      setMessage("Registration architecture is ready. Account creation will be enabled in the full authentication phase.");
    } finally { setLoading(false); }
  };
  return <div className="lb-container grid min-h-[70vh] place-items-center py-12"><div className="w-full max-w-sm rounded-[4px] border border-border-muted bg-[#101820] p-6"><div className="mb-6 text-center"><Logo href="/" className="justify-center" /><h1 className="mt-5 text-xl font-semibold text-[#d8e0e8]">Create account</h1><p className="mt-1 lb-caption">Prepare your Letterboxd-ET member profile.</p></div><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="username">Username</Label><Input id="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} required autoComplete="username" /></div><div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required autoComplete="email" /></div><div className="space-y-1.5"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} autoComplete="new-password" className="pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>{message && <p className="rounded-[4px] border border-[#f2c94c]/30 bg-[#f2c94c]/10 px-3 py-2 text-sm text-[#ead37a]">{message}</p>}<Button type="submit" className="w-full" disabled={loading}>{loading ? "Preparing..." : "Create account"}</Button></form><p className="mt-6 text-center text-sm text-text-muted">Already have an account? <Link href="/login" className="text-accent hover:text-accent-muted">Sign in</Link></p></div></div>;
}