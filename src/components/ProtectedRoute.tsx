"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldX, LogOut } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, approved, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-neutral-500 dark:text-neutral-400">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!approved) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 dark:bg-neutral-900 p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-neutral-800 p-10 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldX size={32} />
          </div>
          <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">Acesso Pendente</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            Sua conta foi registrada com sucesso! Agora é só aguardar — o time da <span className="font-semibold text-indigo-600 dark:text-indigo-400">Recruta.AI</span> está analisando seu cadastro e em breve vai liberar seu acesso.
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-8">
            Você receberá acesso assim que um administrador aprovar sua conta. Tente novamente em alguns minutos.
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-900 rounded-xl p-4 mb-6 border border-neutral-100 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Logado como: <span className="font-semibold">{user.email}</span>
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 mx-auto px-6 py-2.5 text-sm font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-700 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-600 transition"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
