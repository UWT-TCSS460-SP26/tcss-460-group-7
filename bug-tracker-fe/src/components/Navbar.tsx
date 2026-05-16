'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Popcorn, ShieldCheck, Sun, Moon } from 'lucide-react';
import { clsx } from 'clsx';
import { useTheme } from '@/context/ThemeContext';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Report Bug', href: '/', icon: Popcorn },
    { name: 'Admin Dashboard', href: '/admin', icon: ShieldCheck },
  ];

  return (
    <nav className={clsx(
      "border-b sticky top-0 z-50 transition-colors duration-300",
      theme === 'dark' ? "bg-black border-yellow-500/20" : "bg-white border-green-500/20"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className={clsx(
              "p-1.5 rounded-lg shadow-lg transition-all duration-300",
              theme === 'dark' ? "bg-yellow-500 shadow-yellow-500/20" : "bg-green-500 shadow-green-500/20"
            )}>
              <Popcorn className={clsx("w-5 h-5", theme === 'dark' ? "text-black" : "text-white")} />
            </div>
            <span className={clsx(
              "font-black text-xl tracking-tighter uppercase italic transition-colors duration-300",
              theme === 'dark' ? "text-yellow-500" : "text-green-600"
            )}>
              BUG REPORT
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wide",
                      isActive 
                        ? (theme === 'dark' ? "text-black bg-yellow-500" : "text-white bg-green-500") 
                        : (theme === 'dark' ? "text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/10" : "text-green-600/60 hover:text-green-600 hover:bg-green-500/10")
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={toggleTheme}
              className={clsx(
                "p-2 rounded-xl transition-all duration-300 border",
                theme === 'dark' 
                  ? "bg-gray-900 border-yellow-500/20 text-yellow-500 hover:bg-yellow-500/10" 
                  : "bg-gray-50 border-green-500/20 text-green-600 hover:bg-green-500/10"
              )}
              title={theme === 'dark' ? "Switch to Neon Mode" : "Switch to Cinema Mode"}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
