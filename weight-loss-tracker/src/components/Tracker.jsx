import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import TodayTab from './TodayTab';
import WeightTab from './WeightTab';
import AnalyticsTab from './AnalyticsTab';
import GoalsTab from './GoalsTab';

const TIPS = [
  "💡 Aim for 0.5–1 kg loss per week for sustainable results.",
  "💧 Drink water before meals — it reduces hunger and calorie intake.",
  "🥦 Fill half your plate with veggies to stay full on fewer calories.",
  "🥩 High protein keeps you full longer and preserves muscle.",
  "😴 Poor sleep increases hunger hormones — aim for 7–8 hrs.",
  "🚶 A 20-min walk after meals boosts metabolism.",
  "📉 A 500 kcal daily deficit leads to ~0.5 kg loss per week.",
];

export default function Tracker({ user }) {
  const [tab, setTab] = useState('today');
  const [meals, setMeals] = useState([]);
  const [weights, setWeights] = useState([]);
  const [goals, setGoals] = useState({ calories: 1500, protein: 130 });
  const [loading, setLoading] = useState(true);
  const [tip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [{ data: m }, { data: w }, { data: g }] = await Promise.all([
      supabase.from('meals').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      supabase.from('weights').select('*').eq('user_id', user.id).order('date', { ascending: true }),
      supabase.from('goals').select('*').eq('user_id', user.id).limit(1),
    ]);
    if (m) setMeals(m);
    if (w) setWeights(w);
    if (g && g.length > 0) setGoals({ calories: g[0].calories, protein: g[0].protein });
    setLoading(false);
  }, [user.id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function addMeal(name, calories, protein) {
    const today = new Date().toISOString().slice(0, 10);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const { data } = await supabase.from('meals').insert([{ user_id: user.id, date: today, name, calories, protein, time }]).select();
    if (data) setMeals(prev => [...prev, data[0]]);
  }

  async function deleteMeal(id) {
    await supabase.from('meals').delete().eq('id', id);
    setMeals(prev => prev.filter(m => m.id !== id));
  }

  async function logWeight(date, weight) {
    // upsert by date
    const existing = weights.find(w => w.date === date);
    if (existing) {
      const { data } = await supabase.from('weights').update({ weight }).eq('id', existing.id).select();
      if (data) setWeights(prev => prev.map(w => w.date === date ? data[0] : w));
    } else {
      const { data } = await supabase.from('weights').insert([{ user_id: user.id, date, weight }]).select();
      if (data) setWeights(prev => [...prev, data[0]].sort((a, b) => a.date.localeCompare(b.date)));
    }
  }

  async function saveGoals(calories, protein) {
    const existing = await supabase.from('goals').select('id').eq('user_id', user.id).limit(1);
    if (existing.data && existing.data.length > 0) {
      await supabase.from('goals').update({ calories, protein, updated_at: new Date() }).eq('user_id', user.id);
    } else {
      await supabase.from('goals').insert([{ user_id: user.id, calories, protein }]);
    }
    setGoals({ calories, protein });
  }

  const s = {
    app: { minHeight: '100vh', background: '#0a0a14', color: '#e2e2f0', fontFamily: 'system-ui,sans-serif', padding: '20px 16px' },
    tabs: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
    tab: (a) => ({ padding: '8px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: a ? '#7c3aed' : '#1a1a2e', color: a ? '#fff' : '#8888aa' }),
    tip: { background: '#1a1030', border: '1px solid #3b1f6a', borderRadius: 14, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#c4b5fd' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    signout: { background: 'none', border: '1px solid #2a2a3a', borderRadius: 8, color: '#6b6b8a', fontSize: 11, padding: '4px 10px', cursor: 'pointer' },
  };

  if (loading) return <div style={{ ...s.app, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ color: '#6b6b8a' }}>Loading your data...</p></div>;

  return (
    <div style={s.app}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>
        <div style={s.header}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#a78bfa', margin: '0 0 2px' }}>⚖️ Weight Loss Tracker</h1>
            <p style={{ fontSize: 12, color: '#6b6b8a', margin: 0 }}>{user.email}</p>
          </div>
          <button style={s.signout} onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
        <div style={s.tip}>{tip}</div>

        <div style={s.tabs}>
          {['today','weight','analytics','goals'].map(t => (
            <button key={t} style={s.tab(tab === t)} onClick={() => setTab(t)}>
              {t === 'today' ? '📋 Today' : t === 'weight' ? '⚖️ Weight' : t === 'analytics' ? '📊 Analytics' : '🎯 Goals'}
            </button>
          ))}
        </div>

        {tab === 'today' && <TodayTab meals={meals} goals={goals} onAdd={addMeal} onDelete={deleteMeal} />}
        {tab === 'weight' && <WeightTab weights={weights} onLog={logWeight} />}
        {tab === 'analytics' && <AnalyticsTab meals={meals} goals={goals} />}
        {tab === 'goals' && <GoalsTab goals={goals} onSave={saveGoals} />}
      </div>
    </div>
  );
}