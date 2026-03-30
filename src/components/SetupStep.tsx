import { useState } from 'react';

export default function SetupStep({ onComplete }: { onComplete: (cv: string, jd: string) => void }) {
  const [cv, setCv] = useState('');
  const [jd, setJd] = useState('');

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto p-8 bg-white dark:bg-neutral-800 shadow-xl rounded-2xl text-gray-800 dark:text-neutral-200 border border-gray-100 dark:border-neutral-700">
      <h2 className="text-3xl font-extrabold text-blue-900 dark:text-blue-400 tracking-tight">Configuração da Entrevista</h2>
      <p className="text-gray-600 dark:text-neutral-400 text-sm">Insira seus dados abaixo para que a IA possa personalizar as perguntas com base no seu perfil e na vaga pretendida.</p>
      
      <div className="flex flex-col gap-2 mt-4">
        <label className="font-semibold text-gray-800 dark:text-neutral-300 text-sm uppercase tracking-wide">
          Seu Currículo (Texto Aberto)
        </label>
        <textarea 
          value={cv} 
          onChange={(e) => setCv(e.target.value)} 
          className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-neutral-500 resize-none font-sans"
          placeholder="Ex: Sou desenvolvedor Pleno com 4 anos de experiência em React, Node.js e Tailwind..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-gray-800 dark:text-neutral-300 text-sm uppercase tracking-wide">
          Descrição da Vaga
        </label>
        <textarea 
          value={jd} 
          onChange={(e) => setJd(e.target.value)} 
          className="bg-white dark:bg-neutral-900 text-black dark:text-white border border-gray-300 dark:border-neutral-700 rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-neutral-500 resize-none font-sans"
          placeholder="Ex: Estamos buscando um Engenheiro de Software Sênior com foco em Frontend e arquitetura SSR..."
        />
      </div>

      <button 
        className="bg-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all text-lg mt-4 shadow-md active:scale-[0.98]"
        onClick={() => onComplete(cv, jd)}
        disabled={!cv.trim() || !jd.trim()}
      >
        Iniciar Entrevista e Analisar Perfil
      </button>
    </div>
  );
}
