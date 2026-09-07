import { supabase } from './supabaseClient';

// Este servicio no reemplaza los datos de respaldo del código (DATA.hotels /
// DATA.motos en main.jsx) — los complementa. Si Supabase responde con datos,
// App() los usa; si falla o está vacío, la landing sigue mostrando el
// respaldo como hasta ahora. Así nunca se rompe la página por falta de
// contenido en la base de datos.

function buildDepositText(row) {
  if (!row) return 'Anticipo configurable según el alojamiento.';
  if (!row.deposit_required) return 'No requiere anticipo obligatorio.';
  const pct = row.deposit_percentage;
  return pct ? `Requiere anticipo de aproximadamente ${pct}%.` : 'Requiere anticipo. Monto sujeto a confirmación.';
}

function mapAccommodation(row, roomsByAcc, policyByAcc, primaryHostByAcc) {
  const rooms = roomsByAcc.get(row.id) || [];
  const policy = policyByAcc.get(row.id);
  const hostName = primaryHostByAcc.get(row.id);

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    zone: row.zone || row.municipality || '',
    type: row.accommodation_type || 'Alojamiento',
    price: row.price_from ?? 0,
    available: rooms.length,
    rating: row.rating ?? 0,
    reviews: row.review_count ?? 0,
    img: row.main_image_url || '',
    tags: (row.ideal_for && row.ideal_for.length ? row.ideal_for : row.amenities || []).slice(0, 4),
    amenities: row.amenities || [],
    views: row.views || [],
    host: hostName ? `Anfitrión: ${hostName}` : 'Anfitrión local verificado',
    desc: row.description || row.short_description || '',
    rooms: rooms.map((r) => ({
      name: r.name,
      type: r.room_type || 'Habitación',
      capacity: r.capacity ?? 2,
      beds: r.beds || '',
      price: r.price ?? row.price_from ?? 0,
      amenities: r.amenities || [],
    })),
    policies: {
      reservation: policy?.reservation_policy || row.reservation_policy || 'Solicitud sujeta a confirmación del alojamiento.',
      deposit: buildDepositText(policy),
      cancellation: policy?.cancellation_policy || row.cancellation_policy || 'Consultar condiciones en la propuesta.',
      refund: policy?.refund_policy || row.refund_policy || 'Sujeto a la política confirmada en la propuesta.',
      checkin: policy?.check_in_time || row.check_in_time || '2:00 PM',
      checkout: policy?.check_out_time || row.check_out_time || '11:00 AM',
      pets: policy?.pets_policy || row.pet_policy || 'Consultar antes de reservar',
      children: policy?.children_policy || row.children_policy || 'Consultar antes de reservar',
    },
  };
}

export async function fetchLiveHotels() {
  try {
    const [{ data: accs, error: accErr }, { data: rooms }, { data: policies }, { data: accHosts }] = await Promise.all([
      supabase.from('accommodations').select('*').eq('active', true).order('sort_order', { ascending: true }),
      supabase.from('rooms').select('*').eq('active', true),
      supabase.from('accommodation_policies').select('*'),
      supabase
        .from('accommodation_hosts')
        .select('accommodation_id, is_primary, hosts(display_name)')
        .eq('is_primary', true),
    ]);
    if (accErr || !accs || !accs.length) return null;

    const roomsByAcc = new Map();
    (rooms || []).forEach((r) => {
      if (!roomsByAcc.has(r.accommodation_id)) roomsByAcc.set(r.accommodation_id, []);
      roomsByAcc.get(r.accommodation_id).push(r);
    });

    const policyByAcc = new Map();
    (policies || []).forEach((p) => policyByAcc.set(p.accommodation_id, p));

    const primaryHostByAcc = new Map();
    (accHosts || []).forEach((h) => {
      if (h.hosts?.display_name) primaryHostByAcc.set(h.accommodation_id, h.hosts.display_name);
    });

    return accs.map((row) => mapAccommodation(row, roomsByAcc, policyByAcc, primaryHostByAcc));
  } catch {
    return null;
  }
}

export async function fetchLiveMotorcycles() {
  try {
    const { data, error } = await supabase
      .from('motorcycles')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error || !data || !data.length) return null;
    return data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      price: row.price_from ?? 0,
      type: row.motorcycle_type || 'Moto',
      img: row.main_image_url || '',
      desc: row.description || '',
    }));
  } catch {
    return null;
  }
}

export async function fetchLiveExperiences() {
  try {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error || !data || !data.length) return null;
    return data.map((row) => ({
      slug: row.slug,
      iconName: row.icon_name || 'Compass', // App.jsx resuelve esto al componente real de ícono
      img: row.main_image_url || null,
      type: row.category || 'Experiencia',
      name: row.name,
      desc: row.description || row.short_description || '',
      duration: row.duration_text || '',
      ideal: row.ideal_for && row.ideal_for.length ? row.ideal_for.join(', ') : row.short_description || '',
    }));
  } catch {
    return null;
  }
}

function formatEventDate(iso) {
  if (!iso) return 'Próximamente';
  try {
    return new Date(iso).toLocaleDateString('es-NI', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return 'Próximamente';
  }
}

export async function fetchLiveEvents() {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('active', true)
      .order('starts_at', { ascending: true });
    if (error || !data || !data.length) return null;
    return data.map((row) => ({
      slug: row.slug,
      date: row.starts_at ? formatEventDate(row.starts_at) : 'Próximamente',
      endsAt: row.ends_at ? formatEventDate(row.ends_at) : '',
      type: row.event_type || 'Evento',
      title: row.title,
      desc: row.description || '',
      img: row.main_image_url || null,
      location: row.location || '',
    }));
  } catch {
    return null;
  }
}

export async function fetchLiveBlogPosts() {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, blog_categories(name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false });
    if (error || !data || !data.length) return null;
    return data.map((row) => ({
      slug: row.slug,
      cat: row.blog_categories?.name || 'Blog',
      title: row.title,
      desc: row.excerpt || '',
      body: row.content_html || '',
      img: row.cover_image_url || null,
      author: row.author_name || '',
      readingMinutes: row.reading_minutes || null,
    }));
  } catch {
    return null;
  }
}

function timeToHHMM(t) {
  if (!t) return '00:00';
  return String(t).slice(0, 5);
}

export async function fetchLiveFerrySchedules() {
  try {
    const [{ data: routes, error: routesErr }, { data: schedules }] = await Promise.all([
      supabase.from('boat_routes').select('*').eq('active', true),
      supabase.from('boat_schedules').select('*').eq('active', true).order('departure_time', { ascending: true }),
    ]);
    if (routesErr || !routes || !routes.length || !schedules || !schedules.length) return null;

    const routeById = new Map(routes.map((r) => [r.id, r]));
    return schedules
      .map((s) => {
        const route = routeById.get(s.route_id);
        if (!route) return null;
        return {
          route: route.name,
          time: timeToHHMM(s.departure_time),
          boat: s.vessel_name || '',
          contact: route.phone || s.notes || route.notes || '',
          weatherStatus: route.weather_status || 'normal',
          weatherNote: route.weather_note || '',
        };
      })
      .filter(Boolean);
  } catch {
    return null;
  }
}

export async function fetchLiveLandTransport() {
  try {
    const [{ data: routes, error: routesErr }, { data: schedules }] = await Promise.all([
      supabase.from('land_transport_routes').select('*').eq('active', true).order('sort_order', { ascending: true }),
      supabase.from('land_transport_schedules').select('*').eq('active', true).order('departure_time', { ascending: true }),
    ]);
    if (routesErr || !routes || !routes.length) return null;

    const schedulesByRoute = new Map();
    (schedules || []).forEach((s) => {
      if (!schedulesByRoute.has(s.route_id)) schedulesByRoute.set(s.route_id, []);
      schedulesByRoute.get(s.route_id).push(timeToHHMM(s.departure_time));
    });

    return routes.map((r) => {
      const times = schedulesByRoute.get(r.id) || [];
      return {
        type: r.transport_type || 'Transporte',
        route: r.name,
        fare: 'Consultar tarifa',
        times: times.length ? times : ['Consultar horario'],
        note: r.notes || '',
      };
    });
  } catch {
    return null;
  }
}

export async function fetchLiveGallery() {
  try {
    const { data, error } = await supabase
      .from('media_assets')
      .select('*')
      .eq('active', true)
      .eq('media_type', 'image')
      .order('sort_order', { ascending: true });
    if (error || !data || !data.length) return null;
    return data.map((row) => ({
      img: row.public_url,
      credit: row.credit || '',
      place: row.title || row.caption || '',
    }));
  } catch {
    return null;
  }
}

export async function fetchSiteSettings() {
  try {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
    if (error || !data) return null;
    return {
      heroImageUrl: data.hero_image_url || null,
      heroVideoUrl: data.hero_video_desktop_url || null,
    };
  } catch {
    return null;
  }
}
export async function fetchLiveTourGuides() {
  try {
    const { data, error } = await supabase
      .from('tour_guides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => ({
      name: row.name,
      photo: row.photo_url || null,
      specialty: row.specialty || '',
      languages: row.languages && row.languages.length ? row.languages.join(', ') : '',
      bio: row.bio || '',
      whatsapp: row.whatsapp || '',
      years: row.years_experience || null,
    }));
  } catch {
    return [];
  }
}

export async function fetchLiveBoatOperators() {
  try {
    const { data, error } = await supabase
      .from('boat_operators')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error || !data) return [];
    return data.map((row) => ({
      name: row.name,
      phone: row.phone || '',
      notes: row.notes || '',
    }));
  } catch {
    return [];
  }
}

export async function fetchLiveDestinations() {
  try {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error || !data || !data.length) return null;
    return data.map((row) => ({
      slug: row.slug,
      name: row.name,
      type: row.type || '',
      desc: row.short_description || row.description || '',
      body: row.description || '',
      img: row.main_image_url || null,
      zone: row.zone || '',
    }));
  } catch {
    return null;
  }
}

export async function fetchLiveTravelGuides() {
  try {
    const { data, error } = await supabase
      .from('travel_guides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error || !data || !data.length) return null;
    return data.map((row) => ({
      slug: row.slug,
      title: row.title,
      type: row.type || '',
      desc: row.description || '',
      body: row.body || '',
      img: row.main_image_url || null,
    }));
  } catch {
    return null;
  }
}