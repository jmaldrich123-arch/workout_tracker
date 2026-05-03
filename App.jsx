import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════ PROGRAM DATA ═══════════════════════ */

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

const DEFAULT_DAYS = [
  {
    id: "mon", label: "MON", title: "FULL BODY A", subtitle: "STRENGTH BIAS", color: "#E63946",
    circuits: [
      {
        name: "CIRCUIT 1", rounds: 4, rest: 150,
        exercises: [
          { name: "Trap Bar Deadlift", reps: "4-6" },
          { name: "Box Jumps", reps: "3" },
          { name: "Incline DB Bench", reps: "6-8" },
          { name: "Weighted Pull-Ups", reps: "5-7" },
        ],
      },
      {
        name: "CIRCUIT 2", rounds: 3, rest: 60,
        exercises: [
          { name: "Half-Kneeling Pallof Chop", reps: "8/side" },
          { name: "Dips (Weighted)", reps: "8-10" },
          { name: "Eccentric Bicep Curl", reps: "6-8" },
        ],
      },
    ],
    finisher: { name: "CORE FINISHER", exercises: [{ name: "Hanging Leg Raise", sets: 3, reps: "10-12", rest: 30 }] },
  },
  {
    id: "wed", label: "WED", title: "FULL BODY B", subtitle: "POWER / EXPLOSIVE", color: "#2A9D8F",
    circuits: [
      {
        name: "CIRCUIT 1", rounds: 4, rest: 90,
        exercises: [
          { name: "KB Swings (Heavy)", reps: "6" },
          { name: "Seated DB OH Press", reps: "6-8" },
          { name: "Chest Supported Row", reps: "8-10" },
          { name: "Med Ball Rotational Slam", reps: "5/side" },
        ],
      },
      {
        name: "CIRCUIT 2", rounds: 3, rest: 75,
        exercises: [
          { name: "Bulgarian Split Squat", reps: "8/leg" },
          { name: "Landmine Rotational Press", reps: "6/side" },
          { name: "Eccentric Hamstring Curl (4s neg)", reps: "6-8" },
        ],
      },
    ],
    finisher: { name: "CORE FINISHER", exercises: [{ name: "Copenhagen Plank", sets: 3, reps: "20s/side", rest: 30 }] },
  },
  {
    id: "fri", label: "FRI", title: "FULL BODY C", subtitle: "STABILITY / UNILATERAL", color: "#E9C46A",
    circuits: [
      {
        name: "CIRCUIT 1", rounds: 4, rest: 90,
        exercises: [
          { name: "KB Goblet Squat (Heavy)", reps: "6-8" },
          { name: "Slow Push-Ups (4s ecc)", reps: "8-10" },
          { name: "SA DB Row", reps: "8/side" },
          { name: "Single-Leg RDL", reps: "8/leg" },
        ],
      },
      {
        name: "CIRCUIT 2", rounds: 3, rest: 60,
        exercises: [
          { name: "Pallof Press", reps: "8/side" },
          { name: "Cossack Squat", reps: "8/side" },
          { name: "Turkish Get-Up", reps: "2/side" },
          { name: "Eccentric SL Calf Raise (3s)", reps: "10/leg" },
        ],
      },
    ],
    finisher: {
      name: "CORE FINISHER",
      exercises: [
        { name: "Weighted Dead Bug", sets: 3, reps: "8/side", rest: 30 },
        { name: "Dead Hang", sets: 2, reps: "45s", rest: 30 },
      ],
    },
  },
];

/* ═══════════════════ STORAGE ═══════════════════ */

const store = {
  get(key) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  del(key) { try { localStorage.removeItem(key); } catch {} },
};

/* ═══════════════════ UTILITIES ═══════════════════ */

const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
const RPE_COLORS = { 6: "#2A9D8F", 7: "#6AB47C", 8: "#E9C46A", 9: "#F4A261", 10: "#E63946" };

const buildTrackingData = (daysArr) =>
  daysArr.map((d) => ({
    circuits: d.circuits.map((c) =>
      Array.from({ length: c.rounds }, () =>
        c.exercises.map(() => ({ weight: "", reps: "", done: false }))
      )
    ),
    circuitRpe: d.circuits.map(() => null),
    finisher: d.finisher.exercises.map((ex) => ({
      sets: Array.from({ length: ex.sets }, () => ({ weight: "", reps: "", done: false })),
    })),
  }));

/* ═══════════════════ COMPONENTS ═══════════════════ */

function RestTimer({ duration, onDone }) {
  const [left, setLeft] = useState(duration);
  const cb = useRef(onDone); cb.current = onDone;
  useEffect(() => {
    if (left <= 0) { cb.current(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const pct = ((duration - left) / duration) * 100;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 999, background: "#141414", borderTop: "2px solid #E63946", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: "#777", letterSpacing: 1.5, marginBottom: 5, fontFamily: "var(--mono)" }}>REST BETWEEN ROUNDS</div>
        <div style={{ height: 5, background: "#2a2a2a", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3, background: left <= 10 ? "#E63946" : "#2A9D8F", transition: "width 1s linear, background 0.3s" }} />
        </div>
      </div>
      <span style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: left <= 10 ? "#E63946" : "#fff", minWidth: 60, textAlign: "right" }}>{fmt(left)}</span>
      <button onClick={onDone} style={{ background: "none", border: "1px solid #444", color: "#888", padding: "6px 10px", borderRadius: 4, fontSize: 10, cursor: "pointer", fontFamily: "var(--mono)", letterSpacing: 1 }}>SKIP</button>
    </div>
  );
}

function WarmupSection({ dayId, accent, checks, setChecks }) {
  const [open, setOpen] = useState(false);
  const w = WARMUPS[dayId];
  if (!w) return null;
  const all = [...w.stability, ...w.dynamic, ...w.plyo];
  const done = Object.values(checks[dayId] || {}).filter(Boolean).length;
  const allDone = done === all.length && all.length > 0;

  const toggle = (idx) => setChecks((p) => {
    const dc = { ...(p[dayId] || {}) }; dc[idx] = !dc[idx]; return { ...p, [dayId]: dc };
  });

  const Item = ({ item, idx }) => {
    const ck = !!(checks[dayId] || {})[idx];
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 0", opacity: ck ? 0.3 : 1, transition: "opacity 0.2s" }}>
        <button onClick={() => toggle(idx)} style={{ width: 19, height: 19, borderRadius: 4, border: ck ? "none" : "2px solid #333", background: ck ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
          {ck && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}
        </button>
        <span style={{ fontSize: 13, color: "#ccc", flex: 1 }}>{item.name}</span>
        <span style={{ fontSize: 11, color: "#555", fontFamily: "var(--mono)" }}>{item.duration || item.reps}</span>
      </div>
    );
  };

  const Label = ({ icon, label }) => (
    <div style={{ fontSize: 9, color: accent, fontFamily: "var(--mono)", letterSpacing: 2, margin: "10px 0 4px", fontWeight: 700, opacity: 0.7 }}>{icon} {label}</div>
  );

  return (
    <div style={{ margin: "0 16px 10px", background: "#111", borderRadius: 8, overflow: "hidden", borderLeft: `3px solid ${allDone ? accent : "#1a1a1a"}`, transition: "border-color 0.3s" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: "none", border: "none", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: 1, color: accent }}>WARM-UP</span>
          <span style={{ fontSize: 11, color: "#444", fontFamily: "var(--mono)" }}>{done}/{all.length}</span>
        </div>
        <span style={{ color: "#444", fontSize: 12, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", display: "inline-block" }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          <Label icon="⏸" label="ISO / STABILITY" />
          {w.stability.map((item, i) => <Item key={`s${i}`} item={item} idx={`s${i}`} />)}
          <div style={{ height: 1, background: "#1a1a1a", margin: "8px 0" }} />
          <Label icon="⚡" label="DYNAMIC" />
          {w.dynamic.map((item, i) => <Item key={`d${i}`} item={item} idx={`d${i}`} />)}
          <div style={{ height: 1, background: "#1a1a1a", margin: "8px 0" }} />
          <Label icon="🔥" label="PLYO PRIMERS" />
          {w.plyo.map((item, i) => <Item key={`p${i}`} item={item} idx={`p${i}`} />)}
        </div>
      )}
    </div>
  );
}

function CircuitCard({ circuit, cIdx, trackData, rpe, accent, dayIdx, editMode, onEdit, onRemoveEx, onAddEx, onRoundsChange, onRestChange, onSetChange, onCheck, onRpe, startRest }) {
  const inputS = (w) => ({ width: w, padding: "4px 5px", background: "#0a0a0a", border: "1px solid #222", borderRadius: 4, color: "#ccc", fontSize: 12, fontFamily: "var(--mono)", outline: "none", textAlign: "center" });

  return (
    <div style={{ margin: "0 16px 10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)", color: accent, letterSpacing: 1.5 }}>{circuit.name}</span>
          {editMode ? (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input value={String(circuit.rounds)} onChange={(e) => onRoundsChange(dayIdx, cIdx, e.target.value)} style={{ ...inputS(28) }} />
              <span style={{ color: "#444", fontSize: 10, fontFamily: "var(--mono)" }}>rnds</span>
              <input value={String(circuit.rest)} onChange={(e) => onRestChange(dayIdx, cIdx, e.target.value)} style={{ ...inputS(36), marginLeft: 4 }} />
              <span style={{ color: "#444", fontSize: 10, fontFamily: "var(--mono)" }}>s rest</span>
            </div>
          ) : (
            <span style={{ fontSize: 10, color: "#444", fontFamily: "var(--mono)" }}>{circuit.rounds} rounds · {circuit.rest}s rest</span>
          )}
        </div>
        {!editMode && (
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 8, color: "#444", fontFamily: "var(--mono)", marginRight: 3 }}>RPE</span>
            {[6, 7, 8, 9, 10].map((r) => (
              <button key={r} onClick={() => onRpe(cIdx, r)} style={{
                width: 21, height: 19, fontSize: 9, fontWeight: 700, border: "none", borderRadius: 3,
                cursor: "pointer", fontFamily: "var(--mono)", transition: "all 0.15s",
                background: rpe === r ? RPE_COLORS[r] : "#151515", color: rpe === r ? "#000" : "#444",
              }}>{r}</button>
            ))}
          </div>
        )}
      </div>

      {editMode ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {circuit.exercises.map((ex, ei) => (
            <div key={ei} style={{ background: "#111", borderRadius: 6, padding: "8px 10px", display: "flex", alignItems: "center", gap: 6 }}>
              <input value={ex.name} onChange={(e) => onEdit(dayIdx, cIdx, ei, "name", e.target.value)} style={{ ...inputS("auto"), flex: 1, textAlign: "left", fontFamily: "var(--body)", fontSize: 13, fontWeight: 600, color: "#ddd" }} />
              <input value={ex.reps} onChange={(e) => onEdit(dayIdx, cIdx, ei, "reps", e.target.value)} style={{ ...inputS(60) }} />
              <button onClick={() => onRemoveEx(dayIdx, cIdx, ei)} style={{ background: "#E6394615", border: "none", color: "#E63946", fontSize: 13, cursor: "pointer", padding: "2px 6px", borderRadius: 3, fontWeight: 700 }}>×</button>
            </div>
          ))}
          <button onClick={() => onAddEx(dayIdx, cIdx)} style={{ padding: "8px", border: "1px dashed #222", borderRadius: 6, background: "transparent", color: "#444", fontFamily: "var(--mono)", fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>+ ADD</button>
        </div>
      ) : (
        Array.from({ length: circuit.rounds }, (_, ri) => (
          <div key={ri} style={{ marginBottom: ri < circuit.rounds - 1 ? 2 : 0 }}>
            <div style={{ fontSize: 9, color: "#333", fontFamily: "var(--mono)", letterSpacing: 1, padding: "4px 0 2px" }}>ROUND {ri + 1}</div>
            <div style={{ background: "#111", borderRadius: 6, padding: "6px 10px" }}>
              {circuit.exercises.map((ex, ei) => {
                const sd = trackData[ri]?.[ei] || { weight: "", reps: "", done: false };
                return (
                  <div key={ei} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 6, alignItems: "center", padding: "4px 0", opacity: sd.done ? 0.3 : 1, transition: "opacity 0.2s" }}>
                    <button onClick={() => { onCheck(cIdx, ri, ei); if (!sd.done) startRest(circuit.rest); }} style={{
                      width: 20, height: 20, borderRadius: 4, cursor: "pointer", flexShrink: 0, transition: "all 0.15s",
                      border: sd.done ? "none" : "2px solid #383838", background: sd.done ? accent : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{sd.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</button>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontSize: 12, color: "#aaa", flex: 1, fontFamily: "var(--body)" }}>{ex.name}</span>
                      <input type="number" inputMode="decimal" placeholder="lbs" value={sd.weight} onChange={(e) => onSetChange(cIdx, ri, ei, "weight", e.target.value)}
                        style={{ width: 50, padding: "3px 4px", background: "#0d0d0d", border: "1px solid #222", borderRadius: 3, color: "#fff", fontSize: 12, fontFamily: "var(--mono)", textAlign: "center", outline: "none" }} />
                      <span style={{ color: "#333", fontSize: 9 }}>×</span>
                      <input type="number" inputMode="numeric" placeholder={ex.reps} value={sd.reps} onChange={(e) => onSetChange(cIdx, ri, ei, "reps", e.target.value)}
                        style={{ width: 38, padding: "3px 4px", background: "#0d0d0d", border: "1px solid #222", borderRadius: 3, color: "#fff", fontSize: 12, fontFamily: "var(--mono)", textAlign: "center", outline: "none" }} />
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

function FinisherCard({ finisher, trackData, accent, onCheck, onSetChange, startRest }) {
  return (
    <div style={{ margin: "0 16px 10px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--mono)", color: accent, letterSpacing: 1.5, marginBottom: 6, opacity: 0.7 }}>🔻 {finisher.name}</div>
      {finisher.exercises.map((ex, ei) => (
        <div key={ei} style={{ background: "#111", borderRadius: 6, padding: "8px 10px", marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#ccc", marginBottom: 2, fontFamily: "var(--body)" }}>{ex.name}</div>
          <div style={{ fontSize: 10, color: "#444", fontFamily: "var(--mono)", marginBottom: 4 }}>{ex.sets}×{ex.reps} · {ex.rest}s rest</div>
          {trackData[ei]?.sets.map((sd, si) => (
            <div key={si} style={{ display: "grid", gridTemplateColumns: "26px 1fr", gap: 6, alignItems: "center", padding: "3px 0", opacity: sd.done ? 0.3 : 1, transition: "opacity 0.2s" }}>
              <button onClick={() => { onCheck(ei, si); if (!sd.done) startRest(ex.rest); }} style={{
                width: 20, height: 20, borderRadius: 4, cursor: "pointer", border: sd.done ? "none" : "2px solid #383838",
                background: sd.done ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
              }}>{sd.done && <span style={{ color: "#fff", fontSize: 11 }}>✓</span>}</button>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#555", fontSize: 10, fontFamily: "var(--mono)", width: 18 }}>S{si + 1}</span>
                <input type="number" inputMode="decimal" placeholder="lbs" value={sd.weight} onChange={(e) => onSetChange(ei, si, "weight", e.target.value)}
                  style={{ width: 50, padding: "3px 4px", background: "#0d0d0d", border: "1px solid #222", borderRadius: 3, color: "#fff", fontSize: 12, fontFamily: "var(--mono)", textAlign: "center", outline: "none" }} />
                <span style={{ color: "#333", fontSize: 9 }}>×</span>
                <input type="number" inputMode="numeric" placeholder={ex.reps} value={sd.reps} onChange={(e) => onSetChange(ei, si, "reps", e.target.value)}
                  style={{ width: 38, padding: "3px 4px", background: "#0d0d0d", border: "1px solid #222", borderRadius: 3, color: "#fff", fontSize: 12, fontFamily: "var(--mono)", textAlign: "center", outline: "none" }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════ MAIN APP ═══════════════════ */

export default function App() {
  const [activeDay, setActiveDay] = useState(0);
  const [sessionStart, setSessionStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [warmupChecks, setWarmupChecks] = useState({});
  const [days, setDays] = useState(JSON.parse(JSON.stringify(DEFAULT_DAYS)));
  const [trackData, setTrackData] = useState(() => buildTrackingData(DEFAULT_DAYS));

  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    const s = store.get("circuit-v1");
    if (s) { if (s.days) setDays(s.days); if (s.trackData) setTrackData(s.trackData); if (s.warmupChecks) setWarmupChecks(s.warmupChecks); }
    const ss = store.get("circuit-session");
    if (ss) setSessionStart(ss);
  }, []);

  useEffect(() => {
    if (!sessionStart) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [sessionStart]);

  const day = days[activeDay];
  const td = trackData[activeDay];

  const ensureSession = useCallback(() => {
    if (!sessionStart) {
      const t = Date.now(); setSessionStart(t); store.set("circuit-session", t);
    }
  }, [sessionStart]);

  const startRest = useCallback((dur) => { setRestTimer(dur); ensureSession(); }, [ensureSession]);

  const onCircuitCheck = useCallback((ci, ri, ei) => {
    setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].circuits[ci][ri][ei].done = !n[activeDay].circuits[ci][ri][ei].done; return n; });
    ensureSession();
  }, [activeDay, ensureSession]);

  const onCircuitSetChange = useCallback((ci, ri, ei, field, val) => {
    setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].circuits[ci][ri][ei][field] = val; return n; });
  }, [activeDay]);

  const onCircuitRpe = useCallback((ci, val) => {
    setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].circuitRpe[ci] = n[activeDay].circuitRpe[ci] === val ? null : val; return n; });
  }, [activeDay]);

  const onFinisherCheck = useCallback((ei, si) => {
    setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].finisher[ei].sets[si].done = !n[activeDay].finisher[ei].sets[si].done; return n; });
    ensureSession();
  }, [activeDay, ensureSession]);

  const onFinisherSetChange = useCallback((ei, si, field, val) => {
    setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); n[activeDay].finisher[ei].sets[si][field] = val; return n; });
  }, [activeDay]);

  const onEditEx = useCallback((di, ci, ei, field, val) => {
    setDays((p) => { const n = JSON.parse(JSON.stringify(p)); n[di].circuits[ci].exercises[ei][field] = val; return n; });
  }, []);

  const onRemoveEx = useCallback((di, ci, ei) => {
    setDays((p) => {
      const n = JSON.parse(JSON.stringify(p));
      if (n[di].circuits[ci].exercises.length <= 1) return p;
      n[di].circuits[ci].exercises.splice(ei, 1);
      setTrackData((td2) => { const nt = JSON.parse(JSON.stringify(td2)); nt[di].circuits[ci].forEach((round) => round.splice(ei, 1)); return nt; });
      return n;
    });
  }, []);

  const onAddEx = useCallback((di, ci) => {
    setDays((p) => {
      const n = JSON.parse(JSON.stringify(p));
      n[di].circuits[ci].exercises.push({ name: "New Exercise", reps: "8" });
      setTrackData((td2) => { const nt = JSON.parse(JSON.stringify(td2)); nt[di].circuits[ci].forEach((round) => round.push({ weight: "", reps: "", done: false })); return nt; });
      return n;
    });
  }, []);

  const onRoundsChange = useCallback((di, ci, val) => {
    const nr = Math.max(1, parseInt(val) || 1);
    setDays((p) => { const n = JSON.parse(JSON.stringify(p)); n[di].circuits[ci].rounds = nr; return n; });
    setTrackData((p) => {
      const n = JSON.parse(JSON.stringify(p));
      const exCount = days[di].circuits[ci].exercises.length;
      while (n[di].circuits[ci].length < nr) n[di].circuits[ci].push(Array.from({ length: exCount }, () => ({ weight: "", reps: "", done: false })));
      n[di].circuits[ci] = n[di].circuits[ci].slice(0, nr);
      return n;
    });
  }, [days]);

  const onRestChange = useCallback((di, ci, val) => {
    setDays((p) => { const n = JSON.parse(JSON.stringify(p)); n[di].circuits[ci].rest = parseInt(val) || 0; return n; });
  }, []);

  const saveSession = () => {
    setSaving(true);
    store.set("circuit-v1", { days, trackData, warmupChecks });
    const dk = `log:${new Date().toISOString().slice(0, 10)}:${day.id}`;
    store.set(dk, { day: day.id, elapsed, data: trackData[activeDay], ts: Date.now() });
    setSaved(true);
    setTimeout(() => { setSaved(false); setSaving(false); }, 1200);
  };

  const resetSession = () => {
    setSessionStart(null); setElapsed(0); store.del("circuit-session");
    setTrackData((p) => { const n = JSON.parse(JSON.stringify(p)); const f = buildTrackingData(days); n[activeDay] = f[activeDay]; return n; });
    setWarmupChecks((p) => ({ ...p, [day.id]: {} }));
  };

  let totalChecks = 0, doneChecks = 0;
  td.circuits.forEach((c) => c.forEach((round) => round.forEach((s) => { totalChecks++; if (s.done) doneChecks++; })));
  td.finisher.forEach((ex) => ex.sets.forEach((s) => { totalChecks++; if (s.done) doneChecks++; }));
  const pct = totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0;

  return (
    <div style={{ "--mono": "'JetBrains Mono', monospace", "--body": "'Outfit', sans-serif", minHeight: "100vh", background: "#0a0a0a", color: "#eee", fontFamily: "var(--body)", paddingBottom: restTimer ? 80 : 20 }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet" />

      <div style={{ padding: "14px 16px 0", position: "sticky", top: 0, zIndex: 90, background: "#0a0a0a" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {days.map((d, i) => (
            <button key={d.id} onClick={() => { setActiveDay(i); setEditMode(false); }} style={{
              flex: 1, padding: "10px 0 8px", border: "none", borderRadius: 6, cursor: "pointer",
              fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5, transition: "all 0.2s",
              background: activeDay === i ? d.color : "#131313", color: activeDay === i ? "#000" : "#444",
            }}>{d.label}</button>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.5, color: day.color }}>{day.title}</h1>
            <div style={{ fontSize: 10, color: "#444", fontFamily: "var(--mono)", marginTop: 2, letterSpacing: 0.5 }}>{day.subtitle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => setEditMode(!editMode)} style={{
              padding: "5px 10px", borderRadius: 4, cursor: "pointer", fontFamily: "var(--mono)",
              fontSize: 9, fontWeight: 700, letterSpacing: 1.5, transition: "all 0.2s",
              border: `1px solid ${editMode ? day.color : "#222"}`,
              background: editMode ? day.color + "15" : "transparent", color: editMode ? day.color : "#444",
            }}>{editMode ? "DONE" : "EDIT"}</button>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 19, fontWeight: 700, color: sessionStart ? "#fff" : "#2a2a2a" }}>{fmt(elapsed)}</div>
              <div style={{ fontSize: 8, color: "#444", fontFamily: "var(--mono)", letterSpacing: 1.5 }}>SESSION</div>
            </div>
          </div>
        </div>

        <div style={{ margin: "10px 0 12px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 3, background: "#161616", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 2, background: day.color, transition: "width 0.4s ease" }} />
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, color: pct === 100 ? day.color : "#444" }}>{pct}%</span>
        </div>
      </div>

      <WarmupSection dayId={day.id} accent={day.color} checks={warmupChecks} setChecks={setWarmupChecks} />

      {day.circuits.map((c, ci) => (
        <CircuitCard key={ci} circuit={c} cIdx={ci} trackData={td.circuits[ci]} rpe={td.circuitRpe[ci]}
          accent={day.color} dayIdx={activeDay} editMode={editMode}
          onEdit={onEditEx} onRemoveEx={onRemoveEx} onAddEx={onAddEx}
          onRoundsChange={onRoundsChange} onRestChange={onRestChange}
          onSetChange={onCircuitSetChange} onCheck={onCircuitCheck} onRpe={onCircuitRpe}
          startRest={startRest} />
      ))}

      <FinisherCard finisher={day.finisher} trackData={td.finisher} accent={day.color}
        onCheck={onFinisherCheck} onSetChange={onFinisherSetChange} startRest={startRest} />

      <div style={{ padding: "10px 16px 16px", display: "flex", gap: 8 }}>
        <button onClick={saveSession} disabled={saving} style={{
          flex: 1, padding: "13px 0", border: "none", borderRadius: 6, cursor: "pointer",
          fontFamily: "var(--mono)", fontSize: 12, fontWeight: 700, letterSpacing: 1.5, transition: "all 0.2s",
          background: saved ? "#2A9D8F" : day.color, color: "#000", opacity: saving ? 0.6 : 1,
        }}>{saved ? "✓ SAVED" : saving ? "..." : "SAVE SESSION"}</button>
        <button onClick={resetSession} style={{
          padding: "13px 16px", border: "1px solid #1e1e1e", borderRadius: 6, cursor: "pointer",
          background: "transparent", color: "#444", fontFamily: "var(--mono)", fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
        }}>RESET</button>
      </div>

      {restTimer && <RestTimer duration={restTimer} onDone={() => setRestTimer(null)} />}
    </div>
  );
}
