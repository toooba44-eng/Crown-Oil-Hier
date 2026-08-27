import { useEffect, useState } from 'react'
import { CONTENT_API, DEFAULT_CONTENT, mergeContent } from './siteContent.js'
import PaymentMethods from './PaymentMethods.jsx'

const A = '/Crown-Oil-Hier/'

function Header({ count, onCart, content }) {
  const [open, setOpen] = useState(false)
  const n = content.navigation
  return <>
    <div className="announcement">{content.announcement}</div>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Crown Hair Oil — الرئيسية"><span className="brand-mark"><img src={`${A}assets/logo.jpg`} alt="" /></span><span className="brand-wordmark">CROWN<small>HAIR OIL</small></span></a>
      <nav className={open ? 'open' : ''} aria-label="التنقل الرئيسي">
        <a href={`${A}shop/`} onClick={()=>setOpen(false)}>المتجر</a><a href="#product" onClick={()=>setOpen(false)}>{n.product}</a><a href="#ingredients" onClick={()=>setOpen(false)}>{n.ingredients}</a><a href="#results" onClick={()=>setOpen(false)}>{n.results}</a><a href="#ritual" onClick={()=>setOpen(false)}>{n.ritual}</a><a href="#faq" onClick={()=>setOpen(false)}>{n.faq}</a>
      </nav>
      <div className="header-actions"><button className="cart-button" onClick={onCart} aria-label={`${n.cart}، ${count} منتج`}><span>{n.cart}</span><b>{count}</b></button><button className="menu" onClick={()=>setOpen(!open)} aria-label="فتح القائمة">☰</button></div>
    </header>
  </>
}

function Qty({ value, setValue }) { return <div className="qty" aria-label="الكمية"><button onClick={()=>setValue(Math.max(1,value-1))}>−</button><span>{value}</span><button onClick={()=>setValue(value+1)}>+</button></div> }

function Cart({ open,onClose,qty,setQty,onCheckout,product }) {
  return <div className={`cart-layer ${open?'show':''}`} onClick={onClose} aria-hidden={!open}><aside className="cart" onClick={e=>e.stopPropagation()}>
    <div className="cart-head"><div><p className="eyebrow">YOUR BAG</p><h2>سلة التسوق</h2></div><button onClick={onClose}>×</button></div>
    <div className="cart-item"><img src={product.image} alt={product.name}/><div><b>{product.name}</b><small>{product.size}</small><strong>{product.price} ر.س</strong><Qty value={qty} setValue={setQty}/></div></div>
    <div className="cart-total"><span>المجموع الفرعي</span><b>{Number(product.price)*qty} ر.س</b></div><p className="cart-note">الشحن يُحسب حسب المدينة والكمية عند إتمام الطلب.</p><button className="primary full" onClick={onCheckout}>إتمام الطلب</button><button className="text-action full" onClick={onClose}>متابعة التسوق ←</button>
  </aside></div>
}

function isRiyadh(city='') {
  const value=city.trim().toLowerCase().replace(/[\s-]+/g,' ')
  return value==='الرياض'||value==='رياض'||value==='riyadh'||value==='al riyadh'||value==='ar riyadh'
}
function shippingFor(city,qty){
  if(!city.trim())return null
  const riyadh=isRiyadh(city)
  if(riyadh)return qty>2?0:16
  return qty>5?0:34
}

function Checkout({ qty,setQty,onBack,content }) {
  const p=content.product,c=content.checkout
  const [form,setForm]=useState({name:'',phone:'',email:'',city:'',district:'',street:''})
  const subtotal=Number(p.price)*qty,shipping=shippingFor(form.city,qty),total=subtotal+(shipping??0)
  const update=(key,value)=>setForm(prev=>({...prev,[key]:value}))
  const cityKnown=form.city.trim().length>0,riyadh=cityKnown&&isRiyadh(form.city)
  const shippingLabel=!cityKnown?'يُحسب بعد إدخال المدينة':shipping===0?'مجاني':`${shipping} ر.س`
  const shippingHint=!cityKnown?'الرياض: 16 ر.س، ومجانًا عند 3 قطع فأكثر. خارج الرياض: 34 ر.س، ومجانًا عند 6 قطع فأكثر.':shipping===0?'مؤهل للشحن المجاني حسب المدينة والكمية.':riyadh?'الشحن داخل الرياض مجاني عند طلب أكثر من قطعتين.':'الشحن خارج الرياض مجاني عند طلب أكثر من 5 قطع.'
  return <main className="checkout"><button className="back" onClick={onBack}>{c.back}</button><div className="checkout-grid"><section><p className="eyebrow">{c.eyebrow}</p><h1>{c.title}</h1><h3>{c.contactTitle}</h3><p className="checkout-required-note">جميع بيانات التواصل والعنوان إلزامية *</p><form className="form-grid" onSubmit={e=>e.preventDefault()}><input required autoComplete="name" value={form.name} onChange={e=>update('name',e.target.value)} placeholder="الاسم الكامل *"/><input required autoComplete="tel" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="رقم الجوال *" inputMode="tel"/><input required autoComplete="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="البريد الإلكتروني *" type="email"/><input required autoComplete="address-level2" value={form.city} onChange={e=>update('city',e.target.value)} placeholder="المدينة *"/><input required autoComplete="address-level3" value={form.district} onChange={e=>update('district',e.target.value)} placeholder="الحي *"/><input required autoComplete="street-address" value={form.street} onChange={e=>update('street',e.target.value)} placeholder="الشارع *" className="wide"/></form><h3>{c.paymentTitle}</h3><PaymentMethods checkout={c}/></section><aside className="summary"><h3>{c.summaryTitle}</h3><div className="summary-product"><img src={p.image} alt={p.name}/><span>{p.name}<small>{p.size}</small><div className="checkout-qty-row"><small>الكمية</small><Qty value={qty} setValue={setQty}/></div></span><b>{subtotal} ر.س</b></div><div><span>المجموع الفرعي</span><b>{subtotal} ر.س</b></div><div><span>الشحن</span><b>{shippingLabel}</b></div><p className="shipping-hint">{shippingHint}</p><hr/><div className="grand"><span>الإجمالي</span><b>{cityKnown?`${total} ر.س`:`${subtotal} ر.س + الشحن`}</b></div><button className="primary full" disabled>{c.paymentDisabled}</button><p className="secure">{c.secureNote}</p></aside></div></main>
}

function ResultGallery({ results }) {
  const [active,setActive]=useState(0); const images=results.images?.length?results.images:DEFAULT_CONTENT.results.images; const src=images[Math.min(active,images.length-1)]
  return <div className="results-stage"><figure className="result-feature"><img key={src} src={src} alt={`نتيجة Crown رقم ${active+1}`}/><figcaption>{results.caption}</figcaption></figure><div className="result-thumbs">{images.map((image,i)=><button key={`${image}-${i}`} className={active===i?'active':''} onClick={()=>setActive(i)}><img src={image} alt=""/></button>)}</div></div>
}

export default function App(){
  const [content,setContent]=useState(DEFAULT_CONTENT),[cartOpen,setCartOpen]=useState(false),[qty,setQty]=useState(1),[cartQty,setCartQty]=useState(0),[checkout,setCheckout]=useState(false),[faq,setFaq]=useState(0)

  useEffect(()=>{ fetch(CONTENT_API).then(r=>r.ok?r.json():Promise.reject()).then(r=>{if(r.content)setContent(mergeContent(DEFAULT_CONTENT,r.content))}).catch(()=>{}) },[])
  useEffect(()=>{ document.title=content.seo.title; let meta=document.querySelector('meta[name="description"]'); if(meta)meta.setAttribute('content',content.seo.description); let og=document.querySelector('meta[property="og:image"]'); if(og)og.setAttribute('content',content.seo.socialImage) },[content.seo])
  useEffect(()=>{ const nodes=[...document.querySelectorAll('[data-reveal]')]; if(!('IntersectionObserver' in window)){nodes.forEach(n=>n.classList.add('is-visible'));return} const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');o.unobserve(e.target)}}),{threshold:.12});nodes.forEach(n=>o.observe(n));return()=>o.disconnect() },[content])

  const updateCheckoutQty=v=>{setQty(v);setCartQty(v)}
  const addToCart=()=>{setCartQty(qty);setCartOpen(true)},buyNow=()=>{setCartQty(qty);setCheckout(true)},p=content.product
  if(checkout)return <Checkout qty={cartQty||qty} setQty={updateCheckoutQty} onBack={()=>setCheckout(false)} content={content}/>

  return <div id="top"><Header count={cartQty} onCart={()=>cartQty>0&&setCartOpen(true)} content={content}/><Cart open={cartOpen} onClose={()=>setCartOpen(false)} qty={cartQty||qty} setQty={v=>{setQty(v);setCartQty(v)}} onCheckout={()=>{setCartOpen(false);setCheckout(true)}} product={p}/><main>
    <section className="hero"><div className="hero-copy hero-sequence"><p className="eyebrow">{content.hero.eyebrow}</p><h1>{content.hero.titleLine1}<br/><em>{content.hero.titleLine2}</em></h1><p className="lead">{content.hero.description}</p><div className="hero-rating"><span className="stars">★★★★★</span><span>{content.hero.ratingText}</span></div><div className="hero-price"><strong>{p.price}</strong><span>ر.س · {p.size}</span></div><div className="hero-actions"><a className="primary" href={`${A}shop/`}>{content.hero.primaryCta}</a><a className="secondary" href={`${A}shop/`}>تصفحي كل المنتجات</a><a className="hero-text-link" href="#ingredients">{content.hero.secondaryCta}</a></div><div className="micro">{content.hero.micro.map(x=><span key={x}>{x}</span>)}</div></div><div className="hero-visual"><div className="halo"></div><div className="hero-frame"><img src={content.hero.image} alt={p.name}/></div><span className="botanical b1">❧</span><span className="botanical b2">❦</span></div></section>
    <section className="trust">{content.trust.map((x,i)=><span key={x}>{i>0&&<i>✦</i>}{x}</span>)}</section>
    <section className="section why" data-reveal><p className="eyebrow">{content.why.eyebrow}</p><h2>{content.why.title}</h2><div className="cards">{content.why.cards.map(c=><article key={c.number}><b>{c.number}</b><span className="line-icon">{c.icon}</span><h3>{c.title}</h3><p>{c.copy}</p></article>)}</div></section>
    <section id="ingredients" className="section ingredients" data-reveal><div className="section-title"><div><p className="eyebrow">{content.ingredients.eyebrow}</p><h2>{content.ingredients.titleLine1}<br/>{content.ingredients.titleLine2}</h2></div><p>{content.ingredients.intro}</p></div><div className="ingredient-grid">{content.ingredients.items.map((item,i)=><article className="ingredient-card" key={`${item.name}-${i}`}><div className={`ingredient-art ${item.className}`} style={item.image?{backgroundImage:`url(${item.image})`,backgroundSize:'cover',backgroundPosition:'center'}:{}}><span>0{i+1}</span></div><div className="ingredient-copy"><h3>{item.name}</h3><p>{item.copy}</p></div></article>)}</div></section>
    <section id="product" className="section product" data-reveal><div className="product-image"><img src={p.image} alt={`${p.name} ${p.size}`}/></div><div className="product-copy"><p className="eyebrow">{p.eyebrow}</p><h2>{p.name}</h2><p className="muted">{p.subline} · {p.size}</p><p>{p.description}</p><div className="product-price">{p.price} <small>ر.س</small><span>{p.priceNote}</span></div><div className="buy-row"><Qty value={qty} setValue={setQty}/><button className="primary" onClick={addToCart}>{p.addToCart}</button></div><button className="buy-now" onClick={buyNow}>{p.buyNow}</button><div className="product-trust">{p.trust.map(x=><span key={x}>{x}</span>)}</div></div></section>
    <section id="results" className="section results" data-reveal><div className="section-title"><div><p className="eyebrow">{content.results.eyebrow}</p><h2>{content.results.title}</h2></div><p>{content.results.intro}</p></div><ResultGallery results={content.results}/></section>
    <section id="ritual" className="section ritual" data-reveal><div><p className="eyebrow">{content.ritual.eyebrow}</p><h2>{content.ritual.titleLine1}<br/>{content.ritual.titleLine2}</h2><p className="ritual-intro">{content.ritual.intro}</p></div><ol>{content.ritual.steps.map(s=><li key={s.number}><b>{s.number}</b><span><strong>{s.title}</strong>{s.copy}</span></li>)}</ol></section>
    <section className="commerce-band" data-reveal>{content.commerce.map((c,i)=><article key={`${c.eyebrow}-${i}`}><small>{c.eyebrow}</small><b>{c.title}</b><span>{c.copy}</span><a href={c.href}>{c.linkText}</a></article>)}</section>
    <section id="faq" className="section faq" data-reveal><p className="eyebrow">{content.faq.eyebrow}</p><h2>{content.faq.title}</h2>{content.faq.items.map((item,i)=><article className={faq===i?'active':''} key={`${item.question}-${i}`}><button onClick={()=>setFaq(faq===i?-1:i)} aria-expanded={faq===i}><span>{item.question}</span><b>{faq===i?'−':'+'}</b></button>{faq===i&&<p>{item.answer}</p>}</article>)}</section>
    <section className="final-cta" data-reveal><div><p className="eyebrow">{content.finalCta.eyebrow}</p><h2>{content.finalCta.titleLine1}<br/>{content.finalCta.titleLine2}</h2><p>{content.finalCta.description}</p><button className="primary" onClick={addToCart}>{content.finalCta.button} · {p.price} ر.س</button></div><img src={content.finalCta.image} alt={`${p.name} lifestyle`}/></section>
  </main><footer><div className="footer-brand"><img src={`${A}assets/logo.jpg`} alt={p.name}/><b>CROWN</b><small>HAIR OIL</small><p>{content.footer.tagline}</p></div><div><h4>{content.footer.shopTitle}</h4><a href={`${A}shop/`}>جميع المنتجات</a><a href="#product">{p.name}</a><a href="#ingredients">{content.navigation.ingredients}</a><a href="#ritual">{content.navigation.ritual}</a></div><div><h4>{content.footer.helpTitle}</h4><a href={`${A}shipping-returns.html`}>الشحن والاسترجاع</a><a href={`${A}contact.html`}>تواصلي معنا</a><a href="#faq">{content.navigation.faq}</a></div><div><h4>{content.footer.legalTitle}</h4><a href={`${A}privacy.html`}>الخصوصية</a><a href={`${A}terms.html`}>الشروط والأحكام</a></div><div className="copyright">{content.footer.copyright}</div></footer><a className="support-fab" href={`${A}contact.html`}><span>?</span><b>{content.footer.supportLabel}</b></a><div className="mobile-buy"><span><b>{p.price} ر.س</b><small>{p.name} · {p.size}</small></span><button onClick={addToCart}>{p.addToCart}</button></div></div>
}
