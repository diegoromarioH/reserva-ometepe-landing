import { supabase, hasSupabase } from './supabaseClient';

// Tabla real "contact_messages": solo permite INSERT público (sin SELECT),
// así que igual que en requests.service.js, NO se encadena .select() tras
// el insert o Postgres exige permiso de lectura y cancela todo el insert.
export async function sendContactMessage({ type, name, email, phone, businessType, message }) {
  if (!hasSupabase) return { demo: true };
  const payload = {
    type,
    name,
    email,
    phone: phone || null,
    business_type: businessType || null,
    message,
  };
  const { error } = await supabase.from('contact_messages').insert(payload);
  if (error) {
    console.error('[Reserva Ometepe] contact_messages insert failed:', error.message || error);
    throw error;
  }
  return { demo: false };
}