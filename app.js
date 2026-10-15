const gameStage = document.querySelector("#game-stage");
const gameBoard = document.querySelector("#game-board");
const keyboard = document.querySelector("#virtual-keyboard");
const liveMessage = document.querySelector("#live-message");
const resultPanel = document.querySelector("#result-panel");
const submitButton = document.querySelector("#submit-button");
const guessWords = new Set([
    "AMIGO", "AREIA", "AVISO", "BANCO", "BOTAO", "CAMPO", "CANTO", "CARRO",
    "CARTA", "CASAS", "CASAR", "CESTA", "CLARO", "FESTA", "FLORA", "FOLHA",
    "JOGAR", "LAPIS", "LIMAO", "LIVRO", "MUNDO", "NORTE", "NUVEM", "PLUMA",
    "PORTA", "PRAIA", "SABER", "SINAL", "TERRA", "VERDE"
]);
const freeWordTargets = ["MUNDO", "PLUMA", "FESTA", "PORTA", "CASAS"];
const modeContent = {
    diario: {
        target: "CASAS",
        label: "DESAFIO DO DIA · Nº 1944",
        title: getTodayLabel(),
        description: "Descubra a palavra em até seis tentativas.",
        scores: true
    },
    arquivo: {
        target: "LIVRO",
        label: "ARQUIVO · DESAFIO ANTERIOR",
        title: getPreviousDayLabel(),
        description: "Uma rodada anterior para jogar novamente.",
        scores: false
    },
    livre: {
        target: "MUNDO",
        label: "MODO LIVRE · PARTIDA ALEATÓRIA",
        title: "Uma palavra, seis tentativas",
        description: "Partida livre. A palavra pode aparecer novamente.",
        scores: false
    }
};
const prototypeNumbers = { caderno: "01", sinalizacao: "02", cartaz: "03" };
const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "APAGAR"]
];
const initialStats = { wins: 18, average: 3.2, streak: 4, bestStreak: 7 };
let currentMode = "diario";
let currentTarget = modeContent.diario.target;
let guesses = [];
let pendingGuess = "";
let finished = false;
let roundStartedAt = Date.now() - 18000;
let stats = readStats();

function normalizeWord(word) {
    return word
        .toLocaleUpperCase("pt-BR")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/Ç/g, "C");
}

function formatDate(date) {
    const formatted = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "America/Sao_Paulo"
    }).format(date);
    return formatted.charAt(0).toLocaleUpperCase("pt-BR") + formatted.slice(1);
}

function getTodayLabel() {
    return formatDate(new Date());
}

function getPreviousDayLabel() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return formatDate(date);
}

function readStats() {
    try {
        const saved = JSON.parse(localStorage.getItem("jdp-prototype-stats"));
        if (saved && Number.isFinite(saved.wins) && Number.isFinite(saved.average)) {
            return { ...initialStats, ...saved };
        }
    } catch {
        return { ...initialStats };
    }
    return { ...initialStats };
}

function saveStats() {
    try {
        localStorage.setItem("jdp-prototype-stats", JSON.stringify(stats));
    } catch {
        liveMessage.textContent = "Não foi possível salvar as estatísticas neste navegador.";
    }
}

function getStatuses(guess, target) {
    const result = Array(guess.length).fill("absent");
    const remaining = {};

    for (const letter of target) {
        remaining[letter] = (remaining[letter] || 0) + 1;
    }

    for (let index = 0; index < guess.length; index += 1) {
        if (guess[index] === target[index]) {
            result[index] = "correct";
            remaining[guess[index]] -= 1;
        }
    }

    for (let index = 0; index < guess.length; index += 1) {
        if (result[index] === "correct") {
            continue;
        }
        if (remaining[guess[index]] > 0) {
            result[index] = "present";
            remaining[guess[index]] -= 1;
        }
    }

    return result;
}

function getMode() {
    return modeContent[currentMode];
}

function getTarget() {
    return currentTarget;
}

function createTile(letter = "", state = "") {
    const tile = document.createElement("span");
    tile.className = "tile";
    tile.textContent = letter;
    if (state) {
        tile.dataset.state = state;
        const descriptions = {
            correct: "letra correta nesta posição",
            present: "letra presente em outra posição",
            absent: "letra ausente"
        };
        tile.setAttribute("aria-label", `${letter}: ${descriptions[state]}`);
    }
    return tile;
}

function renderBoard() {
    const target = normalizeWord(getTarget());
    gameBoard.replaceChildren();

    for (let rowIndex = 0; rowIndex < 6; rowIndex += 1) {
        if (rowIndex < guesses.length) {
            const guess = guesses[rowIndex];
            const row = document.createElement("div");
            row.className = "guess-row completed-row";
            row.setAttribute("aria-label", `Tentativa ${rowIndex + 1} de 6`);
            [...guess.word].forEach((letter, index) => {
                row.append(createTile(letter, guess.statuses[index]));
            });
            gameBoard.append(row);
            continue;
        }

        if (rowIndex === guesses.length && !finished) {
            const form = document.createElement("form");
            form.id = "guess-form";
            form.className = "guess-row active-guess-row";
            form.setAttribute("aria-label", `Tentativa ${rowIndex + 1} de 6, campo para digitar`);

            for (let index = 0; index < 5; index += 1) {
                form.append(createTile(pendingGuess[index] || ""));
            }

            const label = document.createElement("label");
            label.className = "visually-hidden";
            label.htmlFor = "guess-input";
            label.textContent = "Digite um palpite de cinco letras";
            const input = document.createElement("input");
            input.className = "entry-input";
            input.id = "guess-input";
            input.name = "palpite";
            input.type = "text";
            input.maxLength = 5;
            input.autocomplete = "off";
            input.autocapitalize = "characters";
            input.spellcheck = false;
            input.value = pendingGuess;
            input.setAttribute("aria-describedby", "game-instructions");
            form.append(label, input);
            gameBoard.append(form);
            continue;
        }

        const emptyRow = document.createElement("div");
        emptyRow.className = "guess-row empty-row";
        emptyRow.setAttribute("aria-label", `Tentativa ${rowIndex + 1} de 6, não usada`);
        for (let index = 0; index < 5; index += 1) {
            emptyRow.append(createTile());
        }
        gameBoard.append(emptyRow);
    }

    document.querySelector("#attempt-number").textContent = String(guesses.length).padStart(2, "0");
    submitButton.disabled = finished;
    updateKeyboardStates();
}

function renderKeyboard() {
    keyboard.replaceChildren();

    keyboardRows.forEach((letters) => {
        const row = document.createElement("div");
        row.className = "keyboard-row";
        letters.forEach((key) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "key";
            button.dataset.key = key;
            if (key === "ENTER" || key === "APAGAR") {
                button.dataset.action = key.toLowerCase();
                button.textContent = key === "ENTER" ? "Enviar" : "Apagar";
                button.setAttribute("aria-label", key === "ENTER" ? "Enviar tentativa" : "Apagar última letra");
            } else {
                button.textContent = key;
                button.setAttribute("aria-label", `Letra ${key}`);
            }
            row.append(button);
        });
        keyboard.append(row);
    });
}

function updateKeyboardStates() {
    const priority = { absent: 1, present: 2, correct: 3 };
    const states = {};
    guesses.forEach(({ word, statuses }) => {
        [...word].forEach((letter, index) => {
            const current = statuses[index];
            if (!states[letter] || priority[current] > priority[states[letter]]) {
                states[letter] = current;
            }
        });
    });
    keyboard.querySelectorAll(".key[data-key]").forEach((button) => {
        const state = states[button.dataset.key];
        if (state) {
            button.dataset.state = state;
        } else {
            delete button.dataset.state;
        }
    });
}

function updateStatsView() {
    document.querySelector("#wins-value").textContent = String(stats.wins);
    document.querySelector("#average-value").textContent = stats.wins ? stats.average.toFixed(1).replace(".", ",") : "--";
    document.querySelector("#streak-value").textContent = String(stats.streak).padStart(2, "0");
}

function updateModeView() {
    const mode = getMode();
    document.querySelector("#mode-label").textContent = mode.label;
    document.querySelector("#challenge-title").textContent = mode.title;
    document.querySelector("#mode-description").textContent = mode.description;
    document.querySelector("#mode-score-note").hidden = mode.scores;
    document.querySelector("#daily-score").textContent = "—";
    document.querySelector("#score-note").textContent = mode.scores
        ? "A pontuação aparece ao vencer."
        : "Este modo não gera pontuação.";
    document.querySelector(".primary-stat .stat-label").textContent = mode.scores ? "Pontuação de hoje" : "Pontuação";
    document.querySelectorAll(".mode-choice").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.mode === currentMode));
    });
}

function showResult(won) {
    const answer = getTarget();
    const isDaily = getMode().scores;
    resultPanel.hidden = false;
    resultPanel.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = won ? "Palavra descoberta" : "Fim das tentativas";
    const detail = document.createElement("p");
    if (!isDaily) {
        detail.textContent = `A resposta era ${answer}. Esta partida não gera pontuação.`;
    } else if (!won) {
        detail.textContent = `A resposta era ${answer}. Esta rodada não gera pontos.`;
    } else {
        const baseScore = 600 - (guesses.length - 1) * 100;
        const score = Math.round(baseScore * 1.1);
        document.querySelector("#daily-score").textContent = String(score);
        document.querySelector("#score-note").textContent = `${baseScore} pontos × 1,1 de sequência.`;
        stats.wins += 1;
        stats.average = Number((((stats.average * (stats.wins - 1)) + guesses.length) / stats.wins).toFixed(1));
        stats.streak += 1;
        stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
        saveStats();
        updateStatsView();
        detail.textContent = `A resposta era ${answer}. ${score} pontos em ${guesses.length} tentativa${guesses.length === 1 ? "" : "s"}.`;
    }
    resultPanel.append(heading, detail);
    liveMessage.textContent = `${heading.textContent}. ${detail.textContent}`;
}

function submitGuess() {
    if (finished) {
        return;
    }
    const typedWord = pendingGuess.trim().toLocaleUpperCase("pt-BR");
    const normalized = normalizeWord(typedWord);

    if ([...normalized].length !== 5) {
        liveMessage.textContent = "Digite cinco letras para enviar a tentativa.";
        document.querySelector("#guess-input")?.focus();
        return;
    }
    if (!guessWords.has(normalized)) {
        liveMessage.textContent = "Essa palavra não está na lista de demonstração.";
        document.querySelector("#guess-input")?.focus();
        return;
    }

    const target = normalizeWord(getTarget());
    const statuses = getStatuses(normalized, target);
    guesses.push({ word: typedWord, statuses });
    pendingGuess = "";
    const won = normalized === target;
    finished = won || guesses.length === 6;
    renderBoard();

    if (won || finished) {
        showResult(won);
    } else {
        const feedback = statuses.map((state, index) => `${typedWord[index]}: ${state === "correct" ? "correta nesta posição" : state === "present" ? "presente em outra posição" : "ausente"}`).join(". ");
        liveMessage.textContent = `Tentativa ${guesses.length} registrada. ${feedback}.`;
        document.querySelector("#guess-input")?.focus({ preventScroll: true });
    }
}

function setPrototype(prototype) {
    gameStage.dataset.prototype = prototype;
    document.querySelectorAll(".prototype-choice").forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.prototype === prototype));
    });
    document.querySelector("#prototype-count").textContent = prototypeNumbers[prototype];
}

function startRound(mode = currentMode) {
    currentMode = mode;
    currentTarget = currentMode === "livre"
        ? freeWordTargets[Math.floor(Math.random() * freeWordTargets.length)]
        : getMode().target;
    guesses = [];
    pendingGuess = "";
    finished = false;
    roundStartedAt = Date.now();
    liveMessage.textContent = "";
    resultPanel.hidden = true;
    updateModeView();
    renderBoard();
    document.querySelector("#guess-input")?.focus({ preventScroll: true });
}

function updateEntryTiles(input) {
    const cleaned = [...input.value.toLocaleUpperCase("pt-BR")]
        .filter((letter) => /^\p{L}$/u.test(letter))
        .slice(0, 5)
        .join("");
    if (input.value !== cleaned) {
        input.value = cleaned;
    }
    pendingGuess = cleaned;
    const activeRow = input.closest(".active-guess-row");
    activeRow.querySelectorAll(".tile").forEach((tile, index) => {
        tile.textContent = pendingGuess[index] || "";
    });
}

function addLetter(letter) {
    const input = document.querySelector("#guess-input");
    if (!input || finished) {
        return;
    }
    if (letter === "APAGAR") {
        pendingGuess = [...pendingGuess].slice(0, -1).join("");
    } else if (letter !== "ENTER" && [...pendingGuess].length < 5) {
        pendingGuess += letter;
    }
    input.value = pendingGuess;
    updateEntryTiles(input);
    input.focus({ preventScroll: true });
    if (letter === "ENTER") {
        submitGuess();
    }
}

function updateTimer() {
    const seconds = Math.floor((Date.now() - roundStartedAt) / 1000);
    const minutesPart = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secondsPart = String(seconds % 60).padStart(2, "0");
    document.querySelector("#time-value").textContent = `${minutesPart}:${secondsPart}`;

    const now = new Date();
    const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 3));
    const remaining = Math.max(0, Math.floor((nextMidnight.getTime() - now.getTime()) / 1000));
    const hours = String(Math.floor(remaining / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
    const secs = String(remaining % 60).padStart(2, "0");
    document.querySelector("#countdown").textContent = `${hours}:${minutes}:${secs}`;
}

document.querySelectorAll(".prototype-choice").forEach((button) => {
    button.addEventListener("click", () => setPrototype(button.dataset.prototype));
});

document.querySelectorAll(".mode-choice").forEach((button) => {
    button.addEventListener("click", () => startRound(button.dataset.mode));
});

gameBoard.addEventListener("input", (event) => {
    if (event.target.id === "guess-input") {
        updateEntryTiles(event.target);
        liveMessage.textContent = "";
    }
});

gameBoard.addEventListener("submit", (event) => {
    event.preventDefault();
    submitGuess();
});

keyboard.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-key]");
    if (button) {
        addLetter(button.dataset.key);
    }
});

document.querySelector("#submit-button").addEventListener("click", submitGuess);
document.querySelector("#reset-button").addEventListener("click", () => startRound());
document.querySelector("#stats-button").addEventListener("click", () => {
    document.querySelector("#stats-title").focus({ preventScroll: true });
    document.querySelector("#stats-panel").scrollIntoView({ behavior: "smooth", block: "center" });
});
document.querySelector("#account-button").addEventListener("click", () => {
    liveMessage.textContent = "A autenticação por conta não está conectada neste protótipo.";
});

document.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select") || event.ctrlKey || event.metaKey || event.altKey) {
        return;
    }
    if (event.key === "Enter") {
        event.preventDefault();
        submitGuess();
    } else if (event.key === "Backspace") {
        event.preventDefault();
        addLetter("APAGAR");
    } else if (/^\p{L}$/u.test(event.key)) {
        addLetter(event.key.toLocaleUpperCase("pt-BR"));
    }
});

function initialize() {
    renderKeyboard();
    updateStatsView();
    updateModeView();
    guesses = [{ word: "CANTO", statuses: getStatuses("CANTO", normalizeWord(getTarget())) }];
    renderBoard();
    updateTimer();
    window.setInterval(updateTimer, 1000);
}

initialize();