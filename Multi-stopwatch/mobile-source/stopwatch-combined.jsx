// stopwatch-combined.jsx
// "Combined" variation — A's list is home, tapping a timer pushes a B-style
// detail screen that owns the selected timer. Slide animation between the
// two. Master controls + total live on home; per-timer ops live in detail.

function VariationCombined() {
  const [state, api] = useStopwatchStore();
  const anyRunning = state.timers.some((t) => t.startedAt);
  const now = useNow(anyRunning);
  const ctrl = useController(api);
  const [selectedId, setSelectedId] = React.useState(null);
  const [editingNameId, setEditingNameId] = React.useState(null);

  const totalMs = state.timers.reduce((a, t) => a + elapsed(t, now), 0);
  const selected = state.timers.find((t) => t.id === selectedId);

  // ───────── Home (A-style) ─────────
  const Home = (
    <div style={{ height: '100%', background: COLORS.bg, color: COLORS.text, fontFamily: FONT_UI, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 'var(--top-spacer, 54px)', flexShrink: 0 }} />
      <div style={{ padding: '6px 20px 16px', borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600 }}>{state.timers.length} timers · {state.timers.filter((t) => t.startedAt).length} running</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6, marginTop: 2 }}>Today</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600 }}>Total</div>
            <div style={{ fontFamily: FONT_DIGITS, fontSize: 22, fontWeight: 500, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>{fmtCompact(totalMs)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={anyRunning ? api.pauseAll : api.startAll}
            style={{ flex: 1, padding: '10px 14px', background: anyRunning ? COLORS.surface : COLORS.text, color: anyRunning ? COLORS.text : '#000', border: `1px solid ${anyRunning ? COLORS.border : COLORS.text}`, borderRadius: 10, fontFamily: FONT_UI, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {anyRunning ? '❚❚ Pause all' : '▶ Start all'}
          </button>
          <button onClick={() => api.add()}
            style={{ padding: '10px 14px', background: 'transparent', color: COLORS.text, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontFamily: FONT_UI, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {state.timers.map((t) => {
          const ms = elapsed(t, now);
          const running = !!t.startedAt;
          return (
            <div key={t.id} onClick={() => setSelectedId(t.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer' }}>
              <div style={{ width: 3, alignSelf: 'stretch', background: t.color, borderRadius: 2, opacity: running ? 1 : 0.35 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, color: COLORS.textDim }}>
                  {running && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 6, height: 6, borderRadius: 3, background: t.color, animation: 'pulse 1.4s ease-in-out infinite' }} /> running</span>}
                  {!running && t.accumMs + t.offsetMs > 0 && <span>paused</span>}
                  {!running && !t.accumMs && !t.offsetMs && <span>idle</span>}
                  <span style={{ color: COLORS.textMuted }}>·</span>
                  <span>{t.laps.length} {t.laps.length === 1 ? 'lap' : 'laps'}</span>
                </div>
              </div>
              <Digits ms={ms} size={26} color={running ? t.color : COLORS.text} />
              <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => api.toggle(t.id)} title={running ? 'Pause' : 'Start'}
                  style={{ width: 36, height: 36, borderRadius: 18, background: running ? t.color : 'transparent', border: `1px solid ${running ? t.color : COLORS.border}`, color: running ? '#000' : COLORS.text, cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                  {running ? '❚❚' : '▶'}
                </button>
                <div style={{ color: COLORS.textMuted, alignSelf: 'center', fontSize: 16 }}>›</div>
              </div>
            </div>
          );
        })}
        <button onClick={() => api.add()}
          style={{ width: '100%', padding: '20px', background: 'transparent', border: 'none', color: COLORS.textDim, fontFamily: FONT_UI, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>＋ New stopwatch</button>
      </div>
    </div>
  );

  // ───────── Detail (B-style) ─────────
  const Detail = selected && (() => {
    const t = selected;
    const ms = elapsed(t, now);
    const running = !!t.startedAt;
    return (
      <div style={{ height: '100%', background: COLORS.bg, color: COLORS.text, fontFamily: FONT_UI, display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 'var(--top-spacer, 54px)', flexShrink: 0 }} />
        {/* Nav bar with back */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px 12px', gap: 6 }}>
          <button onClick={() => setSelectedId(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 10px 8px 6px', background: 'transparent', border: 'none', color: t.color, fontFamily: FONT_UI, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
            <span style={{ fontSize: 18 }}>‹</span> Today
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={() => ctrl.askConfirm({ title: 'Delete stopwatch?', message: `“${t.name}” and its laps will be removed.`, confirmLabel: 'Delete', destructive: true, onConfirm: () => { api.remove(t.id); setSelectedId(null); } })}
            style={{ background: 'transparent', border: 'none', color: COLORS.textMuted, cursor: 'pointer', padding: 8, fontSize: 18 }}>⋯</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 24px' }}>
          <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 24, padding: '22px 22px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: t.color, opacity: running ? 1 : 0.4 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: running ? t.color : COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: running ? t.color : COLORS.textMuted, animation: running ? 'pulse 1.4s ease-in-out infinite' : 'none' }} />
                {running ? 'Running' : (t.accumMs + t.offsetMs ? 'Paused' : 'Idle')}
              </span>
            </div>
            {editingNameId === t.id ? (
              <input autoFocus defaultValue={t.name}
                onBlur={(e) => { api.rename(t.id, e.target.value || t.name); setEditingNameId(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: COLORS.text, fontFamily: FONT_UI, fontSize: 20, fontWeight: 700, letterSpacing: -0.4, padding: 0 }} />
            ) : (
              <div onClick={() => setEditingNameId(t.id)} style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.2, cursor: 'text' }}>{t.name}</div>
            )}
            <div style={{ padding: '26px 0 10px', textAlign: 'center' }}>
              <Digits ms={ms} size={62} color={running ? t.color : COLORS.text} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 4px 18px', fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>
              <span>{t.accumMs + t.offsetMs > 0 ? `Saved · ${fmtCompact(t.accumMs + t.offsetMs)}` : 'Fresh'}</span>
              <span>{t.laps.length} {t.laps.length === 1 ? 'Lap' : 'Laps'}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => api.toggle(t.id)}
                style={{ flex: 2, padding: '14px', background: running ? COLORS.surface2 : t.color, color: running ? COLORS.text : '#000', border: running ? `1px solid ${COLORS.border}` : 'none', borderRadius: 12, fontFamily: FONT_UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4, cursor: 'pointer' }}>
                {running ? '❚❚ PAUSE' : (t.accumMs || t.offsetMs ? '▶ RESUME' : '▶ START')}
              </button>
              <button onClick={() => ctrl.requestLap(t, Date.now())} disabled={!running}
                style={{ flex: 1, padding: '14px', background: 'transparent', color: running ? COLORS.text : COLORS.textMuted, border: `1px solid ${COLORS.border}`, borderRadius: 12, fontFamily: FONT_UI, fontSize: 14, fontWeight: 700, letterSpacing: 0.4, cursor: running ? 'pointer' : 'not-allowed' }}>⚑ LAP</button>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <button onClick={() => ctrl.requestSetTime(t, Date.now())} style={{ flex: 1, padding: '10px', background: 'transparent', color: COLORS.textDim, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontFamily: FONT_UI, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Set time</button>
              <button onClick={() => ctrl.askConfirm({ title: 'Reset stopwatch?', message: `This will clear the time and all laps for “${t.name}”. This can’t be undone.`, confirmLabel: 'Reset', destructive: true, onConfirm: () => api.reset(t.id) })} style={{ flex: 1, padding: '10px', background: 'transparent', color: COLORS.textDim, border: `1px solid ${COLORS.border}`, borderRadius: 10, fontFamily: FONT_UI, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 2px 0', borderTop: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 10, color: COLORS.textMuted, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700, marginRight: 'auto' }}>Color</span>
              {ACCENT_COLORS.map((c) => (
                <button key={c} onClick={() => api.setColor(t.id, c)}
                  style={{ width: 16, height: 16, borderRadius: 8, background: c, border: c === t.color ? `2px solid ${COLORS.text}` : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
              ))}
            </div>
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 10px' }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 700 }}>Laps</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: 0.6 }}>name · split · total</div>
            </div>
            {t.laps.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: COLORS.textMuted, fontSize: 13, border: `1px dashed ${COLORS.border}`, borderRadius: 12 }}>
                {running ? 'Tap LAP to record what you finished.' : 'No laps yet.'}
              </div>
            ) : (
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: 'hidden' }}>
                {[...t.laps].reverse().map((l, ri) => {
                  const i = t.laps.length - 1 - ri;
                  const prev = i === 0 ? 0 : t.laps[i - 1].atMs;
                  const delta = l.atMs - prev;
                  return (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: ri === t.laps.length - 1 ? 'none' : `1px solid ${COLORS.border}` }}>
                      <div style={{ fontFamily: FONT_DIGITS, fontSize: 11, color: COLORS.textMuted, width: 24 }}>{String(i + 1).padStart(2, '0')}</div>
                      <div style={{ flex: 1, fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.name}</div>
                      <div style={{ fontFamily: FONT_DIGITS, fontSize: 12, color: t.color, fontWeight: 500 }}>+{fmtHuman(delta)}</div>
                      <div style={{ fontFamily: FONT_DIGITS, fontSize: 13, color: COLORS.text, minWidth: 60, textAlign: 'right' }}>{fmtCompact(l.atMs)}</div>
                      <button onClick={() => api.deleteLap(t.id, l.id)} style={{ background: 'transparent', border: 'none', color: COLORS.textMuted, cursor: 'pointer', padding: 4, fontSize: 12 }}>✕</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })();

  return (
    <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Home stays mounted, slides left when detail opens */}
      <div style={{ position: 'absolute', inset: 0, transform: selected ? 'translateX(-30%)' : 'translateX(0)', opacity: selected ? 0.4 : 1, transition: 'transform .28s cubic-bezier(.2,.7,.3,1), opacity .28s' }}>
        {Home}
      </div>
      {/* Detail slides in from right */}
      <div style={{ position: 'absolute', inset: 0, transform: selected ? 'translateX(0)' : 'translateX(100%)', transition: 'transform .28s cubic-bezier(.2,.7,.3,1)', boxShadow: selected ? '-8px 0 24px rgba(0,0,0,0.3)' : 'none' }}>
        {Detail}
      </div>
      <ControllerOverlays ctrl={ctrl} />
    </div>
  );
}

Object.assign(window, { VariationCombined });
