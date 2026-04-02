"use client";

import Link from "next/link";

export default function FeedbackPanel({
  feedbackData,
  timeTaken,
  onTryAgain,
  challengeId,
}) {
  // 1. Destructure the real data from your LLM
  const { score, verdict, summary, feedback } = feedbackData || {};

  // 2. Format the execution time
  const formatTime = (totalSeconds) => {
    const m = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const s = String(totalSeconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // 3. Dynamic styling based on the Verdict
  let themeColor = "text-[#00F0FF]";
  let borderColor = "border-[#00F0FF]";
  let bgColor = "bg-[#00F0FF]";
  let title = "VICTORY";

  // Real ELO data from API
  const eloDelta =
    feedbackData?.eloChange !== undefined
      ? feedbackData.eloChange >= 0
        ? `+${feedbackData.eloChange}`
        : `${feedbackData.eloChange}`
      : verdict === "Pass"
        ? "+??"
        : "-??";

  if (verdict === "Partial") {
    themeColor = "text-yellow-400";
    borderColor = "border-yellow-400";
    bgColor = "bg-yellow-400";
    title = "PARTIAL SUCCESS";
  } else if (verdict === "Fail") {
    themeColor = "text-error";
    borderColor = "border-error";
    bgColor = "bg-error";
    title = "DEFEAT";
  }

  return (
    <div className="flex flex-col h-full bg-[#0E0E11] p-8 gap-12 font-body relative overflow-y-auto">
      <div className="scanline absolute inset-0 opacity-10 pointer-events-none z-0"></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#00F0FF]/15 relative z-10">
        {/* LEFT PANE: Vitals & Action */}
        <div className="bg-[#0E0E11] p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <span
                className={`font-headline text-[10px] tracking-widest border px-2 py-1 bg-opacity-5 ${themeColor} ${borderColor} ${bgColor === "bg-[#00F0FF]" ? "bg-[#00F0FF]" : bgColor === "bg-error" ? "bg-error" : "bg-yellow-400"}`}
              >
                {verdict === "Pass"
                  ? "TRANSMISSION_STABLE"
                  : "TRANSMISSION_ANOMALY"}
              </span>
              <span className="h-px flex-1 bg-surface-container-high"></span>
            </div>

            <h1
              className={`text-6xl font-black font-headline tracking-tighter leading-none mb-4 ${themeColor}`}
            >
              {title}
            </h1>

            <p className="text-[#B3B7CF] font-headline text-sm tracking-widest uppercase mb-8">
              {verdict === "Pass"
                ? "FLAWLESS EXECUTION"
                : "SEQUENCE ITERATION REQUIRED"}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className={`border-l-2 ${borderColor} pl-4`}>
                <div className="text-[8px] font-headline text-[#B3B7CF] uppercase mb-1">
                  Runtime
                </div>
                <div className={`text-xl font-bold ${themeColor}`}>
                  {formatTime(timeTaken)}
                </div>
              </div>
              <div className={`border-l-2 ${borderColor} pl-4`}>
                <div className="text-[8px] font-headline text-[#B3B7CF] uppercase mb-1">
                  Score
                </div>
                <div className={`text-xl font-bold ${themeColor}`}>
                  {score}%
                </div>
              </div>
              <div
                className={`border-l-2 ${borderColor} pl-4 animate-elo-pulse`}
              >
                <div className="text-[8px] font-headline text-[#B3B7CF] uppercase mb-1">
                  ELO Delta
                </div>
                <div
                  className={`text-xl font-bold ${themeColor} flex items-center gap-2`}
                >
                  {eloDelta}
                  <span className="material-symbols-outlined text-sm">
                    {feedbackData?.eloChange >= 0
                      ? "trending_up"
                      : "trending_down"}
                  </span>
                </div>
              </div>
              <div className={`border-l-2 ${borderColor} pl-4`}>
                <div className="text-[8px] font-headline text-[#B3B7CF] uppercase mb-1">
                  New Rating
                </div>
                <div className={`text-xl font-bold ${themeColor} uppercase`}>
                  {feedbackData?.newElo || "---"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8 flex-wrap">
            <button
              onClick={onTryAgain}
              className={`${bgColor} text-[#131316] font-headline font-bold px-6 py-3 flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all text-xs`}
            >
              <span className="material-symbols-outlined text-sm">
                restart_alt
              </span>
              REMATCH
            </button>
            <Link
              href="/"
              className={`bg-[#131316] border ${borderColor}/50 ${themeColor} font-headline font-bold px-6 py-3 flex items-center justify-center gap-3 hover:bg-[#00F0FF]/10 active:scale-95 transition-all text-xs`}
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              RETURN_TO_BASE
            </Link>
            {challengeId && feedbackData?.submissionId && (
              <Link
                href={`/solution/${challengeId}?subId=${feedbackData.submissionId}`}
                className={`bg-purple-500/20 border border-purple-500/50 text-purple-400 font-headline font-bold px-6 py-3 flex items-center justify-center gap-3 hover:bg-purple-500/30 active:scale-95 transition-all text-xs`}
              >
                <span className="material-symbols-outlined text-sm">code</span>
                VIEW_SOLUTION
              </Link>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Oracle Analysis */}
        <div className="bg-[#131316] flex flex-col border-l border-[#00F0FF]/15">
          <div className="p-4 border-b border-[#00F0FF]/15 flex justify-between items-center bg-[#1c1b1e]">
            <div className="flex items-center gap-3">
              <span
                className={`material-symbols-outlined text-sm ${themeColor}`}
              >
                psychology
              </span>
              <h2 className="font-headline text-[10px] tracking-widest text-[#e5e1e5] uppercase">
                ORACLE_ANALYSIS_V4.2
              </h2>
            </div>
          </div>

          <div className="flex-1 p-6 font-body text-xs overflow-y-auto bg-[#0E0E11]/80 space-y-4">
            <div
              className={`p-4 border-l-4 ${borderColor} ${bgColor}/10 text-[#B3B7CF] leading-relaxed italic`}
            >
              &quot;{summary}&quot;
            </div>

            {feedback && feedback.length > 0 && (
              <div className="pt-4">
                <h3
                  className={`font-headline text-[10px] ${themeColor} mb-4 tracking-[0.2em] uppercase`}
                >
                  Detailed Diagnostics
                </h3>
                <div className="space-y-2">
                  {feedback.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col p-3 bg-[#1c1b1e] border-r-2 ${borderColor}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`material-symbols-outlined text-xs ${themeColor}`}
                          >
                            error
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold ${themeColor}`}
                          >
                            Line {item.line}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#B3B7CF] leading-tight mb-1">
                        <span className="text-[#e5e1e5]">ISSUE:</span>{" "}
                        {item.issue}
                      </p>
                      <p className={`text-[10px] ${themeColor} leading-tight`}>
                        <span className="text-[#e5e1e5]">FIX:</span> {item.fix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
