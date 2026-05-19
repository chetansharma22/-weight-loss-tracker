import { useState } from 'react';

const fmt = d => new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const todayStr = () => new Date().toISOString().slice(0, 10);

// ── Calendar ──────────────────────────────────────────────
function CalendarPicker({ value, onChange }) {
  const [view, setView] = useState(value.slice(0, 7));
  const [y, m] = view.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const prev = () => { const d = new Date(y, m - 2, 1); setView(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); };
  const next = () => { const d = new Date(y, m, 1); setView(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); };
  const td = todayStr();

  return (
    <div style={{ background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:10, padding:10, marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
        <button onClick={prev} style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 6px' }}>‹</button>
        <span style={{ fontSize:13, fontWeight:700, color:'#e2e2f0' }}>
          {new Date(y, m-1).toLocaleDateString('en-IN', { month:'long', year:'numeric' })}
        </span>
        <button onClick={next} style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:20, lineHeight:1, padding:'0 6px' }}>›</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:10, color:'#6b6b8a' }}>{d}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((day, i) => {
          const ds = day ? `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;
          const isFuture = ds ? ds > td : false;
          const isSel = ds === value, isToday = ds === td;
          return (
            <div key={i}
              onClick={() => { if (ds && !isFuture) onChange(ds); }}
              style={{
                padding:'7px 2px', textAlign:'center', fontSize:13, borderRadius:6,
                cursor: ds && !isFuture ? 'pointer' : 'default',
                opacity: isFuture ? 0.25 : 1,
                background: isSel ? '#7c3aed' : isToday ? '#2a1a4a' : 'transparent',
                color: isSel ? '#fff' : isToday ? '#a78bfa' : !day ? 'transparent' : '#c4c4d4',
                fontWeight: isSel ? 700 : 400,
              }}>
              {day || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Ring ─────────────────────────────────────────────────
function Ring({ pct, color, size=64, label, sub }) {
  const r = (size-10)/2, circ = 2*Math.PI*r;
  const dash = Math.min(pct/100,1)*circ, over = pct>100;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={7}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={over?'#ef4444':color}
          strokeWidth={7} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition:'stroke-dasharray 0.4s' }}/>
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill={over?'#ef4444':'#e2e2f0'} fontSize={12} fontWeight={700}>
          {Math.round(pct)}%
        </text>
      </svg>
      <div style={{ fontSize:10, color, fontWeight:600, marginTop:2 }}>{label}</div>
      <div style={{ fontSize:9, color:'#6b6b8a' }}>{sub}</div>
    </div>
  );
}

const cs = {
  card:  { background:'#12121f', border:'1px solid #1e1e2e', borderRadius:16, padding:16, marginBottom:12 },
  title: { fontSize:14, fontWeight:700, color:'#a78bfa', margin:'0 0 10px' },
  lbl:   { display:'block', fontSize:12, color:'#6b6b8a', marginBottom:4 },
  inp:   { width:'100%', background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:8, color:'#e2e2f0', padding:'10px 12px', fontSize:14, boxSizing:'border-box', outline:'none' },
  btn:   (c) => ({ width:'100%', padding:12, borderRadius:10, border:'none', cursor:'pointer', background:c||'#7c3aed', color:'#fff', fontWeight:700, fontSize:14, marginTop:8 }),
  pill:  { display:'inline-flex', alignItems:'center', gap:6, background:'#1a1a2e', border:'1px solid #3a2a6a', borderRadius:20, padding:'6px 14px', fontSize:13, color:'#a78bfa', cursor:'pointer', fontWeight:600 },
  chip:  (c) => ({ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, background:c+'22', color:c }),
};

// ── Main Component ────────────────────────────────────────
export default function TodayTab({ meals, goals, onAdd, onDelete, onCopyToDate }) {
  const [selDate, setSelDate] = useState(todayStr());
  const [showCal, setShowCal] = useState(false);
  const [form, setForm] = useState({ name:'', calories:'', protein:'' });
  const [saving, setSaving] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyDestDate, setCopyDestDate] = useState(todayStr());
  const [copied, setCopied] = useState(false);

  const td = todayStr();
  const dayMeals = meals.filter(m => m.date === selDate);
  const cals = dayMeals.reduce((s, m) => s + m.calories, 0);
  const prot = dayMeals.reduce((s, m) => s + m.protein, 0);
  const remaining = Math.max(goals.calories - cals, 0);

  async function submit() {
    const name = form.name.trim();
    const calories = +form.calories;
    const protein = +form.protein;
    if (!name || !calories || !protein) return;
    setSaving(true);
    await onAdd(name, calories, protein, selDate);
    setForm({ name:'', calories:'', protein:'' });
    setSaving(false);
  }

  async function handleCopy() {
    if (!onCopyToDate) { console.error('onCopyToDate prop missing!'); return; }
    if (copyDestDate === selDate) { alert('Source aur destination date same hai!'); return; }
    await onCopyToDate(selDate, copyDestDate);
    setCopied(true);
    setShowCopyModal(false);
    setSelDate(copyDestDate); // destination date pe chale jao
    setTimeout(() => setCopied(false), 2000);
  }

  return <>
    {/* Date Picker */}
    <div style={cs.card}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'#6b6b8a' }}>Logging for:</span>
        <div style={cs.pill} onClick={() => setShowCal(v => !v)}>
          📅 {selDate === td ? 'Today' : fmt(selDate)} {showCal ? '▲' : '▼'}
        </div>
      </div>
      {showCal && (
        <div style={{ marginTop:10 }}>
          <CalendarPicker value={selDate} onChange={d => { setSelDate(d); setShowCal(false); }} />
        </div>
      )}
      {selDate !== td && (
        <div style={{ marginTop:8, fontSize:11, color:'#6b6b8a', textAlign:'center' }}>
          Showing data for <span style={{ color:'#a78bfa', fontWeight:700 }}>{fmt(selDate)}</span>
        </div>
      )}
    </div>

    {/* Progress Rings */}
    <div style={cs.card}>
      <p style={cs.title}>{selDate === td ? "Today's Progress" : `Progress — ${fmt(selDate)}`}</p>
      <div style={{ display:'flex', justifyContent:'space-around', marginBottom:12 }}>
        <Ring pct={(cals/goals.calories)*100} color="#f59e0b" label="Calories" sub={`${cals}/${goals.calories}`}/>
        <Ring pct={(prot/goals.protein)*100}  color="#34d399" label="Protein"  sub={`${prot}g/${goals.protein}g`}/>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:20, fontWeight:800, color:remaining===0?'#ef4444':'#60a5fa' }}>{remaining}</div>
          <div style={{ fontSize:10, color:'#60a5fa', fontWeight:600 }}>kcal left</div>
        </div>
      </div>
      {cals > goals.calories && (
        <div style={{ background:'#ef444420', borderRadius:8, padding:'7px 12px', fontSize:12, color:'#ef4444', textAlign:'center' }}>
          ⚠️ Exceeded by {cals - goals.calories} kcal
        </div>
      )}
    </div>

    {/* Add Meal */}
    <div style={cs.card}>
      <p style={cs.title}>Add Meal to {selDate === td ? 'Today' : fmt(selDate)}</p>
      <label style={cs.lbl}>Food name</label>
      <input style={{ ...cs.inp, marginBottom:8 }} placeholder="e.g. Dal chawal"
        value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))}
        onKeyDown={e => e.key === 'Enter' && submit()} />
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}>
          <label style={cs.lbl}>Calories (kcal)</label>
          <input style={cs.inp} type="number" placeholder="0"
            value={form.calories} onChange={e => setForm(f => ({...f, calories:e.target.value}))} />
        </div>
        <div style={{ flex:1 }}>
          <label style={cs.lbl}>Protein (g)</label>
          <input style={cs.inp} type="number" placeholder="0"
            value={form.protein} onChange={e => setForm(f => ({...f, protein:e.target.value}))} />
        </div>
      </div>
      <button style={cs.btn()} onClick={submit} disabled={saving}>
        {saving ? 'Saving...' : `+ Add Meal`}
      </button>
    </div>

    {/* Meal List */}
    <div style={cs.card}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <p style={{ ...cs.title, margin:0 }}>
          {selDate === td ? "Today's" : fmt(selDate)} Meals ({dayMeals.length})
        </p>
        {selDate !== td && dayMeals.length > 0 && (
          <button onClick={() => { setCopyDestDate(todayStr()); setShowCopyModal(true); }}
            style={{ background:'#1a3a1a', border:'1px solid #34d399', borderRadius:20,
              color:'#34d399', fontSize:11, fontWeight:700, padding:'4px 10px', cursor:'pointer' }}>
            {copied ? '✅ Copied!' : '📋 Copy Meals'}
          </button>
        )}
      </div>
      {dayMeals.length === 0 && (
        <p style={{ color:'#6b6b8a', fontSize:13, textAlign:'center', padding:10 }}>
          {selDate === td ? 'Koi meal nahi logged aaj 🥗' : 'Is date pe koi meal nahi tha.'}
        </p>
      )}
      {[...dayMeals].reverse().map(m => (
        <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid #1e1e2e' }}>
          <div>
            <div style={{ fontWeight:600, fontSize:13 }}>{m.name}</div>
            <div style={{ fontSize:11, color:'#6b6b8a', marginTop:2, display:'flex', gap:6 }}>
              <span>{m.time}</span>
              <span style={cs.chip('#f59e0b')}>{m.calories} kcal</span>
              <span style={cs.chip('#34d399')}>{m.protein}g</span>
            </div>
          </div>
          <button onClick={() => onDelete(m.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:15 }}>✕</button>
        </div>
      ))}
    </div>
    {/* Copy Modal */}
    {showCopyModal && (
      <div style={{ position:'fixed', inset:0, background:'#000000aa', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:16 }}>
        <div style={{ background:'#12121f', border:'1px solid #2a2a3a', borderRadius:20, padding:20, width:'100%', maxWidth:360 }}>
          <h3 style={{ color:'#a78bfa', fontSize:15, fontWeight:700, margin:'0 0 4px' }}>📋 Copy Meals</h3>
          <p style={{ color:'#6b6b8a', fontSize:12, margin:'0 0 14px' }}>
            <span style={{ color:'#e2e2f0' }}>{fmt(selDate)}</span> ke meals kahan copy karein?
          </p>
          <p style={{ fontSize:12, color:'#6b6b8a', marginBottom:6 }}>Destination date choose karo:</p>
          <CalendarPicker value={copyDestDate} onChange={d => setCopyDestDate(d)} />
          <div style={{ background:'#1a1a2e', borderRadius:10, padding:'8px 12px', marginBottom:12, fontSize:12, color:'#a78bfa', textAlign:'center' }}>
            Copy to: <strong>{copyDestDate === todayStr() ? 'Today' : fmt(copyDestDate)}</strong>
          </div>
          <button onClick={handleCopy}
            style={{ width:'100%', padding:11, borderRadius:10, border:'none', cursor:'pointer', background:'#7c3aed', color:'#fff', fontWeight:700, fontSize:14, marginBottom:8 }}>
            ✅ Copy {dayMeals.length} Meals
          </button>
          <button onClick={() => setShowCopyModal(false)}
            style={{ width:'100%', padding:11, borderRadius:10, border:'none', cursor:'pointer', background:'#1e1e2e', color:'#8888aa', fontWeight:700, fontSize:14 }}>
            Cancel
          </button>
        </div>
      </div>
    )}
  </>;
}
