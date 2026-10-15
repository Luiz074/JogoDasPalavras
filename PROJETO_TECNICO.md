# Projeto Tecnico: Jogo das Palavras

- **Direcao visual:** Design 03, Cartaz
- **Documento de origem:** [PRD.md](PRD.md)
- **Status:** Proposta tecnica para validacao
- **Plataforma:** Web responsiva
- **Idioma:** Portugues brasileiro (PT-BR)

## 1. Objetivo

Descrever uma arquitetura implementavel para levar o prototipo visual Cartaz a um produto web com desafio diario, arquivo, modo livre, estatisticas, persistencia local e conta opcional.

Este documento distingue requisitos ja definidos no PRD de recomendacoes tecnicas. A arquitetura de backend e uma proposta, nao uma decisao de fornecedor aprovada.

## 2. Design 03: Cartaz

O conceito Cartaz usa contraste alto, tipografia forte e uma composicao centrada no tabuleiro. As regras do jogo nao mudam entre os prototipos.

### 2.1 Tokens visuais

| Funcao | Valor proposto |
|---|---|
| Fundo principal | `#191D1B` |
| Texto principal | `#F0F2E9` |
| Texto secundario | `#B2B9B0` |
| Destaque / letra correta | `#D9F05B` |
| Letra presente | `#A8DCE0` |
| Letra ausente / teclado | `#353C37` |
| Divisorias | `#434B45` |
| Tipografia de exibicao | Archivo Black |
| Tipografia de interface | Source Sans 3 |
| Letras, pontuacao e dados | IBM Plex Mono |

As cores de estado devem sempre vir acompanhadas de simbolo ou texto. O tema escuro nao pode reduzir contraste de texto, foco, controles ou estados. Contrastes finais devem ser medidos contra WCAG 2.2 AA antes do lancamento.

### 2.2 Composicao

- Desktop: cabecalho compacto; tabuleiro como foco principal; resumo lateral com pontuacao, sequencia, vitorias, media e tempo.
- Celular: cabecalho em duas linhas; tabuleiro e teclado em primeiro plano; estatisticas abaixo da partida.
- A grade tem seis linhas e cinco colunas, com dimensoes estaveis.
- O teclado virtual tem tres linhas, alvos de toque confortaveis e estados coerentes com o tabuleiro.
- Resultado e resposta revelada ficam no fluxo da pagina, sem modal obrigatorio.
- A identidade visual nao deve esconder modo atual, data, tentativas restantes ou ausencia de pontuacao nos modos livre e arquivo.

## 3. Estado do prototipo atual

O prototipo atual esta em HTML, CSS e JavaScript sem framework. Ele e adequado para validar layout e interacoes, mas nao e uma implementacao de producao:

- As respostas de demonstracao estao no codigo do navegador.
- O vocabulatio de teste e pequeno e nao representa o dicionario final.
- A autenticacao nao esta conectada a um servico.
- As estatisticas locais sao apenas dados demonstrativos.
- A escolha diaria nao e publicada por um backend comum a todos os jogadores.

Em producao, respostas secretas, validacao de palpites e pontuacao diaria devem ser controladas no servidor. O navegador nao deve receber a resposta antes do fim da partida.

## 4. Arquitetura proposta

### 4.1 Componentes

1. **Aplicacao web:** HTML semantico, CSS e JavaScript em modulos ES. Manter a estrutura leve do projeto e separar logica de dominio, estado de tela e acesso a dados.
2. **API de jogo:** servico que distribui desafios, valida palpites, calcula resultados e controla sequencias. A resposta fica apenas no lado servidor.
3. **Autenticacao:** provedor de autenticacao por e-mail e senha. Senhas nao devem ser armazenadas ou processadas manualmente pela aplicacao.
4. **Banco de dados:** guarda palavras, desafios, partidas autenticadas e estatisticas sincronizadas.
5. **Persistencia local:** IndexedDB para partidas e estatisticas sem login, e cache local da ultima versao da conta carregada.

### 4.2 Stack recomendada para o MVP

- **Frontend:** JavaScript com modulos ES, HTML e CSS. Nao ha necessidade comprovada de framework para o tabuleiro e as telas atuais.
- **Backend gerenciado proposto:** Supabase Auth, PostgreSQL e Edge Functions. Essa combinacao cobre login por e-mail/senha, persistencia relacional e validacao server-side sem criar uma API inteira desde o inicio.
- **Hospedagem web:** servico estatico com HTTPS, como Cloudflare Pages ou Netlify.
- **Testes:** Vitest para logica pura, Playwright para fluxos de navegador e axe-core para verificacoes automatizadas de acessibilidade.

A escolha do Supabase e recomendacao, nao requisito. Antes de adotar, validar custo, regiao de dados, politica de privacidade, limites de uso e estrategia de backup. O mesmo desenho pode ser implementado em outro backend com autenticacao e funcoes server-side.

## 5. Organizacao sugerida do codigo

Evoluir gradualmente dos arquivos raiz existentes para modulos pequenos, sem reescrever o prototipo inteiro de uma vez.

```text
/
|-- index.html
|-- style.css
|-- app.js
|-- src/
|   |-- domain/
|   |   |-- normalize-word.js
|   |   |-- evaluate-guess.js
|   |   |-- scoring.js
|   |   |-- streak.js
|   |   `-- challenge-date.js
|   |-- application/
|   |   |-- game-controller.js
|   |   `-- account-sync.js
|   |-- infrastructure/
|   |   |-- api-client.js
|   |   |-- local-store.js
|   |   `-- auth-client.js
|   `-- ui/
|       |-- render-board.js
|       |-- render-keyboard.js
|       `-- render-results.js
|-- supabase/
|   |-- migrations/
|   `-- functions/
|       |-- challenge/
|       |-- submit-guess/
|       `-- progress/
`-- tests/
    |-- unit/
    `-- e2e/
```

`app.js` deve iniciar a interface, conectar eventos e montar o estado. Calculos de palavras e pontuacao ficam em `domain/` para serem testados sem DOM ou backend.

## 6. Modelo de dominio

### 6.1 Estado de uma partida

```js
{
  mode: "daily" | "archive" | "free",
  challengeDate: "YYYY-MM-DD" | null,
  sessionId: "opaque-id",
  guesses: [],
  attemptsRemaining: 6,
  status: "playing" | "won" | "lost",
  elapsedSeconds: 0,
  points: null
}
```

O cliente nao inclui a resposta secreta nesse estado. A resposta revelada so chega na resposta final do servidor.

### 6.2 Normalizacao

Palavras sao comparadas em forma normalizada, sem substituir a grafia oficial armazenada:

1. Remover espacos externos e converter para maiusculas com locale `pt-BR`.
2. Normalizar Unicode para NFD e remover marcas diacriticas.
3. Tratar `Ç` como `C` no valor comparado.
4. Preservar `display_form` para mostrar a grafia oficial ao revelar a solucao.

Exemplo: a forma de exibicao `LIMÃO` e comparada como `LIMAO`; a resposta final continua `LIMÃO`.

### 6.3 Feedback de letras repetidas

O algoritmo precisa consumir as ocorrencias disponiveis, e nao apenas verificar se uma letra existe:

1. Marcar primeiro todas as letras que coincidem na posicao e descontar essas ocorrencias da contagem da resposta.
2. Percorrer as demais letras do palpite da esquerda para a direita. Marcar como presente em outra posicao somente enquanto houver ocorrencias restantes na resposta.
3. Marcar ocorrencias excedentes do palpite como ausentes.

Pseudocodigo:

```text
estados = [ausente] * tamanho
contagem = frequencias(resposta_normalizada)

para cada posicao:
    se palpite[posicao] == resposta[posicao]:
        estados[posicao] = correta
        contagem[palpite[posicao]] -= 1

para cada posicao da esquerda para a direita:
    se estados[posicao] ainda nao e correta e contagem[palpite[posicao]] > 0:
        estados[posicao] = presente
        contagem[palpite[posicao]] -= 1
```

Essa ordem faz com que duas letras repetidas corretamente posicionadas recebam ambas o estado correto, sem marcar uma letra excedente como presente.

### 6.4 Pontuacao

- Vitoria na tentativa `n`: `600 - 100 * (n - 1)` pontos-base.
- Derrota: zero pontos.
- Desafio diario: aplicar `1.1x` quando o bonus de sequencia estiver ativo.
- Arquivo e modo livre: zero pontos, sem alterar sequencia diaria.
- Tempo e uma estatistica, nao um fator de pontuacao.

O servidor e a autoridade final do calculo. O cliente pode antecipar a apresentacao, mas deve substituir o valor pela resposta confirmada do backend.

## 7. Data, desafio diario e conteudo

- A data do desafio deve ser calculada no backend usando o fuso IANA `America/Sao_Paulo`, nunca pelo fuso configurado no aparelho.
- Deve existir no maximo um desafio publicado por data local de Brasilia.
- O endpoint deve retornar a data, identificador opaco, limite de tentativas e estado da partida, mas nunca a palavra-alvo.
- O contador ate a virada pode ser renderizado no cliente a partir de `nextChallengeAt` devolvido pelo servidor.
- Arquivo carrega uma sessao separada, nao afeta sequencia e nao concede pontos.
- Cada partida livre recebe uma palavra sorteada do conjunto elegivel; repeticao e permitida e nao concede pontos.

### 7.1 Pipeline de palavras

Recomendacao inicial, sujeita a aprovacao editorial:

1. Manter um vocabulario de palpites validos em PT-BR e uma lista separada de respostas elegiveis.
2. Guardar forma oficial, forma normalizada, variante linguistica, frequencia e elegibilidade.
3. Gerar automaticamente candidatos diarios apenas a partir das palavras elegiveis.
4. Rejeitar candidatos com ambiguidade conhecida, grafia controversa, nomes proprios ou frequencia abaixo do limite definido.
5. Registrar versao do algoritmo e da lista usada para que um desafio publicado nunca mude retroativamente.

O PRD ainda nao define a fonte do dicionario nem os limites de frequencia. Nao publicar respostas automaticamente ate que esses criterios e um mecanismo de correcao editorial estejam definidos.

## 8. API proposta

Todas as rotas usam HTTPS. Respostas de palpites devem ser idempotentes por `sessionId` e indice da tentativa, para um duplo clique nao consumir duas tentativas.

| Operacao | Entrada principal | Saida |
|---|---|---|
| `GET /api/v1/challenges/today` | Token de conta opcional | `challengeId`, data de Brasilia, limite, estado e proxima virada; sem resposta |
| `GET /api/v1/challenges/archive?before=YYYY-MM-DD` | Data de paginacao | Datas disponiveis e estado de conclusao |
| `POST /api/v1/sessions/archive` | Data do desafio | `sessionId` e limite de tentativas |
| `POST /api/v1/sessions/free` | Nenhum ou preferencias futuras | `sessionId` e limite de tentativas |
| `POST /api/v1/sessions/{id}/guesses` | Texto do palpite e indice idempotente | Estados das letras, tentativas restantes e estado da sessao |
| `GET /api/v1/me/progress` | Token de conta | Estatisticas e historico completos da conta |

No fim da partida, a resposta de envio pode incluir a grafia oficial, resultado final, pontuacao e estatisticas atualizadas. Para conta autenticada, o backend persiste a sessao e atualiza as estatisticas na mesma transacao.

## 9. Persistencia e conta

### 9.1 Dados anonimos

- Usar IndexedDB, com versao de schema, para partidas, historico e estatisticas locais.
- A interface sem conta deve continuar funcionando se o backend de conta estiver indisponivel.
- Se a sessao de desafio exige validacao server-side, mostrar erro recuperavel e permitir nova tentativa de rede; nao inventar feedback local usando a resposta secreta.

### 9.2 Login e troca de fonte de dados

1. A pessoa autentica com e-mail e senha por meio do provedor de identidade.
2. O cliente solicita o snapshot da conta.
3. Apos sucesso, substituir o conjunto local ativo pelo snapshot da conta. Nao mesclar com o progresso anonimo anterior.
4. Enquanto conectada, a conta e fonte autoritativa; IndexedDB pode manter um cache espelho da ultima sincronizacao confirmada.
5. No logout, manter o snapshot local da conta e continuar a partir dos dados locais, como definido no PRD.
6. No login de outra conta no mesmo aparelho, substituir o cache ativo novamente pelo snapshot daquela conta.

O PRD ainda nao define confirmacao de e-mail, recuperacao de senha, exclusao de conta e politica de retencao. Esses fluxos devem ser aprovados antes de abrir cadastro publico.

### 9.3 Esquema relacional inicial

| Tabela | Campos principais | Observacoes |
|---|---|---|
| `profiles` | `user_id`, `created_at` | `user_id` referencia o identificador do provedor de autenticacao; nao duplicar senha ou credencial. |
| `word_entries` | `id`, `display_form`, `normalized_form`, `locale`, `frequency_rank`, `answer_eligible` | Separar validade de palpite de elegibilidade como resposta. |
| `daily_challenges` | `id`, `challenge_date`, `word_id`, `algorithm_version`, `published_at` | Restricao unica em `challenge_date`; acesso a `word_id` limitado ao backend. |
| `game_sessions` | `id`, `user_id`, `mode`, `challenge_date`, `status`, `attempts_used`, `elapsed_seconds`, `points`, `started_at`, `completed_at` | `points` e nulo ou zero para arquivo/livre; nunca pontuar esses modos. |
| `game_guesses` | `session_id`, `attempt_number`, `normalized_guess`, `letter_states` | Restricao unica em `(session_id, attempt_number)`. |
| `user_progress` | `user_id`, `total_wins`, `sum_winning_attempts`, `current_streak`, `best_streak`, `last_daily_win` | Media derivada de `sum_winning_attempts / total_wins`; quando zero vitorias, API retorna nulo e UI exibe `--`. |

As estatisticas agregadas devem ser atualizadas transacionalmente com o resultado diario. Historico detalhado e fonte primaria; totais podem ser recalculados para reparo ou auditoria.

## 10. Seguranca e privacidade

- Restringir leitura e escrita dos dados de conta ao proprio `user_id`, com Row Level Security (RLS).
- A resposta das tabelas de desafio e acessivel apenas a funcoes server-side autorizadas.
- Nunca incluir chave de servico do banco ou segredo de autenticacao no bundle web.
- Usar provedor gerenciado para hashing, validacao e recuperacao de senha; nunca registrar senha em log.
- Validar comprimento, vocabulario, limite de tentativas e estado final no servidor.
- Rejeitar tentativas fora de ordem, sessoes expiradas e reenvios duplicados sem consumir tentativa duas vezes.
- Limitar chamadas abusivas sem bloquear o uso anonimo normal.
- Minimizar dados pessoais; e-mail fica no provedor de identidade, e tabelas de jogo usam apenas o identificador interno da conta.
- Definir consentimento, retencao, exportacao e exclusao de dados antes do lancamento.

## 11. Acessibilidade e interacao

- Declarar `lang="pt-BR"` e preservar semantica de botoes, formularios, navegacao e secoes.
- Permitir entrada pelo teclado fisico e pelo teclado virtual; o campo real deve ter rotulo acessivel e receber foco visivel.
- Anunciar uma tentativa concluida e o resultado por uma regiao de status. Nao anunciar o cronometro a cada segundo.
- Cada letra deve expor texto equivalente a correta na posicao, presente em outra posicao ou ausente. Cor e simbolos sao reforcos, nao a unica informacao.
- Confirmar que foco, controles e graficos importantes atendem aos contrastes WCAG 2.2 AA; testar o tema escuro especificamente.
- Suportar ampliacao de texto, quebra de linhas, telas estreitas e `prefers-reduced-motion`.
- Nao mover o foco ao atualizar cada estado do tabuleiro; mover ou anunciar apenas em mudancas relevantes.

## 12. Erros e recuperacao

| Situacao | Comportamento esperado |
|---|---|
| Palavra com tamanho incorreto | Manter a tentativa e informar quantas letras faltam ou sobram. |
| Palavra fora do vocabulario | Nao consumir tentativa; associar a mensagem ao campo e anuncia-la. |
| Sem rede ao enviar palpite | Preservar o texto, nao consumir tentativa e oferecer reenvio. |
| Sessao diaria ja concluida | Retornar o resultado existente, sem conceder pontos novamente. |
| Falha ao carregar conta | Preservar o cache local atual ate confirmar o snapshot da conta; nao fazer mesclagem silenciosa. |
| Falha ao salvar estatisticas | Manter estado local e informar que a sincronizacao esta pendente. |

## 13. Testes

### 13.1 Testes unitarios

- Normalizacao de maiusculas, acentos, `Ç` e comprimento Unicode.
- Feedback para letras repetidas, incluindo correspondencias exatas, presentes e excedentes.
- Pontuacao para vitoria em cada tentativa, derrota, multiplicador e modos sem pontos.
- Media de tentativas com zero vitorias (`null` na API e `--` na interface).
- Virada diaria proxima a meia-noite em `America/Sao_Paulo`, independente do fuso do navegador.
- Sequencia diaria em dias consecutivos, lacunas e partidas de arquivo/livre.

### 13.2 Testes de integracao e ponta a ponta

- Comecar sem conta, completar o desafio e confirmar persistencia local.
- Logar e verificar substituicao local pelo snapshot da conta, sem mesclagem.
- Fazer logout e verificar que o snapshot local continua ativo.
- Logar em outro dispositivo e recuperar historico e estatisticas da conta.
- Confirmar que diario tem uma resposta por data, e arquivo/livre nunca geram pontos.
- Confirmar que respostas secretas nao aparecem no HTML, bundle ou resposta inicial da API.
- Jogar usando teclado fisico e teclado virtual, incluindo erros e letras repetidas.

### 13.3 Acessibilidade e responsividade

- Executar axe-core e revisar manualmente os resultados.
- Navegar sem mouse, validar foco em todos os controles e testar anuncios com leitor de tela.
- Conferir contraste de texto, feedback, teclado e foco em cada variante do tema Cartaz.
- Testar largura de 320 px, 390 px, tablet e desktop; zoom de 200% e 400%.
- Validar ausencia de rolagem horizontal, controles encobertos e conteudo truncado.

## 14. Etapas de implementacao

1. **Consolidar regras:** definir fonte do vocabulario, elegibilidade de respostas, regra de streak, arredondamento, estado ao falhar e politica de dados.
2. **Extrair dominio:** mover normalizacao, avaliacao de letras repetidas, pontuacao e datas para funcoes puras e cobri-las com testes.
3. **Construir experiencia local:** estabilizar Design 03, modos, teclado, resultado, estatisticas e IndexedDB sem login.
4. **Adicionar API de jogo:** tabelas, publicacao diaria, criacao de sessao, validacao server-side e protecao da resposta.
5. **Adicionar conta:** e-mail/senha, snapshot, substituicao do estado local, cache e logout.
6. **Endurecer qualidade:** testes E2E, RLS, acessibilidade, responsividade, observabilidade, backup e verificacao de deploy.

Cada etapa deve ser liberada por criterios de aceite e continuar permitindo a partida sem conta.

## 15. Decisoes ainda necessarias

- Fonte, licenca e cobertura do vocabulario de palpites PT-BR.
- Regra automatica de selecao de respostas e procedimento para corrigir um desafio publicado.
- Definicao exata de quando o bonus de streak `1.1x` esta ativo e quando a sequencia e reiniciada.
- Quais estatisticas de arquivo e modo livre entram no historico sincronizado da conta, embora esses modos nao pontuem.
- Confirmacao de e-mail, recuperacao de senha, exclusao/retencao de conta e politica de privacidade.
- Aprovacao do provedor Supabase e do servico de hospedagem.

## 16. Criterio de pronto

O MVP esta pronto quando as regras do PRD forem validadas por testes unitarios e E2E; o desafio diario for identico para todos na data de Brasilia; arquivo e modo livre nao pontuarem; resposta e estatisticas forem autoritativas no servidor para contas; estado anonimo persistir localmente; login substituir, sem mesclar, o estado local; e o Design 03 passar pela revisao de acessibilidade e responsividade.