import { supabase, hasSupabase } from './supabaseClient';

const DEFAULT_SETTINGS = {
  site_name: 'Reserva Ometepe',
  public_site_url: import.meta.env.VITE_PUBLIC_SITE_URL || 'https://reservaometepe.com',
  ga4_id: import.meta.env.VITE_GA4_ID || '',
  meta_pixel_id: import.meta.env.VITE_META_PIXEL_ID || '',
  clarity_id: import.meta.env.VITE_CLARITY_ID || '',
  support_email: 'soporte@reservaometepe.com',
  alliances_email: 'alianzas@reservaometepe.com',
  default_language: 'es',
  default_seo_title: 'Reserva Ometepe | Planifica tu viaje',
  default_seo_description: 'Planifica tu viaje a Isla de Ometepe con alojamientos, horarios de barcos, transporte, motos, experiencias, eventos y guías locales.',
  default_og_image: '/RO.png',
};

export async function getSiteSettings() {
  if (!hasSupabase) return DEFAULT_SETTINGS;
  try {
    const { data, error } = await supabase.from('site_settings').select('key,value');
    if (error || !data) return DEFAULT_SETTINGS;
    return data.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), DEFAULT_SETTINGS);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export { DEFAULT_SETTINGS };
