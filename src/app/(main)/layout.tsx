import type { ReactNode } from 'react';
import { TabNavigation } from '@/components/shared/TabNavigation';
import { Separator } from '@/components/ui/separator';

export default function MainAppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span className="font-bold text-lg">FinChat</span>
          </Link>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <TabNavigation />
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-8 px-4 md:px-6">
        {children}
      </main>
      <footer className="py-6 md:px-6 md:py-8 border-t bg-muted/50">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FinChat Assistant. All rights reserved.
          </p>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm hover:underline underline-offset-4 text-muted-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:underline underline-offset-4 text-muted-foreground">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// Need to add Link component for the logo
import Link from 'next/link';
