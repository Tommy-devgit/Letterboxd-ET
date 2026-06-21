"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await authApi.forgotPassword({ email });
      setMessage("If an account exists for that email, a reset flow can be issued.");
    } catch {
      setMessage("Could not reach the auth endpoint. Restart the backend server so the new auth routes are loaded.");
    } finally {
      setLoading(false);
    }
  };
  return <div className="lb-container grid min-h-[70vh] place-items-center py-12"><div className="w-full max-w-sm rounded-[4px] border border-border-muted bg-[#101820] p-6"><div className="mb-6 text-center"><Logo href="/" className="justify-center" /><h1 className="mt-5 text-xl font-semibold text-[#d8e0e8]">Reset password</h1><p className="mt-1 lb-caption">Prepare a password reset for your Letterboxd-ET account.</p></div><form onSubmit={handleSubmit} className="space-y-4"><div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></div>{message && <p className="rounded-[4px] border border-[#54b948]/30 bg-[#54b948]/10 px-3 py-2 text-sm text-[#bfe8b9]">{message}</p>}<Button type="submit" className="w-full" disabled={loading}>{loading ? "Preparing..." : "Prepare reset"}</Button></form><p className="mt-6 text-center text-sm text-text-muted"><Link href="/login" className="text-accent hover:text-accent-muted">Back to sign in</Link></p></div></div>;
}
