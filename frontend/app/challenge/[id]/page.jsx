"use client";

import { use, useState, useRef } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import challenges from '@/lib/challenges';
import { getSandboxHTML } from '@/lib/sandbox';
import MonacoEditor from '@/components/MonacoEditor';
import FeedbackPanel from '@/components/FeedbackPanel';
import Timer from '@/components/Timer';

export default function ChallengePage({ params }) {
  const { id } = use(params);
  const challenge = challenges.find(c => c.id === id);

  if (!challenge) {
    notFound();
  }

  const [code, setCode] = useState(challenge.starterCode);
  const [seconds, setSeconds] = useState(0);
  const [isRunningTimer, setIsRunningTimer] = useState(true);
  const [viewMode, setViewMode] = useState("sandbox"); // sandbox, loading, feedback
  const [sandboxContent, setSandboxContent] = useState("");
  const [feedbackData, setFeedbackData] = useState(null);
  const [error, setError] = useState(null);
  const iframeRef = useRef(null);

  const handleResetCode = () => setCode(challenge.starterCode);

  const handleRun = () => {
    const html = getSandboxHTML(code);
    setSandboxContent(html);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
    }
  };

  const handleSubmit = async () => {
    setViewMode("loading");
    setIsRunningTimer(false);
    setError(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, challengeId: challenge.id })
      });

      if (!res.ok) throw new Error("Failed to evaluate code.");

      const data = await res.json();
      setFeedbackData(data);
      setViewMode("feedback");
    } catch (err) {
      setError("An error occurred while evaluating your code. Please try again.");
      setViewMode("sandbox");
      setIsRunningTimer(true);
    }
  };

  const handleTryAgain = () => {
    setViewMode("sandbox");
    setFeedbackData(null);
    setSeconds(0);
    setSandboxContent("");
    setIsRunningTimer(true);
  };

  return (
    <main className="lg:ml-64 pt-14 h-screen flex flex-col md:flex-row overflow-hidden bg-surface">
      {/* Left Pane: Problem Description */}
      <section className="w-full md:w-1/4 h-full bg-surface-container-lowest border-r border-outline-variant/15 overflow-y-auto flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 text-[10px] font-label font-bold tracking-widest uppercase">HARDWARE_LVL_{challenge.difficulty === 'Easy' ? '1' : challenge.difficulty === 'Medium' ? '4' : '7'}</span>
            <span className="text-primary-container font-label text-[10px]">#{challenge.id.substring(0,6).toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-white mb-6 leading-tight tracking-tight uppercase truncate">{challenge.title}</h1>
          
          <div className="space-y-6">
            <div className="text-on-secondary-container font-body text-xs leading-relaxed space-y-4">
               <p className="whitespace-pre-wrap">{challenge.description}</p>
            </div>

            <div className="bg-surface p-4 border-l-2 border-primary-container/30">
              <h4 className="font-label text-[10px] text-primary-container uppercase mb-2">Technical Constraints</h4>
              <ul className="list-none p-0 m-0 space-y-1 text-xs">
                {challenge.constraints.map((c, i) => (
                   <li key={i} className="flex items-start gap-2 text-on-surface-variant">
                     <span className="text-primary-container opacity-50">/</span> {c}
                   </li>
                ))}
              </ul>
            </div>

            <details className="group bg-surface-container-low/30 border border-outline-variant/10 rounded-none">
              <summary className="cursor-pointer p-3 font-label text-[10px] text-primary-container uppercase tracking-widest hover:bg-primary-container/5 transition-colors">
                Decrypt_Hints
              </summary>
              <div className="p-4 pt-0 text-[10px] font-body text-[#B3B7CF] space-y-2 border-t border-outline-variant/10">
                <ul className="list-disc list-inside space-y-2">
                  {challenge.hints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
              </div>
            </details>
          </div>
        </div>
        
        <div className="mt-auto p-4 bg-surface-container-low/30 border-t border-outline-variant/10">
          <div className="flex justify-between items-center text-[9px] font-label text-outline uppercase tracking-widest">
            <span>Cluster: BRAVO-9</span>
            <div className="flex items-center gap-2">
               <span className="text-[#B3B7CF]">ELAPSED:</span>
               <Timer seconds={seconds} setSeconds={setSeconds} isRunning={isRunningTimer} />
            </div>
          </div>
        </div>
      </section>

      {/* Center Pane: Code Editor + Sandbox */}
      <section className="flex-1 h-full bg-surface flex flex-col overflow-hidden relative">
        {viewMode === "feedback" && feedbackData ? (
           <FeedbackPanel 
             feedbackData={feedbackData} 
             timeTaken={seconds} 
             onTryAgain={handleTryAgain} 
           />
        ) : viewMode === "loading" ? (
           <div className="flex-1 flex flex-col items-center justify-center relative z-20">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className="absolute inset-0 border-[1px] border-primary-container/30 rounded-full animate-spin [animation-duration:10s]"></div>
                <div className="absolute inset-4 border-[1px] border-tertiary-container/30 rounded-full animate-reverse-spin [animation-duration:6s]"></div>
                <div className="relative w-32 h-32 bg-primary-container/5 backdrop-blur-xl border border-primary-container/40 flex items-center justify-center">
                  <div className="text-primary-container drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] flex flex-col items-center">
                    <span className="material-symbols-outlined text-4xl animate-pulse">deployed_code</span>
                    <p className="font-headline text-[0.5rem] mt-2 tracking-[0.2em]">JUDGING</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 bg-surface-container-high/50 px-6 py-2 border-y border-primary-container/10 w-80 text-center">
                <p className="font-body text-xs text-primary-container tracking-wider uppercase animate-pulse">
                  Neural_Reasoning_In_Progress...
                </p>
              </div>
           </div>
        ) : (
          <>
            {/* Editor Tabs */}
            <div className="h-10 bg-surface-container-lowest border-b border-outline-variant/15 flex items-center px-4 shrink-0">
              <div className="bg-surface px-4 h-full flex items-center border-x border-outline-variant/20 border-t-2 border-t-primary-container">
                <span className="font-label text-[10px] text-white tracking-widest uppercase">solution.jsx</span>
              </div>
              <div className="flex-1"></div>
              <div className="flex gap-2">
                <button onClick={handleResetCode} className="text-[9px] font-label text-outline hover:text-white uppercase transition-colors">RESET_ROUTINE</button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 min-h-0 relative">
              <MonacoEditor value={code} onChange={setCode} />
            </div>

            {/* Action Bar */}
            <div className="h-14 bg-surface-container-lowest border-t border-outline-variant/20 flex items-center justify-between px-6 shrink-0 relative">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[10px] text-primary-container">terminal</span>
                <span className="font-label text-[10px] text-outline uppercase tracking-widest">{error || 'Sandbox_Idle'}</span>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={handleRun}
                  className="px-6 py-2 border border-outline-variant text-outline font-headline text-[10px] font-bold tracking-widest hover:border-primary-container hover:text-primary-container transition-all uppercase"
                >
                  PREVIEW_EXECUTION
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-8 py-2 bg-primary-container text-on-primary-container font-headline text-[10px] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 active:scale-95 transition-all uppercase"
                >
                  INITIATE_JUDGMENT
                </button>
              </div>
            </div>
            
            {/* Sandbox Bottom Area */}
            <div className="h-[250px] bg-[#0E0E11] border-t border-outline-variant/20 flex flex-col shrink-0">
              {sandboxContent ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={sandboxContent}
                  title="code-sandbox"
                  sandbox="allow-scripts"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                  <span className="material-symbols-outlined text-4xl mb-2">analytics</span>
                  <p className="font-label text-[10px] tracking-widest uppercase">Output_Awaiting_Transmission</p>
                </div>
              )}
            </div>
          </>
        )}
      </section>

      {/* Right Pane: Telemetry & Peer Matrix (Placeholder/Visual) */}
      <section className="w-full md:w-1/4 h-full bg-surface-container-lowest border-l border-outline-variant/15 hidden xl:flex flex-col">
          <div className="p-6 border-b border-outline-variant/10">
            <h3 className="font-headline text-[10px] text-white tracking-[0.15em] mb-4 flex items-center justify-between uppercase">
                TEST_MATRIX
                <span className="text-[10px] text-primary-container uppercase">Awaiting_Submission</span>
            </h3>
            <div className="grid grid-cols-5 gap-2 opacity-20">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="aspect-square border border-outline-variant/30 flex items-center justify-center bg-surface">
                        <span className="material-symbols-outlined text-[10px]">square</span>
                    </div>
                ))}
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
            <div>
              <h3 className="font-headline text-[10px] text-outline tracking-[0.2em] mb-4 uppercase">Peer_Live_Feed</h3>
              <div className="space-y-4">
                {[
                    { name: 'X_TERMINATOR_8', lvl: '9', progress: '88%', status: 'ACTIVE', color: 'primary' },
                    { name: 'GHOST_SHELL', lvl: '6', progress: '42%', status: 'IDLE', color: 'secondary' },
                    { name: 'NEO_VECTOR', lvl: '11', progress: '100%', status: 'COMPLETED', color: 'error' }
                ].map((peer, i) => (
                    <div key={i} className={`bg-surface p-3 border-l-2 flex flex-col gap-2 ${peer.color === 'primary' ? 'border-primary-container' : peer.color === 'error' ? 'border-error' : 'border-secondary' }`}>
                        <div className="flex justify-between items-center">
                            <span className="font-label text-[10px] text-white uppercase">{peer.name}</span>
                            <span className="text-[9px] font-body text-primary-container">Lvl {peer.lvl}</span>
                        </div>
                        <div className="w-full h-1 bg-surface-container-highest">
                            <div className={`h-full ${peer.color === 'primary' ? 'bg-primary-container' : peer.color === 'error' ? 'bg-error' : 'bg-secondary' }`} style={{ width: peer.progress }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] font-label text-outline uppercase">
                            <span>Progress: {peer.progress}</span>
                            <span>{peer.status}</span>
                        </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/15">
             <div className="flex items-center justify-between font-label text-[9px] text-outline/50 uppercase mb-2">
                <span>CPU_LOAD</span>
                <span>14.2%</span>
             </div>
             <div className="w-full h-0.5 bg-surface-container-highest mb-4">
                <div className="w-[14.2%] h-full bg-primary-container/40"></div>
             </div>
             <div className="flex items-center justify-between font-label text-[9px] text-outline/50 uppercase">
                <span>MEMORY</span>
                <span>256MB / 1GB</span>
             </div>
          </div>
      </section>
      
    </main>
  );
}
