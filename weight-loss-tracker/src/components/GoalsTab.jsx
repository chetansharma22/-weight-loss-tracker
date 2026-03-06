import { useState } from 'react';

const s = {
  card: { background:'#12121f', border:'1px solid #1e1e2e', borderRadius:16, padding:18, marginBottom:14 },
  title: { fontSize:14, fontWeight:700, color:'#a78bfa', marginBottom:12 },
  label: { display:'block', fontSize:12, color:'#6b6b8a', marginBottom:4 },
  input: { width:'100%', background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:8, color:'#e2e2f0', padding:'9px 12px', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:12 },
  btn: (c) => ({ width:'100%', padding:11, borderRadius:10, border:'none', cursor:'pointer', background:c||'#7c3aed', color:'#fff', fontWeight:700, fontSize:14, marginTop:4 }),
};

export default function GoalsTab({ goals, onSave }) {
  const [edit, setEdit] = useState(false);
  const [tmp, setTmp] = useState(goals);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await onSave(tmp.calories, tmp.protein);
    setEdit(false); setSaving(false);
  }

  return <>
    <div style={{ ...s.card, background:'#0f1a2a', borderColor:'#1e3a5a', marginBottom:14 }}>
      <p style={{ fontSize:12, color:'#60a5fa', margin:0 }}>
        🧮 <strong>Rule of thumb:</strong> A 500 kcal/day deficit = ~0.5 kg/week loss. Aim for protein at 1.6–2.2× your body weight in kg.
      </p>
    </div>
    <div style={s.card}>
      <p style={s.title}>Your Daily Goals</p>
      {!edit ? <>
        <div style={{ display:'flex', gap:10, marginBottom:14 }}>
          {[{label:'Calorie Goal',val:`${goals.calories} kcal`,color:'#f59e0b'},{label:'Protein Goal',val:`${goals.protein}g`,color:'#34d399'}].map(({label,val,color})=>(
            <div key={label} style={{ flex:1, background:'#0a0a14', borderRadius:12, padding:14, textAlign:'center' }}>
              <div style={{ fontSize:11, color:'#6b6b8a', marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:20, fontWeight:800, color }}>{val}</div>
            </div>
          ))}
        </div>
        <button style={s.btn('#1e1e2e')} onClick={() => { setTmp(goals); setEdit(true); }}>✏️ Edit Goals</button>
      </> : <>
        <label style={s.label}>Daily Calorie Goal (kcal)</label>
        <input style={s.input} type="number" value={tmp.calories} onChange={e => setTmp(g=>({...g,calories:+e.target.value}))} />
        <label style={s.label}>Daily Protein Goal (g)</label>
        <input style={s.input} type="number" value={tmp.protein} onChange={e => setTmp(g=>({...g,protein:+e.target.value}))} />
        <button style={s.btn()} onClick={save} disabled={saving}>{saving?'Saving...':'Save Goals'}</button>
        <button style={s.btn('#1e1e2e')} onClick={() => setEdit(false)}>Cancel</button>
      </>}
    </div>
  </>;
}