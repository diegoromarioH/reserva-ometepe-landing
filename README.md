# Reserva Ometepe V22 - Arquitectura lista para Centro de Operaciones

Esta versión parte de **V21 Fix 3 Experiencias** y conserva el diseño, funciones, experiencia de usuario y contenido existente.

## Qué se agregó sin cambiar la interfaz

- Capa de servicios en `src/services/` para separar Supabase, analítica, solicitudes y configuración.
- Google Analytics 4 preparado con eventos personalizados.
- Meta Pixel preparado con eventos de intención comercial.
- Microsoft Clarity preparado para grabaciones y mapas de calor.
- Capa propia de medición en Supabase con `analytics_events`.
- Embudo propio con `conversion_funnel_events`.
- Solicitudes inteligentes con `service_requests`.
- `site_settings` preparado para editar configuración global desde el futuro HPanel.
- SEO dinámico con canonical, Open Graph, Twitter Cards y Schema.org.
- SQL ampliado para Centro de Operaciones sin modificar la experiencia pública.
- Se eliminó el `package-lock.json` generado con registro interno para evitar errores de instalación en computadoras locales.

## Variables de entorno

```env
VITE_SUPABASE_URL=https://nnhhdxknriatpzzvuglq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_orjkfEYKk_5edRPWbVPrpQ_XV
VITE_PUBLIC_SITE_URL=https://reservaometepe.com
VITE_GA4_ID=G-VQ1DWJ789S
VITE_META_PIXEL_ID=1340688658236763
VITE_CLARITY_ID=xcbnbregcb
```

## Correr en local

```bash
npm config set registry https://registry.npmjs.org/
npm install
npm run dev
```

## Compilar para Hostinger

```bash
npm run build
```

Subir **solo el contenido de `dist/`** a `public_html`.

## Estructura agregada

```txt
src/services/
├── supabaseClient.js
├── analytics.service.js
├── siteSettings.service.js
└── requests.service.js

src/utils/
└── seo.js
```

## Tablas nuevas o ampliadas

- `site_settings`
- `site_pages`
- `seo_metadata`
- `analytics_events`
- `conversion_funnel_events`
- `service_requests`
- `experiences`
- `accommodation_experiences`
- `audit_logs`

## Eventos principales

- `page_view`
- `ViewAccommodation`
- `AvailabilityRequestStart`
- `AvailabilityRequest`
- `ExperienceQuoteRequest`
- `quote_request`
- `reservation_request`
- `newsletter_signup`
- `ViewBoatSchedule`
- `LanguageChanged`

## Nota importante

La landing mantiene datos de respaldo en el código para que no se rompa si Supabase aún no tiene contenido. La arquitectura ya queda preparada para que el futuro Centro de Operaciones administre textos, SEO, alojamientos, experiencias, horarios, eventos, blog, analítica y embudos.

## Beneficios exclusivos

Esta versión agrega el **Motor de Beneficios Exclusivos** sin cambiar el diseño base de la V22.

- Las cards de alojamientos muestran una franja **Beneficio exclusivo** cuando existe un beneficio activo.
- Al pasar el mouse o tocar la franja se muestra el beneficio específico.
- La ficha del alojamiento muestra una sección de beneficio si está activo.
- El Centro de Operaciones podrá activar/desactivar beneficios desde la tabla `benefits`.
- Compatible con beneficios tipo descuento, desayuno incluido, late check-out, experiencia incluida, cupón u otro valor agregado.
- Los eventos `ViewBenefit` y `ViewBenefitDetail` quedan registrados para analítica y embudos.
