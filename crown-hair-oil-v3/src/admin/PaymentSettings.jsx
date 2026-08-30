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
  card:{enabled:true,label:'بطاقة / مدى / Apple Pay',note:'قريبًا'},
  cod:{enabled:true,label:'الدفع عند الاستلام',note:''},
  bank:{enabled:true,label:'تحويل بنكي',note:''},
}
const emptyBank={bankName:'',accountNumber:'',iban:''}

function Toggle({checked,onChange}){
  return <label className="payment-toggle"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span className="payment-toggle-track"><i/></span><b>{checked?'ظاهر في الموقع':'مخفي من الموقع'}</b></label>
}

export default function PaymentSettings(){
  const [content,setContent]=useState(null)
  const [methods,setMethods]=useState(defaults)
  const [bank,setBank]=useState(emptyBank)
  const [active,setActive]=useState('card')
  const [status,setStatus]=useState('تحميل الإعدادات...')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    request('/content').then(r=>{
      const next=r.content||{}
      const stored=next.checkout?.paymentMethods||{}
      setContent(next)
      setMethods({
        card:{...defaults.card,...(stored.card||{})},
        cod:{...defaults.cod,...(stored.cod||{})},
        bank:{...defaults.bank,...(stored.bank||{})},
      })
      setBank({...emptyBank,...(next.checkout?.bankTransfer||{})})
      setStatus('جاهز')
    }).catch(()=>setStatus('تعذر تحميل إعدادات الدفع. تأكد من تسجيل الدخول.'))
  },[])

  const updateMethod=(key,field,value)=>setMethods(prev=>({...prev,[key]:{...prev[key],[field]:value}}))
  const updateBank=(key,value)=>setBank(prev=>({...prev,[key]:value}))
  const payload=()=>({
    ...(content||{}),
    checkout:{
      ...((content||{}).checkout||{}),
      paymentMethods:methods,
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
    }catch{setStatus('تعذر حفظ إعدادات طرق الدفع')}
    finally{setBusy(false)}
  }

  const selected=methods[active]
  return <main className="bank-admin payment-manager" dir="rtl">
    <section className="bank-admin-card payment-manager-card">
      <header><small>PAYMENT METHODS</small><h1>إدارة طرق الدفع</h1><p>تحكّم في طرق الدفع التي تظهر للعميل، وعدّل إعدادات كل طريقة ثم احفظ المسودة أو انشرها على الموقع.</p></header>
      <div className="bank-admin-status">{status}</div>

      <div className="payment-manager-layout">
        <aside className="payment-manager-menu" aria-label="طرق الدفع">
          <button className={active==='card'?'active':''} onClick={()=>setActive('card')}><span>بطاقة / مدى / Apple Pay</span><small>{methods.card.enabled?'ظاهر':'مخفي'}</small></button>
          <button className={active==='cod'?'active':''} onClick={()=>setActive('cod')}><span>الدفع عند الاستلام</span><small>{methods.cod.enabled?'ظاهر':'مخفي'}</small></button>
          <button className={active==='bank'?'active':''} onClick={()=>setActive('bank')}><span>التحويل البنكي</span><small>{methods.bank.enabled?'ظاهر':'مخفي'}</small></button>
        </aside>

        <section className="payment-manager-panel">
          <div className="payment-method-heading">
            <div><small>METHOD SETTINGS</small><h2>{selected.label}</h2></div>
            <Toggle checked={selected.enabled} onChange={v=>updateMethod(active,'enabled',v)}/>
          </div>

          <label><span>اسم طريقة الدفع الظاهر للعميل</span><input value={selected.label} onChange={e=>updateMethod(active,'label',e.target.value)} /></label>
          <label><span>ملاحظة قصيرة</span><input value={selected.note||''} onChange={e=>updateMethod(active,'note',e.target.value)} placeholder={active==='card'?'مثال: قريبًا':'اختياري'} /></label>

          {active==='card'&&<div className="payment-info-box"><b>بطاقة / مدى / Apple Pay</b><p>استخدم مفتاح الظهور لإظهار أو إخفاء هذه الطريقة في صفحة إتمام الطلب. ربط بوابة الدفع الإلكترونية يتم بشكل مستقل عند تفعيل مزود دفع إنتاجي.</p></div>}
          {active==='cod'&&<div className="payment-info-box"><b>الدفع عند الاستلام</b><p>استخدم مفتاح الظهور للتحكم في إتاحة الدفع عند الاستلام للعملاء. يمكن إخفاؤه فورًا من Checkout عند عدم الرغبة في استخدامه.</p></div>}

          {active==='bank'&&<>
            <div className="bank-section-divider"><span>بيانات الحساب البنكي</span></div>
            <label><span>اسم البنك</span><input value={bank.bankName} onChange={e=>updateBank('bankName',e.target.value)} placeholder="مثال: مصرف الراجحي"/></label>
            <label><span>رقم الحساب</span><input dir="ltr" value={bank.accountNumber} onChange={e=>updateBank('accountNumber',e.target.value)} placeholder="Account Number"/></label>
            <label><span>رقم IBAN</span><input dir="ltr" value={bank.iban} onChange={e=>updateBank('iban',e.target.value.toUpperCase())} placeholder="SA00 0000 0000 0000 0000 0000"/></label>
            <div className="bank-admin-preview"><small>معاينة بيانات التحويل</small><div><span>اسم البنك</span><b>{bank.bankName||'—'}</b></div><div><span>رقم الحساب</span><b dir="ltr">{bank.accountNumber||'—'}</b></div><div><span>IBAN</span><b dir="ltr">{bank.iban||'—'}</b></div></div>
          </>}
        </section>
      </div>

      <div className="bank-admin-actions"><button disabled={busy||!content} onClick={()=>save('draft')}>حفظ المسودة</button><button className="publish" disabled={busy||!content} onClick={()=>save('publish')}>نشر على الموقع</button></div>
    </section>
  </main>
}
