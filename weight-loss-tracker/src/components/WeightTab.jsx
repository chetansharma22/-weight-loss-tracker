
import { useState } from 'react';

const fmt = d => new Date(d + "T12:00:00").toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
const today = () => new Date().toISOString().slice(0, 10);

function CalendarPicker({ value, onChange }) {
  const [view, setView] = useState(() => value.slice(0, 7));
  const [y, m] = view.split('-').map(Number);
  const firstDay = new Date(y, m - 1, 1).getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  while (cells.length % 7 !== 0) cells.push(null);
  function prev() { const d = new Date(y,m-2,1); setView(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }
  function next() { const d = new Date(y,m,1); setView(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`); }
  return (
    <div style={{ background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:10, padding:10, marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
        <button onClick={prev} style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:16 }}>‹</button>
        <span style={{ fontSize:12, fontWeight:700, color:'#e2e2f0' }}>{new Date(y,m-1).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</span>
        <button onClick={next} style={{ background:'none', border:'none', color:'#a78bfa', cursor:'pointer', fontSize:16 }}>›</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:2 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d} style={{ textAlign:'center', fontSize:9, color:'#6b6b8a' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((day, i) => {
          const ds = day ? `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;
          const isFuture = ds > today();
          const isSel = ds === value, isToday = ds === today();
          return (
            <div key={i} onClick={() => ds && !isFuture && onChange(ds)}
              style={{ padding:'5px 2px', textAlign:'center', fontSize:11, borderRadius:6,
                cursor: ds&&!isFuture?'pointer':'default', opacity:isFuture?0.3:1,
                background:isSel?'#7c3aed':isToday?'#2a1a4a':'transparent',
                color:isSel?'#fff':isToday?'#a78bfa':!day?'transparent':'#c4c4d4',
                fontWeight:isSel?700:400 }}>
              {day||''}
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
  datePill: { display:'inline-flex', alignItems:'center', gap:6, background:'#1a1a2e', border:'1px solid #3a2a6a', borderRadius:20, padding:'5px 12px', fontSize:12, color:'#a78bfa', cursor:'pointer', fontWeight:600, marginBottom:8 },
};

export default function WeightTab({ weights, onLog, onDelete }) {
  const [weightDate, setWeightDate] = useState(today());
  const [showCal, setShowCal] = useState(false);
  const [val, setVal] = useState('');
  const [saving, setSaving] = useState(false);

  // weights is array of {id, date, weight}
  const sorted = [...weights].sort((a,b) => a.date.localeCompare(b.date));
  const first = sorted[0]?.weight;
  const latest = sorted[sorted.length-1]?.weight;
  const lost = first && latest ? +(first - latest).toFixed(1) : null;

  async function submit() {
    if (!val) return;
    setSaving(true);
    await onLog(weightDate, +val);
    setVal('');
    setSaving(false);
  }

  return <>
    {lost !== null && (
      <div style={{ ...s.card, background:lost>0?'#0f2a1a':'#2a0f0f', borderColor:lost>0?'#34d399':'#ef4444', textAlign:'center' }}>
        <div style={{ fontSize:26, fontWeight:800, color:lost>0?'#34d399':'#ef4444' }}>
          {lost>0 ? `−${lost} kg` : `+${Math.abs(lost)} kg`}
        </div>
        <div style={{ fontSize:12, color:'#6b6b8a' }}>
          total {lost>0?'lost':'gained'} since {sorted[0]?.date ? fmt(sorted[0].date) : '—'}
        </div>
      </div>
    )}

    <div style={s.card}>
      <p style={s.title}>Log Weight</p>
      <label style={s.label}>Date</label>
      <div style={s.datePill} onClick={() => setShowCal(v=>!v)}>
        📅 {weightDate === today() ? 'Today' : fmt(weightDate)} {showCal?'▲':'▼'}
      </div>
      {showCal && <CalendarPicker value={weightDate} onChange={d => { setWeightDate(d); setShowCal(false); }} />}
      <label style={s.label}>Weight (kg)</label>
      <input style={s.input} type="number" step="0.1" placeholder="e.g. 72.5" value={val} onChange={e => setVal(e.target.value)} />
      <button style={s.btn()} onClick={submit} disabled={saving}>{saving?'Saving...':'Log Weight'}</button>
    </div>

    <div style={s.card}>
      <p style={s.title}>Weight History — {sorted.length} entries</p>
      {sorted.length === 0 && <p style={{ color:'#6b6b8a', fontSize:13, textAlign:'center', padding:10 }}>Koi weight nahi logged abhi.</p>}
      {sorted.length > 1 && (() => {
        const recent = sorted.slice(-12);
        const min = Math.min(...recent.map(e=>e.weight));
        const max = Math.max(...recent.map(e=>e.weight));
        const range = max-min||1;
        return (
          <div style={{ display:'flex', gap:4, alignItems:'flex-end', height:80, marginBottom:12 }}>
            {recent.map(e => {
              const h = 16 + ((e.weight-min)/range)*56;
              return (
                <div key={e.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ fontSize:8, color:'#6b6b8a', marginBottom:1 }}>{e.weight}</div>
                  <div style={{ width:'100%', height:h, background:e.date===today()?'#a78bfa':'#2a2a4a', borderRadius:3 }} />
                  <div style={{ fontSize:8, color:e.date===today()?'#a78bfa':'#6b6b8a', marginTop:2 }}>
                    {new Date(e.date+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
      {[...sorted].reverse().map(e => (
        <div key={e.date} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #1e1e2e', fontSize:13 }}>
          <span style={{ color:'#8888aa' }}>{fmt(e.date)}</span>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontWeight:700, color:e.date===today()?'#a78bfa':'#e2e2f0' }}>{e.weight} kg</span>
            {onDelete && <button onClick={() => onDelete(e.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:13 }}>✕</button>}
          </div>
        </div>
      ))}
    </div>
  </>;
}