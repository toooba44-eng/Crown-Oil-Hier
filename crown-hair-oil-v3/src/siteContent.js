export const CONTENT_API = 'https://asubcanztloxiddshakz.supabase.co/functions/v1/crown-admin-api/public/content'

export const DEFAULT_CONTENT = {
  seo: {
    title: 'Crown Hair Oil | Botanical Hair & Scalp Oil',
    description: 'Crown Hair Oil — روتين نباتي للعناية بالشعر وفروة الرأس بزيوت الأرغان والروزماري والزيتون.',
    socialImage: '/Crown-Oil-Hier/assets/hero-detail.jpg',
  },
  announcement: 'توصيل داخل المملكة العربية السعودية · الأسعار تشمل الضريبة',
  navigation: { product: 'المنتج', ingredients: 'المكونات', results: 'النتائج', ritual: 'طريقة الاستخدام', faq: 'الأسئلة الشائعة', cart: 'السلة' },
  hero: {
    eyebrow: 'BOTANICAL HAIR & SCALP OIL',
    titleLine1: 'العناية بشعرك',
    titleLine2: 'تبدأ من الجذور.',
    description: 'مزيج نباتي غني بزيت الأرغان والروزماري والزيتون، صُمم ليكون طقسًا بسيطًا للعناية بالشعر وفروة الرأس.',
    ratingText: 'تجربة Crown للعناية اليومية',
    primaryCta: 'تسوّقي الآن',
    secondaryCta: 'اكتشفي المكونات',
    micro: ['زيوت نباتية مختارة', 'لجميع أنواع الشعر', 'توصيل داخل المملكة'],
    image: '/Crown-Oil-Hier/assets/hero-light.jpg',
  },
  trust: ['BOTANICAL OILS', 'SCALP CARE', 'ALL HAIR TYPES', 'SAUDI DELIVERY'],
  why: {
    eyebrow: 'WHY CROWN', title: 'روتين أقل. عناية أكثر.',
    cards: [
      { number: '01', icon: '❧', title: 'تغذية', copy: 'زيوت مختارة لدعم مظهر الشعر الصحي ضمن روتين متوازن.' },
      { number: '02', icon: '◌', title: 'ترطيب', copy: 'يساعد على تقليل مظهر الجفاف ومنح الشعر ملمسًا أكثر نعومة.' },
      { number: '03', icon: '✦', title: 'لمعان', copy: 'لمسة نهائية تمنح الشعر مظهرًا حيويًا ولمعانًا طبيعيًا.' },
      { number: '04', icon: '⌇', title: 'فروة الرأس', copy: 'تدليك الزيت يحوّل العناية بفروة الرأس إلى طقس أسبوعي بسيط.' },
    ],
  },
  ingredients: {
    eyebrow: "WHAT'S INSIDE", titleLine1: 'ثلاثة مكونات.', titleLine2: 'فلسفة واحدة.',
    intro: 'قلب تركيبة Crown النباتية: مكونات مألوفة ضمن روتين عناية بسيط ومقصود.',
    items: [
      { name: 'الأرغان', copy: 'يساعد على منح الشعر ملمسًا أكثر نعومة ولمعانًا ضمن روتين العناية.', className: 'argan', image: '' },
      { name: 'الروزماري', copy: 'مكوّن نباتي مميز لطقس عناية متوازن بالشعر وفروة الرأس.', className: 'rosemary', image: '' },
      { name: 'زيت الزيتون', copy: 'غني وملائم للعناية بمظهر الشعر الجاف وتقليل الإحساس بالخشونة.', className: 'olive', image: '' },
    ],
  },
  product: {
    eyebrow: 'THE SIGNATURE OIL', name: 'Crown Hair Oil', size: '100 ml', price: 119,
    subline: 'Botanical Hair & Scalp Oil',
    description: 'زيت عناية نباتي للشعر وفروة الرأس يجمع الأرغان والروزماري والزيتون في خطوة واحدة سهلة ضمن روتينك.',
    priceNote: 'السعر يشمل الضريبة', addToCart: 'أضيفي للسلة', buyNow: 'اشتري الآن',
    trust: ['تجربة دفع آمنة عند التفعيل', 'توصيل داخل المملكة', 'سياسة استرجاع واضحة'],
    image: '/Crown-Oil-Hier/assets/hero-detail.jpg',
  },
  results: {
    eyebrow: 'CROWN COMMUNITY', title: 'من مجتمع Crown',
    intro: 'مجموعة من صور النتائج الموجودة في أرشيف Crown. تختلف النتائج من شخص لآخر.',
    caption: 'من أرشيف نتائج Crown · تختلف النتائج من شخص لآخر',
    images: [1,2,3,4,5].map(n => `/Crown-Oil-Hier/Hair after-before ${n}.jpg`),
  },
  ritual: {
    eyebrow: 'THE RITUAL', titleLine1: 'ثلاث خطوات', titleLine2: 'لروتين Crown.',
    intro: 'روتين بسيط صُمم ليدخل بسهولة في أسبوعك دون تعقيد.',
    steps: [
      { number: '01', title: 'قسّمي الشعر', copy: 'للوصول إلى فروة الرأس بسهولة.' },
      { number: '02', title: 'ضعي ودلّكي', copy: 'استخدمي كمية مناسبة ودلّكي فروة الرأس بلطف.' },
      { number: '03', title: 'أكملي روتينك', copy: 'وزّعي ما يلزم على الأطراف حسب احتياج شعرك.' },
    ],
  },
  commerce: [
    { eyebrow: 'DELIVERY', title: 'توصيل داخل المملكة', copy: 'تظهر تكلفة الشحن النهائية أثناء إتمام الطلب.', linkText: 'سياسة الشحن والاسترجاع ←', href: '/Crown-Oil-Hier/shipping-returns.html' },
    { eyebrow: 'PAYMENT', title: 'مدى · بطاقات · Apple Pay', copy: 'تُفعّل طرق الدفع بعد ربط بوابة الدفع الإنتاجية الآمنة.', linkText: 'تسوّقي المنتج ←', href: '#product' },
    { eyebrow: 'SUPPORT', title: 'نحن هنا للمساعدة', copy: 'للاستفسارات عن المنتج أو الطلبات، تواصلي عبر صفحة الدعم.', linkText: 'تواصلي معنا ←', href: '/Crown-Oil-Hier/contact.html' },
  ],
  faq: {
    eyebrow: 'FAQ', title: 'أسئلة شائعة',
    items: [
      { question: 'هل يناسب جميع أنواع الشعر؟', answer: 'صُمم Crown Hair Oil ليكون جزءًا من روتين العناية لمختلف أنواع الشعر. ابدئي بكمية صغيرة وعدّليها حسب احتياج شعرك.' },
      { question: 'كم مرة يستخدم؟', answer: 'ابدئي بمرتين إلى ثلاث مرات أسبوعيًا، ثم عدّلي التكرار حسب روتينك واستجابة شعرك.' },
      { question: 'كيف أستخدم الزيت؟', answer: 'قسّمي الشعر، ضعي كمية مناسبة على فروة الرأس، دلّكي بلطف ثم وزّعي ما يلزم على الأطراف.' },
      { question: 'ما حجم العبوة؟', answer: 'العبوة المعروضة حاليًا 100 مل.' },
      { question: 'كيف يتم الشحن؟', answer: 'التوصيل متاح داخل المملكة العربية السعودية، وتُحسب تكلفة الشحن النهائية عند إتمام الطلب.' },
    ],
  },
  finalCta: {
    eyebrow: 'YOUR CROWN. YOUR RITUAL.', titleLine1: 'امنحي شعرك', titleLine2: 'وقته الخاص.',
    description: 'روتين نباتي بسيط، عبوة واحدة، ولحظة عناية تصبح جزءًا من أسبوعك.',
    button: 'ابدئي روتين Crown', image: '/Crown-Oil-Hier/assets/hero-dark-crop.jpg',
  },
  footer: {
    tagline: 'Botanical Hair & Scalp Oil',
    shopTitle: 'تسوّقي', helpTitle: 'المساعدة', legalTitle: 'القانونية',
    copyright: '© 2026 CROWN HAIR OIL · SAUDI ARABIA', supportLabel: 'الدعم',
  },
  checkout: {
    eyebrow: 'SECURE CHECKOUT', title: 'إتمام الطلب', contactTitle: 'بيانات التواصل', paymentTitle: 'طريقة الدفع', summaryTitle: 'ملخص الطلب',
    back: '← العودة للمتجر', shippingPending: 'يُحسب لاحقًا', paymentDisabled: 'الدفع غير متاح حاليًا', secureNote: 'لن يتم تحصيل أي مبلغ قبل تفعيل بوابة دفع آمنة.',
  },
}

export function mergeContent(base, incoming) {
  if (!incoming || typeof incoming !== 'object') return base
  const out = Array.isArray(base) ? [...base] : { ...base }
  Object.keys(incoming).forEach((key) => {
    const value = incoming[key]
    if (Array.isArray(value)) out[key] = value
    else if (value && typeof value === 'object' && base?.[key] && typeof base[key] === 'object' && !Array.isArray(base[key])) out[key] = mergeContent(base[key], value)
    else out[key] = value
  })
  return out
}
