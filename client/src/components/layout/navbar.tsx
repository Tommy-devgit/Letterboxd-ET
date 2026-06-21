"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Film,
  User,
  List,
  Heart,
  Newspaper,
  MessageSquare,
  Activity,
  CalendarDays,
  Plus,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/providers/auth/auth-provider";

const navLinks = [
  { href: "/explore", label: "Films", icon: Film },
  { href: "/lists", label: "Lists", icon: List },
  { href: "/members", label: "Members", icon: User },
  { href: "/journal", label: "Journal", icon: Newspaper },
  { href: "/diary", label: "Diary", icon: CalendarDays },
  { href: "/reviews", label: "Reviews", icon: MessageSquare },
  { href: "/activity", label: "Activity", icon: Activity },
];

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-black/50 bg-[#090d12]/95 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="lb-container">
        <div className="flex h-[54px] items-center justify-between gap-4">
          <span onClick={() => setMenuOpen(false)}>
            <Logo href="/" />
          </span>

          <nav className="hidden lg:flex items-center gap-5">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "lb-nav transition-colors hover:text-[#d8e0e8]",
                  pathname === href || pathname.startsWith(href + "/")
                    ? "text-[#d8e0e8]"
                    : "text-[#738292]"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <Link href="/watchlist" className="hidden md:flex items-center gap-1.5 lb-nav text-[#738292] hover:text-[#d8e0e8]">
              <Heart className="h-3.5 w-3.5" />
              Watchlist
            </Link>
            <Link href="/search" className="p-2 text-[#738292] transition-colors hover:text-[#d8e0e8]" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  <span className="lb-nav text-[#d8e0e8]">{user.username}</span>
                  <Button size="sm" variant="ghost" className="h-8 rounded-[3px] px-2" onClick={() => void logout()}>
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <Button size="sm" className="h-8 rounded-[3px] bg-[#139f43] px-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-[#16b34b]" asChild>
                  <Link href="/login">
                    <Plus className="h-3.5 w-3.5" />
                    Log
                  </Link>
                </Button>
              )}
            </div>

            <button
              className="lg:hidden p-2 text-[#738292] transition-colors hover:text-[#d8e0e8]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-border bg-[#0d141b]">
          <nav className="lb-container flex flex-col py-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-2 py-2.5 lb-nav transition-colors",
                  pathname === href
                    ? "text-[#d8e0e8]"
                    : "text-[#738292] hover:text-[#d8e0e8]"
                )}
                onClick={() => setMenuOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-border">
              <Link
                href="/watchlist"
                className="flex items-center gap-3 px-2 py-2.5 lb-nav text-[#738292] transition-colors hover:text-[#d8e0e8]"
                onClick={() => setMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                Watchlist
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
