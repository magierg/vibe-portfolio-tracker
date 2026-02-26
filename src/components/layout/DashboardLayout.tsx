'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOutUser } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  PlusCircle, 
  Settings, 
  LogOut,
  Home,
  TrendingUp,
  User
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
}

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  return (
    <Link href={href}>
      <div className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
      }`}>
        {icon}
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
}

export default function DashboardLayout({ children, activeTab = 'dashboard' }: DashboardLayoutProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/auth/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    {
      href: '/dashboard',
      icon: <Home size={20} />,
      label: 'Dashboard',
      key: 'dashboard'
    },
    {
      href: '/investments',
      icon: <TrendingUp size={20} />,
      label: 'Investments',
      key: 'investments'
    },
    {
      href: '/analytics',
      icon: <BarChart3 size={20} />,
      label: 'Analytics',
      key: 'analytics'
    },
    {
      href: '/investments/new',
      icon: <PlusCircle size={20} />,
      label: 'Add Investment',
      key: 'add'
    },
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card">
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <TrendingUp size={16} className="text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">Portfolio Tracker</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => (
                <NavItem
                  key={item.key}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={activeTab === item.key}
                />
              ))}
            </nav>

            {/* User Section */}
            <div className="border-t p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <User size={16} className="text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.displayName || user.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link href="/settings">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                    <Settings size={16} />
                    <span className="text-sm">Settings</span>
                  </div>
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Sign out</span>
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
