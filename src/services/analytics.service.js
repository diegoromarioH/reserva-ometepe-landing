import { supabase, hasSupabase } from './supabaseClient';

const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://reservaometepe.com';
const SESSION_KEY = 'ro_session_id';

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'session-unavailable';
  }
}

function getDeviceType() {
  const ua = navigator.userAgent || '';
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) return 'mobile';
  return 'desktop';
}

function safeParams(params = {}) {
  try {
    return JSON.parse(JSON.stringify(params));
  } catch {
    return { raw: String(params) };
  }
}

export function initExternalAnalytics() {
  const ga = import.meta.env.VITE_GA4_ID;
  const pixel = import.meta.env.VITE_META_PIXEL_ID;
  const clarity = import.meta.env.VITE_CLARITY_ID;

  if (ga && !window.__ro_ga) {
    window.__ro_ga = true;
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga, { send_page_view: false });
  }

  if (pixel && !window.fbq) {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', pixel);
  }

  if (clarity && !window.__ro_clarity) {
    window.__ro_clarity = true;
    /* eslint-disable */
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,'clarity','script',clarity);
    /* eslint-enable */
  }
}

export function sendToExternalAnalytics(name, params = {}) {
  if (window.gtag) window.gtag('event', name, params);

  if (window.fbq) {
    const metaMap = {
      view_accommodation: 'ViewContent',
      ViewAccommodation: 'ViewContent',
      view_room: 'ViewContent',
      view_motorcycle: 'ViewContent',
      view_experience: 'ViewContent',
      ViewExperience: 'ViewContent',
      view_boat_schedule: 'ViewContent',
      ViewBoatSchedule: 'ViewContent',
      newsletter_signup: 'Lead',
      NewsletterSignup: 'Lead',
      AvailabilityRequest: 'Lead',
      AvailabilityRequestStart: 'Lead',
      ExperienceQuoteRequest: 'Lead',
      quote_request: 'Lead',
      reservation_request: 'Lead',
      language_change: 'CustomizeProduct',
    };
    const metaEvent = metaMap[name] || name;
    if (['ViewContent', 'Lead', 'Contact', 'CompleteRegistration', 'CustomizeProduct'].includes(metaEvent)) {
      window.fbq('track', metaEvent, params);
    } else {
      window.fbq('trackCustom', metaEvent, params);
    }
  }

  if (window.clarity) window.clarity('event', name);
}

// La tabla real "analytics_events" usa: page, device, service, reference_id
// (no page_path/page_url/referrer/device_type/service_type/service_slug como
// tenía este archivo antes). page_url y referrer no tienen columna propia,
// así que van dentro de metadata para no perderlos.
export async function recordInternalEvent(name, params = {}) {
  if (!hasSupabase) return;
  const payload = {
    event_name: name,
    page: window.location.pathname,
    session_id: getSessionId(),
    device: getDeviceType(),
    language: document.documentElement.lang || navigator.language || 'es',
    service: params.type || params.service_type || null,
    reference_id: params.slug || params.service_slug || params.hotel || params.moto || params.experience || null,
    metadata: safeParams({
      ...params,
      page_url: window.location.href,
      referrer: document.referrer || null,
    }),
  };
  try {
    await supabase.from('analytics_events').insert(payload);
  } catch (error) {
    console.warn('[Reserva Ometepe] analytics_events insert skipped:', error?.message || error);
  }
}

export function trackEvent(name, params = {}) {
  sendToExternalAnalytics(name, params);
  recordInternalEvent(name, params);
}

export function trackPageView(path = window.location.pathname) {
  const page_title = document.title;
  if (window.gtag) window.gtag('event', 'page_view', { page_path: path, page_location: location.href, page_title });
  if (window.fbq) window.fbq('track', 'PageView');
  recordInternalEvent('page_view', { path, page_title, canonical: `${PUBLIC_SITE_URL}${path}` });
}

// La tabla real "conversion_funnel_events" usa step_name (no step) y
// target_type/target_slug (no service_type/service_slug). page_path tampoco
// tiene columna propia aquí, va dentro de metadata.
export async function recordFunnelStep(step, params = {}) {
  if (!hasSupabase) return;
  try {
    await supabase.from('conversion_funnel_events').insert({
      funnel_name: params.funnel || 'traveler_request',
      step_name: step,
      session_id: getSessionId(),
      target_type: params.type || params.service_type || null,
      target_slug: params.slug || params.service_slug || null,
      metadata: safeParams({
        ...params,
        page_path: window.location.pathname,
      }),
    });
  } catch (error) {
    console.warn('[Reserva Ometepe] funnel insert skipped:', error?.message || error);
  }
}