/**
 * ═══════════════════════════════════════════════════════════════
 * DOTA SORTEO — app.js
 * Ruleta vertical con selección ponderada por tickets.
 * Compatible con GitHub Pages (archivos estáticos únicamente).
 *
 * Flujo garantizado:
 *   1. loadParticipants()      → carga y valida participants.json
 *   2. selectWinner()          → selección ponderada (ANTES de animar)
 *   3. buildSpinSequence()     → construye la secuencia visual
 *   4. calculateFinalPosition()→ calcula el translateY exacto
 *   5. animateRoulette()       → anima hasta esa posición
 *   6. showWinner()            → muestra el modal con el ganador
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   CONSTANTS & CONFIGURATION
══════════════════════════════════════════════════════════════ */

/**
 * Altura fija de cada ítem en la ruleta (px).
 * Debe coincidir con --roulette-item-height en CSS.
 */
const ITEM_HEIGHT = (() => {
  const val = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--roulette-item-height')
      .trim(),
    10
  );
  return isNaN(val) ? 64 : val;
})();

/**
 * Cantidad de ítems visibles en la ventana de la ruleta.
 * Debe coincidir con --roulette-visible-items en CSS.
 */
const VISIBLE_ITEMS = (() => {
  const val = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--roulette-visible-items')
      .trim(),
    10
  );
  return isNaN(val) ? 7 : val;
})();

/** Número de vueltas completas antes de detenerse. */
const SPIN_ROUNDS_MIN = 5;
const SPIN_ROUNDS_MAX = 8;

/** Duración total de la animación en ms. */
const SPIN_DURATION_MIN = 5500;
const SPIN_DURATION_MAX = 7500;

/** Clave de localStorage para el historial. */
const HISTORY_KEY = 'dotaSorteoHistory';

/**
 * Genera el enlace al perfil de Steam/Dota a partir del participante.
 * ─────────────────────────────────────────────────────────────────
 * MODIFICAR AQUÍ si el formato del id-dota cambia en el futuro.
 * Actualmente asume que id-dota es una SteamID64.
 * ─────────────────────────────────────────────────────────────────
 * @param {Object} participant
 * @returns {string}
 */
function getSteamUrl(participant) {
  return `https://steamcommunity.com/profiles/${participant['id-dota']}`;
}

/* ══════════════════════════════════════════════════════════════
   APPLICATION STATE
══════════════════════════════════════════════════════════════ */

/**
 * Estados posibles de la aplicación.
 * @enum {string}
 */
const AppState = Object.freeze({
  IDLE:           'IDLE',
  SPINNING:       'SPINNING',
  SHOWING_WINNER: 'SHOWING_WINNER',
});

const state = {
  /** @type {AppState} */
  current: AppState.IDLE,

  /** Lista completa de participantes validados. */
  participants: [],

  /** Participante ganador de la ronda actual. */
  currentWinner: null,

  /** Historial de ganadores de la sesión. */
  history: [],

  /** Indica si los sonidos están habilitados. */
  soundEnabled: true,
};

/* ══════════════════════════════════════════════════════════════
   DOM REFERENCES
══════════════════════════════════════════════════════════════ */
const dom = {
  loadingOverlay:   document.getElementById('loadingOverlay'),
  errorState:       document.getElementById('errorState'),
  errorMessage:     document.getElementById('errorMessage'),
  appMain:          document.getElementById('appMain'),

  statusDot:        document.getElementById('statusDot'),
  statusText:       document.getElementById('statusText'),

  tpParticipants:   document.getElementById('tpParticipants'),
  tpTickets:        document.getElementById('tpTickets'),

  rouletteWidget:   document.querySelector('.roulette-widget'),
  rouletteTrack:    document.getElementById('rouletteTrack'),

  spinningBadge:    document.getElementById('spinningBadge'),
  resultInfo:       document.getElementById('resultInfo'),

  btnSpin:          document.getElementById('btnSpin'),
  btnReset:         document.getElementById('btnReset'),
  btnSound:         document.getElementById('btnSound'),
  chkExclude:       document.getElementById('chkExclude'),

  statParticipants: document.getElementById('statParticipants'),
  statTickets:      document.getElementById('statTickets'),
  participantsList: document.getElementById('participantsList'),

  historyList:      document.getElementById('historyList'),
  historyEmpty:     document.getElementById('historyEmpty'),
  btnClearHistory:  document.getElementById('btnClearHistory'),

  winnerModal:      document.getElementById('winnerModal'),
  winnerName:       document.getElementById('winnerName'),
  winnerId:         document.getElementById('winnerId'),
  btnCopyId:        document.getElementById('btnCopyId'),
  btnCopyText:      document.getElementById('btnCopyText'),
  btnSteam:         document.getElementById('btnSteam'),
  btnCloseModal:    document.getElementById('btnCloseModal'),
};

/* ══════════════════════════════════════════════════════════════
   AUDIO ENGINE
══════════════════════════════════════════════════════════════ */

/**
 * Crea un contexto de audio y genera tonos sintéticos.
 * No depende de archivos de audio externos.
 */
const audio = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_) {
        return null;
      }
    }
    return ctx;
  }

  /**
   * Reproduce un tono sintético.
   * @param {number} frequency - Hz
   * @param {number} duration  - segundos
   * @param {number} volume    - 0..1
   * @param {'sine'|'square'|'sawtooth'|'triangle'} type
   */
  function playTone(frequency, duration, volume = 0.15, type = 'sine') {
    if (!state.soundEnabled) return;
    const c = getCtx();
    if (!c) return;

    const osc  = c.createOscillator();
    const gain = c.createGain();

    osc.connect(gain);
    gain.connect(c.destination);

    osc.type            = type;
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);

    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  }

  /** Tick durante el giro. */
  function tick() {
    playTone(440 + Math.random() * 200, 0.04, 0.08, 'square');
  }

  /** Fanfare al revelar ganador. */
  function winner() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.3, 0.18, 'sine'), i * 120);
    });
  }

  return { tick, winner };
})();

/* ══════════════════════════════════════════════════════════════
   1. LOAD PARTICIPANTS
══════════════════════════════════════════════════════════════ */

/**
 * Carga participants.json mediante fetch y dispara la inicialización.
 * Utiliza ruta relativa para compatibilidad con GitHub Pages.
 */
async function loadParticipants() {
  try {
    const response = await fetch('participants.json');

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: No se pudo obtener participants.json`
      );
    }

    const data = await response.json();
    const participants = validateParticipants(data);

    state.participants = participants;
    initApp();

  } catch (err) {
    showError(
      err.message ||
      'Error desconocido al cargar participants.json. ' +
            'Verifica que el archivo existe y tiene el formato correcto.'
    );
  }
}

/* ══════════════════════════════════════════════════════════════
   2. VALIDATE PARTICIPANTS
══════════════════════════════════════════════════════════════ */

/**
 * Valida la estructura del JSON cargado.
 * Lanza un Error descriptivo si algo no cumple los requisitos.
 *
 * Reglas:
 *  - El JSON debe tener la propiedad "participants" (array).
 *  - Cada participante debe tener: id, name, tickets, id-dota.
 *  - tickets debe ser un entero mayor que 0.
 *  - No se permiten participantes inválidos (falla rápido).
 *
 * @param {any} data - Objeto parseado desde el JSON.
 * @returns {Array<Object>} Lista de participantes validados.
 */
function validateParticipants(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('El archivo JSON no tiene un formato válido.');
  }

  if (!Array.isArray(data.participants)) {
    throw new Error(
      'El JSON debe contener una propiedad "participants" de tipo array.'
    );
  }

  if (data.participants.length === 0) {
    throw new Error('La lista de participantes está vacía.');
  }

  const validated = [];
  const seenIds   = new Set();

  data.participants.forEach((p, index) => {
    const pos = `Participante #${index + 1}`;

    if (p.id === undefined || p.id === null) {
      throw new Error(`${pos}: falta la propiedad "id".`);
    }

    if (seenIds.has(p.id)) {
      throw new Error(`${pos}: el id "${p.id}" está duplicado.`);
    }
    seenIds.add(p.id);

    if (typeof p.name !== 'string' || p.name.trim() === '') {
      throw new Error(`${pos} (id: ${p.id}): falta o es inválida la propiedad "name".`);
    }

    if (p['id-dota'] === undefined || p['id-dota'] === null) {
      throw new Error(`${pos} (id: ${p.id}): falta la propiedad "id-dota".`);
    }

    const tickets = Number(p.tickets);
    if (!Number.isInteger(tickets) || tickets < 1) {
      throw new Error(
        `${pos} (id: ${p.id}): "tickets" debe ser un entero mayor que 0. ` +
        `Valor recibido: ${p.tickets}`
      );
    }

    validated.push({
      id:       p.id,
      name:     p.name.trim(),
      tickets:  tickets,
      'id-dota': p['id-dota'],
    });
  });

  return validated;
}

/* ══════════════════════════════════════════════════════════════
   3. CALCULATE STATISTICS
══════════════════════════════════════════════════════════════ */

/**
 * Calcula estadísticas generales de la lista de participantes.
 *
 * @param {Array<Object>} participants
 * @returns {{ totalParticipants: number, totalTickets: number }}
 */
function calculateStatistics(participants) {
  const totalTickets = participants.reduce(
    (sum, p) => sum + p.tickets,
    0
  );
  return {
    totalParticipants: participants.length,
    totalTickets,
  };
}

/* ══════════════════════════════════════════════════════════════
   4. SELECT WINNER (weighted / ponderado)
══════════════════════════════════════════════════════════════ */

/**
 * Selecciona un ganador mediante selección ponderada por tickets.
 *
 * Algoritmo:
 *  - Suma el total de tickets de los participantes disponibles.
 *  - Genera un número aleatorio entre 0 y totalTickets.
 *  - Recorre la lista restando tickets hasta que el acumulado
 *    supere el número aleatorio → ese participante es el ganador.
 *
 * Este método NO duplica físicamente los elementos;
 * es O(n) y funciona correctamente con miles de tickets.
 *
 * @param {Array<Object>} participants - Lista filtrada (sin excluidos).
 * @returns {Object} Participante ganador.
 */
function selectWinner(participants) {
  if (!participants || participants.length === 0) {
    throw new Error('No hay participantes disponibles para el sorteo.');
  }

  const totalTickets = participants.reduce(
    (sum, p) => sum + p.tickets,
    0
  );

  let random = Math.random() * totalTickets;

  for (const participant of participants) {
    random -= participant.tickets;
    if (random < 0) {
      return participant;
    }
  }

  // Fallback de seguridad (no debería alcanzarse con Math.random() correcto)
  return participants[participants.length - 1];
}

/* ══════════════════════════════════════════════════════════════
   5. BUILD SPIN SEQUENCE
══════════════════════════════════════════════════════════════ */

/**
 * Construye la secuencia de ítems que aparecerán en la ruleta.
 *
 * Estrategia:
 *  - Genera múltiples repeticiones de la lista completa de participantes
 *    para simular varias "vueltas" de la ruleta.
 *  - El ganador aparecerá en múltiples posiciones durante la animación,
 *    pero la posición final calculada siempre apuntará a la ÚLTIMA
 *    aparición del ganador en la secuencia.
 *  - Esto hace que la animación parezca aleatoria y no predecible.
 *
 * @param {Array<Object>} allParticipants - Lista completa (para la animación visual).
 * @param {Object}        winner          - Participante ganador ya seleccionado.
 * @param {number}        rounds          - Número de vueltas completas.
 * @returns {{ sequence: Array<Object>, winnerFinalIndex: number }}
 */
function buildSpinSequence(allParticipants, winner, rounds) {
  const sequence = [];

  // Generamos (rounds + 1) repeticiones completas de la lista
  // para asegurar suficiente recorrido visual.
  for (let r = 0; r <= rounds + 1; r++) {
    // Mezclamos ligeramente el orden en cada vuelta para que
    // no se vea idéntico en cada pasada (excepto la última).
    const shuffled = r < rounds
      ? shuffleArray([...allParticipants])
      : [...allParticipants];

    sequence.push(...shuffled);
  }

  // Añadimos una sección final con el ganador en una posición conocida.
  // Agregamos algunos participantes antes del ganador para que
  // la desaceleración se vea natural.
  const paddingBefore = Math.floor(allParticipants.length / 2);
  for (let i = 0; i < paddingBefore; i++) {
    const idx = i % allParticipants.length;
    sequence.push(allParticipants[idx]);
  }

  // Posición final del ganador
  const winnerFinalIndex = sequence.length;
  sequence.push(winner);

  // Padding después del ganador para que haya ítems debajo
  // del indicador central cuando la ruleta se detenga.
  const paddingAfter = Math.ceil(VISIBLE_ITEMS / 2) + 1;
  for (let i = 0; i < paddingAfter; i++) {
    const idx = (paddingBefore + 1 + i) % allParticipants.length;
    sequence.push(allParticipants[idx]);
  }

  return { sequence, winnerFinalIndex };
}

/**
 * Mezcla un array usando el algoritmo Fisher-Yates.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ══════════════════════════════════════════════════════════════
   6. CALCULATE FINAL POSITION
══════════════════════════════════════════════════════════════ */

/**
 * Calcula el desplazamiento exacto (translateY negativo) que debe
 * aplicarse al roulette-track para que el ganador quede perfectamente
 * alineado con el indicador central.
 *
 * Fórmula:
 *   finalTranslateY = -(winnerFinalIndex * ITEM_HEIGHT - centerOffset)
 *
 * Donde:
 *   centerOffset = posición Y del centro de la ventana de la ruleta
 *                = (VISIBLE_ITEMS / 2) * ITEM_HEIGHT - ITEM_HEIGHT / 2
 *                = mitad de la ventana, ajustada para centrar el ítem.
 *
 * @param {number} winnerFinalIndex - Índice del ganador en la secuencia.
 * @returns {number} Valor de translateY en píxeles (negativo).
 */
function calculateFinalPosition(winnerFinalIndex) {
  // Offset del centro de la ventana de la ruleta:
  // queremos que el ítem ganador quede centrado verticalmente.
  const centerOffset = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;

  // Posición absoluta del ganador desde el top del track
  const winnerAbsoluteTop = winnerFinalIndex * ITEM_HEIGHT;

  // translateY necesario para que el ganador quede en el centro
  const finalTranslateY = -(winnerAbsoluteTop - centerOffset);

  return finalTranslateY;
}

/* ══════════════════════════════════════════════════════════════
   7. RENDER ROULETTE TRACK
══════════════════════════════════════════════════════════════ */

/**
 * Inyecta los ítems de la secuencia en el DOM del roulette-track.
 * Utiliza un DocumentFragment para minimizar reflows.
 *
 * @param {Array<Object>} sequence         - Secuencia completa de ítems.
 * @param {number}        winnerFinalIndex - Índice del ganador (para clase especial).
 */
function renderRouletteTrack(sequence, winnerFinalIndex) {
  const fragment = document.createDocumentFragment();

  sequence.forEach((participant, index) => {
    const item = document.createElement('div');
    item.className = 'roulette-item';
    item.setAttribute('aria-hidden', 'true');

    // Nombre con protección contra overflow
    item.textContent = participant.name;
    item.title       = participant.name;

    // Marca especial al ítem ganador final
    if (index === winnerFinalIndex) {
      item.dataset.winnerFinal = 'true';
    }

    fragment.appendChild(item);
  });

  dom.rouletteTrack.innerHTML = '';
  dom.rouletteTrack.appendChild(fragment);

  // Posición inicial: mostrar el centro de la lista
  // para que no se vea vacío antes de girar.
  const initialIndex = Math.floor(sequence.length * 0.15);
  const initialY     = -(initialIndex * ITEM_HEIGHT - Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT);
  dom.rouletteTrack.style.transition = 'none';
  dom.rouletteTrack.style.transform  = `translate3d(0, ${initialY}px, 0)`;
}

/* ══════════════════════════════════════════════════════════════
   8. ANIMATE ROULETTE
══════════════════════════════════════════════════════════════ */

/**
 * Ejecuta la animación de la ruleta.
 *
 * La animación utiliza la Web Animations API (WAAPI) con una
 * curva de easing personalizada que simula aceleración inicial
 * y desaceleración natural al final (como una máquina real).
 *
 * IMPORTANTE: La posición final está matemáticamente calculada
 * para terminar EXACTAMENTE sobre el ganador. La animación
 * no decide el ganador; solo lo muestra.
 *
 * @param {number}   finalTranslateY - Posición final calculada.
 * @param {number}   duration        - Duración en ms.
 * @param {Function} onComplete      - Callback al terminar.
 */
function animateRoulette(finalTranslateY, duration, onComplete) {
  // Leemos la posición actual del track para partir desde ahí
  const currentTransform = dom.rouletteTrack.style.transform;
  const currentY = parseFloat(
    currentTransform.replace(/.*translate3d\(0,\s*([-\d.]+)px.*/, '$1')
  ) || 0;

  // Easing personalizado: arranque rápido → desaceleración pronunciada
  // cubic-bezier(0.12, 0.8, 0.2, 1.0) — simula inercia de ruleta
  const easing = 'cubic-bezier(0.12, 0.8, 0.2, 1.0)';

  // Intervalo de sonido durante el giro
  let tickInterval = null;
  let tickDelay    = 60; // ms entre ticks (empieza rápido)

  function scheduleTick() {
    if (state.current !== AppState.SPINNING) return;
    audio.tick();
    // Aumentamos el delay progresivamente para simular desaceleración
    tickDelay = Math.min(tickDelay * 1.045, 600);
    tickInterval = setTimeout(scheduleTick, tickDelay);
  }

  scheduleTick();

  // Usamos la Web Animations API para control preciso
  const animation = dom.rouletteTrack.animate(
    [
      { transform: `translate3d(0, ${currentY}px, 0)` },
      { transform: `translate3d(0, ${finalTranslateY}px, 0)` },
    ],
    {
      duration,
      easing,
      fill: 'forwards',
    }
  );

  animation.onfinish = () => {
    // Detenemos los ticks
    clearTimeout(tickInterval);

    // Fijamos la posición final en el estilo inline para que
    // no haya salto al remover la animación.
    dom.rouletteTrack.style.transform =
      `translate3d(0, ${finalTranslateY}px, 0)`;

    // Resaltamos el ítem ganador en la ruleta
    highlightWinnerItem();

    onComplete();
  };
}

/**
 * Aplica la clase de brillo al ítem ganador final en el track.
 */
function highlightWinnerItem() {
  const winnerEl = dom.rouletteTrack.querySelector(
    '[data-winner-final="true"]'
  );
  if (winnerEl) {
    winnerEl.classList.add('roulette-item--winner-glow');
    winnerEl.classList.add('roulette-item--center');
  }
}

/* ══════════════════════════════════════════════════════════════
   9. SHOW WINNER
══════════════════════════════════════════════════════════════ */

/**
 * Muestra el modal con la información del ganador.
 * Se llama DESPUÉS de que la animación termina.
 *
 * @param {Object} winner - Participante ganador.
 */
function showWinner(winner) {
  dom.winnerName.textContent   = winner.name;
  dom.winnerId.textContent     = winner['id-dota'];
  dom.btnSteam.href            = getSteamUrl(winner);
  dom.btnCopyText.textContent  = 'Copiar ID';

  dom.winnerModal.classList.remove('d-none');

  // Efecto de confeti
  launchConfetti();

  // Sonido de fanfare
  audio.winner();

  // Actualizar estado
  setState(AppState.SHOWING_WINNER);
}

/**
 * Lanza el efecto de confeti usando canvas-confetti.
 */
function launchConfetti() {
  if (typeof confetti !== 'function') return;

  const colors = ['#5b8cff', '#7b5fff', '#f0c040', '#ffdd70', '#39d98a'];

  confetti({
    particleCount: 120,
    spread:        80,
    origin:        { y: 0.55 },
    colors,
    zIndex:        2000,
  });

  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle:         60,
      spread:        55,
      origin:        { x: 0, y: 0.6 },
      colors,
      zIndex:        2000,
    });
    confetti({
      particleCount: 60,
      angle:         120,
      spread:        55,
      origin:        { x: 1, y: 0.6 },
      colors,
      zIndex:        2000,
    });
  }, 300);
}

/* ══════════════════════════════════════════════════════════════
   10. COPY WINNER ID
══════════════════════════════════════════════════════════════ */

/**
 * Copia el id-dota del ganador al portapapeles.
 * Muestra feedback visual temporal.
 */
async function copyWinnerId() {
  if (!state.currentWinner) return;

  const idValue = String(state.currentWinner['id-dota']);

  try {
    await navigator.clipboard.writeText(idValue);
    dom.btnCopyText.textContent = '✓ ID copiado';
    dom.btnCopyId.style.background =
      'linear-gradient(135deg, #39d98a, #20c070)';

    setTimeout(() => {
      dom.btnCopyText.textContent = 'Copiar ID';
      dom.btnCopyId.style.background = '';
    }, 2500);

  } catch (_) {
    // Fallback para navegadores sin soporte de clipboard API
    try {
      const textarea = document.createElement('textarea');
      textarea.value = idValue;
      textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      dom.btnCopyText.textContent = '✓ ID copiado';
      setTimeout(() => {
        dom.btnCopyText.textContent = 'Copiar ID';
      }, 2500);
    } catch (_2) {
      dom.btnCopyText.textContent = '✗ Error al copiar';
      setTimeout(() => {
        dom.btnCopyText.textContent = 'Copiar ID';
      }, 2500);
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   11. HISTORY MANAGEMENT
══════════════════════════════════════════════════════════════ */

/**
 * Guarda el ganador en el historial de la sesión y en localStorage.
 *
 * @param {Object} winner - Participante ganador.
 */
function saveWinnerToHistory(winner) {
  const entry = {
    id:       winner.id,
    name:     winner.name,
    idDota:   winner['id-dota'],
    timestamp: Date.now(),
  };

  state.history.push(entry);
  persistHistory();
  renderHistory();
}

/**
 * Persiste el historial en localStorage.
 */
function persistHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  } catch (_) {
    // localStorage puede no estar disponible (modo privado, etc.)
  }
}

/**
 * Carga el historial desde localStorage al iniciar la app.
 */
function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        state.history = parsed;
      }
    }
  } catch (_) {
    state.history = [];
  }
}

/**
 * Limpia el historial de la sesión y de localStorage.
 */
function clearHistory() {
  state.history = [];
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (_) {}
  renderHistory();
  renderParticipantsList();
}

/* ══════════════════════════════════════════════════════════════
   12. RENDER FUNCTIONS
══════════════════════════════════════════════════════════════ */

/**
 * Renderiza la lista de participantes con nombre, tickets y probabilidad.
 */
function renderParticipantsList() {
  const { totalTickets } = calculateStatistics(state.participants);

  // IDs de ganadores anteriores (para marcar excluidos si aplica)
  const winnerIds = new Set(state.history.map(h => h.id));
  const excludeActive = dom.chkExclude.checked;

  const fragment = document.createDocumentFragment();

  state.participants.forEach((p, index) => {
    const probability = ((p.tickets / totalTickets) * 100).toFixed(2);
    const isWinner    = winnerIds.has(p.id);
    const isExcluded  = excludeActive && isWinner;

    const li = document.createElement('li');
    li.className = 'participant-item' +
      (isWinner   ? ' is-winner'   : '') +
      (isExcluded ? ' is-excluded' : '');
    li.setAttribute('role', 'listitem');

    li.innerHTML = `
      <span class="participant-rank">${String(index + 1).padStart(2, '0')}</span>
      <span class="participant-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
      <span class="participant-tickets">
        ${p.tickets} ${p.tickets === 1 ? 'ticket' : 'tickets'}
      </span>
      <div class="prob-bar-wrap" title="${probability}%">
        <div class="prob-bar-fill" style="width: ${probability}%"></div>
      </div>
      <span class="participant-prob">${probability}%</span>
    `;

    fragment.appendChild(li);
  });

  dom.participantsList.innerHTML = '';
  dom.participantsList.appendChild(fragment);
}

/**
 * Renderiza el historial de ganadores.
 */
function renderHistory() {
  if (state.history.length === 0) {
    dom.historyEmpty.classList.remove('d-none');
    // Limpiar entradas anteriores excepto el mensaje vacío
    const items = dom.historyList.querySelectorAll('.history-item');
    items.forEach(el => el.remove());
    return;
  }

  dom.historyEmpty.classList.add('d-none');

  // Re-renderizar desde cero
  const existingItems = dom.historyList.querySelectorAll('.history-item');
  existingItems.forEach(el => el.remove());

  const fragment = document.createDocumentFragment();

  // Mostrar en orden inverso (más reciente primero)
  [...state.history].reverse().forEach((entry, index) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('role', 'listitem');

    const num = state.history.length - index;

    li.innerHTML = `
      <span class="history-num">#${num}</span>
      <div class="history-info">
        <div class="history-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
        <div class="history-id">ID: ${escapeHtml(String(entry.idDota))}</div>
      </div>
    `;

    fragment.appendChild(li);
  });

  dom.historyList.insertBefore(fragment, dom.historyEmpty);
}

/**
 * Actualiza los contadores de estadísticas en los paneles.
 */
function updateStatCounters() {
  const { totalParticipants, totalTickets } = calculateStatistics(state.participants);

  dom.tpParticipants.textContent  = totalParticipants;
  dom.tpTickets.textContent       = totalTickets;
  dom.statParticipants.textContent = totalParticipants;
  dom.statTickets.textContent      = totalTickets;
}

/**
 * Escapa caracteres HTML para prevenir XSS al inyectar innerHTML.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

/* ══════════════════════════════════════════════════════════════
   13. STATE MANAGEMENT
══════════════════════════════════════════════════════════════ */

/**
 * Cambia el estado de la aplicación y actualiza la UI en consecuencia.
 * @param {AppState} newState
 */
function setState(newState) {
  state.current = newState;

  switch (newState) {

    case AppState.IDLE:
      dom.btnSpin.disabled = false;
      dom.btnSpin.innerHTML = '<i class="bi bi-play-fill"></i> INICIAR SORTEO';
      dom.spinningBadge.classList.add('d-none');
      dom.rouletteWidget.classList.remove('is-spinning');
      setStatus('ready', 'Listo');
      break;

    case AppState.SPINNING:
      dom.btnSpin.disabled = true;
      dom.btnSpin.innerHTML =
        '<span class="loading-spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px"></span> SORTEANDO...';
      dom.spinningBadge.classList.remove('d-none');
      dom.resultInfo.classList.add('d-none');
      dom.rouletteWidget.classList.add('is-spinning');
      setStatus('spinning', 'Sorteando...');
      break;

    case AppState.SHOWING_WINNER:
      dom.btnSpin.disabled = false;
      dom.btnSpin.innerHTML = '<i class="bi bi-play-fill"></i> INICIAR SORTEO';
      dom.spinningBadge.classList.add('d-none');
      dom.resultInfo.classList.remove('d-none');
      dom.rouletteWidget.classList.remove('is-spinning');
      setStatus('done', 'Ganador revelado');
      break;
  }
}

/**
 * Actualiza el indicador de estado en el header.
 * @param {'ready'|'spinning'|'done'|'error'} type
 * @param {string} text
 */
function setStatus(type, text) {
  dom.statusDot.className  = `status-dot ${type}`;
  dom.statusText.textContent = text;
}

/* ══════════════════════════════════════════════════════════════
   14. MAIN SPIN ORCHESTRATOR
══════════════════════════════════════════════════════════════ */

/**
 * Orquesta el sorteo completo en el orden correcto y garantizado:
 *
 *   PASO 1 → Determinar participantes disponibles
 *   PASO 2 → Seleccionar ganador (ANTES de cualquier animación)
 *   PASO 3 → Construir secuencia visual
 *   PASO 4 → Calcular posición final exacta
 *   PASO 5 → Renderizar track
 *   PASO 6 → Animar ruleta hasta la posición del ganador
 *   PASO 7 → Mostrar ganador + guardar historial
 *
 * La animación NUNCA decide el ganador.
 * El ganador se determina en el PASO 2 y la animación
 * simplemente termina en su posición.
 */
function startSpin() {
  // Guardia: no iniciar si ya está girando
  if (state.current === AppState.SPINNING) return;

  // ── PASO 1: Determinar participantes disponibles ──────────────
  const excludeWinners = dom.chkExclude.checked;
  const winnerIds      = new Set(state.history.map(h => h.id));

  const availableParticipants = excludeWinners
    ? state.participants.filter(p => !winnerIds.has(p.id))
    : state.participants;

  if (availableParticipants.length === 0) {
    showNoParticipantsAlert();
    return;
  }

  // ── PASO 2: Seleccionar ganador (ponderado, ANTES de animar) ──
  const winner = selectWinner(availableParticipants);
  state.currentWinner = winner;

  // ── PASO 3: Construir secuencia visual ────────────────────────
  const rounds = randomInt(SPIN_ROUNDS_MIN, SPIN_ROUNDS_MAX);
  const { sequence, winnerFinalIndex } = buildSpinSequence(
    state.participants, // usamos TODOS para la animación visual
    winner,
    rounds
  );

  // ── PASO 4: Calcular posición final exacta ────────────────────
  const finalTranslateY = calculateFinalPosition(winnerFinalIndex);

  // ── PASO 5: Renderizar track ──────────────────────────────────
  renderRouletteTrack(sequence, winnerFinalIndex);

  // ── PASO 6: Cambiar estado y animar ──────────────────────────
  setState(AppState.SPINNING);

  const duration = randomInt(SPIN_DURATION_MIN, SPIN_DURATION_MAX);

  // Pequeño delay para que el DOM se actualice antes de animar
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animateRoulette(finalTranslateY, duration, () => {

        // ── PASO 7: Mostrar ganador y guardar historial ─────────
        saveWinnerToHistory(winner);
        renderParticipantsList();
        renderHistory();

        // Delay breve para que el usuario vea la ruleta detenida
        setTimeout(() => {
          showWinner(winner);
        }, 600);
      });
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   15. RESET
══════════════════════════════════════════════════════════════ */

/**
 * Reinicia el estado visual de la ruleta manteniendo:
 *  - participantes cargados
 *  - historial
 *  - configuración (checkbox excluir)
 */
function resetRoulette() {
  if (state.current === AppState.SPINNING) return;

  state.currentWinner = null;

  // Limpiar el track y mostrar estado inicial
  dom.rouletteTrack.style.transition = 'none';
  dom.rouletteTrack.style.transform  = 'translate3d(0, 0, 0)';
  dom.rouletteTrack.innerHTML        = '';

  // Renderizar una vista previa estática de los participantes
  renderInitialTrack();

  dom.resultInfo.classList.add('d-none');
  dom.winnerModal.classList.add('d-none');

  setState(AppState.IDLE);
}

/**
 * Renderiza una vista previa estática de los participantes
 * en la ruleta antes del primer sorteo.
 */
function renderInitialTrack() {
  if (state.participants.length === 0) return;

  // Repetimos la lista para llenar la ventana visible
  const preview = [];
  const repeats = Math.ceil((VISIBLE_ITEMS + 2) / state.participants.length) + 1;

  for (let r = 0; r < repeats; r++) {
    preview.push(...state.participants);
  }

  const fragment = document.createDocumentFragment();

  preview.forEach(p => {
    const item = document.createElement('div');
    item.className   = 'roulette-item';
    item.textContent = p.name;
    item.title       = p.name;
    item.setAttribute('aria-hidden', 'true');
    fragment.appendChild(item);
  });

  dom.rouletteTrack.innerHTML = '';
  dom.rouletteTrack.appendChild(fragment);

  // Centrar en el medio de la lista preview
  const centerIndex = Math.floor(preview.length / 2);
  const initialY    = -(centerIndex * ITEM_HEIGHT - Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT);
  dom.rouletteTrack.style.transform = `translate3d(0, ${initialY}px, 0)`;
}

/* ══════════════════════════════════════════════════════════════
   16. ALERTS & NOTIFICATIONS
══════════════════════════════════════════════════════════════ */

/**
 * Muestra el mensaje de "no quedan participantes disponibles".
 */
function showNoParticipantsAlert() {
  // Reutilizamos el modal del ganador con un mensaje diferente
  dom.winnerName.textContent  = 'Sin participantes disponibles';
  dom.winnerId.textContent    = '—';
  dom.btnSteam.href           = '#';
  dom.btnCopyText.textContent = 'Copiar ID';

  dom.winnerModal.querySelector('.winner-modal-title').textContent =
    '⚠️ ATENCIÓN';
  dom.winnerModal.querySelector('.winner-emoji:first-child').textContent = '';
  dom.winnerModal.querySelector('.winner-emoji:last-child').textContent  = '';
  dom.winnerModal.querySelector('.winner-id-label').textContent =
    'No quedan participantes disponibles para realizar otro sorteo.';
  dom.winnerId.textContent = '';

  dom.btnCopyId.style.display   = 'none';
  dom.btnSteam.style.display    = 'none';

  dom.winnerModal.classList.remove('d-none');
}

/**
 * Restaura el modal del ganador a su estado normal.
 */
function restoreWinnerModal() {
  dom.winnerModal.querySelector('.winner-modal-title').textContent = '¡GANADOR!';
  dom.winnerModal.querySelector('.winner-emoji:first-child').textContent = '🎉';
  dom.winnerModal.querySelector('.winner-emoji:last-child').textContent  = '🎉';
  dom.winnerModal.querySelector('.winner-id-label').textContent = 'ID DOTA';
  dom.btnCopyId.style.display  = '';
  dom.btnSteam.style.display   = '';
}

/**
 * Muestra el overlay de error con un mensaje descriptivo.
 * @param {string} message
 */
function showError(message) {
  dom.loadingOverlay.classList.add('d-none');
  dom.appMain.classList.add('d-none');
  dom.errorMessage.textContent = message;
  dom.errorState.classList.remove('d-none');
  setStatus('error', 'Error');
}

/* ══════════════════════════════════════════════════════════════
   17. SOUND TOGGLE
══════════════════════════════════════════════════════════════ */

/**
 * Alterna el estado del sonido y actualiza el ícono del botón.
 */
function toggleSound() {
  state.soundEnabled = !state.soundEnabled;

  if (state.soundEnabled) {
    dom.btnSound.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
    dom.btnSound.classList.add('active');
    dom.btnSound.setAttribute('aria-label', 'Desactivar sonido');
    dom.btnSound.title = 'Sonido activado';
  } else {
    dom.btnSound.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
    dom.btnSound.classList.remove('active');
    dom.btnSound.setAttribute('aria-label', 'Activar sonido');
    dom.btnSound.title = 'Sonido desactivado';
  }
}

/* ══════════════════════════════════════════════════════════════
   18. UTILITIES
══════════════════════════════════════════════════════════════ */

/**
 * Genera un entero aleatorio entre min y max (ambos inclusivos).
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ══════════════════════════════════════════════════════════════
   19. INIT APP
══════════════════════════════════════════════════════════════ */

/**
 * Inicializa la aplicación después de cargar y validar los participantes.
 * Registra todos los event listeners.
 */
function initApp() {
  // Cargar historial persistido
  loadHistory();

  // Actualizar contadores
  updateStatCounters();

  // Renderizar paneles
  renderParticipantsList();
  renderHistory();

  // Renderizar vista previa de la ruleta
  renderInitialTrack();

  // Ocultar loading y mostrar app
  dom.loadingOverlay.classList.add('fade-out');
  setTimeout(() => {
    dom.loadingOverlay.classList.add('d-none');
  }, 450);

  dom.appMain.classList.remove('d-none');

  // Habilitar botón de sorteo
  dom.btnSpin.disabled = false;
  setState(AppState.IDLE);

  // ── Event Listeners ──────────────────────────────────────────

  // Botón principal de sorteo
  dom.btnSpin.addEventListener('click', () => {
    if (state.current !== AppState.SPINNING) {
      restoreWinnerModal();
      startSpin();
    }
  });

  // Botón de nuevo sorteo (reset visual)
  dom.btnReset.addEventListener('click', () => {
    restoreWinnerModal();
    resetRoulette();
  });

  // Toggle de sonido
  dom.btnSound.addEventListener('click', toggleSound);

  // Checkbox excluir ganadores → re-renderizar lista
  dom.chkExclude.addEventListener('change', renderParticipantsList);

  // Copiar ID del ganador
  dom.btnCopyId.addEventListener('click', copyWinnerId);

  // Cerrar modal
  dom.btnCloseModal.addEventListener('click', () => {
    dom.winnerModal.classList.add('d-none');
    restoreWinnerModal();
  });

  // Cerrar modal al hacer clic fuera del box
  dom.winnerModal.addEventListener('click', (e) => {
    if (e.target === dom.winnerModal) {
      dom.winnerModal.classList.add('d-none');
      restoreWinnerModal();
    }
  });

  // Cerrar modal con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dom.winnerModal.classList.contains('d-none')) {
      dom.winnerModal.classList.add('d-none');
      restoreWinnerModal();
    }
  });

  // Limpiar historial
  dom.btnClearHistory.addEventListener('click', () => {
    if (confirm('¿Seguro que deseas limpiar el historial de ganadores?')) {
      clearHistory();
    }
  });

  // Soporte de teclado para el botón de sorteo (Enter / Space)
  dom.btnSpin.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !dom.btnSpin.disabled) {
      e.preventDefault();
      dom.btnSpin.click();
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   20. BOOTSTRAP — Entry Point
══════════════════════════════════════════════════════════════ */

/**
 * Punto de entrada de la aplicación.
 * Se ejecuta cuando el DOM está completamente cargado.
 */
document.addEventListener('DOMContentLoaded', () => {
  loadParticipants();
});

