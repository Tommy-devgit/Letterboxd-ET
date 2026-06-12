import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { QueryProvider } from '@/providers/query-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Letterboxd ET',
    default: 'Letterboxd ET — Ethiopian Cinema',
  },
  description:
    'Discover, track, rate, and review Ethiopian films. The definitive home for Ethiopian cinema.',
  openGraph: { type: 'website', siteName: 'Letterboxd ET' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <QueryProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
