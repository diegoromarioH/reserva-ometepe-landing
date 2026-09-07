import { supabase, hasSupabase } from './supabaseClient';

// La tabla "newsletters" solo permite INSERT público (sin SELECT), así que
// igual que en requests.service.js, NO se debe encadenar .select() después
// del insert o Postgres exige permiso de lectura y cancela todo el insert.
// Por eso generamos el id nosotros mismos: así podemos llamar a la función
// de bienvenida sin necesitar leer la fila de vuelta.
export async function subscribeNewsletter({ name, email, interest, source }) {
  if (!hasSupabase) return { demo: true };
  const id = crypto?.randomUUID ? crypto.randomUUID() : undefined;
  const payload = {
    ...(id ? { id } : {}),
    name: name || null,
    email,
    interest: interest || null,
    source: source || 'landing',
    language: document.documentElement.lang || navigator.language || 'es',
    metadata: { page: window.location.pathname },
  };
  const { error } = await supabase.from('newsletters').insert(payload);
  if (error) {
    console.error('[Reserva Ometepe] newsletters insert failed:', error.message || error);
    throw error;
  }
  // Dispara el correo de bienvenida en segundo plano. Si falla, no rompe la
  // experiencia del visitante — su suscripción ya se guardó correctamente.
  if (id) {
    supabase.functions.invoke('welcome-subscriber', { body: { subscriber_id: id } }).catch((e) => {
      console.warn('[Reserva Ometepe] welcome-subscriber falló (la suscripción sí se guardó):', e?.message || e);
    });
  }
  return { demo: false };
}