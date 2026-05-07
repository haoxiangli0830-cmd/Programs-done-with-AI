// stopwatch-combined.jsx
function DailyLogView({ timer, now, onBack }) {
  const [exp, setExp] = React.useState(null);
  const live = [...(timer.sessions||[])];
  if (timer.startedAt) live.push({ id:'__live__', startedAt:timer.startedAt, endedAt:now });
  const byDay = window.getSessionsByDay ? window.getSessionsByDay(live) : new Map();
  const days = [...byDay.keys()].sort().reverse();
  const total = [...byDay.values()].flat().reduce((a,s)=>a+s.ms,0);
  return (
    <div style={{ height:'100%', background:COLORS.bg, color:COLORS.text, fontFamily:FONT_UI, display:'flex', flexDirection:'column' }}>
      <div style={{ height:'var(--top-spacer,54px)', flexShrink:0 }}/>
      <div style={{ display:'flex', alignItems:'center', padding:'8px 12px 12px', gap:6 }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 10px 8px 6px', background:'transparent', border:'none', color:timer.color, fontFamily:FONT_UI, fontSize:15, fontWeight:500, cursor:'pointer' }}>
          <span style={{ fontSize:18 }}>&#8249;</span> Back
        </button>
        <div style={{ flex:1 }}/>
        <div style={{ fontFamily:FONT_DIGITS, fontSize:13, color:COLORS.textMuted }}>All · {fmtCompact(total)}</div>
      </div>
      <div style={{ padding:'0 20px 12px', borderBottom:`1px solid ${COLORS.border}` }}>
        <div style={{ fontSize:11, color:COLORS.textMuted, letterSpacing:1.2, textTransform:'uppercase', fontWeight:600 }}>Daily Log</div>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:-0.4, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{timer.name}</div>
      </div>
      <div style={{ flex:1, overflowY:'auto' }}>
        {days.length === 0 && <div style={{ padding:'48px 24px', textAlign:'center', color:COLORS.textMuted, fontSize:14 }}>No sessions yet. Start the timer to begin tracking.</div>}
        {days.map(ds => {
          const sessions = byDay.get(ds);
          const dayTotal = sessions.reduce((a,s)=>a+s.ms,0);
          const open = exp === ds;
          return (
            <div key={ds} style={{ borderBottom:`1px solid ${COLORS.border}` }}>
              <div onClick={()=>setExp(open?null:ds)} style={{ display:'flex', alignItems:'center', padding:'16px 20px', cursor:'pointer', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:600 }}>{window.fmtDateLabel ? window.fmtDateLabel(ds) : ds}</div>
                  <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>{sessions.length} session{sessions.length!==1?'s':''}</div>
                </div>
                <div style={{ fontFamily:FONT_DIGITS, fontSize:16, fontWeight:500, color:timer.color }}>{fmtCompact(dayTotal)}</div>
                <div style={{ color:COLORS.textMuted, fontSize:14, transition:'transform .2s', transform:open?'rotate(90deg)':'rotate(0deg)' }}>&#8250;</div>
              </div>
              {open && (
                <div style={{ background:COLORS.surface, padding:'4px 20px 12px' }}>
                  {sessions.map((s,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', padding:'8px 0', borderBottom:i<sessions.length-1?`1px solid ${COLORS.border}`:'none' }}>
                      <div style={{ flex:1, fontFamily:FONT_DIGITS, fontSize:12, color:COLORS.textDim }}>{window.fmtWallTime(s.startMs)} - {window.fmtWallTime(s.endMs)}</div>
                      <div style={{ fontFamily:FONT_DIGITS, fontSize:13, color:COLORS.text }}>{fmtCompact(s.ms)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GlobalLogView({ timers, now, onBack }) {
  const [exp, setExp] = React.useState(null);
  const byDay = new Map();
  for (const t of timers) {
    const live = [...(t.sessions||[])];
    if (t.startedAt) live.push({ id:'__live__', startedAt:t.startedAt, endedAt:now });
    if (!window.getSessionsByDay) continue;
    for (const [ds, sessions] of window.getSessionsByDay(live)) {
      const ms = sessions.reduce((a,s)=>a+s.ms,0);
      if (!byDay.has(ds)) byDay.set(ds,[]);
      byDay.get(ds).push({ name:t.name, color:t.color, ms });
    }
  }
  const days = [...byDay.keys()].sort().reverse();
  const grandTotal = [...byDay.values()].flat().reduce((a,e)=>a+e.ms,0);
  return (
    <div style={{ height:'100%', background:COLORS.bg, color:COLORS.text, fontFamily:FONT_UI, display:'flex', flexDirection:'column' }}>
      <div style={{ height:'var(--top-spacer,54px)', flexShrink:0 }}/>
      <div style={{ display:'flex', alignItems:'center', padding:'8px 12px 12px', gap:6 }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 10px 8px 6px', background:'transparent', border:'none', color:COLORS.text, fontFamily:FONT_UI, fontSize:15, fontWeight:500, cursor:'pointer' }}>
          <span style={{ fontSize:18 }}>&#8249;</span> Today
        </button>
        <div style={{ flex:1 }}/>
        <div style={{ fontFamily:FONT_DIGITS, fontSize:13, color:COLORS.textMuted }}>All · {fmtCompact(grandTotal)}</div>
      </div>
      <div style={{ padding:'0 20px 12px', borderBottom:`1px solid ${COLORS.border}` }}>
        <div style={{ fontSize:11, color:COLORS.textMuted, letterSpacing:1.2, textTransform:'uppercase', fontWeight:600 }}>All Timers</div>
        <div style={{ fontSize:22, fontWeight:700, letterSpacing:-0.4, marginTop:2 }}>History</div>
      </div>
      <div style={{ flex:1, overflowY:'auto' }}>
        {days.length === 0 && <div style={{ padding:'48px 24px', textAlign:'center', color:COLORS.textMuted, fontSize:14 }}>No history yet. Start any timer to begin.</div>}
        {days.map(ds => {
          const entries = byDay.get(ds);
          const dayTotal = entries.reduce((a,e)=>a+e.ms,0);
          const open = exp === ds;
          return (
            <div key={ds} style={{ borderBottom:`1px solid ${COLORS.border}` }}>
              <div onClick={()=>setExp(open?null:ds)} style={{ display:'flex', alignItems:'center', padding:'16px 20px', cursor:'pointer', gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:600 }}>{window.fmtDateLabel ? window.fmtDateLabel(ds) : ds}</div>
                  <div style={{ fontSize:11, color:COLORS.textMuted, marginTop:2 }}>{entries.length} timer{entries.length!==1?'s':''}</div>
                </div>
                <div style={{ fontFamily:FONT_DIGITS, fontSize:16, fontWeight:500, color:COLORS.text }}>{fmtCompact(dayTotal)}</div>
                <div style={{ color:COLORS.textMuted, fontSize:14, transition:'transform .2s', transform:open?'rotate(90deg)':'rotate(0deg)' }}>&#8250;</div>
              </div>
              {open && (
                <div style={{ background:COLORS.surface, padding:'4px 20px 12px' }}>
                  {entries.map((e,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:i<entries.length-1?`1px solid ${COLORS.border}`:'none' }}>
                      <div style={{ width:3, height:16, borderRadius:2, background:e.color }}/>
                      <div style={{ flex:1, fontSize:14, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.name}</div>
                      <div style={{ fontFamily:FONT_DIGITS, fontSize:13, color:COLORS.text }}>{fmtCompact(e.ms)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VariationCombined() {
  const [state, api] = useStopwatchStore();
  const anyRunning = state.timers.some((t) => t.startedAt);
  const now = useNow(anyRunning);
  const ctrl = useController(api);
  const [nav, setNav] = React.useState({ view:'home', timerId:null });
  const [editingNameId, setEditingNameId] = React.useState(null);

  const goHome   = () => setNav({ view:'home',   timerId:null });
  const goDetail = (id) => setNav({ view:'detail', timerId:id });
  const goDaily  = (id) => setNav({ view:'daily',  timerId:id });
  const goGlobal = () => setNav({ view:'global', timerId:null });

  const selected = state.timers.find((t) => t.id === nav.timerId);
  const totalMs  = state.timers.reduce((a,t) => a + elapsed(t,now), 0);

  const Home = (
    <div style={{ height:'100%', background:COLORS.bg, color:COLORS.text, fontFamily:FONT_UI, display:'flex', flexDirection:'column' }}>
      <div style={{ height:'var(--top-spacer,54px)', flexShrink:0 }}/>
      <div style={{ padding:'6px 20px 16px', borderBottom:`1px solid ${COLORS.border}` }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, color:COLORS.textMuted, letterSpacing:1.2, textTransform:'uppercase', fontWeight:600 }}>{state.timers.length} timers · {state.timers.filter(t=>t.startedAt).length} running</div>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:-0.6, marginTop:2 }}>Today</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:11, color:COLORS.textMuted, letterSpacing:1.2, textTransform:'uppercase', fontWeight:600 }}>Total</div>
              <div style={{ fontFamily:FONT_DIGITS, fontSize:22, fontWeight:500, marginTop:2, fontVariantNumeric:'tabular-nums' }}>{fmtCompact(totalMs)}</div>
            </div>
            <button onClick={goGlobal} style={{ padding:'4px 10px', background:'transparent', border:`1px solid ${COLORS.border}`, borderRadius:8, color:COLORS.textDim, fontFamily:FONT_UI, fontSize:12, fontWeight:500, cursor:'pointer' }}>History</button>
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={anyRunning ? api.pauseAll : api.startAll} style={{ flex:1, padding:'10px 14px', background:anyRunning?COLORS.surface:COLORS.text, color:anyRunning?COLORS.text:'#000', border:`1px solid ${anyRunning?COLORS.border:COLORS.text}`, borderRadius:10, fontFamily:FONT_UI, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {anyRunning ? '❚❚ Pause all' : '▶ Start all'}
          </button>
          <button onClick={() => api.add()} style={{ padding:'10px 14px', background:'transparent', color:COLORS.text, border:`1px solid ${COLORS.border}`, borderRadius:10, fontFamily:FONT_UI, fontSize:13, fontWeight:600, cursor:'pointer' }}>+ Add</button>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto' }}>
        {state.timers.map((t) => {
          const ms = elapsed(t,now);
          const running = !!t.startedAt;
          return (
            <div key={t.id} onClick={() => goDetail(t.id)} style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 20px', borderBottom:`1px solid ${COLORS.border}`, cursor:'pointer' }}>
              <div style={{ width:3, alignSelf:'stretch', background:t.color, borderRadius:2, opacity:running?1:0.35 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:4, fontSize:12, color:COLORS.textDim }}>
                  {running && <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}><span style={{ width:6, height:6, borderRadius:3, background:t.color, animation:'pulse 1.4s ease-in-out infinite' }}/> running</span>}
                  {!running && t.accumMs+t.offsetMs>0 && <span>paused</span>}
                  {!running && !t.accumMs && !t.offsetMs && <span>idle</span>}
                  <span style={{ color:COLORS.textMuted }}>·</span>
                  <span>{t.laps.length} {t.laps.length===1?'lap':'laps'}</span>
                </div>
              </div>
              <Digits ms={ms} size={26} color={running?t.color:COLORS.text}/>
              <div onClick={(e)=>e.stopPropagation()} style={{ display:'flex', gap:6 }}>
                <button onClick={()=>api.toggle(t.id)} style={{ width:36, height:36, borderRadius:18, background:running?t.color:'transparent', border:`1px solid ${running?t.color:COLORS.border}`, color:running?'#000':COLORS.text, cursor:'pointer', fontSize:11, fontWeight:700 }}>
                  {running?'❚❚':'▶'}
                </button>
                <div style={{ color:COLORS.textMuted, alignSelf:'center', fontSize:16 }}>&#8250;</div>
              </div>
            </div>
          );
        })}
        <button onClick={() => api.add()} style={{ width:'100%', padding:'20px', background:'transparent', border:'none', color:COLORS.textDim, fontFamily:FONT_UI, fontSize:14, fontWeight:500, cursor:'pointer' }}>+ New stopwatch</button>
      </div>
    </div>
  );

  const Detail = selected && (() => {
    const t = selected;
    const ms = elapsed(t, now);
    const running = !!t.startedAt;
    const lastLapMs = t.laps.length > 0 ? t.laps[t.laps.length-1].atMs : 0;
    const currentLapMs = Math.max(0, ms - lastLapMs);
    return (
      <div style={{ height:'100%', background:COLORS.bg, color:COLORS.text, fontFamily:FONT_UI, display:'flex', flexDirection:'column' }}>
        <div style={{ height:'var(--top-spacer,54px)', flexShrink:0 }}/>
        <div style={{ display:'flex', alignItems:'center', padding:'8px 12px 12px', gap:6 }}>
          <button onClick={goHome} style={{ display:'flex', alignItems:'center', gap:4, padding:'8px 10px 8px 6px', background:'transparent', border:'none', color:t.color, fontFamily:FONT_UI, fontSize:15, fontWeight:500, cursor:'pointer' }}>
            <span style={{ fontSize:18 }}>&#8249;</span> Today
          </button>
          <div style={{ flex:1 }}/>
          <button onClick={() => ctrl.askConfirm({ title:'Delete stopwatch?', message:`"${t.name}" and its laps will be removed.`, confirmLabel:'Delete', destructive:true, onConfirm:() => { api.remove(t.id); goHome(); } })} style={{ background:'transparent', border:'none', color:COLORS.textMuted, cursor:'pointer', padding:8, fontSize:18 }}>&#8943;</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'0 16px 24px' }}>
          <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:24, padding:'22px 22px 20px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:t.color, opacity:running?1:0.4 }}/>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, color:running?t.color:COLORS.textMuted, letterSpacing:1, textTransform:'uppercase', fontWeight:700 }}>
                <span style={{ width:6, height:6, borderRadius:3, background:running?t.color:COLORS.textMuted, animation:running?'pulse 1.4s ease-in-out infinite':'none' }}/>
                {running ? 'Running' : (t.accumMs+t.offsetMs ? 'Paused' : 'Idle')}
              </span>
            </div>
            {editingNameId === t.id ? (
              <input autoFocus defaultValue={t.name}
                onBlur={(e) => { api.rename(t.id, e.target.value||t.name); setEditingNameId(null); }}
                onKeyDown={(e) => { if (e.key==='Enter') e.target.blur(); }}
                style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:COLORS.text, fontFamily:FONT_UI, fontSize:20, fontWeight:700, letterSpacing:-0.4, padding:0 }}/>
            ) : (
              <div onClick={() => setEditingNameId(t.id)} style={{ fontSize:20, fontWeight:700, letterSpacing:-0.4, lineHeight:1.2, cursor:'text' }}>{t.name}</div>
            )}
            <div style={{ marginTop:14, padding:'8px 12px', background:COLORS.surface2, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:11, color:COLORS.textMuted, letterSpacing:1, textTransform:'uppercase', fontWeight:600 }}>Current lap</span>
              <Digits ms={currentLapMs} size={20} color={running?t.color:COLORS.textDim}/>
            </div>
            <div style={{ padding:'20px 0 10px', textAlign:'center' }}>
              <Digits ms={ms} size={62} color={running?t.color:COLORS.text}/>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 4px 18px', fontSize:11, color:COLORS.textMuted, letterSpacing:0.6, textTransform:'uppercase', fontWeight:600 }}>
              <span>{t.accumMs+t.offsetMs>0 ? `Saved ·· ${fmtCompact(t.accumMs+t.offsetMs)}` : 'Fresh'}</span>
              <span>{t.laps.length} {t.laps.length===1?'Lap':'Laps'}</span>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => api.toggle(t.id)} style={{ flex:2, padding:'14px', background:running?COLORS.surface2:t.color, color:running?COLORS.text:'#000', border:running?`1px solid ${COLORS.border}`:'none', borderRadius:12, fontFamily:FONT_UI, fontSize:14, fontWeight:700, letterSpacing:0.4, cursor:'pointer' }}>
                {running ? '❚❚ PAUSE' : (t.accumMs||t.offsetMs ? '▶ RESUME' : '▶ START')}
              </button>
              <button onClick={() => ctrl.requestLap(t, Date.now())} disabled={!running} style={{ flex:1, padding:'14px', background:'transparent', color:running?COLORS.text:COLORS.textMuted, border:`1px solid ${COLORS.border}`, borderRadius:12, fontFamily:FONT_UI, fontSize:14, fontWeight:700, letterSpacing:0.4, cursor:running?'pointer':'not-allowed' }}>&#9873; LAP</button>
            </div>
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              <button onClick={() => ctrl.requestSetTime(t, Date.now())} style={{ flex:1, padding:'10px', background:'transparent', color:COLORS.textDim, border:`1px solid ${COLORS.border}`, borderRadius:10, fontFamily:FONT_UI, fontSize:12, fontWeight:500, cursor:'pointer' }}>Set time</button>
              <button onClick={() => goDaily(t.id)} style={{ flex:1, padding:'10px', background:'transparent', color:COLORS.textDim, border:`1px solid ${COLORS.border}`, borderRadius:10, fontFamily:FONT_UI, fontSize:12, fontWeight:500, cursor:'pointer' }}>Daily Log</button>
              <button onClick={() => ctrl.askConfirm({ title:'Reset stopwatch?', message:`This will clear the time and all laps for "${t.name}". This cannot be undone.`, confirmLabel:'Reset', destructive:true, onConfirm:() => api.reset(t.id) })} style={{ flex:1, padding:'10px', background:'transparent', color:COLORS.textDim, border:`1px solid ${COLORS.border}`, borderRadius:10, fontFamily:FONT_UI, fontSize:12, fontWeight:500, cursor:'pointer' }}>Reset</button>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, padding:'10px 2px 0', borderTop:`1px solid ${COLORS.border}` }}>
              <span style={{ fontSize:10, color:COLORS.textMuted, letterSpacing:1, textTransform:'uppercase', fontWeight:700, marginRight:'auto' }}>Color</span>
              {ACCENT_COLORS.map((c) => (
                <button key={c} onClick={() => api.setColor(t.id,c)} style={{ width:16, height:16, borderRadius:8, background:c, border:c===t.color?`2px solid ${COLORS.text}`:'2px solid transparent', cursor:'pointer', padding:0 }}/>
              ))}
            </div>
          </div>
          <div style={{ marginTop:22 }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', padding:'0 4px 10px' }}>
              <div style={{ fontSize:11, color:COLORS.textMuted, letterSpacing:1.2, textTransform:'uppercase', fontWeight:700 }}>Laps</div>
              <div style={{ fontSize:11, color:COLORS.textMuted, letterSpacing:0.6 }}>name · split · total</div>
            </div>
            {t.laps.length === 0 ? (
              <div style={{ padding:'32px 0', textAlign:'center', color:COLORS.textMuted, fontSize:13, border:`1px dashed ${COLORS.border}`, borderRadius:12 }}>
                {running ? 'Tap LAP to record what you finished.' : 'No laps yet.'}
              </div>
            ) : (
              <div style={{ background:COLORS.surface, border:`1px solid ${COLORS.border}`, borderRadius:14, overflow:'hidden' }}>
                {[...t.laps].reverse().map((l,ri) => {
                  const i = t.laps.length-1-ri;
                  const prev = i===0 ? 0 : t.laps[i-1].atMs;
                  const delta = l.atMs - prev;
                  return (
                    <div key={l.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:ri===t.laps.length-1?'none':`1px solid ${COLORS.border}` }}>
                      <div style={{ fontFamily:FONT_DIGITS, fontSize:11, color:COLORS.textMuted, width:24 }}>{String(i+1).padStart(2,'0')}</div>
                      <div style={{ flex:1, fontSize:14, fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{l.name}</div>
                      <div style={{ fontFamily:FONT_DIGITS, fontSize:12, color:t.color, fontWeight:500 }}>+{fmtHuman(delta)}</div>
                      <div style={{ fontFamily:FONT_DIGITS, fontSize:13, color:COLORS.text, minWidth:60, textAlign:'right' }}>{fmtCompact(l.atMs)}</div>
                      <button onClick={() => api.deleteLap(t.id,l.id)} style={{ background:'transparent', border:'none', color:COLORS.textMuted, cursor:'pointer', padding:4, fontSize:12 }}>&#10005;</button>
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

  const atHome   = nav.view==='home';
  const atDetail = nav.view==='detail';
  const atDaily  = nav.view==='daily';
  const atGlobal = nav.view==='global';

  return (
    <div style={{ height:'100%', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', inset:0, transform:(!atHome&&!atGlobal)?'translateX(-30%)':'translateX(0)', opacity:(!atHome&&!atGlobal)?0.4:(atGlobal?0:1), transition:'transform .28s cubic-bezier(.2,.7,.3,1), opacity .28s', pointerEvents:atHome?'auto':'none' }}>
        {Home}
      </div>
      <div style={{ position:'absolute', inset:0, transform:atDetail?'translateX(0)':atDaily?'translateX(-30%)':'translateX(100%)', opacity:atDaily?0.4:1, transition:'transform .28s cubic-bezier(.2,.7,.3,1), opacity .28s', boxShadow:(atDetail||atDaily)?'-8px 0 24px rgba(0,0,0,0.3)':'none' }}>
        {Detail}
      </div>
      <div style={{ position:'absolute', inset:0, transform:atDaily?'translateX(0)':'translateX(100%)', transition:'transform .28s cubic-bezier(.2,.7,.3,1)', boxShadow:atDaily?'-8px 0 24px rgba(0,0,0,0.3)':'none' }}>
        {selected && <DailyLogView timer={selected} now={now} onBack={() => goDetail(selected.id)}/>}
      </div>
      <div style={{ position:'absolute', inset:0, transform:atGlobal?'translateX(0)':'translateX(100%)', transition:'transform .28s cubic-bezier(.2,.7,.3,1)', boxShadow:atGlobal?'-8px 0 24px rgba(0,0,0,0.3)':'none' }}>
        <GlobalLogView timers={state.timers} now={now} onBack={goHome}/>
      </div>
      <ControllerOverlays ctrl={ctrl}/>
    </div>
  );
}

Object.assign(window, { VariationCombined });

