import { supabase, hasSupabase } from './supabaseClient';

export async function getGuestSession() {
  if (!hasSupabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onGuestAuthChange(callback) {
  if (!hasSupabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function sendGuestMagicLink(email) {
  if (!hasSupabase) return { demo: true };
  const redirectUrl = `${window.location.origin}/mis-viajes`;
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true, emailRedirectTo: redirectUrl },
  });
  if (error) throw error;
  return { demo: false };
}

export async function signOutGuest() {
  if (!hasSupabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function fetchMyTrips() {
  if (!hasSupabase) return [];
  const { data, error } = await supabase
    .from('requests')
    .select('id,code,request_type,service_name,target_slug,arrival_date,departure_date,requested_date,adults,children,status,proposal,payment_proof_url,created_at,updated_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
