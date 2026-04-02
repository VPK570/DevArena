"use client";

import { use, useState, useRef, useEffect, useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import challenges from "@/lib/challenges";
import { getSandboxHTML } from "@/lib/sandbox";
import MonacoEditor from "@/components/MonacoEditor";
import FeedbackPanel from "@/components/FeedbackPanel";
import Timer from "@/components/Timer";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase";
import { useAutoSave } from "@/hooks/useAutoSave";
import AIPanel from "@/components/AIPanel";
import {
  Code,
  XCircle,
  Terminal,
  BrainCircuit,
  Zap,
  LineChart,
  Square,
} from "lucide-react";

export default function ChallengePage({ params }) {
  const { id } = use(params);
  const { user, profile, isAuthenticated } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [challenge, setChallenge] = useState(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isRunningTimer, setIsRunningTimer] = useState(true);
  const [viewMode, setViewMode] = useState("sandbox"); // sandbox, loading, feedback
  const [sandboxContent, setSandboxContent] = useState("");
  const [feedbackData, setFeedbackData] = useState(null);
  const [error, setError] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [aiPanel, setAiPanel] = useState({
    open: false,
    loading: false,
    content: null,
    type: null,
  });
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const iframeRef = useRef(null);

  useEffect(() => {
    async function fetchChallenge() {
      console.log("[DEBUG] Fetching challenge for ID:", id);
      console.log("[DEBUG] Supabase client status:", !!supabase);

      setLoadingChallenge(true);

      if (!supabase) {
        console.warn(
          "[DEBUG] Supabase not initialized. Using static fallback.",
        );
        const staticChallenge = challenges.find((c) => c.id === id);
        if (staticChallenge) {
          setChallenge(staticChallenge);
          setCode(staticChallenge.starterCode);
        } else {
          setError("CHALLENGE_NOT_FOUND");
        }
        setLoadingChallenge(false);
        return;
      }

      try {
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            id,
          );
        const query = supabase.from("challenges").select("*");
        if (isUUID) {
          query.eq("id", id);
        } else {
          query.eq("slug", id);
        }
        const { data, error: dbError } = await query.single();

        if (data && !dbError) {
          console.log("[DEBUG] Challenge found in DB");
          setChallenge(data);
          setCode(data.starter_code || "");
        } else {
          console.warn(
            "[DEBUG] Challenge not in DB, falling back to static",
            dbError,
          );
          throw new Error("DB_NOT_FOUND");
        }
      } catch (err) {
        const staticChallenge = challenges.find((c) => c.id === id);
        if (staticChallenge) {
          setChallenge(staticChallenge);
          setCode(staticChallenge.starterCode);
        } else {
          setError("CHALLENGE_NOT_FOUND");
        }
      } finally {
        setLoadingChallenge(false);
      }
    }
    fetchChallenge();
  }, [id, supabase]);

  // AUTO-SAVE SYSTEM
  useAutoSave(challenge?.id, code, isAuthenticated);

  // LOAD DRAFT ON MOUNT
  useEffect(() => {
    async function loadDraft() {
      if (isAuthenticated && user && challenge) {
        try {
          const res = await fetch(
            `/api/drafts/${challenge.slug || challenge.id}`,
          );
          const draftData = await res.json();
          if (draftData.code && draftData.code.trim()) {
            setCode(draftData.code);
            setTerminalLogs((prev) => [
              ...prev,
              {
                type: "log",
                message: `DRAFTS_RESTORED // Last saved: ${new Date(draftData.updatedAt).toLocaleString()}`,
              },
            ]);
          }
        } catch (e) {
          console.warn("Draft restore skipped:", e);
        }
      }
    }
    loadDraft();
  }, [isAuthenticated, user, challenge]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.source === "battle-front-sandbox") {
        setTerminalLogs((prevLogs) => [
          ...prevLogs,
          { type: event.data.type, message: event.data.payload },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (loadingChallenge) {
    return (
      <div className="lg:ml-64 pt-14 h-screen bg-[#131316] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-2 border-l-2 border-[#00F0FF] animate-spin"></div>
          <span className="text-[#00F0FF] font-headline text-xs tracking-widest uppercase">
            Initializing_Arena_Protocol...
          </span>
        </div>
      </div>
    );
  }

  if (!challenge && !loadingChallenge) {
    notFound();
  }

  const handleResetCode = () =>
    setCode(challenge.starter_code || challenge.starterCode);

  const handleRun = () => {
    setTerminalLogs([]);
    const html = getSandboxHTML(code);
    setSandboxContent(html);
    if (iframeRef.current) {
      iframeRef.current.srcdoc = html;
    }
  };

  const submitToOracle = async () => {
    setViewMode("loading");
    setIsRunningTimer(false);
    setError(null);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.slug || challenge.id,
          code,
          language: "javascript",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `SERVER_ERROR_${response.status}`);
      }

      const data = await response.json();
      setFeedbackData(data);
      setViewMode("feedback");
      console.log("SUBMISSION_PERSISTED_SUCCESSFULLY");
    } catch (error) {
      console.error("Submission failed:", error);
      setTerminalLogs((prev) => [
        ...prev,
        {
          type: "error",
          message: `[TRANSMISSION_FAILED] ${error.message}`,
        },
      ]);
      setViewMode("sandbox");
      setIsRunningTimer(true);
    }
  };

  const handleRequestHint = async () => {
    if (hintsRemaining <= 0) {
      setTerminalLogs((prev) => [
        ...prev,
        {
          type: "error",
          message: "[ACCESS_DENIED] All hints for this session have been used.",
        },
      ]);
      return;
    }

    setAiPanel({ open: true, loading: true, content: null, type: "hint" });

    try {
      const res = await fetch("/api/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.slug || challenge.id,
          userCode: code,
        }),
      });

      if (!res.ok) throw new Error("HINT_MODULE_OFFLINE");

      const data = await res.json();
      setAiPanel({ open: true, loading: false, content: data, type: "hint" });
      setHintsRemaining((prev) => prev - 1);
    } catch (err) {
      setAiPanel({ open: false, loading: false, content: null, type: null });
      setTerminalLogs((prev) => [
        ...prev,
        { type: "error", message: `[AI_LINK_SEVERED] ${err.message}` },
      ]);
    }
  };

  const handleExplainCode = async () => {
    if (!code.trim()) {
      setTerminalLogs((prev) => [
        ...prev,
        {
          type: "error",
          message: "[EXPLAIN_ERROR] No code detected for analysis.",
        },
      ]);
      return;
    }

    setAiPanel({ open: true, loading: true, content: null, type: "explain" });

    try {
      const res = await fetch("/api/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeId: challenge.slug || challenge.id,
            code: code,
          }),
        },
      );

      if (!res.ok) throw new Error("ANALYSIS_MODULE_OFFLINE");

      const data = await res.json();
      setAiPanel({
        open: true,
        loading: false,
        content: data,
        type: "explain",
      });
    } catch (err) {
      setAiPanel({ open: false, loading: false, content: null, type: null });
      setTerminalLogs((prev) => [
        ...prev,
        { type: "error", message: `[AI_LINK_SEVERED] ${err.message}` },
      ]);
    }
  };

  const handleRematch = () => {
    setViewMode("sandbox");
    setFeedbackData(null);
    setTerminalLogs([]);
    setSandboxContent("");
    setSeconds(0);
    setIsRunningTimer(true);
    setAiPanel({ open: false, loading: false, content: null, type: null });
  };

  const handleAbort = () => {
    const isConfirmed = window.confirm(
      "WARNING: This will wipe your current code and reset to base parameters. Proceed?",
    );
    if (isConfirmed) {
      setCode(challenge.starter_code || challenge.starterCode);
      setTerminalLogs([
        {
          type: "log",
          message: "SYSTEM_RESET_INITIATED. Code restored to base parameters.",
        },
      ]);
      setSandboxContent("");
    }
  };

  return (
    <main className="lg:ml-64 pt-14 h-screen flex flex-col md:flex-row overflow-hidden bg-surface relative">
      {aiPanel.open && (
        <AIPanel
          type={aiPanel.type}
          loading={aiPanel.loading}
          content={aiPanel.content}
          onClose={() =>
            setAiPanel({
              open: false,
              loading: false,
              content: null,
              type: null,
            })
          }
        />
      )}
      {/* Left Pane: Problem Description */}
      <section className="w-full md:w-1/4 h-full bg-surface-container-lowest border-r border-outline-variant/15 overflow-y-auto flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 text-[10px] font-label font-bold tracking-widest uppercase">
              HARDWARE_LVL_
              {challenge.difficulty.toString().toUpperCase() === "EASY"
                ? "1"
                : challenge.difficulty.toString().toUpperCase() === "MEDIUM"
                  ? "4"
                  : "7"}
            </span>
            <span className="text-primary-container font-label text-[10px]">
              #{challenge.id.toString().substring(0, 6).toUpperCase()}
            </span>
          </div>
          <h1 className="text-2xl font-bold font-headline text-white mb-6 leading-tight tracking-tight uppercase truncate">
            {challenge.title}
          </h1>

          <div className="space-y-6">
            <div className="text-on-secondary-container font-body text-xs leading-relaxed space-y-4">
              <div className="whitespace-pre-wrap prose prose-invert prose-xs max-w-none">
                {challenge.description}
              </div>
            </div>

            {(challenge.constraints || challenge.hints) && (
              <div className="space-y-4">
                {challenge.constraints && (
                  <div className="bg-surface p-4 border-l-2 border-primary-container/30">
                    <h4 className="font-label text-[10px] text-primary-container uppercase mb-2">
                      Technical Constraints
                    </h4>
                    <ul className="list-none p-0 m-0 space-y-1 text-xs">
                      {challenge.constraints.map((c, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-on-surface-variant"
                        >
                          <span className="text-primary-container opacity-50">
                            /
                          </span>{" "}
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {challenge.hints && (
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
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto p-4 bg-surface-container-low/30 border-t border-outline-variant/10">
          <div className="flex justify-between items-center text-[9px] font-label text-outline uppercase tracking-widest">
            <span>Cluster: BRAVO-9</span>
            <div className="flex items-center gap-2">
              <span className="text-[#B3B7CF]">ELAPSED:</span>
              <Timer
                seconds={seconds}
                setSeconds={setSeconds}
                isRunning={isRunningTimer}
              />
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
            onTryAgain={handleRematch}
            challengeId={challenge?.slug || challenge?.id}
          />
        ) : viewMode === "loading" ? (
          <div className="flex-1 flex flex-col items-center justify-center relative z-20">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="absolute inset-0 border-[1px] border-primary-container/30 rounded-full animate-spin [animation-duration:10s]"></div>
              <div className="absolute inset-4 border-[1px] border-tertiary-container/30 rounded-full animate-reverse-spin [animation-duration:6s]"></div>
              <div className="relative w-32 h-32 bg-primary-container/5 backdrop-blur-xl border border-primary-container/40 flex items-center justify-center">
                <div className="text-primary-container drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] flex flex-col items-center">
                  <Code className="w-8 h-8 animate-pulse text-primary-container" />
                  <p className="font-headline text-[0.5rem] mt-2 tracking-[0.2em]">
                    JUDGING
                  </p>
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
                <span className="font-label text-[10px] text-white tracking-widest uppercase">
                  solution.jsx
                </span>
              </div>
              <div className="flex-1"></div>
              <div className="flex gap-2">
                <button
                  onClick={handleAbort}
                  className="text-[9px] font-label text-error hover:text-error-container uppercase transition-colors mr-4 flex items-center gap-1"
                >
                  <XCircle className="w-4 h-4" />
                  ABORT
                </button>
                <button
                  onClick={handleResetCode}
                  className="text-[9px] font-label text-outline hover:text-white uppercase transition-colors"
                >
                  RESET_ROUTINE
                </button>
              </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 min-h-0 relative">
              <MonacoEditor value={code} onChange={setCode} />
            </div>

            {/* Action Bar */}
            <div className="h-14 bg-surface-container-lowest border-t border-outline-variant/20 flex items-center justify-between px-6 shrink-0 relative">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary-container" />
                <span className="font-label text-[10px] text-outline uppercase tracking-widest">
                  {error || "Sandbox_Idle"}
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRequestHint}
                  disabled={hintsRemaining <= 0}
                  className="px-4 py-2 border border-purple-500/50 text-purple-400 font-headline text-[10px] tracking-widest hover:border-purple-400 hover:bg-purple-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase flex items-center gap-2"
                >
                  <BrainCircuit className="w-4 h-4" />
                  HINT [{hintsRemaining}/3]
                </button>
                <button
                  onClick={handleExplainCode}
                  className="px-4 py-2 border border-amber-500/50 text-amber-400 font-headline text-[10px] tracking-widest hover:border-amber-400 hover:bg-amber-500/10 transition-all uppercase flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  EXPLAIN
                </button>
                <button
                  onClick={handleRun}
                  className="px-6 py-2 border border-outline-variant text-outline font-headline text-[10px] font-bold tracking-widest hover:border-primary-container hover:text-primary-container transition-all uppercase"
                >
                  PREVIEW
                </button>
                <button
                  onClick={submitToOracle}
                  disabled={viewMode === "loading"}
                  className="px-8 py-2 bg-primary-container text-on-primary-container font-headline text-[10px] font-bold tracking-[0.2em] shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all uppercase"
                >
                  {viewMode === "loading" ? "JUDGING..." : "INITIATE_JUDGMENT"}
                </button>
              </div>
            </div>

            {/* Sandbox Bottom Area */}
            <div className="h-[250px] bg-[#0E0E11] border-t border-outline-variant/20 flex shrink-0">
              {/* Iframe Box */}
              <div className="w-1/2 h-full border-r border-outline-variant/20 flex flex-col">
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
                    <LineChart className="w-8 h-8 mb-2" />
                    <p className="font-label text-[10px] tracking-widest uppercase">
                      Sandbox_Offline
                    </p>
                  </div>
                )}
              </div>

              {/* Terminal Logs */}
              <div className="w-1/2 h-full bg-black p-4 font-body text-[10px] overflow-y-auto">
                <div className="text-[#00F0FF]/50 text-[10px] mb-2 uppercase tracking-widest font-headline border-b border-[#00F0FF]/20 pb-1">
                  TERMINAL_OUT
                </div>
                {terminalLogs.length === 0 && (
                  <span className="text-outline/50">
                    Waiting for execution...
                  </span>
                )}
                {terminalLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`${log.type === "error" ? "text-error" : "text-primary-container"} mb-1`}
                  >
                    <span className="opacity-50 mr-2">{">"}</span>
                    {log.message}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* Right Pane: Telemetry & Peer Matrix (Placeholder/Visual) */}
      <section className="w-full md:w-1/4 h-full bg-surface-container-lowest border-l border-outline-variant/15 hidden xl:flex flex-col">
        <div className="p-6 border-b border-outline-variant/10">
          <h3 className="font-headline text-[10px] text-white tracking-[0.15em] mb-4 flex items-center justify-between uppercase">
            TEST_MATRIX
            <span className="text-[10px] text-primary-container uppercase">
              Awaiting_Submission
            </span>
          </h3>
          <div className="grid grid-cols-5 gap-2 opacity-20">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="aspect-square border border-outline-variant/30 flex items-center justify-center bg-surface"
              >
                <Square className="w-4 h-4" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          <div>
            <h3 className="font-headline text-[10px] text-outline tracking-[0.2em] mb-4 uppercase">
              Peer_Live_Feed
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: "X_TERMINATOR_8",
                  lvl: "9",
                  progress: "88%",
                  status: "ACTIVE",
                  color: "primary",
                },
                {
                  name: "GHOST_SHELL",
                  lvl: "6",
                  progress: "42%",
                  status: "IDLE",
                  color: "secondary",
                },
                {
                  name: "NEO_VECTOR",
                  lvl: "11",
                  progress: "100%",
                  status: "COMPLETED",
                  color: "error",
                },
              ].map((peer, i) => (
                <div
                  key={i}
                  className={`bg-surface p-3 border-l-2 flex flex-col gap-2 ${peer.color === "primary" ? "border-primary-container" : peer.color === "error" ? "border-error" : "border-secondary"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-label text-[10px] text-white uppercase">
                      {peer.name}
                    </span>
                    <span className="text-[9px] font-body text-primary-container">
                      Lvl {peer.lvl}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-surface-container-highest">
                    <div
                      className={`h-full ${peer.color === "primary" ? "bg-primary-container" : peer.color === "error" ? "bg-error" : "bg-secondary"}`}
                      style={{ width: peer.progress }}
                    ></div>
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
