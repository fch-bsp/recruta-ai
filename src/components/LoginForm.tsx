"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Mail, Lock, Loader2, LogIn } from "lucide-react";

// Schema de validação
const loginSchema = z.object({
  email: z.string().email("Endereço de e-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Valida os dados
      loginSchema.parse(formData);

      // Simula o login (delay de 1.5s)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Define cookie de autenticação temporário para redirecionamento no middleware
      document.cookie = "auth-token=mock-token-123; path=/; max-age=86400";

      // Redireciona para a página principal
      router.push("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<LoginFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpa o erro ao digitar
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ${
              errors.email 
                ? "border-red-500 focus:ring-red-200 dark:border-red-500/50 dark:focus:ring-red-900/50" 
                : "border-gray-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900/30"
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.email && <p className="text-sm text-red-500 pl-1">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="password"
            name="password"
            placeholder="Senha"
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-colors bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ${
              errors.password 
                ? "border-red-500 focus:ring-red-200 dark:border-red-500/50 dark:focus:ring-red-900/50" 
                : "border-gray-200 dark:border-neutral-700 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-900/30"
            }`}
            disabled={isLoading}
          />
        </div>
        {errors.password && <p className="text-sm text-red-500 pl-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Entrando...
          </>
        ) : (
          <>
            Entrar
            <LogIn className="h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
