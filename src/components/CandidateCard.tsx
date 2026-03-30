"use client";

import { Candidate } from "@/lib/types";
import { FileText, Loader2, CheckCircle, MessageSquare, BarChart3 } from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pendente", color: "bg-neutral-100 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400", icon: <FileText className="w-3.5 h-3.5" /> },
  analyzing: { label: "Analisando...", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  analyzed: { label: "Analisado", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  interviewing: { label: "Em Entrevista", color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  evaluated: { label: "Avaliado", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400", icon: <BarChart3 className="w-3.5 h-3.5" /> },
};

export default function CandidateCard({ candidate, onClick }: { candidate: Candidate; onClick: () => void }) {
  const s = statusConfig[candidate.status];
  const score = candidate.compatibility?.score;
  const hire = candidate.evaluation?.hireProbability;

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-5 cursor-pointer hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-neutral-800 dark:text-white text-sm line-clamp-1 pr-2">
          {candidate.fileName.replace(/\.[^.]+$/, "")}
        </h3>
        <span className={`${s.color} flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap`}>
          {s.icon} {s.label}
        </span>
      </div>

      {/* Scores */}
      <div className="flex gap-3 mt-auto pt-3 border-t border-neutral-100 dark:border-neutral-700">
        {score !== undefined && (
          <div className="flex-1">
            <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Aderência</div>
            <div className={`text-lg font-black ${score > 70 ? "text-green-600" : score > 40 ? "text-yellow-600" : "text-red-500"}`}>
              {score}%
            </div>
          </div>
        )}
        {hire !== undefined && (
          <div className="flex-1">
            <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Contratação</div>
            <div className={`text-lg font-black ${hire > 75 ? "text-green-600" : hire > 50 ? "text-yellow-600" : "text-red-500"}`}>
              {hire}%
            </div>
          </div>
        )}
        {score === undefined && hire === undefined && (
          <p className="text-xs text-neutral-400 italic">Clique para iniciar análise</p>
        )}
      </div>
    </div>
  );
}
