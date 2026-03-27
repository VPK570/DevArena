"use client";

import Link from 'next/link';

export default function FeedbackPanel({ feedbackData, timeTaken, onTryAgain }) {
  const { score, verdict, feedback, summary } = feedbackData;

  const mm = String(Math.floor(timeTaken / 60)).padStart(2, '0');
  const ss = String(timeTaken % 60).padStart(2, '0');
  const formattedTime = `${mm}:${ss}`;

  const isPass = verdict === "Pass";
  const isPartial = verdict === "Partial";

  return (
    <div className="bg-[#0E0E11] min-h-full relative overflow-y-auto">
      <div className="scanline absolute inset-0 opacity-10 pointer-events-none"></div>
      
      <div className="p-8 flex flex-col gap-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#00F0FF]/15">
          {/* Left Pane: Victory/Verdict Summary */}
          <div className="bg-[#0E0E11] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <span className={`font-headline text-[10px] tracking-widest border px-2 py-1 bg-opacity-5 ${isPass ? 'text-[#00F0FF] border-[#00F0FF]/30 bg-[#00F0FF]' : 'text-error border-error/30 bg-error'}`}>
                  {isPass ? 'TRANSMISSION_STABLE' : 'TRANSMISSION_ANOMALY'}
                </span>
                <span className="h-px flex-1 bg-[#00F0FF]/20"></span>
              </div>
              <h1 className={`text-6xl font-black font-headline tracking-tighter leading-none mb-4 ${isPass ? 'text-[#00F0FF]' : 'text-error'}`}>
                {isPass ? 'VICTORY' : 'DEFEAT'}
              </h1>
              <p className="text-[#B3B7CF] font-headline text-sm tracking-widest uppercase mb-8">{isPass ? 'Flawless Execution' : 'Sequence Iteration Required'}</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="border-l-2 border-[#00F0FF] pl-4">
                  <div className="text-[8px] font-headline text-[#B3B7CF] uppercase mb-1">Runtime</div>
                  <div className="text-xl font-bold text-[#00F0FF]">{formattedTime}</div>
                </div>
                <div className="border-l-2 border-[#00F0FF] pl-4">
                  <div className="text-[8px] font-headline text-[#B3B7CF] uppercase mb-1">Score</div>
                  <div className="text-xl font-bold text-[#00F0FF]">{score}%</div>
                </div>
                <div className="border-l-2 border-[#00F0FF] pl-4">
                  <div className="text-[8px] font-headline text-[#B3B7CF] uppercase mb-1">ELO Delta</div>
                  <div className="text-xl font-bold text-[#00F0FF] flex items-center gap-2">
                    {isPass ? '+24' : '-12'}
                    <span className="material-symbols-outlined text-sm">{isPass ? 'trending_up' : 'trending_down'}</span>
                  </div>
                </div>
                <div className="border-l-2 border-[#00F0FF] pl-4">
                  <div className="text-[8px] font-headline text-[#B3B7CF] uppercase mb-1">Verdict</div>
                  <div className={`text-xl font-bold ${isPass ? 'text-[#00F0FF]' : 'text-error'}`}>{verdict.toUpperCase()}</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                onClick={onTryAgain}
                className="bg-[#00F0FF] text-[#131316] font-headline font-bold px-6 py-3 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all text-xs"
              >
                <span className="material-symbols-outlined text-sm">restart_alt</span>
                REMATCH
              </button>
              <Link 
                href="/"
                className="bg-[#131316] border border-[#00F0FF]/40 text-[#00F0FF] font-headline font-bold px-6 py-3 flex items-center justify-center gap-3 hover:bg-[#00F0FF]/10 active:scale-95 transition-all text-xs"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                RETURN_TO_BASE
              </Link>
            </div>
          </div>

          {/* Right Pane: Oracle Analysis */}
          <div className="bg-[#131316] flex flex-col border-l border-[#00F0FF]/15">
            <div className="p-4 border-b border-[#00F0FF]/15 flex justify-between items-center bg-[#1c1b1e]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#00F0FF] text-sm">psychology</span>
                <h2 className="font-headline text-[10px] tracking-widest text-white uppercase">ORACLE_ANALYSIS_V4.2</h2>
              </div>
            </div>
            <div className="flex-1 p-6 font-body text-xs overflow-y-auto bg-[#0E0E11]/80 space-y-4">
              <div className="p-4 border-l-4 border-[#00F0FF] bg-[#00F0FF]/5 text-[#B3B7CF] leading-relaxed italic">
                "{summary}"
              </div>

              {feedback && feedback.length > 0 && (
                <div className="pt-4">
                  <h3 className="font-headline text-[10px] text-[#00F0FF] mb-4 tracking-[0.2em] uppercase">Test Case Breakdown</h3>
                  <div className="space-y-2">
                    {feedback.map((item, idx) => (
                      <div key={idx} className="flex flex-col p-3 bg-[#1c1b1e] border-r-2 border-[#00F0FF]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-xs text-error">error</span>
                            <span className="text-[10px] uppercase font-bold text-error">Line {item.line}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#B3B7CF] leading-tight mb-1"><span className="text-white">ISSUE:</span> {item.issue}</p>
                        <p className="text-[10px] text-[#00F0FF] leading-tight"><span className="text-white">FIX:</span> {item.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
