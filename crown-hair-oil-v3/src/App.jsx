import { useEffect, useState } from 'react'

const A = '/Crown-Oil-Hier/'
const product = {
  name: 'Crown Hair Oil',
  price: 119,
  size: '100 ml',
  image: `${A}assets/hero-detail.jpg`,
}

const ingredients = [
  { name: 'الأرغان', copy: 'يساعد على منح الشعر ملمسًا أكثر نعومة ولمعانًا ضمن روتين العناية.', className: 'argan' },
  { name: 'الروزماري', copy: 'مكوّن نباتي مميز لطقس عناية متوازن بالشعر وفروة الرأس.', className: 'rosemary' },
  { name: 'زيت الزيتون', copy: 'غني وملائم للعناية بمظهر الشعر الجاف وتقليل الإحساس بالخشونة.', className: 'olive' },
]

const faqs = [
  ['هل يناسب جميع أنواع الشعر؟', 'صُمم Crown Hair Oil ليكون جزءًا من روتين العناية لمختلف أنواع الشعر. ابدئي بكمية صغيرة وعدّليها حسب احتياج شعرك.'],
  ['كم مرة يستخدم؟', 'ابدئي بمرتين إلى ثلاث مرات أسبوعيًا، ثم عدّلي التكرار حسب روتينك واستجابة شعرك.'],
  ['كيف أستخدم الزيت؟', 'قسّمي الشعر، ضعي كمية مناسبة على فروة الرأس، دلّكي بلطف ثم وزّعي ما يلزم على الأطراف.'],
  ['ما حجم العبوة؟', 'العبوة المعروضة حاليًا 100 مل.'],
  ['كيف يتم الشحن؟', 'التوصيل متاح داخل المملكة العربية السعودية، وتُحسب تكلفة الشحن النهائية عند إتمام الطلب.'],
]

function Header({ count, onCart }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="announcement">توصيل داخل المملكة العربية السعودية · الأسعار تشمل الضريبة</div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Crown Hair Oil — الرئيسية">
          <span className="brand-mark"><img src={`${A}assets/logo.jpg`} alt="" /></span>
          <span className="brand-wordmark">CROWN<small>HAIR OIL</small></span>
        </a>
        <nav className={open ? 'open' : ''} aria-label="التنقل الرئيسي">
          <a href="#product" onClick={() => setOpen(false)}>المنتج</a>
          <a href="#ingredients" onClick={() => setOpen(false)}>المكونات</a>
          <a href="#results" onClick={() => setOpen(false)}>النتائج</a>
          <a href="#ritual" onClick={() => setOpen(false)}>طريقة الاستخدام</a>
          <a href="#faq" onClick={() => setOpen(false)}>الأسئلة الشائعة</a>
        </nav>
        <div className="header-actions">
          <button className="cart-button" onClick={onCart} aria-label={`السلة، ${count} منتج`}>
            <span>السلة</span><b>{count}</b>
          </button>
          <button className="menu" onClick={() => setOpen(!open)} aria-label="فتح القائمة">☰</button>
        </div>
      </header>
    </>
  )
}

function Qty({ value, setValue }) {
  return (
    <div className="qty" aria-label="الكمية">
      <button onClick={() => setValue(Math.max(1, value - 1))} aria-label="تقليل الكمية">−</button>
      <span>{value}</span>
      <button onClick={() => setValue(value + 1)} aria-label="زيادة الكمية">+</button>
    </div>
  )
}

function Cart({ open, onClose, qty, setQty, onCheckout }) {
  return (
    <div className={`cart-layer ${open ? 'show' : ''}`} onClick={onClose} aria-hidden={!open}>
      <aside className="cart" onClick={(e) => e.stopPropagation()} aria-label="سلة التسوق">
        <div className="cart-head">
          <div><p className="eyebrow">YOUR BAG</p><h2>سلة التسوق</h2></div>
          <button onClick={onClose} aria-label="إغلاق السلة">×</button>
        </div>
        <div className="cart-item">
          <img src={product.image} alt={product.name} />
          <div>
            <b>{product.name}</b>
            <small>{product.size}</small>
            <strong>{product.price} ر.س</strong>
            <Qty value={qty} setValue={setQty} />
          </div>
        </div>
        <div className="cart-total"><span>المجموع الفرعي</span><b>{product.price * qty} ر.س</b></div>
        <p className="cart-note">الشحن يُحسب عند إتمام الطلب.</p>
        <button className="primary full" onClick={onCheckout}>إتمام الطلب</button>
        <button className="text-action full" onClick={onClose}>متابعة التسوق ←</button>
      </aside>
    </div>
  )
}

function Checkout({ qty, onBack }) {
  const total = product.price * qty
  return (
    <main className="checkout">
      <button className="back" onClick={onBack}>← العودة للمتجر</button>
      <div className="checkout-grid">
        <section>
          <p className="eyebrow">SECURE CHECKOUT</p>
          <h1>إتمام الطلب</h1>
          <h3>بيانات التواصل</h3>
          <div className="form-grid">
            <input placeholder="الاسم الكامل" />
            <input placeholder="رقم الجوال" inputMode="tel" />
            <input placeholder="البريد الإلكتروني" type="email" />
            <input placeholder="المدينة" />
            <input placeholder="الحي" />
            <input placeholder="الشارع" className="wide" />
          </div>
          <h3>طريقة الدفع</h3>
          <div className="payment">
            <label><input type="radio" name="pay" defaultChecked /> بطاقة / مدى / Apple Pay</label>
            <label><input type="radio" name="pay" /> الدفع عند الاستلام</label>
          </div>
        </section>
        <aside className="summary">
          <h3>ملخص الطلب</h3>
          <div className="summary-product">
            <img src={product.image} alt={product.name} />
            <span>{product.name}<small>{product.size} · الكمية {qty}</small></span>
            <b>{total} ر.س</b>
          </div>
          <div><span>المجموع الفرعي</span><b>{total} ر.س</b></div>
          <div><span>الشحن</span><span>يُحسب لاحقًا</span></div>
          <hr />
          <div className="grand"><span>الإجمالي</span><b>{total} ر.س</b></div>
          <button className="primary full" disabled title="يتطلب ربط بوابة دفع إنتاجية">الدفع غير متاح حاليًا</button>
          <p className="secure">لن يتم تحصيل أي مبلغ قبل تفعيل بوابة دفع آمنة.</p>
        </aside>
      </div>
    </main>
  )
}

function ResultGallery() {
  const [active, setActive] = useState(1)
  const src = `${A}Hair after-before ${active}.jpg`
  return (
    <div className="results-stage">
      <figure className="result-feature">
        <img key={active} src={src} alt={`نتيجة Crown رقم ${active}`} />
        <figcaption>من أرشيف نتائج Crown · تختلف النتائج من شخص لآخر</figcaption>
      </figure>
      <div className="result-thumbs" aria-label="اختيار صورة النتيجة">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={active === n ? 'active' : ''} onClick={() => setActive(n)} aria-label={`عرض النتيجة ${n}`}>
            <img src={`${A}Hair after-before ${n}.jpg`} alt="" />
          </button>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [qty, setQty] = useState(1)
  const [cartQty, setCartQty] = useState(0)
  const [checkout, setCheckout] = useState(false)
  const [faq, setFaq] = useState(0)

  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-reveal]')]
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return undefined
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const addToCart = () => {
    setCartQty(qty)
    setCartOpen(true)
  }

  const buyNow = () => {
    setCartQty(qty)
    setCheckout(true)
  }

  if (checkout) return <Checkout qty={cartQty || qty} onBack={() => setCheckout(false)} />

  return (
    <div id="top">
      <Header count={cartQty} onCart={() => cartQty > 0 && setCartOpen(true)} />
      <Cart
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        qty={cartQty || qty}
        setQty={(value) => { setQty(value); setCartQty(value) }}
        onCheckout={() => { setCartOpen(false); setCheckout(true) }}
      />

      <main>
        <section className="hero">
          <div className="hero-copy hero-sequence">
            <p className="eyebrow">BOTANICAL HAIR & SCALP OIL</p>
            <h1>العناية بشعرك<br /><em>تبدأ من الجذور.</em></h1>
            <p className="lead">مزيج نباتي دافئ من الأرغان والروزماري والزيتون، صُمم ليجعل عنايتك بالشعر طقسًا بسيطًا تستمتعين به.</p>
            <div className="hero-meta"><span className="stars">★★★★★</span><span>100 مل</span><span>119 ر.س</span></div>
            <div className="hero-actions">
              <button className="primary" onClick={addToCart}>تسوّقي Crown</button>
              <a className="text-action" href="#ingredients">اكتشفي المكونات <span>↗</span></a>
            </div>
            <div className="micro"><span>زيوت نباتية مختارة</span><span>لجميع أنواع الشعر</span><span>توصيل داخل المملكة</span></div>
          </div>
          <div className="hero-visual" aria-label="Crown Hair Oil">
            <div className="halo"></div>
            <div className="hero-frame"><img src={`${A}assets/hero-light.jpg`} alt="Crown Hair Oil" /></div>
            <span className="botanical b1">❧</span><span className="botanical b2">❦</span>
          </div>
        </section>

        <section className="trust" aria-label="مزايا Crown">
          <span>BOTANICAL OILS</span><i>✦</i><span>SCALP CARE</span><i>✦</i><span>ALL HAIR TYPES</span><i>✦</i><span>SAUDI DELIVERY</span>
        </section>

        <section className="section why" data-reveal>
          <p className="eyebrow">WHY CROWN</p>
          <h2>روتين أقل. عناية أكثر.</h2>
          <div className="cards">
            <article><b>01</b><span className="line-icon">❧</span><h3>تغذية</h3><p>زيوت مختارة لدعم مظهر الشعر الصحي ضمن روتين متوازن.</p></article>
            <article><b>02</b><span className="line-icon">◌</span><h3>ترطيب</h3><p>يساعد على تقليل مظهر الجفاف ومنح الشعر ملمسًا أكثر نعومة.</p></article>
            <article><b>03</b><span className="line-icon">✦</span><h3>لمعان</h3><p>لمسة نهائية تمنح الشعر مظهرًا حيويًا ولمعانًا طبيعيًا.</p></article>
            <article><b>04</b><span className="line-icon">⌇</span><h3>فروة الرأس</h3><p>تدليك الزيت يحوّل العناية بفروة الرأس إلى طقس أسبوعي بسيط.</p></article>
          </div>
        </section>

        <section id="ingredients" className="section ingredients" data-reveal>
          <div className="section-title">
            <div><p className="eyebrow">WHAT'S INSIDE</p><h2>ثلاثة مكونات.<br />فلسفة واحدة.</h2></div>
            <p>قلب تركيبة Crown النباتية في ثلاث مكونات بارزة، مع تجربة بصرية أكثر هدوءًا ووضوحًا.</p>
          </div>
          <div className="ingredient-grid">
            {ingredients.map((item, index) => (
              <article key={item.name} className="ingredient-card">
                <div className={`ingredient-art ${item.className}`}><span>0{index + 1}</span></div>
                <div className="ingredient-copy"><h3>{item.name}</h3><p>{item.copy}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section id="product" className="section product" data-reveal>
          <div className="product-image"><img src={`${A}assets/hero-detail.jpg`} alt="Crown Hair Oil 100ml" /></div>
          <div className="product-copy">
            <p className="eyebrow">THE SIGNATURE OIL</p>
            <h2>Crown Hair Oil</h2>
            <p className="muted">Botanical Hair & Scalp Oil · 100 ml</p>
            <div className="stars">★★★★★</div>
            <p>زيت عناية نباتي للشعر وفروة الرأس، يجمع الأرغان والروزماري والزيتون في خطوة واحدة سهلة داخل روتينك.</p>
            <div className="product-price">119 <small>ر.س</small><span>شامل الضريبة</span></div>
            <div className="buy-row"><Qty value={qty} setValue={setQty} /><button className="primary" onClick={addToCart}>أضيفي للسلة</button></div>
            <button className="buy-now" onClick={buyNow}>اشتري الآن</button>
            <div className="product-trust"><span>توصيل داخل المملكة</span><span>تكلفة الشحن عند الدفع</span><span>سياسة استرجاع واضحة</span></div>
          </div>
        </section>

        <section id="results" className="section results" data-reveal>
          <div className="section-title">
            <div><p className="eyebrow">CROWN COMMUNITY</p><h2>تجارب من مجتمع Crown.</h2></div>
            <p>نتائج من الأرشيف الحالي للعلامة. تختلف النتائج الفردية باختلاف نوع الشعر والروتين.</p>
          </div>
          <ResultGallery />
        </section>

        <section id="ritual" className="section ritual" data-reveal>
          <div><p className="eyebrow">THE RITUAL</p><h2>ثلاث خطوات<br />لروتين Crown.</h2><p className="ritual-intro">وقت قصير، حركة هادئة، وعناية تبدأ من فروة الرأس.</p></div>
          <ol>
            <li><b>01</b><span><strong>قسّمي الشعر</strong>للوصول إلى فروة الرأس بسهولة.</span></li>
            <li><b>02</b><span><strong>ضعي ودلّكي</strong>استخدمي كمية مناسبة ودلّكي بلطف بحركات دائرية.</span></li>
            <li><b>03</b><span><strong>أكملي روتينك</strong>وزّعي ما يلزم على الأطراف حسب احتياج شعرك.</span></li>
          </ol>
        </section>

        <section className="commerce-band" data-reveal>
          <article><small>DELIVERY</small><b>توصيل داخل السعودية</b><span>تُحسب الرسوم النهائية عند إتمام الطلب.</span></article>
          <article><small>PAYMENT</small><b>Checkout مبسط</b><span>واجهة جاهزة لمدى والبطاقات وApple Pay عند الربط الإنتاجي.</span></article>
          <article><small>SUPPORT</small><b>نحن هنا للمساعدة</b><span>تواصلي معنا من صفحة الدعم الرسمية.</span><a href={`${A}contact.html`}>تواصل معنا ↗</a></article>
        </section>

        <section id="faq" className="section faq" data-reveal>
          <p className="eyebrow">FAQ</p><h2>أسئلة شائعة</h2>
          {faqs.map((item, index) => (
            <article className={faq === index ? 'active' : ''} key={item[0]}>
              <button onClick={() => setFaq(faq === index ? -1 : index)} aria-expanded={faq === index}><span>{item[0]}</span><b>{faq === index ? '−' : '+'}</b></button>
              {faq === index && <p>{item[1]}</p>}
            </article>
          ))}
        </section>

        <section className="final-cta" data-reveal>
          <div>
            <p className="eyebrow">YOUR CROWN. YOUR RITUAL.</p>
            <h2>امنحي شعرك<br />لحظته الخاصة.</h2>
            <p>روتين نباتي بسيط بتصميم يجعل العناية جزءًا مريحًا من يومك.</p>
            <button className="primary" onClick={addToCart}>ابدئي روتين Crown</button>
          </div>
          <img src={`${A}assets/hero-dark-crop.jpg`} alt="Crown Hair Oil lifestyle" />
        </section>
      </main>

      <footer>
        <div className="footer-brand"><img src={`${A}assets/logo.jpg`} alt="Crown Hair Oil" /><b>CROWN<small>HAIR OIL</small></b><p>Botanical care for your crown.</p></div>
        <div><h4>Crown</h4><a href="#ingredients">المكونات</a><a href="#results">النتائج</a><a href="#ritual">طريقة الاستخدام</a></div>
        <div><h4>المساعدة</h4><a href="#faq">الأسئلة الشائعة</a><a href={`${A}shipping-returns.html`}>الشحن والاسترجاع</a><a href={`${A}contact.html`}>تواصل معنا</a></div>
        <div><h4>قانوني</h4><a href={`${A}privacy.html`}>الخصوصية</a><a href={`${A}terms.html`}>الشروط والأحكام</a></div>
        <div className="copyright">© 2026 Crown Hair Oil · Saudi Arabia · SAR</div>
      </footer>

      <a className="support-fab" href={`${A}contact.html`} aria-label="تواصل مع Crown"><span>✦</span><b>تواصل</b></a>
      <div className="mobile-buy"><span><b>119 ر.س</b><small>Crown Hair Oil</small></span><button onClick={addToCart}>أضيفي للسلة</button></div>
    </div>
  )
}
