# Documentação dos Workflows do Antigravity

Este arquivo explica a funcionalidade de cada arquivo `.md` encontrado no diretório `.agent/workflows`. Estes arquivos agem como comandos essenciais ("slash commands" - iniciados por `/`) para orquestrar diversas etapas do desenvolvimento.

Abaixo está o resumo do propósito e operação de cada comando na ferramenta, com exemplos de como invocá-los:

### 1. `/brainstorm` (`brainstorm.md`)
**Propósito:** Explorar e estruturar ideias antes da implementação.
*   **Como funciona:** Ele foca na compreensão do problema e geração de soluções sem escrever nenhum código de modo preliminar.
*   **Ação:** Apresenta pelo menos 3 opções diferentes de solução, destacando prós, contras e esforço necessário para cada uma delas, junto com uma recomendação final. Ele deixa a decisão final com você.
*   **Exemplos de Uso:**
    *   `/brainstorm sistema de autenticação`
    *   `/brainstorm como gerenciar o estado em um formulário complexo`
    *   `/brainstorm esquema de banco de dados para um app social`

### 2. `/create` (`create.md`)
**Propósito:** Iniciar o processo de criação de uma nova aplicação do zero.
*   **Como funciona:** Ele dispara a habilidade `app-builder` começando com um diálogo para entender a solicitação. Em seguida usa o agente orientador para criar o planejamento da estrutura, define as tecnologias e finalmente executa a construção do aplicativo através de colaboração entre diversos sub-agentes especialistas (UX/UI, Banco de Dados, Backend).
*   **Exemplos de Uso:**
    *   `/create site de blog`
    *   `/create aplicativo de e-commerce com listagem de produtos e carrinho`
    *   `/create sistema de crm com gerenciamento de clientes`

### 3. `/debug` (`debug.md`)
**Propósito:** Investigação sistemática de problemas e correção de erros ou comportamentos indesejados (Modo DEBUG).
*   **Como funciona:** Este workflow foca na eliminação de causas raiz através de análise metódica. Ele coleta a mensagem de erro ou problema relatado, formula hipóteses da origem da falha ordenadas por probabilidade, testa tais hipóteses de forma racional para então efetivar as correções acompanhadas de medidas preventivas.
*   **Exemplos de Uso:**
    *   `/debug formulário de login não está funcionando`
    *   `/debug a rota de API está retornando erro 500`
    *   `/debug componente x parou de renderizar na página principal`

### 4. `/deploy` (`deploy.md`)
**Propósito:** Efetuar a publicação do projeto para o ambiente de produção.
*   **Como funciona:** Possui um rigoroso *checklist* de tarefas de qualidade do código antes da implementação final (Checagem de lint, compilação Typescript, testes unitários, análise de segurança e verificação de bundle). Conduz passo-a-passo todo o deployment até a validação com a health check final (Preview ou Produção), dando também opções rápidas para realizar rollback da aplicação.
*   **Exemplos de Uso:**
    *   `/deploy` (inicia o passo-a-passo interativo para deploy)
    *   `/deploy check` (roda apenas as validações pré-deploy)
    *   `/deploy preview` (publica uma versão de preview/staging)
    *   `/deploy rollback` (faz downgrade para versão anterior)

### 5. `/enhance` (`enhance.md`)
**Propósito:** Adicionar de forma iterativa novos recursos e funcionalidades em um projeto já existente.
*   **Como funciona:** Ele entende o estado atual e mapeia onde será necessário tocar no projeto (quais arquivos). Depois ele produz um sumário informando quantas mudanças pretendem ser feitas e, uma vez aprovado, envolve agentes dedicados para implementar as melhorias garantindo a continuidade da base existente.
*   **Exemplos de Uso:**
    *   `/enhance adicionar um botão de dark mode`
    *   `/enhance criar um novo painel de controle administrativo`
    *   `/enhance integrar API do Stripe para cobranças de assinaturas`

### 6. `/orchestrate` (`orchestrate.md`)
**Propósito:** Coordenação especializada e complexa entre múltiplos agentes orientados para grandes objetivos ou análises.
*   **Como funciona:** Este é o coração multiprocessado dos fluxos. Ele dita as regras de como subagentes em paralelo colaborarão (requer o uso de no mínimo 3 agentes especializados para ocorrer). Funciona sob estritos processos em 2 Fases principais: **Planejamento Sequencial** (só pode ser continuado depois da aceitação do humano) e a **Implementação Paralela** baseada na planta gerada inicialmente e finalizada com a etapa obrigatória da segurança (Vulnerabilidade) das soluções construídas.
*   **Exemplos de Uso:**
    *   `/orchestrate analisar gargalos e otimizar toda arquitetura do projeto atual`
    *   `/orchestrate construir serviço de mensageria chamando especialistas`

### 7. `/plan` (`plan.md`)
**Propósito:** Criação pura de plano e especificação.
*   **Como funciona:** Usa o processo interativo-socrático onde perguntas investigativas devem guiar a base do documento. O agente gera apenas instruções de arquitetura que são salvas, por padrão, em `docs/PLAN-{slug}.md`. Este comando é categoricamente restrito de escrever qualquer código final; seu escopo acaba após o planejamento ser concluído em markdown para aprovação.
*   **Exemplos de Uso:**
    *   `/plan site completo para corretor de imóveis`
    *   `/plan documentar regras de negócio e estrutura banco de dados do SAAS`

### 8. `/preview` (`preview.md`)
**Propósito:** Gerenciamento do servidor de desenvolvimento e visualização das aplicações de forma local.
*   **Como funciona:** Provê atalhos interativos (via scripts em python, ex: `auto_preview.py`) para start, restart, check e stop do servidor da aplicação local, facilitando a tratativa simples para lidar com portas conflitantes ou para visualizar onde o servidor do front-end está rodando.
*   **Exemplos de Uso:**
    *   `/preview start` (inicia a execução de testes no localhost)
    *   `/preview stop`
    *   `/preview status` (ou simplesmente apenas `/preview`)

### 9. `/status` (`status.md`)
**Propósito:** Dashboard textual completo do andamento dos projetos com as métricas e situação da esteira.
*   **Como funciona:** Acessa scripts que verificam informações ativas da stack tecnológica da aplicação (qual frontend e DB) e fornece o status interativo de desenvolvimento – relata quantos agentes terminaram o trabalho, o que ainda pendente, quantidade de arquivos processados, estado do Servidor, URLs etc.
*   **Exemplos de Uso:**
    *   `/status` (este é um comando autoexplicativo que deve rodar isoladamente)

### 10. `/test` (`test.md`)
**Propósito:** Geração, planejamento e execução da esteira de testes do projeto.
*   **Como funciona:** Ele avalia classes e métodos, encontra edge cases propícios à dependência externa ou erros de design das funções para prover um "plano de testes adequado". Após aprovação e visualização, o comando integra a geração concreta de mock e os assertions correspondendo (com frameworks do repo local), acompanhados também por rotinas de sub-comando que informam e corrigem *coverage* de code smells do código.
*   **Exemplos de Uso:**
    *   `/test` (executa de forma inteira a stack `npm test`)
    *   `/test src/services/auth.service.ts` (elabora/executa um plano de testes para este arquivo específico)
    *   `/test coverage` (exibe tabela final de cobertura da aplicação toda)
    *   `/test fix failed tests` (lê os failures e resolve o problema das implementações do teste atual)

### 11. `/ui-ux-pro-max` (`ui-ux-pro-max.md`)
**Propósito:** Pesquisa de inteligência de Design que suporta automação de consistência estrutural avançada.
*   **Como funciona:** Funciona como um framework de heurísticas via scripts que pesquisam modos ideais sobre uma matriz de domínios (estilo, tipografia, cores, boas práticas de contraste e componentes responsivos). Ele gera um manual unificado de *Design System* via `--design-system` e arquiva as especificações de uso dentro do sistema para os agentes de frontend, garantindo aplicações profissionais sem visual genérico ou problemas de usabilidade.
*   **Exemplos de Uso:**
    *   `/ui-ux-pro-max app fintech clean dashboard`
    *   `/ui-ux-pro-max gerar landing page bonita e profissional estilo minimalista com dark mode`

---

*Lembre-se: O acionamento de qualquer um destes workflows pode ser inferido pelo kit Antigravity via agente `orchestrator` ou através de invocação expressa do comando no terminal do chat (exemplo: digitando `/debug [problema]`).*
