

Dica para amanhã: Quando voltarmos a trabalhar, você pode simplesmente me dizer "Vamos rever a documentação e continuar de onde paramos".

Tenha uma ótima conversa com seu sócio sobre o plano Blaze e um excelente descanso! Até amanhã! 🚀🌟


# Plano de Migração para Produção (AI Interviewer)

**STATUS ATUAL:** 
- `[x]` Fase 1 (Setup Firebase e Infra) **CONCLUÍDA**
- `[x]` Fase 2 (Migração de Uploads para Storage) **CONCLUÍDA**
- `[x]` Fase 3, Etapas 1-3 (Auth, Rotas Protegidas e Gravação no Firestore) **CONCLUÍDAS**
- `[ ]` **PRÓXIMO PASSO (Amanhã):** Fase 3, Etapa 4 (Página de Histórico/Dashboard e Detalhamento da Entrevista salva).

Este documento descreve a arquitetura e os passos necessários para migrar o sistema AI Interviewer de um ambiente de desenvolvimento (Mock/Memória) para um ambiente de Produção, utilizando o ecossistema Serverless do **Firebase**.

## Arquitetura de Produção

A aplicação passará a possuir estado persistente. Os dados não residirão mais localmente em estado de componentes ou temporários, e os arquivos não ficarão apenas transitando em memória durante a requisição.

### Tecnologias Alvo

1. **Autenticação:** Firebase Authentication (substituindo o cookie estático/mock atual).
2. **Banco de Dados:** Cloud Firestore (NoSQL).
3. **Armazenamento de Arquivos:** Firebase Storage.
4. **Hospedagem:** Firebase App Hosting (nova solução nativa e otimizada do Firebase para Next.js, com suporte a SSR).

### Separação de Ambientes (Dev vs Prod)

Para garantirmos estabilidade e segurança, a aplicação utilizará a seguinte estratégia de desenvolvimento e deploy:

1. **Ambiente Dev (Local):** Rodaremos a aplicação localmente (`npm run dev`) para criar novas features ou corrigir bugs. Desenvolvimentos e validações serão feitos sempre em "Dev" primeiro (que não afeta os dados de produção).
2. **Ambiente Prod (Firebase):** Após a validação local, subiremos o código novo para produção via deploy. O projeto final de Produção no Firebase precisa obrigatoriamente estar no **Plano Blaze** (para ter suporte automático ao Cloud Run, Functions e Secret Manager exigidos pelo Firebase App Hosting).

---

## Estrutura de Integração

### 1. Firebase Storage (Arquivos PDF/Word)

O Firebase Storage será responsável por armazenar de forma segura os dados sensíveis dos candidatos e as descrições de vagas institucionais.

**Fluxo de Arquivo:**
- O Recrutador faz upload do PDF/Docx no frontend.
- O Frontend faz upload direto para o Firebase Storage usando o SDK do cliente (economizando banda do servidor Next.js).
- O Storage retorna uma URL / Path seguro do arquivo.
- O Frontend envia esse Path para a API de extração (`/api/extract-text`).
- A API baixa o arquivo do Storage, extrai o texto e deleta o arquivo temporário da memória.
- *Observação:* Podem ser criadas regras (Firebase Security Rules) para que o arquivo fique acessível apenas ao recrutador logado que fez o upload.

**Estrutura de Pastas (Storage):**
```text
/interviews
  /{recruiter_uuid}
    /{interview_uuid}
      - cv_candidato.pdf
      - vaga_descricao.pdf
```

### 2. Cloud Firestore (Persistência de Dados)

O Firestore será responsável por manter o histórico de entrevistas, o que permite aos recrutadores iniciarem a avaliação de um candidato, salvarem o rascunho e concluírem a correção e aprovação da IA em outro momento.

**Coleções e Documentos:**

**Coleção: `users`**
- `id` (UID do Firebase Auth)
- `email` (string)
- `name` (string)
- `role` (string - ex: "recruiter")
- `createdAt` (timestamp)

**Coleção: `interviews`**
- `id` (auto-gerado)
- `recruiterId` (referência para users/ID)
- `candidateName` (string, opcional extraído do CV)
- `positionTitle` (string, opcional extraído do JD)
- `status` (string: "SETUP" | "NOTES" | "COMPLETED")
- `cvStoragePath` (string - caminho do CV no Storage)
- `jdStoragePath` (string - caminho do JD no Storage)
- `cvText` (texto completo extraído)
- `jdText` (texto completo extraído)
- `compatibilityScore` (number)
- `compatibilityJudgment` (string)
- `questions` (Array de strings geradas pela IA)
- `answers` (Array de strings com as anotações do recrutador)
- `finalEvaluation` (Objeto: `{ hireProbability, technicalFeedback, behavioralFeedback }`)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

---

## Fases de Implementação

A migração deve ocorrer em três fases principais para garantir a estabilidade do sistema.

### Fase 1: Setup da Infraestrutura (CONCLUÍDA ✅)
- [x] 1. Criar projeto no [Firebase Console](https://console.firebase.google.com/).
- [x] 2. Habilitar os serviços: Authentication, Firestore Database, e Cloud Storage.
- [x] 3. Gerar chaves de configuração (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.) e Service Accounts (se necessário para a API backend).
- [x] 4. Adicionar as variáveis ao `.env.local` e configurar os *secrets* e credenciais no Firebase Secret Manager.
- [x] 5. Criar arquivo `src/lib/firebase/client.ts` para conectar o frontend ao Firebase.

### Fase 2: Storage & Refatoração da Extração (CONCLUÍDA ✅)
- [x] 1. Alterar `RecruiterInterview.tsx` para fazer o upload do `cvFile` e `jdFile` para o Firebase Storage.
- [x] 2. Atualizar o endpoint `/api/extract-text` para, em vez de receber o FormData pesado com arquivos, receber opcionalmente os "Storage Paths" ou URLs assinadas.
- [x] 3. Testar extração de texto lendo arquivos a partir do Storage.

### Fase 3: Firestore, Autenticação & Estado da Aplicação (EM ANDAMENTO 🚀)
- [x] 1. Configurar Autenticação e Rotas Protegidas (`/login`, `/app`).
- [x] 2. Criar métodos em `src/lib/firebase/firestore.ts` (ex: `createInterview`, `updateInterview`, `getInterviewsByRecruiter`).
- [x] 3. Remover o estado puramente local (`useState`) de longo prazo do `RecruiterInterview.tsx` e salvar as entrevistas finalizadas (`updateInterview`) com sucesso no Firestore (Regras de segurança corrigidas).
- [x] 4. Criar página de Histórico para listar as entrevistas lidas do Firestore, com opção de Excluir e pré-visualização de Notas.
- [ ] 5. **\[PARA FAZER\]** Adicionar um modal/tela de visualização completa com os Detalhes da Avaliação da submissão antiga.

### Fase 4: Setup de Produção / Plano Blaze (AGUARDANDO UPGRADE)
- [ ] 1. Fazer upgrade do projeto (ou criar o projeto de Prod definitivo) para o **Plano Blaze** no [console do Firebase](https://console.firebase.google.com/).
- [ ] 2. Habilitar o Firebase App Hosting e vincular ao repositório do GitHub (seção App Hosting no Console).
- [ ] 3. Configurar a chave da OpenAI (`OPENAI_API_KEY`) utilizando o **Secret Manager** do Firebase.
- [ ] 4. Atualizar o script de deploy ou validar integração Contínua (CI/CD) gerada pelo Firebase App Hosting.
- [ ] 5. Testar e homologar a primeira publicação rodando com a API Real online sem "mock".

---

## Considerações de Segurança (Regras do Firebase)

**Regras do Firestore:**
Somente usuários autenticados podem criar documentos.
Usuários só podem ler e escrever seus próprios documentos (onde `recruiterId == request.auth.uid`).

**Regras do Storage:**
Somente usuários autenticados podem fazer uploads. Tamanho máximo do arquivo limitado (ex: 5MB). Arquivos só podem ser lidos pelo dono do diretório `request.auth.uid`.

## Próximos Passos
Se aprovado, recomendo iniciarmos pela **Fase 1** instanciando a biblioteca `firebase` no package manager e criando as credenciais do projeto.
