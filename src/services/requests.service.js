import { supabase, hasSupabase } from './supabaseClient';
import { trackEvent, recordFunnelStep } from './analytics.service';

// Antes este archivo escribía en "service_requests", una tabla que ya no
// existe (era de una versión anterior del esquema). La tabla real se llama
// "requests" y tiene otros nombres de columna — este mapeo los traduce sin
// que tengas que tocar los formularios que ya llaman a createServiceRequest().

function normalizeRequestType(serviceType) {
  const s = (serviceType || '').toLowerCase();
  if (s.includes('experien')) return 'experience';
  if (s.includes('hotel') || s.includes('alojam') || s.includes('hosped')) return 'accommodation';
  if (s.includes('moto')) return 'motorcycle';
  if (s.includes('barco') || s.includes('transport') || s.includes('bus') || s.includes('ferry')) return 'transport';
  if (s.includes('evento')) return 'event';
  return 'general';
}

export async function createServiceRequest(formData) {
  // Generamos el id nosotros mismos (en vez de dejar que la base de datos
  // lo genere) para poder usarlo después al llamar a notify-request, ya que
  // no podemos leer la fila de vuelta con .select() (ver nota abajo).
  const id = crypto?.randomUUID ? crypto.randomUUID() : undefined;
  const payload = {
    ...(id ? { id } : {}),
    request_type: normalizeRequestType(formData.service_type),
    service_name: formData.service_label || formData.service_type || null,
    target_slug: formData.service_slug || null,
    customer_name: formData.traveler_name,
    customer_email: formData.traveler_email,
    customer_whatsapp: formData.traveler_whatsapp,
    customer_country: formData.country || null,
    arrival_date: formData.start_date || null,
    departure_date: formData.end_date || null,
    adults: Number(formData.adults || formData.people || 1),
    children: Number(formData.children || 0),
    notes: formData.notes || null,
    status: 'received',
    metadata: {
      source_page: window.location.pathname,
      original_service_type: formData.service_type || null,
    },
  };

  trackEvent(formData.service_type === 'Experiencia' ? 'quote_request' : 'reservation_request', payload);
  recordFunnelStep('request_submitted', payload);

  if (!hasSupabase) return { data: null, error: null, demo: true };

  // OJO: sin .select() después del insert. Esta tabla solo permite SELECT a
  // usuarios logueados (staff), así que pedir la fila de vuelta con
  // .select() hace que Postgres exija permiso de lectura sobre ella y
  // cancela el insert completo para visitantes anónimos, aunque el INSERT
  // en sí esté permitido. Sin .select(), el insert se guarda sin problema.
  const { error } = await supabase.from('requests').insert(payload);

  if (error) {
    console.error('[Reserva Ometepe] requests insert failed:', error.message || error);
    throw error;
  }

  // Dispara el correo de confirmación (cliente) + aviso interno (equipo) en
  // segundo plano. Si falla, no debe romper la experiencia del visitante —
  // su solicitud ya se guardó correctamente de todas formas.
  if (id) {
    supabase.functions.invoke('notify-request', { body: { request_id: id } }).catch((e) => {
      console.warn('[Reserva Ometepe] notify-request falló (la solicitud sí se guardó):', e?.message || e);
    });
  }

  return { data: null, error: null, demo: false };
}