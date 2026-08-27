import { useState } from 'react'

export default function PaymentMethods({ checkout }){
  const [method,setMethod]=useState('card')
  const bank=checkout?.bankTransfer||{}
  const hasBank=Boolean(bank.bankName||bank.accountNumber||bank.iban)
  return <div className="payment payment-methods">
    <label><input type="radio" name="pay" value="card" checked={method==='card'} onChange={()=>setMethod('card')}/> بطاقة / مدى / Apple Pay <small>(قريبًا)</small></label>
    <label><input type="radio" name="pay" value="cod" checked={method==='cod'} onChange={()=>setMethod('cod')}/> الدفع عند الاستلام</label>
    <label><input type="radio" name="pay" value="bank" checked={method==='bank'} onChange={()=>setMethod('bank')}/> تحويل بنكي</label>
    {method==='bank'&&<div className="bank-transfer-details">
      <div className="bank-transfer-title"><b>بيانات التحويل البنكي</b><span>يرجى مراجعة البيانات قبل إجراء التحويل.</span></div>
      {hasBank?<>
        <div><span>اسم البنك</span><b>{bank.bankName||'—'}</b></div>
        <div><span>رقم الحساب</span><b dir="ltr">{bank.accountNumber||'—'}</b></div>
        <div><span>IBAN</span><b dir="ltr" className="bank-iban">{bank.iban||'—'}</b></div>
      </>:<p className="bank-empty">سيتم إضافة بيانات الحساب البنكي من لوحة الإدارة.</p>}
    </div>}
  </div>
}
