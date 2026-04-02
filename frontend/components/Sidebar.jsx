"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Sword,
  Trophy,
  Video,
  FileText,
  Terminal,
  XCircle,
  User,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, isAuthenticated } = useAuth();
  const isActive = (path) => pathname === path;

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] flex flex-col p-4 z-40 bg-[#0E0E11] border-r border-[#00F0FF]/15 w-64 hidden lg:flex">
      <div className="mb-8 p-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-surface-container-highest border border-[#00F0FF]/30 flex items-center justify-center overflow-hidden">
            {isAuthenticated && profile?.avatar_url ? (
              <img
                alt={profile.username}
                className="w-10 h-10 object-cover"
                src={profile.avatar_url}
              />
            ) : (
              <User className="w-6 h-6 text-[#00F0FF]" />
            )}
          </div>
          <div>
            <div className="font-headline text-xs text-[#00F0FF] tracking-tight uppercase">
              {isAuthenticated ? profile?.username : "GUEST_USER"}
            </div>
            <div className="font-body text-[10px] text-[#B3B7CF]">
              {isAuthenticated ? (
                <>ELO: {profile?.elo_rating || "----"}</>
              ) : (
                "RANK: UNKNOWN"
              )}
            </div>
          </div>
        </div>
        {!isAuthenticated && (
          <Link
            href="/login"
            className="w-full bg-[#00F0FF] text-[#131316] font-bold py-2 text-xs font-headline tracking-widest hover:brightness-110 transition-all uppercase block text-center"
          >
            AUTHENTICATE
          </Link>
        )}
      </div>
      <nav className="flex-1 space-y-1">
        <Link
          href="/"
          className={`flex items-center gap-3 p-2 mb-1 transition-colors ${
            isActive("/")
              ? "bg-[#00F0FF] text-[#131316] font-bold"
              : "text-[#B3B7CF] hover:text-[#00F0FF] hover:bg-[#00F0FF]/5"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">
            DASHBOARD
          </span>
        </Link>
        <Link
          href="/challenges"
          className={`flex items-center gap-3 p-2 mb-1 transition-colors ${
            pathname.startsWith("/challenge")
              ? "bg-[#00F0FF] text-[#131316] font-bold"
              : "text-[#B3B7CF] hover:text-[#00F0FF] hover:bg-[#00F0FF]/5"
          }`}
        >
          <Sword className="w-4 h-4" />
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">
            CHALLENGES
          </span>
        </Link>
        <div className="flex items-center gap-3 p-2 text-[#outline-variant] cursor-not-allowed opacity-50">
          <Trophy className="w-4 h-4" />
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">
            RANKINGS (LOCKED)
          </span>
        </div>
        <div className="flex items-center gap-3 p-2 text-[#outline-variant] cursor-not-allowed opacity-50">
          <Video className="w-4 h-4" />
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">
            STREAMS (LOCKED)
          </span>
        </div>
        <div className="flex items-center gap-3 p-2 text-[#outline-variant] cursor-not-allowed opacity-50">
          <FileText className="w-4 h-4" />
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">
            SYSTEM_LOG (LOCKED)
          </span>
        </div>
      </nav>
      <div className="mt-auto border-t border-[#00F0FF]/10 pt-4 space-y-1">
        <a
          className="flex items-center gap-3 text-[#B3B7CF] hover:text-[#00F0FF] p-2"
          href="#"
        >
          <Terminal className="w-4 h-4" />
          <span className="font-headline text-[0.75rem] uppercase">
            TERMINAL_OUT
          </span>
        </a>
        <a
          className="flex items-center gap-3 text-error-container hover:text-error p-2"
          href="#"
        >
          <XCircle className="w-4 h-4" />
          <span className="font-headline text-[0.75rem] uppercase">ABORT</span>
        </a>
      </div>
    </aside>
  );
}
