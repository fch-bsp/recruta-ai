"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Plus, FileText, FolderOpen, Trash2, Briefcase, Users, CheckCircle, ArrowLeft } from "lucide-react";
import { Candidate } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { saveProcess, updateProcess, getUserProcesses, deleteProcess, ProcessRecord } from "@/lib/firebase/firestore";
import CandidateCard from "./CandidateCard";
import CandidateDetail from "./CandidateDetail";
import Dashboard from "./Dashboard";

type View = "HOME" | "SETUP" | "BOARD";

export default function RecruiterInterview() {
  const { user } = useAuth();
  const [view, setView] = useState<View>("HOME");
  const [roleName, setRoleName] = useState("");
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [extractedJd, setExtractedJd] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [processId, setProcessId] = useState<string | null>(null);
  const [savedProcesses, setSavedProcesses] = useState<ProcessRecord[]>([]);
  const [loadingProcesses, setLoadingProcesses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [error, setError] = useState("");
  const cvInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setLoadingProcesses(true);
    getUserProcesses(user.uid).then(p => { setSavedProcesses(p); setLoadingProcesses(false); }).catch(() => setLoadingProcesses(false));
  }, [user]);

  const persistCandidates = useCallback(async (newCandidates: Candidate[]) => {
    if (!user || !extractedJd) return;
    try {
      if (processId) {
        await updateProcess(processId, newCandidates);
      } else {
        const id = await saveProcess(user.uid, roleName, extractedJd, newCandidates);
        setProcessId(id);
      }
    } catch (err) { console.error("Erro ao salvar:", err); }
  }, [user, extractedJd, processId, roleName]);

  const updateCandidatesAndSave = (updater: (prev: Candidate[]) => Candidate[]) => {
    setCandidates(prev => {
      const next = updater(prev);
      persistCandidates(next);
      return next;
    });
  };

  const updateCandidate = (updated: Candidate) => {
    updateCandidatesAndSave(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const resumeProcess = (process: ProcessRecord) => {
    setProcessId(process.id);
    setRoleName(process.roleName);
    setExtractedJd(process.jdText);
    setCandidates(process.candidates);
    setView("BOARD");
  };

  const handleDeleteProcess = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Excluir este processo e todos os candidatos?")) return;
    try {
      await deleteProcess(id);
      setSavedProcesses(prev => prev.filter(p => p.id !== id));
    } catch { /* ignore */ }
  };

  const handleStart = async (cvFiles: FileList) => {
    if (!roleName.trim()) { setError("Informe o nome da vaga."); return; }
    if (!jdFile && !jdText.trim()) { setError("Forneça a descrição da vaga."); return; }
    setError("");
    setLoading(true);

    try {
      let finalJd = extractedJd;
      if (!finalJd) {
        setLoadingMsg("Processando descrição da vaga...");
        const jdForm = new FormData();
        if (jdFile) jdForm.append("jdFile", jdFile);
        else if (jdText) jdForm.append("jdText", jdText);
        const jdRes = await fetch("/api/extract-text", { method: "POST", body: jdForm });
        if (!jdRes.ok) { const e = await jdRes.json().catch(() => ({})); throw new Error(e.details || e.error || "Falha ao processar a vaga."); }
        const jdData = await jdRes.json();
        finalJd = jdData.jdText;
        if (!finalJd) throw new Error("Não foi possível extrair o texto da vaga.");
        setExtractedJd(finalJd);
      }

      const total = cvFiles.length;
      const newCandidates: Candidate[] = [];
      const errors: string[] = [];
      for (let idx = 0; idx < total; idx++) {
        const file = cvFiles[idx];
        setLoadingMsg(`Extraindo currículo ${idx + 1} de ${total}: ${file.name}`);
        try {
          const form = new FormData();
          form.append("cvFile", file);
          const res = await fetch("/api/extract-text", { method: "POST", body: form });
          if (!res.ok) { const e = await res.json().catch(() => ({})); errors.push(`${file.name}: ${e.details || e.error || "erro"}`); continue; }
          const data = await res.json();
          if (!data.cvText) { errors.push(`${file.name}: texto vazio`); continue; }
          newCandidates.push({ id: crypto.randomUUID(), fileName: file.name, cvText: data.cvText, status: "pending" });
        } catch { errors.push(`${file.name}: falha`); }
      }

      if (newCandidates.length > 0) {
        const all = [...candidates, ...newCandidates];
        setCandidates(all);
        setView("BOARD");
        if (user) {
          try {
            if (processId) { await updateProcess(processId, all); }
            else { const id = await saveProcess(user.uid, roleName, finalJd, all); setProcessId(id); }
          } catch { /* ignore */ }
        }
      }
      if (errors.length > 0) setError(`${newCandidates.length} CV(s) ok. Falha em ${errors.length}: ${errors.join(" | ")}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao processar.");
    } finally { setLoading(false); setLoadingMsg(""); }
  };

  const handleAddMore = () => { cvInputRef.current?.click(); };

  const handleAddMoreFiles = async (files: FileList) => {
    if (!extractedJd) return;
    setLoading(true);
    try {
      const arr = Array.from(files);
      const nc: Candidate[] = [];
      for (let i = 0; i < arr.length; i++) {
        setLoadingMsg(`Extraindo currículo ${i + 1} de ${arr.length}: ${arr[i].name}`);
        const form = new FormData();
        form.append("cvFile", arr[i]);
        const res = await fetch("/api/extract-text", { method: "POST", body: form });
        if (!res.ok) continue;
        const data = await res.json();
        if (data.cvText) nc.push({ id: crypto.randomUUID(), fileName: arr[i].name, cvText: data.cvText, status: "pending" });
      }
      if (nc.length > 0) updateCandidatesAndSave(prev => [...prev, ...nc]);
    } finally { setLoading(false); setLoadingMsg(""); }
  };

  const goHome = () => {
    setView("HOME");
    setCandidates([]);
    setExtractedJd("");
    setJdFile(null);
    setJdText("");
    setRoleName("");
    setProcessId(null);
    setError("");
    if (user) getUserProcesses(user.uid).then(setSavedProcesses).catch(() => {});
  };

  const selected = candidates.find(c => c.id === selectedId) || null;

  // ── HOME: List of processes ──
  if (view === "HOME") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Meus Processos</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Gerencie suas vagas e candidatos</p>
            </div>
            <button onClick={() => setView("SETUP")}
              className="flex items-center gap-2 px-5 py-3 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30">
              <Plus className="w-4 h-4" /> Nova Vaga
            </button>
          </header>

          {loadingProcesses ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : savedProcesses.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl">
              <Briefcase className="w-14 h-14 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Nenhum processo criado</h3>
              <p className="text-neutral-400 dark:text-neutral-500 mt-1 mb-6">Crie sua primeira vaga para começar a avaliar candidatos.</p>
              <button onClick={() => setView("SETUP")}
                className="px-6 py-2.5 text-sm font-medium bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
                Criar Primeira Vaga
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {savedProcesses.map(p => {
                const evaluated = p.candidates.filter(c => c.status === "evaluated").length;
                const total = p.candidates.length;
                const topScore = Math.max(0, ...p.candidates.map(c => c.evaluation?.hireProbability ?? 0));
                return (
                  <div key={p.id} onClick={() => resumeProcess(p)}
                    className="group bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 cursor-pointer hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-neutral-800 dark:text-white">{p.roleName}</h3>
                          <p className="text-xs text-neutral-400 mt-0.5">{p.updatedAt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                        </div>
                      </div>
                      <button onClick={(e) => handleDeleteProcess(e, p.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-4 mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-700">
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        <Users className="w-3.5 h-3.5" /> {total} candidato{total !== 1 ? "s" : ""}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                        <CheckCircle className="w-3.5 h-3.5" /> {evaluated} avaliado{evaluated !== 1 ? "s" : ""}
                      </div>
                      {topScore > 0 && (
                        <div className={`ml-auto text-sm font-bold ${topScore > 75 ? "text-green-600" : topScore > 50 ? "text-yellow-600" : "text-red-500"}`}>
                          Top: {topScore}%
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── SETUP: New process ──
  if (view === "SETUP") {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <button onClick={goHome} className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 mb-6 transition">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <header className="mb-10 text-center">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Nova Vaga</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Configure a vaga e suba os currículos</p>
          </header>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 mb-6 text-sm">{error}</div>
          )}

          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 space-y-8">
            {/* Role Name */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold">1</span>
                Nome da Vaga
              </h2>
              <input type="text" value={roleName} onChange={e => setRoleName(e.target.value)}
                placeholder="Ex: Analista de BDR, Desenvolvedor Fullstack, Auxiliar de RH..."
                className="w-full border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-3 bg-neutral-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm" />
            </div>

            {/* Job Description */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold">2</span>
                Descrição da Vaga
              </h2>
              <label className="block bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl p-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition mb-3">
                <span className="block text-sm text-neutral-600 dark:text-neutral-400 mb-2">Upload PDF ou Word</span>
                <input type="file" accept=".pdf,.docx,.doc,.txt" className="text-sm w-full" onChange={e => setJdFile(e.target.files?.[0] || null)} />
              </label>
              <div className="flex items-center gap-4 text-xs text-neutral-400 mb-3">
                <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>OU<div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-700"></div>
              </div>
              <textarea placeholder="Cole a descrição da vaga aqui..." className="w-full h-28 p-3 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none dark:bg-neutral-900"
                value={jdText} onChange={e => setJdText(e.target.value)} disabled={!!jdFile} />
            </div>

            {/* CVs */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold">3</span>
                Currículos dos Candidatos
              </h2>
              <label className="flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl p-8 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:border-blue-400 transition text-center">
                <Upload className="w-8 h-8 text-neutral-400 mb-3" />
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Arraste ou clique para selecionar</span>
                <span className="text-xs text-neutral-400 mt-1">Selecione múltiplos PDFs/DOCX de uma vez</span>
                <input type="file" accept=".pdf,.docx,.doc,.txt" multiple className="hidden"
                  onChange={e => { if (e.target.files?.length) handleStart(e.target.files); }} />
              </label>
            </div>

            {loading && (
              <div className="flex flex-col items-center gap-3 text-blue-600 dark:text-blue-400 py-6">
                <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm font-medium">{loadingMsg || "Processando..."}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── BOARD: Candidates ──
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <button onClick={goHome} className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 mb-6 transition">
          <ArrowLeft className="w-4 h-4" /> Meus Processos
        </button>

        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{roleName}</h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{candidates.length} candidato{candidates.length !== 1 ? "s" : ""} no processo</p>
          </div>
          <button onClick={handleAddMore} disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
            <Plus className="w-4 h-4" /> Adicionar CVs
          </button>
          <input ref={cvInputRef} type="file" accept=".pdf,.docx,.doc,.txt" multiple className="hidden"
            onChange={e => { if (e.target.files?.length) handleAddMoreFiles(e.target.files); }} />
        </header>

        {loading && (
          <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-6">
            <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-sm font-medium">{loadingMsg || "Processando..."}</span>
          </div>
        )}

        <Dashboard candidates={candidates} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map(c => (
            <CandidateCard key={c.id} candidate={c} onClick={() => setSelectedId(c.id)} />
          ))}
        </div>

        {selected && (
          <CandidateDetail candidate={selected} jdText={extractedJd} onUpdate={updateCandidate} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  );
}
