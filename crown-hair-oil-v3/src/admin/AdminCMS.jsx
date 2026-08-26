import { useEffect, useMemo, useState } from 'react'

const API = import.meta.env.VITE_ADMIN_API_URL || 'https://asubcanztloxiddshakz.supabase.co/functions/v1/crown-admin-api'
const TOKEN_KEY = 'crown_admin_session'

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

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || ''
}

function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const token = getToken()
  const response = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await request('/login', { method: 'POST', body: JSON.stringify({ username, password }) })
      setToken(result.token)
      onLogin(result.admin)
      setPassword('')
    } catch (err) {
      setError(err.status === 401 ? 'اسم المستخدم أو كلمة المرور غير صحيحة.' : 'تعذر الاتصال بخدمة الإدارة. حاول مرة أخرى.')
    } finally {
      setBusy(false)
    }
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
      <small className="security-note">كلمة المرور لا تُحفظ داخل GitHub أو ملفات الموقع. تنتهي جلسة الإدارة تلقائيًا.</small>
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
  const [status, setStatus] = useState('تحميل المحتوى...')

  useEffect(() => {
    request('/content')
      .then(r => { if (r.content) setContent(r.content); setStatus('جاهز') })
      .catch(() => setStatus('تعذر تحميل المحتوى'))
  }, [])

  const previewTitle = useMemo(()=>`${content.hero.titleLine1} ${content.hero.titleLine2}`,[content])
  const setHero = (key, value) => setContent(c=>({...c,hero:{...c.hero,[key]:value}}))
  const setProduct = (key, value) => setContent(c=>({...c,product:{...c.product,[key]:value}}))

  async function saveDraft() {
    setStatus('حفظ المسودة...')
    try {
      const result = await request('/content/draft',{method:'PUT',body:JSON.stringify({content})})
      setStatus(`تم حفظ المسودة · الإصدار ${result.versionNo}`)
    } catch {
      setStatus('تعذر حفظ المسودة')
    }
  }

  async function publish() {
    setStatus('جاري النشر...')
    try {
      const result = await request('/content/publish',{method:'POST',body:JSON.stringify({content})})
      setStatus(`تم النشر · الإصدار ${result.versionNo}`)
    } catch {
      setStatus('تعذر النشر')
    }
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
          {section==='faq' && <div className="placeholder-panel">محرر FAQ الكامل سيتم ضمن المرحلة التالية.</div>}
          {section==='media' && <div className="placeholder-panel">Media Library سيتم ربطها بـSupabase Storage في المرحلة التالية.</div>}
          {section==='seo' && <div className="placeholder-panel">إدارة Title وDescription وSocial image ستكون من هنا.</div>}
        </div>
      </aside>}

      <main className="site-preview" dir="rtl">
        <div className="preview-label">LIVE PREVIEW · التعديلات لا تصل للعملاء حتى تضغط «نشر»</div>
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
        <section className="preview-summary"><small>معاينة الصفحة</small><h2>{previewTitle}</h2><p>المحتوى الآن متصل بقاعدة بيانات Crown الحقيقية، ويمكن حفظ نسخة Draft ثم نشرها كنسخة Published.</p></section>
      </main>
    </div>
  </div>
}

export default function AdminCMS() {
  const [admin, setAdmin] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!getToken()) { setChecking(false); return }
    request('/me').then(r=>setAdmin(r.admin)).catch(()=>setToken('')).finally(()=>setChecking(false))
  }, [])

  async function logout() {
    try { await request('/logout',{method:'POST'}) } catch {}
    setToken('')
    setAdmin(null)
  }

  if (checking) return <div className="admin-loading">CROWN ADMIN</div>
  return admin ? <Editor admin={admin} onLogout={logout}/> : <Login onLogin={setAdmin}/>
}
