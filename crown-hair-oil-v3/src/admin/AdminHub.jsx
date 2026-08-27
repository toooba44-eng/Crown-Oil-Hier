import { useState } from 'react'
import AdminVisualCMS from './AdminVisualCMS.jsx'
import CommerceAdmin from './CommerceAdmin.jsx'
import PaymentSettings from './PaymentSettings.jsx'
import ContactSettings from './ContactSettings.jsx'

export default function AdminHub(){
  const params=new URLSearchParams(location.search)
  const requested=params.get('mode')
  const initial=requested==='commerce'?'commerce':requested==='payments'?'payments':requested==='contact'?'contact':'site'
  const [mode,setMode]=useState(initial)
  const change=next=>{setMode(next);const url=new URL(location.href);next==='site'?url.searchParams.delete('mode'):url.searchParams.set('mode',next);history.replaceState({},'',url)}
  return <div className="admin-hub" dir="rtl">
    <nav className="admin-hub-nav" aria-label="أقسام لوحة الإدارة">
      <div className="admin-hub-logo"><img src="/Crown-Oil-Hier/crown-logo.png" alt="Crown Hair Oil"/><span><b>CROWN</b><small>ADMIN</small></span></div>
      <div className="admin-hub-switch"><button className={mode==='site'?'active':''} onClick={()=>change('site')}>تحرير الموقع</button><button className={mode==='contact'?'active':''} onClick={()=>change('contact')}>تواصل معنا</button><button className={mode==='commerce'?'active':''} onClick={()=>change('commerce')}>Commerce</button><button className={mode==='payments'?'active':''} onClick={()=>change('payments')}>الدفع والتحويل البنكي</button></div>
    </nav>
    <div className="admin-hub-body">{mode==='site'?<AdminVisualCMS/>:mode==='contact'?<ContactSettings/>:mode==='commerce'?<CommerceAdmin onOpenSite={()=>change('site')}/>:<PaymentSettings/>}</div>
  </div>
}
