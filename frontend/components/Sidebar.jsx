"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (path) => pathname === path;

  return (
    <aside className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] flex flex-col p-4 z-40 bg-[#0E0E11] border-r border-[#00F0FF]/15 w-64 hidden lg:flex">
      <div className="mb-8 p-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-surface-container-highest border border-[#00F0FF]/30 flex items-center justify-center overflow-hidden">
            <img 
              alt="OPERATOR_01" 
              className="w-10 h-10 object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0Q7gUidvCMDS97EqRVd-yqBDjNiMCggfm05CnRPwaiu8YokLynu4kBAPWMs2Axr8dQiG8W9i2oLA_6dybSiV8uaJ1sQ1x41_dOzPvZpowG1a3ZFDzVuZDbKHS9icvvKDGnkkHQOnaxoooRkpS_nBHqJEPhfRzye9r-H0bUtIKcprDKjc1SXnFCjMRayzRx_plrn1Undo7OTYn6qMJD2A1vgzURTtmbhurJkC4jModdWXr9D-ilALYJMRy6p6l529W94Ux1c6gLWQG"
            />
          </div>
          <div>
            <div className="font-headline text-xs text-[#00F0FF] tracking-tight uppercase">OPERATOR_01</div>
            <div className="font-body text-[10px] text-[#B3B7CF]">RANK: ELITE_SQUAD</div>
          </div>
        </div>
        <button className="w-full bg-[#00F0FF] text-[#131316] font-bold py-2 text-xs font-headline tracking-widest hover:brightness-110 transition-all uppercase">EXECUTE_ROUTINE</button>
      </div>
      <nav className="flex-1 space-y-1">
        <Link 
          href="/" 
          className={`flex items-center gap-3 p-2 mb-1 transition-colors ${
            isActive('/') ? 'bg-[#00F0FF] text-[#131316] font-bold' : 'text-[#B3B7CF] hover:text-[#00F0FF] hover:bg-[#00F0FF]/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">grid_view</span>
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">DASHBOARD</span>
        </Link>
        <Link 
          href="/challenges" 
          className={`flex items-center gap-3 p-2 mb-1 transition-colors ${
            pathname.startsWith('/challenge') ? 'bg-[#00F0FF] text-[#131316] font-bold' : 'text-[#B3B7CF] hover:text-[#00F0FF] hover:bg-[#00F0FF]/5'
          }`}
        >
          <span className="material-symbols-outlined text-sm">rebase_edit</span>
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">CHALLENGES</span>
        </Link>
        <div className="flex items-center gap-3 p-2 text-[#outline-variant] cursor-not-allowed opacity-50">
          <span className="material-symbols-outlined text-sm">leaderboard</span>
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">RANKINGS (LOCKED)</span>
        </div>
        <div className="flex items-center gap-3 p-2 text-[#outline-variant] cursor-not-allowed opacity-50">
          <span className="material-symbols-outlined text-sm">videocam</span>
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">STREAMS (LOCKED)</span>
        </div>
        <div className="flex items-center gap-3 p-2 text-[#outline-variant] cursor-not-allowed opacity-50">
          <span className="material-symbols-outlined text-sm">description</span>
          <span className="font-headline text-[0.75rem] tracking-widest uppercase">SYSTEM_LOG (LOCKED)</span>
        </div>
      </nav>
      <div className="mt-auto border-t border-[#00F0FF]/10 pt-4 space-y-1">
        <a className="flex items-center gap-3 text-[#B3B7CF] hover:text-[#00F0FF] p-2" href="#">
          <span className="material-symbols-outlined text-sm">code</span>
          <span className="font-headline text-[0.75rem] uppercase">TERMINAL_OUT</span>
        </a>
        <a className="flex items-center gap-3 text-error-container hover:text-error p-2" href="#">
          <span className="material-symbols-outlined text-sm">cancel</span>
          <span className="font-headline text-[0.75rem] uppercase">ABORT</span>
        </a>
      </div>
    </aside>
  );
}
