import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const footerLinks = [
  ["Films", "/explore"],
  ["Lists", "/lists"],
  ["Members", "/members"],
  ["Journal", "/journal"],
  ["Reviews", "/reviews"],
  ["Activity", "/activity"],
  ["Diary", "/diary"],
  ["Watchlist", "/watchlist"],
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border-muted bg-[#090d12]">
      <div className="lb-container py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo href="/" markClassName="h-5 w-[48px]" />
            <p className="mt-2 max-w-md lb-caption">Ethiopian cinema discovery, diary, reviews, lists, and community activity.</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            {footerLinks.map(([label, href]) => (
              <Link key={label} href={href} className="lb-nav text-[#738292] transition-colors hover:text-[#d8e0e8]">{label}</Link>
            ))}
          </nav>
        </div>
        <div className="mt-7 border-t border-border-muted pt-4"><p className="lb-caption">© {new Date().getFullYear()} Letterboxd-ET. Built for Ethiopian film culture.</p></div>
      </div>
    </footer>
  );
}