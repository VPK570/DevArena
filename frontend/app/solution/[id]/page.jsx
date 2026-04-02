"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import MonacoEditor from "@/components/MonacoEditor";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertCircle,
  ArrowLeft,
  User,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

export default function SolutionPage({ params }) {
  const { id: challengeId } = use(params);
  const searchParams = useSearchParams();
  const subId = searchParams.get("subId");
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [submission, setSubmission] = useState(null);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!subId) {
      setError("No submission ID provided.");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        // 1. Fetch user's submission
        const subRes = await fetch(`/api/submissions/${subId}`);
        if (!subRes.ok) throw new Error("Failed to load submission");
        const subData = await subRes.json();
        setSubmission(subData);

        // 2. Fetch AI Solution
        const solRes = await fetch("/api/solution", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId, userCode: subData.code }),
        });
        if (!solRes.ok) {
          const errBody = await solRes.json().catch(() => ({}));
          throw new Error(errBody.error || "Failed to load AI solution");
        }
        const solData = await solRes.json();
        setSolution(solData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [challengeId, subId, isAuthenticated, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="lg:ml-64 pt-14 h-screen bg-[#131316] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-t-2 border-l-2 border-purple-500 animate-spin"></div>
          <span className="text-purple-500 font-headline text-xs tracking-widest uppercase">
            Fetching_Solution_Matrix...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:ml-64 pt-14 h-screen bg-[#131316] flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-16 h-16 text-error" />
        <h2 className="text-error font-headline font-bold text-2xl uppercase">
          Error Loading Data
        </h2>
        <p className="text-outline font-body text-sm">{error}</p>
        <Link
          href={`/challenge/${challengeId}`}
          className="mt-4 px-6 py-2 bg-surface border border-outline hover:border-primary-container text-white transition-colors uppercase font-headline tracking-widest text-xs"
        >
          Return_to_Arena
        </Link>
      </div>
    );
  }

  return (
    <main className="lg:ml-64 pt-14 h-screen flex flex-col bg-surface relative overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-outline-variant/15 flex items-center justify-between px-8 bg-surface-container-lowest shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-xl font-bold text-white uppercase tracking-tight">
            Solution Comparison
          </h1>
          <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-3 py-1 font-label text-[10px] uppercase tracking-widest">
            {challengeId}
          </span>
        </div>
        <Link
          href={`/challenge/${challengeId}`}
          className="px-6 py-2 border border-outline-variant text-outline font-headline text-[10px] font-bold tracking-widest hover:border-primary-container hover:text-primary-container transition-all uppercase flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return_to_Arena
        </Link>
      </header>

      {/* Main Comparison Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Pane: User Code */}
        <section className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r border-outline-variant/20 bg-surface h-1/2 md:h-full">
          <div className="h-10 bg-surface-container-highest border-b border-outline-variant/20 flex items-center px-4 shrink-0">
            <User className="w-4 h-4 text-primary-container mr-2" />
            <span className="font-label text-[10px] text-white tracking-widest uppercase">
              Your_Submission
            </span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <MonacoEditor value={submission?.code || ""} readOnly={true} />
          </div>
        </section>

        {/* Right Pane: AI Solution Code */}
        <section className="w-full md:w-1/2 flex flex-col bg-surface h-1/2 md:h-full relative">
          <div className="h-10 bg-purple-900/10 border-b border-purple-500/20 flex items-center px-4 shrink-0">
            <BrainCircuit className="w-4 h-4 text-purple-500 mr-2" />
            <span className="font-label text-[10px] text-purple-400 tracking-widest uppercase">
              Oracle_Solution
            </span>
          </div>
          <div className="flex-1 min-h-0 relative">
            <MonacoEditor value={solution?.solution || ""} readOnly={true} />
          </div>
        </section>
      </div>

      {/* Footer Details */}
      <footer className="h-48 md:h-64 bg-[#0E0E11] border-t border-outline-variant/20 flex shrink-0 overflow-y-auto">
        <div className="w-full p-6 text-sm font-body text-on-surface-variant flex flex-col md:flex-row gap-8">
          {/* Explanation */}
          <div className="flex-1">
            <h3 className="text-purple-400 font-headline uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <Sparkles className="w-5 h-5 animate-pulse" />
              SYSTEM_ARCHITECTURE_DEBRIEF
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solution?.explanation?.split("\n").filter(line => line.trim()).map((line, idx) => (
                <div key={idx} className="bg-surface-container-low border-l-2 border-purple-500/30 p-4 hover:border-purple-500 transition-colors">
                  <div className="text-[10px] text-purple-400 opacity-50 mb-1 font-headline tracking-widest uppercase">NODE_{String(idx + 1).padStart(2, "0")}</div>
                  <p className="text-xs text-[#B3B7CF] leading-relaxed">
                    {line.replace(/^-\s*/, "")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Score overview */}
          <div className="w-full md:w-64 shrink-0 border-t md:border-t-0 md:border-l border-outline-variant/20 pt-4 md:pt-0 md:pl-8">
            <h3 className="text-white font-headline uppercase tracking-widest mb-4">
              Submission Metrics
            </h3>
            <ul className="space-y-4">
              <li>
                <div className="text-[10px] text-outline font-label uppercase mb-1">
                  Score
                </div>
                <div className="text-2xl font-bold text-primary-container">
                  {submission?.score || 0}%
                </div>
              </li>
              <li>
                <div className="text-[10px] text-outline font-label uppercase mb-1">
                  Verdict
                </div>
                <div
                  className={`text-sm font-bold uppercase ${submission?.verdict === "pass" ? "text-primary-container" : submission?.verdict === "partial" ? "text-yellow-400" : "text-error"}`}
                >
                  {submission?.verdict || "FAIL"}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </main>
  );
}
