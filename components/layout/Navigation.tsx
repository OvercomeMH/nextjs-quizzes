"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  
  // Define navigation links
  const navLinks = [
    {
      name: "Home",
      href: "/",
      auth: false // visible to everyone
    },
    {
      name: "Quizzes",
      href: "/quizzes",
      auth: false // visible to everyone
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      auth: true // only visible to authenticated users
    },
    {
      name: "Admin",
      href: "/admin/dashboard",
      auth: true // only visible to authenticated users
      // In a real application, you would add additional admin role check here
    },
  ];
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold">
            QuizMaster
          </Link>
        </div>
        
        <nav className="hidden md:flex gap-6">
          {navLinks.map((link) => {
            // Only show links based on auth state
            if (link.auth && !user) return null;
            
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary underline underline-offset-4" : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full border-2 border-t-primary animate-spin"></div>
          ) : user ? (
            <>
              <span className="text-sm hidden md:inline-block mr-2">
                Hi, {user.user_metadata?.username || user.email?.split('@')[0] || 'User'}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 