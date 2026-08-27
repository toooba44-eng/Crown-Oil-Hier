const API='https://asubcanztloxiddshakz.supabase.co/functions/v1/crown-admin-api/public/content'
const defaults={
  backText:'العودة إلى Crown',
  title:'تواصل معنا',
  intro:'نحن هنا لمساعدتك في الطلبات، الشحن، استخدام المنتج، وأي استفسار عن Crown Hair Oil.',
  cardTitle:'خدمة العملاء',
  cardIntro:'اختاري قناة التواصل المناسبة لك وسنكون سعداء بخدمتك.',
  whatsapp:{label:'WhatsApp',value:'سيتم إضافته',url:''},
  email:{label:'Email',value:'سيتم إضافته',url:''},
  instagram:{label:'Instagram',value:'سيتم إضافته',url:''},
}

const icons={
  whatsapp:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0C5.5 0 .2 5.3.2 11.9c0 2.1.5 4.2 1.6 6L0 24l6.3-1.7a12 12 0 0 0 5.8 1.5h.1c6.5 0 11.8-5.3 11.8-11.9 0-3.2-1.2-6.2-3.5-8.4Zm-8.3 18.3h-.1a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 1 1 8.4 4.6Zm5.4-7.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2s-.8.9-1 1.1c-.2.2-.4.2-.7.1-1.7-.8-2.9-1.5-4-3.4-.3-.5.3-.5.8-1.7.1-.2 0-.4 0-.6l-.9-2.2c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.3 3.4 1.4 3.6c.2.2 2.5 3.8 6 5.3 2.2.9 3 .9 4.1.8.7-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.2-1.3-.1-.1-.4-.2-.7-.3Z"/></svg>`,
  instagram:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.6 2h8.8A5.6 5.6 0 0 1 22 7.6v8.8a5.6 5.6 0 0 1-5.6 5.6H7.6A5.6 5.6 0 0 1 2 16.4V7.6A5.6 5.6 0 0 1 7.6 2Zm-.2 2A3.4 3.4 0 0 0 4 7.4v9.2A3.4 3.4 0 0 0 7.4 20h9.2a3.4 3.4 0 0 0 3.4-3.4V7.4A3.4 3.4 0 0 0 16.6 4H7.4Zm9.4 1.5a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/></svg>`,
  email:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm9 8.3L20.6 6H3.4L12 12.3Zm0 2.4L3 8.1V18h18V8.1l-9 6.6Z"/></svg>`,
}

function safeUrl(value=''){
  const v=value.trim()
  if(!v)return ''
  if(/^https:\/\//i.test(v)||/^mailto:/i.test(v)||/^tel:/i.test(v))return v
  return ''
}

function card(key,data){
  const url=safeUrl(data.url)
  const tag=url?'a':'div'
  const external=url.startsWith('http')?' target="_blank" rel="noopener noreferrer"':''
  return `<${tag} class="contact-channel ${url?'clickable':''}" ${url?`href="${url}"${external}`:''}>
    <span class="channel-icon ${key}">${icons[key]}</span>
    <span class="channel-copy"><small>${escapeHtml(data.label||defaults[key].label)}</small><b>${escapeHtml(data.value||'سيتم إضافته')}</b></span>
    ${url?'<span class="channel-arrow">↗</span>':''}
  </${tag}>`
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))
}

function render(raw={}){
  const c={...defaults,...raw,
    whatsapp:{...defaults.whatsapp,...(raw.whatsapp||{})},
    email:{...defaults.email,...(raw.email||{})},
    instagram:{...defaults.instagram,...(raw.instagram||{})},
  }
  document.title=`${c.title} | Crown Hair Oil`
  document.querySelector('[data-back]').textContent=`← ${c.backText}`
  document.querySelector('[data-title]').textContent=c.title
  document.querySelector('[data-intro]').textContent=c.intro
  document.querySelector('[data-card-title]').textContent=c.cardTitle
  document.querySelector('[data-card-intro]').textContent=c.cardIntro
  document.querySelector('[data-channels]').innerHTML=card('whatsapp',c.whatsapp)+card('instagram',c.instagram)+card('email',c.email)
}

render(defaults)
fetch(API).then(r=>r.ok?r.json():Promise.reject()).then(data=>render(data.content?.contact||{})).catch(()=>{})
