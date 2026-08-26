import { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_CONTENT, mergeContent } from '../siteContent.js'

const API = import.meta.env.VITE_ADMIN_API_URL || 'https://asubcanztloxiddshakz.supabase.co/functions/v1/crown-admin-api'
const TOKEN_KEY = 'crown_admin_session'
const getToken = () => sessionStorage.getItem(TOKEN_KEY) || ''
const setToken = token => token ? sessionStorage.setItem(TOKEN_KEY, token) : sessionStorage.removeItem(TOKEN_KEY)

async function request(path, options = {}) {
  const token = getToken()
  const isForm = options.body instanceof FormData
  const response = await fetch(`${API}${path}`, {
    headers: {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 && path !== '/login') setToken('')
    throw Object.assign(new Error(data.error || 'request_failed'), { status: response.status, data })
  }
  return data
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const result = await request('/login', { method: 'POST', body: JSON.stringify({ username, password }) })
      setToken(result.token); onLogin(result.admin); setPassword('')
    } catch (err) {
      setError(err.status === 401 ? 'اسم المستخدم أو كلمة المرور غير صحيحة.' : 'تعذر الاتصال بخدمة الإدارة.')
    } finally { setBusy(false) }
  }
  return <main className="v4-login" dir="rtl"><section><div className="v4-brand"><span>C</span><div><b>CROWN</b><small>VISUAL ADMIN</small></div></div><p className="kicker">SECURE CONTENT MANAGEMENT</p><h1>تسجيل دخول الإدارة</h1><p>هذه المنطقة مخصصة لفريق إدارة Crown فقط.</p><form onSubmit={submit}><label>اسم المستخدم<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required/></label><label>كلمة المرور<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="v4-error">{error}</div>}<button disabled={busy}>{busy?'جاري التحقق...':'دخول آمن'}</button></form></section></main>
}

function cloneSet(root, path, value) {
  const keys = path.split('.').map(k => /^\d+$/.test(k) ? Number(k) : k)
  const out = structuredClone(root)
  let cursor = out
  for (let i = 0; i < keys.length - 1; i++) cursor = cursor[keys[i]]
  cursor[keys.at(-1)] = value
  return out
}

function Field({ label, value, onChange, textarea=false, type='text' }) {
  return <label className="v4-field"><span>{label}</span>{textarea?<textarea value={value??''} onChange={e=>onChange(e.target.value)}/>:<input type={type} value={value??''} onChange={e=>onChange(type==='number'?Number(e.target.value):e.target.value)}/>}</label>
}
function Pair({children}) { return <div className="v4-pair">{children}</div> }

function ImageField({ label, value, onPick, onChange }) {
  return <div className="v4-image-field"><span>{label}</span>{value&&<img src={value} alt=""/>}<div><button type="button" onClick={onPick}>اختيار من المكتبة</button><input value={value||''} onChange={e=>onChange(e.target.value)} placeholder="أو رابط الصورة"/></div></div>
}

function Repeater({ items, render, onAdd, onRemove, addLabel='إضافة عنصر' }) {
  return <div className="v4-repeater">{items.map((item,i)=><article key={i}><header><b>#{i+1}</b><button type="button" onClick={()=>onRemove(i)}>حذف</button></header>{render(item,i)}</article>)}<button type="button" className="v4-add" onClick={onAdd}>+ {addLabel}</button></div>
}

function ImagePicker({ media, targetLabel, onClose, onChoose, onUpload, uploading }) {
  const [file,setFile]=useState(null),[alt,setAlt]=useState('')
  return <div className="v4-modal" onMouseDown={onClose}><section onMouseDown={e=>e.stopPropagation()} dir="rtl"><header><div><small>MEDIA LIBRARY</small><h2>اختيار صورة · {targetLabel}</h2></div><button onClick={onClose}>×</button></header><div className="v4-upload"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>setFile(e.target.files?.[0]||null)}/><input placeholder="Alt text" value={alt} onChange={e=>setAlt(e.target.value)}/><button disabled={!file||uploading} onClick={async()=>{const asset=await onUpload(file,alt);if(asset){setFile(null);setAlt('')}}}>{uploading?'جاري الرفع...':'رفع صورة جديدة'}</button></div><div className="v4-picker-grid">{media.map(m=><button key={m.id} onClick={()=>onChoose(m.url)}><img src={m.url} alt={m.alt_text||''}/><span>{m.alt_text||'اختيار الصورة'}</span></button>)}</div>{!media.length&&<p className="v4-empty">لا توجد صور مرفوعة بعد.</p>}</section></div>
}

function PreviewSection({ section, active, onEdit, children, className='' }) {
  return <section className={`v4-preview-section ${active?'selected':''} ${className}`} onClick={e=>{e.stopPropagation();onEdit(section)}}>{children}<button className="v4-edit-chip" onClick={e=>{e.stopPropagation();onEdit(section)}}>تحرير</button></section>
}

function StorePreview({ content, section, setSection, viewport, pickImage }) {
  return <div className={`v4-device ${viewport}`}><div className="v4-store" dir="rtl">
    <div className="v4-announcement" onClick={()=>setSection('seo')}>{content.announcement}</div>
    <div className="v4-store-header"><div className="v4-mini-brand">CROWN <small>HAIR OIL</small></div><nav><span>{content.navigation.product}</span><span>{content.navigation.ingredients}</span><span>{content.navigation.results}</span><span>{content.navigation.ritual}</span></nav><b>{content.navigation.cart}</b></div>
    <PreviewSection section="hero" active={section==='hero'} onEdit={setSection} className="v4-hero"><div><p>{content.hero.eyebrow}</p><h1>{content.hero.titleLine1}<br/><em>{content.hero.titleLine2}</em></h1><div className="v4-lead">{content.hero.description}</div><div className="v4-rating">★★★★★ <span>{content.hero.ratingText}</span></div><div className="v4-price"><strong>{content.product.price}</strong><span>ر.س · {content.product.size}</span></div><div className="v4-buttons"><span>{content.hero.primaryCta}</span><span>{content.hero.secondaryCta}</span></div><div className="v4-micro">{content.hero.micro.map(x=><small key={x}>✓ {x}</small>)}</div></div><button className="v4-preview-image" onClick={e=>{e.stopPropagation();pickImage('hero.image','Hero')}}><img src={content.hero.image} alt="Hero"/><i>تغيير الصورة</i></button></PreviewSection>
    <div className="v4-trust">{content.trust.map(x=><span key={x}>{x}</span>)}</div>
    <PreviewSection section="why" active={section==='why'} onEdit={setSection}><p className="v4-eyebrow">{content.why.eyebrow}</p><h2>{content.why.title}</h2><div className="v4-card-grid">{content.why.cards.map(c=><article key={c.number}><small>{c.number}</small><i>{c.icon}</i><h3>{c.title}</h3><p>{c.copy}</p></article>)}</div></PreviewSection>
    <PreviewSection section="ingredients" active={section==='ingredients'} onEdit={setSection}><p className="v4-eyebrow">{content.ingredients.eyebrow}</p><h2>{content.ingredients.titleLine1} {content.ingredients.titleLine2}</h2><p>{content.ingredients.intro}</p><div className="v4-ingredient-grid">{content.ingredients.items.map((x,i)=><article key={i}>{x.image?<img src={x.image} alt={x.name}/>:<div className="v4-placeholder">{x.name.slice(0,1)}</div>}<h3>{x.name}</h3><p>{x.copy}</p></article>)}</div></PreviewSection>
    <PreviewSection section="product" active={section==='product'} onEdit={setSection} className="v4-product"><button className="v4-preview-image" onClick={e=>{e.stopPropagation();pickImage('product.image','صورة المنتج')}}><img src={content.product.image} alt={content.product.name}/><i>تغيير الصورة</i></button><div><p className="v4-eyebrow">{content.product.eyebrow}</p><h2>{content.product.name}</h2><p>{content.product.subline} · {content.product.size}</p><p>{content.product.description}</p><div className="v4-product-price">{content.product.price} <small>ر.س</small></div><span className="v4-buy">{content.product.addToCart}</span></div></PreviewSection>
    <PreviewSection section="results" active={section==='results'} onEdit={setSection}><p className="v4-eyebrow">{content.results.eyebrow}</p><h2>{content.results.title}</h2><p>{content.results.intro}</p><div className="v4-result-row">{content.results.images.slice(0,4).map((url,i)=><img src={url} alt={`Result ${i+1}`} key={i}/>)}</div></PreviewSection>
    <PreviewSection section="ritual" active={section==='ritual'} onEdit={setSection}><p className="v4-eyebrow">{content.ritual.eyebrow}</p><h2>{content.ritual.titleLine1} {content.ritual.titleLine2}</h2><p>{content.ritual.intro}</p><div className="v4-steps">{content.ritual.steps.map(x=><article key={x.number}><b>{x.number}</b><div><h3>{x.title}</h3><p>{x.copy}</p></div></article>)}</div></PreviewSection>
    <PreviewSection section="commerce" active={section==='commerce'} onEdit={setSection}><div className="v4-commerce">{content.commerce.map((x,i)=><article key={i}><small>{x.eyebrow}</small><b>{x.title}</b><p>{x.copy}</p></article>)}</div></PreviewSection>
    <PreviewSection section="faq" active={section==='faq'} onEdit={setSection}><p className="v4-eyebrow">{content.faq.eyebrow}</p><h2>{content.faq.title}</h2>{content.faq.items.slice(0,4).map((x,i)=><article className="v4-faq-row" key={i}><b>{x.question}</b><span>+</span></article>)}</PreviewSection>
    <PreviewSection section="final" active={section==='final'} onEdit={setSection} className="v4-final"><div><p>{content.finalCta.eyebrow}</p><h2>{content.finalCta.titleLine1}<br/>{content.finalCta.titleLine2}</h2><p>{content.finalCta.description}</p><span>{content.finalCta.button}</span></div><button className="v4-preview-image" onClick={e=>{e.stopPropagation();pickImage('finalCta.image','Final CTA')}}><img src={content.finalCta.image} alt="Final CTA"/><i>تغيير الصورة</i></button></PreviewSection>
    <PreviewSection section="footer" active={section==='footer'} onEdit={setSection} className="v4-footer"><b>CROWN</b><p>{content.footer.tagline}</p><small>{content.footer.copyright}</small></PreviewSection>
  </div></div>
}

const tabNames={hero:'Hero',why:'Why Crown',ingredients:'المكونات',product:'المنتج',results:'النتائج',ritual:'طريقة الاستخدام',commerce:'الشحن والدعم',faq:'FAQ',final:'Final CTA',footer:'Footer',seo:'SEO',media:'الصور',versions:'الإصدارات'}

function Editor({ admin, onLogout }) {
  const [section,setSection]=useState('hero'),[content,setContent]=useState(DEFAULT_CONTENT),[status,setStatus]=useState('تحميل المحتوى...')
  const [media,setMedia]=useState([]),[versions,setVersions]=useState([]),[uploading,setUploading]=useState(false),[viewport,setViewport]=useState('desktop')
  const [pickerTarget,setPickerTarget]=useState(null),[pickerLabel,setPickerLabel]=useState(''),[dirty,setDirty]=useState(false),[loaded,setLoaded]=useState(false)
  const baseline=useRef('')
  const sidebarRef=useRef(null)

  useEffect(()=>{Promise.all([request('/content'),request('/media'),request('/versions')]).then(([c,m,v])=>{const merged=mergeContent(DEFAULT_CONTENT,c.content||{});setContent(merged);baseline.current=JSON.stringify(merged);setMedia(m.media||[]);setVersions(v.versions||[]);setLoaded(true);setStatus('جاهز')}).catch(()=>setStatus('تعذر تحميل بيانات الإدارة'))},[])
  useEffect(()=>{if(!loaded)return;setDirty(JSON.stringify(content)!==baseline.current)},[content,loaded])
  useEffect(()=>{const handler=e=>{if(!dirty)return;e.preventDefault();e.returnValue=''};window.addEventListener('beforeunload',handler);return()=>window.removeEventListener('beforeunload',handler)},[dirty])

  const title=useMemo(()=>tabNames[section]||section,[section])
  const setPath=(path,value)=>setContent(c=>cloneSet(c,path,value))
  const setArray=(path,items)=>setPath(path,items)
  const openSection=s=>{setSection(s);requestAnimationFrame(()=>sidebarRef.current?.scrollTo({top:0,behavior:'smooth'}))}
  const pickImage=(target,label)=>{setPickerTarget(target);setPickerLabel(label)}
  const chooseImage=url=>{setPath(pickerTarget,url);setPickerTarget(null);setStatus('تم اختيار الصورة · يوجد تعديل غير محفوظ')}

  async function saveDraft(){setStatus('حفظ المسودة...');try{const r=await request('/content/draft',{method:'PUT',body:JSON.stringify({content})});baseline.current=JSON.stringify(content);setDirty(false);setStatus(`تم حفظ المسودة · الإصدار ${r.versionNo}`);await loadVersions()}catch{setStatus('تعذر حفظ المسودة')}}
  async function publish(){setStatus('جاري النشر...');try{const r=await request('/content/publish',{method:'POST',body:JSON.stringify({content})});baseline.current=JSON.stringify(content);setDirty(false);setStatus(`تم النشر · الإصدار ${r.versionNo}`);await loadVersions()}catch{setStatus('تعذر النشر')}}
  async function loadVersions(){try{const r=await request('/versions');setVersions(r.versions||[])}catch{}}
  async function loadMedia(){try{const r=await request('/media');setMedia(r.media||[])}catch{}}
  async function upload(file,alt){if(!file)return null;setUploading(true);setStatus('رفع الصورة...');try{const form=new FormData();form.append('file',file);form.append('alt',alt||'');const r=await request('/media/upload',{method:'POST',body:form});await loadMedia();setStatus('تم رفع الصورة');return r.asset}catch(e){setStatus(e.data?.error==='file_too_large'?'الصورة أكبر من 5MB':'تعذر رفع الصورة');return null}finally{setUploading(false)}}
  async function deleteMedia(id){if(!confirm('حذف الصورة من المكتبة؟'))return;await request('/media/delete',{method:'POST',body:JSON.stringify({id})});await loadMedia()}
  async function restore(versionNo){if(dirty&&!confirm('لديك تغييرات غير محفوظة. هل تريد تجاهلها واسترجاع الإصدار؟'))return;setStatus('استرجاع الإصدار...');try{const r=await request('/content/restore',{method:'POST',body:JSON.stringify({versionNo})});const merged=mergeContent(DEFAULT_CONTENT,r.content);setContent(merged);baseline.current=JSON.stringify(merged);setDirty(false);setStatus(`تم الاسترجاع كمسودة · الإصدار ${r.versionNo}`);await loadVersions()}catch{setStatus('تعذر الاسترجاع')}}
  async function logout(){if(dirty&&!confirm('لديك تغييرات غير محفوظة. هل تريد تسجيل الخروج؟'))return;await onLogout()}

  const fields = {
    hero:<><Field label="Eyebrow" value={content.hero.eyebrow} onChange={v=>setPath('hero.eyebrow',v)}/><Pair><Field label="العنوان 1" value={content.hero.titleLine1} onChange={v=>setPath('hero.titleLine1',v)}/><Field label="العنوان 2" value={content.hero.titleLine2} onChange={v=>setPath('hero.titleLine2',v)}/></Pair><Field textarea label="الوصف" value={content.hero.description} onChange={v=>setPath('hero.description',v)}/><Field label="سطر التقييم" value={content.hero.ratingText} onChange={v=>setPath('hero.ratingText',v)}/><Pair><Field label="الزر الرئيسي" value={content.hero.primaryCta} onChange={v=>setPath('hero.primaryCta',v)}/><Field label="الزر الثانوي" value={content.hero.secondaryCta} onChange={v=>setPath('hero.secondaryCta',v)}/></Pair><ImageField label="صورة Hero" value={content.hero.image} onChange={v=>setPath('hero.image',v)} onPick={()=>pickImage('hero.image','Hero')}/>{content.hero.micro.map((x,i)=><Field key={i} label={`ميزة ${i+1}`} value={x} onChange={v=>setPath(`hero.micro.${i}`,v)}/>)}</>,
    why:<><Field label="Eyebrow" value={content.why.eyebrow} onChange={v=>setPath('why.eyebrow',v)}/><Field label="العنوان" value={content.why.title} onChange={v=>setPath('why.title',v)}/><Repeater items={content.why.cards} onAdd={()=>setArray('why.cards',[...content.why.cards,{number:`0${content.why.cards.length+1}`,icon:'✦',title:'ميزة جديدة',copy:'الوصف'}])} onRemove={i=>setArray('why.cards',content.why.cards.filter((_,n)=>n!==i))} render={(x,i)=><><Pair><Field label="الرقم" value={x.number} onChange={v=>setPath(`why.cards.${i}.number`,v)}/><Field label="الأيقونة" value={x.icon} onChange={v=>setPath(`why.cards.${i}.icon`,v)}/></Pair><Field label="العنوان" value={x.title} onChange={v=>setPath(`why.cards.${i}.title`,v)}/><Field textarea label="الوصف" value={x.copy} onChange={v=>setPath(`why.cards.${i}.copy`,v)}/></>}/></>,
    ingredients:<><Pair><Field label="العنوان 1" value={content.ingredients.titleLine1} onChange={v=>setPath('ingredients.titleLine1',v)}/><Field label="العنوان 2" value={content.ingredients.titleLine2} onChange={v=>setPath('ingredients.titleLine2',v)}/></Pair><Field textarea label="المقدمة" value={content.ingredients.intro} onChange={v=>setPath('ingredients.intro',v)}/><Repeater items={content.ingredients.items} onAdd={()=>setArray('ingredients.items',[...content.ingredients.items,{name:'مكوّن جديد',copy:'الوصف',className:'argan',image:''}])} onRemove={i=>setArray('ingredients.items',content.ingredients.items.filter((_,n)=>n!==i))} render={(x,i)=><><Field label="اسم المكوّن" value={x.name} onChange={v=>setPath(`ingredients.items.${i}.name`,v)}/><Field textarea label="الوصف" value={x.copy} onChange={v=>setPath(`ingredients.items.${i}.copy`,v)}/><ImageField label="الصورة" value={x.image} onChange={v=>setPath(`ingredients.items.${i}.image`,v)} onPick={()=>pickImage(`ingredients.items.${i}.image`,x.name)}/></>}/></>,
    product:<><Field label="اسم المنتج" value={content.product.name} onChange={v=>setPath('product.name',v)}/><Pair><Field type="number" label="السعر" value={content.product.price} onChange={v=>setPath('product.price',v)}/><Field label="الحجم" value={content.product.size} onChange={v=>setPath('product.size',v)}/></Pair><Field label="Subline" value={content.product.subline} onChange={v=>setPath('product.subline',v)}/><Field textarea label="الوصف" value={content.product.description} onChange={v=>setPath('product.description',v)}/><Field label="ملاحظة السعر" value={content.product.priceNote} onChange={v=>setPath('product.priceNote',v)}/><ImageField label="صورة المنتج" value={content.product.image} onChange={v=>setPath('product.image',v)} onPick={()=>pickImage('product.image','المنتج')}/><Pair><Field label="زر السلة" value={content.product.addToCart} onChange={v=>setPath('product.addToCart',v)}/><Field label="زر الشراء" value={content.product.buyNow} onChange={v=>setPath('product.buyNow',v)}/></Pair></>,
    results:<><Field label="العنوان" value={content.results.title} onChange={v=>setPath('results.title',v)}/><Field textarea label="المقدمة" value={content.results.intro} onChange={v=>setPath('results.intro',v)}/><Field label="Caption" value={content.results.caption} onChange={v=>setPath('results.caption',v)}/><Repeater addLabel="إضافة صورة" items={content.results.images.map(url=>({url}))} onAdd={()=>setArray('results.images',[...content.results.images,''])} onRemove={i=>setArray('results.images',content.results.images.filter((_,n)=>n!==i))} render={(x,i)=><ImageField label={`صورة ${i+1}`} value={x.url} onChange={v=>setPath(`results.images.${i}`,v)} onPick={()=>pickImage(`results.images.${i}`,`نتيجة ${i+1}`)}/>} /></>,
    ritual:<><Pair><Field label="العنوان 1" value={content.ritual.titleLine1} onChange={v=>setPath('ritual.titleLine1',v)}/><Field label="العنوان 2" value={content.ritual.titleLine2} onChange={v=>setPath('ritual.titleLine2',v)}/></Pair><Field textarea label="المقدمة" value={content.ritual.intro} onChange={v=>setPath('ritual.intro',v)}/><Repeater items={content.ritual.steps} onAdd={()=>setArray('ritual.steps',[...content.ritual.steps,{number:`0${content.ritual.steps.length+1}`,title:'خطوة جديدة',copy:'الوصف'}])} onRemove={i=>setArray('ritual.steps',content.ritual.steps.filter((_,n)=>n!==i))} render={(x,i)=><><Pair><Field label="الرقم" value={x.number} onChange={v=>setPath(`ritual.steps.${i}.number`,v)}/><Field label="العنوان" value={x.title} onChange={v=>setPath(`ritual.steps.${i}.title`,v)}/></Pair><Field textarea label="الوصف" value={x.copy} onChange={v=>setPath(`ritual.steps.${i}.copy`,v)}/></>}/></>,
    commerce:<Repeater items={content.commerce} onAdd={()=>setArray('commerce',[...content.commerce,{eyebrow:'INFO',title:'عنوان جديد',copy:'الوصف',linkText:'المزيد',href:'#'}])} onRemove={i=>setArray('commerce',content.commerce.filter((_,n)=>n!==i))} render={(x,i)=><><Pair><Field label="Eyebrow" value={x.eyebrow} onChange={v=>setPath(`commerce.${i}.eyebrow`,v)}/><Field label="العنوان" value={x.title} onChange={v=>setPath(`commerce.${i}.title`,v)}/></Pair><Field textarea label="الوصف" value={x.copy} onChange={v=>setPath(`commerce.${i}.copy`,v)}/><Pair><Field label="نص الرابط" value={x.linkText} onChange={v=>setPath(`commerce.${i}.linkText`,v)}/><Field label="الرابط" value={x.href} onChange={v=>setPath(`commerce.${i}.href`,v)}/></Pair></>}/>,
    faq:<><Field label="العنوان" value={content.faq.title} onChange={v=>setPath('faq.title',v)}/><Repeater addLabel="إضافة سؤال" items={content.faq.items} onAdd={()=>setArray('faq.items',[...content.faq.items,{question:'سؤال جديد',answer:'الإجابة'}])} onRemove={i=>setArray('faq.items',content.faq.items.filter((_,n)=>n!==i))} render={(x,i)=><><Field label="السؤال" value={x.question} onChange={v=>setPath(`faq.items.${i}.question`,v)}/><Field textarea label="الإجابة" value={x.answer} onChange={v=>setPath(`faq.items.${i}.answer`,v)}/></>}/></>,
    final:<><Pair><Field label="العنوان 1" value={content.finalCta.titleLine1} onChange={v=>setPath('finalCta.titleLine1',v)}/><Field label="العنوان 2" value={content.finalCta.titleLine2} onChange={v=>setPath('finalCta.titleLine2',v)}/></Pair><Field textarea label="الوصف" value={content.finalCta.description} onChange={v=>setPath('finalCta.description',v)}/><Field label="الزر" value={content.finalCta.button} onChange={v=>setPath('finalCta.button',v)}/><ImageField label="صورة Final CTA" value={content.finalCta.image} onChange={v=>setPath('finalCta.image',v)} onPick={()=>pickImage('finalCta.image','Final CTA')}/></>,
    footer:<><Field label="Tagline" value={content.footer.tagline} onChange={v=>setPath('footer.tagline',v)}/><Pair><Field label="عنوان التسوق" value={content.footer.shopTitle} onChange={v=>setPath('footer.shopTitle',v)}/><Field label="عنوان المساعدة" value={content.footer.helpTitle} onChange={v=>setPath('footer.helpTitle',v)}/></Pair><Field label="العنوان القانوني" value={content.footer.legalTitle} onChange={v=>setPath('footer.legalTitle',v)}/><Field label="Copyright" value={content.footer.copyright} onChange={v=>setPath('footer.copyright',v)}/><Field label="اسم زر الدعم" value={content.footer.supportLabel} onChange={v=>setPath('footer.supportLabel',v)}/></>,
    seo:<><Field label="SEO Title" value={content.seo.title} onChange={v=>setPath('seo.title',v)}/><Field textarea label="Meta Description" value={content.seo.description} onChange={v=>setPath('seo.description',v)}/><ImageField label="Social / OG Image" value={content.seo.socialImage} onChange={v=>setPath('seo.socialImage',v)} onPick={()=>pickImage('seo.socialImage','Social Image')}/><Field label="Announcement Bar" value={content.announcement} onChange={v=>setPath('announcement',v)}/></>,
    media:<MediaManager media={media} uploading={uploading} upload={upload} remove={deleteMedia} choose={url=>{navigator.clipboard?.writeText(url);setStatus('تم نسخ رابط الصورة')}}/>,
    versions:<div className="v4-version-list">{versions.length?versions.map(v=><article key={v.id}><div><b>الإصدار {v.version_no}</b><small>{v.status==='published'?'منشور':'مسودة'} · {new Date(v.created_at).toLocaleString('ar-SA')}</small></div><button onClick={()=>restore(v.version_no)}>استرجاع كمسودة</button></article>):<p>لا توجد إصدارات بعد.</p>}</div>,
  }

  return <div className="v4-shell" dir="rtl"><header className="v4-topbar"><div className="v4-brand"><span>C</span><div><b>CROWN</b><small>VISUAL ADMIN</small></div></div><div className="v4-status">{dirty&&<i>● تغييرات غير محفوظة</i>}<span>{status}</span></div><div className="v4-actions"><div className="v4-view-toggle"><button className={viewport==='desktop'?'active':''} onClick={()=>setViewport('desktop')}>Desktop</button><button className={viewport==='mobile'?'active':''} onClick={()=>setViewport('mobile')}>Mobile</button></div><button onClick={saveDraft}>حفظ المسودة</button><button className="publish" onClick={publish}>نشر</button><button onClick={logout}>خروج</button></div></header><div className="v4-workspace"><aside className="v4-sidebar" ref={sidebarRef}><div className="v4-side-title"><small>SITE EDITOR</small><h2>{title}</h2><p>اضغط على أي قسم داخل المعاينة لفتحه هنا مباشرة.</p></div><nav>{Object.entries(tabNames).map(([key,name])=><button className={section===key?'active':''} onClick={()=>openSection(key)} key={key}>{name}</button>)}</nav><div className="v4-fields">{fields[section]}</div></aside><main className="v4-preview-area"><div className="v4-preview-toolbar"><span>LIVE VISUAL PREVIEW</span><small>التغييرات لا تصل للعملاء حتى تضغط «نشر»</small></div><StorePreview content={content} section={section} setSection={openSection} viewport={viewport} pickImage={pickImage}/></main></div>{pickerTarget&&<ImagePicker media={media} targetLabel={pickerLabel} onClose={()=>setPickerTarget(null)} onChoose={chooseImage} onUpload={upload} uploading={uploading}/>}</div>
}

function MediaManager({media,uploading,upload,remove,choose}){
  const[file,setFile]=useState(null),[alt,setAlt]=useState('')
  return <div><div className="v4-upload side"><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>setFile(e.target.files?.[0]||null)}/><input placeholder="Alt text" value={alt} onChange={e=>setAlt(e.target.value)}/><button disabled={!file||uploading} onClick={async()=>{const asset=await upload(file,alt);if(asset){setFile(null);setAlt('')}}}>{uploading?'جاري الرفع...':'رفع الصورة'}</button></div><div className="v4-media-list">{media.map(m=><article key={m.id}><img src={m.url} alt={m.alt_text||''}/><div><small>{m.alt_text||'بدون Alt text'}</small><button onClick={()=>choose(m.url)}>نسخ الرابط</button><button className="danger" onClick={()=>remove(m.id)}>حذف</button></div></article>)}</div></div>
}

export default function AdminVisualCMS(){
  const[admin,setAdmin]=useState(null),[checking,setChecking]=useState(true)
  useEffect(()=>{if(!getToken()){setChecking(false);return}request('/me').then(r=>setAdmin(r.admin)).catch(()=>setToken('')).finally(()=>setChecking(false))},[])
  async function logout(){try{await request('/logout',{method:'POST'})}catch{}setToken('');setAdmin(null)}
  if(checking)return <div className="v4-loading">CROWN ADMIN</div>
  return admin?<Editor admin={admin} onLogout={logout}/>:<Login onLogin={setAdmin}/>
}
