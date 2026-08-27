import React from 'react'

export default class AdminErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null} }
  static getDerivedStateFromError(error){ return {error} }
  componentDidCatch(error,info){ console.error('Crown Admin runtime error',error,info) }
  reset=()=>{ this.setState({error:null}); location.reload() }
  render(){
    if(!this.state.error) return this.props.children
    return <main dir="rtl" style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#f7f3ea',fontFamily:'Alexandria, sans-serif'}}>
      <section style={{width:'min(560px,100%)',background:'#fffdf8',border:'1px solid rgba(43,48,36,.15)',padding:32,boxShadow:'0 24px 70px rgba(33,29,23,.12)'}}>
        <img src="/Crown-Oil-Hier/crown-logo.png" alt="Crown Hair Oil" style={{width:76,height:76,objectFit:'contain',display:'block',margin:'0 auto 16px'}}/>
        <h1 style={{margin:'0 0 10px',fontSize:26}}>تعذر عرض لوحة الإدارة</h1>
        <p style={{color:'#6f675c',lineHeight:1.9}}>تم منع الخطأ من تحويل الصفحة إلى شاشة فارغة. أعد تحميل اللوحة، وإذا تكرر الخطأ سيتم الاحتفاظ بواجهة الاستعادة بدل اختفاء التطبيق.</p>
        <button onClick={this.reset} style={{border:0,borderRadius:999,padding:'12px 22px',background:'#2b3024',color:'#fff',cursor:'pointer'}}>إعادة تحميل لوحة الإدارة</button>
      </section>
    </main>
  }
}
