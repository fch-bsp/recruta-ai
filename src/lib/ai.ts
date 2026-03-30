"use server";

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type CompatibilityResult = {
  score: number;
  judgment: string;
};

export async function analyzeCompatibility(cvText: string, jdText: string): Promise<CompatibilityResult> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Você é um Assistente de Recrutamento Sênior. Sua tarefa é analisar a compatibilidade entre o Currículo do Candidato e a Descrição da Vaga.
Avalie estritamente com base nos requisitos da vaga e nas experiências/habilidades listadas no currículo.

Retorne SOMENTE um JSON válido com a seguinte estrutura e nada mais:
{
  "score": <número de 0 a 100 indicando o grau de compatibilidade>,
  "judgment": "<um parágrafo curto justificando o score baseando-se nos pontos fortes e gaps encontrados>"
}`
      },
      {
        role: "user",
        content: `--- VAGA ---\n${jdText}\n\n--- CURRÍCULO ---\n${cvText}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  const rawJson = completion.choices[0].message.content || "{}";
  return JSON.parse(rawJson) as CompatibilityResult;
}

export type QuestionList = {
  questions: string[];
};

export async function generateTechnicalQuestions(cvText: string, jdText: string): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Você é um Entrevistador Técnico e Recrutador Sênior. Baseado no Currículo do candidato e nos requisitos da Vaga, crie exatamente 3 perguntas técnicas (ou técnico-comportamentais) direcionadas para testar a experiência real e aderência do candidato.
As perguntas devem focar em onde o candidato diz ter experiência e cruzar isso com a necessidade da vaga. Não faça perguntas genéricas, seja muito específico.

Retorne SOMENTE um JSON com esta estrutura:
{
  "questions": [
    "...", "...", "..."
  ]
}`
      },
      {
        role: "user",
        content: `--- VAGA ---\n${jdText}\n\n--- CURRÍCULO ---\n${cvText}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.5
  });

  const rawJson = completion.choices[0].message.content || "{}";
  const parsed = JSON.parse(rawJson) as QuestionList;
  return parsed.questions || [];
}

export type EvaluationResult = {
  hireProbability: number;
  behavioralFeedback: string;
  technicalFeedback: string;
};

export async function evaluateCandidateAnswers(
  cvText: string,
  jdText: string,
  qaList: { question: string; answer: string }[],
  recruiterNotes?: string
): Promise<EvaluationResult> {
  const notesBlock = recruiterNotes?.trim()
    ? `\n\n--- ANOTAÇÕES LIVRES DO RECRUTADOR ---\n${recruiterNotes}`
    : "";

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Você é um Head de Engenharia tomando uma decisão de contratação.
Você receberá a Vaga, o Currículo do Candidato, as anotações feitas pelo recrutador sobre como o candidato respondeu às 3 perguntas da entrevista, e opcionalmente anotações livres do recrutador com impressões gerais.

Considere TODAS as informações disponíveis, incluindo as anotações livres do recrutador (observações comportamentais, red flags, pontos de destaque) como parte importante da sua avaliação técnica e comportamental.

Dê o seu veredito analítico, e preveja a "Probabilidade de Sucesso na Contratação" (0 a 100).

Retorne APENAS um JSON no formato:
{
  "hireProbability": <número de 0 a 100>,
  "behavioralFeedback": "<avaliação do perfil comportamental, maturidade e fit cultural baseada nas notas da entrevista e anotações do recrutador>",
  "technicalFeedback": "<avaliação da capacidade técnica baseada nas anotações das perguntas técnicas e observações do recrutador>"
}`
      },
      {
        role: "user",
        content: `--- VAGA ---\n${jdText}\n\n--- CURRÍCULO ---\n${cvText}\n\n--- PERGUNTAS E ANOTAÇÕES DA ENTREVISTA ---\n${JSON.stringify(qaList, null, 2)}${notesBlock}`
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  const rawJson = completion.choices[0].message.content || "{}";
  return JSON.parse(rawJson) as EvaluationResult;
}
