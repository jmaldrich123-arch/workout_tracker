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
    id: "mon", label: "MON", title: "FULL BODY A", subtitle: "STRENGTH BIAS", color: "#ff4757",
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
    id: "wed", label: "WED", title: "FULL BODY B", subtitle: "POWER / EXPLOSIVE", color: "#2ed8a3",
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
    id: "fri", label: "FRI", title: "FULL BODY C", subtitle: "STABILITY / UNILATERAL", color: "#ffc048",
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

/* ═══════════════════════ DROPDOWN OPTIONS ═══════════════════════ */

const WEIGHT_OPTIONS = (() => {
  const opts = ["BW"];
  for (let w = 5; w <= 50; w += 2.5) opts.push(String(w));
  for (let w = 55; w <= 450; w += 5) opts.push(String(w));
  return opts;
})();

const REP_OPTIONS = (() => {
  const opts = ["BW"];
  for (let r = 1; r <= 30; r++) opts.push(String(r));
  return opts;
})();

/* ═══════════════════════ STORAGE & UTILS ═══════════════════════ */

const store = {
  get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
  keys(prefix) { const r = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k.startsWith(prefix)) r.push(k); } return r.sort().reverse(); },
};

const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
const RPE_C = { 6: "#2ed8a3", 7: "#6ecf8a", 8: "#ffc048", 9: "#ff8c42", 10: "#ff4757" };

const buildTD = (daysArr) => daysArr.map((d) => ({
  circuits: d.circuits.map((c) => Array.from({ length: c.rounds }, () => c.exercises.map(() => ({ weight: "", reps: "", done: false })))),
  circuitRpe: d.circuits.map(() => null),
  finisher: d.finisher.exercises.map((ex) => ({ sets: Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false })) })),
}));

const getSessionLogs = () => {
  const keys = store.keys("log:");
  return keys.map((k) => { const d = store.get(k); if (!d) return null; const parts = k.split(":"); return { key: k, date: parts[1], dayId: parts[2], ...d }; }).filter(Boolean);
};

const calcVolume = (sessionData) => {
  let vol = 0;
  const addVol = (s) => { if (s.done && s.weight && s.weight !== "BW" && s.reps && s.reps !== "BW") vol += parseFloat(s.weight) * parseInt(s.reps); };
  if (sessionData?.circuits) sessionData.circuits.forEach((c) => c.forEach((r) => r.forEach(addVol)));
  if (sessionData?.finisher) sessionData.finisher.forEach((ex) => ex.sets.forEach(addVol));
  return vol;
};

const getPrevSessionWeights = (logs, dayId) => {
  const dayLogs = logs.filter((l) => l.dayId === dayId).sort((a, b) => b.date.localeCompare(a.date));
  return dayLogs.length > 0 ? dayLogs[0].data : null;
};

/* ═══════════════════════ THEME ═══════════════════════ */

const T = {
  bg: "#08080c", card: "#101016", elevated: "#16161e", input: "#0c0c12",
  border: "#1c1c28", borderLight: "#2a2a38",
  text: "#f0f0f4", textSec: "#7a7a8e", textMuted: "#3e3e50",
  glow: (c) => `0 0 20px ${c}15, 0 0 4px ${c}25`,
  cardGlow: (c) => `inset 0 0 30px ${c}08`,
};

/* ═══════════════════════ SELECT COMPONENTS ═══════════════════════ */

const selectBase = {
  padding: "4px 2px", background: T.input, border: `1px solid ${T.border}`,
  borderRadius: 5, color: "#fff", fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
  textAlign: "center", outline: "none", appearance: "none", WebkitAppearance: "none",
  cursor: "pointer",
};

function WeightSelect({ value, onChange, placeholder, accent }) {
  const isCustom = value && value !== "BW" && !WEIGHT_OPTIONS.includes(value);
  const [customMode, setCustomMode] = useState(isCustom);

  useEffect(() => { if (value && value !== "BW" && !WEIGHT_OPTIONS.includes(value)) setCustomMode(true); }, [value]);

  if (customMode) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <input type="number" inputMode="decimal" placeholder="lbs" value={value === "__custom__" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...selectBase, width: 48, textAlign: "center" }} autoFocus />
        <button onClick={() => { setCustomMode(false); onChange(""); }}
          style={{ background: "none", border: "none", color: T.textMuted, fontSize: 10, cursor: "pointer", padding: "0 2px", fontFamily: "'JetBrains Mono', monospace" }}>✕</button>
      </div>
    );
  }

  return (
    <select value={value || ""} onChange={(e) => {
      if (e.target.value === "__custom__") { setCustomMode(true); onChange("__custom__"); }
      else onChange(e.target.value);
    }} style={{
      ...selectBase, width: 58,
      color: value ? "#fff" : T.textMuted,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%233e3e50'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center", paddingRight: 14,
    }}>
      <option value="" disabled style={{ color: T.textMuted }}>{placeholder || "lbs"}</option>
      <option value="BW">BW</option>
      {WEIGHT_OPTIONS.slice(1).map((w) => (
        <option key={w} value={w}>{w}</option>
      ))}
      <option value="__custom__">Custom</option>
    </select>
  );
}

function RepsSelect({ value, onChange, placeholder }) {
  const isCustom = value && value !== "BW" && !REP_OPTIONS.includes(value);
  const [customMode, setCustomMode] = useState(isCustom);

  useEffect(() => { if (value && value !== "BW" && !REP_OPTIONS.includes(value)) setCustomMode(true); }, [value]);

  if (customMode) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
        <input type="number" inputMode="numeric" placeholder="#" value={value === "__custom__" ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...selectBase, width: 36, textAlign: "center" }} autoFocus />
        <button onClick={() => { setCustomMode(false); onChange(""); }}
          style={{ background: "none", border: "none", color: T.textMuted, fontSize: 10, cursor: "pointer", padding: "0 2px", fontFamily: "'JetBrains Mono', monospace" }}>✕</button>
      </div>
    );
  }

  return (
    <select value={value || ""} onChange={(e) => {
      if (e.target.value === "__custom__") { setCustomMode(true); onChange("__custom__"); }
      else onChange(e.target.value);
    }} style={{
      ...selectBase, width: 48,
      color: value ? "#fff" : T.textMuted,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%233e3e50'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center", paddingRight: 14,
    }}>
      <option value="" disabled style={{ color: T.textMuted }}>{placeholder || "reps"}</option>
      <option value="BW">BW</option>
      {REP_OPTIONS.slice(1).map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
      <option value="__custom__">Custom</option>
    </select>
  );
}

/* ═══════════════════════ COMPONENTS ═══════════════════════ */

function RestTimer({ duration, onDone }) {
  const [left, setLeft] = useState(duration);
  const cb = useRef(onDone); cb.current = onDone;
  useEffect(() => { if (left <= 0) { cb.current(); return; } const t = setTimeout(() => setLeft((l) => l - 1), 1000); return () => clearTimeout(t); }, [left]);
  const pct = ((duration - left) / duration) * 100;
  return (
    <div style={{ position: "fixed", bottom: 56, left: 0, right: 0, zIndex: 999, background: T.elevated, borderTop: `2px solid #ff4757`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: T.textSec, letterSpacing: 1.5, marginBottom: 5, fontFamily: "var(--mono)" }}>REST BETWEEN ROUNDS</div>
        <div style={{ height: 5, background: T.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: left <= 10 ? "#ff4757" : "#2ed8a3", transition: "width 1s linear, background 0.3s" }} />
        </div>
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: left <= 10 ? "#ff4757" : T.text, minWidth: 60, textAlign: "right" }}>{fmt(left)}</span>
      <button onClick={onDone} style={{ background: "none", border: `1px solid ${T.borderLight}`, color: T.textSec, padding: "6px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", fontFamily: "var(--mono)", letterSpacing: 1 }}>SKIP</button>
    </div>
  );
}

function BottomNav({ tab, setTab, accent }) {
  const tabs = [
    { id: "workout", icon: "🏋️", label: "WORKOUT" },
    { id: "history", icon: "📊", label: "HISTORY" },
    { id: "nutrition", icon: "🥗", label: "NUTRITION" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 998, background: T.elevated, borderTop: `1px solid ${T.border}`, display: "flex", height: 56 }}>
      {tabs.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 2, border: "none", cursor: "pointer", transition: "all 0.2s", background: "transparent",
          color: tab === t.id ? accent : T.textMuted, position: "relative",
        }}>
          {tab === t.id && <div style={{ position: "absolute", top: -1, width: 24, height: 2, background: accent, borderRadius: 2 }} />}
          <span style={{ fontSize: 16 }}>{t.icon}</span>
          <span style={{ fontSize: 8, fontFamily: "var(--mono)", letterSpacing: 1.5, fontWeight: 700 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

function WarmupSection({ dayId, accent, checks, setChecks }) {
  const [open, setOpen] = useState(false);
  const w = WARMUPS[dayId]; if (!w) return null;
  const all = [...w.stability, ...w.dynamic, ...w.plyo];
  const done = Object.values(checks[dayId] || {}).filter(Boolean).length;
  const allDone = done === all.length && all.length > 0;
  const toggle = (idx) => setChecks((p) => { const dc = { ...(p[dayId] || {}) }; dc[idx] = !dc[idx]; return { ...p, [dayId]: dc }; });

  const Item = ({ item, idx }) => {
    const ck = !!(checks[dayId] || {})[idx];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", opacity: ck ? 0.25 : 1, transition: "opacity 0.2s" }}>
        <button onClick={() => toggle(idx)} style={{ width: 19, height: 19, borderRadius: 4, border: ck ? "none" : `2px solid ${T.borderLight}`, background: ck ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, boxShadow: ck ? T.glow(accent) : "none" }}>
          {ck && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
        </button>
        <span style={{ fontSize: 13, color: T.text, flex: 1, opacity: 0.85 }}>{item.name}</span>
        <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "var(--mono)" }}>{item.duration || item.reps}</span>
      </div>
    );
  };

  return (
    <div style={{ margin: "0 16px 10px", background: T.card, borderRadius: 10, overflow: "hidden", borderLeft: `3px solid ${allDone ? accent : T.border}`, boxShadow: allDone ? T.cardGlow(accent) : "none", transition: "all 0.3s" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: 1, color: accent }}>WARM-UP</span>
          <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "var(--mono)" }}>{done}/{all.length}</span>
        </div>
        <span style={{ color: T.textMuted, fontSize: 12, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          <div style={{ fontSize: 9, color: accent, fontFamily: "var(--mono)", letterSpacing: 2, marginBottom: 4, fontWeight: 700, opacity: 0.6 }}>⏸ ISO / STABILITY</div>
          {w.stability.map((item, i) => <Item key={`s${i}`} item={item} idx={`s${i}`} />)}
          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          <div style={{ fontSize: 9, color: accent, fontFamily: "var(--mono)", letterSpacing: 2, marginBottom: 4, fontWeight: 700, opacity: 0.6 }}>⚡ DYNAMIC</div>
          {w.dynamic.map((item, i) => <Item key={`d${i}`} item={item} idx={`d${i}`} />)}
          <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
          <div style={{ fontSize: 9, color: accent, fontFamily: "var(--mono)", letterSpacing: 2, marginBottom: 4, fontWeight: 700, opacity: 0.6 }}>🔥 PLYO PRIMERS</div>
          {w.plyo.map((item, i) => <Item key={`p${i}`} item={item} idx={`p${i}`} />)}
        </div>
      )}
    </div>
  );
}

function CircuitCard({ circuit, cIdx, trackData, rpe, accent, dayIdx, editMode, prevData, onEdit, onRemoveEx, onAddEx, onRoundsChange, onRestChange, onSetChange, onCheck, onRpe, onApplyAll, startRest }) {
  const inputS = (w) => ({ width: w, padding: "4px 5px", background: T.input, border: `1px solid ${T.border}`, borderRadius: 5, color: "#ccc", fontSize: 12, fontFamily: "var(--mono)", outline: "none", textAlign: "center" });

  return (
    <div style={{ margin: "0 16px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)", color: accent, letterSpacing: 1.5 }}>{circuit.name}</span>
          {editMode ? (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input value={String(circuit.rounds)} onChange={(e) => onRoundsChange(dayIdx, cIdx, e.target.value)} style={{ ...inputS(28) }} />
              <span style={{ color: T.textMuted, fontSize: 10, fontFamily: "var(--mono)" }}>rnds</span>
              <input value={String(circuit.rest)} onChange={(e) => onRestChange(dayIdx, cIdx, e.target.value)} style={{ ...inputS(36), marginLeft: 4 }} />
              <span style={{ color: T.textMuted, fontSize: 10, fontFamily: "var(--mono)" }}>s</span>
            </div>
          ) : (
            <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "var(--mono)" }}>{circuit.rounds} rnds · {circuit.rest}s rest</span>
          )}
        </div>
        {!editMode && (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 8, color: T.textMuted, fontFamily: "var(--mono)", marginRight: 3 }}>RPE</span>
            {[6, 7, 8, 9, 10].map((r) => (
              <button key={r} onClick={() => onRpe(cIdx, r)} style={{
                width: 21, height: 19, fontSize: 9, fontWeight: 700, border: "none", borderRadius: 3,
                cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.15s",
                background: rpe === r ? RPE_C[r] : T.card, color: rpe === r ? "#000" : T.textMuted,
                boxShadow: rpe === r ? T.glow(RPE_C[r]) : "none",
              }}>{r}</button>
            ))}
          </div>
        )}
      </div>

      {editMode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {circuit.exercises.map((ex, ei) => (
            <div key={ei} style={{ background: T.card, borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <input value={ex.name} onChange={(e) => onEdit(dayIdx, cIdx, ei, "name", e.target.value)} style={{ ...inputS("auto"), flex: 1, textAlign: "left", fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: T.text }} />
              <input value={ex.reps} onChange={(e) => onEdit(dayIdx, cIdx, ei, "reps", e.target.value)} style={{ ...inputS(60) }} />
              <button onClick={() => onRemoveEx(dayIdx, cIdx, ei)} style={{ background: "#ff475715", border: "none", color: "#ff4757", fontSize: 13, cursor: "pointer", padding: "2px 6px", borderRadius: 3, fontWeight: 700 }}>×</button>
            </div>
          ))}
          <button onClick={() => onAddEx(dayIdx, cIdx)} style={{ padding: "8px", border: `1px dashed ${T.border}`, borderRadius: 8, background: "transparent", color: T.textMuted, fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>+ ADD</button>
        </div>
      ) : (
        Array.from({ length: circuit.rounds }, (_, ri) => (
          <div key={ri} style={{ marginBottom: ri < circuit.rounds - 1 ? 4 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 2px" }}>
              <span style={{ fontSize: 9, color: T.textMuted, fontFamily: "var(--mono)", letterSpacing: 1 }}>ROUND {ri + 1}</span>
              {ri === 0 && circuit.rounds > 1 && (
                <button onClick={() => onApplyAll(cIdx)} style={{ fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700, color: accent, background: `${accent}12`, border: `1px solid ${accent}30`, borderRadius: 4, padding: "2px 8px", cursor: "pointer", letterSpacing: 0.5 }}>APPLY ALL ↓</button>
              )}
            </div>
            <div style={{ background: T.card, borderRadius: 8, padding: "6px 10px", boxShadow: `inset 0 1px 0 ${T.border}` }}>
              {circuit.exercises.map((ex, ei) => {
                const sd = trackData[ri]?.[ei] || { weight: "", reps: "", done: false };
                const prevWeight = prevData?.[ri]?.[ei]?.weight || "";
                return (
                  <div key={ei} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 6, alignItems: "center", padding: "4px 0", opacity: sd.done ? 0.25 : 1, transition: "opacity 0.2s" }}>
                    <button onClick={() => { onCheck(cIdx, ri, ei); if (!sd.done) startRest(circuit.rest); }} style={{
                      width: 20, height: 20, borderRadius: 5, cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                      border: sd.done ? "none" : `2px solid ${T.borderLight}`, background: sd.done ? accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: sd.done ? T.glow(accent) : "none",
                    }}>{sd.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ fontSize: 12, color: T.text, flex: 1, fontFamily: "var(--body)", opacity: 0.85 }}>{ex.name}</span>
                      <WeightSelect value={sd.weight} onChange={(v) => onSetChange(cIdx, ri, ei, "weight", v)} placeholder={prevWeight || "lbs"} accent={accent} />
                      <span style={{ color: T.textMuted, fontSize: 9 }}>×</span>
                      <RepsSelect value={sd.reps} onChange={(v) => onSetChange(cIdx, ri, ei, "reps", v)} placeholder={ex.reps} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function FinisherCard({ finisher, trackData, accent, editMode, dayIdx, onCheck, onSetChange, startRest, onEditFinisher, onRemoveFinisher, onAddFinisher }) {
  const inputS = (w) => ({ width: w, padding: "4px 5px", background: T.input, border: `1px solid ${T.border}`, borderRadius: 5, color: "#ccc", fontSize: 12, fontFamily: "var(--mono)", outline: "none", textAlign: "center" });

  return (
    <div style={{ margin: "0 16px 10px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)", color: accent, letterSpacing: 1.5, marginBottom: 6, opacity: 0.6 }}>🔻 {finisher.name}</div>
      {editMode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {finisher.exercises.map((ex, ei) => (
            <div key={ei} style={{ background: T.card, borderRadius: 8, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <input value={ex.name} onChange={(e) => onEditFinisher(dayIdx, ei, "name", e.target.value)} style={{ ...inputS("auto"), flex: 1, textAlign: "left", fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: T.text }} />
              <input value={String(ex.sets)} onChange={(e) => onEditFinisher(dayIdx, ei, "sets", e.target.value)} style={{ ...inputS(28) }} />
              <span style={{ color: T.textMuted, fontSize: 10 }}>×</span>
              <input value={ex.reps} onChange={(e) => onEditFinisher(dayIdx, ei, "reps", e.target.value)} style={{ ...inputS(50) }} />
              <input value={String(ex.rest)} onChange={(e) => onEditFinisher(dayIdx, ei, "rest", e.target.value)} style={{ ...inputS(32) }} />
              <span style={{ color: T.textMuted, fontSize: 9 }}>s</span>
              <button onClick={() => onRemoveFinisher(dayIdx, ei)} style={{ background: "#ff475715", border: "none", color: "#ff4757", fontSize: 13, cursor: "pointer", padding: "2px 6px", borderRadius: 3, fontWeight: 700 }}>×</button>
            </div>
          ))}
          <button onClick={() => onAddFinisher(dayIdx)} style={{ padding: "8px", border: `1px dashed ${T.border}`, borderRadius: 8, background: "transparent", color: T.textMuted, fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>+ ADD FINISHER</button>
        </div>
      ) : (
        finisher.exercises.map((ex, ei) => (
          <div key={ei} style={{ background: T.card, borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 2, fontFamily: "var(--body)", opacity: 0.85 }}>{ex.name}</div>
            <div style={{ fontSize: 10, color: T.textMuted, fontFamily: "var(--mono)", marginBottom: 4 }}>{ex.sets}×{ex.reps} · {ex.rest}s rest</div>
            {trackData[ei]?.sets.map((sd, si) => (
              <div key={si} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 6, alignItems: "center", padding: "3px 0", opacity: sd.done ? 0.25 : 1, transition: "opacity 0.2s" }}>
                <button onClick={() => { onCheck(ei, si); if (!sd.done) startRest(ex.rest); }} style={{
                  width: 20, height: 20, borderRadius: 5, cursor: "pointer", border: sd.done ? "none" : `2px solid ${T.borderLight}`,
                  background: sd.done ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: sd.done ? T.glow(accent) : "none",
                }}>{sd.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</button>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ color: T.textMuted, fontSize: 10, fontFamily: "var(--mono)", width: 18 }}>S{si + 1}</span>
                  <WeightSelect value={sd.weight} onChange={(v) => onSetChange(ei, si, "weight", v)} accent={accent} />
                  <span style={{ color: T.textMuted, fontSize: 9 }}>×</span>
                  <RepsSelect value={sd.reps} onChange={(v) => onSetChange(ei, si, "reps", v)} placeholder={ex.reps} />
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

/* ═══════════════════════ HISTORY TAB ═══════════════════════ */

function HistoryTab({ days }) {
  const [logs] = useState(() => getSessionLogs());
  const [expanded, setExpanded] = useState(null);
  const dayMap = {}; days.forEach((d) => { dayMap[d.id] = d; });

  const prMap = useMemo(() => {
    const prs = {};
    logs.forEach((log) => {
      const d = log.data; if (!d?.circuits) return;
      const dd = dayMap[log.dayId]; if (!dd) return;
      dd.circuits.forEach((circ, ci) => {
        circ.exercises.forEach((ex, ei) => {
          d.circuits[ci]?.forEach((round) => {
            const s = round[ei];
            if (s?.done && s.weight && s.weight !== "BW") {
              const w = parseFloat(s.weight);
              if (!prs[ex.name] || w > prs[ex.name]) prs[ex.name] = w;
            }
          });
        });
      });
    });
    return prs;
  }, [logs, dayMap]);

  const streak = useMemo(() => {
    const dates = [...new Set(logs.map((l) => l.date))].sort().reverse();
    if (dates.length === 0) return 0;
    let count = 1;
    for (let i = 1; i < dates.length; i++) {
      const curr = new Date(dates[i - 1]); const prev = new Date(dates[i]);
      if ((curr - prev) / (1000 * 60 * 60 * 24) <= 3) count++; else break;
    }
    return count;
  }, [logs]);

  if (logs.length === 0) return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No sessions yet</div>
      <div style={{ fontSize: 13, color: T.textSec }}>Complete and save your first workout to start tracking progress.</div>
    </div>
  );

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        {[
          { label: "SESSIONS", value: logs.length, icon: "🏋️" },
          { label: "STREAK", value: streak, icon: "🔥" },
          { label: "TOP VOL", value: Math.max(...logs.map((l) => calcVolume(l.data))).toLocaleString(), icon: "📈" },
        ].map((s) => (
          <div key={s.label} style={{ background: T.card, borderRadius: 10, padding: "12px 10px", textAlign: "center", border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.text, fontFamily: "var(--mono)" }}>{s.value}</div>
            <div style={{ fontSize: 8, color: T.textMuted, fontFamily: "var(--mono)", letterSpacing: 1.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {Object.keys(prMap).length > 0 && (
        <div style={{ background: T.card, borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", color: "#ffc048", letterSpacing: 1.5, marginBottom: 8 }}>⚡ PERSONAL RECORDS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(prMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, w]) => (
              <div key={name} style={{ background: T.elevated, borderRadius: 6, padding: "6px 10px", border: `1px solid #ffc04820` }}>
                <div style={{ fontSize: 11, color: T.text, fontWeight: 600, opacity: 0.85 }}>{name}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#ffc048", fontFamily: "var(--mono)" }}>{w} lbs</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", color: T.textSec, letterSpacing: 1.5, marginBottom: 8 }}>SESSION LOG</div>
      {logs.map((log, i) => {
        const dd = dayMap[log.dayId]; const vol = calcVolume(log.data);
        let total = 0, done = 0;
        if (log.data?.circuits) log.data.circuits.forEach((c) => c.forEach((r) => r.forEach((s) => { total++; if (s.done) done++; })));
        if (log.data?.finisher) log.data.finisher.forEach((e) => e.sets.forEach((s) => { total++; if (s.done) done++; }));
        const compPct = total ? Math.round((done / total) * 100) : 0;
        const isExp = expanded === i;

        return (
          <div key={log.key} onClick={() => setExpanded(isExp ? null : i)} style={{ background: T.card, borderRadius: 10, padding: "12px 14px", marginBottom: 8, cursor: "pointer", border: `1px solid ${isExp ? (dd?.color || T.border) + "40" : T.border}`, transition: "border-color 0.2s" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: dd?.color || T.text }}>{dd?.title || log.dayId}</span>
                  <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "var(--mono)" }}>{log.date}</span>
                </div>
                <div style={{ fontSize: 11, color: T.textSec, fontFamily: "var(--mono)", marginTop: 3 }}>
                  {fmt(log.elapsed || 0)} · {compPct}%{vol > 0 ? ` · ${vol.toLocaleString()} lbs` : ""}
                </div>
              </div>
              <div style={{ width: 36, height: 36, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, fontFamily: "var(--mono)", background: compPct === 100 ? `${dd?.color}20` : T.elevated, color: compPct === 100 ? dd?.color : T.textSec }}>{compPct}%</div>
            </div>
            {isExp && log.data?.circuits && (
              <div style={{ marginTop: 10, borderTop: `1px solid ${T.border}`, paddingTop: 8 }}>
                {dd?.circuits.map((circ, ci) => (
                  <div key={ci} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: dd.color, letterSpacing: 1.5, marginBottom: 4, opacity: 0.6 }}>{circ.name}</div>
                    {circ.exercises.map((ex, ei) => {
                      const weights = [];
                      log.data.circuits[ci]?.forEach((round) => {
                        const s = round[ei];
                        if (s?.weight) weights.push(`${s.weight}${s.weight === "BW" ? "" : ""}×${s.reps || "?"}`);
                      });
                      return weights.length > 0 ? (
                        <div key={ei} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                          <span style={{ fontSize: 12, color: T.text, opacity: 0.75 }}>{ex.name}</span>
                          <span style={{ fontSize: 11, color: T.textSec, fontFamily: "var(--mono)" }}>{weights.join(" → ")}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════ NUTRITION TAB ═══════════════════════ */

const DEFAULT_TARGETS = [
  { id: "protein", label: "Protein", target: "180g", icon: "🥩" },
  { id: "carbs", label: "Carbs", target: "250g", icon: "🍚" },
  { id: "fat", label: "Fat", target: "70g", icon: "🥑" },
  { id: "calories", label: "Calories", target: "2,800", icon: "🔥" },
  { id: "water", label: "Water", target: "128 oz", icon: "💧" },
];

const DEFAULT_MEALS = [
  { id: "meal1", label: "Meal 1 — Breakfast" }, { id: "meal2", label: "Meal 2 — Lunch" },
  { id: "meal3", label: "Meal 3 — Dinner" }, { id: "snack", label: "Snack" },
  { id: "preworkout", label: "Pre-Workout" }, { id: "postworkout", label: "Post-Workout" },
  { id: "creatine", label: "Creatine" }, { id: "vitamins", label: "Vitamins / Supps" },
];

function NutritionTab() {
  const today = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState(() => store.get(`nutrition:${today}`) || { targets: {}, meals: {} });
  const [savedN, setSavedN] = useState(false);
  const toggleTarget = (id) => setData((p) => ({ ...p, targets: { ...p.targets, [id]: !p.targets[id] } }));
  const toggleMeal = (id) => setData((p) => ({ ...p, meals: { ...p.meals, [id]: !p.meals[id] } }));
  const save = () => { store.set(`nutrition:${today}`, data); setSavedN(true); setTimeout(() => setSavedN(false), 1200); };
  const totalChecks = DEFAULT_TARGETS.length + DEFAULT_MEALS.length;
  const doneChecks = Object.values(data.targets).filter(Boolean).length + Object.values(data.meals).filter(Boolean).length;
  const pct = Math.round((doneChecks / totalChecks) * 100);

  return (
    <div style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: T.text }}>NUTRITION</h2>
          <div style={{ fontSize: 10, color: T.textMuted, fontFamily: "var(--mono)", marginTop: 2 }}>{today} · {pct}% complete</div>
        </div>
        <div style={{ width: 42, height: 42, borderRadius: 21, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, fontFamily: "var(--mono)", background: pct === 100 ? "#2ed8a320" : T.elevated, color: pct === 100 ? "#2ed8a3" : T.textSec, border: `2px solid ${pct === 100 ? "#2ed8a340" : T.border}` }}>{pct}%</div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", color: "#2ed8a3", letterSpacing: 1.5, marginBottom: 8 }}>DAILY TARGETS</div>
      <div style={{ background: T.card, borderRadius: 10, padding: "8px 12px", marginBottom: 16, border: `1px solid ${T.border}` }}>
        {DEFAULT_TARGETS.map((t) => {
          const ck = !!data.targets[t.id];
          return (
            <div key={t.id} onClick={() => toggleTarget(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", opacity: ck ? 0.35 : 1, transition: "opacity 0.2s" }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: ck ? "none" : `2px solid ${T.borderLight}`, background: ck ? "#2ed8a3" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: ck ? T.glow("#2ed8a3") : "none", flexShrink: 0 }}>
                {ck && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
              </div>
              <span style={{ fontSize: 18, marginRight: 2 }}>{t.icon}</span>
              <span style={{ fontSize: 14, color: T.text, flex: 1, fontWeight: 500 }}>{t.label}</span>
              <span style={{ fontSize: 13, color: T.textSec, fontFamily: "var(--mono)", fontWeight: 700 }}>{t.target}</span>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, fontFamily: "var(--mono)", color: "#ffc048", letterSpacing: 1.5, marginBottom: 8 }}>MEALS & SUPPS</div>
      <div style={{ background: T.card, borderRadius: 10, padding: "8px 12px", marginBottom: 16, border: `1px solid ${T.border}` }}>
        {DEFAULT_MEALS.map((m, i) => {
          const ck = !!data.meals[m.id];
          return (
            <div key={m.id} onClick={() => toggleMeal(m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < DEFAULT_MEALS.length - 1 ? `1px solid ${T.border}` : "none", cursor: "pointer", opacity: ck ? 0.35 : 1, transition: "opacity 0.2s" }}>
              <div style={{ width: 20, height: 20, borderRadius: 5, border: ck ? "none" : `2px solid ${T.borderLight}`, background: ck ? "#ffc048" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: ck ? T.glow("#ffc048") : "none", flexShrink: 0 }}>
                {ck && <span style={{ color: "#000", fontSize: 11 }}>✓</span>}
              </div>
              <span style={{ fontSize: 14, color: T.text, fontWeight: 500 }}>{m.label}</span>
            </div>
          );
        })}
      </div>

      <button onClick={save} style={{
        width: "100%", padding: "13px", border: "none", borderRadius: 8, cursor: "pointer",
        fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
        background: savedN ? "#2ed8a3" : "#ffc048", color: "#000", transition: "all 0.2s",
      }}>{savedN ? "✓ SAVED" : "SAVE DAY"}</button>
    </div>
  );
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
  const [days, setDays] = useState(JSON.parse(JSON.stringify(DEFAULT_DAYS)));
  const [trackData, setTrackData] = useState(() => buildTD(DEFAULT_DAYS));

  const loadedRef = useRef(false);
  useEffect(() => { if (loadedRef.current) return; loadedRef.current = true; const s = store.get("circuit-v2"); if (s) { if (s.days) setDays(s.days); if (s.trackData) setTrackData(s.trackData); if (s.warmupChecks) setWarmupChecks(s.warmupChecks); } const ss = store.get("circuit-session-v2"); if (ss) setSessionStart(ss); }, []);
  useEffect(() => { if (!sessionStart) return; const t = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000); return () => clearInterval(t); }, [sessionStart]);

  const day = days[activeDay];
  const td = trackData[activeDay];

  const prevSessionData = useMemo(() => { const logs = getSessionLogs(); return getPrevSessionWeights(logs, day.id); }, [day.id]);

  const ensureSession = useCallback(() => { if (!sessionStart) { const t = Date.now(); setSessionStart(t); store.set("circuit-session-v2", t); } }, [sessionStart]);
  const startRest = useCallback((dur) => { setRestTimer(dur); ensureSession(); }, [ensureSession]);

  const onCircuitCheck = useCallback((ci, ri, ei) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].circuits[ci][ri][ei].done = !n[activeDay].circuits[ci][ri][ei].done; return n; }); ensureSession(); }, [activeDay, ensureSession]);
  const onCircuitSetChange = useCallback((ci, ri, ei, f, v) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].circuits[ci][ri][ei][f] = v; return n; }); }, [activeDay]);
  const onCircuitRpe = useCallback((ci, v) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].circuitRpe[ci] = n[activeDay].circuitRpe[ci] === v ? null : v; return n; }); }, [activeDay]);

  const onApplyAll = useCallback((ci) => {
    setTrackData((p) => {
      const n = JSON.parse(JSON.stringify(p));
      const r0 = n[activeDay].circuits[ci][0]; if (!r0) return p;
      for (let ri = 1; ri < n[activeDay].circuits[ci].length; ri++) {
        r0.forEach((s, ei) => { if (s.weight) n[activeDay].circuits[ci][ri][ei].weight = s.weight; if (s.reps) n[activeDay].circuits[ci][ri][ei].reps = s.reps; });
      }
      return n;
    });
  }, [activeDay]);

  const onFinisherCheck = useCallback((ei, si) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].finisher[ei].sets[si].done = !n[activeDay].finisher[ei].sets[si].done; return n; }); ensureSession(); }, [activeDay, ensureSession]);
  const onFinisherSetChange = useCallback((ei, si, f, v) => { setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].finisher[ei].sets[si][f] = v; return n; }); }, [activeDay]);

  const onEditEx = useCallback((di, ci, ei, f, v) => { setDays((p) => { const n = JSON.parse(JSON.stringify(p)); n[di].circuits[ci].exercises[ei][f] = v; return n; }); }, []);
  const onRemoveEx = useCallback((di, ci, ei) => { setDays((p) => { const n = JSON.parse(JSON.stringify(p)); if (n[di].circuits[ci].exercises.length <= 1) return p; n[di].circuits[ci].exercises.splice(ei, 1); setTrackData((t) => { const nt = JSON.parse(JSON.stringify(t)); nt[di].circuits[ci].forEach((r) => r.splice(ei, 1)); return nt; }); return n; }); }, []);
  const onAddEx = useCallback((di, ci) => { setDays((p) => { const n = JSON.parse(JSON.stringify(p)); n[di].circuits[ci].exercises.push({ name: "New Exercise", reps: "8" }); setTrackData((t) => { const nt = JSON.parse(JSON.stringify(t)); nt[di].circuits[ci].forEach((r) => r.push({ weight: "", reps: "", done: false })); return nt; }); return n; }); }, []);
  const onRoundsChange = useCallback((di, ci, v) => { const nr = Math.max(1, parseInt(v) || 1); setDays((p) => { const n = JSON.parse(JSON.stringify(p)); n[di].circuits[ci].rounds = nr; return n; }); setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); const ec = days[di].circuits[ci].exercises.length; while (n[di].circuits[ci].length < nr) n[di].circuits[ci].push(Array.from({ length: ec }, () => ({ weight: "", reps: "", done: false }))); n[di].circuits[ci] = n[di].circuits[ci].slice(0, nr); return n; }); }, [days]);
  const onRestChange = useCallback((di, ci, v) => { setDays((p) => { const n = JSON.parse(JSON.stringify(p)); n[di].circuits[ci].rest = parseInt(v) || 0; return n; }); }, []);

  const onEditFinisher = useCallback((di, ei, f, v) => {
    setDays((p) => {
      const n = JSON.parse(JSON.stringify(p));
      if (f === "sets") { const ns = parseInt(v) || 1; n[di].finisher.exercises[ei].sets = ns; setTrackData((t) => { const nt = JSON.parse(JSON.stringify(t)); const curr = nt[di].finisher[ei]?.sets || []; while (curr.length < ns) curr.push({ weight: "", reps: "", done: false }); nt[di].finisher[ei] = { sets: curr.slice(0, ns) }; return nt; });
      } else if (f === "rest") { n[di].finisher.exercises[ei].rest = parseInt(v) || 0;
      } else { n[di].finisher.exercises[ei][f] = v; }
      return n;
    });
  }, []);
  const onRemoveFinisher = useCallback((di, ei) => { setDays((p) => { const n = JSON.parse(JSON.stringify(p)); if (n[di].finisher.exercises.length <= 1) return p; n[di].finisher.exercises.splice(ei, 1); setTrackData((t) => { const nt = JSON.parse(JSON.stringify(t)); nt[di].finisher.splice(ei, 1); return nt; }); return n; }); }, []);
  const onAddFinisher = useCallback((di) => { setDays((p) => { const n = JSON.parse(JSON.stringify(p)); n[di].finisher.exercises.push({ name: "New Exercise", sets: 3, reps: "10", rest: 30 }); setTrackData((t) => { const nt = JSON.parse(JSON.stringify(t)); nt[di].finisher.push({ sets: Array.from({ length: 3 }, () => ({ weight: "", reps: "", done: false })) }); return nt; }); return n; }); }, []);

  const saveSession = () => {
    setSaving(true);
    store.set("circuit-v2", { days, trackData, warmupChecks });
    const dk = `log:${new Date().toISOString().slice(0, 10)}:${day.id}`;
    store.set(dk, { day: day.id, elapsed, data: trackData[activeDay], ts: Date.now() });
    setSaved(true); setTimeout(() => { setSaved(false); setSaving(false); }, 1200);
  };

  const resetSession = () => {
    setSessionStart(null); setElapsed(0); store.del("circuit-session-v2");
    setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); const f = buildTD(days); n[activeDay] = f[activeDay]; return n; });
    setWarmupChecks((p) => ({ ...p, [day.id]: {} }));
  };

  let totalC = 0, doneC = 0;
  td.circuits.forEach((c) => c.forEach((r) => r.forEach((s) => { totalC++; if (s.done) doneC++; })));
  td.finisher.forEach((e) => e.sets.forEach((s) => { totalC++; if (s.done) doneC++; }));
  const pct = totalC ? Math.round((doneC / totalC) * 100) : 0;

  return (
    <div style={{ "--mono": "'JetBrains Mono', monospace", "--body": "'Outfit', sans-serif", minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "var(--body)", paddingBottom: 70 }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />

      {tab === "workout" && (
        <>
          <div style={{ padding: "14px 16px 0", position: "sticky", top: 0, zIndex: 90, background: T.bg }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              {days.map((d, i) => (
                <button key={d.id} onClick={() => { setActiveDay(i); setEditMode(false); }} style={{
                  flex: 1, padding: "10px 0 8px", border: "none", borderRadius: 8, cursor: "pointer",
                  fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, transition: "all 0.2s",
                  background: activeDay === i ? d.color : T.card, color: activeDay === i ? "#000" : T.textMuted,
                  boxShadow: activeDay === i ? T.glow(d.color) : "none",
                }}>{d.label}</button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: day.color }}>{day.title}</h1>
                <div style={{ fontSize: 10, color: T.textMuted, fontFamily: "var(--mono)", marginTop: 2, letterSpacing: 0.5 }}>{day.subtitle}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={() => setEditMode(!editMode)} style={{
                  padding: "5px 10px", borderRadius: 5, cursor: "pointer", fontFamily: "var(--mono)",
                  fontSize: 9, fontWeight: 700, letterSpacing: 1.5, transition: "all 0.2s",
                  border: `1px solid ${editMode ? day.color : T.border}`,
                  background: editMode ? `${day.color}15` : "transparent", color: editMode ? day.color : T.textMuted,
                }}>{editMode ? "DONE" : "EDIT"}</button>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 19, fontWeight: 700, color: sessionStart ? T.text : T.textMuted }}>{fmt(elapsed)}</div>
                  <div style={{ fontSize: 8, color: T.textMuted, fontFamily: "var(--mono)", letterSpacing: 1.5 }}>SESSION</div>
                </div>
              </div>
            </div>
            <div style={{ margin: "10px 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 3, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: `linear-gradient(90deg, ${day.color}, ${day.color}cc)`, transition: "width 0.4s ease", boxShadow: pct > 5 ? T.glow(day.color) : "none" }} />
              </div>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: pct === 100 ? day.color : T.textMuted }}>{pct}%</span>
            </div>
          </div>

          <WarmupSection dayId={day.id} accent={day.color} checks={warmupChecks} setChecks={setWarmupChecks} />

          {day.circuits.map((c, ci) => (
            <CircuitCard key={ci} circuit={c} cIdx={ci} trackData={td.circuits[ci]} rpe={td.circuitRpe[ci]}
              accent={day.color} dayIdx={activeDay} editMode={editMode}
              prevData={prevSessionData?.circuits?.[ci]}
              onEdit={onEditEx} onRemoveEx={onRemoveEx} onAddEx={onAddEx}
              onRoundsChange={onRoundsChange} onRestChange={onRestChange}
              onSetChange={onCircuitSetChange} onCheck={onCircuitCheck} onRpe={onCircuitRpe}
              onApplyAll={onApplyAll} startRest={startRest} />
          ))}

          <FinisherCard finisher={day.finisher} trackData={td.finisher} accent={day.color}
            editMode={editMode} dayIdx={activeDay}
            onCheck={onFinisherCheck} onSetChange={onFinisherSetChange} startRest={startRest}
            onEditFinisher={onEditFinisher} onRemoveFinisher={onRemoveFinisher} onAddFinisher={onAddFinisher} />

          <div style={{ padding: "10px 16px", display: "flex", gap: 8 }}>
            <button onClick={saveSession} disabled={saving} style={{
              flex: 1, padding: "13px 0", border: "none", borderRadius: 8, cursor: "pointer",
              fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, transition: "all 0.2s",
              background: saved ? "#2ed8a3" : `linear-gradient(135deg, ${day.color}, ${day.color}cc)`,
              color: "#000", opacity: saving ? 0.6 : 1, boxShadow: T.glow(day.color),
            }}>{saved ? "✓ SAVED" : saving ? "..." : "SAVE SESSION"}</button>
            <button onClick={resetSession} style={{
              padding: "13px 16px", border: `1px solid ${T.border}`, borderRadius: 8, cursor: "pointer",
              background: "transparent", color: T.textMuted, fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
            }}>RESET</button>
          </div>
        </>
      )}

      {tab === "history" && <HistoryTab days={days} />}
      {tab === "nutrition" && <NutritionTab />}

      {restTimer && <RestTimer duration={restTimer} onDone={() => setRestTimer(null)} />}
      <BottomNav tab={tab} setTab={setTab} accent={day.color} />
    </div>
  );
}
