import { useState } from 'react';

const today = () => new Date().toISOString().slice(0, 10);

const s = {
  card: { background:'#12121f', border:'1px solid #1e1e2e', borderRadius:16, padding:18, marginBottom:14 },
  title: { fontSize:14, fontWeight:700, color:'#a78bfa', marginBottom:12 },
  label: { display:'block', fontSize:12, color:'#6b6b8a', marginBottom:4 },
  input: { width:'100%', background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:8, color:'#e2e2f0', padding:'9px 12px', fontSize:14, boxSizing:'border-box', outline:'none' },
  btn: { width:'100%', padding:11, borderRadius:10, border:'none', cursor:'pointer', background:'#7c3aed', color:'#fff', fontWeight:700, fontSize:14, marginTop:8 },
};

export default function WeightTab({ weights, onLog }) {
  const [val, setVal] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!val) return;
    setSaving(true);
    await onLog(today(), +val);
    setVal('');
    setSaving(false);
  }

  const first = weights[0]?.weight;
  const latest = weights[weights.length - 1]?.weight;
  const lost = first && latest ? +(first - latest).toFixed(1) : null;

  return <>
    {lost !== null && (
      <div style={{ ...s.card, background: lost>0?'#0f2a1a':'#2a0f0f', borderColor: lost>0?'#34d399':'#ef4444', textAlign:'center', marginBottom:14 }}>
        <div style={{ fontSize:28, fontWeight:800, color: lost>0?'#34d399':'#ef4444' }}>
          {lost > 0 ? `−${lost} kg` : `+${Math.abs(lost)} kg`}
        </div>
        <div style={{ fontSize:12, color:'#6b6b8a' }}>total {lost>0?'lost':'gained'} since first log</div>
      </div>
    )}

    <div style={s.card}>
      <p style={s.title}>Log Today's Weight</p>
      <label style={s.label}>Weight (kg)</label>
      <input style={s.input} type="number" step="0.1" placeholder="e.g. 72.5" value={val} onChange={e => setVal(e.target.value)} />
      <button style={s.btn} onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Log Weight'}</button>
    </div>

    <div style={s.card}>
      <p style={s.title}>Weight History</p>
      {weights.length === 0 && <p style={{ color:'#6b6b8a', fontSize:13, textAlign:'center', padding:12 }}>No weight logged yet.</p>}
      {weights.length > 0 && (() => {
        const recent = weights.slice(-10);
        const min = Math.min(...recent.map(e => e.weight));
        const max = Math.max(...recent.map(e => e.weight));
        const range = max - min || 1;
        return (
          <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:90, marginBottom:12 }}>
            {recent.map(e => {
              const h = 20 + ((e.weight - min) / range) * 60;
              const isToday = e.date === today();
              return (
                <div key={e.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
                  <div style={{ fontSize:9, color:'#6b6b8a', marginBottom:2 }}>{e.weight}</div>
                  <div style={{ width:'100%', height:h, background: isToday?'#a78bfa':'#2a2a4a', borderRadius:4 }} />
                  <div style={{ fontSize:9, color: isToday?'#a78bfa':'#6b6b8a', marginTop:3 }}>
                    {new Date(e.date+'T12:00:00').toLocaleDateString([],{month:'short',day:'numeric'})}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}
      {[...weights].reverse().slice(0, 7).map(e => (
        <div key={e.date} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e1e2e', fontSize:13 }}>
          <span style={{ color:'#8888aa' }}>{new Date(e.date+'T12:00:00').toLocaleDateString([],{weekday:'short',month:'short',day:'numeric'})}</span>
          <span style={{ fontWeight:700, color: e.date===today()?'#a78bfa':'#e2e2f0' }}>{e.weight} kg</span>
        </div>
      ))}
    </div>
  </>;
}