"use client";

import { useState, useEffect } from 'react';

export default function AIPanel({ type, loading, content, onClose }) {
  return (
    <div className={`fixed right-0 top-14 bottom-0 w-[400px] z-[60] 
                    bg-[#0E0E11] border-l border-[#00F0FF]/25 
                    shadow-[-20px_0_60px_rgba(0,240,255,0.15)]
                    animate-slide-in-right flex flex-col`}>
      
      {/* Header */}
      <div className="h-12 border-b border-[#00F0FF]/15 flex items-center 
                      justify-between px-4 bg-[#131316]">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-sm ${type === 'hint' ? 'text-purple-400' : 'text-amber-400'}`}>
            {type === 'hint' ? 'psychology' : 'bolt'}
          </span>
          <span className="font-headline text-[10px] text-white tracking-widest uppercase">
            {type === 'hint' ? 'AI_HINT_MODULE' : 'CODE_ANALYSIS'}
          </span>
        </div>
        <button onClick={onClose} className="text-[#B3B7CF] hover:text-white transition-all transform hover:rotate-90">
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-16 h-16 border border-purple-500/30 flex items-center justify-center relative">
              <div className="absolute inset-0 border border-purple-400 animate-ping opacity-20"></div>
              <span className="material-symbols-outlined text-3xl text-purple-400 animate-pulse">
                deployed_code
              </span>
            </div>
            <p className="font-headline text-[10px] text-purple-400 tracking-[0.2em] animate-pulse uppercase">
              Neural_Analysis_In_Progress...
            </p>
          </div>
        ) : type === 'hint' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 
                               text-[9px] font-headline border border-purple-500/30 
                               uppercase tracking-widest">
                {content?.category || 'Approach'}
              </span>
            </div>
            <div className="bg-[#131316] border-l-2 border-purple-500/50 p-4 relative">
              <div className="absolute top-0 right-0 p-1 opacity-10">
                <span className="material-symbols-outlined text-4xl">lightbulb</span>
              </div>
              <TypingAnimation text={content?.hint} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overall Summary */}
            <div className="bg-[#131316] border-l-2 border-amber-500/50 p-4">
              <div className="text-[9px] font-headline text-amber-400 mb-2 uppercase tracking-widest opacity-60">
                Executive_Summary
              </div>
              <p className="text-xs text-[#B3B7CF] leading-relaxed">
                {content?.overallSummary}
              </p>
            </div>
            
            {/* Line-by-line breakdown */}
            <div>
              <div className="text-[9px] font-headline text-amber-400 mb-4 uppercase tracking-[0.2em]">
                Line_Analysis
              </div>
              <div className="space-y-3">
                {content?.lines?.map((item, idx) => (
                  <div key={idx} className="bg-[#131316] p-4 border-r-2 border-amber-500/10 hover:border-amber-500/40 transition-all group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] text-amber-400/60 font-headline group-hover:text-amber-400">
                        LINE_{String(item.line).padStart(3, '0')}
                      </span>
                    </div>
                    <code className="text-[10px] text-[#00F0FF] block mb-2 font-body bg-black/30 p-2 border border-white/5">
                      {item.code}
                    </code>
                    <p className="text-[10px] text-[#B3B7CF] leading-relaxed italic">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#131316] border-t border-[#00F0FF]/10 text-[8px] font-headline text-outline tracking-widest uppercase opacity-40 italic">
        CONNECTED_TO_ORACLE_V2.0
      </div>
    </div>
  );
}

function TypingAnimation({ text }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!text) return;
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <p className="font-body text-xs text-[#B3B7CF] leading-relaxed whitespace-pre-wrap">
      {displayed}
      <span className="inline-block w-2 h-4 bg-[#00F0FF] ml-1 animate-pulse align-middle"></span>
    </p>
  );
}
