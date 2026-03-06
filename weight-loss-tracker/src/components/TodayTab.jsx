import { useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

function Ring({ pct, color, size = 70, label, sub }) {
  const r = (size - 10) / 2, circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  const over = pct > 100;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e2e" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={over ? '#ef4444' : color}
          strokeWidth={8} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" fill={over ? '#ef4444' : '#e2e2f0'} fontSize={13} fontWeight={700}>{Math.round(pct)}%</text>
      </svg>
      <div style={{ fontSize:11, color, fontWeight:600, marginTop:2 }}>{label}</div>
      <div style={{ fontSize:10, color:'#6b6b8a' }}>{sub}</div>
    </div>
  );
}

const s = {
  card: { background:'#12121f', border:'1px solid #1e1e2e', borderRadius:16, padding:18, marginBottom:14 },
  title: { fontSize:14, fontWeight:700, color:'#a78bfa', marginBottom:12 },
  label: { display:'block', fontSize:12, color:'#6b6b8a', marginBottom:4 },
  input: { width:'100%', background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:8, color:'#e2e2f0', padding:'9px 12px', fontSize:14, boxSizing:'border-box', outline:'none' },
  btn: { width:'100%', padding:11, borderRadius:10, border:'none', cursor:'pointer', background:'#7c3aed', color:'#fff', fontWeight:700, fontSize:14, marginTop:8 },
  chip: (c) => ({ fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:20, background:c+'22', color:c }),
};

export default function TodayTab({ meals, goals, onAdd, onDelete }) {
  const [form, setForm] = useState({ name:'', calories:'', protein:'' });
  const [saving, setSaving] = useState(false);
  const todayMeals = meals.filter(m => m.date === today());
  const cals = todayMeals.reduce((s, m) => s + m.calories, 0);
  const prot = todayMeals.reduce((s, m) => s + m.protein, 0);
  const remaining = Math.max(goals.calories - cals, 0);

  async function submit() {
    if (!form.name || !form.calories || !form.protein) return;
    setSaving(true);
    await onAdd(form.name, +form.calories, +form.protein);
    setForm({ name:'', calories:'', protein:'' });
    setSaving(false);
  }

  return <>
    <div style={s.card}>
      <p style={s.title}>Today's Progress</p>
      <div style={{ display:'flex', justifyContent:'space-around', marginBottom:14 }}>
        <Ring pct={(cals/goals.calories)*100} color="#f59e0b" label="Calories" sub={`${cals}/${goals.calories}`} />
        <Ring pct={(prot/goals.protein)*100} color="#34d399" label="Protein" sub={`${prot}g/${goals.protein}g`} />
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:22, fontWeight:800, color: remaining===0?'#ef4444':'#60a5fa' }}>{remaining}</div>
          <div style={{ fontSize:11, color:'#60a5fa', fontWeight:600 }}>kcal left</div>
          <div style={{ fontSize:10, color:'#6b6b8a' }}>today</div>
        </div>
      </div>
      {cals > goals.calories && (
        <div style={{ background:'#ef444420', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#ef4444', textAlign:'center' }}>
          ⚠️ Exceeded calorie goal by {cals - goals.calories} kcal
        </div>
      )}
    </div>

    <div style={s.card}>
      <p style={s.title}>Log a Meal</p>
      <label style={s.label}>Food name</label>
      <input style={{ ...s.input, marginBottom:8 }} placeholder="e.g. Grilled chicken salad" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}>
          <label style={s.label}>Calories (kcal)</label>
          <input style={s.input} type="number" placeholder="0" value={form.calories} onChange={e => setForm(f=>({...f,calories:e.target.value}))} />
        </div>
        <div style={{ flex:1 }}>
          <label style={s.label}>Protein (g)</label>
          <input style={s.input} type="number" placeholder="0" value={form.protein} onChange={e => setForm(f=>({...f,protein:e.target.value}))} />
        </div>
      </div>
      <button style={s.btn} onClick={submit} disabled={saving}>{saving ? 'Saving...' : '+ Add Meal'}</button>
    </div>

    <div style={s.card}>
      <p style={s.title}>Today's Meals ({todayMeals.length})</p>
      {todayMeals.length === 0 && <p style={{ color:'#6b6b8a', fontSize:13, textAlign:'center', padding:12 }}>No meals logged yet 🥗</p>}
      {[...todayMeals].reverse().map(m => (
        <div key={m.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #1e1e2e' }}>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>{m.name}</div>
            <div style={{ fontSize:12, color:'#6b6b8a', marginTop:2, display:'flex', gap:8 }}>
              <span>{m.time}</span>
              <span style={s.chip('#f59e0b')}>{m.calories} kcal</span>
              <span style={s.chip('#34d399')}>{m.protein}g</span>
            </div>
          </div>
          <button onClick={() => onDelete(m.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:16 }}>✕</button>
        </div>
      ))}
    </div>
  </>;
}