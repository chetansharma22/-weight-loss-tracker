import { useState } from 'react';
import { supabase } from '../supabaseClient';

const s = {
  wrap: { minHeight:'100vh', background:'#0a0a14', display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'#12121f', border:'1px solid #1e1e2e', borderRadius:20, padding:32, width:'100%', maxWidth:380 },
  h1: { color:'#a78bfa', fontSize:24, fontWeight:800, margin:'0 0 4px' },
  sub: { color:'#6b6b8a', fontSize:13, marginBottom:24 },
  label: { display:'block', fontSize:12, color:'#6b6b8a', marginBottom:4 },
  input: { width:'100%', background:'#0a0a14', border:'1px solid #2a2a3a', borderRadius:8, color:'#e2e2f0', padding:'10px 12px', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:12 },
  btn: { width:'100%', padding:12, borderRadius:10, border:'none', cursor:'pointer', background:'#7c3aed', color:'#fff', fontWeight:700, fontSize:14 },
  toggle: { textAlign:'center', marginTop:14, fontSize:13, color:'#6b6b8a' },
  link: { color:'#a78bfa', cursor:'pointer', fontWeight:600 },
  err: { color:'#ef4444', fontSize:12, marginBottom:10, textAlign:'center' },
  ok: { color:'#34d399', fontSize:12, marginBottom:10, textAlign:'center' },
};

export default function Auth() {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handle() {
    setErr(''); setMsg(''); setLoading(true);
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password: pass });
      if (error) setErr(error.message);
      else setMsg('Check your email to confirm your account!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) setErr(error.message);
    }
    setLoading(false);
  }

  return (
    <div style={s.wrap}>
      <div style={s.card}>
        <h1 style={s.h1}>⚖️ Weight Loss Tracker</h1>
        <p style={s.sub}>{mode === 'login' ? 'Sign in to your account' : 'Create your account'}</p>
        {err && <p style={s.err}>{err}</p>}
        {msg && <p style={s.ok}>{msg}</p>}
        <label style={s.label}>Email</label>
        <input style={s.input} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={s.label}>Password</label>
        <input style={s.input} type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handle()} />
        <button style={s.btn} onClick={handle} disabled={loading}>
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>
        <p style={s.toggle}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={s.link} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(''); setMsg(''); }}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
}