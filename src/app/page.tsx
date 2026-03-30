"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Brain, Upload, BarChart3, Users, Shield, Zap, ChevronRight } from "lucide-react";

export default function LandingPage() {
  const { user, approved, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && approved) {
      router.push("/app");
    }
  }, [user, approved, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-indigo-950/20 dark:via-neutral-950 dark:to-blue-950/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-200/30 dark:bg-indigo-800/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-200/20 dark:bg-blue-800/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold mb-8 tracking-wide">
            <Brain className="w-3.5 h-3.5" /> POWERED BY GPT-4o
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600">Recruta.AI</span>
          </h1>

          <p className="text-xl md:text-2xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-4 leading-relaxed">
            Recrutamento inteligente com análise de currículos, entrevistas guiadas por IA e ranking automático de candidatos.
          </p>

          <p className="text-sm text-neutral-400 dark:text-neutral-500 max-w-lg mx-auto mb-10">
            Suba a vaga e os currículos — a IA analisa compatibilidade, gera perguntas técnicas personalizadas e entrega o veredito final.
          </p>

          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" fillOpacity=".8"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" fillOpacity=".6"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" fillOpacity=".7"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" fillOpacity=".9"/></svg>
            Começar Agora
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold mb-3">Como a IA transforma seu recrutamento</h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">Automatize a triagem, padronize entrevistas e tome decisões baseadas em dados.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Upload className="w-6 h-6" />}
            color="blue"
            title="Upload em Massa"
            description="Suba múltiplos currículos de uma vez. Suporte a PDF e DOCX com extração automática de texto."
          />
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            color="indigo"
            title="Análise por IA"
            description="GPT-4o avalia a compatibilidade entre cada currículo e a vaga, gerando um score de aderência."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            color="violet"
            title="Ranking & Dashboard"
            description="Visualize o Top 5 candidatos, métricas de FIT e probabilidade de contratação em tempo real."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            color="amber"
            title="Perguntas Personalizadas"
            description="A IA gera perguntas técnicas específicas cruzando o currículo com os requisitos da vaga."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            color="emerald"
            title="Múltiplos Candidatos"
            description="Gerencie vários candidatos por processo com cards individuais, status e notas do recrutador."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            color="rose"
            title="Acesso Controlado"
            description="Autenticação via Google com aprovação manual. Seus dados protegidos no Firebase."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-neutral-50 dark:bg-neutral-900 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold mb-3">Como funciona</h2>
            <p className="text-neutral-500 dark:text-neutral-400">3 passos para um processo seletivo mais inteligente</p>
          </div>

          <div className="space-y-8">
            <Step number="1" title="Suba a vaga e os currículos" description="Faça upload da descrição da vaga e de todos os currículos dos candidatos de uma só vez." />
            <Step number="2" title="A IA analisa e gera perguntas" description="Cada candidato recebe um score de compatibilidade e perguntas técnicas personalizadas para a entrevista." />
            <Step number="3" title="Entreviste e receba o veredito" description="Anote as respostas durante a entrevista. A IA cruza tudo e entrega a probabilidade de contratação." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Pronto para recrutar com inteligência?</h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-lg mx-auto">
          Comece agora mesmo. Basta fazer login com sua conta Google e subir os currículos.
        </p>
        <button
          onClick={signInWithGoogle}
          className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Entrar com Google
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>
    </main>
  );
}

function FeatureCard({ icon, color, title, description }: { icon: React.ReactNode; color: string; title: string; description: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  };
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-md transition">
      <div className={`${colors[color]} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-5 items-start">
      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">{number}</div>
      <div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
