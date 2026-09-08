import React,{useMemo,useState,useEffect}from'react';
import{createRoot}from'react-dom/client';
import{Hotel,Bike,Ship,Bus,Search,CalendarDays,MapPin,Star,ArrowUpRight,ChevronDown,ChevronLeft,Menu,X,Globe2,Users,Heart,Camera,Mountain,Utensils,Mail,Send,Clock,SlidersHorizontal,Compass,Palmtree,Route,ShieldCheck,Bell,ShoppingBag,Check,CheckCircle2,Music,Landmark,Waves,Footprints,Sun,TreePine,Flame,Fish,Tent,AlertTriangle,Newspaper}from'lucide-react';
import'./styles.css';
import{initExternalAnalytics,trackEvent as trackBusinessEvent,trackPageView,recordFunnelStep,getAnalyticsConsent,setAnalyticsConsent}from'./services/analytics.service';
import{createServiceRequest}from'./services/requests.service';
import{subscribeNewsletter}from'./services/subscribe.service';
import{sendContactMessage}from'./services/contact.service';
import{getActiveBenefits}from'./services/benefits.service';
import{applySeo,touristDestinationSchema}from'./utils/seo';
import{fetchLiveHotels,fetchLiveMotorcycles,fetchLiveExperiences,fetchLiveEvents,fetchLiveBlogPosts,fetchLiveFerrySchedules,fetchLiveLandTransport,fetchLiveGallery,fetchLiveTourGuides,fetchLiveBoatOperators,fetchLiveDestinations,fetchLiveTravelGuides,fetchSiteSettings}from'./services/content.service';
import{hasSupabase}from'./services/supabaseClient';
import{getGuestSession,onGuestAuthChange,sendGuestMagicLink,signOutGuest,fetchMyTrips}from'./services/guest.service';

// --- Estado de datos "live" (para mostrar skeletons mientras Supabase responde) ---
let liveReady=!hasSupabase;
const liveListeners=new Set();
function setLiveReady(v){liveReady=v;liveListeners.forEach(f=>f())}
function useLiveReady(){const[,force]=useState(0);useEffect(()=>{const f=()=>force(x=>x+1);liveListeners.add(f);return()=>liveListeners.delete(f)},[]);return liveReady}

const DATA={
settings:{brand:'Reserva Ometepe',tagline:'Planifica tu viaje a la isla',emails:{alliances:'alianzas@reservaometepe.com',support:'soporte@reservaometepe.com'}},
hero:{fallback:(function(){try{return localStorage.getItem('ro_hero_image')||'https://nnhhdxknriatpzzvuglq.supabase.co/storage/v1/object/public/home/site_settings/1787986469101-0e20b4-49772ca751614714bb63bea6785e3e99-mv2.png'}catch{return 'https://nnhhdxknriatpzzvuglq.supabase.co/storage/v1/object/public/home/site_settings/1787986469101-0e20b4-49772ca751614714bb63bea6785e3e99-mv2.png'}})()},
hotels:[
{id:'h1',slug:'volcan-view-eco-lodge',name:'Volcán View Eco Lodge',zone:'Balgüe',type:'Eco lodge',price:38,available:6,rating:4.8,reviews:126,img:'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1400&auto=format&fit=crop',images:['https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1400&auto=format&fit=crop','https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1400&auto=format&fit=crop','https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1400&auto=format&fit=crop'],tags:['Vista al volcán','Naturaleza','Desayuno'],amenities:['WiFi','Desayuno','Restaurante','Parqueo','Jardín'],views:['Volcán Maderas','Jardín tropical'],host:'Anfitrión local verificado',desc:'Hospedaje rodeado de naturaleza para descansar cerca de senderos, cafés locales y vistas al Volcán Maderas. Una opción ideal para viajeros que buscan tranquilidad, caminatas y conexión con la zona rural de Ometepe.',rooms:[{name:'Habitación doble con vista al volcán',type:'Doble',capacity:2,beds:'1 cama queen',price:38,amenities:['Baño privado','Ventilador','Desayuno disponible']},{name:'Habitación familiar jardín',type:'Familiar',capacity:4,beds:'2 camas dobles',price:58,amenities:['Baño privado','Jardín','Parqueo']}],policies:{reservation:'Solicitud de disponibilidad sujeta a confirmación del alojamiento.',deposit:'Anticipo configurable por temporada.',cancellation:'Cancelación flexible según fecha de viaje y política vigente del alojamiento.',refund:'Los reembolsos dependen de la política confirmada en la propuesta.',checkin:'2:00 PM',checkout:'11:00 AM',pets:'Consultar antes de reservar',children:'Apto para familias'}},
{id:'h2',slug:'casa-cocibolca',name:'Casa Cocibolca',zone:'Moyogalpa',type:'Hotel urbano',price:28,available:3,rating:4.6,reviews:93,img:'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1400&auto=format&fit=crop',images:['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1400&auto=format&fit=crop','https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1400&auto=format&fit=crop','https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop'],tags:['Cerca del puerto','Familiar','A/C'],amenities:['Aire acondicionado','WiFi','Recepción','Restaurantes cerca','Agua caliente'],views:['Centro de Moyogalpa','Zona urbana'],host:'Anfitrión del alojamiento',desc:'Alojamiento práctico para quienes llegan por Moyogalpa y quieren estar cerca del puerto, restaurantes, transporte y servicios. Recomendado para primeras noches, viajes cortos o conexiones tempranas.',rooms:[{name:'Habitación estándar',type:'Doble',capacity:2,beds:'1 cama doble',price:28,amenities:['A/C','Baño privado','WiFi']},{name:'Habitación triple',type:'Triple',capacity:3,beds:'1 doble + 1 individual',price:42,amenities:['A/C','Baño privado','TV']}],policies:{reservation:'La reserva se confirma después de aceptar la propuesta y completar el anticipo indicado.',deposit:'Puede requerir anticipo para temporada alta.',cancellation:'Cancelación moderada. Consultar condiciones exactas en la propuesta.',refund:'Sujeto a la fecha de cancelación y confirmación del alojamiento.',checkin:'2:00 PM',checkout:'11:00 AM',pets:'No especificado',children:'Niños bienvenidos'}},
{id:'h3',slug:'playa-santo-domingo-inn',name:'Playa Santo Domingo Inn',zone:'Santo Domingo',type:'Frente al lago',price:52,available:8,rating:4.7,reviews:211,img:'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1400&auto=format&fit=crop',images:['https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1400&auto=format&fit=crop','https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1400&auto=format&fit=crop'],tags:['Playa','Piscina','Restaurante'],amenities:['Piscina','Restaurante','Frente al lago','WiFi','Parqueo'],views:['Lago Cocibolca','Playa Santo Domingo'],host:'Anfitrión del alojamiento',desc:'Estadía frente al lago para parejas, familias y viajeros que desean playa, descanso y atardeceres tranquilos. Una base cómoda para explorar Ojo de Agua, Altagracia y rutas cercanas.',rooms:[{name:'Habitación vista al lago',type:'Doble',capacity:2,beds:'1 cama queen',price:52,amenities:['Vista al lago','Baño privado','Piscina']},{name:'Habitación familiar frente al lago',type:'Familiar',capacity:5,beds:'2 camas dobles + 1 individual',price:88,amenities:['Frente al lago','A/C','Restaurante']}],policies:{reservation:'Disponibilidad y tarifa final se confirman antes de solicitar anticipo.',deposit:'Anticipo sugerido 50% cuando el alojamiento lo requiera.',cancellation:'Puede aplicar cancelación gratuita con anticipación según temporada.',refund:'Reembolso sujeto a política del alojamiento y fecha de cancelación.',checkin:'2:00 PM',checkout:'11:00 AM',pets:'Consultar',children:'Apto para familias'}},
{id:'h4',slug:'maderas-garden-rooms',name:'Maderas Garden Rooms',zone:'Mérida',type:'Cabañas',price:32,available:2,rating:4.5,reviews:76,img:'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1400&auto=format&fit=crop',images:['https://images.unsplash.com/photo-1601918774946-25832a4be0d6?q=80&w=1400&auto=format&fit=crop','https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1400&auto=format&fit=crop','https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1400&auto=format&fit=crop'],tags:['Kayak','Tranquilo','Senderos'],amenities:['Kayak cercano','Jardín','Zona tranquila','Desayuno','Senderos'],views:['Naturaleza','Volcán Maderas'],host:'Anfitrión local',desc:'Cabañas para quienes buscan kayak, naturaleza, rutas rurales y una experiencia más pausada en el sur de Ometepe. Recomendado para viajeros aventureros y amantes de la tranquilidad.',rooms:[{name:'Cabaña jardín',type:'Cabaña',capacity:2,beds:'1 cama doble',price:32,amenities:['Jardín','Ventilador','Baño privado']},{name:'Cabaña familiar rural',type:'Familiar',capacity:4,beds:'2 camas dobles',price:54,amenities:['Jardín','Desayuno disponible','Zona tranquila']}],policies:{reservation:'Solicitud revisada según disponibilidad de cabañas.',deposit:'Anticipo según temporada y duración de estadía.',cancellation:'Política flexible o moderada según fecha seleccionada.',refund:'Sujeto a confirmación del anfitrión.',checkin:'2:00 PM',checkout:'11:00 AM',pets:'Consultar',children:'Apto para familias y viajeros de naturaleza'}}

],
benefits:[
{target_type:'accommodation',target_slug:'volcan-view-eco-lodge',active:true,badge_text:'Beneficio exclusivo',title:'5% de descuento',description:'Obtén 5% de descuento al solicitar este alojamiento desde Reserva Ometepe. Beneficio sujeto a disponibilidad y confirmación del alojamiento.',benefit_type:'discount',discount_percent:5},
{target_type:'accommodation',target_slug:'casa-cocibolca',active:true,badge_text:'Beneficio exclusivo',title:'Desayuno incluido',description:'Reserva desde Reserva Ometepe y consulta disponibilidad con desayuno incluido según temporada y tipo de habitación.',benefit_type:'included'},
{target_type:'accommodation',target_slug:'playa-santo-domingo-inn',active:true,badge_text:'Beneficio exclusivo',title:'Late check-out sujeto a disponibilidad',description:'Al solicitar por Reserva Ometepe puedes consultar late check-out sujeto a disponibilidad del alojamiento.',benefit_type:'benefit'},
{target_type:'accommodation',target_slug:'maderas-garden-rooms',active:false,badge_text:'Beneficio exclusivo',title:'Beneficio por activar',description:'Este beneficio podrá activarse desde el Centro de Operaciones cuando el alojamiento lo confirme.',benefit_type:'benefit'}
],
motos:[{slug:'scooter-automatica',name:'Scooter automática',price:20,type:'Scooter',img:'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1400&auto=format&fit=crop',desc:'Ideal para moverte entre Moyogalpa, Santo Domingo, Altagracia y puntos principales de la isla.'},{slug:'motocicleta',name:'Motocicleta',price:20,type:'Moto',img:'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1400&auto=format&fit=crop',desc:'Buena opción para viajeros que quieren recorrer varios lugares en un día con mayor libertad.'},{slug:'cuatrimoto',name:'Cuatrimoto',price:60,type:'Cuatrimoto',img:'https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=1400&auto=format&fit=crop',desc:'Recomendada para rutas de aventura, caminos rurales y recorridos fotográficos.'}],
ferry:[
{route:'San Jorge → Moyogalpa',boat:'El Che Guevara',time:'07:00',contact:'Che Guevara: 5785-2065 / 8401-8035 / 2569-4101'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 3',time:'07:45',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 1',time:'08:30',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → Moyogalpa',boat:'Cacique Nicarao',time:'09:00',contact:'Puerto San Jorge'},
{route:'San Jorge → San José del Sur',boat:'Rey del Cocibolca',time:'09:30',contact:'Rey del Cocibolca: 8445-4000 / 8904-5244'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 3',time:'10:30',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 1',time:'11:00',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → San José del Sur',boat:'Gran Sultana',time:'11:30',contact:'Puerto San Jorge'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 3',time:'12:00',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → Moyogalpa',boat:'Lancha Santa Martha',time:'12:30',contact:'Puerto San Jorge'},
{route:'San Jorge → Moyogalpa',boat:'Cacique Nicarao',time:'13:30',contact:'Puerto San Jorge'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 4',time:'14:30',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 1',time:'15:30',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → Moyogalpa',boat:'El Che Guevara',time:'16:00',contact:'Che Guevara: 5785-2065 / 8401-8035 / 2569-4101'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 3',time:'16:30',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → Moyogalpa',boat:'Lancha Santa Martha',time:'17:00',contact:'Puerto San Jorge'},
{route:'San Jorge → San José del Sur',boat:'Rey del Cocibolca',time:'17:00',contact:'Rey del Cocibolca: 8445-4000 / 8904-5244'},
{route:'San Jorge → Moyogalpa',boat:'Ferry Ometepe 4',time:'17:45',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San Jorge → San José del Sur',boat:'Gran Sultana',time:'18:30',contact:'Puerto San Jorge'},
{route:'Moyogalpa → San Jorge',boat:'Cacique Nicarao',time:'05:30',contact:'Puerto Moyogalpa'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 4',time:'06:00',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'Moyogalpa → San Jorge',boat:'Lancha Santa Martha',time:'06:30',contact:'Puerto Moyogalpa'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 3',time:'06:45',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 1',time:'07:00',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San José del Sur → San Jorge',boat:'Rey del Cocibolca',time:'07:30',contact:'Rey del Cocibolca: 8445-4000 / 8904-5244'},
{route:'San José del Sur → San Jorge',boat:'La Gran Sultana',time:'08:30',contact:'Puerto San José del Sur'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 4',time:'09:10',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 3',time:'10:00',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'Moyogalpa → San Jorge',boat:'El Che Guevara',time:'11:00',contact:'Che Guevara: 5785-2065 / 8401-8035 / 2569-4101'},
{route:'Moyogalpa → San Jorge',boat:'Cacique Nicarao',time:'11:30',contact:'Puerto Moyogalpa'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 4',time:'12:30',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 1',time:'13:10',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 3',time:'14:00',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'Moyogalpa → San Jorge',boat:'Lancha Santa Martha',time:'15:00',contact:'Puerto Moyogalpa'},
{route:'San José del Sur → San Jorge',boat:'Rey del Cocibolca',time:'15:20',contact:'Rey del Cocibolca: 8445-4000 / 8904-5244'},
{route:'Moyogalpa → San Jorge',boat:'Ferry Ometepe 4',time:'16:00',contact:'Ferry Ometepe: 2569-4284 / 8966-4983 / 8966-4981'},
{route:'San José del Sur → San Jorge',boat:'La Gran Sultana',time:'16:30',contact:'Puerto San José del Sur'},
{route:'Moyogalpa → San Jorge',boat:'El Che Guevara',time:'17:30',contact:'Che Guevara: 5785-2065 / 8401-8035 / 2569-4101'}],
transport:[
{route:'Moyogalpa → Altagracia',type:'Bus público',times:['05:30','06:30','07:30','08:30','09:30','11:20','12:30','13:00','13:45','14:45','16:45','17:25','18:20','19:00'],fare:'C$22',note:'Horarios aproximados. Ruta principal para conectar el puerto con Altagracia.'},
{route:'Altagracia → Moyogalpa',type:'Bus público',times:['04:00','04:30','05:30','05:50','07:05','08:00','09:00','09:45','10:00','11:00','12:00','12:50','13:45','14:15','15:35','16:30','17:00'],fare:'C$22',note:'Horarios aproximados. Confirmar en la terminal antes de viajar.'},
{route:'Altagracia → San José del Sur',type:'Bus público',times:['06:30','17:15'],fare:'Consultar',note:'Ruta con pocas salidas al día. Recomendado confirmar antes de planificar conexión con ferry.'},
{route:'San José del Sur → Altagracia',type:'Bus público',times:['12:00','19:20'],fare:'Consultar',note:'Horarios aproximados sujetos a cambios.'},
{route:'Altagracia → Balgüe / Mérida',type:'Bus público',times:['04:30','08:30','10:00','13:30','16:00'],fare:'C$22–C$35',note:'Altagracia ↔ Balgüe aprox. C$22. Altagracia ↔ Mérida aprox. C$35.'},
{route:'Managua → Rivas',type:'Bus interurbano',times:['Salidas frecuentes desde Mercado Roberto Huembes'],fare:'C$100 aprox.',note:'Tiempo estimado 2.5 a 3 horas.'},
{route:'Managua → San Jorge',type:'Bus / conexión terrestre',times:['Consultar disponibilidad'],fare:'C$110 aprox.',note:'Opción económica para conectar con el puerto.'},
{route:'Rivas ↔ San Jorge',type:'Colectivo / taxi',times:['Durante el día'],fare:'C$30 colectivo / taxi privado $5 aprox.',note:'Trayecto corto de 10 a 15 minutos hacia el puerto.'},
{route:'Moyogalpa ↔ Altagracia',type:'Taxi privado',times:['Bajo solicitud'],fare:'$30 aprox.',note:'Precio de referencia. Confirmar antes de abordar.'},
{route:'Moyogalpa ↔ Mérida / Balgüe',type:'Taxi privado',times:['Bajo solicitud'],fare:'$45 aprox.',note:'Útil para hoteles alejados o llegadas fuera del horario de bus.'}
],
experiences:[
{slug:'cocina-nicaraguense',name:'Cocinar comida nicaragüense',icon:Utensils,type:'Gastronomía local',duration:'2 a 3 horas',ideal:'Parejas, familias y viajeros curiosos',desc:'Aprende recetas tradicionales con anfitriones locales y descubre sabores de Nicaragua desde una cocina isleña.'},
{slug:'kayak-en-ometepe',name:'Kayak en Ometepe',icon:Heart,type:'Agua y naturaleza',duration:'1 a 3 horas',ideal:'Aventura suave y fotografía',desc:'Explora el lago, humedales y paisajes volcánicos desde el agua con una experiencia tranquila y fotogénica.'},
{slug:'senderismo-en-ometepe',name:'Senderismo y rutas naturales',icon:Mountain,type:'Naturaleza',duration:'Medio día o día completo',ideal:'Viajeros activos',desc:'Camina por senderos, miradores y zonas verdes para descubrir la biodiversidad de la isla a tu ritmo.'},
{slug:'danza-nicaraguense',name:'Danza nicaragüense',icon:Users,type:'Cultura viva',duration:'1 a 2 horas',ideal:'Grupos, familias y estudiantes',desc:'Vive una introducción a la danza tradicional nicaragüense y conoce expresiones culturales que forman parte de nuestra identidad.'},
{slug:'visitar-museos-ometepe',name:'Visitar museos',icon:Camera,type:'Historia y patrimonio',duration:'1 a 3 horas',ideal:'Cultura e historia local',desc:'Conoce espacios como museos locales, piezas arqueológicas, memoria de la isla y lugares que resguardan la historia de Ometepe.'},
{slug:'escalar-volcanes-ometepe',name:'Escalar volcanes',icon:Mountain,type:'Aventura exigente',duration:'Día completo',ideal:'Senderistas con experiencia',desc:'Consulta rutas para ascender el Volcán Concepción o el Volcán Maderas con guía local y preparación adecuada.'},
{slug:'mercado-local-ometepe',name:'Visitar el mercado local',icon:ShoppingBag,type:'Comunidad',duration:'1 a 2 horas',ideal:'Viajeros que buscan vida local',desc:'Recorre mercados, conversa con comerciantes y descubre productos, frutas, comidas y escenas cotidianas de la isla.'}
],
destinations:[{slug:'punta-jesus-maria',name:'Punta Jesús María',type:'Atardecer',desc:'Uno de los puntos más conocidos para ver el lago, caminar sobre arena y fotografiar el atardecer.'},{slug:'ojo-de-agua',name:'Ojo de Agua',type:'Naturaleza',desc:'Piscinas naturales rodeadas de vegetación, perfectas para una tarde de descanso.'},{slug:'charco-verde',name:'Charco Verde',type:'Naturaleza',desc:'Reserva natural con senderos, miradores, playa y leyendas locales.'},{slug:'playa-santo-domingo',name:'Playa Santo Domingo',type:'Playa',desc:'Zona tranquila frente al lago, popular para hospedarse y descansar.'}],
guides:[{slug:'viaje-pareja-ometepe',type:'Pareja',title:'Ruta romántica de 2 días',desc:'Atardecer, hotel frente al lago, cena tranquila y paseo por los paisajes más fotogénicos de Ometepe.'},{slug:'volcanes-senderos-ometepe',type:'Aventura',title:'Volcanes y senderos',desc:'Maderas, miradores, kayak y rutas para viajeros activos que buscan naturaleza.'},{slug:'ometepe-con-ninos',type:'Familia',title:'Ometepe con niños',desc:'Zonas tranquilas, playas, restaurantes y hoteles cómodos para viajar en familia.'},{slug:'fotografia-en-ometepe',type:'Fotografía',title:'Postales de la isla',desc:'Lago, volcanes, puertos, caminos rurales, petroglifos y cultura local.'}],
tourGuides:[],
boatOperators:[],
posts:[{slug:'como-viajar-a-isla-de-ometepe-desde-managua-guia-completa-2026',title:'Cómo viajar a Isla de Ometepe desde Managua: guía completa 2026',desc:'Rutas, transporte, recomendaciones y consejos para llegar a Ometepe desde Managua.',cat:'Guía de viaje'},{slug:'donde-hospedarse-en-ometepe',title:'Dónde hospedarse en Ometepe según tu tipo de viaje',desc:'Zonas recomendadas para parejas, familias, mochileros y viajeros de aventura.',cat:'Hoteles'},{slug:'alquilar-moto-en-ometepe',title:'Consejos para alquilar moto en Ometepe',desc:'Qué revisar, rutas recomendadas y cómo moverte con seguridad por la isla.',cat:'Transporte'}],
events:[{slug:'eventos-culturales-ometepe',title:'Eventos culturales en Ometepe',date:'Temporada actual',desc:'Ferias, fiestas patronales, actividades comunitarias y encuentros culturales de la isla.'},{slug:'promociones-hoteles-ometepe',title:'Promociones de hoteles',date:'Disponibles por temporada',desc:'Ofertas especiales de hospedaje para planificar mejor tu estadía en Ometepe.'},{slug:'experiencias-locales',title:'Experiencias locales destacadas',date:'Durante todo el año',desc:'Tours, recorridos, gastronomía y actividades para descubrir la isla con negocios locales.'}],
gallery:[{img:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',place:'Lago Cocibolca',credit:'Foto de referencia'},{img:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',place:'Playa y atardecer',credit:'Foto de referencia'},{img:'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop',place:'Senderos naturales',credit:'Foto de referencia'}]
};

const txt={es:{home:'Inicio',hotels:'Alojamientos',motos:'Motos',guides:'Guías',events:'Eventos y promociones',sched:'Horarios y transporte',barcos:'Horario de barcos',transport:'Transporte terrestre',destinations:'Destinos',activities:'Actividades',blog:'Blog',contact:'Contacto',hero:'Planifica tu viaje a Ometepe',heroSub:'Encuentra alojamientos, horarios de barcos, transporte, motos, actividades y guías locales para planificar tu viaje a la isla.',search:'Buscar alojamiento, zona, actividad o guía',book:'Solicitar',avail:'Solicitar disponibilidad',review:'Reseñar',from:'Desde',next:'Próxima salida',leaves:'Sale en',newsletter:'Recibe guías y novedades de Ometepe',email:'Correo electrónico',name:'Nombre',send:'Suscribirme',seoIntro:'Información actualizada para organizar tu viaje a Isla de Ometepe, Nicaragua.'},en:{home:'Home',hotels:'Stays',motos:'Motorbikes',guides:'Guides',events:'Events & deals',sched:'Schedules & transport',barcos:'Ferry schedule',transport:'Ground transport',destinations:'Destinations',activities:'Activities',blog:'Blog',contact:'Contact',hero:'Plan your trip to Ometepe',heroSub:'Find stays, ferry schedules, transport, motorbikes, activities and local travel guides for Ometepe Island.',search:'Search stay, area, activity or guide',book:'Book',avail:'Request availability',review:'Review',from:'From',next:'Next departure',leaves:'Leaves in',newsletter:'Get Ometepe guides and updates',email:'Email address',name:'Name',send:'Subscribe',seoIntro:'Updated travel information to plan your visit to Ometepe Island, Nicaragua.'}};
function usePath(){const current=()=>location.pathname+location.search;const[p,setP]=useState(current());useEffect(()=>{const f=()=>setP(current());addEventListener('popstate',f);return()=>removeEventListener('popstate',f)},[]);return[p,(path)=>{history.pushState({},'',path);setP(path);scrollTo({top:0,behavior:'smooth'})}]}

function formatTime12(value){
  if(!/^\d{1,2}:\d{2}$/.test(String(value))) return value;
  const [hh,mm]=String(value).split(':').map(Number);
  const period=hh>=12?'PM':'AM';
  const h=hh%12||12;
  return `${h}:${String(mm).padStart(2,'0')} ${period}`;
}
function initTracking(){
  // Los scripts de terceros (GTM, Facebook Pixel, Clarity) no son
  // necesarios para el primer pintado de la página, así que se cargan
  // después del evento "load" en vez de apenas monta la app — esto reduce
  // el bloqueo del hilo principal durante la carga inicial.
  if(document.readyState==='complete'){
    setTimeout(initExternalAnalytics,1);
  }else{
    window.addEventListener('load',()=>setTimeout(initExternalAnalytics,1),{once:true});
  }
}
function trackEvent(name,params={}){trackBusinessEvent(name,params)}

function trackPage(path){trackPageView(path)}

function useBenefits(targetType='accommodation'){
  const fallback=useMemo(()=>DATA.benefits.filter(b=>b.active!==false&&b.target_type===targetType),[targetType]);
  const[benefits,setBenefits]=useState(fallback);
  useEffect(()=>{let mounted=true;getActiveBenefits(targetType).then(rows=>{if(mounted&&Array.isArray(rows)&&rows.length)setBenefits(rows)});return()=>{mounted=false}},[targetType]);
  return benefits;
}
function findBenefit(benefits,targetType,slug){return benefits.find(b=>b.active!==false&&b.target_type===targetType&&(b.target_slug===slug||b.applies_to_all));}
function BenefitRibbon({benefit,targetSlug,compact=false}){
  if(!benefit)return null;
  const label=benefit.badge_text||'Beneficio exclusivo';
  const title=benefit.title||benefit.description||'Beneficio disponible';
  const desc=benefit.description||'Este alojamiento tiene un beneficio especial al solicitar desde Reserva Ometepe.';
  return <button type="button" className={compact?'benefit-ribbon compact':'benefit-ribbon'} onClick={(e)=>{e.stopPropagation();trackEvent('ViewBenefit',{slug:targetSlug,benefit:title})}} aria-label={`${label}: ${title}`}>
    <span>🎁 {label}</span>
    <i className="benefit-popover"><b>{title}</b><small>{desc}</small></i>
  </button>
}
function BenefitDetail({benefit,targetSlug}){
  if(!benefit)return null;
  return <div className="benefit-detail">
    <div><span>🎁 Beneficio Reserva Ometepe</span><h3>{benefit.title}</h3><p>{benefit.description}</p></div>
    <button className="btn small" onClick={()=>trackEvent('ViewBenefitDetail',{slug:targetSlug,benefit:benefit.title})}>Ver beneficio</button>
  </div>
}

const EXPERIENCE_ICONS={Mountain,Flame,Footprints,Waves,Fish,Palmtree,TreePine,Utensils,Music,Landmark,Bike,Users,Camera,Sun,Tent,Compass};
function getRequestDefaults(){
  const q=new URLSearchParams(location.search);
  const hotel=q.get('hotel');
  const room=q.get('room');
  const moto=q.get('moto');
  const exp=q.get('experience')||q.get('actividad');
  const service=q.get('service');
  let label=service||'Alojamiento o servicio de interés';
  let type='General';
  if(hotel){const h=DATA.hotels.find(x=>x.slug===hotel);label=h?`Alojamiento: ${h.name}`:`Alojamiento: ${hotel}`;type='Alojamiento'}
  if(room){label+=` · Habitación: ${room}`}
  if(moto){const m=DATA.motos.find(x=>x.slug===moto);label=m?`Renta de moto: ${m.name}`:`Renta de moto: ${moto}`;type='Moto'}
  if(exp){const e=DATA.experiences.find(x=>x.slug===exp);label=e?`Experiencia: ${e.name}`:`Experiencia: ${exp}`;type='Experiencia'}
  return {label,type,slug:hotel||moto||exp||service||null,checkin:q.get('checkin')||'',checkout:q.get('checkout')||'',adults:q.get('adults')||''};
}

function routeWeatherSummary(routes){const routeList=Array.isArray(routes)?routes:[routes];const entries=DATA.ferry.filter(x=>routeList.includes(x.route));const cancelled=entries.find(x=>x.weatherStatus==='cancelled');if(cancelled)return{status:'cancelled',note:cancelled.weatherNote};const delayed=entries.find(x=>x.weatherStatus==='delay');if(delayed)return{status:'delay',note:delayed.weatherNote};return{status:'normal',note:''}}
function nextDeparture(routes){const now=new Date();const routeList=Array.isArray(routes)?routes:[routes];let list=DATA.ferry.filter(x=>(!routes||routeList.includes(x.route))&&x.weatherStatus!=='cancelled').map(x=>{let[d,m]=x.time.split(':').map(Number);let dt=new Date(now);dt.setHours(d,m,0,0);if(dt<now)dt.setDate(dt.getDate()+1);return{...x,dt}}).sort((a,b)=>a.dt-b.dt);let n=list[0];if(!n)return null;let diff=n.dt-now;return{...n,h:Math.floor(diff/36e5),m:Math.floor(diff%36e5/6e4)}}
function setSeo(title,desc,schema=null,image=null){useEffect(()=>{const img=image||'/RO.png';applySeo({title,description:desc,canonical:location.origin+location.pathname,image:img,schema:schema||touristDestinationSchema({title,description:desc,url:location.origin+location.pathname,image:img})})},[title,desc,image])}
function App(){const[path,go]=usePath();const[menu,setMenu]=useState(false);const[guestSession,setGuestSession]=useState(null);const[authReady,setAuthReady]=useState(!hasSupabase);const[,bumpLive]=useState(0);useEffect(()=>{initTracking()},[]);useEffect(()=>{let active=true;getGuestSession().then(s=>{if(active)setGuestSession(s)}).catch(()=>{}).finally(()=>{if(active)setAuthReady(true)});const stop=onGuestAuthChange(s=>{setGuestSession(s);setAuthReady(true)});return()=>{active=false;stop()}},[]);useEffect(()=>{(async()=>{const[liveHotels,liveMotos,liveExp,liveEvents,livePosts,liveFerry,liveTransport,liveGallery,liveGuides,liveBoatOps,liveDest,liveTravelGuides,liveSettings]=await Promise.all([fetchLiveHotels(),fetchLiveMotorcycles(),fetchLiveExperiences(),fetchLiveEvents(),fetchLiveBlogPosts(),fetchLiveFerrySchedules(),fetchLiveLandTransport(),fetchLiveGallery(),fetchLiveTourGuides(),fetchLiveBoatOperators(),fetchLiveDestinations(),fetchLiveTravelGuides(),fetchSiteSettings()]);if(liveHotels&&liveHotels.length)DATA.hotels=liveHotels;if(liveMotos&&liveMotos.length)DATA.motos=liveMotos;if(liveExp&&liveExp.length)DATA.experiences=liveExp.map(e=>({...e,icon:EXPERIENCE_ICONS[e.iconName]||Compass}));if(liveEvents&&liveEvents.length)DATA.events=liveEvents;if(livePosts&&livePosts.length)DATA.posts=livePosts;if(liveFerry&&liveFerry.length)DATA.ferry=liveFerry;if(liveTransport&&liveTransport.length)DATA.transport=liveTransport;if(liveGallery&&liveGallery.length)DATA.gallery=liveGallery;DATA.tourGuides=liveGuides||[];DATA.boatOperators=liveBoatOps||[];if(liveDest&&liveDest.length)DATA.destinations=liveDest;if(liveTravelGuides&&liveTravelGuides.length)DATA.guides=liveTravelGuides;if(liveSettings?.heroImageUrl){DATA.hero.fallback=liveSettings.heroImageUrl;try{localStorage.setItem('ro_hero_image',liveSettings.heroImageUrl)}catch{}}if(liveSettings?.heroVideoUrl)DATA.hero.video=liveSettings.heroVideoUrl;setLiveReady(true);bumpLive(x=>x+1)})()},[]);useEffect(()=>{trackPage(path)},[path]);useEffect(()=>{const c=path.split('?')[0].split('#')[0].replace(/^\//,'').replace(/\/$/,'')||'inicio';document.body.classList.toggle('ro-has-sticky-cta',c.startsWith('hotel/'))},[path]);const L=txt.es;const clean=path.split('?')[0].split('#')[0].replace(/^\//,'').replace(/\/$/,'')||'inicio';const nav=p=>{go(p);setMenu(false)};return <><Nav L={L} go={nav} menu={menu} setMenu={setMenu} session={guestSession}/><MobileIsland L={L} go={nav}/><main><Router clean={clean} L={L} go={nav} session={guestSession} authReady={authReady}/></main><Footer L={L} go={nav}/></>}
function Router({clean,L,go,session,authReady}){if(clean==='privacidad')return <LegalPage type="privacy"/>;if(clean==='terminos')return <LegalPage type="terms"/>;if(clean==='cookies')return <LegalPage type="cookies"/>;if(clean==='iniciar-sesion')return <GuestLogin session={session} go={go}/>;if(clean==='mis-viajes')return <MyTrips session={session} authReady={authReady} go={go}/>;if(clean==='hoteles'||clean==='favoritos')return <Hotels L={L} go={go}/>;if(clean.startsWith('hotel/'))return <HotelDetail slug={clean.split('/')[1]} L={L} go={go}/>;if(clean==='motos')return <Motos L={L} go={go}/>;if(clean.startsWith('moto/'))return <MotoDetail slug={clean.split('/')[1]} L={L} go={go}/>;if(clean==='horario-barcos')return <SchedulePage L={L}/>;if(clean==='transporte-terrestre')return <Transport L={L}/>;if(clean==='guias')return <Guides L={L} go={go}/>;if(clean.startsWith('guia/'))return <GuideDetail slug={clean.split('/')[1]} go={go}/>;if(clean==='destinos')return <Destinations go={go}/>;if(clean.startsWith('destino/'))return <GenericDetail kind="Destino" item={DATA.destinations.find(x=>x.slug===clean.split('/')[1])}/>;if(clean==='actividades'||clean==='experiencias')return <Activities L={L} go={go}/>;if(clean.startsWith('actividad/')||clean.startsWith('experiencia/'))return <ExperienceDetail slug={clean.split('/')[1]} go={go}/>;if(clean==='eventos'||clean==='eventos-y-promociones')return <Events go={go}/>;if(clean.startsWith('evento/'))return <EventDetail slug={clean.split('/')[1]} go={go}/>;if(clean==='blog')return <Blog go={go}/>;if(clean.startsWith('blog/'))return <Post slug={clean.split('/')[1]} L={L}/>;if(clean==='contacto')return <Contact L={L}/>;if(clean==='reservar')return <ReservePage L={L} session={session} go={go}/>;return <Home L={L} go={go}/>}
function Nav({L,go,menu,setMenu,session}){return <header className="nav"><button onClick={()=>go('/')} className="brand"><img src="/RO.png" alt="Reserva Ometepe"/><span><b>Reserva Ometepe</b><small>Planifica tu viaje</small></span></button><nav className={menu?'open':''}><button onClick={()=>go('/')}>{L.home}</button><button onClick={()=>go('/hoteles')}>{L.hotels}</button><button onClick={()=>go('/motos')}>{L.motos}</button><div className="drop"><button>{L.sched}<ChevronDown size={16}/></button><div><button onClick={()=>go('/horario-barcos')}>{L.barcos}</button><button onClick={()=>go('/transporte-terrestre')}>{L.transport}</button></div></div><div className="drop"><button>Experiencias<ChevronDown size={16}/></button><div><button onClick={()=>go('/guias')}>{L.guides}</button><button onClick={()=>go('/destinos')}>{L.destinations}</button><button onClick={()=>go('/actividades')}>{L.activities}</button><button onClick={()=>go('/blog')}>{L.blog}</button></div></div><button onClick={()=>go('/eventos-y-promociones')}>{L.events}</button><button onClick={()=>go('/contacto')}>{L.contact}</button></nav><button className="guest-access" onClick={()=>go(session?'/mis-viajes':'/iniciar-sesion')}><ShieldCheck size={16}/><span>{session?'Mis viajes':'Iniciar sesión'}</span></button><button className="hamb" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></header>}
function MobileIsland({L,go}){const[open,setOpen]=useState(false);useEffect(()=>{document.body.classList.toggle('mobile-menu-open',open);return()=>document.body.classList.remove('mobile-menu-open')},[open]);const nav=(p)=>{go(p);setOpen(false)};return <div className={open?'mobile-island open':'mobile-island'}><button className="island-trigger" onClick={()=>setOpen(!open)}><img src="/RO.png" alt="Reserva Ometepe"/><span>{open?'Cerrar':'Menú'}</span>{open?<X size={18}/>:<Menu size={18}/>}</button>{open&&<><div className="island-backdrop" onClick={()=>setOpen(false)}></div><div className="island-panel"><button onClick={()=>nav('/')}><Palmtree/>Inicio</button><button onClick={()=>nav('/hoteles')}><Hotel/>{L.hotels}</button><button onClick={()=>nav('/mis-viajes')}><ShieldCheck/>Mis viajes</button><button onClick={()=>nav('/motos')}><Bike/>Motos</button><button onClick={()=>nav('/horario-barcos')}><Ship/>Barcos</button><button onClick={()=>nav('/transporte-terrestre')}><Bus/>Transporte</button><button onClick={()=>nav('/guias')}><Compass/>Guías</button><button onClick={()=>nav('/experiencias')}><Palmtree/>Experiencias</button><button onClick={()=>nav('/eventos-y-promociones')}><CalendarDays/>Eventos</button><button onClick={()=>nav('/contacto')}><Mail/>Contacto</button></div></>}</div>}
function SubscribePrompt({section='general',title='Recibe novedades de Ometepe',text='Déjanos tu correo para recibir guías, eventos y avisos útiles para planificar tu viaje.'}){const[show,setShow]=useState(false);const[done,setDone]=useState(false);const[email,setEmail]=useState('');const[sending,setSending]=useState(false);const[err,setErr]=useState(false);const promptKey='ro-sub-prompt-seen-at';useEffect(()=>{const lastSeen=Number(localStorage.getItem(promptKey)||0);const thirtyDays=30*24*60*60*1000;if(lastSeen&&Date.now()-lastSeen<thirtyDays)return;const t=setTimeout(()=>{localStorage.setItem(promptKey,String(Date.now()));setShow(true)},15000);return()=>clearTimeout(t)},[]);if(!show||done)return null;const save=async(e)=>{e.preventDefault();setSending(true);setErr(false);try{await subscribeNewsletter({email,interest:section,source:section});localStorage.setItem(promptKey,String(Date.now()));trackEvent('newsletter_signup',{section});setDone(true)}catch{setErr(true)}finally{setSending(false)}};return <div className="sub-alert"><button className="sub-close" aria-label="Cerrar suscripción" onClick={()=>setShow(false)}>×</button><div><Bell/><b>{title}</b><p>{text}</p></div><form onSubmit={save}><input required aria-label="Correo electrónico" placeholder="Tu correo" type="email" value={email} onChange={e=>setEmail(e.target.value)}/><button disabled={sending}>{sending?'Enviando…':'Suscribirme'}</button></form>{err&&<small style={{color:'var(--red)',display:'block',marginTop:'8px'}}>No pudimos guardar tu correo. Intenta de nuevo.</small>}</div>}

function HeroSearch({L,go}){
  const[checkin,setCheckin]=useState('');
  const[checkout,setCheckout]=useState('');
  const[adults,setAdults]=useState('2');
  const submit=e=>{
    e.preventDefault();
    trackEvent('HomeSearch',{checkin,checkout,adults});
    const params=new URLSearchParams();
    if(checkin)params.set('checkin',checkin);
    if(checkout)params.set('checkout',checkout);
    if(adults)params.set('adults',adults);
    go('/hoteles'+(params.toString()?'?'+params.toString():''));
  };
  return <form className="search hero-search" onSubmit={submit}>
    <label className="hero-search-field"><span>Llegada</span><input type="date" value={checkin} onChange={e=>setCheckin(e.target.value)}/></label>
    <label className="hero-search-field"><span>Salida</span><input type="date" value={checkout} onChange={e=>setCheckout(e.target.value)}/></label>
    <label className="hero-search-field"><span>Viajeros</span><select value={adults} onChange={e=>setAdults(e.target.value)}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{pluralize(n,'viajero','viajeros')}</option>)}</select></label>
    <button type="submit">{L.hotels}<ArrowUpRight size={17}/></button>
  </form>;
}
function Home({L,go}){setSeo('Reserva Ometepe | Hoteles, horarios de barcos y guía de viaje','Planifica tu viaje a Isla de Ometepe con hoteles, horarios de barcos, motos, transporte, actividades, eventos y guías locales.');useLiveReady();const[heroVideoFailed,setHeroVideoFailed]=useState(false);const toOmetepe=['San Jorge → Moyogalpa','San Jorge → San José del Sur'];const toSanJorge=['Moyogalpa → San Jorge','San José del Sur → San Jorge'];const nextSJ=nextDeparture(toOmetepe);const nextOM=nextDeparture(toSanJorge);const wSJ=routeWeatherSummary(toOmetepe);const wOM=routeWeatherSummary(toSanJorge);const showHeroVideo=DATA.hero.video&&!heroVideoFailed;return <><section className="hero">{showHeroVideo?<video className="hero-bg" autoPlay muted loop playsInline poster={DATA.hero.fallback} onError={()=>setHeroVideoFailed(true)}><source src={DATA.hero.video}/></video>:<img className="hero-bg" src={DATA.hero.fallback} alt="Isla de Ometepe, Nicaragua"/>}<div className="shade"></div><div className="hero-inner"><p className="eyebrow">Reserva Ometepe</p><h1>{L.hero}</h1><p>{L.heroSub}</p><div className="quick"><button onClick={()=>go('/hoteles')}><Hotel/>{L.hotels}</button><button onClick={()=>go('/horario-barcos')}><Ship/>Barcos</button><button onClick={()=>go('/motos')}><Bike/>Motos</button><button onClick={()=>go('/actividades')}><MapPin/>Qué hacer</button></div><HeroSearch L={L} go={go}/></div></section><section className="next green"><div><p className="eyebrow">Cruce a la isla</p><h2>{L.next}</h2><p>Consulta las próximas salidas hacia Ometepe (Moyogalpa o San José del Sur) y hacia Puerto San Jorge antes de organizar tu llegada o regreso.</p><button onClick={()=>go('/horario-barcos')} className="btn">Ver horario completo<ArrowUpRight size={17}/></button></div><div className="dual-next"><NextCard next={nextSJ} weather={wSJ} L={L}/><NextCard next={nextOM} weather={wOM} L={L}/></div></section><DonateBanner/><SubscribePrompt section="home" title="Planifica tu viaje con información actualizada" text="Recibe novedades de barcos, eventos y promociones para visitar Ometepe."/><Experiences go={go}/><HotelsPreview L={L} go={go}/><Planner/><DestinationsPreview go={go}/><Gallery/><Newsletter L={L}/></>}
const WEATHER_INFO={normal:{label:'Zarpes con normalidad',cls:'normal'},delay:{label:'Pueden haber retrasos por clima',cls:'delay'},cancelled:{label:'Cancelado por clima hasta nuevo aviso',cls:'cancelled'}};
function NextCard({next,weather,L}){
  const w=WEATHER_INFO[weather?.status]||WEATHER_INFO.normal;
  return <aside className={'ro-next-card '+w.cls}>
    <div className="ro-next-top"><Ship size={22}/><span className={'ro-next-badge '+w.cls}>{w.label}</span></div>
    {next?<>
      <small className="ro-next-route">{next.route}</small>
      <b className="ro-next-countdown">{String(next.h).padStart(2,'0')}h {String(next.m).padStart(2,'0')}m</b>
      <span className="ro-next-meta">{next.boat?`${next.boat} · `:''}{formatTime12(next.time)}</span>
    </>:<div className="ro-next-empty"><b>Sin salidas disponibles</b><span>No hay próximas salidas para esta ruta en este momento.</span></div>}
    {weather?.note&&<p className="ro-next-note">{weather.note}</p>}
    <NextCardStyle/>
  </aside>;
}
function NextCardStyle(){return <style>{`
.ro-next-card{background:var(--red);color:#fff;border-radius:34px;padding:28px;box-shadow:0 25px 70px rgba(255,49,49,.22);display:flex;flex-direction:column;gap:6px;position:relative;overflow:hidden}
.ro-next-card.delay{background:#b8790f;box-shadow:0 25px 70px rgba(184,121,15,.25)}
.ro-next-card.cancelled{background:#3a3a3a;box-shadow:0 25px 70px rgba(0,0,0,.25)}
.ro-next-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:6px}
.ro-next-badge{font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.04em;background:rgba(0,0,0,.55);padding:6px 10px;border-radius:999px;text-align:right}
.ro-next-route{font-weight:900;opacity:.92}
.ro-next-countdown{font-size:clamp(2.2rem,5vw,3.2rem);line-height:1;margin:8px 0}
.ro-next-meta{font-weight:800;opacity:.92}
.ro-next-empty{padding:6px 0}
.ro-next-empty b{display:block;font-size:1.2rem;margin-bottom:4px}
.ro-next-empty span{opacity:.85;font-size:.92rem}
.ro-next-note{margin:12px 0 0;background:rgba(0,0,0,.18);border-radius:14px;padding:11px 13px;font-size:.85rem;line-height:1.5}
@media(max-width:640px){.ro-next-card{padding:20px;border-radius:26px}.ro-next-badge{font-size:.62rem;padding:5px 8px}}
`}</style>}
function ExperienceImg({src,Icon,alt=''}){
  const[broken,setBroken]=useState(!src);
  useEffect(()=>{setBroken(!src)},[src]);
  if(broken)return <div className="ro-exp-noimg"><Icon size={30}/></div>;
  return <img src={src} alt={alt||'Imagen de experiencia en Ometepe'} loading="lazy" onError={()=>setBroken(true)}/>;
}
function Experiences({go}){useLiveReady();return <section className="section white"><div className="head"><p className="eyebrow">Experiencias en Ometepe</p><h2>No solo visites Ometepe. Vívela.</h2><p>Descubre actividades auténticas para conectar con la naturaleza, la cultura y la vida local de la isla: cocina nicaragüense, kayak, senderismo, danza, museos, volcanes y mercados tradicionales. Cada experiencia se cotiza según fecha, cantidad de personas y disponibilidad del aliado local.</p></div><div className="expgrid">{DATA.experiences.map(e=>{const Icon=e.icon;return <article key={e.slug} className="ro-exp-card"><div className="ro-exp-media"><ExperienceImg src={e.img} Icon={Icon}/><span className="ro-exp-badge"><Icon size={16}/></span></div><div className="ro-exp-body"><span>{e.type}</span><b>{e.name}</b><p>{e.desc}</p><small className="mini">{e.duration} · {e.ideal}</small><div className="cardactions"><button className="btn small" onClick={()=>go?.('/reservar?experience='+e.slug)}>Cotizar experiencia</button><button className="btn ghost small" onClick={()=>go?.('/experiencia/'+e.slug)}>Ver detalles</button></div></div></article>})}</div><SouvenirSoon/></section>}
function HotelsPreview({L,go}){return <section className="section white compact"><div className="head"><p className="eyebrow">Alojamientos en Ometepe</p><h2>Encuentra dónde quedarte según tu ruta, presupuesto y estilo de viaje</h2><p>Compara hoteles, eco lodges, cabañas y opciones frente al lago en Moyogalpa, Altagracia, Santo Domingo, Balgüe y Mérida. Solicita disponibilidad sin salir de Reserva Ometepe.</p></div><HotelGrid L={L} go={go}/><br/><button onClick={()=>go('/hoteles')} className="btn">Ver alojamientos</button></section>}
function Hotels({L,go}){setSeo('Alojamientos en Ometepe | Hoteles, cabañas y eco lodges','Encuentra alojamientos en Ometepe por zona, tipo, precio, comodidades, vistas y disponibilidad. Solicita una propuesta de reserva sin contacto directo del alojamiento.');return <section className="page white"><div className="head"><p className="eyebrow">Alojamientos en Ometepe</p><h1>Encuentra el lugar ideal para dormir en la isla</h1><p>Explora hoteles, eco lodges, cabañas y alojamientos frente al lago. Revisa habitaciones, comodidades, vistas, políticas y solicita disponibilidad con tu correo y WhatsApp.</p></div><HotelGrid L={L} go={go}/><SubscribePrompt section="alojamientos" title="Recibe ofertas de alojamientos" text="Te avisamos cuando haya nuevas opciones, promociones y disponibilidad para viajar a Ometepe."/></section>}
function pluralize(n,singular,plural){return `${n} ${n===1?singular:plural}`}
// Mini-carrusel al pasar el mouse (o al tocar en móvil), como las tarjetas de Airbnb/Booking.
function HotelMedia({images,alt}){
  const list=(images&&images.length?images:[]).filter(Boolean);
  const[i,setI]=useState(0);
  const[broken,setBroken]=useState(!list.length);
  useEffect(()=>{setBroken(!list.length)},[list.length]);
  const timerRef=React.useRef(null);
  const startCycle=()=>{
    if(list.length<2)return;
    clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>setI(x=>(x+1)%list.length),900);
  };
  const stopCycle=()=>{clearInterval(timerRef.current);setI(0)};
  useEffect(()=>()=>clearInterval(timerRef.current),[]);
  if(broken||!list.length)return <div className="ro-hcard-noimg"><Hotel size={28}/></div>;
  return <div className="ro-hcard-carousel" onMouseEnter={startCycle} onMouseLeave={stopCycle} onTouchStart={startCycle}>
    <img src={list[i]} alt={alt} loading="lazy" onError={()=>setBroken(true)}/>
    {list.length>1&&<div className="ro-hcard-dots">{list.map((_,d)=><span key={d} className={d===i?'active':''}></span>)}</div>}
  </div>;
}
function DonateBanner({compact=false}){
  const url='https://www.paypal.com/ncp/payment/VBG3D57HEUUWQ';
  return <div className={'ro-donate'+(compact?' compact':'')}>
    <div className="ro-donate-icon"><Heart size={compact?20:26}/></div>
    <div className="ro-donate-text"><b>Apoya a Reserva Ometepe</b><p>Si esta guía te ha sido útil para planificar tu viaje, considera apoyar el proyecto con una donación.</p></div>
    <a href={url} target="_blank" rel="noopener noreferrer" className="btn" onClick={()=>trackEvent('donate_click',{section:compact?'schedule':'home'})}>Donar</a>
    <DonateBannerStyle/>
  </div>;
}
function DonateBannerStyle(){return <style>{`
.ro-donate{display:flex;align-items:center;gap:16px;background:linear-gradient(135deg,#fff4ee,#ffe8dc);border:1px solid #f6d3bf;border-radius:16px;padding:20px 24px;margin:32px auto;max-width:900px}
.ro-donate-icon{width:48px;height:48px;border-radius:50%;background:#e8622c;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.ro-donate-icon svg{fill:#fff}
.ro-donate-text{flex:1}
.ro-donate-text b{display:block;font-size:15px;color:#1a1f2b;margin-bottom:2px}
.ro-donate-text p{margin:0;font-size:13px;color:#7a5a48}
.ro-donate .btn{flex-shrink:0;background:#e8622c;border-color:#e8622c}
.ro-donate.compact{padding:14px 18px;gap:12px;margin:24px auto}
.ro-donate.compact .ro-donate-text b{font-size:14px}
.ro-donate.compact .ro-donate-text p{font-size:12px}
@media(max-width:560px){.ro-donate{flex-wrap:wrap;text-align:center;justify-content:center}.ro-donate-text{flex:1 1 100%}}
`}</style>}
function HotelSkeletonGrid(){
  return <div className="ro-hcard-grid" aria-hidden="true">{Array.from({length:4}).map((_,i)=><div className="ro-hcard ro-skel" key={i}><div className="ro-skel-media"></div><div className="ro-hcard-body"><div className="ro-skel-line" style={{width:'40%'}}></div><div className="ro-skel-line" style={{width:'80%',height:'18px'}}></div><div className="ro-skel-line" style={{width:'95%'}}></div><div className="ro-skel-line" style={{width:'60%'}}></div></div></div>)}</div>;
}
function HotelGrid({L,go}){
  const benefits=useBenefits('accommodation');
  const liveReady=useLiveReady();
  const q=useMemo(()=>new URLSearchParams(location.search),[]);
  const searchIntent=useMemo(()=>({checkin:q.get('checkin')||'',checkout:q.get('checkout')||'',adults:q.get('adults')||''}),[q]);
  const[type,setType]=useState('Todos');
  const[zone,setZone]=useState('Todas');
  const[max,setMax]=useState(90);
  const[minRating,setMinRating]=useState(0);
  const[sort,setSort]=useState('destacados');
  const[amenities,setAmenities]=useState([]);
  const types=['Todos',...new Set(DATA.hotels.map(h=>h.type))];
  const zones=['Todas',...new Set(DATA.hotels.map(h=>h.zone))];
  const allAmenities=useMemo(()=>[...new Set(DATA.hotels.flatMap(h=>h.amenities||[]))].slice(0,10),[]);
  const toggleAmenity=a=>setAmenities(prev=>prev.includes(a)?prev.filter(x=>x!==a):[...prev,a]);
  const clearFilters=()=>{setType('Todos');setZone('Todas');setMax(90);setMinRating(0);setAmenities([])};
  let hotels=DATA.hotels.filter(h=>(type==='Todos'||h.type===type)&&(zone==='Todas'||h.zone===zone)&&h.price<=max&&h.rating>=minRating&&amenities.every(a=>(h.amenities||[]).includes(a)));
  hotels=[...hotels].sort((a,b)=>{
    if(sort==='precio')return a.price-b.price;
    if(sort==='resena')return b.rating-a.rating;
    if(sort==='area')return a.zone.localeCompare(b.zone);
    return b.reviews-a.reviews;
  });
  const activeChips=[
    type!=='Todos'&&{key:'type',label:type,clear:()=>setType('Todos')},
    zone!=='Todas'&&{key:'zone',label:zone,clear:()=>setZone('Todas')},
    minRating>0&&{key:'rating',label:minRating+'+ reseña',clear:()=>setMinRating(0)},
    max<90&&{key:'price',label:'Hasta $'+max,clear:()=>setMax(90)},
    ...amenities.map(a=>({key:'am-'+a,label:a,clear:()=>toggleAmenity(a)})),
  ].filter(Boolean);
  const query=searchIntent.checkin||searchIntent.checkout||searchIntent.adults?'&checkin='+encodeURIComponent(searchIntent.checkin)+'&checkout='+encodeURIComponent(searchIntent.checkout)+'&adults='+encodeURIComponent(searchIntent.adults):'';
  return <>
    {(searchIntent.checkin||searchIntent.adults)&&<p className="ro-search-intent"><CalendarDays size={15}/> Buscando para {searchIntent.checkin||'fechas por confirmar'}{searchIntent.checkout?' → '+searchIntent.checkout:''}{searchIntent.adults?' · '+pluralize(+searchIntent.adults,'viajero','viajeros'):''}. Estas fechas se incluirán automáticamente al solicitar disponibilidad.</p>}
    <div className="filterbar hotel-filters" aria-label="Filtros de alojamientos">
      <SlidersHorizontal/>
      <label><span>Tipo</span><select value={type} onChange={e=>setType(e.target.value)}>{types.map(t=><option key={t}>{t}</option>)}</select></label>
      <label><span>Zona</span><select value={zone} onChange={e=>setZone(e.target.value)}>{zones.map(z=><option key={z}>{z}</option>)}</select></label>
      <label><span>Reseña</span><select value={minRating} onChange={e=>setMinRating(+e.target.value)}><option value="0">Todas</option><option value="4.5">4.5+ excelente</option><option value="4.7">4.7+ superior</option></select></label>
      <label className="price-filter"><span>Precio hasta ${max}</span><input aria-label="Precio máximo" type="range" min="20" max="120" value={max} onChange={e=>setMax(+e.target.value)}/></label>
      <label><span>Ordenar</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="destacados">Destacados</option><option value="precio">Menor precio</option><option value="resena">Mejor reseña</option><option value="area">Zona</option></select></label>
    </div>
    <div className="ro-amenities" aria-label="Filtrar por comodidades">
      <span className="ro-amenities-label">Comodidades</span>
      {allAmenities.map(a=><button type="button" key={a} className={'ro-amenity-chip'+(amenities.includes(a)?' active':'')} onClick={()=>toggleAmenity(a)}>{amenities.includes(a)&&<Check size={13}/>}{a}</button>)}
    </div>
    {activeChips.length>0&&<div className="ro-active-chips">
      {activeChips.map(c=><span className="ro-chip" key={c.key}>{c.label}<button type="button" aria-label={'Quitar filtro '+c.label} onClick={c.clear}><X size={12}/></button></span>)}
      <button type="button" className="ro-clear-chips" onClick={clearFilters}>Limpiar filtros</button>
    </div>}
    <p className="results-count">{hotels.length} alojamientos encontrados. Puedes abrir cada ficha para ver habitaciones, comodidades, vistas, políticas y solicitar disponibilidad.</p>
    {(!liveReady)?<HotelSkeletonGrid/>:<div className="ro-hcard-grid">{hotels.map(h=>{const benefit=findBenefit(benefits,'accommodation',h.slug);const low=h.available>0&&h.available<=3;return <article className="ro-hcard" key={h.id}>
      <div className="ro-hcard-media-wrap">
        <button className="ro-hcard-media" onClick={()=>{trackEvent('ViewAccommodation',{slug:h.slug,source:'card_image'});go('/hotel/'+h.slug)}} aria-label={'Ver detalles de '+h.name}>
          <HotelMedia images={h.images} alt={h.name}/>
          <span className="ro-hcard-type">{h.type}</span>
          {benefit&&<span className="ro-hcard-benefit" onClick={e=>{e.stopPropagation();trackEvent('ViewBenefit',{slug:h.slug,benefit:benefit.title})}}>🎁 {benefit.badge_text||'Beneficio exclusivo'}</span>}
          <span className="ro-hcard-rating"><Star size={13}/> {h.rating}</span>
        </button>
      </div>
      <div className="ro-hcard-body">
        <div className="ro-hcard-top"><MapPin size={14}/><span>{h.zone}</span><i>·</i><span>{h.reviews} reseñas</span></div>
        <h3>{h.name}</h3>
        <p>{h.desc}</p>
        <div className="tags">{h.tags.slice(0,3).map(t=><small key={t}>{t}</small>)}</div>
        <div className="ro-hcard-facts"><span>{pluralize(h.rooms.length,'habitación','habitaciones')}</span><span>{h.views[0]}</span><span>{pluralize(h.available,'disponible','disponibles')}</span></div>
        {low&&<p className="ro-urgency">🔥 ¡Solo {pluralize(h.available,'habitación disponible','habitaciones disponibles')}!</p>}
        <div className="ro-hcard-bottom">
          <div className="ro-hcard-price"><small>{L.from}</small><strong>${h.price}</strong><small>/ noche</small></div>
          <div className="ro-hcard-actions"><button onClick={()=>{trackEvent('ViewAccommodation',{slug:h.slug,source:'card_details'});go('/hotel/'+h.slug)}} className="btn ghost small">Ver alojamiento</button><button onClick={()=>{trackEvent('AvailabilityRequestStart',{slug:h.slug,source:'card'});go('/reservar?hotel='+h.slug+query)}} className="btn small">Solicitar</button></div>
        </div>
        <small className="ro-trust"><Clock size={12}/> Respuesta en 24h · sin costo por solicitar</small>
      </div>
    </article>})}</div>}
    <HotelCardStyle/>
  </>}
function HotelCardStyle(){return <style>{`
.ro-hcard-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:22px;margin-top:18px}
.ro-hcard{background:#fff;border-radius:16px;overflow:hidden;border:1px solid #eef1f5;box-shadow:0 2px 10px rgba(20,30,50,.05);transition:box-shadow .18s,transform .18s;display:flex;flex-direction:column}
.ro-hcard:hover{box-shadow:0 10px 28px rgba(20,30,50,.12);transform:translateY(-2px)}
.ro-hcard-media{position:relative;display:block;width:100%;aspect-ratio:4/3;border:none;padding:0;cursor:pointer;background:#eef1f5;overflow:hidden}
.ro-hcard-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .3s}
.ro-hcard-media:hover img{transform:scale(1.04)}
.ro-hcard-noimg{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#aab3c2;background:linear-gradient(135deg,#eef1f5,#e2e7ee)}
.ro-hcard-type{position:absolute;top:12px;left:12px;background:rgba(20,30,50,.72);color:#fff;font-size:11px;font-weight:600;padding:5px 10px;border-radius:999px;letter-spacing:.02em}
.ro-hcard-benefit{position:absolute;top:12px;right:12px;background:#e8622c;color:#fff;font-size:11px;font-weight:700;padding:5px 10px;border-radius:999px;cursor:pointer}
.ro-hcard-rating{position:absolute;bottom:12px;left:12px;background:#fff;color:#1a1f2b;font-size:12px;font-weight:700;padding:4px 9px;border-radius:999px;display:flex;align-items:center;gap:4px;box-shadow:0 2px 6px rgba(0,0,0,.15)}
.ro-hcard-rating svg{color:#f5a623;fill:#f5a623}
.ro-hcard-body{padding:16px 18px 18px;display:flex;flex-direction:column;flex:1}
.ro-hcard-top{display:flex;align-items:center;gap:6px;color:#7a869a;font-size:12.5px;margin-bottom:6px}
.ro-hcard-top svg{color:#2563eb}
.ro-hcard-body h3{margin:0 0 6px;font-size:17px;line-height:1.25}
.ro-hcard-body>p{margin:0 0 10px;font-size:13.5px;color:#5c6478;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ro-hcard-facts{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:#7a869a;margin:8px 0 14px}
.ro-hcard-facts span{background:#f5f7fa;padding:4px 9px;border-radius:8px}
.ro-hcard-bottom{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px dashed #eef1f5}
.ro-hcard-price{display:flex;align-items:baseline;gap:3px}
.ro-hcard-price strong{font-size:20px;color:#1a1f2b}
.ro-hcard-price small{font-size:11px;color:#7a869a}
.ro-hcard-actions{display:flex;gap:8px}
@media(max-width:520px){.ro-hcard-bottom{flex-direction:column;align-items:stretch}.ro-hcard-actions{justify-content:stretch}.ro-hcard-actions .btn{flex:1}}
@media(max-width:640px){
.ro-hcard-grid{gap:14px}
.ro-hcard-media{aspect-ratio:16/9}
.ro-hcard-body{padding:12px 14px 14px}
.ro-hcard-body h3{font-size:15.5px;margin:0 0 4px}
.ro-hcard-body>p{font-size:12.5px;margin:0 0 8px}
.ro-hcard-top{font-size:11.5px;margin-bottom:4px}
@media(max-width:480px){
.ro-hcard-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px}
.ro-hcard{border-radius:12px}
.ro-hcard-media{aspect-ratio:1/1}
.ro-hcard-type{font-size:9px;padding:3px 7px;top:8px;left:8px}
.ro-hcard-benefit{font-size:9px;padding:3px 7px;top:8px;right:8px}
.ro-hcard-rating{font-size:10px;padding:3px 6px;bottom:8px;left:8px;gap:2px}
.ro-hcard-rating svg{width:10px;height:10px}
.ro-hcard-body{padding:8px 9px 9px}
.ro-hcard-top{font-size:9.5px;gap:3px;margin-bottom:3px}
.ro-hcard-top svg{width:11px;height:11px}
.ro-hcard-body h3{font-size:12px;line-height:1.22;margin:2px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ro-hcard-body>p,.ro-hcard-facts{display:none}
.ro-hcard-bottom{padding-top:6px;flex-direction:column;align-items:stretch;gap:6px}
.ro-hcard-price{gap:2px}
.ro-hcard-price strong{font-size:14px}
.ro-hcard-price small{font-size:8.5px}
.ro-hcard-actions{flex-direction:column;gap:5px}
.ro-hcard-actions .btn{width:100%;font-size:11px;padding:7px 6px}
}
.ro-hcard-body .tags{margin:8px 0}
.ro-hcard-facts{font-size:11px;margin:6px 0 10px;gap:6px}
.ro-hcard-facts span{padding:3px 7px}
.ro-hcard-bottom{padding-top:10px}
.ro-hcard-price strong{font-size:17px}
.ro-hcard-type,.ro-hcard-benefit{font-size:10px;padding:4px 8px}
.ro-hcard-rating{font-size:11px;padding:3px 7px}
.ro-urgency{font-size:.78rem;margin:0 0 6px}
.ro-hcard-body .ro-trust{font-size:.7rem}
}
`}</style>}
function StickyBookBar({h,go,query}){
  const[show,setShow]=useState(false);
  useEffect(()=>{
    const onScroll=()=>setShow(window.scrollY>420);
    addEventListener('scroll',onScroll,{passive:true});
    return()=>removeEventListener('scroll',onScroll);
  },[]);
  return <div className={'ro-sticky-cta'+(show?' show':'')}>
    <div><small>{'Desde'}</small><strong>${h.price}<span> / noche</span></strong></div>
    <button onClick={()=>{trackEvent('AvailabilityRequestStart',{slug:h.slug,source:'sticky_mobile'});go('/reservar?hotel='+h.slug+query)}} className="btn">Solicitar disponibilidad</button>
  </div>;
}
function HotelDetail({slug,L,go}){useLiveReady();const benefits=useBenefits('accommodation');const h=DATA.hotels.find(x=>x.slug===slug)||DATA.hotels[0];const benefit=findBenefit(benefits,'accommodation',h.slug);const low=h.available>0&&h.available<=3;const qp=new URLSearchParams(location.search);const query=(qp.get('checkin')||qp.get('checkout')||qp.get('adults'))?'&checkin='+encodeURIComponent(qp.get('checkin')||'')+'&checkout='+encodeURIComponent(qp.get('checkout')||'')+'&adults='+encodeURIComponent(qp.get('adults')||''):'';useEffect(()=>trackEvent('ViewAccommodation',{slug:h.slug,zone:h.zone,type:h.type}),[h.slug]);setSeo(`${h.name} | Alojamiento en ${h.zone}, Ometepe`,`${h.name}: ${h.desc} Revisa habitaciones, comodidades, vistas, políticas y solicita disponibilidad en Reserva Ometepe.`,null,h.img);return <section className="page white ro-hotel-detail"><button className="ro-back-link" onClick={()=>go('/hoteles')}><ChevronLeft size={16}/> Volver a alojamientos</button><div className="head"><p className="eyebrow">Alojamiento en {h.zone}</p><h1>{h.name}</h1><p>{h.desc}</p></div><article className="detail"><div className="ro-detail-media-wrap"><HotelMedia images={h.images} alt={h.name}/></div><div><p><Star size={16}/> {h.rating} basado en {h.reviews} reseñas verificadas</p><p><MapPin size={16}/> {h.zone} · {h.type}</p><div className="ro-host-card"><div className="ro-host-avatar"><Users size={18}/></div><div><small>Anfitrión de este alojamiento</small><b>{h.host}</b></div></div><div className="tags">{h.tags.map(t=><small key={t}>{t}</small>)}</div><div className="availability"><i style={{width:Math.min(100,h.available*12)+'%'}}></i><b>{h.available} habitaciones disponibles para solicitud</b></div>{low&&<p className="ro-urgency">🔥 ¡Solo {pluralize(h.available,'habitación disponible','habitaciones disponibles')}! Alta demanda para esta fecha.</p>}<button onClick={()=>{trackEvent('AvailabilityRequestStart',{slug:h.slug,source:'detail'});go('/reservar?hotel='+h.slug+query)}} className="btn">Solicitar disponibilidad</button><small className="ro-trust"><Clock size={13}/> Respuesta en 24h · sin costo por solicitar · sin pago por adelantado</small></div></article><BenefitDetail benefit={benefit} targetSlug={h.slug}/><section className="hotel-section"><h2>Comodidades y vistas</h2><div className="featuregrid"><article><b>Comodidades</b><div className="tags">{h.amenities.map(a=><small key={a}>{a}</small>)}</div></article><article><b>Vistas y entorno</b><div className="tags">{h.views.map(v=><small key={v}>{v}</small>)}</div></article></div></section><section className="hotel-section"><h2>Habitaciones disponibles</h2><div className="roomgrid">{h.rooms.map(r=><article key={r.name}><h3>{r.name}</h3><p>{r.type} · hasta {r.capacity} personas · {r.beds}</p><div className="tags">{r.amenities.map(a=><small key={a}>{a}</small>)}</div><div className="roombottom"><strong>Desde ${r.price}</strong><button onClick={()=>go('/reservar?hotel='+h.slug+'&room='+encodeURIComponent(r.name)+query)} className="btn small">Solicitar</button></div></article>)}</div></section><section className="hotel-section"><h2>Políticas del alojamiento</h2><div className="policygrid"><article><b>Reserva</b><p>{h.policies.reservation}</p></article><article><b>Anticipo</b><p>{h.policies.deposit}</p></article><article><b>Cancelación</b><p>{h.policies.cancellation}</p></article><article><b>Devolución</b><p>{h.policies.refund}</p></article><article><b>Check-in / Check-out</b><p>{h.policies.checkin} · {h.policies.checkout}</p></article><article><b>Mascotas y niños</b><p>Mascotas: {h.policies.pets}. Niños: {h.policies.children}.</p></article></div><p className="note">Los datos de contacto del alojamiento no se muestran públicamente. La comunicación se gestiona desde Reserva Ometepe para proteger el flujo de solicitud y confirmación.</p></section><StickyBookBar h={h} go={go} query={query}/></section>}
function Motos({L,go}){useLiveReady();setSeo('Renta de motos en Ometepe | Reserva Ometepe','Opciones de scooter, motocicleta y cuatrimoto para recorrer Isla de Ometepe con libertad. Cotiza disponibilidad según fecha y ruta.');return <section className="page white"><div className="head"><p className="eyebrow">Renta de motos en Ometepe</p><h1>Muévete por la isla con libertad</h1><p>Compara opciones para recorrer playas, pueblos, miradores y rutas naturales de Ometepe. Solicita disponibilidad según tus fechas, tipo de moto y recorrido esperado.</p></div><div className="motogrid">{DATA.motos.map(m=><article key={m.slug}><img src={m.img}/><div><span>{m.type}</span><h3>{m.name}</h3><p>{m.desc}</p><strong>Desde ${m.price} por día</strong><button onClick={()=>go('/reservar?moto='+m.slug)} className="btn small">Solicitar disponibilidad</button></div></article>)}</div></section>}
function MotoDetail({slug,go}){useLiveReady();const m=DATA.motos.find(x=>x.slug===slug)||DATA.motos[0];setSeo(`${m.name} en Ometepe | Reserva Ometepe`,`${m.desc} Consulta precio, disponibilidad y recomendaciones para moverte por la isla.`);return <section className="page white"><div className="head"><p className="eyebrow">Renta de motos</p><h1>{m.name}</h1><p>{m.desc}</p></div><article className="detail"><img src={m.img}/><div><strong>Desde ${m.price} por día</strong><p>La disponibilidad, condiciones y precios finales pueden variar por temporada, fecha y lugar de entrega.</p><button onClick={()=>go('/reservar?moto='+m.slug)} className="btn">Solicitar disponibilidad</button></div></article></section>}
function SchedulePage({L}){useLiveReady();setSeo('Horario de barcos a Ometepe | Ferry San Jorge, Moyogalpa y San José del Sur','Consulta horarios completos de barcos y ferries hacia Ometepe, próximas salidas, contactos de reservación y recomendaciones para viajar.');const toOmetepe=['San Jorge → Moyogalpa','San Jorge → San José del Sur'];const toSanJorge=['Moyogalpa → San Jorge','San José del Sur → San Jorge'];const nextSJ=nextDeparture(toOmetepe);const nextOM=nextDeparture(toSanJorge);const wSJ=routeWeatherSummary(toOmetepe);const wOM=routeWeatherSummary(toSanJorge);const routes=['San Jorge → Moyogalpa','Moyogalpa → San Jorge','San Jorge → San José del Sur','San José del Sur → San Jorge'];const[route,setRoute]=useState(routes[0]);const list=DATA.ferry.filter(f=>f.route===route);const routeWeather=routeWeatherSummary(route);const rw=WEATHER_INFO[routeWeather.status]||WEATHER_INFO.normal;return <section className="page white"><div className="head"><p className="eyebrow">Horario de barcos a Ometepe</p><h1>Ferries y lanchas hacia Isla de Ometepe</h1><p>Elige una ruta para consultar sus salidas, embarcaciones y contactos de referencia. Los horarios pueden cambiar por clima, temporada o disposición del puerto.</p></div><div className="schedule-hero"><NextCard next={nextSJ} weather={wSJ} L={L}/><NextCard next={nextOM} weather={wOM} L={L}/></div><div className="routefilters"><b>Elegir ruta</b>{routes.map(r=><button key={r} onClick={()=>setRoute(r)} className={route===r?'active':''}>{r}</button>)}</div><section className="routegroup"><h2>{route}</h2>{routeWeather.status!=='normal'&&<div className={'ro-route-alert '+rw.cls}><AlertTriangle size={16}/><div><b>{rw.label}</b>{routeWeather.note&&<span>{routeWeather.note}</span>}</div></div>}<div className="schedlist">{list.map((f,i)=><div key={i}><span>{f.route}</span><b>{formatTime12(f.time)}</b><small>{f.boat}</small><em>{f.contact}</em></div>)}</div></section><div className="contacts"><h2>Contactos de reservación</h2><div>{DATA.boatOperators.map((o,i)=><article key={i}><b>{o.name}</b><p>{o.phone||'Teléfono por confirmar'}</p></article>)}<article><b>Recomendación</b><p>Llegar 40 minutos antes. Si viajas con vehículo, consulta disponibilidad con anticipación.</p></article></div></div><p className="note">Importante: el ferry Rey del Cocibolca y la Gran Sultana arriban en Puerto San José del Sur. Horarios sujetos a cambios; confirma por teléfono o en taquilla.</p><DonateBanner compact/><SubscribePrompt section="barcos" title="Recibe alertas de horario" text="Suscríbete para recibir avisos cuando haya cambios importantes en barcos, ferries o transporte."/><RouteAlertStyle/></section>}
function RouteAlertStyle(){return <style>{`
.ro-route-alert{display:flex;align-items:flex-start;gap:10px;border-radius:16px;padding:13px 15px;margin:14px 0 18px;font-size:.9rem}
.ro-route-alert.delay{background:#fff4e0;color:#8a5a06;border:1px solid #f3d59a}
.ro-route-alert.cancelled{background:#f1f1f1;color:#3a3a3a;border:1px solid #d8d8d8}
.ro-route-alert b{display:block;margin-bottom:2px}
.ro-route-alert span{opacity:.85}
`}</style>}
function Transport(){useLiveReady();setSeo('Horario de buses y transporte terrestre en Ometepe | Reserva Ometepe','Consulta horarios de buses, tarifas de transporte, taxis y conexiones para moverte dentro de Isla de Ometepe.');return <section className="page white"><div className="head"><p className="eyebrow">Transporte terrestre</p><h1>Horarios de buses y tarifas para moverse en Ometepe</h1><p>Información práctica para conectar Moyogalpa, Altagracia, Balgüe, Mérida, San José del Sur y otros puntos de la isla. Los horarios son aproximados y pueden variar.</p></div><div className="transportgrid">{DATA.transport.map((t,i)=><article key={i} className="transportcard"><div><Bus/><span>{t.type}</span></div><h3>{t.route}</h3><p><b>Tarifa:</b> {t.fare}</p><div className="times">{Array.isArray(t.times)?t.times.map((x,j)=><small key={j}>{formatTime12(x)}</small>):<small>{formatTime12(t.times)}</small>}</div><p>{t.note}</p></article>)}</div><div className="contacts"><h2>Tarifas rápidas de referencia</h2><div><article><b>Ferry San Jorge ↔ Ometepe</b><p>Pasajero: C$50. Vehículos sujetos a modelo y disponibilidad.</p></article><article><b>Bus público isla</b><p>Moyogalpa ↔ Altagracia: C$22. Altagracia ↔ Balgüe: C$22. Altagracia ↔ Mérida: C$35.</p></article><article><b>Taxi aproximado</b><p>Moyogalpa ↔ Altagracia: $30. Moyogalpa ↔ Mérida/Balgüe: $45.</p></article><article><b>Nota importante</b><p>No hay transporte público los domingos dentro de la isla.</p></article></div></div></section>}
function TourGuideCard({guide}){
  if(!guide)return <article className="ro-tg-card ro-tg-empty"><div className="ro-tg-photo ro-tg-photo-empty"><Users size={26}/></div><b>Cupo disponible</b><p>Aún no hay un guía asignado aquí. Muy pronto sumaremos más guías turísticos locales.</p></article>;
  return <article className="ro-tg-card">
    <div className="ro-tg-photo">{guide.photo?<img src={guide.photo} alt={guide.name}/>:<Users size={26}/>}</div>
    <b>{guide.name}</b>
    {guide.specialty&&<span className="ro-tg-specialty">{guide.specialty}</span>}
    {guide.languages&&<small className="ro-tg-lang">Idiomas: {guide.languages}</small>}
    {guide.bio&&<p>{guide.bio}</p>}
    {guide.whatsapp&&<a className="btn small ghost" href={`https://wa.me/${guide.whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer">Escribir por WhatsApp</a>}
  </article>;
}
function Guides({go}){useLiveReady();setSeo('Guías de viaje para Ometepe | Reserva Ometepe','Guías para viajar a Ometepe según tu estilo: pareja, aventura, familia, fotografía, relax y cultura.');const slots=Math.max(DATA.tourGuides.length,4);return <section className="page white"><div className="head"><p className="eyebrow">Guías de viaje</p><h1>Elige tu forma de vivir Ometepe</h1><p>Rutas e ideas para planificar mejor tu visita según el tipo de experiencia que buscas.</p></div><div className="guidegrid">{DATA.guides.map(g=><article key={g.slug}><span>{g.type}</span><h3>{g.title}</h3><p>{g.desc}</p><button className="btn small" onClick={()=>go('/guia/'+g.slug)}>Ver guía</button></article>)}</div><div className="hotel-section"><h2>Guías turísticos</h2><p className="mini" style={{marginBottom:'22px'}}>Guías locales certificados que pueden acompañarte en tus recorridos por la isla.</p><div className="ro-tg-grid">{Array.from({length:slots}).map((_,i)=><TourGuideCard key={i} guide={DATA.tourGuides[i]}/>)}</div></div><Planner/><TourGuideStyle/></section>}
function TourGuideStyle(){return <style>{`
.ro-tg-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.ro-tg-card{background:#fff;border:1px solid var(--line);border-radius:24px;padding:22px;box-shadow:0 12px 36px rgba(0,0,0,.06);text-align:center;display:flex;flex-direction:column;align-items:center}
.ro-tg-photo{width:84px;height:84px;border-radius:50%;overflow:hidden;background:var(--green);color:#fff;display:flex;align-items:center;justify-content:center;margin-bottom:14px}
.ro-tg-photo img{width:100%;height:100%;object-fit:cover}
.ro-tg-card b{font-size:1.1rem;margin-bottom:4px}
.ro-tg-specialty{color:var(--red);font-weight:900;text-transform:uppercase;letter-spacing:.06em;font-size:.72rem;margin-bottom:6px}
.ro-tg-lang{color:var(--muted);font-size:.82rem;margin-bottom:8px}
.ro-tg-card p{color:var(--muted);font-size:.88rem;line-height:1.5;margin:0 0 12px}
.ro-tg-empty{border-style:dashed;background:#fafaf8}
.ro-tg-photo-empty{background:#e7e7e2;color:#9aa39d}
.ro-tg-empty b{color:var(--muted)}
@media(max-width:980px){.ro-tg-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.ro-tg-grid{grid-template-columns:1fr}}
`}</style>}
function DestinationsPreview({go}){return <section className="section white"><div className="head"><p className="eyebrow">Destinos</p><h2>Lugares para descubrir en Ometepe</h2><p>Playas, reservas naturales, miradores, pueblos y puntos históricos para organizar tu recorrido.</p></div><div className="eventgrid">{DATA.destinations.slice(0,3).map(d=><article key={d.slug} onClick={()=>go('/destino/'+d.slug)}><Compass/><span>{d.type}</span><h3>{d.name}</h3><p>{d.desc}</p></article>)}</div></section>}
function Destinations({go}){useLiveReady();setSeo('Destinos en Ometepe | Reserva Ometepe','Explora destinos en Ometepe como Punta Jesús María, Ojo de Agua, Charco Verde y Playa Santo Domingo.');return <section className="page white"><div className="head"><p className="eyebrow">Destinos en Ometepe</p><h1>Lugares que vale la pena visitar</h1><p>Una selección inicial de puntos naturales, playas y reservas para planificar tu ruta por la isla.</p></div><div className="eventgrid">{DATA.destinations.map(d=><article key={d.slug} onClick={()=>{trackEvent('ViewDestination',{slug:d.slug});go('/destino/'+d.slug)}}><Compass/><span>{d.type}</span><h3>{d.name}</h3><p>{d.desc}</p></article>)}</div></section>}
function Activities({go}){setSeo('Experiencias en Ometepe | Cocina, kayak, senderismo, museos y volcanes','Cotiza experiencias auténticas en Ometepe: cocinar comida nicaragüense, kayak, senderismo, danza nicaragüense, visitas a museos, escalar volcanes y recorrer mercados locales.');return <section className="page white"><div className="head"><p className="eyebrow">Experiencias en Ometepe</p><h1>Vive la isla desde su cultura, naturaleza y comunidad</h1><p>Más allá de encontrar dónde dormir, Reserva Ometepe te ayuda a descubrir actividades locales para convertir tu visita en una experiencia memorable. Cotiza según tus fechas, número de personas y tipo de viaje.</p></div><Experiences go={go}/></section>}
function ExperienceDetail({slug,go}){useLiveReady();const e=DATA.experiences.find(x=>x.slug===slug)||DATA.experiences[0];const Icon=e.icon;setSeo(`${e.name} en Ometepe | Reserva Ometepe`,`${e.desc} Cotiza esta experiencia local en Isla de Ometepe según fecha, número de personas y disponibilidad.`);return <section className="page white"><div className="head"><p className="eyebrow">Experiencia local</p><h1>{e.name}</h1><p>{e.desc}</p></div><article className="detail experience-detail"><div className="experience-icon"><ExperienceImg src={e.img} Icon={Icon}/><span className="ro-exp-badge large"><Icon size={22}/></span></div><div><span className="eyebrow">{e.type}</span><h2>Una experiencia para vivir Ometepe de forma auténtica</h2><p>Esta actividad se coordina con aliados locales. No mostramos precio fijo porque puede variar según la fecha, cantidad de personas, duración, transporte requerido y disponibilidad.</p><div className="tags"><small>{e.duration}</small><small>{e.ideal}</small><small>Cotización personalizada</small></div><button onClick={()=>go('/reservar?experience='+e.slug)} className="btn">Cotizar experiencia</button></div></article><section className="hotel-section"><h2>Antes de cotizar</h2><div className="policygrid"><article><b>Qué indicar</b><p>Fecha deseada, número de personas, horario preferido y si necesitas transporte.</p></article><article><b>Confirmación</b><p>Reserva Ometepe revisará disponibilidad con el aliado local y te enviará una propuesta por correo y WhatsApp.</p></article><article><b>Recomendación</b><p>Solicita con anticipación, especialmente en temporada alta o si viajas en grupo.</p></article><article><b>Precio</b><p>La tarifa final se confirma en la propuesta. No hay precio público fijo en esta etapa.</p></article></div></section></section>}
function SouvenirSoon(){return <section className="souvenir"><div><p className="eyebrow">Próximamente</p><h2>Tienda de souvenirs de Ometepe</h2><p>Estamos preparando un espacio para descubrir recuerdos elaborados por artesanos locales: café, cacao, miel, cerámica, textiles, piezas inspiradas en petroglifos y productos con identidad de la isla.</p></div><button className="btn soon" disabled>Próximamente</button></section>}

function Events({go}){useLiveReady();setSeo('Eventos y promociones en Ometepe | Reserva Ometepe','Eventos culturales, promociones de hoteles, restaurantes, tours y experiencias locales en Isla de Ometepe.');return <section className="page white"><div className="head"><p className="eyebrow">Eventos y promociones</p><h1>Temporadas, ofertas y experiencias locales</h1><p>Encuentra actividades culturales, promociones de hospedaje y propuestas de negocios aliados en la isla.</p></div><div className="expgrid">{DATA.events.map(e=><article key={e.slug} className="ro-exp-card" onClick={()=>{trackEvent('ViewEvent',{slug:e.slug});go('/evento/'+e.slug)}} style={{cursor:'pointer'}}><div className="ro-exp-media"><ExperienceImg src={e.img} Icon={CalendarDays}/></div><div className="ro-exp-body"><span>{e.date}</span><b>{e.title}</b><p>{e.desc}</p>{e.location&&<small className="mini"><MapPin size={13}/> {e.location}</small>}</div></article>)}</div><SubscribePrompt section="eventos" title="Recibe eventos y promociones" text="Te avisamos sobre actividades culturales, temporadas y promociones de negocios locales."/></section>}
function EventDetail({slug,go}){useLiveReady();const e=DATA.events.find(x=>x.slug===slug)||DATA.events[0];setSeo(`${e.title} | Reserva Ometepe`,e.desc);return <section className="page white"><div className="head"><p className="eyebrow">{e.type}</p><h1>{e.title}</h1><p>{e.desc}</p></div><article className="article">{e.img&&<img src={e.img} alt={e.title} style={{width:'100%',maxHeight:'420px',objectFit:'cover',borderRadius:'28px',marginBottom:'24px'}}/>}<div className="tags">{e.date&&<small><CalendarDays size={13}/> {e.date}{e.endsAt?` – ${e.endsAt}`:''}</small>}{e.location&&<small><MapPin size={13}/> {e.location}</small>}</div>{e.desc&&<p>{e.desc}</p>}<button onClick={()=>go('/contacto')} className="btn" style={{marginTop:'12px'}}>Más información</button></article></section>}
function Blog({go}){useLiveReady();setSeo('Blog de viaje Ometepe | Reserva Ometepe','Artículos y consejos para viajar a Ometepe: cómo llegar, dónde hospedarse, transporte, actividades y recomendaciones locales.');return <section className="page white"><div className="head"><p className="eyebrow">Blog de viaje</p><h1>Consejos para planificar tu visita</h1><p>Guías prácticas para llegar, moverte, hospedarte y aprovechar mejor tu estadía en Isla de Ometepe.</p></div><div className="expgrid">{DATA.posts.map(p=><article key={p.slug} className="ro-exp-card" onClick={()=>go('/blog/'+p.slug)} style={{cursor:'pointer'}}><div className="ro-exp-media"><ExperienceImg src={p.img} Icon={Newspaper}/></div><div className="ro-exp-body"><span>{p.cat}</span><b>{p.title}</b><p>{p.desc}</p></div></article>)}</div></section>}
function Post({slug}){useLiveReady();const p=DATA.posts.find(x=>x.slug===slug)||DATA.posts[0];setSeo(`${p.title} | Reserva Ometepe`,p.desc);return <section className="page white"><div className="head"><p className="eyebrow">{p.cat}{(p.author||p.readingMinutes)&&<span className="ro-post-meta">{p.author?` · ${p.author}`:''}{p.readingMinutes?` · ${p.readingMinutes} min de lectura`:''}</span>}</p><h1>{p.title}</h1><p>{p.desc}</p></div><article className="article">{p.img&&<img src={p.img} alt={p.title} style={{width:'100%',maxHeight:'440px',objectFit:'cover',borderRadius:'28px',marginBottom:'26px'}}/>}{p.body?<div dangerouslySetInnerHTML={{__html:p.body}}/>:<p>Este artículo todavía no tiene contenido cargado. Muy pronto agregaremos la guía completa.</p>}</article></section>}
function Planner(){return <section className="planner"><div><p className="eyebrow">Próximamente</p><h2>Asistente de viaje para Ometepe</h2><p>Planifica un itinerario según presupuesto, cantidad de personas, días disponibles y tipo de turismo: relax, aventura, pareja, familia, cultura o fotografía.</p></div><form><input placeholder="Cantidad de personas" aria-label="Cantidad de personas"/><input placeholder="Presupuesto estimado" aria-label="Presupuesto estimado"/><select aria-label="Tipo de viaje"><option>Tipo de viaje</option><option>Aventura</option><option>Relax</option><option>Familia</option><option>Pareja</option></select><button className="btn soon" type="button" disabled>Próximamente</button></form></section>}
function Gallery(){useLiveReady();const[i,setI]=useState(0),g=DATA.gallery[i];return <section className="gallery"><div className="head"><p className="eyebrow">Galería</p><h2>Ometepe en imágenes</h2><p>Fotografías y videos con crédito visible para reconocer a creadores, hoteles y aliados locales.</p></div><figure><img src={g.img} alt={g.place||'Ometepe'}/><small>{g.credit}</small><figcaption><b>{g.place}</b></figcaption><button className="prev" onClick={()=>setI((i+DATA.gallery.length-1)%DATA.gallery.length)}>‹</button><button className="nextbtn" onClick={()=>setI((i+1)%DATA.gallery.length)}>›</button></figure></section>}
function Newsletter({L}){const[name,setName]=useState('');const[email,setEmail]=useState('');const[sending,setSending]=useState(false);const[done,setDone]=useState(false);const[err,setErr]=useState(false);const save=async(e)=>{e.preventDefault();setSending(true);setErr(false);try{await subscribeNewsletter({name,email,interest:'newsletter_home',source:'home_newsletter'});trackEvent('newsletter_signup',{section:'home_footer'});setDone(true)}catch{setErr(true)}finally{setSending(false)}};if(done)return <section className="newsletter"><div><p className="eyebrow">Viaja informado</p><h2>{L.newsletter}</h2><p>¡Gracias! Ya estás suscrito, pronto recibirás novedades de Ometepe.</p></div></section>;return <section className="newsletter"><div><p className="eyebrow">Viaja informado</p><h2>{L.newsletter}</h2><p>Recibe guías, eventos, promociones y novedades útiles para planificar tu visita a la isla.</p>{err&&<p style={{color:'#ffb4b4',fontWeight:900}}>No pudimos guardar tu correo. Intenta de nuevo.</p>}</div><form onSubmit={save}><input required placeholder={L.name} value={name} onChange={e=>setName(e.target.value)}/><input required type="email" placeholder={L.email} value={email} onChange={e=>setEmail(e.target.value)}/><button disabled={sending}>{sending?'Enviando…':L.send}</button></form></section>}
const BUSINESS_TYPES=['Hotel','Restaurante','Tour o experiencia','Transporte','Guía turístico','Otro'];
function ContactFormCard({kind,Icon,title,desc}){
  const isAlliance=kind==='alianza';
  const[f,setF]=useState({name:'',email:'',phone:'',businessType:BUSINESS_TYPES[0],message:''});
  const[sending,setSending]=useState(false);
  const[sent,setSent]=useState(false);
  const[err,setErr]=useState(false);
  const up=(k,v)=>setF(prev=>({...prev,[k]:v}));
  async function submit(e){
    e.preventDefault();
    setSending(true);setErr(false);
    try{
      await sendContactMessage({type:kind,name:f.name,email:f.email,phone:isAlliance?f.phone:null,businessType:isAlliance?f.businessType:null,message:f.message});
      trackEvent('contact_form_submitted',{kind});
      setSent(true);
    }catch{setErr(true)}finally{setSending(false)}
  }
  if(sent)return <article className="ro-contact-card ro-contact-done"><Icon/><b>{title}</b><p>¡Gracias! Recibimos tu mensaje, te responderemos pronto{isAlliance?' para conversar sobre la alianza.':'.'}</p></article>;
  return <article className="ro-contact-card">
    <Icon/><b>{title}</b><p>{desc}</p>
    <form onSubmit={submit} className="ro-contact-form">
      <input required placeholder={isAlliance?'Nombre del negocio':'Tu nombre'} value={f.name} onChange={e=>up('name',e.target.value)}/>
      <input required type="email" placeholder="Correo electrónico" value={f.email} onChange={e=>up('email',e.target.value)}/>
      {isAlliance&&<input required placeholder="WhatsApp o teléfono" value={f.phone} onChange={e=>up('phone',e.target.value)}/>}
      {isAlliance&&<select value={f.businessType} onChange={e=>up('businessType',e.target.value)}>{BUSINESS_TYPES.map(t=><option key={t}>{t}</option>)}</select>}
      <textarea required placeholder={isAlliance?'Cuéntanos sobre tu negocio: qué ofreces, ubicación y cómo te gustaría aparecer en Reserva Ometepe':'Cuéntanos en qué podemos ayudarte'} value={f.message} onChange={e=>up('message',e.target.value)}></textarea>
      {err&&<small className="ro-contact-error">No pudimos enviar tu mensaje. Intenta de nuevo.</small>}
      <button className="btn" disabled={sending} type="submit">{sending?'Enviando…':'Enviar mensaje'}</button>
    </form>
  </article>;
}
function Contact(){setSeo('Contacto Reserva Ometepe | Alianzas y soporte','Contacta a Reserva Ometepe para alianzas con hoteles, restaurantes, tours y soporte a viajeros.');return <section className="page white"><div className="head"><p className="eyebrow">Contacto</p><h1>Alianzas, soporte y comunicación</h1><p>Reserva Ometepe conecta viajeros con información turística, hospedajes, transporte y experiencias locales.</p></div><div className="ro-contact-grid"><ContactFormCard kind="alianza" Icon={Mail} title="Alianzas" desc="¿Tienes un hotel, restaurante, tour o servicio de transporte en Ometepe? Cuéntanos y evaluamos publicarte en la plataforma."/><ContactFormCard kind="soporte" Icon={ShieldCheck} title="Soporte" desc="¿Tienes una consulta o un caso relacionado con una reserva o solicitud? Escríbenos y te ayudamos."/></div><ContactFormStyle/></section>}
function ContactFormStyle(){return <style>{`
.ro-contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start}
.ro-contact-card{background:#fff;border:1px solid var(--line);border-radius:28px;padding:26px;box-shadow:var(--shadow)}
.ro-contact-card svg{color:var(--red);width:32px;height:32px}
.ro-contact-card b{display:block;font-size:1.35rem;margin:12px 0 6px}
.ro-contact-card>p{color:var(--muted);line-height:1.6;margin:0 0 18px}
.ro-contact-form{display:grid;gap:12px}
.ro-contact-form input,.ro-contact-form select,.ro-contact-form textarea{border:1px solid var(--line);border-radius:16px;padding:13px 14px;font:inherit;background:#fff}
.ro-contact-form textarea{min-height:120px;resize:vertical}
.ro-contact-error{color:var(--red);font-weight:700}
.ro-contact-done{text-align:center}
.ro-contact-done svg{color:var(--green)}
@media(max-width:900px){.ro-contact-grid{grid-template-columns:1fr}}
`}</style>}
const TRIP_STATUS={received:'Recibida',reviewing:'En revisión',available:'Disponible',proposal_sent:'Propuesta enviada',accepted:'Propuesta aceptada',payment_pending:'Pago pendiente',payment_submitted:'Comprobante enviado',payment_confirmed:'Pago confirmado',confirmed:'Confirmada',completed:'Completada',cancelled:'Cancelada',not_available:'Sin disponibilidad'};
const TRIP_TYPE={accommodation:'Alojamiento',experience:'Experiencia',motorcycle:'Moto',transport:'Transporte',event:'Evento',general:'Solicitud'};
function GuestLogin({session,go}){
  const[email,setEmail]=useState('');const[sending,setSending]=useState(false);const[sent,setSent]=useState(false);const[err,setErr]=useState('');
  setSeo('Iniciar sesión | Reserva Ometepe','Accede a tus solicitudes y reservas mediante un enlace seguro enviado a tu correo.');
  useEffect(()=>{if(session)go('/mis-viajes')},[session]);
  async function submit(e){e.preventDefault();setSending(true);setErr('');try{await sendGuestMagicLink(email);setSent(true);trackEvent('guest_magic_link_requested')}catch(error){setErr(error?.message||'No pudimos enviar el enlace. Intenta nuevamente.')}finally{setSending(false)}}
  return <section className="page white guest-page"><div className="guest-auth-card"><div className="guest-auth-icon"><Mail/></div><p className="eyebrow">Acceso para viajeros</p><h1>Consulta tus viajes sin contraseña</h1><p>Escribe el mismo correo que utilizaste al solicitar. Te enviaremos un enlace seguro para entrar a tus solicitudes y reservas.</p>{sent?<div className="guest-success"><CheckCircle2/><div><b>Revisa tu correo</b><span>Enviamos un enlace de acceso a {email}. También revisa la carpeta de spam.</span></div></div>:<form onSubmit={submit}><label>Correo electrónico<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@correo.com"/></label>{err&&<p className="guest-error">{err}</p>}<button className="btn" disabled={sending}>{sending?'Enviando…':'Enviarme enlace de acceso'}</button></form>}<small>No necesitas crear ni recordar una contraseña.</small></div><GuestAreaStyle/></section>
}
function MyTrips({session,authReady,go}){
  const[trips,setTrips]=useState([]);const[loading,setLoading]=useState(true);const[err,setErr]=useState('');
  setSeo('Mis viajes | Reserva Ometepe','Consulta el estado de tus solicitudes y reservas en Reserva Ometepe.');
  useEffect(()=>{if(!authReady)return;if(!session){setLoading(false);return}setLoading(true);fetchMyTrips().then(setTrips).catch(e=>setErr(e?.message||'No pudimos cargar tus viajes.')).finally(()=>setLoading(false))},[session,authReady]);
  if(!authReady||loading)return <section className="page white guest-page"><div className="guest-empty"><span className="skeleton-line"></span><span className="skeleton-line short"></span></div><GuestAreaStyle/></section>;
  if(!session)return <section className="page white guest-page"><div className="guest-empty"><ShieldCheck size={38}/><h1>Accede para ver tus viajes</h1><p>Usa el correo con el que enviaste tu solicitud. No necesitas contraseña.</p><button className="btn" onClick={()=>go('/iniciar-sesion')}>Recibir enlace de acceso</button></div><GuestAreaStyle/></section>;
  async function logout(){await signOutGuest();go('/')}
  return <section className="page white guest-page"><div className="guest-header"><div><p className="eyebrow">Área del viajero</p><h1>Mis viajes</h1><p>{session.user.email}</p></div><button className="btn ghost" onClick={logout}>Cerrar sesión</button></div>{err&&<div className="guest-error-box">{err}</div>}{!err&&!trips.length?<div className="guest-empty"><CalendarDays size={38}/><h2>Aún no tienes solicitudes</h2><p>Cuando solicites un alojamiento, moto o experiencia, aparecerá aquí.</p><button className="btn" onClick={()=>go('/hoteles')}>Explorar alojamientos</button></div>:<div className="trip-list">{trips.map(t=><article className="trip-card" key={t.id}><div className="trip-card-top"><span className={'trip-status status-'+t.status}>{TRIP_STATUS[t.status]||t.status}</span><small>{new Date(t.created_at).toLocaleDateString('es-NI',{day:'numeric',month:'short',year:'numeric'})}</small></div><h2>{t.service_name||TRIP_TYPE[t.request_type]||'Solicitud'}</h2><b className="trip-code">{t.code}</b><div className="trip-details"><span><CalendarDays size={16}/>{t.arrival_date||t.requested_date||'Fecha por confirmar'}{t.departure_date?` → ${t.departure_date}`:''}</span><span><Users size={16}/>{Number(t.adults||1)+Number(t.children||0)} viajero(s)</span></div>{t.proposal&&Object.keys(t.proposal).length>0&&<div className="trip-notice"><CheckCircle2 size={17}/>Tienes información nueva en tu propuesta.</div>}<button className="trip-link" disabled>Chat y detalles · próximamente</button></article>)}</div>}<GuestAreaStyle/></section>
}
function GuestAreaStyle(){return <style>{`
.guest-access{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:40px;border:1px solid rgba(255,255,255,.22);background:rgba(255,255,255,.08);border-radius:999px;padding:9px 14px;font:inherit;font-size:.86rem;font-weight:800;line-height:1;white-space:nowrap;color:#fff;transition:background .2s ease,border-color .2s ease,transform .2s ease}
.guest-access:hover{background:rgba(255,255,255,.15);border-color:rgba(255,255,255,.38);transform:translateY(-1px)}
.guest-access:focus-visible{outline:3px solid rgba(255,255,255,.38);outline-offset:2px}
.guest-page{min-height:65vh}.guest-auth-card,.guest-empty{max-width:560px;margin:25px auto;background:#fff;border:1px solid var(--line);border-radius:24px;padding:30px;box-shadow:0 14px 40px rgba(20,40,35,.08)}
.guest-auth-card{text-align:center}.guest-auth-card h1{font-size:clamp(1.8rem,4vw,2.6rem);margin:8px 0 12px}.guest-auth-card>p{color:var(--muted)}.guest-auth-icon{width:54px;height:54px;margin:0 auto 12px;border-radius:18px;background:#e9f7ef;color:var(--green);display:grid;place-items:center}.guest-auth-card form{display:grid;gap:12px;margin:24px 0 15px;text-align:left}.guest-auth-card label{font-weight:800;font-size:.88rem}.guest-auth-card input{width:100%;margin-top:7px;padding:13px 14px;border:1px solid var(--line);border-radius:12px;font:inherit}.guest-auth-card .btn{width:100%}.guest-success{display:flex;gap:12px;text-align:left;background:#eaf8ef;color:#17613c;border-radius:16px;padding:16px;margin:22px 0}.guest-success b,.guest-success span{display:block}.guest-success span{margin-top:4px;font-size:.9rem}.guest-error{color:#a11!important;font-weight:700}.guest-header{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:25px}.guest-header h1{margin:2px 0}.guest-header p{margin:0;color:var(--muted)}.trip-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.trip-card{padding:22px;border:1px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 8px 24px rgba(20,40,35,.06)}.trip-card-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.trip-status{padding:6px 9px;border-radius:999px;background:#eef3f1;font-size:.76rem;font-weight:900}.status-confirmed,.status-payment_confirmed,.status-completed{background:#e7f7ed;color:#17613c}.status-cancelled,.status-not_available{background:#fff0ee;color:#9d2b1e}.status-proposal_sent,.status-available{background:#eaf1ff;color:#2454a6}.trip-card h2{margin:16px 0 5px;font-size:1.25rem}.trip-code{font-size:.82rem;color:var(--muted)}.trip-details{display:grid;gap:9px;margin:17px 0}.trip-details span{display:flex;gap:8px;align-items:center;font-size:.9rem}.trip-notice{display:flex;gap:8px;background:#f0f7ff;color:#2454a6;padding:10px;border-radius:10px;font-size:.86rem}.trip-link{border:0;background:none;color:var(--muted);font-weight:800;padding:12px 0 0}.guest-empty{text-align:center}.guest-empty svg{color:var(--green)}.guest-empty .btn{margin-top:8px}.guest-error-box{background:#fff0ee;color:#9d2b1e;padding:14px;border-radius:12px;margin-bottom:16px}.skeleton-line{display:block;height:20px;background:#edf1ef;border-radius:10px;margin:10px}.skeleton-line.short{width:55%}
@media(max-width:1050px){.guest-access{display:none}}@media(max-width:680px){.trip-list{grid-template-columns:1fr}.guest-header{align-items:flex-start;flex-direction:column}.guest-auth-card,.guest-empty{padding:22px}.guest-page{padding-top:24px}}
`}</style>}
const RESERVE_STEP_LABELS=['Servicio','Fechas y viajeros','Tus datos','Revisar y enviar'];
const RESERVE_TYPES=[{v:'General',l:'No estoy seguro / otra cosa'},{v:'Alojamiento',l:'Alojamiento'},{v:'Moto',l:'Moto o cuadraciclo'},{v:'Experiencia',l:'Experiencia o tour'}];
function reserveStepValid(step,f){
  if(step===0)return !!f.type;
  if(step===1){if(f.type==='Moto')return !!f.start_date&&!!f.end_date;return !!f.start_date&&Number(f.adults)>=1}
  if(step===2)return !!(f.traveler_name&&f.traveler_email&&f.traveler_whatsapp);
  return true;
}
function ReservePage({session,go}){
  const defaults=getRequestDefaults();
  const locked=defaults.type!=='General';
  const matchedHotel=defaults.type==='Alojamiento'?DATA.hotels.find(x=>x.slug===defaults.slug):null;
  const matchedMoto=defaults.type==='Moto'?DATA.motos.find(x=>x.slug===defaults.slug):null;
  const matchedExp=defaults.type==='Experiencia'?DATA.experiences.find(x=>x.slug===defaults.slug):null;
  const [step,setStep]=useState(0);
  const [sent,setSent]=useState(false);
  const [sentCode,setSentCode]=useState('');
  const [accessSent,setAccessSent]=useState(false);
  const [sending,setSending]=useState(false);
  const [f,setF]=useState({type:defaults.type,start_date:defaults.checkin||'',end_date:defaults.checkout||'',adults:defaults.adults||'1',children:'0',traveler_name:'',traveler_email:'',traveler_whatsapp:'',country:'',notes:'',room_preference:'',time_preference:'',has_license:false});
  const isExp=f.type==='Experiencia';
  const isMoto=f.type==='Moto';
  const isHotel=f.type==='Alojamiento';
  const up=(k,v)=>setF(prev=>({...prev,[k]:v}));
  setSeo(isExp?'Cotizar experiencia en Ometepe | Reserva Ometepe':'Solicitar disponibilidad en Ometepe | Reserva Ometepe',isExp?'Cotiza experiencias locales en Ometepe con fecha, número de personas, correo y WhatsApp.':'Envía una solicitud de disponibilidad para alojamientos, motos o experiencias en Ometepe con correo, WhatsApp, fechas y número de personas.');
  async function submit(){
    setSending(true);
    const extraLines=[
      isHotel&&f.room_preference?`Habitación preferida: ${f.room_preference}`:null,
      isMoto?`Días de renta: ${f.start_date&&f.end_date?Math.max(1,Math.round((new Date(f.end_date)-new Date(f.start_date))/864e5)):'-'}`:null,
      isMoto?`Cuenta con licencia de conducir: ${f.has_license?'Sí':'No confirmado'}`:null,
      isExp&&f.time_preference?`Horario preferido: ${f.time_preference}`:null,
    ].filter(Boolean);
    const finalNotes=[f.notes,...extraLines].filter(Boolean).join(' | ');
    const payload={service_type:f.type,service_label:locked?defaults.label:(RESERVE_TYPES.find(t=>t.v===f.type)?.l||f.type),service_slug:defaults.slug||'',traveler_name:f.traveler_name,traveler_email:f.traveler_email,traveler_whatsapp:f.traveler_whatsapp,country:f.country,start_date:f.start_date,end_date:f.end_date,adults:f.adults,children:f.children,notes:finalNotes};
    try{
      const result=await createServiceRequest(payload);
      await recordFunnelStep(isExp?'experience_quote_submitted':'availability_request_submitted',payload);
      setSentCode(result?.data?.code||'');
      if(!session){
        try{await sendGuestMagicLink(f.traveler_email);setAccessSent(true);trackEvent('guest_access_sent_after_request')}catch(error){console.warn('[Reserva Ometepe] No se pudo enviar acceso a Mis viajes:',error?.message||error)}
      }
      setSent(true);
    }catch(err){
      alert('No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.');
    }finally{setSending(false)}
  }
  if(sent)return <section className="page white"><div className="ro-wizard-done"><CheckCircle2 size={48}/><h1>Solicitud enviada</h1>{sentCode&&<b className="request-code">{sentCode}</b>}<p>Recibimos tu solicitud. Revisaremos disponibilidad y te contactaremos por correo y WhatsApp con una propuesta.</p>{!session&&accessSent&&<p className="access-note"><Mail size={17}/>También enviamos a <b>{f.traveler_email}</b> un enlace seguro para consultar el estado en Mis viajes.</p>}{!session&&!accessSent&&<button className="btn ghost" onClick={()=>go('/iniciar-sesion')}>Acceder a Mis viajes</button>}<button className="btn" onClick={()=>go(session?'/mis-viajes':'/')}>{session?'Ver mis viajes':'Volver al inicio'}</button></div><ReserveWizardStyle/></section>;
  return <section className="page white ro-wizard-page">
    <div className="head"><p className="eyebrow">{isExp?'Cotización de experiencia':'Solicitud de disponibilidad'}</p><h1>{isExp?'Cotiza una experiencia local en Ometepe':'Solicita una propuesta para tu viaje a Ometepe'}</h1></div>
    <div className="ro-wizard">
      <div className="ro-wizard-progress">{RESERVE_STEP_LABELS.map((l,i)=><div key={l} className={'ro-wizard-dot'+(i===step?' active':'')+(i<step?' done':'')}><span>{i<step?<Check size={14}/>:i+1}</span><small>{l}</small></div>)}</div>
      <div className="ro-wizard-body">
        {step===0&&<div className="ro-wizard-step">
          <h3>¿Qué estás buscando?</h3>
          {locked?<div className="ro-wizard-locked">
            {(matchedHotel||matchedMoto)&&<img className="ro-wizard-locked-img" src={(matchedHotel||matchedMoto).img} alt=""/>}
            <div><b>{defaults.label}</b>
              {matchedHotel&&<span>{matchedHotel.zone} · {matchedHotel.type} · desde ${matchedHotel.price}/noche</span>}
              {matchedMoto&&<span>{matchedMoto.type} · desde ${matchedMoto.price}/día</span>}
              {matchedExp&&<span>{matchedExp.duration}{matchedExp.ideal?` · ${matchedExp.ideal}`:''}</span>}
              {!matchedHotel&&!matchedMoto&&!matchedExp&&<span>Detectamos el servicio desde la página que visitaste</span>}
            </div>
          </div>:
          <div className="ro-wizard-choices">{RESERVE_TYPES.map(t=><button type="button" key={t.v} className={'ro-choice'+(f.type===t.v?' active':'')} onClick={()=>up('type',t.v)}>{t.l}</button>)}</div>}
        </div>}
        {step===1&&<div className="ro-wizard-step">
          <h3>{isMoto?'Fechas de renta':'Fechas y viajeros'}</h3>
          <div className="formrow"><label>{isMoto?'Fecha de inicio':'Fecha de llegada'}<input required type="date" value={f.start_date} onChange={e=>up('start_date',e.target.value)}/></label><label>{isMoto?'Fecha de devolución':'Fecha de salida (opcional)'}<input required={isMoto} type="date" value={f.end_date} onChange={e=>up('end_date',e.target.value)}/></label></div>
          {!isMoto&&<div className="formrow"><label>Adultos<input required type="number" min="1" value={f.adults} onChange={e=>up('adults',e.target.value)}/></label><label>Niños<input type="number" min="0" value={f.children} onChange={e=>up('children',e.target.value)}/></label></div>}
          {isHotel&&matchedHotel&&matchedHotel.rooms&&matchedHotel.rooms.length>0&&<label className="ro-wizard-field">Habitación de tu interés (opcional)<select value={f.room_preference} onChange={e=>up('room_preference',e.target.value)}><option value="">Cualquiera / no estoy seguro</option>{matchedHotel.rooms.map(r=><option key={r.name} value={r.name}>{r.name} · hasta {r.capacity} personas</option>)}</select></label>}
          {isMoto&&<label className="ro-wizard-check"><input type="checkbox" checked={f.has_license} onChange={e=>up('has_license',e.target.checked)}/> Cuento con licencia de conducir válida</label>}
          {isExp&&<label className="ro-wizard-field">Horario preferido<select value={f.time_preference} onChange={e=>up('time_preference',e.target.value)}><option value="">Sin preferencia</option><option>Mañana</option><option>Tarde</option><option>Cualquier horario</option></select></label>}
        </div>}
        {step===2&&<div className="ro-wizard-step">
          <h3>Tus datos de contacto</h3>
          <input required placeholder="Nombre completo" value={f.traveler_name} onChange={e=>up('traveler_name',e.target.value)}/>
          <input required type="email" placeholder="Correo electrónico" value={f.traveler_email} onChange={e=>up('traveler_email',e.target.value)}/>
          <input required placeholder="WhatsApp con código de país" value={f.traveler_whatsapp} onChange={e=>up('traveler_whatsapp',e.target.value)}/>
          <input placeholder="País de origen" value={f.country} onChange={e=>up('country',e.target.value)}/>
          <textarea placeholder={isExp?'Cuéntanos intereses, transporte o cualquier detalle para cotizar mejor':isMoto?'¿Necesitas casco extra, entrega en un punto específico u otra necesidad?':'Cuéntanos presupuesto o necesidad especial que tengas'} value={f.notes} onChange={e=>up('notes',e.target.value)}></textarea>
        </div>}
        {step===3&&<div className="ro-wizard-step">
          <h3>Revisa tu solicitud</h3>
          <div className="ro-wizard-summary">
            <div><span>Servicio</span><b>{locked?defaults.label:(RESERVE_TYPES.find(t=>t.v===f.type)?.l||f.type)}</b></div>
            <div><span>Fechas</span><b>{f.start_date||'—'}{f.end_date?` → ${f.end_date}`:''}</b></div>
            {!isMoto&&<div><span>Viajeros</span><b>{f.adults} adulto(s){Number(f.children)>0?`, ${f.children} niño(s)`:''}</b></div>}
            {isHotel&&f.room_preference&&<div><span>Habitación</span><b>{f.room_preference}</b></div>}
            {isMoto&&<div><span>Licencia</span><b>{f.has_license?'Confirmada':'No confirmada'}</b></div>}
            {isExp&&f.time_preference&&<div><span>Horario</span><b>{f.time_preference}</b></div>}
            <div><span>Nombre</span><b>{f.traveler_name}</b></div>
            <div><span>Correo</span><b>{f.traveler_email}</b></div>
            <div><span>WhatsApp</span><b>{f.traveler_whatsapp}</b></div>
            {f.country&&<div><span>País</span><b>{f.country}</b></div>}
            {f.notes&&<div><span>Notas</span><b>{f.notes}</b></div>}
          </div>
          <p className="formnote">{isExp?'La cotización no confirma una reserva. Primero validamos disponibilidad y condiciones con el aliado local.':'La solicitud no confirma una reserva. Primero validamos disponibilidad, luego recibirás una propuesta. Si aceptas, el pago se realiza por transferencia directa al alojamiento según su política.'}</p>
        </div>}
      </div>
      <div className="ro-wizard-nav">
        {step>0?<button type="button" className="btn ghost" onClick={()=>setStep(s=>s-1)}>Atrás</button>:<span/>}
        {step<3?<button type="button" className="btn" disabled={!reserveStepValid(step,f)} onClick={()=>setStep(s=>s+1)}>Siguiente</button>:<button type="button" className="btn" disabled={sending} onClick={submit}>{sending?'Enviando…':(isExp?'Enviar solicitud de cotización':'Enviar solicitud')}</button>}
      </div>
    </div>
    <ReserveWizardStyle/>
  </section>;
}
function ReserveWizardStyle(){return <style>{`
.ro-wizard{max-width:640px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);padding:28px;border:1px solid #eef1f5}
.ro-wizard-progress{display:flex;justify-content:space-between;margin-bottom:28px;gap:6px}
.ro-wizard-dot{display:flex;flex-direction:column;align-items:center;gap:6px;flex:1;text-align:center}
.ro-wizard-dot span{width:28px;height:28px;border-radius:50%;background:#eef1f5;color:#7a869a;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600}
.ro-wizard-dot.active span{background:#2563eb;color:#fff}
.ro-wizard-dot.done span{background:#16a34a;color:#fff}
.ro-wizard-dot small{font-size:11px;color:#7a869a}
.ro-wizard-dot.active small{color:#2563eb;font-weight:600}
.ro-wizard-step h3{margin:0 0 16px;font-size:18px}
.ro-wizard-step input,.ro-wizard-step textarea,.ro-wizard-step label{width:100%}
.ro-wizard-step label{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#556}
.ro-wizard-step input,.ro-wizard-step textarea{padding:11px 13px;border:1px solid #dfe3ea;border-radius:10px;font-size:14px;margin-bottom:12px;font-family:inherit}
.ro-wizard-step textarea{min-height:90px;resize:vertical}
.ro-wizard-choices{display:flex;flex-direction:column;gap:10px}
.ro-choice{padding:14px 16px;border:1.5px solid #dfe3ea;border-radius:10px;background:#fff;text-align:left;font-size:14px;cursor:pointer;transition:.15s}
.ro-choice.active{border-color:#2563eb;background:#eff4ff;color:#2563eb;font-weight:600}
.ro-wizard-locked{padding:14px 16px;border-radius:10px;background:#eff4ff;border:1px solid #cfe0ff;display:flex;gap:12px;align-items:center}
.ro-wizard-locked-img{width:64px;height:64px;border-radius:8px;object-fit:cover;flex-shrink:0}
.ro-wizard-locked b{color:#1d4ed8;display:block}
.ro-wizard-locked span{font-size:12px;color:#5b7bc7}
.ro-wizard-field{display:flex;flex-direction:column;gap:6px;font-size:13px;color:#556;margin-top:4px}
.ro-wizard-field select{padding:11px 13px;border:1px solid #dfe3ea;border-radius:10px;font-size:14px;font-family:inherit}
.ro-wizard-check{display:flex;align-items:center;gap:8px;font-size:13.5px;color:#334;margin-top:6px;cursor:pointer}
.ro-wizard-check input{width:auto;margin:0}
.ro-wizard-summary{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
.ro-wizard-summary>div{display:flex;justify-content:space-between;border-bottom:1px dashed #eef1f5;padding-bottom:8px;gap:12px}
.ro-wizard-summary span{color:#7a869a;font-size:13px}
.ro-wizard-summary b{text-align:right;font-size:13px}
.ro-wizard-nav{display:flex;justify-content:space-between;margin-top:24px}
.ro-wizard-nav .btn.ghost{background:transparent;color:#556;border:1px solid #dfe3ea}
.ro-wizard-nav .btn:disabled{opacity:.5;cursor:not-allowed}
.ro-wizard-done{max-width:480px;margin:60px auto;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;color:#16a34a}
.ro-wizard-done h1{color:#1a1f2b;font-size:24px;margin:4px 0}
.ro-wizard-done p{color:#556}
.request-code{background:#eaf8ef;color:#17613c;padding:9px 13px;border-radius:999px;letter-spacing:.05em}.access-note{display:flex;align-items:flex-start;justify-content:center;gap:7px;background:#f0f7ff;padding:13px;border-radius:12px;max-width:460px}.access-note svg{flex:none;margin-top:2px}
.formrow{display:flex;gap:12px}
.formrow label{flex:1}
@media(max-width:560px){.ro-wizard{padding:18px}.ro-wizard-dot small{display:none}.formrow{flex-direction:column;gap:0}}
`}</style>}
function GenericDetail({kind,item}){useLiveReady();const it=item||DATA.destinations[0];setSeo(`${it.name} | Reserva Ometepe`,it.desc);return <section className="page white"><div className="head"><p className="eyebrow">{kind} en Ometepe</p><h1>{it.name}</h1><p>{it.desc}</p></div><article className="article">{it.img&&<img src={it.img} alt={it.name} style={{width:'100%',maxHeight:'420px',objectFit:'cover',borderRadius:'28px',marginBottom:'24px'}}/>}{it.body&&it.body!==it.desc?<p>{it.body}</p>:<p>Muy pronto agregaremos más detalles sobre este destino: ubicación, recomendaciones y negocios cercanos.</p>}</article></section>}
function GuideDetail({slug,go}){useLiveReady();const g=DATA.guides.find(x=>x.slug===slug)||DATA.guides[0];setSeo(`${g.title} | Reserva Ometepe`,g.desc);return <section className="page white"><div className="head"><p className="eyebrow">Guía de viaje · {g.type}</p><h1>{g.title}</h1><p>{g.desc}</p></div><article className="article">{g.img&&<img src={g.img} alt={g.title} style={{width:'100%',maxHeight:'420px',objectFit:'cover',borderRadius:'28px',marginBottom:'24px'}}/>}{g.body?<p style={{whiteSpace:'pre-line'}}>{g.body}</p>:<p>Muy pronto ampliaremos esta guía con una ruta día a día, recomendaciones y negocios locales.</p>}<button onClick={()=>go('/reservar')} className="btn" style={{marginTop:'20px'}}>Solicitar disponibilidad</button></article></section>}
const LEGAL_CONTENT={privacy:{title:'Política de privacidad',intro:'Explicamos qué información recopilamos y cómo la usamos.',sections:[['Datos que recibimos','Cuando envías una solicitud podemos recibir tu nombre, correo, teléfono, fechas de viaje y preferencias. También registramos datos técnicos básicos para operar y proteger el sitio.'],['Cómo los usamos','Usamos estos datos para atender solicitudes, coordinar servicios con aliados, responder consultas, prevenir abuso y mejorar Reserva Ometepe.'],['Terceros y conservación','Compartimos únicamente los datos necesarios con proveedores involucrados en tu solicitud. Conservamos la información durante el tiempo necesario para gestionar el servicio y cumplir obligaciones legales.'],['Tus derechos','Puedes solicitar acceso, corrección o eliminación escribiendo a soporte@reservaometepe.com.']]},terms:{title:'Términos de uso y reserva',intro:'Condiciones básicas para usar Reserva Ometepe.',sections:[['Nuestro servicio','Reserva Ometepe conecta viajeros con alojamientos y prestadores locales. Una solicitud no constituye una reserva confirmada hasta recibir aceptación y condiciones finales.'],['Precios y pagos','Las tarifas, anticipos y métodos de pago se confirman en cada propuesta. Pueden variar por temporada, proveedor y características del servicio.'],['Cambios y cancelaciones','Las políticas aplicables se informan antes de confirmar. Los reembolsos dependen de la política aceptada y del proveedor correspondiente.'],['Responsabilidad','Cada prestador es responsable de ejecutar el servicio confirmado. Te ayudaremos a coordinar y resolver incidencias relacionadas con una solicitud.']]},cookies:{title:'Política de cookies',intro:'Usamos almacenamiento necesario y, solo con tu permiso, herramientas de medición.',sections:[['Necesarias','Guardamos preferencias como idioma y estado del consentimiento para que el sitio funcione correctamente.'],['Analíticas opcionales','Google Analytics, Meta Pixel y Microsoft Clarity solo se cargan si eliges “Aceptar analíticas”. Puedes rechazarlas y seguir usando todo el sitio.'],['Cambiar tu elección','Usa “Preferencias de cookies” en el pie de página para volver a decidir en cualquier momento.']]}};
function LegalPage({type}){const page=LEGAL_CONTENT[type]||LEGAL_CONTENT.privacy;setSeo(`${page.title} | Reserva Ometepe`,page.intro);return <section className="page white ro-legal"><div className="head"><p className="eyebrow">Información legal</p><h1>{page.title}</h1><p>{page.intro}</p><small>Última actualización: 7 de septiembre de 2026</small></div><article className="article">{page.sections.map(([title,text])=><section key={title}><h2>{title}</h2><p>{text}</p></section>)}</article></section>}
function CookieConsent(){const[choice,setChoice]=useState(()=>getAnalyticsConsent());const[open,setOpen]=useState(()=>!getAnalyticsConsent());useEffect(()=>{const show=()=>setOpen(true);window.addEventListener('ro:open-cookie-settings',show);return()=>window.removeEventListener('ro:open-cookie-settings',show)},[]);if(!open)return null;const choose=value=>{setAnalyticsConsent(value);setChoice(value);setOpen(false)};return <aside className="ro-cookie" role="dialog" aria-modal="true" aria-label="Preferencias de cookies"><div><b>Tu privacidad importa</b><p>Usamos almacenamiento necesario para que el sitio funcione. Las analíticas de Google, Meta y Microsoft solo se activan con tu permiso.</p>{choice&&<small>Preferencia actual: {choice==='accepted'?'analíticas aceptadas':'solo necesarias'}.</small>}</div><div className="ro-cookie-actions"><button className="btn ghost small" onClick={()=>choose('rejected')}>Solo necesarias</button><button className="btn small" onClick={()=>choose('accepted')}>Aceptar analíticas</button></div></aside>}
function Footer({L,go}){return <><footer><div><img className="footer-logo" src="/logo-white.png" alt="Reserva Ometepe"/><h3>Reserva Ometepe</h3><p>Guía local para planificar viajes a Isla de Ometepe: hoteles, barcos, transporte, actividades, eventos y experiencias.</p></div><div><b>Explorar</b><a href="/hoteles" onClick={e=>{e.preventDefault();go('/hoteles')}}>Alojamientos</a><a href="/horario-barcos" onClick={e=>{e.preventDefault();go('/horario-barcos')}}>Horario de barcos</a><a href="/destinos" onClick={e=>{e.preventDefault();go('/destinos')}}>Destinos</a><a href="/actividades" onClick={e=>{e.preventDefault();go('/actividades')}}>Actividades</a></div><div><b>Información</b><a href="/privacidad" onClick={e=>{e.preventDefault();go('/privacidad')}}>Privacidad</a><a href="/terminos" onClick={e=>{e.preventDefault();go('/terminos')}}>Términos y cancelaciones</a><a href="/cookies" onClick={e=>{e.preventDefault();go('/cookies')}}>Política de cookies</a><button className="ro-cookie-link" onClick={()=>window.dispatchEvent(new Event('ro:open-cookie-settings'))}>Preferencias de cookies</button></div><div><b>Contacto</b><a href="mailto:alianzas@reservaometepe.com">alianzas@reservaometepe.com</a><a href="mailto:soporte@reservaometepe.com">soporte@reservaometepe.com</a></div></footer><CookieConsent/></>}

createRoot(document.getElementById('root')).render(<App/>);
