// stopwatch-core.jsx
// Shared state + persistence + formatting for the multi-stopwatch app.
// Two surfaces (List + Cards) read the same store so renaming, lap-adding,
// or starting a timer in one variation is reflected in the other.

const STORE_KEY = 'multi-stopwatch:v1';

// ─────────────────────────────────────────────────────────────
// Time formatting — count-up only.
// fmt(ms)         → "01:23:45.6"  (drops hours when under an hour)
// fmtCompact(ms)  → "01:23:45"    (no millis, used for lap totals)
// ─────────────────────────────────────────────────────────────
function fmt(ms) {
  if (ms < 0) ms = 0;
  const cs = Math.floor(ms / 100) % 10;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  return (h > 0 ? `${pad(h)}:` : '') + `${pad(m)}:${pad(s)}.${cs}`;
}
function fmtCompact(ms) {
  if (ms < 0) ms = 0;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
// "1h 23m" / "23m 4s" / "4s" — for lap deltas in compact list rows
function fmtHuman(ms) {
  if (ms < 1000) return `${Math.max(0, Math.floor(ms / 100))}.${0}s`;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000);
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

// ─────────────────────────────────────────────────────────────
// Store — { timers: [...], }, each timer:
//   { id, name, color, offsetMs, startedAt|null, accumMs, laps: [{name, atMs}] }
// elapsed(t) = accumMs + offsetMs + (running ? now - startedAt : 0)
// ─────────────────────────────────────────────────────────────
const ACCENT_COLORS = [
  '#ff6b35', // orange
  '#22d3ee', // cyan
  '#a3e635', // lime
  '#f472b6', // pink
  '#fbbf24', // amber
  '#a78bfa', // violet
  '#34d399', // emerald
  '#f87171', // rose
];

const SAMPLE_NAMES = [
  'Linear Algebra · Ch. 4',
  'Client Site Redesign',
  'Reading — Sapiens',
  'Spanish Practice',
  'Side Project',
];

function newTimer(idx = 0, name) {
  return {
    id: 'sw_' + Math.random().toString(36).slice(2, 9),
    name: name || (SAMPLE_NAMES[idx] || `Stopwatch ${idx + 1}`),
    color: ACCENT_COLORS[idx % ACCENT_COLORS.length],
    offsetMs: 0,
    startedAt: null,
    accumMs: 0,
    laps: [],
    sessions: [], // { id, startedAt, endedAt } wall-clock ms, appended on each pause
  };
}

function elapsed(t, now) {
  return t.accumMs + t.offsetMs + (t.startedAt ? now - t.startedAt : 0);
}

// Seed: a couple of demo timers so first launch isn't empty.
function seed() {
  const a = newTimer(0, 'Linear Algebra · Ch. 4');
  a.accumMs = 0;
  a.offsetMs = 1000 * 60 * 45 + 1000 * 12; // 45m 12s pre-existing
  a.startedAt = Date.now() - 1000 * 60 * 8; // running 8m
  a.laps = [
    { id: 'l1', name: 'Read 4.1', atMs: 1000 * 60 * 18 },
    { id: 'l2', name: 'Worked problems 1–6', atMs: 1000 * 60 * 38 },
  ];
  const b = newTimer(1, 'Client Site Redesign');
  b.accumMs = 1000 * 60 * 23 + 1000 * 41;
  b.laps = [
    { id: 'l3', name: 'Wireframes', atMs: 1000 * 60 * 12 },
    { id: 'l4', name: 'Color exploration', atMs: 1000 * 60 * 23 + 1000 * 41 },
  ];
  const c = newTimer(2, 'Reading — Sapiens');
  c.accumMs = 1000 * 60 * 12;
  return { timers: [a, b, c] };
}

// localStorage-backed store hook. Returns [state, api].
function useStopwatchStore() {
  const [state, setState] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p && Array.isArray(p.timers)) return p;
      }
    } catch {}
    return seed();
  });

  // Persist on every change.
  React.useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);

  const update = (id, fn) => setState((s) => ({
    ...s,
    timers: s.timers.map((t) => (t.id === id ? { ...t, ...fn(t) } : t)),
  }));

  const api = React.useMemo(() => ({
    add() {
      setState((s) => ({ ...s, timers: [...s.timers, newTimer(s.timers.length)] }));
    },
    remove(id) {
      setState((s) => ({ ...s, timers: s.timers.filter((t) => t.id !== id) }));
    },
    rename(id, name) { update(id, () => ({ name })); },
    setOffset(id, offsetMs) { update(id, () => ({ offsetMs })); },
    // Set the displayed time to an exact value (h/m/s). Pauses if running so
    // the user can resume from that point. accumMs absorbs the new value;
    // offsetMs is cleared so the on-screen value matches what they set.
    setTime(id, ms) {
      update(id, () => ({ startedAt: null, accumMs: Math.max(0, ms), offsetMs: 0 }));
    },
    setColor(id, color) { update(id, () => ({ color })); },
    start(id) {
      update(id, (t) => (t.startedAt ? {} : { startedAt: Date.now() }));
    },
    pause(id) {
      const now = Date.now();
      update(id, (t) => {
        if (!t.startedAt) return {};
        return {
          startedAt: null,
          accumMs: t.accumMs + (now - t.startedAt),
          sessions: [...(t.sessions || []), { id: 's_' + Math.random().toString(36).slice(2, 8), startedAt: t.startedAt, endedAt: now }],
        };
      });
    },
    toggle(id) {
      const now = Date.now();
      update(id, (t) => {
        if (t.startedAt) return {
          startedAt: null,
          accumMs: t.accumMs + (now - t.startedAt),
          sessions: [...(t.sessions || []), { id: 's_' + Math.random().toString(36).slice(2, 8), startedAt: t.startedAt, endedAt: now }],
        };
        return { startedAt: now };
      });
    },
    reset(id) {
      update(id, () => ({ startedAt: null, accumMs: 0, offsetMs: 0, laps: [], sessions: [] }));
    },
    addLap(id, name) {
      const now = Date.now();
      update(id, (t) => ({
        laps: [...t.laps, { id: 'l_' + Math.random().toString(36).slice(2, 8), name: name || `Lap ${t.laps.length + 1}`, atMs: elapsed(t, now), recordedAt: now }],
      }));
    },
    renameLap(timerId, lapId, name) {
      update(timerId, (t) => ({
        laps: t.laps.map((l) => (l.id === lapId ? { ...l, name } : l)),
      }));
    },
    deleteLap(timerId, lapId) {
      update(timerId, (t) => ({ laps: t.laps.filter((l) => l.id !== lapId) }));
    },
    startAll() {
      setState((s) => ({ ...s, timers: s.timers.map((t) => (t.startedAt ? t : { ...t, startedAt: Date.now() })) }));
    },
    pauseAll() {
      const now = Date.now();
      setState((s) => ({ ...s, timers: s.timers.map((t) => {
        if (!t.startedAt) return t;
        return {
          ...t,
          startedAt: null,
          accumMs: t.accumMs + (now - t.startedAt),
          sessions: [...(t.sessions || []), { id: 's_' + Math.random().toString(36).slice(2, 8), startedAt: t.startedAt, endedAt: now }],
        };
      }) }));
    },
  }), []);

  return [state, api];
}

// ─────────────────────────────────────────────────────────────
// useNow(running) — ticks at ~10Hz when any timer is running, freezes
// when none are. Returns Date.now() for elapsed() to consume.
// ─────────────────────────────────────────────────────────────
function useNow(active) {
  const [now, setNow] = React.useState(Date.now());
  React.useEffect(() => {
    if (!active) return;
    let raf;
    const tick = () => { setNow(Date.now()); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
  return now;
}

// ─────────────────────────────────────────────────────────────
// Daily-log helpers — wall-clock session grouping with midnight splits.
// ─────────────────────────────────────────────────────────────
function localDateStr(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function midnightOf(ms) {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}
// Split one {startedAt,endedAt} session at calendar-day boundaries.
// Returns [{date:"YYYY-MM-DD", startMs, endMs}].
function splitSessionDetailed(startedAt, endedAt) {
  const result = [];
  let cursor = startedAt;
  while (true) {
    const nextMidnight = midnightOf(cursor) + 86400000;
    if (endedAt <= nextMidnight) {
      result.push({ date: localDateStr(cursor), startMs: cursor, endMs: endedAt });
      break;
    }
    result.push({ date: localDateStr(cursor), startMs: cursor, endMs: nextMidnight });
    cursor = nextMidnight;
  }
  return result;
}
// Returns Map<"YYYY-MM-DD", [{startMs, endMs, ms}]>.
function getSessionsByDay(sessions) {
  const map = new Map();
  for (const s of sessions) {
    for (const { date, startMs, endMs } of splitSessionDetailed(s.startedAt, s.endedAt)) {
      if (!map.has(date)) map.set(date, []);
      map.get(date).push({ startMs, endMs, ms: endMs - startMs });
    }
  }
  return map;
}
// "08:04" wall-clock HH:MM
function fmtWallTime(ms) {
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
// "YYYY-MM-DD" → "Today" / "Yesterday" / "Thu 07 May"
function fmtDateLabel(dateStr) {
  const todayStr = localDateStr(Date.now());
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const yesterdayStr = localDateStr(yd.getTime());
  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';
  const d = new Date(dateStr + 'T12:00:00');
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${DAYS[d.getDay()]} ${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]}`;
}

Object.assign(window, {
  fmt, fmtCompact, fmtHuman, ACCENT_COLORS, useStopwatchStore, useNow, elapsed,
  localDateStr, getSessionsByDay, fmtWallTime, fmtDateLabel,
});
