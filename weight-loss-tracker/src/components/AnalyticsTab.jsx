
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
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><div key={d} style={{ textAlign:'center', fontSize:9, color:'#6b6b8a' }}>{d}</div>)}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {cells.map((day,i) => {
          const ds = day ? `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}` : null;
          const isFuture = ds > today(), isSel = ds===value, isToday = ds===today();
          return (
            <div key={i} onClick={() => ds&&!isFuture&&onChange(ds)}
              style={{ padding:'5px 2px', textAlign:'center', fontSize:11, borderRadius:6,
                cursor:ds&&!isFuture?'pointer':'default', opacity:isFuture?0.3:1,
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
  datePill: { display:'inline-flex', alignItems:'center', gap:6, background:'#1a1a2e', border:'1px solid #3a2a6a', borderRadius:20, padding:'5px 12px', fontSize:12, color:'#a78bfa', cursor:'pointer', fontWeight:600 },
  tabBtn: (a) => ({ padding:'5px 10px', borderRadius:16, border:'none', cursor:'pointer', fontSize:11, fontWeight:600, background:a?'#7c3aed':'#1a1a2e', color:a?'#fff':'#8888aa' }),
};

export default function AnalyticsTab({ meals, goals }) {
  const [anchorDate, setAnchorDate] = useState(today());
  const [showCal, setShowCal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');

  // Build 7-day chart around anchorDate
  const chart7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchorDate + 'T12:00:00'); d.setDate(d.getDate() - (6-i));
    const ds = d.toISOString().slice(0,10);
    return {
      date: ds,
      label: d.toLocaleDateString('en-IN',{weekday:'short'}),
      calories: meals.filter(m=>m.date===ds).reduce((s,m)=>s+m.calories,0),
      protein: meals.filter(m=>m.date===ds).reduce((s,m)=>s+m.protein,0),
    };
  });
  const maxChartCal = Math.max(...chart7.map(d=>d.calories), goals.calories, 1);

  // All-time stats
  const allDates = [...new Set(meals.map(m=>m.date))].sort((a,b)=>b.localeCompare(a));
  const activeDates = allDates.filter(d => meals.filter(m=>m.date===d).length > 0);
  const avgC = activeDates.length ? Math.round(activeDates.reduce((s,d)=>s+meals.filter(m=>m.date===d).reduce((a,e)=>a+e.calories,0),0)/activeDates.length) : 0;
  const avgP = activeDates.length ? Math.round(activeDates.reduce((s,d)=>s+meals.filter(m=>m.date===d).reduce((a,e)=>a+e.protein,0),0)/activeDates.length) : 0;
  const daysUnder = activeDates.filter(d => meals.filter(m=>m.date===d).reduce((s,e)=>s+e.calories,0) <= goals.calories).length;

  // History with filter
  const months = [...new Set(allDates.map(d=>d.slice(0,7)))].sort((a,b)=>b.localeCompare(a));
  const filteredDates = historyFilter ? allDates.filter(d=>d.startsWith(historyFilter)) : allDates;

  return <>
    {/* Summary cards */}
    <div style={{ display:'flex', gap:8, marginBottom:12 }}>
      {[
        { label:'Days Logged', val:allDates.length, color:'#a78bfa', unit:'days' },
        { label:'Total Meals', val:meals.length, color:'#60a5fa', unit:'entries' },
      ].map(({label,val,color,unit})=>(
        <div key={label} style={{ flex:1, ...s.card, margin:0, textAlign:'center' }}>
          <div style={{ fontSize:10, color:'#6b6b8a', marginBottom:3 }}>{label}</div>
          <div style={{ fontSize:22, fontWeight:800, color }}>{val}</div>
          <div style={{ fontSize:10, color:'#6b6b8a' }}>{unit}</div>
        </div>
      ))}
    </div>

    {/* All-time averages */}
    <div style={s.card}>
      <p style={s.title}>📊 All-time Averages</p>
      {activeDates.length === 0
        ? <p style={{ color:'#6b6b8a', fontSize:13 }}>Data nahi hai abhi.</p>
        : <div style={{ display:'flex', gap:8 }}>
            {[
              { label:'Avg Calories', val:`${avgC} kcal`, color:'#f59e0b', note:`${daysUnder}/${activeDates.length} days under goal` },
              { label:'Avg Protein', val:`${avgP}g`, color:'#34d399', note:`Goal: ${goals.protein}g/day` },
            ].map(({label,val,color,note})=>(
              <div key={label} style={{ flex:1, background:'#0a0a14', borderRadius:10, padding:12, textAlign:'center' }}>
                <div style={{ fontSize:10, color:'#6b6b8a', marginBottom:3 }}>{label}</div>
                <div style={{ fontSize:16, fontWeight:800, color }}>{val}</div>
                <div style={{ fontSize:10, color:'#6b6b8a', marginTop:3 }}>{note}</div>
              </div>
            ))}
          </div>
      }
    </div>

    {/* 7-day chart */}
    <div style={s.card}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
        <p style={{ ...s.title, margin:0 }}>🔥 7-Day Calories</p>
        <div style={s.datePill} onClick={() => setShowCal(v=>!v)}>
          📅 {fmt(anchorDate)} {showCal?'▲':'▼'}
        </div>
      </div>
      {showCal && <CalendarPicker value={anchorDate} onChange={d=>{setAnchorDate(d);setShowCal(false);}} />}
      <div style={{ display:'flex', gap:5, alignItems:'flex-end', height:90 }}>
        {chart7.map(d => {
          const h = Math.round((d.calories/maxChartCal)*80);
          const color = d.calories > goals.calories ? '#ef4444' : d.calories > 0 ? '#34d399' : '#2a2a4a';
          return (
            <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ fontSize:8, color:'#6b6b8a', marginBottom:2 }}>{d.calories||''}</div>
              <div style={{ width:'100%', height:h||3, background:color, borderRadius:3, opacity:d.date===anchorDate?1:0.75 }} />
              <div style={{ fontSize:9, color:d.date===anchorDate?'#a78bfa':'#6b6b8a', marginTop:3, fontWeight:d.date===anchorDate?700:400 }}>{d.label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display:'flex', gap:10, marginTop:8, justifyContent:'center' }}>
        <span style={{ fontSize:10, color:'#34d399' }}>🟢 Under goal</span>
        <span style={{ fontSize:10, color:'#ef4444' }}>🔴 Over goal</span>
      </div>
    </div>

    {/* Full history */}
    <div style={s.card}>
      <p style={s.title}>🗓 Full History — {allDates.length} days</p>
      <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
        <button style={s.tabBtn(!historyFilter)} onClick={()=>setHistoryFilter('')}>All</button>
        {months.slice(0,8).map(ym=>(
          <button key={ym} style={s.tabBtn(historyFilter===ym)} onClick={()=>setHistoryFilter(ym===historyFilter?'':ym)}>
            {new Date(ym+'-01T12:00:00').toLocaleDateString('en-IN',{month:'short',year:'2-digit'})}
          </button>
        ))}
      </div>
      {filteredDates.length === 0 && <p style={{ color:'#6b6b8a', fontSize:13, textAlign:'center', padding:8 }}>Is period mein koi data nahi.</p>}
      {filteredDates.map(d => {
        const entries = meals.filter(m=>m.date===d);
        const cals = entries.reduce((s,e)=>s+e.calories,0);
        const prot = entries.reduce((s,e)=>s+e.protein,0);
        const under = cals <= goals.calories;
        return (
          <div key={d} style={{ borderBottom:'1px solid #1e1e2e', padding:'10px 0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:d===today()?'#a78bfa':'#e2e2f0' }}>
                  {d===today()?'Today':fmt(d)}
                </div>
                <div style={{ fontSize:11, color:'#6b6b8a', marginTop:1 }}>{entries.length} meals</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:12, fontWeight:700, color:under?'#34d399':'#ef4444' }}>{cals} kcal</div>
                <div style={{ fontSize:11, color:'#6b6b8a' }}>{prot}g protein</div>
              </div>
            </div>
            <div style={{ background:'#1e1e2e', borderRadius:4, height:4, marginTop:6, overflow:'hidden' }}>
              <div style={{ width:`${Math.min((cals/goals.calories)*100,100)}%`, height:'100%', background:under?'#34d399':'#ef4444', borderRadius:4 }} />
            </div>
          </div>
        );
      })}
    </div>
  </>;
}