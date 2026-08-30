import { useEffect, useMemo, useState } from 'react'

const DEFAULTS={
  card:{enabled:true,label:'بطاقة / مدى / Apple Pay',note:'قريبًا'},
  cod:{enabled:true,label:'الدفع عند الاستلام',note:''},
  bank:{enabled:true,label:'تحويل بنكي',note:''},
}

export default function PaymentMethods({ checkout }){
  const configured=checkout?.paymentMethods||{}
  const methods=useMemo(()=>({
    card:{...DEFAULTS.card,...(configured.card||{})},
    cod:{...DEFAULTS.cod,...(configured.cod||{})},
    bank:{...DEFAULTS.bank,...(configured.bank||{})},
  }),[configured])
  const visible=useMemo(()=>['card','cod','bank'].filter(key=>methods[key].enabled!==false),[methods])
  const [method,setMethod]=useState(visible[0]||'')
  const bank=checkout?.bankTransfer||{}
  const hasBank=Boolean(bank.bankName||bank.accountNumber||bank.iban)

  useEffect(()=>{
    if(!visible.includes(method)) setMethod(visible[0]||'')
  },[visible,method])

  if(!visible.length) return <div className="payment payment-methods"><p className="bank-empty">لا توجد طريقة دفع متاحة حاليًا.</p></div>

  return <div className="payment payment-methods">
    {visible.includes('card')&&<label><input type="radio" name="pay" value="card" checked={method==='card'} onChange={()=>setMethod('card')}/> {methods.card.label} {methods.card.note&&<small>({methods.card.note})</small>}</label>}
    {visible.includes('cod')&&<label><input type="radio" name="pay" value="cod" checked={method==='cod'} onChange={()=>setMethod('cod')}/> {methods.cod.label} {methods.cod.note&&<small>({methods.cod.note})</small>}</label>}
    {visible.includes('bank')&&<label><input type="radio" name="pay" value="bank" checked={method==='bank'} onChange={()=>setMethod('bank')}/> {methods.bank.label} {methods.bank.note&&<small>({methods.bank.note})</small>}</label>}
    {method==='bank'&&visible.includes('bank')&&<div className="bank-transfer-details">
      <div className="bank-transfer-title"><b>بيانات التحويل البنكي</b><span>يرجى مراجعة البيانات قبل إجراء التحويل.</span></div>
      {hasBank?<>
        <div><span>اسم البنك</span><b>{bank.bankName||'—'}</b></div>
        <div><span>رقم الحساب</span><b dir="ltr">{bank.accountNumber||'—'}</b></div>
        <div><span>IBAN</span><b dir="ltr" className="bank-iban">{bank.iban||'—'}</b></div>
      </>:<p className="bank-empty">سيتم إضافة بيانات الحساب البنكي من لوحة الإدارة.</p>}
    </div>}
  </div>
}
