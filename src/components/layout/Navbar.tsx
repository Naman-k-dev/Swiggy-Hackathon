'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store/demo-context';
import {
  PlusCircle,
  ShoppingBag,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const pathname = usePathname();
  const { currentUser, circles, getSession, cartItems } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Check if active circle has an ongoing session
  const activeCircle = circles[0];
  const activeSession = activeCircle ? getSession(activeCircle.id) : null;
  const activeCartCount = activeSession
    ? cartItems.filter((i) => i.session_id === activeSession.id).length
    : 0;

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Explore Circles', href: '/dashboard#circles' },
    { label: 'How It Works', href: '/#how-it-works' },
  ];

  return (
    <header className="sticky top-[60px] z-20 bg-white/90 backdrop-blur-lg border-b border-charcoal-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Prototype Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-2xl bg-swiggy-orange flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
                S
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-charcoal-900 tracking-tight leading-tight flex items-center gap-1.5">
                  Campus Circles
                  <span className="text-[10px] font-semibold bg-swiggy-light text-swiggy-dark px-1.5 py-0.5 rounded-full border border-orange-200">
                    Concept
                  </span>
                </span>
                <span className="text-[10px] text-charcoal-400 font-medium leading-none">
                  Swiggy Food for Thought 2.0
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-swiggy-orange ${
                    isActive ? 'text-swiggy-orange font-semibold' : 'text-charcoal-600'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Action: Create Circle */}
            <Link href="/circles/create">
              <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs font-semibold">
                <PlusCircle className="w-3.5 h-3.5 text-swiggy-orange" />
                Create Circle
              </Button>
            </Link>

            {/* Active Group Cart Shortcut */}
            {activeCircle && (
              <Link href={`/circles/${activeCircle.id}`}>
                <Button
                  variant="soft"
                  size="sm"
                  className="relative rounded-xl text-xs font-semibold gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Group Cart</span>
                  {activeCartCount > 0 && (
                    <span className="bg-swiggy-orange text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {activeCartCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {/* User Profile Pill */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full border border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 transition"
              >
                <div className="w-7 h-7 rounded-full overflow-hidden relative border border-orange-300">
                  <Image
                    src={currentUser.avatar_url || ''}
                    alt={currentUser.full_name}
                    width={28}
                    height={28}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="text-xs font-semibold text-charcoal-800">
                  {currentUser.full_name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-charcoal-400" />
              </button>

              {/* Profile Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl border border-charcoal-100 p-3 z-50">
                  <div className="pb-3 border-b border-charcoal-100">
                    <p className="font-bold text-sm text-charcoal-900">{currentUser.full_name}</p>
                    <p className="text-xs text-charcoal-500">{currentUser.college}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge
                        variant={currentUser.dietary_pref === 'VEG' ? 'success' : 'danger'}
                        size="sm"
                      >
                        {currentUser.dietary_pref}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        Budget: ₹{currentUser.preferred_budget}/meal
                      </Badge>
                    </div>
                  </div>
                  <div className="pt-2 space-y-1">
                    <Link
                      href="/onboarding"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-charcoal-700 hover:bg-charcoal-50 rounded-xl"
                    >
                      Edit Student Preferences
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-3 py-2 text-xs font-medium text-charcoal-700 hover:bg-charcoal-50 rounded-xl"
                    >
                      My Circles & Orders
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal-700 hover:text-charcoal-900 hover:bg-charcoal-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-charcoal-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full overflow-hidden relative border border-orange-300">
              <Image
                src={currentUser.avatar_url || ''}
                alt={currentUser.full_name}
                width={40}
                height={40}
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="font-bold text-sm text-charcoal-900">{currentUser.full_name}</p>
              <p className="text-xs text-charcoal-500">{currentUser.college}</p>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-charcoal-50 rounded-xl"
            >
              Dashboard & Circles
            </Link>
            <Link
              href="/circles/create"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-swiggy-orange hover:bg-swiggy-light rounded-xl font-semibold"
            >
              + Create New Circle
            </Link>
            {activeCircle && (
              <Link
                href={`/circles/${activeCircle.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-charcoal-50 rounded-xl"
              >
                Active Group Cart ({activeCartCount} items)
              </Link>
            )}
            <Link
              href="/onboarding"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-charcoal-50 rounded-xl"
            >
              Student Preferences
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
