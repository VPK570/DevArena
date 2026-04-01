'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { signInWithGitHub, signInWithGoogle, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (loading) return null;

  return (
    <main className="min-h-screen pt-14 flex items-center justify-center p-4">
      <div className="max-w-md w-full relative">
        {/* Terminal Header */}
        <div className="bg-[#1a1a1e] border border-[#00F0FF]/30 p-4 border-b-0 flex justify-between items-center">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF003C]/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFD700]/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]/50"></div>
          </div>
          <div className="text-[10px] text-[#00F0FF]/60 font-headline tracking-[0.3em] uppercase">SYSTEM_AUTHENTICATION_v4.2</div>
        </div>

        {/* Content Body */}
        <div className="bg-[#131316] border border-[#00F0FF]/30 p-8 space-y-10 relative overflow-hidden backdrop-blur-xl shadow-[0_0_50px_rgba(0,240,255,0.05)]">
          {/* Decorative Grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00F0FF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative z-10 space-y-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-headline font-black text-white tracking-widest glitch-text uppercase">INFILTRATE</h1>
              <div className="h-0.5 w-12 bg-[#00F0FF]"></div>
            </div>
            <p className="text-[#B3B7CF] font-body text-xs uppercase tracking-widest leading-relaxed">
              ESTABLISH A SECURE CONNECTION TO THE BATTLE-FRONT GATEWAY. CHOOSE YOUR AUTHENTICATION PROTOCOL.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            {/* GitHub Auth */}
            <button 
              onClick={signInWithGitHub}
              className="w-full group relative flex items-center justify-between p-4 bg-transparent border border-[#00F0FF]/25 hover:border-[#00F0FF] transition-all hover:bg-[#00F0FF]/5 overflow-hidden"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-[#00F0FF] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-2xl text-[#00F0FF]">terminal</span>
                <span className="text-[11px] text-white font-headline tracking-widest uppercase">SSH_AUTH_GITHUB</span>
              </div>
              <span className="text-[10px] text-[#00F0FF]/50 font-headline group-hover:text-[#00F0FF] transition-colors">[READY]</span>
            </button>

            {/* Google Auth */}
            <button 
              onClick={signInWithGoogle}
              className="w-full group relative flex items-center justify-between p-4 bg-transparent border border-[#00F0FF]/25 hover:border-[#00F0FF] transition-all hover:bg-[#00F0FF]/5 overflow-hidden"
            >
              <div className="absolute left-0 top-0 w-1 h-full bg-[#00F0FF]/50 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-2xl text-[#B3B7CF]">hub</span>
                <span className="text-[11px] text-white font-headline tracking-widest uppercase">OAUTH_GOOGLE</span>
              </div>
              <span className="text-[10px] text-[#00F0FF]/50 font-headline group-hover:text-[#00F0FF] transition-colors">[READY]</span>
            </button>
          </div>

          <div className="relative z-10 pt-4 border-t border-[#00F0FF]/10">
            <div className="flex items-center gap-2 text-[9px] text-[#00F0FF]/40 font-headline uppercase tracking-widest">
              <span className="animate-pulse">●</span>
              <span>ENCRYPTED_END_TO_END_SESSION</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex justify-between text-[8px] text-[#B3B7CF]/40 font-headline uppercase tracking-[0.2em]">
          <span>IP_LOGGED: true</span>
          <span>LOCATION: UNKNOWN</span>
          <span>PROTOCOL: TLS_1.3</span>
        </div>
      </div>
    </main>
  );
}
