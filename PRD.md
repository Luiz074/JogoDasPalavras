# PRD: Jogo das Palavras

- **Status:** Rascunho para validação
- **Produto:** Jogo casual de adivinhação de palavras
- **Plataforma:** Web responsiva
- **Idioma inicial:** Português brasileiro (PT-BR)
- **Público principal:** Adultos casuais

## 1. Visão do produto

Criar um jogo casual, acessível e justo em que a pessoa tenta descobrir uma palavra de cinco letras em até seis tentativas. O produto oferece um desafio diário comum a todos, um arquivo de desafios anteriores e um modo livre para partidas adicionais.

A prioridade do primeiro lançamento é que cada partida seja divertida e justa. O jogo será gratuito, sem anúncios, sem dicas e sem recursos competitivos ou sociais no escopo inicial.

## 2. Público e necessidade

**Público:** pessoas adultas que buscam uma atividade rápida e casual no navegador, principalmente em dispositivos móveis.

**Necessidade:** jogar uma partida fácil de entender, com feedback claro, vocabulário familiar e progresso preservado sem exigir uma conta.

## 3. Objetivos

- Permitir que uma pessoa comece a jogar sem cadastro.
- Oferecer um desafio diário consistente para todos os jogadores.
- Permitir revisitar desafios anteriores e jogar partidas livres.
- Apresentar resultados e estatísticas de forma clara.
- Permitir que o progresso local seja sincronizado com uma conta opcional.
- Evitar que cor, tamanho de tela ou baixa legibilidade impeçam a compreensão do jogo.

## 4. Fora do escopo inicial

- Dicas durante a partida.
- Multijogador, partidas PvP, placares públicos ou competição entre amigos.
- Anúncios, compras no aplicativo ou assinatura.
- Definições de dicionário ou conteúdo educativo após cada resposta.
- Aplicativos nativos para Android ou iOS.

## 5. Experiência principal

### 5.1 Desafio diário

1. A pessoa abre o jogo e inicia o desafio disponível para a data atual.
2. O desafio contém uma palavra de cinco letras e permite até seis tentativas.
3. Após cada tentativa válida, o jogo informa quais letras estão na posição correta e quais aparecem na palavra em outra posição. Letras ausentes também devem ser identificáveis.
4. A rodada termina quando a palavra é descoberta ou quando as seis tentativas são usadas.
5. Ao terminar, o jogo revela a palavra com sua grafia oficial e apresenta o resultado, a pontuação, as estatísticas relevantes e a contagem até o próximo desafio diário.

O desafio diário muda à meia-noite no horário de Brasília. A mesma data deve corresponder à mesma resposta para todas as pessoas.

### 5.2 Arquivo

- Deve ser possível abrir e jogar desafios de datas anteriores.
- O resultado de um desafio arquivado não deve alterar a sequência diária atual.
- Desafios arquivados não geram pontuação.
- O arquivo deve identificar a data de cada desafio e indicar se ele já foi concluído pelo jogador.

### 5.3 Modo livre

- Deve permitir iniciar partidas adicionais com palavras aleatórias.
- Uma palavra pode aparecer novamente em partidas livres.
- Partidas livres devem ser identificadas separadamente das partidas diárias e arquivadas.
- Partidas livres não devem alterar a sequência de desafios diários.
- Partidas livres não geram pontuação.

## 6. Regras e conteúdo

- A palavra-alvo tem cinco letras e oferece até seis tentativas.
- Uma tentativa só pode ser enviada se tiver cinco letras e for reconhecida como palavra válida pelo vocabulário do jogo.
- As palavras devem priorizar vocabulário frequente e familiar em português brasileiro.
- A seleção de palavras será feita automaticamente por algoritmo.
- A comparação das tentativas deve ignorar acentos.
- Para a comparação, `Ç` deve ser tratado como `C`.
- A resolução deve exibir a grafia oficial da palavra, incluindo acentos e cedilha quando aplicáveis.
- A normalização serve para comparar respostas; não deve alterar a grafia oficial apresentada ao jogador.
- A mesma palavra diária deve ser utilizada para todos os jogadores naquela data.
- Cada ocorrência de uma letra repetida deve receber seu próprio estado. Se a palavra-alvo contém duas letras `A` e ambas as ocorrências da tentativa estão nas posições corretas, ambas devem ser marcadas como corretas.
- Para avaliar letras repetidas, primeiro marcar as correspondências exatas; depois marcar ocorrências restantes como presentes em outra posição enquanto houver ocorrências correspondentes na palavra-alvo. Ocorrências excedentes na tentativa devem ser marcadas como ausentes, da esquerda para a direita.

## 7. Pontuação e estatísticas

### 7.1 Pontuação

- Uma vitória na primeira tentativa vale 600 pontos.
- Cada tentativa incorreta anterior à vitória reduz a pontuação-base em 100 pontos: segunda tentativa vale 500 pontos, terceira 400, quarta 300, quinta 200 e sexta 100.
- Uma derrota não gera pontuação.
- Quando houver sequência diária ativa, aplicar um multiplicador de 1,1x à pontuação-base da vitória.
- O tempo de resolução será registrado e exibido como estatística, mas não alterará a pontuação.
- Desafios arquivados e partidas livres não geram pontuação nem aumentam ou interrompem a sequência diária.
- A pontuação final deve ser calculada a partir da pontuação-base e do multiplicador de sequência aplicável.

### 7.2 Estatísticas

O jogo deve registrar e apresentar, no mínimo:

- Total de vitórias.
- Média de tentativas nas vitórias.
- Sequência atual de desafios diários concluídos.
- Melhor sequência diária.
- Histórico de resultados por desafio.
- Pontuação e tempo de cada rodada, quando aplicável.

A média de tentativas considera as vitórias. Quando ainda não houver vitórias, exibir `--` em vez de um número.

A tela de resultado deve mostrar o resumo da rodada recém-concluída. Estatísticas agregadas devem poder ser consultadas fora da rodada.

## 8. Persistência e conta

### 8.1 Sem login

- O jogo deve funcionar sem cadastro.
- O progresso e as estatísticas devem ser armazenados localmente no dispositivo/navegador.
- O progresso local pertence ao uso sem login e não é sincronizado automaticamente com uma conta.

### 8.2 Com login

- O login é opcional.
- A conta deve permitir autenticação por e-mail e senha.
- Ao entrar, carregar e sincronizar todas as estatísticas e o progresso associados à conta, incluindo sequência, total de vitórias, média de tentativas, melhor sequência, histórico, pontuação e tempos registrados.
- Após o login, o jogo deve carregar os dados associados à conta.
- Os dados da conta são a fonte ativa após o login. Os dados locais anteriores devem ser ignorados, sem mesclagem, e substituídos pela cópia local do progresso carregado da conta.
- O progresso da conta deve poder ser recuperado ao entrar nela em outro dispositivo.
- Após logout, usar os dados armazenados localmente no dispositivo. A cópia local carregada da conta no login passa a ser o estado local considerado após a saída.


## 9. Acessibilidade e compatibilidade

- A interface deve ser responsiva e utilizável em celular e desktop.
- O feedback não deve depender exclusivamente de cores; deve incluir sinais visuais ou textuais adicionais.
- O texto deve poder ser ampliado sem esconder informações ou controles importantes.
- Contraste de texto, controles, estados e indicadores deve atender aos critérios aplicáveis de WCAG 2.2 nível AA.
- Foco visível, rótulos compreensíveis e ordem de navegação previsível devem ser mantidos nos controles interativos.
- A interface deve continuar legível quando palavras, mensagens de erro ou resultados ocuparem mais espaço que o previsto.

## 10. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF-01 | Iniciar um desafio diário sem exigir login. | Must |
| RF-02 | Permitir até seis tentativas para descobrir uma palavra de cinco letras. | Must |
| RF-03 | Validar tentativas e apresentar feedback por posição e presença de letras. | Must |
| RF-04 | Comparar palavras ignorando acentos e tratando `Ç` como `C`. | Must |
| RF-05 | Revelar a resposta com sua grafia oficial ao final da rodada. | Must |
| RF-06 | Disponibilizar um novo desafio à meia-noite de Brasília e manter uma resposta por data para todos. | Must |
| RF-07 | Disponibilizar arquivo jogável de desafios anteriores. | Must |
| RF-08 | Disponibilizar modo livre com palavras aleatórias e possibilidade de repetição, sem gerar pontuação. | Must |
| RF-09 | Dar 600 pontos por vitória na primeira tentativa, reduzir 100 pontos por tentativa incorreta anterior, não pontuar derrotas e aplicar multiplicador de sequência de 1,1x. | Must |
| RF-10 | Exibir resultado, pontuação, estatísticas da rodada e contagem para o próximo desafio diário. | Must |
| RF-11 | Salvar progresso e estatísticas localmente quando a pessoa não estiver conectada. | Must |
| RF-12 | Permitir autenticação opcional por e-mail e senha e carregar os dados associados à conta, sem mesclar com os dados locais anteriores. | Must |
| RF-13 | Sincronizar todas as estatísticas e o progresso da conta entre dispositivos; após logout, usar o estado local. | Must |
| RF-14 | Oferecer controles acessíveis e interface responsiva. | Must |

## 11. Critérios de aceite do MVP

- Uma pessoa sem conta consegue iniciar e concluir uma rodada diária.
- A rodada aceita até seis tentativas de cinco letras e termina após vitória ou sexta tentativa.
- Letras corretas na posição e letras presentes em outra posição são comunicadas de forma distinguível sem depender apenas de cor.
- A comparação considera equivalentes letras acentuadas e suas formas sem acento; `Ç` e `C` também são equivalentes.
- Ao final da rodada, a resposta aparece com a grafia oficial.
- Duas pessoas jogando o desafio da mesma data recebem a mesma palavra, e a virada ocorre à meia-noite de Brasília.
- O arquivo permite iniciar um desafio passado, e o modo livre permite repetir palavras.
- Jogar no arquivo ou no modo livre não altera a sequência diária.
- Desafios arquivados e partidas livres não geram pontuação.
- Sem login, estatísticas e progresso permanecem disponíveis localmente.
- É possível entrar na conta usando e-mail e senha; após o login, o progresso da conta é carregado e substitui o conjunto local ativo, sem mesclagem.
- Uma vitória na primeira tentativa vale 600 pontos; cada tentativa incorreta anterior reduz 100 pontos, e uma derrota não gera pontos.
- Uma vitória com sequência diária ativa recebe multiplicador de 1,1x; o tempo aparece separadamente e não altera a pontuação.
- Letras repetidas são avaliadas ocorrência por ocorrência, marcando correspondências exatas primeiro e ocorrências excedentes da tentativa como ausentes da esquerda para a direita.
- Sem vitórias, a média de tentativas é exibida como `--`.
- A interface funciona em celular e desktop, permite ampliação de texto e preserva a leitura dos estados do jogo.

## 12. Métricas para avaliar o produto

Como a prioridade é diversão e justiça, acompanhar:

- Taxa de conclusão e taxa de vitória por desafio.
- Distribuição de tentativas usadas e frequência de palavras rejeitadas.
- Abandono por desafio e recorrência de erros de validação do vocabulário.
- Retorno ao desafio diário e uso do arquivo/modo livre.
- Ocorrências de divergência ou falha na sincronização da conta.

As métricas devem ser avaliadas sem transformar tempo de jogo em pressão para o jogador.

## 13. Pendências de produto

1. Definir como o algoritmo seleciona e valida respostas frequentes, evita palavras ambíguas e trata repetições entre desafios diários.
2. Definir a fonte e o escopo do dicionário de tentativas válidas em PT-BR.
3. Definir requisitos de privacidade, exclusão de conta, recuperação de senha e confirmação de e-mail.
