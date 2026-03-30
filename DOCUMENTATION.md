# Documentação do AI Interviewer

Bem-vindo à documentação oficial do **AI Interviewer**. Este projeto foi desenvolvido para automatizar e otimizar o processo de triagem inicial de candidatos através de entrevistas simuladas por IA.

## 🚀 Funcionalidades e Usabilidade

O AI Interviewer oferece um fluxo intuitivo para recrutadores e candidatos:

1.  **Configuração da Vaga**: O usuário inicia fornecendo o PDF do currículo do candidato e a descrição da vaga.
2.  **Preparação da IA**: O sistema processa os documentos para entender o perfil do candidato em relação aos requisitos da vaga.
3.  **Entrevista em Tempo Real**:
    *   A IA atua como um recrutador experiente, fazendo perguntas técnicas e comportamentais pertinentes.
    *   O candidato responde via chat, simulando uma interação real.
    *   A entrevista é dinâmica e adaptativa com base nas respostas fornecidas.
4.  **Feedback Instantâneo**: Ao final, o sistema gera um relatório detalhado avaliando os pontos fortes, áreas de melhoria e uma conclusão sobre a adequação do candidato para a vaga.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza uma stack moderna e robusta para garantir performance e escalabilidade:

| Tecnologia | Finalidade |
| :--- | :--- |
| **Next.js 16 (App Router)** | Framework principal para renderização híbrida (SSR/CSR) e rotas de API. |
| **React 19** | Biblioteca para construção de interfaces reativas e baseadas em componentes. |
| **OpenAI API (GPT-4o)** | "Cérebro" do sistema, responsável pela geração de perguntas e análise de respostas. |
| **Tailwind CSS 4** | Estilização moderna, responsiva e de alta performance. |
| **Lucide React** | Conjunto de ícones vetoriais leves para melhorar a interface. |
| **pdf-parse / mammoth** | Extração de texto de currículos em formato PDF e DOCX. |
| **TypeScript** | Garante segurança de tipos e melhor manutenção do código. |
| **Zod** | Validação de esquemas e dados de entrada. |

## 🏗️ Arquitetura do Sistema

O projeto segue os padrões modernos do Next.js:

*   **/src/app**: Contém as rotas e a interface principal.
*   **/src/components**: Componentes modulares como `RecruiterInterview`, `SetupStep`, e `FeedbackStep`.
*   **/src/app/api**: Endpoints para extração de texto e comunicação segura com a OpenAI.

## 📈 Benefícios

*   **Economia de Tempo**: Triagem automática antes do primeiro contato humano.
*   **Imparcialidade**: Avaliação baseada puramente nas competências extraídas e demonstradas.
*   **Experiência do Candidato**: Interface amigável e interativa.

---
*Documentação gerada pelo AI Assistant.*
