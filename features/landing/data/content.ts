/* ───────────────────────────────────────────
   Landing Page — Hardcoded Content (Spanish)
   ─────────────────────────────────────────── */

// ─── Hero ───────────────────────────────────
export const heroContent = {
  badge: 'Phygital — aprendizaje que une lo físico con lo digital',
  title: 'Aprendizaje de palabras',
  titleHighlight: 'que cobra vida',
  subtitle:
    'Un kit físico + app inteligente que usa cámara, OCR y voz para que los niños aprendan palabras jugando. Sin internet, sin pantallas todo el día.',
  cta: 'Quiero saber más',
} as const;

// ─── Game Modes ─────────────────────────────
export interface GameMode {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export const gameModes: GameMode[] = [
  {
    icon: 'camera_alt',
    title: 'Cámara',
    description:
      'El niño apunta la cámara a un objeto y la app lo identifica mostrando la palabra escrita y su pronunciación.',
    color: 'primary',
  },
  {
    icon: 'document_scanner',
    title: 'OCR',
    description:
      'Escaneá tarjetas o etiquetas del kit físico. La app reconoce el texto y lo asocia con imágenes y sonidos.',
    color: 'secondary',
  },
  {
    icon: 'mic',
    title: 'Speech-to-Text',
    description:
      'El niño dice una palabra en voz alta y la app la reconoce, la escribe y la refuerza con actividades interactivas.',
    color: 'accent',
  },
];

// ─── How It Works ───────────────────────────
export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
}

export const howItWorks: HowItWorksStep[] = [
  {
    step: 1,
    title: 'Comprá el kit',
    description:
      'Adquirí el kit físico por S/ 75 (1er año incluye app). Incluye tarjetas, letras magnéticas y guía para padres.',
  },
  {
    step: 2,
    title: 'Descargá la app',
    description:
      'Escaneá el código QR del kit, descargá la app en cualquier tablet o celular y creá el perfil de tu hijo.',
  },
  {
    step: 3,
    title: 'Tu hijo aprende jugando',
    description:
      'Cámara, OCR y voz se combinan en juegos interactivos que refuerzan vocabulario sin necesidad de internet.',
  },
];

// ─── Pricing ────────────────────────────────
export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  title: string;
  price: string;
  description: string;
  features: PricingFeature[];
  highlighted?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    title: 'Plan Anual',
    price: 'S/ 75',
    description: 'Kit físico + app (1er año)',
    highlighted: true,
    features: [
      { text: 'Kit físico con tarjetas y letras', included: true },
      { text: 'App completa con todos los modos', included: true },
      { text: 'Actualizaciones gratuitas', included: true },
      { text: 'Soporte técnico prioritario', included: true },
      { text: 'Sin publicidad ni compras internas', included: true },
    ],
  },
  {
    title: 'Renovación',
    price: 'S/ 35',
    description: '/año a partir del 2do año',
    highlighted: false,
    features: [
      { text: 'Acceso continuo a la app', included: true },
      { text: 'Nuevos contenidos y palabras', included: true },
      { text: 'Actualizaciones gratuitas', included: true },
      { text: 'Soporte técnico estándar', included: true },
      { text: 'Sin publicidad ni compras internas', included: true },
    ],
  },
];

// ─── Comparison Table ───────────────────────
export interface ComparisonRow {
  criteria: string;
  alphaKids: boolean | string;
  khanAcademy: boolean | string;
  duolingoAbc: boolean | string;
}

export const comparisonRows: ComparisonRow[] = [
  {
    criteria: 'En español',
    alphaKids: true,
    khanAcademy: true,
    duolingoAbc: true,
  },
  {
    criteria: 'Kit físico',
    alphaKids: true,
    khanAcademy: false,
    duolingoAbc: false,
  },
  {
    criteria: 'IA adaptativa',
    alphaKids: true,
    khanAcademy: false,
    duolingoAbc: true,
  },
  {
    criteria: 'Panel para padres',
    alphaKids: true,
    khanAcademy: false,
    duolingoAbc: false,
  },
  {
    criteria: 'Sin internet',
    alphaKids: true,
    khanAcademy: false,
    duolingoAbc: false,
  },
  {
    criteria: 'Precio',
    alphaKids: 'S/ 75/año',
    khanAcademy: 'Gratis',
    duolingoAbc: 'Gratis',
  },
];

// ─── FAQ ────────────────────────────────────
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: '¿Qué edad tiene que tener mi hijo para usar AlphaKids?',
    answer:
      'AlphaKids está diseñado para niños de 3 a 6 años. Las actividades se adaptan automáticamente al nivel de cada niño, desde reconocimiento básico hasta formación de palabras completas.',
  },
  {
    question: '¿Necesito internet para usarlo?',
    answer:
      'No. Una vez descargada la app y los contenidos iniciales, AlphaKids funciona completamente sin conexión a internet. Ideal para usar en casa, en el auto o donde no hay señal.',
  },
  {
    question: '¿Qué incluye el kit físico?',
    answer:
      'El kit incluye tarjetas ilustradas con palabras y objetos, letras magnéticas, una guía para padres con actividades sugeridas y el código QR para descargar la app. Todo en una caja lista para usar.',
  },
  {
    question: '¿Cómo funciona el pago?',
    answer:
      'El primer año pagás S/ 75 que incluye el kit físico completo + la app. A partir del segundo año, la renovación es de solo S/ 35 por año. Sin cargos ocultos ni suscripciones mensuales.',
  },
  {
    question: '¿En qué dispositivos funciona?',
    answer:
      'AlphaKids funciona en cualquier celular o tablet con Android 8+ o iOS 14+. También podés usarlo en tablets educativas. La app se adapta al tamaño de la pantalla automáticamente.',
  },
  {
    question: '¿Cómo sé si mi hijo está aprendiendo?',
    answer:
      'La app incluye un panel para padres donde podés ver el progreso: palabras aprendidas, tiempo de uso, modos más utilizados y logros alcanzados. Recibí reportes semanales por correo.',
  },
];

// ─── Footer ─────────────────────────────────
export const footerContent = {
  brand: 'AlphaKids',
  tagline: 'Aprendizaje de palabras que cobra vida',
  social: {
    instagram: 'https://www.instagram.com/alphakids.aqp/',
    tiktok: 'https://www.tiktok.com/@alphakids.aqp',
    whatsapp: 'https://wa.me/51929725033',
    youtube: '#',
  },
} as const;
