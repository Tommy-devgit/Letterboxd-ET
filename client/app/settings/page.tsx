"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/providers/auth/auth-provider";

export default function SettingsPage() { return <ProtectedRoute><SettingsContent /></ProtectedRoute>; }

function SettingsContent() {
  const { user, login, token } = useAuth();
  const [account, setAccount] = useState({ username: user?.username ?? "", email: user?.email ?? "" });
  const [profile, setProfile] = useState({ bio: user?.bio ?? "", profilePicture: user?.profilePicture ?? "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  if (!user) return null;
  const saveAccount = async () => { const updated = await usersApi.updateAccount(user.id, account); if (token) login(updated, token); setMessage("Account updated."); };
  const saveProfile = async () => { const updated = await usersApi.updateProfile(user.id, profile); if (token) login(updated, token); setMessage("Profile updated."); };
  const savePassword = async () => { await usersApi.changePassword(user.id, password); setPassword({ currentPassword: "", newPassword: "" }); setMessage("Password changed."); };
  return <div className="lb-container py-8"><div className="mb-6 lb-section-rule pt-2"><h1 className="lb-section-title">Settings</h1></div>{message && <p className="mb-4 rounded-[4px] border border-[#54b948]/30 bg-[#54b948]/10 px-3 py-2 text-sm text-[#bfe8b9]">{message}</p>}<div className="grid gap-4 lg:grid-cols-2"><section className="rounded-[4px] border border-border-muted bg-[#101820] p-5"><h2 className="lb-heading">Account</h2><div className="mt-4 space-y-3"><div><Label>Username</Label><Input value={account.username} onChange={(e) => setAccount({ ...account, username: e.target.value })} /></div><div><Label>Email</Label><Input type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} /></div><Button onClick={saveAccount}>Save account</Button></div></section><section className="rounded-[4px] border border-border-muted bg-[#101820] p-5"><h2 className="lb-heading">Profile</h2><div className="mt-4 space-y-3"><div><Label>Avatar URL</Label><Input value={profile.profilePicture} onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })} /></div><div><Label>Bio</Label><Input value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div><Button onClick={saveProfile}>Save profile</Button></div></section><section className="rounded-[4px] border border-border-muted bg-[#101820] p-5"><h2 className="lb-heading">Password</h2><div className="mt-4 space-y-3"><div><Label>Current password</Label><Input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} /></div><div><Label>New password</Label><Input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} /></div><Button onClick={savePassword}>Change password</Button></div></section><section className="rounded-[4px] border border-border-muted bg-[#101820] p-5"><h2 className="lb-heading">Notifications</h2><p className="mt-3 lb-caption">Email and activity notification preferences will use this settings surface.</p></section></div></div>;
}