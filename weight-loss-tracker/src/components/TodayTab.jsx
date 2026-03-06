
import { useState } from 'react';

const fmt = d => new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const today = () => new Date().toISOString().slice(0, 10);

function Ring({ pct, color, size = 64, label, sub }) {
  const r = (size - 10) / 2, circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ, over = pct > 100;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={7} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={over?'#ef4444':color}
          strokeWidth={7} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition:'stroke-dasharray 0.4s' }} />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill={over?'#ef4444':'#e2e2f0'} fontSize={12} fontWeight={700}>{Math.round(pct)}%</text>
      </svg>
      <div style={{ fontSize:10, color, fontWeight:600, marginTop:2 }}>{label}</div>
      <div style={{ fontSize:9, color:'#6b6b8a' }}>{sub}</div>
    </div>
  );
}

function CalendarPicker({ value, onChange }) {
  const [view, setView] = useState(() => value.slice(0, 7));
  const [y, m] = view.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);

  function prev() { const d = new Date(y, m-2, 1); setView(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }
  function next() { const d = new Date(y, m, 1); setView(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }

  return (
    <div style={{ background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:10, padding:10, marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <button onClick={prev} style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:16 }}>‹</button>
        <span style={{ fontSize:12, fontWeight:700, color:'#e2e2f0' }}>{new Date(y,m-1).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</span>
        <button onClick={next} style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:16 }}>›</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:2 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ textAlign:'center', fontSize:9, color:'#6b6b8a', padding:'2px 0' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((day, i) => {
          const ds = day ? `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;
          const isFuture = ds > today();
          const isSelected = ds === value, isToday = ds === today();
          return (
            <div key={i} onClick={() => ds && !isFuture && onChange(ds)}
              style={{ padding:'5px 2px', textAlign:'center', fontSize:11, borderRadius:6,
                cursor: ds && !isFuture ? 'pointer' : 'default', opacity: isFuture ? 0.3 : 1,
                background: isSelected ? '#7c3aed' : isToday ? '#2a1a4a' : 'transparent',
                color: isSelected ? '#fff' : isToday ? '#a78bfa' : !day ? 'transparent' : '#c4c4d4',
                fontWeight: isSelected ? 700 : 400 }}>
              {day || ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  card: { background:'#12121f', border:'1px solid #1e1e2e', borderRadius:16, padding:16, marginBottom:12 },
  title: { fontSize:14, fontWeight:700, color:'#a78bfa', marginBottom:10 },
  label: { display:'block', fontSize:12, color:'#6b6b8a', marginBottom:4 },
  input: { width:'100%', background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:8, color:'#e2e2f0', padding:'9px 12px', fontSize:14, boxSizing:'border-box', outline:'none' },
  btn: (c) => ({ width:'100%', padding:11, borderRadius:10, border:'none', cursor:'pointer', background:c||'#7c3aed', color:'#fff', fontWeight:700, fontSize:14, marginTop:8 }),
  chip: (c) => ({ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, background:c+'22', color:c }),
  datePill: { display:'inline-flex', alignItems:'center', gap:6, background:'#1a1a2e', border:'1px solid #3a2a6a', borderRadius:20, padding:'5px 12px', fontSize:12, color:'#a78bfa', cursor:'pointer', fontWeight:600 },
};

export default function TodayTab({ meals, goals, onAdd, onDelete }) {
  const [selectedDate, setSelectedDate] = useState(today());
  const [showCal, setShowCal] = useState(false);
  const [form, setForm] = useState({ name:'', calories:'', protein:'' });
  const [saving, setSaving] = useState(false);

  const dayMeals = meals.filter(m => m.date === selectedDate);
  const cals = dayMeals.reduce((s, m) => s + m.calories, 0);
  const prot = dayMeals.reduce((s, m) => s + m.protein, 0);
  const remaining = Math.max(goals.calories - cals, 0);

  async function submit() {
    if (!form.name || !form.calories || !form.protein) return;
    setSaving(true);
    await onAdd(form.name, +form.calories, +form.protein, selectedDate);
    setForm({ name:'', calories:'', protein:'' });
    setSaving(false);
  }

  return <>
    <div style={s.card}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: showCal ? 10 : 0 }}>
        <span style={{ fontSize:13, color:'#6b6b8a' }}>Logging for:</span>
        <div style={s.datePill} onClick={() => setShowCal(v => !v)}>
          📅 {selectedDate === today() ? 'Today' : fmt(selectedDate)} {showCal ? '▲' : '▼'}
        </div>
      </div>
      {showCal && <CalendarPicker value={selectedDate} onChange={d => { setSelectedDate(d); setShowCal(false); }} />}
    </div>

    <div style={s.card}>
      <p style={s.title}>{selectedDate === today() ? "Today's Progress" : `Progress — ${fmt(selectedDate)}`}</p>
      <div style={{ display:'flex', justifyContent:'space-around', marginBottom:12 }}>
        <Ring pct={(cals/goals.calories)*100} color="#f59e0b" label="Calories" sub={`${cals}/${goals.calories}`} />
        <Ring pct={(prot/goals.protein)*100} color="#34d399" label="Protein" sub={`${prot}g/${goals.protein}g`} />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:20, fontWeight:800, color: remaining===0?'#ef4444':'#60a5fa' }}>{remaining}</div>
          <div style={{ fontSize:10, color:'#60a5fa', fontWeight:600 }}>kcal left</div>
        </div>
      </div>
      {cals > goals.calories && (
        <div style={{ background:'#ef444420', borderRadius:8, padding:'7px 12px', fontSize:12, color:'#ef4444', textAlign:'center' }}>
          ⚠️ Exceeded by {cals - goals.calories} kcal
        </div>
      )}
    </div>

    <div style={s.card}>
      <p style={s.title}>Add Meal</p>
      <label style={s.label}>Food name</label>
      <input style={{ ...s.input, marginBottom:8 }} placeholder="e.g. Dal chawal" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}><label style={s.label}>Calories (kcal)</label><input style={s.input} type="number" placeholder="0" value={form.calories} onChange={e => setForm(f=>({...f,calories:e.target.value}))} /></div>
        <div style={{ flex:1 }}><label style={s.label}>Protein (g)</label><input style={s.input} type="number" placeholder="0" value={form.protein} onChange={e => setForm(f=>({...f,protein:e.target.value}))} /></div>
      </div>
      <button style={s.btn()} onClick={submit} disabled={saving}>{saving ? 'Saving...' : '+ Add Meal'}</button>
    </div>

    <div style={s.card}>
      <p style={s.title}>Meals on {selectedDate === today() ? 'Today' : fmt(selectedDate)} ({dayMeals.length})</p>
      {dayMeals.length === 0 && <p style={{ color:'#6b6b8a', fontSize:13, textAlign:'center', padding:10 }}>Koi meal nahi logged 🥗</p>}
      {[...dayMeals].reverse().map(m => (
        <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid #1e1e2e' }}>
          <div>
            <div style={{ fontWeight:600, fontSize:13 }}>{m.name}</div>
            <div style={{ fontSize:11, color:'#6b6b8a', marginTop:2, display:'flex', gap:6 }}>
              <span>{m.time}</span>
              <span style={s.chip('#f59e0b')}>{m.calories} kcal</span>
              <span style={s.chip('#34d399')}>{m.protein}g</span>
            </div>
          </div>
          <button onClick={() => onDelete(m.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:15 }}>✕</button>
        </div>
      ))}
    </div>
  </>;
}