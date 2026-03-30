import { useState, useRef, useEffect } from 'react';

export default function InterviewStep({ 
  questions, 
  onFinish 
}: { 
  questions: string[], 
  onFinish: (answers: string[]) => void 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [allAnswers, setAllAnswers] = useState<string[]>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Foca na textarea sempre que a pergunta muda
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [currentIndex]);

  const handleNext = () => {
    const newAnswers = [...allAnswers, currentAnswer.trim()];
    if (currentIndex < questions.length - 1) {
      setAllAnswers(newAnswers);
      setCurrentAnswer('');
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish(newAnswers);
    }
  };

  const progressPercentage = ((currentIndex) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto p-8 bg-white dark:bg-neutral-800 shadow-xl rounded-2xl text-gray-800 dark:text-neutral-200 border border-gray-100 dark:border-neutral-700">
      
      {/* Barra de Progresso */}
      <div className="w-full bg-gray-200 dark:bg-neutral-700 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
          style={{ width: `${progressPercentage}%` }}>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">
          Pergunta {currentIndex + 1} de {questions.length}
        </span>
        <h2 className="text-2xl font-bold leading-snug text-gray-900 dark:text-white border-l-4 border-blue-500 pl-4 py-1">
          {questions[currentIndex]}
        </h2>
      </div>

      <textarea 
        ref={textAreaRef}
        value={currentAnswer} 
        onChange={(e) => setCurrentAnswer(e.target.value)} 
        className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-4 h-56 text-black dark:text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-neutral-500 resize-none shadow-inner"
        placeholder="Escreva sua resposta detalhada aqui..."
      />

      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-neutral-700">
        <button 
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all text-lg shadow-md active:scale-[0.98]"
          onClick={handleNext}
          disabled={currentAnswer.trim().length < 10}
        >
          {currentIndex < questions.length - 1 ? 'Enviar e Ir para Próxima' : 'Concluir e Encaminhar Avaliação'}
        </button>
      </div>
    </div>
  );
}
