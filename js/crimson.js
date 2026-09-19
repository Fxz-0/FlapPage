/**
 * ═══════════════════════════════════════════════════════════════
 * SORTEO CARMESI — crimson.js
 * Ruleta vertical con selección ponderada por tickets.
 * Los participantes se obtienen desde el Apps Script de Google Sheets.
 *
 * Flujo:
 *   1. loadParticipants()       → fetch + normaliza + valida el JSON
 *   2. selectWinner()           → selección ponderada (ANTES de animar)
 *   3. buildSpinSequence()      → construye la secuencia visual
 *   4. calculateFinalPosition() → calcula el translateY exacto
 *   5. animateRoulette()        → anima hasta esa posición
 *   6. showWinner()             → muestra el modal con el ganador
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════════════ */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyUpp60xm4ywKHUedtWdszTAcgxvk5Nm57k3giiteo4vPbwTbBlXerg4yAS13mKM1n9/exec";

/** Valores válidos para el estado de verificación. */
const VERIFIED_VALUES = ['SI', 'No', 'Duda'];

/** Solo los participantes "SI" entran al sorteo ponderado. */
function isEligible(p) {
  return p.verified === 'SI';
}

const ITEM_HEIGHT = (() => {
  const val = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--roulette-item-height').trim(),
    10
  );
  return isNaN(val) ? 62 : val;
})();

const VISIBLE_ITEMS = (() => {
  const val = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--roulette-visible-items').trim(),
    10
  );
  return isNaN(val) ? 7 : val;
})();

const SPIN_ROUNDS_MIN = 5;
const SPIN_ROUNDS_MAX = 8;
const SPIN_DURATION_MIN = 5500;
const SPIN_DURATION_MAX = 7500;
const HISTORY_KEY = 'sorteoCarmesiHistory';

/**
 * Tope de "vueltas" visuales de la ruleta. Con listas grandes (500+
 * tickets repartidos entre muchos participantes) construir la secuencia
 * repitiendo la lista completa varias veces puede crear miles de nodos
 * en el DOM y trabar la animación. Limitamos cuántos participantes
 * distintos se repiten por vuelta para que el track nunca crezca sin
 * control, sin afectar la probabilidad real (el ganador ya fue
 * decidido en el paso 2, esto solo es la vista).
 */
const MAX_TRACK_ITEMS = 260;

function getSteamUrl(participant) {
  if (!participant.steamId) return '#';
  return `https://steamcommunity.com/profiles/[U:1:${participant.steamId}]`;
}

/* ══════════════════════════════════════════════════════════════
   ESTADO
══════════════════════════════════════════════════════════════ */

const AppState = Object.freeze({
  IDLE: 'IDLE',
  SPINNING: 'SPINNING',
  SHOWING_WINNER: 'SHOWING_WINNER',
});

const state = {
  current: AppState.IDLE,
  participants: [],   // todos (para mostrar en el panel)
  eligible: [],        // solo verified === 'SI' (para la ruleta)
  currentWinner: null,
  history: [],
  expandedIds: new Set(),
};

/* ══════════════════════════════════════════════════════════════
   DOM
══════════════════════════════════════════════════════════════ */

const dom = {
  sorteoLoading: document.getElementById('sorteoLoading'),
  sorteoError: document.getElementById('sorteoError'),
  sorteoErrorMsg: document.getElementById('sorteoErrorMsg'),
  btnRetry: document.getElementById('btnRetry'),
  appMain: document.getElementById('appMain'),

  tpParticipants: document.getElementById('tpParticipants'),
  tpTickets: document.getElementById('tpTickets'),

  rouletteWidget: document.querySelector('.roulette-widget'),
  rouletteTrack: document.getElementById('rouletteTrack'),

  spinningBadge: document.getElementById('spinningBadge'),
  resultInfo: document.getElementById('resultInfo'),

  btnSpin: document.getElementById('btnSpin'),
  btnReset: document.getElementById('btnReset'),
  chkExclude: document.getElementById('chkExclude'),

  statParticipants: document.getElementById('statParticipants'),
  statTickets: document.getElementById('statTickets'),
  participantsList: document.getElementById('participantsList'),

  historyList: document.getElementById('historyList'),
  historyEmpty: document.getElementById('historyEmpty'),
  btnClearHistory: document.getElementById('btnClearHistory'),

  winnerModal: document.getElementById('winnerModal'),
  winnerModalTitle: document.getElementById('winnerModalTitle'),
  winnerIdLabel: document.getElementById('winnerIdLabel'),
  winnerActions: document.getElementById('winnerActions'),
  winnerName: document.getElementById('winnerName'),
  winnerId: document.getElementById('winnerId'),
  btnCopyId: document.getElementById('btnCopyId'),
  btnCopyText: document.getElementById('btnCopyText'),
  btnSteam: document.getElementById('btnSteam'),
  btnCloseModal: document.getElementById('btnCloseModal'),
};

/* ══════════════════════════════════════════════════════════════
   1. CARGA DE PARTICIPANTES (Google Sheets)
══════════════════════════════════════════════════════════════ */

async function loadParticipants() {
  showLoading();

  try {
    const response = await fetch(API_URL, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: no se pudo contactar la hoja de participantes.`);
    }

    const raw = await response.json();
    const participants = normalizeParticipants(raw);

    state.participants = participants;
    state.eligible = participants.filter(isEligible);

    initApp();
  } catch (err) {
    showError(
      (err && err.message) ||
      'Error desconocido al cargar los participantes. Verifica tu conexión e inténtalo de nuevo.'
    );
  }
}

/**
 * Normaliza y valida el JSON recibido del Apps Script.
 * Acepta tanto un array plano como { participants: [...] }.
 * Campos esperados por fila: id, name, tickets, steamId, verified, comment.
 */
function normalizeParticipants(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data && data.participants) ? data.participants : null;

  if (!list) {
    throw new Error('El formato recibido no es válido: se esperaba una lista de participantes.');
  }
  if (list.length === 0) {
    throw new Error('La lista de participantes está vacía.');
  }

  const seen = new Set();
  const result = [];

  list.forEach((p, index) => {
    const pos = `Fila #${index + 1}`;

    const id = p.id !== undefined && p.id !== null && p.id !== '' ? String(p.id) : `row-${index}`;
    if (seen.has(id)) return; // ignoramos duplicados en vez de romper el sorteo completo
    seen.add(id);

    const name = typeof p.name === 'string' && p.name.trim() !== '' ? p.name.trim() : null;
    if (!name) return; // fila sin nombre: se omite

    const ticketsNum = Number(p.tickets);
    const tickets = Number.isFinite(ticketsNum) && ticketsNum > 0 ? Math.floor(ticketsNum) : 0;

    const verifiedRaw = String(p.verified ?? '').trim();
    const verified = VERIFIED_VALUES.includes(verifiedRaw) ? verifiedRaw : 'Duda';

    result.push({
      id,
      name,
      tickets,
      steamId: p.steamId !== undefined && p.steamId !== null ? String(p.steamId) : '',
      verified,
      comment: typeof p.comment === 'string' ? p.comment.trim() : (p.comment ? String(p.comment) : ''),
    });
  });

  if (result.length === 0) {
    throw new Error('Ningún participante tiene los datos mínimos requeridos (nombre y tickets).');
  }

  return result;
}

/* ══════════════════════════════════════════════════════════════
   2. ESTADÍSTICAS
══════════════════════════════════════════════════════════════ */

function calculateStatistics(participants) {
  const totalTickets = participants.reduce((sum, p) => sum + p.tickets, 0);
  return { totalParticipants: participants.length, totalTickets };
}

/* ══════════════════════════════════════════════════════════════
   3. SELECCIÓN PONDERADA
   O(n) respecto a la cantidad de participantes, sin importar cuántos
   tickets tenga cada uno (soporta cientos de tickets sin problema).
══════════════════════════════════════════════════════════════ */

function selectWinner(participants) {
  if (!participants || participants.length === 0) {
    throw new Error('No hay participantes disponibles para el sorteo.');
  }

  const totalTickets = participants.reduce((sum, p) => sum + p.tickets, 0);

  if (totalTickets <= 0) {
    // Nadie tiene tickets asignados: sorteo uniforme como respaldo.
    return participants[randomInt(0, participants.length - 1)];
  }

  let random = Math.random() * totalTickets;

  for (const participant of participants) {
    random -= participant.tickets;
    if (random < 0) return participant;
  }

  return participants[participants.length - 1];
}

/* ══════════════════════════════════════════════════════════════
   4. SECUENCIA VISUAL DE LA RULETA
══════════════════════════════════════════════════════════════ */

function buildSpinSequence(allParticipants, winner, rounds) {
  const pool = allParticipants.length > 0 ? allParticipants : [winner];
  const sequence = [];

  // Con muchos participantes, evitamos generar un track gigantesco:
  // usamos una muestra representativa por vuelta en vez de la lista
  // completa cuando esta es muy grande.
  const perRound = Math.min(pool.length, Math.max(VISIBLE_ITEMS * 3, Math.floor(MAX_TRACK_ITEMS / (rounds + 2))));

  for (let r = 0; r <= rounds; r++) {
    const shuffled = shuffleArray([...pool]).slice(0, perRound);
    sequence.push(...shuffled);
  }

  const paddingBefore = Math.min(pool.length, Math.ceil(VISIBLE_ITEMS / 2) + 2);
  for (let i = 0; i < paddingBefore; i++) {
    sequence.push(pool[i % pool.length]);
  }

  const winnerFinalIndex = sequence.length;
  sequence.push(winner);

  const paddingAfter = Math.ceil(VISIBLE_ITEMS / 2) + 1;
  for (let i = 0; i < paddingAfter; i++) {
    sequence.push(pool[(paddingBefore + 1 + i) % pool.length]);
  }

  return { sequence, winnerFinalIndex };
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ══════════════════════════════════════════════════════════════
   5. POSICIÓN FINAL
══════════════════════════════════════════════════════════════ */

function calculateFinalPosition(winnerFinalIndex) {
  const centerOffset = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;
  const winnerAbsoluteTop = winnerFinalIndex * ITEM_HEIGHT;
  return -(winnerAbsoluteTop - centerOffset);
}

/* ══════════════════════════════════════════════════════════════
   6. RENDER DEL TRACK
══════════════════════════════════════════════════════════════ */

function renderRouletteTrack(sequence, winnerFinalIndex) {
  const fragment = document.createDocumentFragment();

  sequence.forEach((participant, index) => {
    const item = document.createElement('div');
    item.className = 'roulette-item';
    item.setAttribute('aria-hidden', 'true');
    item.textContent = participant.name;
    item.title = participant.name;

    if (index === winnerFinalIndex) {
      item.dataset.winnerFinal = 'true';
    }

    fragment.appendChild(item);
  });

  dom.rouletteTrack.innerHTML = '';
  dom.rouletteTrack.appendChild(fragment);

  const initialIndex = Math.floor(sequence.length * 0.15);
  const initialY = -(initialIndex * ITEM_HEIGHT - Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT);
  dom.rouletteTrack.style.transition = 'none';
  dom.rouletteTrack.style.transform = `translate3d(0, ${initialY}px, 0)`;
}

/**
 * Vista previa estática de la ruleta antes del primer sorteo
 * y tras cada reinicio. Nunca deja el track vacío: si no hay
 * elegibles, cae de nuevo a la lista completa de participantes.
 */
function renderInitialTrack() {
  const source = state.eligible.length > 0 ? state.eligible : state.participants;
  if (!source || source.length === 0) return;

  const needed = VISIBLE_ITEMS + 4;
  const preview = [];
  const repeats = Math.max(1, Math.ceil(needed / source.length) + 1);

  for (let r = 0; r < repeats; r++) {
    preview.push(...source);
  }

  const fragment = document.createDocumentFragment();
  preview.forEach(p => {
    const item = document.createElement('div');
    item.className = 'roulette-item';
    item.textContent = p.name;
    item.title = p.name;
    item.setAttribute('aria-hidden', 'true');
    fragment.appendChild(item);
  });

  dom.rouletteTrack.innerHTML = '';
  dom.rouletteTrack.appendChild(fragment);

  const centerIndex = Math.floor(preview.length / 2);
  const initialY = -(centerIndex * ITEM_HEIGHT - Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT);
  dom.rouletteTrack.style.transition = 'none';
  dom.rouletteTrack.style.transform = `translate3d(0, ${initialY}px, 0)`;
}

/* ══════════════════════════════════════════════════════════════
   7. ANIMACIÓN
══════════════════════════════════════════════════════════════ */

function animateRoulette(finalTranslateY, duration, onComplete) {
  const currentTransform = dom.rouletteTrack.style.transform;
  const currentY = parseFloat(
    currentTransform.replace(/.*translate3d\(0,\s*([-\d.]+)px.*/, '$1')
  ) || 0;

  const easing = 'cubic-bezier(0.12, 0.8, 0.2, 1.0)';

  const animation = dom.rouletteTrack.animate(
    [
      { transform: `translate3d(0, ${currentY}px, 0)` },
      { transform: `translate3d(0, ${finalTranslateY}px, 0)` },
    ],
    { duration, easing, fill: 'forwards' }
  );

  animation.onfinish = () => {
    dom.rouletteTrack.style.transform = `translate3d(0, ${finalTranslateY}px, 0)`;
    highlightWinnerItem();
    onComplete();
  };
}

function highlightWinnerItem() {
  const winnerEl = dom.rouletteTrack.querySelector('[data-winner-final="true"]');
  if (winnerEl) {
    winnerEl.classList.add('roulette-item--winner-glow', 'roulette-item--center');
  }
}

/* ══════════════════════════════════════════════════════════════
   8. MODAL DE GANADOR
══════════════════════════════════════════════════════════════ */

function showWinner(winner) {
  dom.winnerName.textContent = winner.name;

  if (winner.steamId) {
    dom.winnerId.textContent = winner.steamId;
    dom.btnSteam.href = getSteamUrl(winner);
    dom.winnerId.parentElement.classList.remove('d-none');
    dom.btnSteam.classList.remove('d-none');
  } else {
    dom.winnerId.parentElement.classList.add('d-none');
    dom.btnSteam.classList.add('d-none');
  }

  dom.btnCopyText.textContent = 'Copiar ID';
  dom.winnerModal.classList.remove('d-none');

  launchConfetti();
  setState(AppState.SHOWING_WINNER);
}

function launchConfetti() {
  if (typeof confetti !== 'function') return;

  const colors = ['#8928df', '#ab70f6', '#ffd100', '#fdf1c8', '#ef4a5a'];

  confetti({ particleCount: 110, spread: 80, origin: { y: 0.55 }, colors, zIndex: 2000 });
  setTimeout(() => {
    confetti({ particleCount: 55, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors, zIndex: 2000 });
    confetti({ particleCount: 55, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors, zIndex: 2000 });
  }, 300);
}

function showNoParticipantsAlert() {
  dom.winnerModalTitle.textContent = 'ATENCIÓN';
  dom.winnerName.textContent = 'Sin participantes disponibles';
  dom.winnerIdLabel.textContent = 'No quedan participantes elegibles para otro sorteo.';
  dom.winnerId.textContent = '';
  dom.winnerActions.classList.add('d-none');
  dom.winnerModal.classList.remove('d-none');
}

function restoreWinnerModal() {
  dom.winnerModalTitle.textContent = '¡GANADOR!';
  dom.winnerIdLabel.textContent = 'ID DOTA';
  dom.winnerId.parentElement.classList.remove('d-none');
  dom.winnerActions.classList.remove('d-none');
  dom.btnSteam.classList.remove('d-none');
}

async function copyWinnerId() {
  if (!state.currentWinner) return;
  const idValue = String(state.currentWinner.steamId || '');
  if (!idValue) return;

  try {
    await navigator.clipboard.writeText(idValue);
    flashCopyFeedback('ID copiado');
  } catch (_) {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = idValue;
      textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      flashCopyFeedback('ID copiado');
    } catch (_2) {
      flashCopyFeedback('Error al copiar');
    }
  }
}

function flashCopyFeedback(text) {
  dom.btnCopyText.textContent = text;
  setTimeout(() => { dom.btnCopyText.textContent = 'Copiar ID'; }, 2200);
}

/* ══════════════════════════════════════════════════════════════
   9. HISTORIAL
══════════════════════════════════════════════════════════════ */

function saveWinnerToHistory(winner) {
  state.history.push({
    id: winner.id,
    name: winner.name,
    steamId: winner.steamId,
    timestamp: Date.now(),
  });
  persistHistory();
  renderHistory();
}

function persistHistory() {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history));
  } catch (_) { /* localStorage no disponible: seguimos solo en memoria */ }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) state.history = parsed;
    }
  } catch (_) {
    state.history = [];
  }
}

function clearHistory() {
  state.history = [];
  try { localStorage.removeItem(HISTORY_KEY); } catch (_) {}
  renderHistory();
  renderParticipantsList();
}

/* ══════════════════════════════════════════════════════════════
   10. RENDER: LISTA DE PARTICIPANTES (acordeón)
══════════════════════════════════════════════════════════════ */

const VERIFIED_LABEL = { SI: 'Verificado', No: 'No verificado', Duda: 'En duda' };
const VERIFIED_CLASS = { SI: 'participant-verified--si', No: 'participant-verified--no', Duda: 'participant-verified--duda' };

function renderParticipantsList() {
  const { totalTickets } = calculateStatistics(state.eligible.length > 0 ? state.eligible : state.participants);
  const winnerIds = new Set(state.history.map(h => h.id));
  const excludeActive = dom.chkExclude.checked;

  const fragment = document.createDocumentFragment();

  state.participants.forEach((p, index) => {
    const eligibleTotal = totalTickets > 0 && isEligible(p) ? ((p.tickets / totalTickets) * 100) : 0;
    const probability = eligibleTotal.toFixed(2);
    const isWinner = winnerIds.has(p.id);
    const isExcluded = excludeActive && isWinner;
    const expanded = state.expandedIds.has(p.id);

    const li = document.createElement('li');
    li.className = 'participant-item' +
      (isWinner ? ' is-winner' : '') +
      (isExcluded ? ' is-excluded' : '') +
      (expanded ? ' is-expanded' : '');
    li.setAttribute('role', 'listitem');

    const verifiedLabel = VERIFIED_LABEL[p.verified] || p.verified;
    const verifiedClass = VERIFIED_CLASS[p.verified] || '';

    li.innerHTML = `
      <button type="button" class="participant-summary" data-toggle-id="${escapeHtml(p.id)}" aria-expanded="${expanded}">
        <span class="participant-rank">${String(index + 1).padStart(2, '0')}</span>
        <span class="participant-name" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</span>
        <span class="participant-verified ${verifiedClass}">${escapeHtml(verifiedLabel)}</span>
        <span class="participant-tickets">${p.tickets} ${p.tickets === 1 ? 'ticket' : 'tickets'}</span>
        <span class="participant-prob">${probability}%</span>
        <i class="bi bi-chevron-down participant-caret"></i>
      </button>
      <dl class="participant-detail${expanded ? '' : ' d-none'}">
        <dt>ID</dt><dd>${escapeHtml(p.id)}</dd>
        <dt>Steam ID</dt><dd>${p.steamId ? escapeHtml(p.steamId) : '—'}</dd>
        <dt>Comentario</dt><dd>${p.comment ? escapeHtml(p.comment) : '—'}</dd>
        <dt>Probabilidad</dt><dd>${probability}%</dd>
        <div class="prob-bar-wrap" title="${probability}%">
          <div class="prob-bar-fill" style="width: ${probability}%"></div>
        </div>
      </dl>
    `;

    fragment.appendChild(li);
  });

  dom.participantsList.innerHTML = '';
  dom.participantsList.appendChild(fragment);
}

function toggleParticipantDetail(id) {
  if (state.expandedIds.has(id)) {
    state.expandedIds.delete(id);
  } else {
    state.expandedIds.add(id);
  }
  renderParticipantsList();
}

function renderHistory() {
  const existingItems = dom.historyList.querySelectorAll('.history-item');
  existingItems.forEach(el => el.remove());

  if (state.history.length === 0) {
    dom.historyEmpty.classList.remove('d-none');
    return;
  }
  dom.historyEmpty.classList.add('d-none');

  const fragment = document.createDocumentFragment();

  [...state.history].reverse().forEach((entry, index) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('role', 'listitem');

    const num = state.history.length - index;

    li.innerHTML = `
      <span class="history-num">#${num}</span>
      <div class="history-info">
        <div class="history-name" title="${escapeHtml(entry.name)}">${escapeHtml(entry.name)}</div>
        <div class="history-id">${entry.steamId ? 'ID: ' + escapeHtml(String(entry.steamId)) : ''}</div>
      </div>
    `;
    fragment.appendChild(li);
  });

  dom.historyList.insertBefore(fragment, dom.historyEmpty);
}

function updateStatCounters() {
  const eligibleStats = calculateStatistics(state.eligible);
  const allStats = calculateStatistics(state.participants);

  dom.tpParticipants.textContent = eligibleStats.totalParticipants;
  dom.tpTickets.textContent = eligibleStats.totalTickets;
  dom.statParticipants.textContent = allStats.totalParticipants;
  dom.statTickets.textContent = allStats.totalTickets;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ══════════════════════════════════════════════════════════════
   11. ESTADOS DE LA APP
══════════════════════════════════════════════════════════════ */

function setState(newState) {
  state.current = newState;

  switch (newState) {
    case AppState.IDLE:
      dom.btnSpin.disabled = state.eligible.length === 0;
      dom.btnSpin.innerHTML = '<i class="bi bi-play-fill"></i> INICIAR SORTEO';
      dom.spinningBadge.classList.add('d-none');
      dom.rouletteWidget.classList.remove('is-spinning');
      break;

    case AppState.SPINNING:
      dom.btnSpin.disabled = true;
      dom.btnSpin.innerHTML = '<i class="bi bi-hourglass-split"></i> SORTEANDO...';
      dom.spinningBadge.classList.remove('d-none');
      dom.resultInfo.classList.add('d-none');
      dom.rouletteWidget.classList.add('is-spinning');
      break;

    case AppState.SHOWING_WINNER:
      dom.btnSpin.disabled = state.eligible.length === 0;
      dom.btnSpin.innerHTML = '<i class="bi bi-play-fill"></i> INICIAR SORTEO';
      dom.spinningBadge.classList.add('d-none');
      dom.resultInfo.classList.remove('d-none');
      dom.rouletteWidget.classList.remove('is-spinning');
      break;
  }
}

/* ══════════════════════════════════════════════════════════════
   12. SORTEO PRINCIPAL
══════════════════════════════════════════════════════════════ */

function startSpin() {
  if (state.current === AppState.SPINNING) return;

  const excludeWinners = dom.chkExclude.checked;
  const winnerIds = new Set(state.history.map(h => h.id));

  const availableParticipants = excludeWinners
    ? state.eligible.filter(p => !winnerIds.has(p.id))
    : state.eligible;

  if (availableParticipants.length === 0) {
    showNoParticipantsAlert();
    return;
  }

  const winner = selectWinner(availableParticipants);
  state.currentWinner = winner;

  const rounds = randomInt(SPIN_ROUNDS_MIN, SPIN_ROUNDS_MAX);
  const { sequence, winnerFinalIndex } = buildSpinSequence(state.eligible, winner, rounds);
  const finalTranslateY = calculateFinalPosition(winnerFinalIndex);

  renderRouletteTrack(sequence, winnerFinalIndex);
  setState(AppState.SPINNING);

  const duration = randomInt(SPIN_DURATION_MIN, SPIN_DURATION_MAX);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      animateRoulette(finalTranslateY, duration, () => {
        saveWinnerToHistory(winner);
        renderParticipantsList();

        setTimeout(() => showWinner(winner), 600);
      });
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   13. RESET (corrige el bug de la ruleta en blanco)
══════════════════════════════════════════════════════════════ */

function resetRoulette() {
  if (state.current === AppState.SPINNING) return;

  state.currentWinner = null;

  // Detenemos cualquier animación en curso sobre el track antes de
  // limpiarlo: si no se cancelan las Web Animations activas, la
  // siguiente escritura de "transform" puede quedar sobrescrita por
  // el frame final de la animación anterior y la ruleta se ve vacía.
  dom.rouletteTrack.getAnimations().forEach(anim => anim.cancel());

  dom.rouletteTrack.style.transition = 'none';
  dom.rouletteTrack.style.transform = 'translate3d(0, 0, 0)';
  dom.rouletteTrack.innerHTML = '';

  // Repoblamos SIEMPRE con una vista previa, aunque no haya elegibles.
  renderInitialTrack();

  dom.resultInfo.classList.add('d-none');
  dom.winnerModal.classList.add('d-none');

  setState(AppState.IDLE);
}

/* ══════════════════════════════════════════════════════════════
   14. ESTADOS DE CARGA / ERROR
══════════════════════════════════════════════════════════════ */

function showLoading() {
  dom.sorteoError.classList.add('d-none');
  dom.appMain.classList.add('d-none');
  dom.sorteoLoading.classList.remove('d-none');
}

function showError(message) {
  dom.sorteoLoading.classList.add('d-none');
  dom.appMain.classList.add('d-none');
  dom.sorteoErrorMsg.textContent = message;
  dom.sorteoError.classList.remove('d-none');
}

/* ══════════════════════════════════════════════════════════════
   15. UTILIDADES
══════════════════════════════════════════════════════════════ */

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* ══════════════════════════════════════════════════════════════
   16. INICIALIZACIÓN
══════════════════════════════════════════════════════════════ */

function initApp() {
  loadHistory();
  updateStatCounters();
  renderParticipantsList();
  renderHistory();
  renderInitialTrack();

  dom.sorteoLoading.classList.add('d-none');
  dom.sorteoError.classList.add('d-none');
  dom.appMain.classList.remove('d-none');

  setState(AppState.IDLE);

  // ── Listeners (se registran una sola vez) ──
  if (!initApp._bound) {
    initApp._bound = true;

    dom.btnSpin.addEventListener('click', () => {
      if (state.current !== AppState.SPINNING) {
        restoreWinnerModal();
        startSpin();
      }
    });

    dom.btnReset.addEventListener('click', () => {
      restoreWinnerModal();
      resetRoulette();
    });

    dom.chkExclude.addEventListener('change', renderParticipantsList);

    dom.participantsList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-toggle-id]');
      if (btn) toggleParticipantDetail(btn.dataset.toggleId);
    });

    dom.btnCopyId.addEventListener('click', copyWinnerId);

    dom.btnCloseModal.addEventListener('click', () => {
      dom.winnerModal.classList.add('d-none');
      restoreWinnerModal();
    });

    dom.winnerModal.addEventListener('click', (e) => {
      if (e.target === dom.winnerModal) {
        dom.winnerModal.classList.add('d-none');
        restoreWinnerModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !dom.winnerModal.classList.contains('d-none')) {
        dom.winnerModal.classList.add('d-none');
        restoreWinnerModal();
      }
    });

    dom.btnClearHistory.addEventListener('click', () => {
      if (confirm('¿Seguro que deseas limpiar el historial de ganadores?')) {
        clearHistory();
      }
    });

    dom.btnSpin.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && !dom.btnSpin.disabled) {
        e.preventDefault();
        dom.btnSpin.click();
      }
    });

    if (dom.btnRetry) {
      dom.btnRetry.addEventListener('click', loadParticipants);
    }
  }
}

/* ══════════════════════════════════════════════════════════════
   17. ENTRY POINT
══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  loadParticipants();
});