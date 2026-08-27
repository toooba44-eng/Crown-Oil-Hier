import { useState } from 'react'
import AdminVisualCMS from './AdminVisualCMS.jsx'
import CommerceAdmin from './CommerceAdmin.jsx'

export default function AdminHub(){
  const [mode,setMode]=useState(()=>new URLSearchParams(location.search).get('mode')==='commerce'?'commerce':'site')
  const change=next=>{setMode(next);const url=new URL(location.href);next==='commerce'?url.searchParams.set('mode','commerce'):url.searchParams.delete('mode');history.replaceState({},'',url)}
  return <div className="admin-hub" dir="rtl">
    <nav className="admin-hub-nav" aria-label="أقسام لوحة الإدارة">
      <div className="admin-hub-logo"><img src="/Crown-Oil-Hier/crown-logo.png" alt="Crown Hair Oil"/><span><b>CROWN</b><small>ADMIN</small></span></div>
      <div className="admin-hub-switch"><button className={mode==='site'?'active':''} onClick={()=>change('site')}>تحرير الموقع</button><button className={mode==='commerce'?'active':''} onClick={()=>change('commerce')}>Commerce</button></div>
    </nav>
    <div className="admin-hub-body">{mode==='site'?<AdminVisualCMS/>:<CommerceAdmin onOpenSite={()=>change('site')}/>}</div>
  </div>
}
