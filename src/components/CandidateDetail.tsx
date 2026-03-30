"use client";

import { useState } from "react";
import { X, ArrowRight, Loader2, Maximize2, Minimize2, StickyNote } from "lucide-react";
import { Candidate } from "@/lib/types";
import {
  analyzeCompatibility,
  generateTechnicalQuestions,
  evaluateCandidateAnswers,
} from "@/lib/ai";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

type DetailStep = "COMPATIBILITY" | "NOTES" | "LOADING_EVAL" | "RESULT";

interface Props {
  candidate: Candidate;
  jdText: string;
  onUpdate: (updated: Candidate) => void;
  onClose: () => void;
}

export default function CandidateDetail({ candidate, jdText, onUpdate, onClose }: Props) {
  const [step, setStep] = useState<DetailStep>(
    candidate.status === "evaluated" ? "RESULT" :
    candidate.status === "interviewing" ? "NOTES" :
    "COMPATIBILITY"
  );
  const [answers, setAnswers] = useState<string[]>(candidate.answers || new Array(candidate.questions?.length || 0).fill(""));
  const [recruiterNotes, setRecruiterNotes] = useState(candidate.recruiterNotes || "");
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    try {
      onUpdate({ ...candidate, status: "analyzing" });
      const [comp, qs] = await Promise.all([
        analyzeCompatibility(candidate.cvText, jdText),
        generateTechnicalQuestions(candidate.cvText, jdText),
      ]);
      const updated: Candidate = { ...candidate, status: "analyzed", compatibility: comp, questions: qs };
      setAnswers(new Array(qs.length).fill(""));
      onUpdate(updated);
      setStep("COMPATIBILITY");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro na análise.");
      onUpdate({ ...candidate, status: "pending" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEval = async () => {
    setStep("LOADING_EVAL");
    setError("");
    try {
      const qaList = (candidate.questions || []).map((q, i) => ({
        question: q,
        answer: answers[i] || "",
      }));
      const evaluation = await evaluateCandidateAnswers(candidate.cvText, jdText, qaList, recruiterNotes);
      const updated: Candidate = {
        ...candidate,
        status: "evaluated",
        answers,
        recruiterNotes,
        evaluation,
      };
      onUpdate(updated);
      setStep("RESULT");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro na avaliação.");
      setStep("NOTES");
    }
  };

  const name = candidate.fileName.replace(/\.[^.]+$/, "");
  const comp = candidate.compatibility;
  const evalResult = candidate.evaluation;

  const containerClass = fullscreen
    ? "fixed inset-0 z-50 flex flex-col bg-white dark:bg-neutral-800"
    : "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm";

  const panelClass = fullscreen
    ? "flex-1 flex flex-col overflow-hidden"
    : "bg-white dark:bg-neutral-800 w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden";

  return (
    <div className={containerClass}>
      <div className={panelClass}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-neutral-800 dark:text-white">{name}</h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setFullscreen(!fullscreen)}
              className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition"
              title={fullscreen ? "Minimizar" : "Tela cheia"}>
              {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-xl border border-red-200 dark:border-red-800 mb-4 text-sm">{error}</div>
          )}

          {/* Pending */}
          {candidate.status === "pending" && (
            <div className="text-center py-12">
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">Este candidato ainda não foi analisado pela IA.</p>
              <button onClick={handleAnalyze} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 mx-auto">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</> : "Iniciar Análise com IA"}
              </button>
            </div>
          )}

          {candidate.status === "analyzing" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-500 dark:text-neutral-400">Analisando compatibilidade e gerando perguntas...</p>
            </div>
          )}

          {/* Compatibility */}
          {step === "COMPATIBILITY" && comp && (
            <div className="text-center">
              <h3 className="text-sm uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold mb-4">Aderência à Vaga</h3>
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-neutral-100 dark:text-neutral-700" />
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="10" fill="transparent"
                      className={comp.score > 70 ? "text-green-500" : comp.score > 40 ? "text-yellow-500" : "text-red-500"}
                      strokeDasharray={301.6} strokeDashoffset={301.6 - (301.6 * comp.score) / 100} strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{comp.score}%</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50/50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100/50 dark:border-blue-800/50 text-left mb-6">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm">{comp.judgment}</p>
              </div>
              <button onClick={() => { onUpdate({ ...candidate, status: "interviewing" }); setStep("NOTES"); }}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition flex items-center gap-2 mx-auto">
                Ir para Entrevista <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Notes + Interview */}
          {step === "NOTES" && candidate.questions && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-white">Questionário Técnico</h3>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full">{candidate.questions.length} Perguntas</span>
              </div>

              <div className="space-y-6">
                {candidate.questions.map((q, i) => (
                  <div key={i} className="bg-neutral-50 dark:bg-neutral-900/50 p-5 rounded-xl border border-neutral-100 dark:border-neutral-700">
                    <h4 className="font-medium text-neutral-800 dark:text-neutral-200 mb-3 text-sm flex gap-2">
                      <span className="text-blue-500 font-bold">Q{i + 1}.</span> {q}
                    </h4>
                    <textarea
                      placeholder="Anotações sobre a resposta..."
                      className="w-full h-20 p-3 text-sm bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl resize-y focus:ring-2 focus:ring-blue-500 outline-none transition"
                      value={answers[i]}
                      onChange={e => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }}
                    />
                  </div>
                ))}
              </div>

              {/* Anotações livres do recrutador */}
              <div className="mt-8 bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <StickyNote className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">Anotações Livres do Recrutador</h4>
                </div>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/60 mb-3">
                  Impressões gerais, observações comportamentais, red flags, pontos de destaque... Essas notas serão consideradas pela IA na avaliação final.
                </p>
                <textarea
                  placeholder="Ex: Candidato demonstrou nervosismo no início mas se soltou ao falar de projetos. Boa comunicação. Pediu salário acima da faixa..."
                  className="w-full h-28 p-3 text-sm bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-700/50 rounded-xl resize-y focus:ring-2 focus:ring-amber-500 outline-none transition"
                  value={recruiterNotes}
                  onChange={e => setRecruiterNotes(e.target.value)}
                />
              </div>

              <div className="mt-8 flex justify-end">
                <button onClick={handleSubmitEval} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition">
                  Concluir e Avaliar
                </button>
              </div>
            </div>
          )}

          {/* Loading eval */}
          {step === "LOADING_EVAL" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-neutral-500 dark:text-neutral-400">Gerando avaliação final...</p>
            </div>
          )}

          {/* Result */}
          {step === "RESULT" && evalResult && (
            <div>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-5 border border-neutral-100 dark:border-neutral-700 flex flex-col items-center">
                  <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider mb-4">Probabilidade de Contratação</h3>
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: "FIT", score: evalResult.hireProbability }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} width={30} />
                        <Tooltip cursor={{ fill: "transparent" }} />
                        <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={40}>
                          <Cell fill={evalResult.hireProbability > 75 ? "#10B981" : evalResult.hireProbability > 50 ? "#F59E0B" : "#EF4444"} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <span className="text-3xl font-black mt-2" style={{ color: evalResult.hireProbability > 75 ? "#10B981" : evalResult.hireProbability > 50 ? "#F59E0B" : "#EF4444" }}>
                    {evalResult.hireProbability}%
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase font-bold text-blue-500 mb-2">Avaliação Técnica</h4>
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 text-sm leading-relaxed text-blue-900 dark:text-blue-100">
                      {evalResult.technicalFeedback}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-bold text-indigo-500 mb-2">FIT Comportamental</h4>
                    <div className="bg-indigo-50/50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 text-sm leading-relaxed text-indigo-900 dark:text-indigo-100">
                      {evalResult.behavioralFeedback}
                    </div>
                  </div>
                </div>
              </div>

              {/* Show recruiter notes in result */}
              {candidate.recruiterNotes && (
                <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-200/50 dark:border-amber-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <StickyNote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-xs uppercase font-bold text-amber-700 dark:text-amber-400 tracking-wider">Anotações do Recrutador</h4>
                  </div>
                  <p className="text-sm text-amber-900/80 dark:text-amber-200/70 leading-relaxed whitespace-pre-wrap">{candidate.recruiterNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
