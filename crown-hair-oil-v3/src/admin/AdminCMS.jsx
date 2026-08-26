import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const defaultContent = {
  hero: {
    eyebrow: 'BOTANICAL HAIR & SCALP OIL',
    titleLine1: 'العناية بشعرك',
    titleLine2: 'تبدأ من الجذور.',
    description: 'مزيج نباتي غني بزيت الأرغان والروزماري والزيتون، صُمم ليكون طقسًا بسيطًا للعناية بالشعر وفروة الرأس.',
    primaryCta: 'تسوّقي الآن',
    secondaryCta: 'اكتشفي المكونات',
  },
  product: { name: 'Crown Hair Oil', price: '119', size: '100 ml' },
  faq: [
    { question: 'هل يناسب جميع أنواع الشعر؟', answer: 'صُمم Crown Hair Oil ليكون جزءًا من روتين العناية لمختلف أنواع الشعر.' },
    { question: 'كم مرة يستخدم؟', answer: 'ابدئي بمرتين إلى ثلاث مرات أسبوعيًا وعدّلي التكرار حسب احتياج شعرك.' },
  ],
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(data.error || 'request_failed'), { status: response.status, data })
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
      const result = await request('/admin/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
      onLogin(result.admin)
    } catch (err) {
      setError(err.status === 503 ? 'خدمة الإدارة لم تُنشر على Backend بعد.' : 'اسم المستخدم أو كلمة المرور غير صحيحة.')
    } finally { setBusy(false) }
  }

  return <main className="login-page" dir="rtl">
    <section className="login-card">
      <div className="login-brand"><span>C</span><div><b>CROWN</b><small>ADMIN</small></div></div>
      <p className="login-kicker">SECURE CONTENT MANAGEMENT</p>
      <h1>تسجيل دخول الإدارة</h1>
      <p className="login-copy">هذه المنطقة مخصصة لفريق إدارة Crown فقط.</p>
      <form onSubmit={submit}>
        <label>اسم المستخدم<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required /></label>
        <label>كلمة المرور<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
        {error && <div className="login-error">{error}</div>}
        <button className="admin-primary" disabled={busy}>{busy ? 'جاري التحقق...' : 'دخول آمن'}</button>
      </form>
      <small className="security-note">لا يتم حفظ كلمة المرور داخل المتصفح أو ملفات الموقع.</small>
    </section>
  </main>
}

function Field({ label, value, onChange, textarea=false }) {
  return <label className="editor-field"><span>{label}</span>{textarea ? <textarea value={value} onChange={e=>onChange(e.target.value)} /> : <input value={value} onChange={e=>onChange(e.target.value)} />}</label>
}

function Editor({ admin, onLogout }) {
  const [editing, setEditing] = useState(false)
  const [section, setSection] = useState('hero')
  const [content, setContent] = useState(defaultContent)
  const [status, setStatus] = useState('جاهز')

  useEffect(()=>{ request('/admin/content').then(r=>r.content && setContent(r.content)).catch(()=>{}) },[])
  const previewTitle = useMemo(()=>`${content.hero.titleLine1} ${content.hero.titleLine2}`,[content])

  const setHero = (key, value) => setContent(c=>({...c,hero:{...c.hero,[key]:value}}))
  const setProduct = (key, value) => setContent(c=>({...c,product:{...c.product,[key]:value}}))

  async function saveDraft() {
    setStatus('حفظ المسودة...')
    try { await request('/admin/content/draft',{method:'PUT',body:JSON.stringify({content})}); setStatus('تم حفظ المسودة') }
    catch { setStatus('تعذر الحفظ — Backend غير متاح') }
  }
  async function publish() {
    setStatus('جاري النشر...')
    try { await request('/admin/content/publish',{method:'POST',body:JSON.stringify({content})}); setStatus('تم النشر بنجاح') }
    catch { setStatus('تعذر النشر — Backend غير متاح') }
  }

  return <div className="cms-shell" dir="rtl">
    <header className="cms-topbar">
      <div className="cms-brand"><span>C</span><b>CROWN <small>ADMIN</small></b></div>
      <div className="cms-actions">
        <span className="save-status">{status}</span>
        <button className="ghost" onClick={()=>setEditing(v=>!v)}>{editing ? 'إغلاق التحرير' : 'تحرير'}</button>
        <button className="ghost" onClick={saveDraft}>حفظ المسودة</button>
        <button className="admin-primary compact" onClick={publish}>نشر</button>
        <button className="avatar" title={admin?.username || 'Admin'} onClick={onLogout}>خروج</button>
      </div>
    </header>

    <div className="editor-workspace">
      {editing && <aside className="editor-sidebar" dir="rtl">
        <div className="sidebar-head"><small>SITE EDITOR</small><h2>تحرير الموقع</h2></div>
        <div className="section-tabs">
          {['hero','product','faq','media','seo'].map(x=><button key={x} className={section===x?'active':''} onClick={()=>setSection(x)}>{({hero:'Hero',product:'المنتج',faq:'FAQ',media:'الصور',seo:'SEO'})[x]}</button>)}
        </div>
        <div className="fields">
          {section==='hero' && <>
            <Field label="Eyebrow" value={content.hero.eyebrow} onChange={v=>setHero('eyebrow',v)} />
            <Field label="العنوان — السطر الأول" value={content.hero.titleLine1} onChange={v=>setHero('titleLine1',v)} />
            <Field label="العنوان — السطر الثاني" value={content.hero.titleLine2} onChange={v=>setHero('titleLine2',v)} />
            <Field textarea label="الوصف" value={content.hero.description} onChange={v=>setHero('description',v)} />
            <Field label="الزر الرئيسي" value={content.hero.primaryCta} onChange={v=>setHero('primaryCta',v)} />
            <Field label="الزر الثانوي" value={content.hero.secondaryCta} onChange={v=>setHero('secondaryCta',v)} />
          </>}
          {section==='product' && <>
            <Field label="اسم المنتج" value={content.product.name} onChange={v=>setProduct('name',v)} />
            <Field label="السعر" value={content.product.price} onChange={v=>setProduct('price',v)} />
            <Field label="الحجم" value={content.product.size} onChange={v=>setProduct('size',v)} />
          </>}
          {section==='faq' && <div className="placeholder-panel">محرر FAQ المتعدد سيُربط بقاعدة البيانات في هذه المرحلة.</div>}
          {section==='media' && <div className="placeholder-panel">Media Library جاهزة للربط مع Object Storage. لن تُحفظ الصور داخل GitHub أو PostgreSQL.</div>}
          {section==='seo' && <div className="placeholder-panel">سيتم إدارة Title وDescription وSocial image هنا بدون تعديل الكود.</div>}
        </div>
      </aside>}

      <main className="site-preview" dir="rtl">
        <div className="preview-label">LIVE PREVIEW · التعديلات غير منشورة حتى تضغط «نشر»</div>
        <section className="preview-hero">
          <div className="preview-copy">
            <p>{content.hero.eyebrow}</p>
            <h1>{content.hero.titleLine1}<br/><em>{content.hero.titleLine2}</em></h1>
            <div className="preview-description">{content.hero.description}</div>
            <div className="preview-rating">★★★★★ <span>تجربة Crown للعناية اليومية</span></div>
            <div className="preview-price"><strong>{content.product.price}</strong><span>ر.س · {content.product.size}</span></div>
            <div className="preview-buttons"><button>{content.hero.primaryCta}</button><button className="outline">{content.hero.secondaryCta}</button></div>
          </div>
          <div className="preview-image"><img src="/Crown-Oil-Hier/assets/hero-light.jpg" alt="Crown Hair Oil preview" /></div>
        </section>
        <section className="preview-summary"><small>معاينة الصفحة</small><h2>{previewTitle}</h2><p>هذه المعاينة تستخدم نفس هوية Crown، ومع المراحل التالية سنحوّل جميع أقسام الموقع إلى Components قابلة للتحرير من نفس اللوحة.</p></section>
      </main>
    </div>
  </div>
}

export default function AdminCMS() {
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)
  useEffect(()=>{ request('/admin/auth/me').then(r=>setAdmin(r.admin)).catch(()=>{}).finally(()=>setChecking(false)) },[])
  async function logout(){ try{await request('/admin/auth/logout',{method:'POST'})}catch{} setAdmin(null) }
  if (checking) return <div className="admin-loading">CROWN ADMIN</div>
  return admin ? <Editor admin={admin} onLogout={logout}/> : <Login onLogin={setAdmin}/>
}
