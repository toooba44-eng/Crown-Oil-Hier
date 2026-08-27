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

const emptyBank={bankName:'',accountNumber:'',iban:''}

export default function PaymentSettings(){
  const [content,setContent]=useState(null)
  const [bank,setBank]=useState(emptyBank)
  const [status,setStatus]=useState('تحميل الإعدادات...')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    request('/content').then(r=>{
      const next=r.content||{}
      setContent(next)
      setBank({...emptyBank,...(next.checkout?.bankTransfer||{})})
      setStatus('جاهز')
    }).catch(()=>setStatus('تعذر تحميل إعدادات الدفع. تأكد من تسجيل الدخول.'))
  },[])

  const update=(key,value)=>setBank(prev=>({...prev,[key]:value}))
  const payload=()=>({
    ...(content||{}),
    checkout:{
      ...((content||{}).checkout||{}),
      bankTransfer:{...bank},
    },
  })

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
    }catch{setStatus('تعذر حفظ إعدادات الحساب البنكي')}
    finally{setBusy(false)}
  }

  return <main className="bank-admin" dir="rtl">
    <section className="bank-admin-card">
      <header><small>PAYMENT SETTINGS</small><h1>الدفع والتحويل البنكي</h1><p>هذه البيانات تظهر للعميل فقط عند اختيار «تحويل بنكي» في صفحة إتمام الطلب.</p></header>
      <div className="bank-admin-status">{status}</div>
      <label><span>اسم البنك</span><input value={bank.bankName} onChange={e=>update('bankName',e.target.value)} placeholder="مثال: مصرف الراجحي"/></label>
      <label><span>رقم الحساب</span><input dir="ltr" value={bank.accountNumber} onChange={e=>update('accountNumber',e.target.value)} placeholder="Account Number"/></label>
      <label><span>رقم IBAN</span><input dir="ltr" value={bank.iban} onChange={e=>update('iban',e.target.value.toUpperCase())} placeholder="SA00 0000 0000 0000 0000 0000"/></label>
      <div className="bank-admin-preview"><small>معاينة بيانات التحويل</small><div><span>اسم البنك</span><b>{bank.bankName||'—'}</b></div><div><span>رقم الحساب</span><b dir="ltr">{bank.accountNumber||'—'}</b></div><div><span>IBAN</span><b dir="ltr">{bank.iban||'—'}</b></div></div>
      <div className="bank-admin-actions"><button disabled={busy||!content} onClick={()=>save('draft')}>حفظ المسودة</button><button className="publish" disabled={busy||!content} onClick={()=>save('publish')}>نشر على الموقع</button></div>
    </section>
  </main>
}
