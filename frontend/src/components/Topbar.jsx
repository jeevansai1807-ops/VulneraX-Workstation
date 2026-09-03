import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useTheme } from './ThemeProvider';
import Logo from './Logo';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { LogOut, User, Sun, Moon } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'scanner', label: 'Scanner', path: '/scanner' },
    { id: 'database', label: 'Database', path: '/database' },
    { id: 'settings', label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent pt-6">
      <header className="h-16 w-full max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <Logo size="md" />
          <span className="font-black text-3xl tracking-tighter text-foreground drop-shadow-md">
            Vulnera<span className="text-primary">X</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => 
                `text-base font-bold transition-all ${
                  isActive ? 'text-primary drop-shadow-sm' : 'text-foreground/70 hover:text-foreground'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-all shadow-sm focus:outline-none ring-1 ring-foreground/10 hover:ring-foreground/20 text-foreground/80"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-foreground/10 hover:bg-foreground/15 transition-all shadow-sm focus:outline-none ring-1 ring-foreground/10 hover:ring-foreground/20">
                <User className="h-5 w-5 text-foreground/90" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content 
                className="min-w-[150px] rounded-xl border border-border bg-card backdrop-blur-xl p-2 shadow-xl z-[60]"
                sideOffset={8}
                align="end"
              >
                <DropdownMenu.Item 
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-destructive/20 text-foreground hover:text-destructive cursor-pointer outline-none transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Disconnect
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </nav>
      </header>
    </div>
  );
}
