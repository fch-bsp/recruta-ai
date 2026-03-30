"use client";

import { Candidate } from "@/lib/types";
import { Trophy, Users, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function Dashboard({ candidates }: { candidates: Candidate[] }) {
  const evaluated = candidates.filter(c => c.status === "evaluated");
  const analyzed = candidates.filter(c => c.status !== "pending" && c.status !== "analyzing");
  const fitCandidates = evaluated.filter(c => (c.evaluation?.hireProbability ?? 0) > 60);
  const top5 = [...evaluated]
    .sort((a, b) => (b.evaluation?.hireProbability ?? 0) - (a.evaluation?.hireProbability ?? 0))
    .slice(0, 5);

  const chartData = top5.map(c => ({
    name: c.fileName.replace(/\.[^.]+$/, "").slice(0, 20),
    score: c.evaluation?.hireProbability ?? 0,
  }));

  if (candidates.length === 0) return null;

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6 mb-8">
      <h2 className="text-lg font-bold text-neutral-800 dark:text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" /> Painel do Processo
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Stat icon={<Users className="w-4 h-4" />} label="Candidatos" value={candidates.length} color="blue" />
        <Stat icon={<Clock className="w-4 h-4" />} label="Analisados" value={analyzed.length} color="yellow" />
        <Stat icon={<CheckCircle className="w-4 h-4" />} label="FIT (>60%)" value={fitCandidates.length} color="green" />
        <Stat icon={<XCircle className="w-4 h-4" />} label="Avaliados" value={evaluated.length} color="indigo" />
      </div>

      {/* Top 5 Chart */}
      {top5.length > 0 && (
        <div>
          <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider mb-3">Top 5 — Probabilidade de Contratação</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7280", fontSize: 12 }} width={120} />
                <Tooltip cursor={{ fill: "transparent" }} />
                <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.score > 75 ? "#10B981" : entry.score > 50 ? "#F59E0B" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    yellow: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    green: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    indigo: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  };
  return (
    <div className={`${colors[color]} rounded-xl p-4 flex items-center gap-3`}>
      {icon}
      <div>
        <div className="text-2xl font-black">{value}</div>
        <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">{label}</div>
      </div>
    </div>
  );
}
