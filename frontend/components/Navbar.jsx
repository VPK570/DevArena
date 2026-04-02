"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { User, UserCircle, LogOut, Radio, Terminal } from "lucide-react";

export default function Navbar() {
  const { profile, isAuthenticated, signOut, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="flex justify-between items-center w-full px-6 h-14 bg-[#131316] fixed top-0 z-50 border-b border-[#00F0FF]/15">
      <div className="flex items-center gap-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-widest text-[#00F0FF] font-headline hover:text-white transition-colors"
        >
          BATTLE-FRONT
        </Link>
        <nav className="hidden md:flex gap-6 items-center h-full">
          <Link
            className="text-[#00F0FF] border-b-2 border-[#00F0FF] pb-1 font-headline text-xs tracking-[0.1em] transition-all duration-50"
            href="/"
          >
            TERMINAL
          </Link>
          <a
            className="text-[#B3B7CF] hover:bg-[#00F0FF]/10 hover:text-white transition-all duration-50 font-headline text-xs tracking-[0.1em]"
            href="#"
          >
            STREAK
          </a>
          <a
            className="text-[#B3B7CF] hover:bg-[#00F0FF]/10 hover:text-white transition-all duration-50 font-headline text-xs tracking-[0.1em]"
            href="#"
          >
            MARKET
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {!loading &&
          (isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-1 px-3 hover:bg-[#00F0FF]/5 border border-[#00F0FF]/10 transition-all group"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white font-headline tracking-tighter uppercase leading-none">
                    {profile?.username || "GHOST_OPERATOR"}
                  </span>
                  <span className="text-[9px] text-[#00F0FF] font-headline tracking-widest opacity-70 leading-none mt-1">
                    {profile?.elo_rating || 1200} ELO
                  </span>
                </div>
                <div className="w-8 h-8 bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? (
                    <img
                      alt={profile.username}
                      className="w-full h-full object-cover"
                      src={profile.avatar_url}
                    />
                  ) : (
                    <User className="w-4 h-4 text-[#00F0FF]" />
                  )}
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#131316] border border-[#00F0FF]/25 shadow-[0_0_20px_rgba(0,240,255,0.1)] z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-[#00F0FF]/10 bg-[#00F0FF]/5">
                    <div className="text-[9px] text-[#00F0FF]/50 font-headline uppercase tracking-widest px-2">
                      Access_Level
                    </div>
                    <div className="text-[11px] text-[#00F0FF] font-headline uppercase px-2">
                      AUTHORIZED_USER
                    </div>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-[11px] text-[#B3B7CF] hover:bg-[#00F0FF]/10 hover:text-white transition-all uppercase font-headline"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <UserCircle className="w-4 h-4" />
                      Vitals_Record
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-error-container hover:bg-error-container/10 transition-all uppercase font-headline"
                    >
                      <LogOut className="w-4 h-4" />
                      Terminate_Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-6 py-2 border border-[#00F0FF] text-[#00F0FF] font-headline text-xs tracking-[0.2em] hover:bg-[#00F0FF] hover:text-[#131316] transition-all duration-300 uppercase shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            >
              AUTHENTICATE
            </Link>
          ))}

        <div className="flex items-center border-l border-[#00F0FF]/15 pl-4 gap-2 text-[#00F0FF]">
          <button className="p-2 hover:bg-[#00F0FF]/10 transition-all duration-50">
            <Radio className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-[#00F0FF]/10 transition-all duration-50">
            <Terminal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
