export default function FeedbackStep({ feedback, onReset }: { feedback: string, onReset: () => void }) {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto p-8 bg-white dark:bg-neutral-800 shadow-xl rounded-2xl text-gray-800 dark:text-neutral-200 border border-gray-100 dark:border-neutral-700">
      <div className="flex items-center gap-3 border-b border-gray-100 dark:border-neutral-700 pb-4">
        <svg className="w-8 h-8 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h2 className="text-3xl font-extrabold text-green-700 dark:text-green-400 tracking-tight">Avaliação Concluída</h2>
      </div>
      
      <div className="bg-gray-50 dark:bg-neutral-900/50 p-6 rounded-xl whitespace-pre-wrap leading-relaxed border border-gray-200 dark:border-neutral-700 text-gray-800 dark:text-neutral-300 text-base shadow-inner min-h-[300px]">
        {feedback}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 font-bold py-3 px-8 rounded-xl hover:bg-gray-900 dark:hover:bg-white transition-all text-lg mt-4 shadow-md active:scale-[0.98]"
          onClick={onReset}
        >
          Iniciar Nova Avaliação
        </button>
      </div>
    </div>
  );
}
