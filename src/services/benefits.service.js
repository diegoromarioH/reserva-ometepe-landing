import { supabase, hasSupabase } from './supabaseClient';

// La tabla real usa starts_at/ends_at (timestamptz), no start_date/end_date
// como tenía este archivo antes — esa era la causa de que probablemente
// nunca devolviera beneficios (Postgres rechaza el filtro por columna
// inexistente).
export async function getActiveBenefits(targetType = 'accommodation') {
  if (!hasSupabase) return [];
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('benefits')
      .select('*')
      .eq('active', true)
      .eq('target_type', targetType)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (error) {
    console.warn('[Reserva Ometepe] benefits load skipped:', error?.message || error);
    return [];
  }
}