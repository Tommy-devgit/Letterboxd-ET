"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { authApi, usersApi } from "@/lib/api";
import { useAuth } from "@/providers/auth/auth-provider";

export default function SettingsPage() { return <ProtectedRoute><SettingsContent /></ProtectedRoute>; }

function SettingsContent() {
  const { user, login, token } = useAuth();
  const toast = useToast();
  const [account, setAccount] = useState({ username: user?.username ?? "", email: user?.email ?? "" });
  const [profile, setProfile] = useState({ bio: user?.bio ?? "", profilePicture: user?.profilePicture ?? "" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [busy, setBusy] = useState<string | null>(null);
  if (!user) return null;
  const strength = getPasswordStrength(password.newPassword);
  const passwordsMatch = password.confirmPassword.length > 0 && password.newPassword === password.confirmPassword;
  const canSavePassword = password.currentPassword.length >= 8 && strength.score >= 3 && passwordsMatch;

  const saveAccount = async () => {
    setBusy("account");
    try {
      const updated = await usersApi.updateAccount(user.id, account);
      if (token) login(updated, token);
      toast.success({ title: "Account updated" });
    } catch {
      toast.error({ title: "Could not update account", description: "Check the username and email, then try again." });
    } finally {
      setBusy(null);
    }
  };

  const saveProfile = async () => {
    setBusy("profile");
    try {
      const updated = await usersApi.updateProfile(user.id, profile);
      if (token) login(updated, token);
      toast.success({ title: "Profile updated" });
    } catch {
      toast.error({ title: "Could not update profile" });
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async () => {
    if (!canSavePassword) {
      toast.error({ title: "Password validation failed", description: "Use a stronger password and make sure confirmation matches." });
      return;
    }
    setBusy("password");
    const loadingId = toast.loading({ title: "Updating password..." });
    try {
      await authApi.changePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword });
      toast.dismiss(loadingId);
      toast.success({ title: "Password changed", description: "Your account password was updated successfully." });
      setPassword({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast.dismiss(loadingId);
      toast.error({ title: "Password change failed", description: "Current password may be incorrect." });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="lb-container py-8">
      <div className="mb-6 lb-section-rule pt-2">
        <h1 className="lb-section-title">Settings</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[4px] border border-border-muted bg-[#101820] p-5">
          <h2 className="lb-heading">Account</h2>
          <div className="mt-4 space-y-3">
            <div><Label>Username</Label><Input value={account.username} onChange={(e) => setAccount({ ...account, username: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} /></div>
            <Button onClick={saveAccount} disabled={busy === "account"}>Save account</Button>
          </div>
        </section>
        <section className="rounded-[4px] border border-border-muted bg-[#101820] p-5">
          <h2 className="lb-heading">Profile</h2>
          <div className="mt-4 space-y-3">
            <div><Label>Avatar URL</Label><Input value={profile.profilePicture} onChange={(e) => setProfile({ ...profile, profilePicture: e.target.value })} /></div>
            <div><Label>Bio</Label><Input value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} /></div>
            <Button onClick={saveProfile} disabled={busy === "profile"}>Save profile</Button>
          </div>
        </section>
        <section className="rounded-[4px] border border-border-muted bg-[#101820] p-5">
          <h2 className="lb-heading">Password</h2>
          <div className="mt-4 space-y-3">
            <div><Label>Current password</Label><Input type="password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} /></div>
            <div><Label>New password</Label><Input type="password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} /></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-surface-raised"><div className="h-full bg-accent transition-all" style={{ width: `${strength.score * 20}%` }} /></div>
            <p className="lb-caption">{strength.label}</p>
            <div><Label>Confirm password</Label><Input type="password" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} /></div>
            {password.confirmPassword && !passwordsMatch ? <p className="text-xs font-semibold text-destructive">Passwords do not match.</p> : null}
            <Button onClick={savePassword} disabled={busy === "password" || !canSavePassword}>Change password</Button>
          </div>
        </section>
        <section className="rounded-[4px] border border-border-muted bg-[#101820] p-5">
          <h2 className="lb-heading">Notifications</h2>
          <p className="mt-3 lb-caption">Email and activity notification preferences will use this settings surface.</p>
        </section>
      </div>
    </div>
  );
}

function getPasswordStrength(password: string) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
  const label = score <= 2 ? "Weak password" : score === 3 ? "Good password" : "Strong password";
  return { score, label };
}
