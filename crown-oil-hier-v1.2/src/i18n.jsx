/* ============================================================
   CROWN HAIR OIL — v1.2 cinematic landing i18n (EN / AR)
   Shares the origin-wide `crown_lang` key with the app and hub.
   English is the design's native LTR language; Arabic switches
   the document to RTL and translates all reading copy.
   ============================================================ */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORE_KEY = 'crown_lang';
export const DEFAULT_LANG = 'en';

export function loadLang() {
  try {
    const v = localStorage.getItem(STORE_KEY);
    return v === 'en' || v === 'ar' ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}
function persistLang(lang) {
  try { localStorage.setItem(STORE_KEY, lang); } catch { /* private mode */ }
}

const EN = {
  'nav.ritual': 'Ritual',
  'nav.philosophy': 'Philosophy',
  'nav.protocol': 'Protocol',
  'nav.order': 'Order',
  'nav.orderNow': 'Order Now',
  'nav.home': 'Home',
  'nav.share': 'Share',
  'nav.shareCopied': 'Link copied',
  'nav.light': 'Light mode',
  'nav.dark': 'Dark mode',
  'nav.lang': 'العربية',

  'hero.eyebrow': '100% Botanical · Lab-Grade Ritual',
  'hero.line1': 'Root Science is the',
  'hero.line2': 'Ritual.',
  'hero.sub': 'Argan, rosemary and cold-pressed olive oil, engineered into one protocol for length, density and shine — no silicones, no shortcuts.',
  'hero.order': 'Order Your Bottle',
  'hero.formula': 'See the Formula',

  'features.eyebrow': 'The Formula',
  'features.h1': 'Three instruments,',
  'features.h2': 'one ritual.',

  'shuffler.title': 'Botanical Complex',
  'shuffler.sub': 'Three actives, one formula — cycling through the ritual stack.',
  'shuffler.item1': 'Argan Oil',
  'shuffler.item1n': 'Vitamin E · deep shine',
  'shuffler.item2': 'Rosemary Extract',
  'shuffler.item2n': 'Follicle stimulation',
  'shuffler.item3': 'Cold-Pressed Olive',
  'shuffler.item3n': 'Root-to-tip nourishment',

  'feed.title': 'Live Feed',
  'feed.msg1': 'Initializing follicle scan…',
  'feed.msg2': 'Week 1: absorption rate nominal.',
  'feed.msg3': 'Week 4: +12% visible thickness detected.',
  'feed.msg4': 'Week 8: root strength stabilized.',
  'feed.msg5': 'Week 12: shine index at peak.',

  'sched.title': 'Twice-Weekly Ritual',
  'sched.sub': 'Two sessions a week. No complicated routine — just consistency.',
  'sched.save': 'Save',
  'sched.saved': 'Saved to Routine ✓',

  'phil.line1': 'Most hair care focuses on quick fixes and synthetic silicones.',
  'phil.line2': 'We focus on root biology, patience, and three oils working as one.',

  'proto.step1t': 'Extraction',
  'proto.step1d': 'Argan, rosemary and cold-pressed olive oil sourced and blended without heat, preserving every active compound.',
  'proto.step2t': 'Absorption',
  'proto.step2d': 'Massaged into the scalp, the formula maps and penetrates each follicle for direct, root-level delivery.',
  'proto.step3t': 'Regeneration',
  'proto.step3d': 'Root activity increases. Strands emerge stronger, visibly thicker and shinier within weeks.',

  'start.eyebrow': 'Begin the Ritual',
  'start.h1': 'Ready for',
  'start.em': 'visible',
  'start.h2': 'results?',
  'start.sub': 'One bottle. Three botanical oils. A protocol your roots will recognize in four weeks.',
  'start.order': 'Order Your Bottle',
  'start.ship': 'Free shipping over 200 SAR',
  'start.natural': '100% natural formula',
  'start.price': '119 SAR',
  'start.oldPrice': '149 SAR',

  'footer.tagline': 'Root science. Ritual results.',
  'footer.col1': 'Product',
  'footer.col1a': 'Ingredients',
  'footer.col1b': 'The Ritual',
  'footer.col1c': 'Results',
  'footer.col2': 'Company',
  'footer.col2a': 'Our Story',
  'footer.col2b': 'Contact',
  'footer.col2c': 'Instagram',
  'footer.col3': 'Legal',
  'footer.col3a': 'Privacy Policy',
  'footer.col3b': 'Terms of Service',
  'footer.rights': 'All rights reserved.',
  'footer.status': 'System Operational',
};

const AR = {
  'nav.ritual': 'الطقس',
  'nav.philosophy': 'الفلسفة',
  'nav.protocol': 'البروتوكول',
  'nav.order': 'اطلبي',
  'nav.orderNow': 'اطلبي الآن',
  'nav.home': 'الرئيسية',
  'nav.share': 'مشاركة',
  'nav.shareCopied': 'تم نسخ الرابط',
  'nav.light': 'الوضع العادي',
  'nav.dark': 'الوضع الداكن',
  'nav.lang': 'English',

  'hero.eyebrow': '100٪ نباتي · طقس بجودة المختبر',
  'hero.line1': 'علم الجذور هو',
  'hero.line2': 'الطقس.',
  'hero.sub': 'أرغان وروزماري وزيت زيتون معصور على البارد، مصمّمة في بروتوكول واحد للطول والكثافة واللمعان — بلا سيليكون وبلا حلول مؤقتة.',
  'hero.order': 'اطلبي زجاجتك',
  'hero.formula': 'اكتشفي التركيبة',

  'features.eyebrow': 'التركيبة',
  'features.h1': 'ثلاث أدوات،',
  'features.h2': 'طقسٌ واحد.',

  'shuffler.title': 'المركّب النباتي',
  'shuffler.sub': 'ثلاثة عناصر فعّالة في تركيبة واحدة — تتناوب داخل طقس العناية.',
  'shuffler.item1': 'زيت الأرغان',
  'shuffler.item1n': 'فيتامين E · لمعان عميق',
  'shuffler.item2': 'خلاصة الروزماري',
  'shuffler.item2n': 'تحفيز البصيلات',
  'shuffler.item3': 'زيتون معصور على البارد',
  'shuffler.item3n': 'تغذية من الجذور للأطراف',

  'feed.title': 'بثّ مباشر',
  'feed.msg1': 'جارٍ بدء فحص البصيلات…',
  'feed.msg2': 'الأسبوع 1: معدل الامتصاص طبيعي.',
  'feed.msg3': 'الأسبوع 4: رصد زيادة كثافة مرئية +12٪.',
  'feed.msg4': 'الأسبوع 8: استقرّت قوة الجذور.',
  'feed.msg5': 'الأسبوع 12: مؤشّر اللمعان في ذروته.',

  'sched.title': 'طقس مرتين أسبوعياً',
  'sched.sub': 'جلستان في الأسبوع. لا روتين معقّد — فقط الانتظام.',
  'sched.save': 'حفظ',
  'sched.saved': 'أُضيف إلى الروتين ✓',

  'phil.line1': 'معظم منتجات العناية تركّز على الحلول السريعة والسيليكون الصناعي.',
  'phil.line2': 'نحن نركّز على بيولوجيا الجذور، والصبر، وثلاثة زيوت تعمل ككيان واحد.',

  'proto.step1t': 'الاستخلاص',
  'proto.step1d': 'أرغان وروزماري وزيت زيتون معصور على البارد، مُنتقاة وممزوجة دون حرارة، للحفاظ على كل مركّب فعّال.',
  'proto.step2t': 'الامتصاص',
  'proto.step2d': 'بالتدليك في فروة الرأس، تتوغّل التركيبة في كل بصيلة لتوصيل مباشر على مستوى الجذر.',
  'proto.step3t': 'التجدّد',
  'proto.step3d': 'يزداد نشاط الجذور. تظهر الخصلات أقوى وأكثر كثافة ولمعاناً خلال أسابيع.',

  'start.eyebrow': 'ابدئي الطقس',
  'start.h1': 'جاهزة لنتائج',
  'start.em': 'ملموسة',
  'start.h2': '؟',
  'start.sub': 'زجاجة واحدة. ثلاثة زيوت نباتية. بروتوكول ستتعرّف عليه جذورك خلال أربعة أسابيع.',
  'start.order': 'اطلبي زجاجتك',
  'start.ship': 'شحن مجاني فوق 200 ر.س',
  'start.natural': 'تركيبة طبيعية 100٪',
  'start.price': '١١٩ ر.س',
  'start.oldPrice': '١٤٩ ر.س',

  'footer.tagline': 'علم الجذور. نتائج الطقس.',
  'footer.col1': 'المنتج',
  'footer.col1a': 'المكونات',
  'footer.col1b': 'الطقس',
  'footer.col1c': 'النتائج',
  'footer.col2': 'الشركة',
  'footer.col2a': 'قصتنا',
  'footer.col2b': 'تواصل',
  'footer.col2c': 'إنستغرام',
  'footer.col3': 'القانونية',
  'footer.col3a': 'سياسة الخصوصية',
  'footer.col3b': 'شروط الخدمة',
  'footer.rights': 'جميع الحقوق محفوظة.',
  'footer.status': 'النظام يعمل',
};

const DICTS = { en: EN, ar: AR };

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(loadLang);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = lang;
    el.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = useCallback((next) => {
    const val = next === 'ar' ? 'ar' : 'en';
    persistLang(val);
    setLangState(val);
  }, []);

  const t = useCallback(
    (key) => (DICTS[lang] && DICTS[lang][key]) || EN[key] || key,
    [lang]
  );

  const value = { lang, setLang, t, dir: lang === 'ar' ? 'rtl' : 'ltr' };
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within <LangProvider>');
  return ctx;
}
