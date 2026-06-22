"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ListPlus } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listsApi } from "@/lib/api";

export default function NewListPage() {
  return (
    <ProtectedRoute>
      <NewListContent />
    </ProtectedRoute>
  );
}

function NewListContent() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const list = await listsApi.create({ title: title.trim(), description: description.trim() || undefined });
      router.push(`/lists/${list.id}`);
    } catch {
      setMessage("Could not create this list. Try a shorter title or sign in again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lb-container max-w-2xl py-8">
      <div className="mb-6 lb-section-rule pt-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-[#d8e0e8]">
          <ListPlus className="h-6 w-6 text-[#f2c94c]" />
          New List
        </h1>
        <p className="mt-1 lb-caption">Build a focused collection of Ethiopian films.</p>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-[4px] border border-border-muted bg-[#101820] p-5">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={200} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={2000}
            className="min-h-36 w-full rounded-[4px] border border-border-muted bg-[#0b1117] p-3 text-sm leading-6 text-[#d8e0e8] outline-none transition-colors focus:border-[#54b948]"
          />
        </div>
        {message ? <p className="rounded-[4px] border border-[#e0362d]/30 bg-[#e0362d]/10 px-3 py-2 text-sm text-[#ffb4ae]">{message}</p> : null}
        <Button type="submit" disabled={saving || title.trim().length === 0}>{saving ? "Creating..." : "Create list"}</Button>
      </form>
    </div>
  );
}
