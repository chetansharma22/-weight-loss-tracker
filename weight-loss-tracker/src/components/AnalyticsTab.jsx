function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

const today = () => new Date().toISOString().slice(0, 10);
const s = {
  card: { background:'#12121f', border:'1px solid #1e1e2e', borderRadius:16, padding:18, marginBottom:14 },
  title: { fontSize:14, fontWeight:700, color:'#a78bfa', marginBottom:12 },
};

export default function AnalyticsTab({ meals, goals }) {
  const days7 = getLast7Days();
  const weekData = days7.map(d => ({
    date: d,
    label: new Date(d+'T12:00:00').toLocaleDateString([],{weekday:'short'}),
    calories: meals.filter(m => m.date === d).reduce((s, m) => s + m.calories, 0),
    protein: meals.filter(m => m.date === d).reduce((s, m) => s + m.protein, 0),
  }));

  const avgCals = Math.round(weekData.reduce((s, d) => s + d.calories, 0) / 7);
  const avgProt = Math.round(weekData.reduce((s, d) => s + d.protein, 0) / 7);
  const daysUnder = weekData.filter(d => d.calories > 0 && d.calories <= goals.calories).length;
  const daysHitProt = weekData.filter(d => d.protein >= goals.protein).length;
  const deficit = goals.calories - avgCals;
  const maxCal = Math.max(...weekData.map(d => d.calories), goals.calories, 1);
  const maxProt = Math.max(...weekData.map(d => d.protein), goals.protein, 1);

  return <>
    <div style={{ display:'flex', gap:10, marginBottom:14 }}>
      {[
        { label:'Avg Calories', val:`${avgCals}`, unit:'kcal', color:'#f59e0b', note: deficit>0?`${deficit} kcal deficit`:'over goal' },
        { label:'Avg Protein', val:`${avgProt}`, unit:'g', color:'#34d399', note:`${daysHitProt}/7 days hit` },
      ].map(({ label, val, unit, color, note }) => (
        <div key={label} style={{ flex:1, ...s.card, margin:0, textAlign:'center' }}>
          <div style={{ fontSize:11, color:'#6b6b8a', marginBottom:4 }}>{label}</div>
          <div style={{ fontSize:22, fontWeight:800, color }}>{val}<span style={{ fontSize:12 }}> {unit}</span></div>
          <div style={{ fontSize:11, color:'#6b6b8a', marginTop:2 }}>{note}</div>
        </div>
      ))}
    </div>

    <div style={s.card}>
      <p style={s.title}>🔥 Calories vs Goal (7 days)</p>
      <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:100 }}>
        {weekData.map(d => {
          const h = Math.round((d.calories / maxCal) * 86);
          const color = d.calories > goals.calories ? '#ef4444' : d.calories > 0 ? '#34d399' : '#2a2a4a';
          return (
            <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ fontSize:9, color:'#6b6b8a', marginBottom:2 }}>{d.calories||''}</div>
              <div style={{ width:'100%', height:h||4, background:color, borderRadius:4, opacity: d.date===today()?1:0.75 }} />
              <div style={{ fontSize:10, color: d.date===today()?'#a78bfa':'#6b6b8a', marginTop:3, fontWeight: d.date===today()?700:400 }}>{d.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:12, marginTop:10, justifyContent:'center' }}>
        <span style={{ fontSize:11, color:'#34d399' }}>🟢 Under goal</span>
        <span style={{ fontSize:11, color:'#ef4444' }}>🔴 Over goal</span>
      </div>
      <div style={{ marginTop:6, fontSize:12, color:'#6b6b8a', textAlign:'center' }}>{daysUnder}/7 days under calorie goal</div>
    </div>

    <div style={s.card}>
      <p style={s.title}>💪 Protein (7 days)</p>
      <div style={{ display:'flex', gap:6, alignItems:'flex-end', height:100 }}>
        {weekData.map(d => {
          const h = Math.round((d.protein / maxProt) * 86);
          const color = d.protein >= goals.protein ? '#34d399' : d.protein > 0 ? '#60a5fa' : '#2a2a4a';
          return (
            <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ fontSize:9, color:'#6b6b8a', marginBottom:2 }}>{d.protein||''}</div>
              <div style={{ width:'100%', height:h||4, background:color, borderRadius:4 }} />
              <div style={{ fontSize:10, color: d.date===today()?'#a78bfa':'#6b6b8a', marginTop:3 }}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </div>

    <div style={s.card}>
      <p style={s.title}>📉 Weekly Deficit Estimate</p>
      <div style={{ textAlign:'center', padding:'8px 0' }}>
        <div style={{ fontSize:28, fontWeight:800, color: deficit>0?'#34d399':'#ef4444' }}>
          {deficit>0 ? `−${deficit*7}`:  `+${Math.abs(deficit*7)}`} kcal
        </div>
        <div style={{ fontSize:12, color:'#6b6b8a', marginTop:4 }}>
          this week · approx {deficit>0?`−${(deficit*7/7700).toFixed(2)} kg fat`:'no deficit'}
        </div>
      </div>
      <div style={{ fontSize:11, color:'#6b6b8a', textAlign:'center', marginTop:4 }}>Healthy target: 300–700 kcal/day deficit</div>
    </div>
  </>;
}