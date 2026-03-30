"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserInterviews, InterviewRecord, updateInterviewNotes, RecruiterNotes, deleteInterview } from "@/lib/firebase/firestore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Calendar, UserCircle, Briefcase, FileText, ChevronRight, X, DollarSign, MapPin, ThumbsUp, ThumbsDown, Trash2, Trophy, Medal, Star } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";

export default function HistoryPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'fit' | 'name'>('fit');
  const [selectedInterview, setSelectedInterview] = useState<InterviewRecord | null>(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  const [tempRecruiterNotes, setTempRecruiterNotes] = useState<RecruiterNotes>({});
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  const handleSaveNotes = async () => {
    if (!selectedInterview) return;
    setIsSavingNotes(true);
    try {
      await updateInterviewNotes(selectedInterview.id, tempNotes, tempRecruiterNotes);
      const updatedInterview = { ...selectedInterview, notes: tempNotes, recruiterNotes: tempRecruiterNotes };
      setSelectedInterview(updatedInterview);
      setInterviews(prev => prev.map(inv => inv.id === selectedInterview.id ? updatedInterview : inv));
      setIsEditingNotes(false);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar anotações. Tente novamente.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDeleteInterview = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir esta entrevista do histórico?")) {
      try {
        await deleteInterview(id);
        setInterviews(prev => prev.filter(inv => inv.id !== id));
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir. Tente novamente.");
      }
    }
  };

  useEffect(() => {
    if (!user) return;

    getUserInterviews(user.uid)
      .then(data => {
        setInterviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar histórico:", err);
        setLoading(false);
      });
  }, [user]);
  const sortedInterviews = useMemo(() => {
    return [...interviews].sort((a, b) => {
      if (sortBy === 'fit') {
        const fitA = a.analysis?.evaluation?.hireProbability || 0;
        const fitB = b.analysis?.evaluation?.hireProbability || 0;
        return Number(fitB) - Number(fitA);
      }
      if (sortBy === 'name') {
        return a.candidateName.localeCompare(b.candidateName);
      }
      // date sorting
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [interviews, sortBy]);

  const getRankingBadge = (index: number) => {
    if (sortBy !== 'fit') return null;
    if (index === 0) return <div className="absolute -top-3 -left-3 bg-yellow-400 text-yellow-950 p-2 rounded-full shadow-lg z-10 animate-pulse border-2 border-yellow-200"><Trophy size={20} /></div>;
    if (index === 1) return <div className="absolute -top-3 -left-3 bg-slate-300 text-slate-800 p-2 rounded-full shadow-lg z-10 border-2 border-slate-100"><Medal size={20} /></div>;
    if (index === 2) return <div className="absolute -top-3 -left-3 bg-amber-600 text-amber-50 p-2 rounded-full shadow-lg z-10 border-2 border-amber-400"><Medal size={20} /></div>;
    return null;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Histórico de Entrevistas
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2">Veja e compare os candidatos avaliados.</p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-sm">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-2">Ordenar:</span>
            <button 
              onClick={() => setSortBy('fit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'fit' ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
            >
              Melhor FIT
            </button>
            <button 
              onClick={() => setSortBy('date')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'date' ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
            >
              Data
            </button>
            <button 
              onClick={() => setSortBy('name')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${sortBy === 'name' ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
            >
              Nome
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl">
            <UserCircle className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Nenhum histórico encontrado</h3>
            <p className="text-neutral-500 dark:text-neutral-400">Você ainda não realizou testes com nosso assistente.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sortedInterviews.map((record, index) => (
              <div 
                key={record.id} 
                className={`group p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col relative ${
                  sortBy === 'fit' && index === 0 
                  ? 'bg-gradient-to-br from-white to-blue-50/30 dark:from-neutral-800 dark:to-blue-900/10 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-500/5 ring-2 ring-blue-500/20 scale-[1.03] z-10' 
                  : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                }`}
                onClick={() => {
                  setSelectedInterview(record);
                  setIsEditingNotes(false);
                  setTempNotes(record.notes || "");
                  setTempRecruiterNotes(record.recruiterNotes || {});
                }}
              >
                {getRankingBadge(index)}
                
                {sortBy === 'fit' && index === 0 && (
                  <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Melhor Escolha
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="pr-4">
                    <h3 className="text-lg font-bold text-neutral-800 dark:text-white line-clamp-1">{record.candidateName}</h3>
                    <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      <Briefcase className="w-4 h-4 mr-1 text-blue-500 dark:text-blue-400" />
                      <span className="line-clamp-1">{record.roleTitle}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button 
                      onClick={(e) => handleDeleteInterview(e, record.id)}
                      className="text-neutral-400 hover:text-red-500 transition-colors p-1.5 -mr-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Excluir histórico"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      (record.analysis?.evaluation?.hireProbability || 0) > 75 
                        ? 'bg-green-100 text-green-700' 
                        : (record.analysis?.evaluation?.hireProbability || 0) > 50 
                          ? 'bg-yellow-100 text-yellow-700' 
                          : 'bg-red-100 text-red-700'
                    }`}>
                      {record.analysis?.evaluation?.hireProbability || 0}% FIT
                    </div>
                  </div>
                </div>

                {(record.notes || (record.recruiterNotes && Object.values(record.recruiterNotes).some(v => !!v))) && (
                  <div className="mb-4 mt-2 p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-1.5 mb-2">
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Anotações</span>
                    </div>
                    {record.recruiterNotes?.salaryExpectation && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mb-1">
                        <strong className="text-neutral-700 dark:text-neutral-300">Salário:</strong> {record.recruiterNotes.salaryExpectation}
                      </div>
                    )}
                    {record.recruiterNotes?.workArrangement && (
                      <div className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mb-1">
                        <strong className="text-neutral-700 dark:text-neutral-300">Regime:</strong> {record.recruiterNotes.workArrangement}
                      </div>
                    )}
                    {record.notes && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-500 line-clamp-2 italic mt-1.5">
                        "{record.notes}"
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-neutral-400 mt-auto pt-4 border-t border-neutral-100 dark:border-neutral-700">
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {record.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <span className="text-blue-500 font-medium text-[11px] group-hover:underline">Ver detalhes</span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* MODAL / DRAWER */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-700 flex items-center justify-between sticky top-0 bg-white dark:bg-neutral-800 z-10">
              <div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">{selectedInterview.candidateName}</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{selectedInterview.roleTitle}</p>
              </div>
              <button 
                onClick={() => setSelectedInterview(null)}
                className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto w-full flex-1 bg-neutral-50/50 dark:bg-neutral-900">
              <div className="grid md:grid-cols-3 gap-6">
                
                {/* Score Column */}
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm flex flex-col items-center justify-center text-center">
                  <h3 className="text-xs uppercase font-bold text-neutral-400 tracking-wider mb-4">Probabilidade de Contratação</h3>
                  
                  <div className="w-full h-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: "FIT Final", score: selectedInterview.analysis?.evaluation?.hireProbability || 0 }]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} width={30} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="score" radius={[6, 6, 6, 6]} barSize={40}>
                           <Cell fill={(selectedInterview.analysis?.evaluation?.hireProbability || 0) > 75 ? '#10B981' : (selectedInterview.analysis?.evaluation?.hireProbability || 0) > 50 ? '#F59E0B' : '#EF4444'} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <span className="text-3xl font-black mt-2" style={{
                    color: (selectedInterview.analysis?.evaluation?.hireProbability || 0) > 75 ? '#10B981' : (selectedInterview.analysis?.evaluation?.hireProbability || 0) > 50 ? '#F59E0B' : '#EF4444'
                  }}>
                    {selectedInterview.analysis?.evaluation?.hireProbability || 0}%
                  </span>
                </div>

                {/* Feedback Column */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                    <h4 className="text-xs uppercase font-bold text-blue-500 mb-2">Avaliação Técnica</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {selectedInterview.analysis?.evaluation?.technicalFeedback || "Não há dados."}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                    <h4 className="text-xs uppercase font-bold text-indigo-500 mb-2">FIT Comportamental</h4>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {selectedInterview.analysis?.evaluation?.behavioralFeedback || "Não há dados."}
                    </p>
                  </div>
                </div>

              </div>
              
              {/* Anotações do Recrutador */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h3 className="text-lg font-bold text-neutral-800 dark:text-white">Anotações do Recrutador</h3>
                  {!isEditingNotes && (
                    <button 
                      onClick={() => {
                        setTempNotes(selectedInterview.notes || "");
                        setTempRecruiterNotes(selectedInterview.recruiterNotes || {});
                        setIsEditingNotes(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {(selectedInterview.notes || (selectedInterview.recruiterNotes && Object.values(selectedInterview.recruiterNotes).some(v => !!v))) ? "Editar Notas" : "Adicionar Notas"}
                    </button>
                  )}
                </div>
                
                <div className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                  {isEditingNotes ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Pretensão Salarial</label>
                          <input 
                            type="text" 
                            className="w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            placeholder="Ex: R$ 5.000,00"
                            value={tempRecruiterNotes.salaryExpectation || ""}
                            onChange={(e) => setTempRecruiterNotes({...tempRecruiterNotes, salaryExpectation: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Regime de Trabalho</label>
                          <select 
                            className="w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            value={tempRecruiterNotes.workArrangement || ""}
                            onChange={(e) => setTempRecruiterNotes({...tempRecruiterNotes, workArrangement: e.target.value})}
                          >
                            <option value="">Selecione...</option>
                            <option value="Presencial">Presencial</option>
                            <option value="Remoto">Remoto</option>
                            <option value="Híbrido">Híbrido</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Pontos Fortes</label>
                          <textarea 
                            className="w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg p-2.5 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                            placeholder="Principais fortalezas..."
                            value={tempRecruiterNotes.strongPoints || ""}
                            onChange={(e) => setTempRecruiterNotes({...tempRecruiterNotes, strongPoints: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Pontos Fracos</label>
                          <textarea 
                            className="w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg p-2.5 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                            placeholder="Pontos de melhoria..."
                            value={tempRecruiterNotes.weakPoints || ""}
                            onChange={(e) => setTempRecruiterNotes({...tempRecruiterNotes, weakPoints: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Anotações Gerais</label>
                        <textarea 
                          className="w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white rounded-lg p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                          placeholder="Digite suas observações gerais sobre o candidato aqui..."
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2 mt-2">
                        <button 
                          onClick={() => setIsEditingNotes(false)}
                          disabled={isSavingNotes}
                          className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-lg transition disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={handleSaveNotes}
                          disabled={isSavingNotes}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSavingNotes ? "Salvando..." : "Salvar Notas"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {selectedInterview.recruiterNotes && (selectedInterview.recruiterNotes.salaryExpectation || selectedInterview.recruiterNotes.workArrangement) && (
                        <div className="flex flex-wrap gap-3 pb-4 border-b border-neutral-100 dark:border-neutral-700">
                          {selectedInterview.recruiterNotes.salaryExpectation && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-sm font-medium border border-green-200 dark:border-green-800">
                              <DollarSign className="w-4 h-4" />
                              {selectedInterview.recruiterNotes.salaryExpectation}
                            </div>
                          )}
                          {selectedInterview.recruiterNotes.workArrangement && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-800">
                              <MapPin className="w-4 h-4" />
                              {selectedInterview.recruiterNotes.workArrangement}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {selectedInterview.recruiterNotes && (selectedInterview.recruiterNotes.strongPoints || selectedInterview.recruiterNotes.weakPoints) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-700">
                          {selectedInterview.recruiterNotes.strongPoints && (
                            <div>
                              <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                                <ThumbsUp className="w-4 h-4 text-green-500" /> Pontos Fortes
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap pl-6">
                                {selectedInterview.recruiterNotes.strongPoints}
                              </p>
                            </div>
                          )}
                          {selectedInterview.recruiterNotes.weakPoints && (
                            <div>
                              <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
                                <ThumbsDown className="w-4 h-4 text-red-500" /> Pontos Fracos
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap pl-6">
                                {selectedInterview.recruiterNotes.weakPoints}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                        {selectedInterview.notes ? (
                          <>
                            <div className="font-bold text-xs uppercase tracking-wider text-neutral-500 mb-2">Anotações Gerais</div>
                            {selectedInterview.notes}
                          </>
                        ) : (
                          (!selectedInterview.recruiterNotes || (!selectedInterview.recruiterNotes.salaryExpectation && !selectedInterview.recruiterNotes.workArrangement && !selectedInterview.recruiterNotes.strongPoints && !selectedInterview.recruiterNotes.weakPoints)) && (
                            <span className="text-neutral-400 dark:text-neutral-500 italic">Nenhuma anotação registrada ainda.</span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4 px-2">Análise CV x Vaga (Pré-Entrevista)</h3>
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-2xl font-black text-blue-600">
                      {selectedInterview.analysis?.compatibility?.score || 0}%
                    </div>
                    <div className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">Aderência Inicial</div>
                  </div>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {selectedInterview.analysis?.compatibility?.judgment || "Sem julgamento inicial"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-4 px-2">Perguntas Geradas & Respostas Anotadas</h3>
                <div className="space-y-4">
                  {selectedInterview.questions?.map((q: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-neutral-800 p-5 rounded-xl border border-neutral-100 dark:border-neutral-700 shadow-sm">
                      <div className="font-medium text-neutral-800 dark:text-white text-sm mb-3">
                        <span className="text-blue-500 dark:text-blue-400 mr-2">Q{i+1}.</span>
                        {q.question}
                      </div>
                      <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-lg border border-neutral-100 dark:border-neutral-700 text-sm text-neutral-600 dark:text-neutral-400 italic border-l-2 border-l-blue-400">
                        {q.answer ? q.answer : "Nenhuma anotação registrada."}
                      </div>
                    </div>
                  ))}
                  {(!selectedInterview.questions || selectedInterview.questions.length === 0) && (
                    <div className="text-sm text-neutral-400 px-2">Nenhuma pergunta registrada.</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
    </ProtectedRoute>
  );
}
