import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import Tracker from './components/Tracker';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0a14', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#6b6b8a', fontFamily:'system-ui' }}>Loading...</p>
    </div>
  );

  return session ? <Tracker user={session.user} /> : <Auth />;
}