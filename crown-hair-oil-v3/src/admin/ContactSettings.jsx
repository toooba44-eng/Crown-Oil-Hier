import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_ADMIN_API_URL || 'https://asubcanztloxiddshakz.supabase.co/functions/v1/crown-admin-api'
const TOKEN_KEY = 'crown_admin_session'

async function request(path, options={}) {
  const token=sessionStorage.getItem(TOKEN_KEY)||''
  const response=await fetch(`${API}${path}`,{
    headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},
    ...options,
  })
  const data=await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(data.error||'request_failed')
  return data
}

const defaults={
  backText:'العودة إلى Crown',
  title:'تواصل معنا',
  intro:'نحن هنا لمساعدتك في الطلبات، الشحن، استخدام المنتج، وأي استفسار عن Crown Hair Oil.',
  cardTitle:'خدمة العملاء',
  cardIntro:'اختاري قناة التواصل المناسبة لك وسنكون سعداء بخدمتك.',
  whatsapp:{label:'WhatsApp',value:'',url:''},
  email:{label:'Email',value:'',url:''},
  instagram:{label:'Instagram',value:'',url:''},
}

export default function ContactSettings(){
  const [content,setContent]=useState(null)
  const [contact,setContact]=useState(defaults)
  const [status,setStatus]=useState('تحميل صفحة التواصل...')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    request('/content').then(r=>{
      const next=r.content||{}
      const saved=next.contact||{}
      setContent(next)
      setContact({
        ...defaults,...saved,
        whatsapp:{...defaults.whatsapp,...(saved.whatsapp||{})},
        email:{...defaults.email,...(saved.email||{})},
        instagram:{...defaults.instagram,...(saved.instagram||{})},
      })
      setStatus('جاهز')
    }).catch(()=>setStatus('تعذر تحميل صفحة التواصل. تأكد من تسجيل الدخول.'))
  },[])

  const set=(key,value)=>setContact(prev=>({...prev,[key]:value}))
  const setChannel=(channel,key,value)=>setContact(prev=>({...prev,[channel]:{...prev[channel],[key]:value}}))
  const payload=()=>({...content,contact})

  async function save(mode){
    if(!content)return
    setBusy(true);setStatus(mode==='publish'?'جاري النشر...':'حفظ المسودة...')
    try{
      const next=payload()
      const r=mode==='publish'
        ? await request('/content/publish',{method:'POST',body:JSON.stringify({content:next})})
        : await request('/content/draft',{method:'PUT',body:JSON.stringify({content:next})})
      setContent(next)
      setStatus(`${mode==='publish'?'تم النشر':'تم حفظ المسودة'} · الإصدار ${r.versionNo}`)
    }catch{setStatus('تعذر حفظ صفحة التواصل')}
    finally{setBusy(false)}
  }

  const channel=(key,title,hint)=><section className="contact-admin-channel">
    <h3>{title}</h3>
    <label>اسم القناة<input value={contact[key].label} onChange={e=>setChannel(key,'label',e.target.value)}/></label>
    <label>المعلومة الظاهرة للعميل<input value={contact[key].value} onChange={e=>setChannel(key,'value',e.target.value)} placeholder={hint}/></label>
    <label>الرابط عند الضغط<input dir="ltr" value={contact[key].url} onChange={e=>setChannel(key,'url',e.target.value)} placeholder={key==='whatsapp'?'https://wa.me/9665...':key==='email'?'mailto:name@example.com':'https://instagram.com/username'}/></label>
  </section>

  return <main className="contact-admin" dir="rtl">
    <section className="contact-admin-card">
      <header><small>CONTACT PAGE CMS</small><h1>تحرير صفحة تواصل معنا</h1><p>يمكنك تعديل جميع النصوص وقنوات التواصل. التغييرات لا تظهر للعملاء حتى الضغط على «نشر».</p></header>
      <div className="contact-admin-status">{status}</div>
      <div className="contact-admin-grid">
        <label>نص العودة<input value={contact.backText} onChange={e=>set('backText',e.target.value)}/></label>
        <label>عنوان الصفحة<input value={contact.title} onChange={e=>set('title',e.target.value)}/></label>
        <label className="wide">وصف الصفحة<textarea value={contact.intro} onChange={e=>set('intro',e.target.value)}/></label>
        <label>عنوان بطاقة خدمة العملاء<input value={contact.cardTitle} onChange={e=>set('cardTitle',e.target.value)}/></label>
        <label className="wide">النص داخل البطاقة<textarea value={contact.cardIntro} onChange={e=>set('cardIntro',e.target.value)}/></label>
      </div>
      <div className="contact-admin-channels">
        {channel('whatsapp','واتساب','مثال: +966 50 000 0000')}
        {channel('instagram','إنستقرام','مثال: @crownhairoil')}
        {channel('email','البريد الإلكتروني','مثال: hello@example.com')}
      </div>
      <div className="contact-admin-actions"><button disabled={busy||!content} onClick={()=>save('draft')}>حفظ المسودة</button><button className="publish" disabled={busy||!content} onClick={()=>save('publish')}>نشر على الموقع</button></div>
    </section>
  </main>
}
