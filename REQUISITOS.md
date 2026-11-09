# Documento de Requisitos de Software — MST Web

**Projeto:** MST — Memória, Saúde e Tecnologia  
**Módulo:** Front-end Web SPA (`swe-mst-web`)  
**Tecnologias:** React 18, Vite, React Router DOM 6, Jest, React Testing Library  
**Data:** 09/11/2026  
**Versão:** 1.0  

---

## 1. Visão Geral do Sistema

O **MST Web** é uma aplicação web interativa (SPA) voltada ao estímulo cognitivo, saúde mental e lazer de usuários por meio de jogos educativos e de raciocínio. A aplicação foi migrada de uma arquitetura estática (HTML/CSS/JS puros) para uma estrutura moderna e componentizada com **React + Vite**, preservando integralmente a identidade visual original e estabelecendo integração resiliente com a API RESTful de sessões de jogos.

---

## 2. Requisitos Funcionais (RF)

Os requisitos funcionais descrevem os comportamentos, fluxos de uso e funcionalidades implementadas no sistema.

| Identificador | Título | Descrição |
| :--- | :--- | :--- |
| **RF01** | **Navegação Inicial e Apresentação** | O sistema deve exibir na página inicial (`/`) o logotipo do MST, cabeçalho padrão, rodapé de direitos autorais e o botão de acesso rápido "Jogos", direcionando o usuário ao catálogo. |
| **RF02** | **Catálogo de Jogos** | O sistema deve disponibilizar na rota `/jogos` a lista dos jogos organizados em grade: **Jogo da Memória**, **Jogo da Velha**, **Quiz**, **Sudoku** e **Jogo da Forca**. Os jogos ativos devem permitir início imediato; jogos ainda não migrados devem indicar visualmente estado informativo/desabilitado. |
| **RF03** | **Seleção de Modo do Jogo da Velha** | Na rota `/jogos/velha`, o sistema deve permitir ao usuário escolher entre o modo **Dois Jogadores (1 vs 1 local)** e **Contra o Computador (1 vs PC)** por meio de botões gráficos dedicados. |
| **RF04** | **Partida do Jogo da Velha (1 vs 1)** | O sistema deve exibir um tabuleiro 3x3 na rota `/jogos/velha/local`, alternando turnos entre 'X' e 'O', identificando automaticamente vitórias (linhas, colunas ou diagonais) ou empates (velha), e possibilitando reiniciar a partida via botão "Jogar de novo". |
| **RF05** | **Partida do Jogo da Velha (Contra o Computador)** | Na rota `/jogos/velha/cpu`, o usuário joga com o símbolo 'X' e o computador responde como 'O' selecionando aleatoriamente uma casa vazia após breve intervalo (delay simulando raciocínio humano). |
| **RF06** | **Inicialização do Quiz** | Na rota `/jogos/quiz`, o sistema deve apresentar uma tela de introdução com botão "Começar Quiz!" antes de exibir a primeira pergunta. |
| **RF07** | **Ciclo e Avaliação de Questões do Quiz** | A cada pergunta exibida, o sistema deve apresentar 4 alternativas. Ao selecionar uma opção, o sistema deve fornecer feedback visual instantâneo (verde para acerto, vermelho para erro), desabilitar as demais alternativas e exibir o botão "Próxima pergunta". |
| **RF08** | **Desempenho e Resultado do Quiz** | Ao concluir todas as questões, o sistema deve calcular o percentual de acerto, exibir mensagem personalizada de desempenho ("Excelente :)", "Muito bom :)", "Bom" ou "Pode melhorar :(") e fornecer botão "Refazer teste". |
| **RF09** | **Configuração de Partida de Sudoku** | Na rota `/jogos/sudoku`, o usuário deve poder selecionar o nível de dificuldade (**Fácil**, **Médio** ou **Difícil**) e o tempo limite de partida (**03:00**, **05:00** ou **10:00**) antes de iniciar. |
| **RF10** | **Grade Interativa do Sudoku** | O sistema deve renderizar o tabuleiro de Sudoku composto por 9 blocos 3x3 (totalizando 81 células). Células pré-definidas (máscara) devem ser somente leitura e diferenciadas visualmente. Células vazias devem aceitar apenas dígitos de 1 a 9. |
| **RF11** | **Validação e Sistema de Vidas do Sudoku** | O jogador inicia com 5 chances. Caso insira um dígito incorreto em relação ao gabarito, o sistema deve emitir aviso, deduzir 1 chance e limpar a célula. Ao atingir 0 chances ou esgotar o tempo, a partida encerra-se como derrota ("você perdeu!"). Ao completar corretamente todas as casas, o sistema declara vitória. |
| **RF12** | **Ações de Controle do Sudoku** | O sistema deve permitir ao usuário: iniciar uma nova partida com botão "Jogar", resetar o tabuleiro com "Novo jogo" e consultar a solução completa por meio do botão "Resposta" (ação que encerra a partida como abandonada). |
| **RF13** | **Controle e Abertura de Sessão de Jogo na API** | O sistema deve efetuar requisição `POST /api/v1/play-sessions` ao iniciar cada partida (Jogo da Velha, Quiz ou Sudoku), sem enviar pontuação arbitrária do cliente, aguardando o cálculo oficial pelo servidor no encerramento. |
| **RF14** | **Envio Contínuo de Jogadas e Ações à API** | O sistema deve enviar cada movimento do jogo da velha (`POST /api/v1/play-sessions/:id/tictactoe/moves`), resposta do quiz (`POST /api/v1/play-sessions/:id/quiz/answers`) e inserção no sudoku (`POST /api/v1/play-sessions/:id/sudoku/cells`). |
| **RF15** | **Finalização e Abandono de Sessão na API** | Ao término de cada partida vitoriosa ou concluída, o sistema deve invocar `POST /api/v1/play-sessions/:id/finish`, exibindo a pontuação oficial retornada pela API. Em caso de desistência ou revelação de gabarito, deve invocar `POST /api/v1/play-sessions/:id/abandon`. |
| **RF16** | **Operação Offline com Fallback Gracioso** | Caso a API backend esteja indisponível ou inacessível, os jogos devem funcionar perfeitamente em modo local sem interrupções, falhas de tela ou travamentos. |
| **RF17** | **Barra de Navegação Rápida (BackNav)** | Em todas as telas internas e páginas de jogos, deve existir navegação com atalhos padronizados para retornar à tela inicial (ícone casinha) e/ou à tela imediatamente anterior (ícone seta). |
| **RF18** | **Tratamento de Rotas Inexistentes (404 / Fallback)** | Qualquer rota digitada não mapeada no catálogo deve redirecionar automaticamente para a página inicial (`/`). |

---

## 3. Requisitos Não Funcionais (RNF)

Os requisitos não funcionais estabelecem os critérios de qualidade, usabilidade, desempenho, segurança e arquitetura do software.

| Identificador | Categoria | Descrição |
| :--- | :--- | :--- |
| **RNF01** | **Fidelidade Visual e Estilo** | A interface gráfica deve manter 100% de paridade estética com o projeto original `MemoriaSaudeTecnologia`, utilizando as fontes `'Roboto'` (corpo de texto) e `'Rowdies'` (títulos e marcas), paleta de cores em azul MST (`#a0d9ff`, `#d3edff`, `#daeffd`), fundo branco, bordas pretas de 2px e sombras com elevação suave (`box-shadow: 10px 7px 15px rgb(51, 51, 51)`). |
| **RNF02** | **Desempenho e Build Otimizado** | A aplicação deve ser construída sobre o empacotador **Vite**, proporcionando Hot Module Replacement (HMR) instantâneo em desenvolvimento e build de produção com carregamento e renderização rápida (tempo de build inferior a 3 segundos). |
| **RNF03** | **Arquitetura Componentizada e Modular** | O código deve seguir o padrão de arquitetura modular do React: separação estrita entre a camada de lógica de negócio/regras puras de jogo (`engine.js`), componentes visuais (`components/`), páginas de rotas (`pages/`), hooks customizados (`hooks/`) e camada de rede (`api/`). |
| **RNF04** | **Acessibilidade (a11y)** | A interface deve implementar atributos semânticos e ARIA (`role="grid"`, `role="gridcell"`, `aria-label`, `aria-live="polite"`, `inputMode="numeric"`), garantindo legibilidade para leitores de tela e navegabilidade facilitada. |
| **RNF05** | **Confiabilidade e Testabilidade Automatizada** | Toda a base crítica deve possuir testes unitários e de integração implementados com **Jest** e **React Testing Library**, abrangendo motores matemáticos dos jogos, renderização de componentes, rotas e tratamento de respostas HTTP. A suíte deve executar com 100% de aprovação. |
| **RNF06** | **Tratamento Padronizado de Erros da API** | A camada de comunicação HTTP deve suportar respostas de erro no formato **RFC 7807 (Problem Details)**, extraindo códigos de validação estruturados (`VALIDATION_FAILED`, `NOT_FOUND`, etc.) e emitindo exceções tipadas (`ApiError`). |
| **RNF07** | **Segurança e Enxugamento de Escopo** | O sistema não deve conter código fantasma, dependências desnecessárias ou telas de autenticação inexistentes no MST original, operando de forma limpa, direta e pública. |
| **RNF08** | **Compatibilidade e Responsividade** | A aplicação deve ser compatível com os principais navegadores modernos (Chrome, Firefox, Safari, Edge) e adaptar-se ergonomicamente a diferentes resoluções de tela (desktop, tablets e smartphones). |
| **RNF09** | **Integridade de Dados dos Tabuleiros** | Todas as matrizes de jogos (como as 15 configurações de Sudoku) devem conter exatamente 81 caracteres numéricos/hifens por máscara e solução, garantindo correspondência 1:1 sem falhas de alinhamento. |
