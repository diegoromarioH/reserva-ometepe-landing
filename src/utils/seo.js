const DEFAULT_OG = '/RO.png';

export function applySeo({ title, description, image = DEFAULT_OG, canonical, schema } = {}) {
  if (title) document.title = title;

  const ensure = (selector, create) => {
    let el = document.querySelector(selector);
    if (!el) {
      el = create();
      document.head.appendChild(el);
    }
    return el;
  };

  if (description) {
    ensure('meta[name="description"]', () => {
      const m = document.createElement('meta');
      m.name = 'description';
      return m;
    }).setAttribute('content', description);
  }

  ensure('link[rel="canonical"]', () => {
    const l = document.createElement('link');
    l.rel = 'canonical';
    return l;
  }).setAttribute('href', canonical || `${location.origin}${location.pathname}`);

  const og = {
    'og:title': title,
    'og:description': description,
    'og:type': 'website',
    'og:url': canonical || `${location.origin}${location.pathname}`,
    'og:image': image,
  };
  Object.entries(og).forEach(([property, content]) => {
    if (!content) return;
    ensure(`meta[property="${property}"]`, () => {
      const m = document.createElement('meta');
      m.setAttribute('property', property);
      return m;
    }).setAttribute('content', content);
  });

  const twitter = {
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
  };
  Object.entries(twitter).forEach(([name, content]) => {
    if (!content) return;
    ensure(`meta[name="${name}"]`, () => {
      const m = document.createElement('meta');
      m.name = name;
      return m;
    }).setAttribute('content', content);
  });

  document.querySelectorAll('script[data-ro-schema="true"]').forEach((el) => el.remove());
  if (schema) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.roSchema = 'true';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }
}

export function touristDestinationSchema({ title, description, url, image }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: title || 'Reserva Ometepe',
    description,
    url,
    image,
    touristType: ['familias', 'parejas', 'aventura', 'naturaleza', 'cultura'],
    address: { '@type': 'PostalAddress', addressLocality: 'Isla de Ometepe', addressCountry: 'NI' },
  };
}
