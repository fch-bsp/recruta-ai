import LoginForm from "@/components/LoginForm";
import { BotMessageSquare } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Logo / Header */}
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
          <BotMessageSquare size={32} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Recruta.AI</h1>
        <p className="text-gray-500 text-center mb-8">
          Acesse a plataforma para iniciar suas simulações de entrevista.
        </p>

        {/* Formulário de Login */}
        <LoginForm />

        {/* Divider / Info adicional */}
        <div className="mt-8 pt-6 border-t border-gray-100 w-full text-center">
          <p className="text-sm text-gray-400">
            Protótipo de acesso. Use qualquer e-mail válido e senha com mais de 6 caracteres.
          </p>
        </div>
      </div>
    </main>
  );
}
