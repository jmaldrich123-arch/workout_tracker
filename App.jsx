import { useState, useEffect, useRef, useCallback, useMemo } from "react";
/* ═══════════════════════ WARMUP DATA ═══════════════════════ */
const WARMUPS = {
  mon: {
    stability: [
      { name: "Single-Leg Glute Bridge ISO (top)", duration: "20s/side" },
      { name: "Dead Hang (passive)", duration: "30s" },
      { name: "Tall Kneeling Pallof Hold", duration: "15s/side" },
    ],
    dynamic: [
      { name: "Inchworm to World's Greatest", reps: "5" },
      { name: "Band Dislocates", reps: "15" },
      { name: "Hip 90/90 + Rotation", reps: "8/side" },
      { name: "Scap Push-Ups", reps: "12" },
      { name: "Banded Face Pull + External Rot", reps: "12" },
      { name: "Bodyweight RDL to Squat Flow", reps: "8" },
    ],
    plyo: [
      { name: "Broad Jumps", reps: "3×3" },
      { name: "Plyo Push-Ups", reps: "3×5" },
    ],
  },
  wed: {
    stability: [
      { name: "ISO Bottom Push-Up Hold", duration: "15s ×2" },
      { name: "Single-Leg Balance Eyes Closed", duration: "20s/side" },
      { name: "Hollow Body Hold", duration: "20s ×2" },
    ],
    dynamic: [
      { name: "Banded Monster Walks", reps: "12/direction" },
      { name: "Arm Circles → Backstroke", reps: "10 each" },
      { name: "Cat-Cow + Thoracic Rotation", reps: "8/side" },
      { name: "Lateral Band Walks", reps: "12/side" },
      { name: "Shoulder CARs", reps: "5/side" },
      { name: "Leg Swings sagittal + frontal", reps: "12 each" },
    ],
    plyo: [
      { name: "Lateral Bound + Stick", reps: "3×3/side" },
      { name: "Depth Drop to Vertical Jump", reps: "3×3" },
    ],
  },
  fri: {
    stability: [
      { name: "Wall Sit ISO Hold", duration: "45s" },
      { name: "ISO Scap Pull-Up Hold (top)", duration: "15s ×2" },
      { name: "Copenhagen Plank ISO (light)", duration: "15s/side" },
    ],
    dynamic: [
      { name: "World's Greatest Stretch", reps: "5/side" },
      { name: "Prone Y-T-W Raises", reps: "8 each" },
      { name: "90/90 Hip Switches", reps: "10" },
      { name: "Ankle CARs + Calf Pumps", reps: "10/side" },
      { name: "Hindu Push-Ups", reps: "8" },
      { name: "Lateral Lunge + Reach", reps: "6/side" },
    ],
    plyo: [
      { name: "Single-Leg Box Hop-Ups", reps: "3×3/side" },
      { name: "Bounding Skips", reps: "3×5/side" },
    ],
  },
};
/* ═══════════════════════ WORKOUT DATA ═══════════════════════ */
const DEFAULT_DAYS = [
  {
    id: "mon", label: "MON", title: "FULL BODY A", subtitle: "STRENGTH BIAS", color: "#d0522e",
    circuits: [
      { name: "CIRCUIT 1", rounds: 4, rest: 150, exercises: [
        { name: "Trap Bar Deadlift", reps: "4-6" }, { name: "Box Jumps", reps: "3" },
        { name: "Incline DB Bench", reps: "6-8" }, { name: "Weighted Pull-Ups", reps: "5-7" },
      ]},
      { name: "CIRCUIT 2", rounds: 3, rest: 60, exercises: [
        { name: "Half-Kneeling Pallof Chop", reps: "8/side" }, { name: "Dips (Weighted)", reps: "8-10" },
        { name: "Eccentric Bicep Curl", reps: "6-8" },
      ]},
    ],
    finisher: { name: "CORE FINISHER", exercises: [{ name: "Hanging Leg Raise", sets: 3, reps: "10-12", rest: 30 }] },
  },
  {
    id: "wed", label: "WED", title: "FULL BODY B", subtitle: "POWER / EXPLOSIVE", color: "#3c8f3c",
    circuits: [
      { name: "CIRCUIT 1", rounds: 4, rest: 90, exercises: [
        { name: "KB Swings (Heavy)", reps: "6" }, { name: "Seated DB OH Press", reps: "6-8" },
        { name: "Chest Supported Row", reps: "8-10" }, { name: "Med Ball Rotational Slam", reps: "5/side" },
      ]},
      { name: "CIRCUIT 2", rounds: 3, rest: 75, exercises: [
        { name: "Bulgarian Split Squat", reps: "8/leg" }, { name: "Landmine Rotational Press", reps: "6/side" },
        { name: "Eccentric Hamstring Curl (4s neg)", reps: "6-8" },
      ]},
    ],
    finisher: { name: "CORE FINISHER", exercises: [{ name: "Copenhagen Plank", sets: 3, reps: "20s/side", rest: 30 }] },
  },
  {
    id: "fri", label: "FRI", title: "FULL BODY C", subtitle: "STABILITY / UNILATERAL", color: "#d99a1a",
    circuits: [
      { name: "CIRCUIT 1", rounds: 4, rest: 90, exercises: [
        { name: "KB Goblet Squat (Heavy)", reps: "6-8" }, { name: "Slow Push-Ups (4s ecc)", reps: "8-10" },
        { name: "SA DB Row", reps: "8/side" }, { name: "Single-Leg RDL", reps: "8/leg" },
      ]},
      { name: "CIRCUIT 2", rounds: 3, rest: 60, exercises: [
        { name: "Pallof Press", reps: "8/side" }, { name: "Cossack Squat", reps: "8/side" },
        { name: "Turkish Get-Up", reps: "2/side" }, { name: "Eccentric SL Calf Raise (3s)", reps: "10/leg" },
      ]},
    ],
    finisher: { name: "CORE FINISHER", exercises: [
      { name: "Weighted Dead Bug", sets: 3, reps: "8/side", rest: 30 },
      { name: "Dead Hang", sets: 2, reps: "45s", rest: 30 },
    ]},
  },
];
/* ═══════════════════════ STORAGE & UTILS ═══════════════════════ */
const store = {
  get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
  keys(prefix) { const r = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(prefix)) r.push(k); } return r.sort().reverse(); },
};
const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
const RPE_C = { 6: "#3c8f3c", 7: "#79b31e", 8: "#d99a1a", 9: "#e0722a", 10: "#d0522e" };
const COLORS = ["#d0522e", "#3c8f3c", "#d99a1a", "#3a6fd0", "#8a52c0", "#d64a80", "#1aa2c0", "#e0722a", "#5aa81e", "#c0398a"];
const uid = () => `day-${Date.now()}-${Math.floor(Math.random() * 999)}`;
const normWarmup = (w) => ({
  stability: (w?.stability || []).map((x) => ({ name: x.name, detail: x.detail || x.duration || x.reps || "" })),
  dynamic: (w?.dynamic || []).map((x) => ({ name: x.name, detail: x.detail || x.duration || x.reps || "" })),
  plyo: (w?.plyo || []).map((x) => ({ name: x.name, detail: x.detail || x.duration || x.reps || "" })),
});
const withWarmup = (arr) => arr.map((d) => ({ ...d, warmup: d.warmup ? normWarmup(d.warmup) : normWarmup(WARMUPS[d.id] || {}) }));
const buildDayTD = (d) => ({
  circuits: d.circuits.map((c) => Array.from({ length: c.rounds }, () => c.exercises.map(() => ({ weight: "", reps: "", done: false })))),
  circuitRpe: d.circuits.map(() => null),
  finisher: d.finisher.exercises.map((ex) => ({ sets: Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false })) })),
});
const buildTD = (daysArr) => daysArr.map(buildDayTD);
const reconcileTD = (d, old) => {
  const fresh = buildDayTD(d);
  if (!old) return fresh;
  fresh.circuits.forEach((circ, ci) => {
    circ.forEach((round, ri) => round.forEach((cell, ei) => { const o = old.circuits?.[ci]?.[ri]?.[ei]; if (o) fresh.circuits[ci][ri][ei] = { ...o }; }));
    if (old.circuitRpe?.[ci] != null) fresh.circuitRpe[ci] = old.circuitRpe[ci];
  });
  fresh.finisher.forEach((f, fi) => f.sets.forEach((s, si) => { const o = old.finisher?.[fi]?.sets?.[si]; if (o) f.sets[si] = { ...o }; }));
  return fresh;
};
const getSessionLogs = () => {
  const keys = store.keys("log:");
  return keys.map((k) => { const d = store.get(k); if (!d) return null; const parts = k.split(":"); return { key: k, date: parts[1], dayId: parts[2], ...d }; }).filter(Boolean);
};
const calcVolume = (sessionData) => {
  let vol = 0;
  if (sessionData?.circuits) sessionData.circuits.forEach((c) => c.forEach((round) => round.forEach((s) => { if (s.done && s.weight && s.reps) vol += parseFloat(s.weight) * parseInt(s.reps); })));
  if (sessionData?.finisher) sessionData.finisher.forEach((ex) => ex.sets.forEach((s) => { if (s.done && s.weight && s.reps) vol += parseFloat(s.weight) * parseInt(s.reps); }));
  return vol;
};
const getPrevSessionWeights = (logs, dayId) => {
  const dayLogs = logs.filter((l) => l.dayId === dayId).sort((a, b) => b.date.localeCompare(a.date));
  return dayLogs.length ? dayLogs[0].data : null;
};
/* ═══════════════════════ ANALYTICS ═══════════════════════ */
const EPLEY = (w, reps) => w * (1 + (reps || 1) / 30);
const incFor = (w) => (w >= 225 ? 15 : w >= 135 ? 10 : w >= 65 ? 5 : 2.5);
const roundToInc = (w, inc) => Math.round(w / inc) * inc;
const weekStart = (dstr) => { const dt = new Date(dstr); const off = (dt.getDay() + 6) % 7; dt.setDate(dt.getDate() - off); return dt.toISOString().slice(0, 10); };
const buildExerciseStats = (logs, dayMap) => {
  const series = {};
  logs.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach((log) => {
    const dd = dayMap[log.dayId]; if (!dd || !log.data?.circuits) return;
    dd.circuits.forEach((circ, ci) => circ.exercises.forEach((ex, ei) => {
      let top = null, bestE = null; const rpe = log.data.circuitRpe?.[ci] ?? null;
      log.data.circuits[ci]?.forEach((round) => { const s = round[ei]; if (s?.done && s.weight) { const w = parseFloat(s.weight), r = parseInt(s.reps) || 0; if (top == null || w > top) top = w; const e = EPLEY(w, r); if (bestE == null || e > bestE) bestE = e; } });
      if (top != null) (series[ex.name] = series[ex.name] || []).push({ date: log.date, top, e1rm: Math.round(bestE), rpe });
    }));
  });
  return series;
};
const suggestNext = (entries) => {
  if (!entries || !entries.length) return null;
  const last = entries[entries.length - 1];
  const inc = incFor(last.top), rpe = last.rpe;
  if (rpe == null) return { target: last.top, inc: 0, tone: "hold", msg: `Last set ${last.top} lb. Log RPE for a tailored jump.` };
  if (rpe <= 7) { const t = roundToInc(last.top + inc, 2.5); return { target: t, inc: t - last.top, tone: "up", msg: `Felt easy @${rpe} — go ${t} lb (+${t - last.top})` }; }
  if (rpe === 8) { const half = Math.max(2.5, roundToInc(inc / 2, 2.5)); const t = last.top + half; return { target: t, inc: half, tone: "up", msg: `Dialed @8 — nudge to ${t} lb (+${half})` }; }
  return { target: last.top, inc: 0, tone: "hold", msg: `Tough @${rpe} — repeat ${last.top} lb, add a rep` };
};
const isStalled = (e) => e && e.length >= 3 && e.slice(-3).every((x) => x.top === e[e.length - 1].top);
const SUGGESTIONS = {
  "Posterior Chain": ["Romanian Deadlift", "Nordic Hamstring Curl", "Kettlebell Swing", "Hip Thrust", "Good Morning", "Back Extension"],
  "Explosiveness": ["Box Jump", "Med Ball Slam", "Broad Jump", "Power Clean", "Depth Jump", "Kettlebell Swing"],
  "Upper Body": ["Weighted Pull-Up", "Incline DB Bench", "Seated OH Press", "Chest Supported Row", "Weighted Dip", "Face Pull"],
  "Lower Body": ["Front Squat", "Bulgarian Split Squat", "Goblet Squat", "Walking Lunge", "Leg Press", "Cossack Squat"],
  "Core / Stability": ["Hanging Leg Raise", "Pallof Press", "Copenhagen Plank", "Weighted Dead Bug", "Ab Wheel", "Suitcase Carry"],
  "Conditioning": ["Assault Bike Intervals", "Rowing Erg", "Sled Push", "Burpees", "Farmer Carry", "Jump Rope"],
};
/* ═══════════════════════ AUDIO ═══════════════════════ */
const AC = () => { try { return new (window.AudioContext || window.webkitAudioContext)(); } catch { return null; } };
const blip = (freq = 660, dur = 0.08) => { const ctx = AC(); if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.value = freq; o.connect(g); g.connect(ctx.destination); g.gain.setValueAtTime(0.14, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur); o.start(); o.stop(ctx.currentTime + dur); };
const chime = (notes) => { const ctx = AC(); if (!ctx) return; notes.forEach(([f, t]) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.type = "square"; o.frequency.value = f; o.connect(g); g.connect(ctx.destination); const s = ctx.currentTime + t; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.15, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.16); o.start(s); o.stop(s + 0.18); }); };
const restDoneSfx = () => chime([[523, 0], [523, 0.1], [784, 0.2]]);
const clearSfx = () => chime([[523, 0], [659, 0.11], [784, 0.22], [1046, 0.34]]);
const buzz = (ms = 15) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch {} };
const tap = () => { blip(880, 0.045); buzz(8); };
/* ═══════════════════════ THEME (Gen-3 / Emerald) ═══════════════════════ */
const T = {
  bg: "#c3d2e8", plate: "#fbf4d6", plateB: "#7c7048", box: "#fffef8", frame: "#5b78bd", inner: "#cdddf4",
  ink: "#3a3320", inkSoft: "#7a7150", inkMute: "#a89e78",
  track: "#524726", trackB: "#2f2810", cursor: "#e0402a",
  green: "#5ec85e", greenD: "#2c7a2c", blue: "#4a90e2", amber: "#e0a11a", red: "#d0522e", purple: "#8a52c0", run: "#f0872e",
};
const dlg = (frame) => ({ background: T.box, border: `3px solid ${frame || T.frame}`, borderRadius: 12, boxShadow: `inset 0 0 0 2px ${T.inner}` });
const plate = () => ({ background: T.plate, border: `2px solid ${T.plateB}`, borderRadius: 10 });
const pbtn = (bg, fg) => ({ background: bg, color: fg, border: `2px solid ${T.frame}`, borderRadius: 9, cursor: "pointer", fontFamily: "var(--font)" });
const field = (w) => ({ width: w, padding: "6px 5px", background: "#fffef8", border: `2px solid #b0a882`, borderRadius: 7, color: T.ink, fontSize: 13, fontFamily: "var(--font)", outline: "none", textAlign: "center" });
const hpWrap = { height: 12, background: T.track, border: `2px solid ${T.trackB}`, borderRadius: 7, overflow: "hidden" };
function Cur({ color }) { return <span style={{ display: "inline-block", width: 0, height: 0, borderLeft: `8px solid ${color || T.cursor}`, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", verticalAlign: 1 }} />; }
/* ═══════════════════════ SHARED UI ═══════════════════════ */
function Toast({ msg, accent }) {
  if (!msg) return null;
  return <div style={{ position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)", zIndex: 1200, ...dlg(), padding: "9px 16px", color: T.ink, fontSize: 13, display: "flex", alignItems: "center", gap: 8, maxWidth: "88vw", animation: "toastIn 0.2s ease" }}><Cur color={accent} />{msg}</div>;
}
function Modal({ children, onClose }) {
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1100, background: "#1a2340cc", display: "flex", alignItems: "flex-end", justifyContent: "center", animation: "fadeIn 0.15s ease" }}>
    <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, maxHeight: "88vh", overflowY: "auto", ...dlg(), padding: "16px 16px 26px", animation: "sheetUp 0.24s cubic-bezier(.2,.8,.2,1)" }}>
      <div style={{ width: 44, height: 5, background: T.inner, borderRadius: 3, margin: "0 auto 14px" }} />{children}
    </div>
  </div>;
}
function ConfirmDialog({ title, body, confirmLabel, accent, onConfirm, onClose }) {
  return <Modal onClose={onClose}>
    <div style={{ fontSize: 16, fontWeight: 600, color: T.ink, marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 14, color: T.inkSoft, marginBottom: 18, lineHeight: 1.5 }}>{body}</div>
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onClose} style={{ flex: 1, padding: "11px", ...pbtn(T.plate, T.inkSoft), fontSize: 13 }}>Cancel</button>
      <button onClick={() => { tap(); onConfirm(); onClose(); }} style={{ flex: 1, padding: "11px", ...pbtn(accent, "#fff"), fontSize: 13 }}>{confirmLabel}</button>
    </div>
  </Modal>;
}
function RestTimer({ duration, onDone }) {
  const [left, setLeft] = useState(duration);
  const [total, setTotal] = useState(duration);
  const [paused, setPaused] = useState(false);
  const cb = useRef(onDone); cb.current = onDone;
  const fired = useRef(false);
  useEffect(() => {
    if (left <= 0) { if (!fired.current) { fired.current = true; restDoneSfx(); buzz([90, 40, 90]); } cb.current(); return; }
    if (paused) return;
    const t = setTimeout(() => setLeft((l) => l - 1), 1000); return () => clearTimeout(t);
  }, [left, paused]);
  const pct = ((total - left) / total) * 100, near = left <= 10;
  const btn = { ...pbtn(T.plate, T.ink), padding: "6px 8px", fontSize: 12 };
  return <div style={{ position: "fixed", bottom: 58, left: 0, right: 0, zIndex: 999, background: T.box, borderTop: `3px solid ${T.frame}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 5 }}>Rest{paused ? " · paused" : ""}</div>
      <div style={hpWrap}><div style={{ height: "100%", width: `${pct}%`, background: near ? T.red : T.green, transition: "width 1s linear" }} /></div>
    </div>
    <span style={{ fontSize: 18, fontWeight: 600, color: near ? T.red : T.ink, minWidth: 52, textAlign: "right" }}>{fmt(left)}</span>
    <button onClick={() => { tap(); setLeft((l) => l + 15); setTotal((t) => t + 15); }} style={btn}>+15</button>
    <button onClick={() => { tap(); setPaused((p) => !p); }} style={btn}>{paused ? "▶" : "❚❚"}</button>
    <button onClick={() => { tap(); onDone(); }} style={btn}>Skip</button>
  </div>;
}
function BottomNav({ tab, setTab, accent }) {
  const tabs = [{ id: "workout", label: "TRAIN" }, { id: "history", label: "STATS" }, { id: "calendar", label: "CAL" }, { id: "daily", label: "DAILY" }];
  return <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 998, background: T.frame, display: "flex", height: 58, padding: "6px 8px", gap: 6 }}>
    {tabs.map((t) => { const on = tab === t.id; return <button key={t.id} onClick={() => { tap(); setTab(t.id); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, ...pbtn(on ? "#fff4e6" : "#eef2fb", on ? "#b4531b" : "#4a5878"), border: `2px solid ${on ? T.cursor : "#9db4dd"}`, fontSize: 12, fontWeight: 600 }}>{on && <Cur />}{t.label}</button>; })}
  </div>;
}
function WarmupSection({ dayId, warmup, accent, checks, setChecks, editMode, dayIdx, onEdit, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const w = warmup || { stability: [], dynamic: [], plyo: [] };
  const cats = [["stability", "Iso / stability"], ["dynamic", "Dynamic"], ["plyo", "Plyo primers"]];
  const all = [...w.stability, ...w.dynamic, ...w.plyo];
  const total = all.length;
  const done = Object.values(checks[dayId] || {}).filter(Boolean).length;
  const allDone = done === total && total > 0;
  const toggle = (idx) => { tap(); setChecks((p) => { const dc = { ...(p[dayId] || {}) }; dc[idx] = !dc[idx]; return { ...p, [dayId]: dc }; }); };
  if (!editMode && total === 0) return null;
  const shown = editMode || open;
  return <div style={{ margin: "0 12px 10px", ...dlg(), overflow: "hidden" }}>
    <button onClick={() => { tap(); setOpen(!open); }} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 12px", background: "none", border: "none", cursor: "pointer" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, fontWeight: 600, color: accent }}>Warm-up</span><span style={{ fontSize: 12, color: T.inkSoft }}>{editMode ? "edit" : `${done}/${total}${allDone ? " ✓" : ""}`}</span></span>
      <span style={{ color: T.inkSoft, fontSize: 11, transform: shown ? "rotate(180deg)" : "none", display: "inline-block" }}>▼</span>
    </button>
    {shown && <div style={{ padding: "0 12px 12px" }}>
      {cats.map(([key, label], ci) => <div key={key}>
        {ci > 0 && <div style={{ height: 2, background: T.inner, margin: "8px 0" }} />}
        <div style={{ fontSize: 11, color: accent, marginBottom: 4, fontWeight: 600 }}>{label}</div>
        {editMode ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {w[key].map((item, i) => <div key={i} style={{ ...plate(), padding: "6px 8px", display: "flex", alignItems: "center", gap: 6 }}>
            <input value={item.name} onChange={(e) => onEdit(dayIdx, key, i, "name", e.target.value)} style={{ ...field("auto"), flex: 1, textAlign: "left", fontSize: 13 }} />
            <input value={item.detail} onChange={(e) => onEdit(dayIdx, key, i, "detail", e.target.value)} placeholder="30s" style={field(56)} />
            <button onClick={() => onRemove(dayIdx, key, i)} style={{ background: T.red, border: `2px solid ${T.plateB}`, color: "#fff", fontSize: 12, cursor: "pointer", padding: "1px 6px", borderRadius: 5 }}>×</button>
          </div>)}
          <button onClick={() => onAdd(dayIdx, key)} style={{ padding: "7px", border: `2px dashed ${T.inkMute}`, borderRadius: 8, background: T.box, color: T.inkSoft, fontFamily: "var(--font)", fontSize: 12, cursor: "pointer" }}>+ add</button>
        </div> : w[key].map((item, i) => { const idx = `${key[0]}${i}`; const ck = !!(checks[dayId] || {})[idx]; return <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 0", opacity: ck ? 0.4 : 1 }}>
          <button onClick={() => toggle(idx)} style={{ width: 18, height: 18, border: `2px solid ${T.plateB}`, background: ck ? accent : "#fffef8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, borderRadius: 5 }}>{ck && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</button>
          <span style={{ fontSize: 14, color: T.ink, flex: 1 }}>{item.name}</span>
          <span style={{ fontSize: 12, color: T.inkSoft }}>{item.detail}</span>
        </div>; })}
      </div>)}
    </div>}
  </div>;
}
/* ═══════════════════════ CIRCUIT CARD ═══════════════════════ */
function CircuitCard({ circuit, cIdx, circuitCount, trackData, rpe, accent, dayIdx, editMode, prevData, onEdit, onRemoveEx, onAddEx, onMoveEx, onRoundsChange, onRestChange, onCircuitName, onRemoveCircuit, onSetChange, onCheck, onRpe, onApplyAll, startRest }) {
  const [open, setOpen] = useState(true);
  const cDone = trackData.reduce((a, round) => a + round.filter((s) => s.done).length, 0);
  const cTot = trackData.reduce((a, round) => a + round.length, 0);
  return <div style={{ margin: "0 12px 12px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        {editMode ? <input value={circuit.name} onChange={(e) => onCircuitName(dayIdx, cIdx, e.target.value)} style={{ ...field(110), textAlign: "left", color: accent, fontWeight: 600 }} /> : <span style={{ fontSize: 13, fontWeight: 600, color: accent }}>{circuit.name}</span>}
        {editMode ? <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <input value={String(circuit.rounds)} onChange={(e) => onRoundsChange(dayIdx, cIdx, e.target.value)} style={field(26)} /><span style={{ color: T.inkSoft, fontSize: 11 }}>rnd</span>
          <input value={String(circuit.rest)} onChange={(e) => onRestChange(dayIdx, cIdx, e.target.value)} style={{ ...field(34), marginLeft: 4 }} /><span style={{ color: T.inkSoft, fontSize: 11 }}>s</span>
        </div> : <button onClick={() => { tap(); setOpen(!open); }} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font)", color: T.inkSoft, fontSize: 12, padding: 0 }}>{circuit.rounds} rounds <span style={{ transform: open ? "rotate(180deg)" : "none", display: "inline-block", fontSize: 9 }}>▼</span></button>}
      </div>
      {!editMode ? <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: 10, color: T.inkSoft, marginRight: 2 }}>RPE</span>
        {[6, 7, 8, 9, 10].map((r) => <button key={r} onClick={() => onRpe(cIdx, r)} style={{ width: 21, height: 21, fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer", fontFamily: "var(--font)", border: `2px solid ${T.plateB}`, background: rpe === r ? RPE_C[r] : T.plate, color: rpe === r ? "#fff" : T.inkMute }}>{r}</button>)}
      </div> : circuitCount > 1 && <button onClick={() => onRemoveCircuit(dayIdx, cIdx)} style={{ ...pbtn(T.red, "#fff"), fontSize: 11, padding: "5px 8px" }}>✕ circuit</button>}
    </div>
    {editMode ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {circuit.exercises.map((ex, ei) => <div key={ei} style={{ ...plate(), padding: "7px 9px", display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button onClick={() => onMoveEx(dayIdx, cIdx, ei, -1)} disabled={ei === 0} style={{ background: "none", border: "none", color: ei === 0 ? T.inkMute : T.ink, cursor: ei === 0 ? "default" : "pointer", fontSize: 9, lineHeight: 1, padding: 0 }}>▲</button>
          <button onClick={() => onMoveEx(dayIdx, cIdx, ei, 1)} disabled={ei === circuit.exercises.length - 1} style={{ background: "none", border: "none", color: ei === circuit.exercises.length - 1 ? T.inkMute : T.ink, cursor: ei === circuit.exercises.length - 1 ? "default" : "pointer", fontSize: 9, lineHeight: 1, padding: 0 }}>▼</button>
        </div>
        <input value={ex.name} onChange={(e) => onEdit(dayIdx, cIdx, ei, "name", e.target.value)} style={{ ...field("auto"), flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600 }} />
        <input value={ex.reps} onChange={(e) => onEdit(dayIdx, cIdx, ei, "reps", e.target.value)} style={field(56)} />
        <button onClick={() => onRemoveEx(dayIdx, cIdx, ei)} style={{ background: T.red, border: `2px solid ${T.plateB}`, color: "#fff", fontSize: 12, cursor: "pointer", padding: "1px 6px", borderRadius: 5 }}>×</button>
      </div>)}
      <button onClick={() => onAddEx(dayIdx, cIdx)} style={{ padding: "8px", border: `2px dashed ${T.inkMute}`, borderRadius: 8, background: T.box, color: T.inkSoft, fontFamily: "var(--font)", fontSize: 12, cursor: "pointer" }}>+ add exercise</button>
    </div> : !open ? <div style={{ ...plate(), padding: "8px 10px", fontSize: 12, color: T.inkSoft }}>{cDone}/{cTot} sets done · tap to expand</div> : Array.from({ length: circuit.rounds }, (_, ri) => <div key={ri} style={{ marginBottom: ri < circuit.rounds - 1 ? 5 : 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0 2px" }}>
        <span style={{ fontSize: 11, color: T.inkSoft }}>Round {ri + 1}</span>
        {ri === 0 && circuit.rounds > 1 && <button onClick={() => onApplyAll(cIdx)} style={{ fontSize: 11, fontFamily: "var(--font)", color: "#fff", background: accent, border: `2px solid ${T.plateB}`, borderRadius: 6, padding: "2px 8px", cursor: "pointer" }}>copy all ↓</button>}
      </div>
      <div style={{ ...plate(), padding: "6px 9px" }}>
        {circuit.exercises.map((ex, ei) => {
          const sd = trackData[ri]?.[ei] || { weight: "", reps: "", done: false };
          const pw = prevData?.[ri]?.[ei]?.weight || "", pr = prevData?.[ri]?.[ei]?.reps || "";
          return <div key={ei} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 6, alignItems: "center", padding: "4px 0", opacity: sd.done ? 0.4 : 1 }}>
            <button onClick={() => { tap(); onCheck(cIdx, ri, ei); if (!sd.done) startRest(circuit.rest); }} style={{ width: 20, height: 20, borderRadius: 5, cursor: "pointer", flexShrink: 0, border: `2px solid ${T.plateB}`, background: sd.done ? accent : "#fffef8", display: "flex", alignItems: "center", justifyContent: "center" }}>{sd.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</button>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14, color: T.ink, flex: 1 }}>{ex.name}</span>
              <input type="number" inputMode="decimal" placeholder={pw || "lb"} value={sd.weight} onChange={(e) => onSetChange(cIdx, ri, ei, "weight", e.target.value)} style={field(46)} />
              <span style={{ color: T.inkMute, fontSize: 11 }}>×</span>
              <input type="number" inputMode="numeric" placeholder={pr || ex.reps} value={sd.reps} onChange={(e) => onSetChange(cIdx, ri, ei, "reps", e.target.value)} style={field(34)} />
            </div>
          </div>;
        })}
      </div>
    </div>)}
  </div>;
}
function FinisherCard({ finisher, trackData, accent, editMode, dayIdx, onCheck, onSetChange, startRest, onEditFinisher, onRemoveFinisher, onAddFinisher }) {
  return <div style={{ margin: "0 12px 10px" }}>
    <div style={{ fontSize: 13, fontWeight: 600, color: accent, marginBottom: 6 }}>▼ {finisher.name}</div>
    {editMode ? <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {finisher.exercises.map((ex, ei) => <div key={ei} style={{ ...plate(), padding: "7px 9px", display: "flex", alignItems: "center", gap: 5 }}>
        <input value={ex.name} onChange={(e) => onEditFinisher(dayIdx, ei, "name", e.target.value)} style={{ ...field("auto"), flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600 }} />
        <input value={String(ex.sets)} onChange={(e) => onEditFinisher(dayIdx, ei, "sets", e.target.value)} style={field(26)} /><span style={{ color: T.inkMute, fontSize: 11 }}>×</span>
        <input value={ex.reps} onChange={(e) => onEditFinisher(dayIdx, ei, "reps", e.target.value)} style={field(46)} />
        <input value={String(ex.rest)} onChange={(e) => onEditFinisher(dayIdx, ei, "rest", e.target.value)} style={field(30)} /><span style={{ color: T.inkMute, fontSize: 10 }}>s</span>
        <button onClick={() => onRemoveFinisher(dayIdx, ei)} style={{ background: T.red, border: `2px solid ${T.plateB}`, color: "#fff", fontSize: 12, cursor: "pointer", padding: "1px 6px", borderRadius: 5 }}>×</button>
      </div>)}
      <button onClick={() => onAddFinisher(dayIdx)} style={{ padding: "8px", border: `2px dashed ${T.inkMute}`, borderRadius: 8, background: T.box, color: T.inkSoft, fontFamily: "var(--font)", fontSize: 12, cursor: "pointer" }}>+ add finisher</button>
    </div> : finisher.exercises.map((ex, ei) => <div key={ei} style={{ ...plate(), padding: "8px 10px", marginBottom: 6 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 1 }}>{ex.name}</div>
      <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 4 }}>{ex.sets}×{ex.reps} · {ex.rest}s</div>
      {trackData[ei]?.sets.map((sd, si) => <div key={si} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 6, alignItems: "center", padding: "3px 0", opacity: sd.done ? 0.4 : 1 }}>
        <button onClick={() => { tap(); onCheck(ei, si); if (!sd.done) startRest(ex.rest); }} style={{ width: 20, height: 20, borderRadius: 5, cursor: "pointer", border: `2px solid ${T.plateB}`, background: sd.done ? accent : "#fffef8", display: "flex", alignItems: "center", justifyContent: "center" }}>{sd.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</button>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ color: T.inkSoft, fontSize: 11, width: 16 }}>S{si + 1}</span>
          <input type="number" inputMode="decimal" placeholder="lb" value={sd.weight} onChange={(e) => onSetChange(ei, si, "weight", e.target.value)} style={field(46)} />
          <span style={{ color: T.inkMute, fontSize: 11 }}>×</span>
          <input type="number" inputMode="numeric" placeholder={ex.reps} value={sd.reps} onChange={(e) => onSetChange(ei, si, "reps", e.target.value)} style={field(34)} />
        </div>
      </div>)}
    </div>)}
  </div>;
}
function DayBuilder({ day, dayIdx, dayCount, onMeta, onColor, onAddCircuit, onAddDay, onDuplicateDay, onRemoveDay }) {
  const inp = { padding: "8px 9px", background: "#fffef8", border: `2px solid #b0a882`, borderRadius: 7, color: T.ink, fontSize: 14, fontFamily: "var(--font)", outline: "none", width: "100%", fontWeight: 600 };
  const btn = { ...pbtn(T.plate, T.ink), padding: "8px", fontSize: 11 };
  return <div style={{ margin: "0 12px 12px", ...dlg(), padding: "12px" }}>
    <div style={{ fontSize: 12, color: day.color, fontWeight: 600, marginBottom: 10 }}>◆ Day setup</div>
    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
      <input value={day.label} onChange={(e) => onMeta(dayIdx, "label", e.target.value.toUpperCase())} placeholder="TAB" style={{ ...inp, width: 64, textAlign: "center", fontSize: 12 }} />
      <input value={day.title} onChange={(e) => onMeta(dayIdx, "title", e.target.value)} placeholder="Day title" style={inp} />
    </div>
    <input value={day.subtitle} onChange={(e) => onMeta(dayIdx, "subtitle", e.target.value)} placeholder="Subtitle / focus" style={{ ...inp, fontWeight: 400, fontSize: 12, color: T.inkSoft, marginBottom: 12 }} />
    <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 6 }}>Accent</div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
      {COLORS.map((c) => <button key={c} onClick={() => { tap(); onColor(dayIdx, c); }} style={{ width: 26, height: 26, borderRadius: 7, background: c, border: day.color === c ? `3px solid ${T.ink}` : `2px solid ${T.inkMute}`, cursor: "pointer" }} />)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <button onClick={() => onAddCircuit(dayIdx)} style={{ ...btn, background: day.color, color: "#fff" }}>+ circuit</button>
      <button onClick={() => onDuplicateDay(dayIdx)} style={btn}>⧉ duplicate day</button>
      <button onClick={onAddDay} style={btn}>+ new day</button>
      <button onClick={() => onRemoveDay(dayIdx)} disabled={dayCount <= 1} style={{ ...btn, background: dayCount <= 1 ? T.plate : T.red, color: dayCount <= 1 ? T.inkMute : "#fff" }}>✕ delete day</button>
    </div>
  </div>;
}
function SessionSummary({ day, trackData, elapsed, onClose, toast }) {
  const vol = calcVolume(trackData);
  let total = 0, done = 0;
  trackData.circuits.forEach((c) => c.forEach((r) => r.forEach((s) => { total++; if (s.done) done++; })));
  trackData.finisher.forEach((e) => e.sets.forEach((s) => { total++; if (s.done) done++; }));
  const pct = total ? Math.round((done / total) * 100) : 0;
  const lines = [];
  day.circuits.forEach((circ, ci) => circ.exercises.forEach((ex, ei) => {
    let best = null;
    trackData.circuits[ci]?.forEach((round) => { const s = round[ei]; if (s?.done && s.weight) { const w = parseFloat(s.weight); if (!best || w > best.w) best = { w, reps: s.reps }; } });
    if (best) lines.push({ name: ex.name, detail: `${best.w}×${best.reps || "?"}`, rpe: trackData.circuitRpe[ci] });
  }));
  useEffect(() => { clearSfx(); }, []);
  const shareText = [`${day.title} — ${day.subtitle}`, `${fmt(elapsed)} · ${pct}% clear${vol > 0 ? ` · ${vol.toLocaleString()} lb vol` : ""}`, "", ...lines.map((l) => `• ${l.name}: ${l.detail}`)].join("\n");
  const copy = async () => { try { await navigator.clipboard.writeText(shareText); toast("Copied to clipboard"); } catch { toast("Copy failed"); } };
  return <Modal onClose={onClose}>
    <div style={{ textAlign: "center", fontSize: 14, color: day.color, fontWeight: 600, marginBottom: 12 }}>Session clear!</div>
    <div style={{ ...plate(), padding: 14, marginBottom: 12 }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{day.title}</div>
      <div style={{ fontSize: 11, color: T.inkSoft }}>{day.subtitle}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
        {[{ l: "Time", v: fmt(elapsed) }, { l: "Clear", v: `${pct}%` }, { l: "Vol", v: vol > 0 ? vol.toLocaleString() : "—" }].map((s) => <div key={s.l} style={{ background: "#fffef8", border: `2px solid ${T.plateB}`, borderRadius: 8, padding: "9px 4px", textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.ink }}>{s.v}</div>
          <div style={{ fontSize: 10, color: T.inkSoft, marginTop: 3 }}>{s.l}</div>
        </div>)}
      </div>
    </div>
    {lines.length > 0 && <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: T.inkSoft, marginBottom: 6 }}>Top sets</div>
      {lines.map((l, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < lines.length - 1 ? `2px solid ${T.inner}` : "none" }}>
        <span style={{ fontSize: 14, color: T.ink }}>{l.name}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{l.rpe && <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", background: RPE_C[l.rpe], border: `2px solid ${T.plateB}`, borderRadius: 5, padding: "1px 5px" }}>@{l.rpe}</span>}<span style={{ fontSize: 14, fontWeight: 600, color: day.color }}>{l.detail}</span></span>
      </div>)}
    </div>}
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onClose} style={{ flex: 1, padding: "12px", ...pbtn(T.plate, T.inkSoft), fontSize: 13 }}>Close</button>
      <button onClick={copy} style={{ flex: 2, padding: "12px", ...pbtn(day.color, "#fff"), fontSize: 13 }}>Copy summary</button>
    </div>
  </Modal>;
}
function GoalsEditor({ goals, liftNames, onSave, onClose }) {
  const [g, setG] = useState(() => ({ weeklySessions: goals.weeklySessions || "", weeklyVolume: goals.weeklyVolume || "", lifts: (goals.lifts || []).map((x) => ({ ...x })) }));
  const inp = { padding: "8px 9px", background: "#fffef8", border: `2px solid #b0a882`, borderRadius: 7, color: T.ink, fontSize: 13, fontFamily: "var(--font)", outline: "none", width: "100%" };
  const lbl = { fontSize: 11, color: T.inkSoft, marginBottom: 5 };
  const addLift = () => setG((p) => ({ ...p, lifts: [...p.lifts, { name: liftNames[0] || "", target: "" }] }));
  const setLift = (i, k, v) => setG((p) => { const l = p.lifts.map((x) => ({ ...x })); l[i][k] = v; return { ...p, lifts: l }; });
  const rmLift = (i) => setG((p) => ({ ...p, lifts: p.lifts.filter((_, j) => j !== i) }));
  const save = () => { onSave({ weeklySessions: parseInt(g.weeklySessions) || 0, weeklyVolume: parseInt(g.weeklyVolume) || 0, lifts: g.lifts.filter((x) => x.name && x.target).map((x) => ({ name: x.name, target: parseFloat(x.target) })) }); onClose(); };
  return <Modal onClose={onClose}>
    <div style={{ fontSize: 15, fontWeight: 600, color: T.ink, marginBottom: 14 }}>Set goals</div>
    <div style={lbl}>Sessions per week</div>
    <input type="number" inputMode="numeric" value={g.weeklySessions} onChange={(e) => setG((p) => ({ ...p, weeklySessions: e.target.value }))} placeholder="3" style={{ ...inp, marginBottom: 12 }} />
    <div style={lbl}>Weekly volume (lb)</div>
    <input type="number" inputMode="numeric" value={g.weeklyVolume} onChange={(e) => setG((p) => ({ ...p, weeklyVolume: e.target.value }))} placeholder="40000" style={{ ...inp, marginBottom: 12 }} />
    <div style={lbl}>Lift targets</div>
    {g.lifts.map((l, i) => <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
      {liftNames.length ? <select value={l.name} onChange={(e) => setLift(i, "name", e.target.value)} style={{ ...inp, flex: 1 }}>{liftNames.map((n) => <option key={n} value={n}>{n}</option>)}</select> : <input value={l.name} onChange={(e) => setLift(i, "name", e.target.value)} placeholder="Lift" style={{ ...inp, flex: 1 }} />}
      <input type="number" inputMode="decimal" value={l.target} onChange={(e) => setLift(i, "target", e.target.value)} placeholder="lb" style={{ ...inp, width: 66 }} />
      <button onClick={() => rmLift(i)} style={{ ...pbtn(T.red, "#fff"), padding: "0 10px", fontSize: 13 }}>×</button>
    </div>)}
    <button onClick={addLift} style={{ width: "100%", padding: "8px", border: `2px dashed ${T.inkMute}`, borderRadius: 8, background: T.box, color: T.inkSoft, fontFamily: "var(--font)", fontSize: 12, cursor: "pointer", marginBottom: 14 }}>+ add lift target</button>
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={onClose} style={{ flex: 1, padding: "12px", ...pbtn(T.plate, T.inkSoft), fontSize: 13 }}>Cancel</button>
      <button onClick={save} style={{ flex: 2, padding: "12px", ...pbtn(T.green, "#fff"), fontSize: 13 }}>Save goals</button>
    </div>
  </Modal>;
}
function LineChart({ series, color, height = 72 }) {
  if (!series || series.length < 2) return <div style={{ fontSize: 13, color: T.inkSoft, padding: "10px 0" }}>Log 2+ sessions to see the trend.</div>;
  const vals = series.map((s) => s.v), min = Math.min(...vals), max = Math.max(...vals), range = max - min || 1;
  const W = 320, H = height, pad = 8;
  const pts = series.map((s, i) => [pad + (i / (series.length - 1)) * (W - 2 * pad), pad + (1 - (s.v - min) / range) * (H - 2 * pad)]);
  const line = pts.map((p) => p.join(",")).join(" ");
  const area = `${pad},${H - pad} ${line} ${W - pad},${H - pad}`;
  return <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height, display: "block" }} role="img" aria-label="Progress trend">
    <polygon points={area} fill={color + "22"} />
    <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinejoin="round" />
    {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length - 1 ? 4.5 : 3} fill={i === pts.length - 1 ? T.red : color} />)}
  </svg>;
}
/* ═══════════════════════ STATS TAB ═══════════════════════ */
function HistoryTab({ days, toast, activeDayLabel, onAddSuggested }) {
  const [logs] = useState(() => getSessionLogs());
  const [expanded, setExpanded] = useState(null);
  const [goals, setGoals] = useState(() => store.get("goals-v1") || { weeklySessions: 3, weeklyVolume: 0, lifts: [] });
  const [editingGoals, setEditingGoals] = useState(false);
  const [selLift, setSelLift] = useState(null);
  const [ideaCat, setIdeaCat] = useState(null);
  useEffect(() => { store.set("goals-v1", goals); }, [goals]);
  const dayMap = {}; days.forEach((d) => { dayMap[d.id] = d; });
  const streak = useMemo(() => { const dates = [...new Set(logs.map((l) => l.date))].sort().reverse(); if (!dates.length) return 0; let c = 1; for (let i = 1; i < dates.length; i++) { if ((new Date(dates[i - 1]) - new Date(dates[i])) / 86400000 <= 3) c++; else break; } return c; }, [logs]);
  const prMap = useMemo(() => { const prs = {}; logs.forEach((log) => { const d = log.data; if (!d?.circuits) return; const dd = dayMap[log.dayId]; if (!dd) return; dd.circuits.forEach((circ, ci) => circ.exercises.forEach((ex, ei) => d.circuits[ci]?.forEach((round) => { const s = round[ei]; if (s?.done && s.weight) { const w = parseFloat(s.weight); if (!prs[ex.name] || w > prs[ex.name]) prs[ex.name] = w; } }))); }); return prs; }, [logs]);
  const exStats = useMemo(() => buildExerciseStats(logs, dayMap), [logs]);
  const liftNames = useMemo(() => Object.keys(exStats).sort(), [exStats]);
  const curLift = selLift && exStats[selLift] ? selLift : liftNames[0];
  const thisWeek = weekStart(new Date().toISOString().slice(0, 10));
  const weekSessions = useMemo(() => new Set(logs.filter((l) => weekStart(l.date) === thisWeek).map((l) => l.date)).size, [logs, thisWeek]);
  const weekVol = useMemo(() => logs.filter((l) => weekStart(l.date) === thisWeek).reduce((a, l) => a + calcVolume(l.data), 0), [logs, thisWeek]);
  const sectionLabel = (t) => <div style={{ fontSize: 11, color: T.frame, fontWeight: 600, letterSpacing: 1, margin: "0 2px 8px", textTransform: "uppercase" }}>{t}</div>;

  return <div style={{ padding: "12px" }}>
    {editingGoals && <GoalsEditor goals={goals} liftNames={liftNames} onSave={(gg) => { setGoals(gg); toast("Goals saved"); }} onClose={() => setEditingGoals(false)} />}

    {logs.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
      {[{ l: "Sessions", v: logs.length, c: T.ink }, { l: "Streak", v: streak, c: T.red }, { l: "Top vol", v: Math.max(...logs.map((x) => calcVolume(x.data))).toLocaleString(), c: T.ink }].map((s) => <div key={s.l} style={{ ...plate(), textAlign: "center", padding: "9px 4px" }}><div style={{ fontSize: 18, fontWeight: 600, color: s.c }}>{s.v}</div><div style={{ fontSize: 11, color: T.inkSoft }}>{s.l}</div></div>)}
    </div>}

    <div style={{ ...dlg(), padding: "11px 12px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: T.frame }}>Goals</span>
        <button onClick={() => { tap(); setEditingGoals(true); }} style={{ ...pbtn(T.plate, T.ink), fontSize: 11, padding: "5px 10px" }}>Edit</button>
      </div>
      {(() => {
        const rows = [];
        if (goals.weeklySessions) rows.push({ label: "Sessions this week", cur: weekSessions, tgt: goals.weeklySessions, unit: "" });
        if (goals.weeklyVolume) rows.push({ label: "Weekly volume", cur: Math.round(weekVol), tgt: goals.weeklyVolume, unit: " lb" });
        (goals.lifts || []).forEach((lf) => { const best = exStats[lf.name] ? Math.max(...exStats[lf.name].map((e) => e.top)) : 0; rows.push({ label: lf.name, cur: best, tgt: lf.target, unit: " lb" }); });
        if (!rows.length) return <div style={{ fontSize: 13, color: T.inkSoft }}>No goals yet — tap Edit to set weekly targets and lift PRs to chase.</div>;
        return rows.map((r, i) => { const p = Math.max(0, Math.min(100, (r.cur / r.tgt) * 100)); const hit = r.cur >= r.tgt; return <div key={i} style={{ marginBottom: i < rows.length - 1 ? 10 : 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span style={{ color: T.ink }}>{hit ? "★ " : ""}{r.label}</span><span style={{ color: hit ? T.greenD : T.inkSoft }}>{r.cur.toLocaleString()}{r.unit} / {Number(r.tgt).toLocaleString()}{r.unit}</span></div>
          <div style={hpWrap}><div style={{ height: "100%", width: `${p}%`, background: hit ? T.green : T.blue }} /></div>
        </div>; });
      })()}
    </div>

    <div style={{ ...dlg(), padding: "11px 12px", marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.purple, marginBottom: 2 }}>Need ideas?</div>
      <div style={{ fontSize: 12, color: T.inkSoft, marginBottom: 9 }}>Tap an area for moves to add to {activeDayLabel}.</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: ideaCat ? 11 : 0 }}>
        {Object.keys(SUGGESTIONS).map((c) => { const on = ideaCat === c; return <button key={c} onClick={() => { tap(); setIdeaCat(on ? null : c); }} style={{ ...pbtn(on ? T.purple : "#f2e6fb", on ? "#fff" : "#6a3fa0"), border: `2px solid ${on ? T.cursor : "#c8a6ec"}`, fontSize: 11, padding: "6px 8px", display: "flex", alignItems: "center", gap: 5 }}>{on && <Cur />}{c}</button>; })}
      </div>
      {ideaCat && <div style={{ ...plate(), borderColor: "#c8a6ec", background: "#faf3ff", padding: "5px 10px" }}>
        {SUGGESTIONS[ideaCat].map((n, i) => <div key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < SUGGESTIONS[ideaCat].length - 1 ? `2px solid #eaddf7` : "none" }}>
          <span style={{ fontSize: 13, color: T.ink }}>{n}</span>
          <button onClick={() => { tap(); onAddSuggested(n); toast(`Added ${n} to ${activeDayLabel}`); }} style={{ ...pbtn("#efe1fb", "#6a3fa0"), border: `2px solid ${T.purple}`, fontSize: 11, padding: "4px 9px" }}>+ Add</button>
        </div>)}
      </div>}
    </div>

    {liftNames.length > 0 && <div style={{ ...dlg(), padding: "11px 12px", marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.frame, marginBottom: 9 }}>Lift progress</div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 11 }}>
        {liftNames.map((n) => { const on = curLift === n; return <button key={n} onClick={() => { tap(); setSelLift(n); }} style={{ ...pbtn(on ? "#fff4e6" : "#eef2fb", on ? "#b4531b" : "#4a5878"), border: `2px solid ${on ? T.cursor : "#9db4dd"}`, fontSize: 11, padding: "6px 8px", whiteSpace: "nowrap", flexShrink: 0, display: "flex", alignItems: "center", gap: 5 }}>{on && <Cur />}{n}</button>; })}
      </div>
      {curLift && exStats[curLift] && (() => {
        const ents = exStats[curLift], sug = suggestNext(ents);
        const pr = Math.max(...ents.map((e) => e.top)), bestE = Math.max(...ents.map((e) => e.e1rm)), stalled = isStalled(ents);
        const ladder = ents.slice(-4);
        return <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 11 }}>
            <div style={{ flex: 1, ...plate(), textAlign: "center", padding: "7px" }}><div style={{ fontSize: 17, fontWeight: 600, color: T.ink }}>{pr} lb</div><div style={{ fontSize: 10, color: T.inkSoft }}>Top set</div></div>
            <div style={{ flex: 1, ...plate(), textAlign: "center", padding: "7px" }}><div style={{ fontSize: 17, fontWeight: 600, color: T.ink }}>{bestE} lb</div><div style={{ fontSize: 10, color: T.inkSoft }}>Est 1RM</div></div>
          </div>
          <LineChart series={ents.map((e) => ({ v: e.e1rm }))} color={T.blue} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flexWrap: "wrap", margin: "10px 0 11px", fontSize: 13 }}>
            {ladder.map((e, i) => <span key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ color: i === ladder.length - 1 ? T.ink : T.inkSoft, fontWeight: i === ladder.length - 1 ? 600 : 400 }}>{e.top}</span>
              {i < ladder.length - 1 && <span style={{ color: T.inkMute }}>→</span>}
            </span>)}
            {sug.inc > 0 && <span style={{ background: "#e4f5e4", border: `2px solid ${T.green}`, borderRadius: 6, padding: "1px 7px", color: T.greenD }}>+{sug.inc} next</span>}
          </div>
          <div style={{ ...plate(), borderColor: sug.tone === "up" ? "#7dbf7d" : "#e0c98a", background: sug.tone === "up" ? "#eef9ee" : "#fdf6e6", padding: "9px 11px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: sug.tone === "up" ? T.greenD : "#9a7a10", marginBottom: 2 }}>Next session</div>
            <div style={{ fontSize: 14, color: T.ink }}>{sug.msg}</div>
            {stalled && <div style={{ fontSize: 12, color: T.red, marginTop: 4 }}>Stalled 3 sessions — try a deload or add reps.</div>}
          </div>
        </div>;
      })()}
    </div>}

    {Object.keys(prMap).length > 0 && <div style={{ ...dlg(), padding: "11px 12px", marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: T.amber, marginBottom: 8 }}>Badges · PRs</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {Object.entries(prMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, w]) => <div key={name} style={{ background: "#fffef8", border: `2px solid ${T.plateB}`, borderRadius: 8, padding: "5px 8px" }}><div style={{ fontSize: 12, color: T.ink }}>{name}</div><div style={{ fontSize: 14, fontWeight: 600, color: T.amber }}>{w} lb</div></div>)}
      </div>
    </div>}

    {logs.length > 0 ? <>{sectionLabel("Session log")}
      {logs.map((log, i) => {
        const dd = dayMap[log.dayId], vol = calcVolume(log.data);
        let total = 0, done = 0;
        if (log.data?.circuits) log.data.circuits.forEach((c) => c.forEach((r) => r.forEach((s) => { total++; if (s.done) done++; })));
        if (log.data?.finisher) log.data.finisher.forEach((e) => e.sets.forEach((s) => { total++; if (s.done) done++; }));
        const compPct = total ? Math.round((done / total) * 100) : 0, isExp = expanded === i;
        return <div key={log.key} onClick={() => { tap(); setExpanded(isExp ? null : i); }} style={{ ...dlg(), padding: "11px 12px", marginBottom: 8, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 14, fontWeight: 600, color: dd?.color || T.ink }}>{dd?.title || log.dayId}</span><span style={{ fontSize: 11, color: T.inkSoft }}>{log.date}</span></div>
              <div style={{ fontSize: 12, color: T.inkSoft, marginTop: 3 }}>{fmt(log.elapsed || 0)} · {compPct}% clear{vol > 0 ? ` · ${vol.toLocaleString()} lb` : ""}</div>
            </div>
            <div style={{ width: 38, height: 38, border: `2px solid ${T.plateB}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, background: compPct === 100 ? (dd?.color || T.plate) : "#fffef8", color: compPct === 100 ? "#fff" : T.inkSoft }}>{compPct}%</div>
          </div>
          {isExp && log.data?.circuits && dd && <div style={{ marginTop: 10, borderTop: `2px solid ${T.inner}`, paddingTop: 8 }}>
            {dd.circuits.map((circ, ci) => <div key={ci} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: dd.color, marginBottom: 4 }}>{circ.name}</div>
              {circ.exercises.map((ex, ei) => { const weights = []; log.data.circuits[ci]?.forEach((round) => { const s = round[ei]; if (s?.weight) weights.push(`${s.weight}×${s.reps || "?"}`); }); return weights.length ? <div key={ei} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span style={{ fontSize: 13, color: T.ink }}>{ex.name}</span><span style={{ fontSize: 12, color: T.inkSoft }}>{weights.join(" → ")}</span></div> : null; })}
            </div>)}
          </div>}
        </div>;
      })}
    </> : <div style={{ ...plate(), padding: "22px 16px", textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 600, color: T.ink, marginBottom: 6 }}>No sessions yet</div><div style={{ fontSize: 13, color: T.inkSoft }}>Clear a workout to start filling in your stats.</div></div>}
  </div>;
}
/* ═══════════════════════ CALENDAR TAB ═══════════════════════ */
function CalendarTab({ accent }) {
  const [runs, setRuns] = useState(() => store.get("runs-v1") || {});
  const [logs] = useState(() => getSessionLogs());
  const [off, setOff] = useState(0);
  const liftDates = useMemo(() => new Set(logs.map((l) => l.date)), [logs]);
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + off);
  const year = base.getFullYear(), month = base.getMonth();
  const monthName = base.toLocaleString("default", { month: "long", year: "numeric" });
  const startDow = new Date(year, month, 1).getDay();
  const daysIn = new Date(year, month + 1, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const iso = (d) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const toggleRun = (ds) => { tap(); setRuns((p) => { const n = { ...p }; if (n[ds]) delete n[ds]; else n[ds] = true; store.set("runs-v1", n); return n; }); };
  let liftCount = 0, runCount = 0;
  for (let d = 1; d <= daysIn; d++) { if (liftDates.has(iso(d))) liftCount++; if (runs[iso(d)]) runCount++; }
  const cells = []; for (let i = 0; i < startDow; i++) cells.push(null); for (let d = 1; d <= daysIn; d++) cells.push(d);
  const Legend = ({ c, label }) => <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: T.ink }}><span style={{ width: 14, height: 14, background: c, border: `2px solid ${T.plateB}`, borderRadius: 4 }} />{label}</span>;
  return <div style={{ padding: "12px" }}>
    <div style={{ ...dlg(), padding: "11px 12px", marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => { tap(); setOff((o) => o - 1); }} style={{ ...pbtn(T.plate, T.ink), padding: "5px 11px", fontSize: 14 }}>◀</button>
        <span style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>{monthName}</span>
        <button onClick={() => { tap(); setOff((o) => o + 1); }} style={{ ...pbtn(T.plate, T.ink), padding: "5px 11px", fontSize: 14 }}>▶</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 5 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, color: T.inkSoft }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const ds = iso(d), lifted = liftDates.has(ds), ran = !!runs[ds], isToday = ds === today;
          let bg = "#fffef8", col = T.inkSoft;
          if (lifted && ran) { bg = `linear-gradient(135deg, ${T.blue} 50%, ${T.run} 50%)`; col = "#fff"; }
          else if (lifted) { bg = T.blue; col = "#fff"; }
          else if (ran) { bg = T.run; col = "#fff"; }
          return <button key={i} onClick={() => toggleRun(ds)} style={{ aspectRatio: "1", background: bg, border: `2px solid ${isToday ? T.cursor : T.plateB}`, borderRadius: 7, cursor: "pointer", color: col, fontSize: 13, fontWeight: lifted || ran ? 600 : 400, fontFamily: "var(--font)", display: "flex", alignItems: "center", justifyContent: "center" }}>{d}</button>;
        })}
      </div>
    </div>
    <div style={{ ...dlg(), padding: "11px 12px", marginBottom: 12, display: "flex", justifyContent: "space-around" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 600, color: T.blue }}>{liftCount}</div><div style={{ fontSize: 11, color: T.inkSoft }}>Lifts</div></div>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 600, color: T.run }}>{runCount}</div><div style={{ fontSize: 11, color: T.inkSoft }}>Runs</div></div>
    </div>
    <div style={{ ...plate(), padding: "10px 12px", display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
      <Legend c={T.blue} label="Lift" /><Legend c={T.run} label="Run" /><Legend c={`linear-gradient(135deg,${T.blue} 50%,${T.run} 50%)`} label="Both" />
    </div>
    <div style={{ fontSize: 12, color: T.inkSoft, textAlign: "center", marginTop: 10, lineHeight: 1.5 }}>Lifts fill in automatically when you save a session. Tap any day to check off a run.</div>
  </div>;
}
/* ═══════════════════════ FUEL TAB ═══════════════════════ */
const DEFAULT_REMINDERS = [
  { id: "protein", label: "Hit protein goal" }, { id: "water", label: "Water — 128 oz" },
  { id: "vitamins", label: "Vitamins" }, { id: "creatine", label: "Creatine" },
  { id: "mobility", label: "Mobility / stretch" }, { id: "reading", label: "Reading" }, { id: "journaling", label: "Journaling" },
];
function RemindersTab({ toast }) {
  const today = new Date().toISOString().slice(0, 10);
  const [items, setItems] = useState(() => store.get("reminders-v1") || DEFAULT_REMINDERS);
  const [checks, setChecks] = useState(() => store.get(`daily:${today}`) || {});
  const [editMode, setEditMode] = useState(false);
  useEffect(() => { store.set("reminders-v1", items); }, [items]);
  useEffect(() => { store.set(`daily:${today}`, checks); }, [checks, today]);
  const toggle = (id) => { tap(); setChecks((p) => ({ ...p, [id]: !p[id] })); };
  const rename = (id, label) => setItems((p) => p.map((x) => x.id === id ? { ...x, label } : x));
  const remove = (id) => setItems((p) => p.filter((x) => x.id !== id));
  const add = () => { tap(); setItems((p) => [...p, { id: `r${Date.now()}`, label: "New reminder" }]); };
  const doneC = items.filter((x) => checks[x.id]).length;
  const pct = items.length ? Math.round((doneC / items.length) * 100) : 0;
  return <div style={{ padding: "12px" }}>
    <div style={{ ...dlg(), padding: "12px 14px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div><div style={{ fontSize: 15, fontWeight: 600, color: T.ink }}>Daily</div><div style={{ fontSize: 11, color: T.inkSoft, marginTop: 3 }}>{today} · {doneC}/{items.length} done</div></div>
      <button onClick={() => { tap(); setEditMode(!editMode); }} style={{ ...pbtn(editMode ? T.frame : T.plate, editMode ? "#fff" : T.inkSoft), fontSize: 11, padding: "6px 10px" }}>{editMode ? "✓ Done" : "Edit"}</button>
    </div>
    <div style={{ ...dlg(), padding: "6px 12px", marginBottom: 12 }}>
      {items.map((m, i) => editMode ? <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", borderBottom: i < items.length - 1 ? `2px solid ${T.inner}` : "none" }}>
        <input value={m.label} onChange={(e) => rename(m.id, e.target.value)} style={{ ...field("auto"), flex: 1, textAlign: "left", fontSize: 14 }} />
        <button onClick={() => remove(m.id)} style={{ background: T.red, border: `2px solid ${T.plateB}`, color: "#fff", fontSize: 12, cursor: "pointer", padding: "1px 7px", borderRadius: 5 }}>×</button>
      </div> : <div key={m.id} onClick={() => toggle(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < items.length - 1 ? `2px solid ${T.inner}` : "none", cursor: "pointer", opacity: checks[m.id] ? 0.45 : 1 }}>
        <div style={{ width: 20, height: 20, border: `2px solid ${T.plateB}`, borderRadius: 5, background: checks[m.id] ? T.green : "#fffef8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{checks[m.id] && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</div>
        <span style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{m.label}</span>
      </div>)}
      {editMode && <button onClick={add} style={{ width: "100%", padding: "8px", border: `2px dashed ${T.inkMute}`, borderRadius: 8, background: T.box, color: T.inkSoft, fontFamily: "var(--font)", fontSize: 12, cursor: "pointer", margin: "6px 0" }}>+ add reminder</button>}
    </div>
    <div style={{ ...plate(), padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10, color: T.inkSoft, fontStyle: "italic", fontWeight: 700 }}>HP</span>
        <div style={{ flex: 1, ...hpWrap }}><div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? T.green : T.blue }} /></div>
        <span style={{ fontSize: 11, fontWeight: 600, color: pct === 100 ? T.greenD : T.ink }}>{pct}%</span>
      </div>
    </div>
    <div style={{ fontSize: 10, color: T.inkMute, textAlign: "center", marginTop: 14 }}>Font: PokePixel GBA by <a href="https://pokeprint.kimbachu.com" style={{ color: T.frame }}>PokéPrint</a></div>
  </div>;
}
/* ═══════════════════════ MAIN APP ═══════════════════════ */
export default function App() {
  const [tab, setTab] = useState("workout");
  const [activeDay, setActiveDay] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [warmupChecks, setWarmupChecks] = useState({});
  const [days, setDays] = useState(() => withWarmup(JSON.parse(JSON.stringify(DEFAULT_DAYS))));
  const [trackData, setTrackData] = useState(() => buildTD(DEFAULT_DAYS));
  const [toastMsg, setToastMsg] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [summary, setSummary] = useState(null);
  const loadedRef = useRef(false);
  const toastRef = useRef(null);
  const toast = useCallback((msg) => { setToastMsg(msg); clearTimeout(toastRef.current); toastRef.current = setTimeout(() => setToastMsg(""), 1800); }, []);

  useEffect(() => {
    if (loadedRef.current) return; loadedRef.current = true;
    const s = store.get("circuit-v2");
    if (s) { if (s.days) setDays(withWarmup(s.days)); if (s.trackData) setTrackData(s.trackData); if (s.warmupChecks) setWarmupChecks(s.warmupChecks); }
    const ss = store.get("circuit-session-v2"); if (ss) setSessionStart(ss);
  }, []);
  useEffect(() => { if (!sessionStart) return; const t = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000); return () => clearInterval(t); }, [sessionStart]);

  const safeDay = Math.min(activeDay, days.length - 1);
  const day = days[safeDay];
  const td = trackData[safeDay] || buildDayTD(day);
  const prevSessionData = useMemo(() => getPrevSessionWeights(getSessionLogs(), day.id), [day.id]);

  const ensureSession = useCallback(() => { if (!sessionStart) { const t = Date.now(); setSessionStart(t); store.set("circuit-session-v2", t); } }, [sessionStart]);
  const startRest = useCallback((dur) => { setRestTimer(dur); ensureSession(); }, [ensureSession]);

  const onCircuitCheck = useCallback((ci, ri, ei) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[safeDay].circuits[ci][ri][ei].done = !n[safeDay].circuits[ci][ri][ei].done; return n; }); ensureSession(); }, [safeDay, ensureSession]);
  const onCircuitSetChange = useCallback((ci, ri, ei, f, v) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[safeDay].circuits[ci][ri][ei][f] = v; return n; }); }, [safeDay]);
  const onCircuitRpe = useCallback((ci, v) => { tap(); setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[safeDay].circuitRpe[ci] = n[safeDay].circuitRpe[ci] === v ? null : v; return n; }); }, [safeDay]);
  const onApplyAll = useCallback((ci) => { tap(); setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); const r0 = n[safeDay].circuits[ci][0]; if (!r0) return p; for (let ri = 1; ri < n[safeDay].circuits[ci].length; ri++) r0.forEach((s, ei) => { if (s.weight) n[safeDay].circuits[ci][ri][ei].weight = s.weight; if (s.reps) n[safeDay].circuits[ci][ri][ei].reps = s.reps; }); return n; }); toast("Copied to all rounds"); }, [safeDay, toast]);
  const onFinisherCheck = useCallback((ei, si) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[safeDay].finisher[ei].sets[si].done = !n[safeDay].finisher[ei].sets[si].done; return n; }); ensureSession(); }, [safeDay, ensureSession]);
  const onFinisherSetChange = useCallback((ei, si, f, v) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[safeDay].finisher[ei].sets[si][f] = v; return n; }); }, [safeDay]);

  const commitDays = useCallback((nextDays, rebuild = false) => { setDays(nextDays); if (rebuild) setTrackData((old) => { const nt = []; for (let i = 0; i < nextDays.length; i++) nt[i] = reconcileTD(nextDays[i], old[i]); return nt; }); }, []);
  const onEditEx = useCallback((di, ci, ei, f, v) => { const n = JSON.parse(JSON.stringify(days)); n[di].circuits[ci].exercises[ei][f] = v; setDays(n); }, [days]);
  const onCircuitName = useCallback((di, ci, v) => { const n = JSON.parse(JSON.stringify(days)); n[di].circuits[ci].name = v; setDays(n); }, [days]);
  const onRestChange = useCallback((di, ci, v) => { const n = JSON.parse(JSON.stringify(days)); n[di].circuits[ci].rest = parseInt(v) || 0; setDays(n); }, [days]);
  const onDayMeta = useCallback((di, f, v) => { const n = JSON.parse(JSON.stringify(days)); n[di][f] = v; setDays(n); }, [days]);
  const onDayColor = useCallback((di, c) => { const n = JSON.parse(JSON.stringify(days)); n[di].color = c; setDays(n); }, [days]);
  const onAddEx = useCallback((di, ci) => { tap(); const n = JSON.parse(JSON.stringify(days)); n[di].circuits[ci].exercises.push({ name: "New Exercise", reps: "8" }); commitDays(n, true); }, [days, commitDays]);
  const onRemoveEx = useCallback((di, ci, ei) => { const n = JSON.parse(JSON.stringify(days)); if (n[di].circuits[ci].exercises.length <= 1) { toast("Keep 1+ exercise"); return; } n[di].circuits[ci].exercises.splice(ei, 1); commitDays(n, true); }, [days, commitDays, toast]);
  const onMoveEx = useCallback((di, ci, ei, dir) => { const tgt = ei + dir, arr = days[di].circuits[ci].exercises; if (tgt < 0 || tgt >= arr.length) return; tap(); const n = JSON.parse(JSON.stringify(days)); const a = n[di].circuits[ci].exercises; [a[ei], a[tgt]] = [a[tgt], a[ei]]; setDays(n); setTrackData((p) => { const t = JSON.parse(JSON.stringify(p)); t[di].circuits[ci].forEach((round) => { [round[ei], round[tgt]] = [round[tgt], round[ei]]; }); return t; }); }, [days]);
  const onRoundsChange = useCallback((di, ci, v) => { const nr = Math.max(1, parseInt(v) || 1); const n = JSON.parse(JSON.stringify(days)); n[di].circuits[ci].rounds = nr; commitDays(n, true); }, [days, commitDays]);
  const onAddCircuit = useCallback((di) => { tap(); const n = JSON.parse(JSON.stringify(days)); n[di].circuits.push({ name: `CIRCUIT ${n[di].circuits.length + 1}`, rounds: 3, rest: 90, exercises: [{ name: "New Exercise", reps: "8-10" }] }); commitDays(n, true); toast("Circuit added"); }, [days, commitDays, toast]);
  const onRemoveCircuit = useCallback((di, ci) => { const n = JSON.parse(JSON.stringify(days)); if (n[di].circuits.length <= 1) { toast("Keep 1+ circuit"); return; } n[di].circuits.splice(ci, 1); commitDays(n, true); toast("Circuit removed"); }, [days, commitDays, toast]);
  const onEditFinisher = useCallback((di, ei, f, v) => { const n = JSON.parse(JSON.stringify(days)); if (f === "sets") { n[di].finisher.exercises[ei].sets = Math.max(1, parseInt(v) || 1); commitDays(n, true); return; } if (f === "rest") n[di].finisher.exercises[ei].rest = parseInt(v) || 0; else n[di].finisher.exercises[ei][f] = v; setDays(n); }, [days, commitDays]);
  const onRemoveFinisher = useCallback((di, ei) => { const n = JSON.parse(JSON.stringify(days)); if (n[di].finisher.exercises.length <= 1) { toast("Keep 1+ finisher"); return; } n[di].finisher.exercises.splice(ei, 1); commitDays(n, true); }, [days, commitDays, toast]);
  const onAddFinisher = useCallback((di) => { tap(); const n = JSON.parse(JSON.stringify(days)); n[di].finisher.exercises.push({ name: "New Exercise", sets: 3, reps: "10", rest: 30 }); commitDays(n, true); }, [days, commitDays]);
  const onWarmupEdit = useCallback((di, cat, idx, f, v) => { const n = JSON.parse(JSON.stringify(days)); n[di].warmup[cat][idx][f] = v; setDays(n); }, [days]);
  const onWarmupAdd = useCallback((di, cat) => { tap(); const n = JSON.parse(JSON.stringify(days)); n[di].warmup[cat].push({ name: "New warm-up", detail: "" }); setDays(n); }, [days]);
  const onWarmupRemove = useCallback((di, cat, idx) => { const n = JSON.parse(JSON.stringify(days)); n[di].warmup[cat].splice(idx, 1); setDays(n); }, [days]);
  const onAddSuggested = useCallback((name) => { const n = JSON.parse(JSON.stringify(days)); n[safeDay].circuits[0].exercises.push({ name, reps: "8-10" }); commitDays(n, true); }, [days, safeDay, commitDays]);
  const onAddDay = useCallback(() => { tap(); const n = JSON.parse(JSON.stringify(days)); const color = COLORS[n.length % COLORS.length]; n.push({ id: uid(), label: `D${n.length + 1}`, title: "NEW DAY", subtitle: "CUSTOM", color, warmup: { stability: [], dynamic: [], plyo: [] }, circuits: [{ name: "CIRCUIT 1", rounds: 3, rest: 90, exercises: [{ name: "New Exercise", reps: "8-10" }] }], finisher: { name: "FINISHER", exercises: [{ name: "New Exercise", sets: 3, reps: "10", rest: 30 }] } }); commitDays(n, true); setActiveDay(n.length - 1); toast("Day added"); }, [days, commitDays, toast]);
  const onDuplicateDay = useCallback((di) => { tap(); const n = JSON.parse(JSON.stringify(days)); const clone = JSON.parse(JSON.stringify(n[di])); clone.id = uid(); clone.title = clone.title + " COPY"; n.splice(di + 1, 0, clone); commitDays(n, true); setActiveDay(di + 1); toast("Day duplicated"); }, [days, commitDays, toast]);
  const onRemoveDay = useCallback((di) => { if (days.length <= 1) { toast("Keep 1+ day"); return; } setConfirm({ title: "Delete this day?", body: `"${days[di].title}" and its layout will be removed. Saved history is untouched.`, confirmLabel: "Delete", accent: T.red, onConfirm: () => { const n = JSON.parse(JSON.stringify(days)); n.splice(di, 1); commitDays(n, true); setActiveDay((a) => Math.max(0, Math.min(a, n.length - 1))); toast("Day deleted"); } }); }, [days, commitDays, toast]);

  const saveSession = () => {
    setSaving(true);
    store.set("circuit-v2", { days, trackData, warmupChecks });
    const dk = `log:${new Date().toISOString().slice(0, 10)}:${day.id}`;
    store.set(dk, { day: day.id, elapsed, data: trackData[safeDay], ts: Date.now() });
    setSaved(true);
    setSummary({ day, trackData: trackData[safeDay], elapsed });
    setTimeout(() => { setSaved(false); setSaving(false); }, 1200);
  };
  const doReset = () => { setSessionStart(null); setElapsed(0); store.del("circuit-session-v2"); setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[safeDay] = buildDayTD(days[safeDay]); return n; }); setWarmupChecks((p) => ({ ...p, [day.id]: {} })); toast("Session reset"); };
  const resetSession = () => setConfirm({ title: "Reset this session?", body: "Clears all weights, reps, checks and the timer for this day. Can't be undone.", confirmLabel: "Reset", accent: T.red, onConfirm: doReset });

  let totalC = 0, doneC = 0;
  td.circuits.forEach((c) => c.forEach((r) => r.forEach((s) => { totalC++; if (s.done) doneC++; })));
  td.finisher.forEach((e) => e.sets.forEach((s) => { totalC++; if (s.done) doneC++; }));
  const pct = totalC ? Math.round((doneC / totalC) * 100) : 0;

  return <div style={{ "--font": "'PokePixel GBA','Pixelify Sans',monospace", minHeight: "100vh", background: T.bg, backgroundImage: "repeating-linear-gradient(45deg,rgba(255,255,255,0.16) 0 2px,transparent 2px 9px)", color: T.ink, fontFamily: "var(--font)", paddingBottom: 72 }}>
    <style>{`
      @font-face{font-family:'PokePixel GBA';src:url(data:font/woff2;base64,d09GMgABAAAAAAiYAAoAAAAAO/QAAAhKAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAABmAAhhAK4FSnQgE2AiQDg0QLgWQABCAFiD4HIBvNHTOjdoNRqqT4PyRwQwa8pvoKCIEKL9SGodZYzYRuG6GajdiqhO53UIGDes2ki085+RcCtTde6fc7asPXdnOfkBAJ4+EgqrGyB3bv9okgjOUJhAEgBYAu9SpkDAr/woWYf/CX7c8b3iYrVyLHOLwhmSsMVTpkVaBw7ZemfvxuTvMHIgLEVgcrc34ugDLkj7PkeX2CSngJn4g2APofXOB7pvaGw+YQdmo1s5W6EnAHKwk7738rLj2l/TLkX83//y5rdv+VUhQ1NIswpQqPUAh3m0nmk8lmQ2m7c3OtDb1MstxjdpauepPnTlEkGqN4GIHxGIXQGOVQlpeo5pF5Z398kRNVxpjwVKWE6MeY/9Wgy/NxyY4vKPjfUKAY9RY4ADjOgAIA1szfy3k0rRPOf8oJQADaBGgCoMBAGSOQW3MchTZNnNvEUZ7e3T+/vL3/+vffr7W6qb6ppWni/3+gyRZoR1VT3b/Z/Z+0PHLbDZeddcZRh+y1vVuXDv8ahr85FnwvwA4AJskFmZ/SWbNm0c9SLlJJooLACCVE4ESUoVxgMgJlAkLlxlwUCFhOWAu+qjNZsgqTBAwCo7RSMYxtUGiUAkAoWiZqhwAZfBMBEIIo4lucTE+P0YdtlJW517iOoVsLf3xbNE1c2/PLXPdJFZtcyaJ1lr12jOeJzLRRFZGrNR/xeX5l3vEax4mVx8HjVHYo4qnwHrdOvX/i05djrpFHmXoeZF0bNddReW80cYamUGedbp0lvtUsEypbKIW7cHot7DaLhsrdwm6orCwA4i+l2HWCo6ZHiTaVyClTT2HyxHdc9qfLTfA4A3WXhI/+IQkGGHax6FRnAQ92InwQArWQlmnpoBU0FlEZ4OQlDTlOsttcUysmdNIlEu38ygJLoT56xSynaRPfAyroq8NoiFihGCAqFngSDY911RBRw9Yzmpq6h5AwmUbhEq17VwNbgBkRE+294zhhTVsEqW9EmkJ4pPIUaWTMW+3pp+dQ146fmOoCQAFMH4FAzVFpDSAR/LuBw8TAAOH7xKVlvtddk0u+i6k/BuWwWJdaH8lRBOJFFRjFsOIQZIMaPjIBvYgsX2rhRuK5H1Fe15/ede8w5ioLzCXKS8z2ogGyOSiuynQA5a7zJr5pg8oNpdzNVBhGQiX/WZ2EeQpuOETkRgJ2PiIhdiMSmUkcXqymt8JahTVMPteml7M3NVhp8YtToL3UqFjI5QCRjwluacr0XcsiygEIRMJdmb4EKSdSCtAyVdO70YJci//23eZDmACXgVxhuXr3UGJuDPcGnPTK8YcAokBHsl2i02vYlaiYdmClyRxCizhClHcKFrmYarJZL7MXpHqkUlkZq/c6C2+MROVcOB4sjEgXyqRVieriBXjfs/pCZVn7xcCjVuB0x56XTHSJoYaXTFQx2H1umVxM2gWA6ilwDVZFcTS8kBmMIRMVyj/LTyCWuUHQ4onZ8+Q1Nf7/fLla1Uqo15t0ZBYvQdznpAl4LoHJ+HXhY8Ioal4noQQRES0TrK3eM6gKe6oH3IhQm9HIaLOKe/8Bqr90czRykvoEsb68fpwSqt8uERpWEtqzPcratDr11rZr5Tb9al7hu7C/bD8r7LpLZOlVN2QTDe48PuEMB1crh7w87aIMwQ7l0dmVYYBbo2WIQYHVHjnHnlbrohxSewas3keDu9pL1yV4Y068t9IsDpKqXRnn8H7Wwzb11ABwjpUxqFgtGTl62sUhFJe0T7NNsQ2VLXCwSjgtBWLnU54oGkS8mzWGfI5+zt4i1GYFojTuOVutPE7FZuEM1Fw1TnYl4JWNC7q1tgxgrrLYp/A7SRzMSEoSuMZuTWb5vPCVqq3ustp+Upp+n7rtUjSc/QEoT4snED8ZWPGCfIVjezbVlXA9muf4pKslf1fZ5vMxCBCxBr+m7BQcbtloe4nEBoJdVG1JpztsaBykjLW0MR1t126JuRIh5X0JRZXxXN98vgrhjAgvsmdhgqQtb/gyhUTEPAjuPbe9gEFcIJjI87/T7U8KbqjAS4FS2Yx32q8WbWeO7SmTHHqBgOPzug3xR7GzObIhVE5sti9F53YISQNOYIWKG3uyzJZETSqB0LhVjWfDyXncmGL3LG0NYusc+4s6RJiPuuUZegi2PGk+4+ezrs8rPUyN2T309iEzgj/g148f8k2Fs77WCc5b/43vB/Y+w7QLewsYTMfFDE3jfYMQROt5IIoBP3EAoKAxS5iNNtAsggYpSZF13rWsb7zaLmBDrFujJKo0CytoTXt0TVslN55gu4KmEWEadh6aJhcHwBgGq0aHA4JGRIjI10hURl/cksSVGyWBWUaiPCtJkqwiOWbbTPINuE8KDHkjSrctv1ntTMGckW2IqBlLiCoYm+PWENcztpIgjlskqhoPSFIyXpMcB+WP5Fuv2USBzYqaR6ma5Z9N4fj7Gu1i/L9XfXJ5XagdzjzlMR2H4cwtfR5zsMrUz9swEwrWg8/yaZ9epSPy4+vopfosqBrN5qfH9U3xxEfa6a/LS+eKHnL+9YbL636Fi8+j7cNn/Sc07Urhx3KwXxgSL2j8lRPb7fk6sufL1vRFXtbpX3En8eN1xwvWIgWaj9n8sNEnHM0QaagYV+qwgOV1oXY485THdLpyOHP7uz2bB3WwytSV7qnLPTgJth95lk8otuFJ+FdeOKWJW2pfc9u3WVTkASq6EVCHNQE+J+4g6CXk7z8ixULPPfKpvguvN9Rk9f0KF0tFzNKLCckHnMwlySQjhHcjwYcSK6so5X8YQ27frmO04Q3RwrrJCtn6ps9VlCiR4q0lhxhMZoBUluibUwVrUSOv3ZQ902Fr+hUAAA==) format('woff2');font-display:swap;}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes sheetUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}
      @keyframes toastIn{from{transform:translateX(-50%) translateY(10px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}
      *{-webkit-tap-highlight-color:transparent}
      button:active{transform:translate(1px,1px)}
      input,select{font-family:var(--font)}
      input:focus,select:focus{border-color:${day.color} !important}
      div::-webkit-scrollbar{display:none}
    `}</style>
    {tab === "workout" && <>
      <div style={{ padding: "12px 12px 0", position: "sticky", top: 0, zIndex: 90, background: T.bg }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
          {days.map((d, i) => { const on = safeDay === i; return <button key={d.id} onClick={() => { tap(); setActiveDay(i); setEditMode(false); }} style={{ flex: days.length <= 4 ? 1 : "0 0 auto", minWidth: days.length <= 4 ? 0 : 60, padding: "9px 10px", ...pbtn(on ? d.color : "#eef2fb", on ? "#fff" : "#4a5878"), border: `2px solid ${on ? T.cursor : "#9db4dd"}`, fontSize: 12, fontWeight: 600 }}>{d.label}</button>; })}
        </div>
        <div style={{ ...dlg(), padding: "10px 12px", marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: day.color }}>{day.title}</h1><div style={{ fontSize: 11, color: T.inkSoft, marginTop: 4 }}>{day.subtitle}</div></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => { tap(); const ne = !editMode; setEditMode(ne); if (!ne) { store.set("circuit-v2", { days, trackData, warmupChecks }); toast("Layout saved"); } }} style={{ padding: "6px 9px", ...pbtn(editMode ? day.color : T.plate, editMode ? "#fff" : T.inkSoft), fontSize: 11 }}>{editMode ? "✓ Done" : "Edit"}</button>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 15, fontWeight: 600, color: sessionStart ? T.ink : T.inkMute }}>{fmt(elapsed)}</div><div style={{ fontSize: 9, color: T.inkSoft, marginTop: 2 }}>Time</div></div>
            </div>
          </div>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: T.inkSoft, fontStyle: "italic", fontWeight: 700 }}>HP</span>
            <div style={{ flex: 1, ...hpWrap }}><div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? T.green : day.color, transition: "width 0.4s ease" }} /></div>
            <span style={{ fontSize: 11, fontWeight: 600, color: pct === 100 ? T.greenD : T.ink }}>{pct}%</span>
          </div>
        </div>
      </div>
      {editMode && <DayBuilder day={day} dayIdx={safeDay} dayCount={days.length} onMeta={onDayMeta} onColor={onDayColor} onAddCircuit={onAddCircuit} onAddDay={onAddDay} onDuplicateDay={onDuplicateDay} onRemoveDay={onRemoveDay} />}
      <WarmupSection dayId={day.id} warmup={day.warmup} accent={day.color} checks={warmupChecks} setChecks={setWarmupChecks} editMode={editMode} dayIdx={safeDay} onEdit={onWarmupEdit} onAdd={onWarmupAdd} onRemove={onWarmupRemove} />
      {day.circuits.map((c, ci) => <CircuitCard key={ci} circuit={c} cIdx={ci} circuitCount={day.circuits.length} trackData={td.circuits[ci] || []} rpe={td.circuitRpe[ci]} accent={day.color} dayIdx={safeDay} editMode={editMode} prevData={prevSessionData?.circuits?.[ci]} onEdit={onEditEx} onRemoveEx={onRemoveEx} onAddEx={onAddEx} onMoveEx={onMoveEx} onRoundsChange={onRoundsChange} onRestChange={onRestChange} onCircuitName={onCircuitName} onRemoveCircuit={onRemoveCircuit} onSetChange={onCircuitSetChange} onCheck={onCircuitCheck} onRpe={onCircuitRpe} onApplyAll={onApplyAll} startRest={startRest} />)}
      <FinisherCard finisher={day.finisher} trackData={td.finisher} accent={day.color} editMode={editMode} dayIdx={safeDay} onCheck={onFinisherCheck} onSetChange={onFinisherSetChange} startRest={startRest} onEditFinisher={onEditFinisher} onRemoveFinisher={onRemoveFinisher} onAddFinisher={onAddFinisher} />
      <div style={{ padding: "10px 12px", display: "flex", gap: 8 }}>
        <button onClick={saveSession} disabled={saving} style={{ flex: 1, padding: "13px 0", ...pbtn(saved ? T.green : day.color, "#fff"), fontSize: 14, opacity: saving ? 0.6 : 1 }}>{saved ? "✓ Saved!" : saving ? "..." : "Save session"}</button>
        <button onClick={resetSession} style={{ padding: "13px 14px", ...pbtn(T.plate, T.inkSoft), fontSize: 12 }}>Reset</button>
      </div>
    </>}
    {tab === "history" && <HistoryTab days={days} toast={toast} activeDayLabel={day.title} onAddSuggested={onAddSuggested} />}
    {tab === "calendar" && <CalendarTab accent={day.color} />}
    {tab === "daily" && <RemindersTab toast={toast} />}
    {restTimer && <RestTimer duration={restTimer} onDone={() => setRestTimer(null)} />}
    {summary && <SessionSummary day={summary.day} trackData={summary.trackData} elapsed={summary.elapsed} onClose={() => setSummary(null)} toast={toast} />}
    {confirm && <ConfirmDialog {...confirm} onClose={() => setConfirm(null)} />}
    <Toast msg={toastMsg} accent={day.color} />
    <BottomNav tab={tab} setTab={setTab} accent={day.color} />
  </div>;
}
