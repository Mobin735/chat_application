'use client';

import type { ReactNode } from 'react';
import { TabNavigation } from '@/components/shared/TabNavigation';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MainAppLayout({ children }: { children: ReactNode }) {
  const { user, logout, verifyToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const isValid = await verifyToken();
      if (!isValid) {
        router.push('/login');
      }
    };
    
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      // Clear local auth state
      logout();
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // If no user is present, don't render the main layout
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gray-200/60 backdrop-blur supports-[backdrop-filter]:bg-gray-200/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <Link href="/dashboard" className="flex items-center space-x-2 ml-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <span className="font-bold text-lg">FinChat</span>
          </Link>
          <div className="flex flex-1 items-center ml-[35px] space-x-4">
            <TabNavigation />
          </div>
          <div className="flex items-center">
            {user ? (
              <button 
                onClick={handleLogout}
                className="ml-8 mr-8 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition duration-300 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </button>
            ) : (
              <Link 
                href="/login" 
                className="ml-8 mr-8 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-8 px-4 md:px-6">
        {children}
      </main>
      {/* <footer className="py-6 md:px-6 md:py-8 border-t bg-muted/50">
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
      </footer> */}
    </div>
  );
}
