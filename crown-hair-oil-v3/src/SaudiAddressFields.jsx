import { useEffect, useMemo, useRef, useState } from 'react'
import { cities, districts } from 'saudi-national-address'

const cityIdsWithDistricts = new Set(districts.map(d => d.city_id))
const checkoutCities = cities
  .filter(city => cityIdsWithDistricts.has(city.city_id))
  .sort((a,b) => a.name_ar.localeCompare(b.name_ar, 'ar'))

function normalize(value='') {
  return value.trim().toLowerCase().replace(/[أإآ]/g,'ا').replace(/ة/g,'ه')
}

function SearchDropdown({ label, instruction, placeholder, value, options, disabled=false, onSelect }) {
  const [open,setOpen]=useState(false)
  const [query,setQuery]=useState('')
  const root=useRef(null)
  const selected=options.find(item=>String(item.id)===String(value))
  const filtered=useMemo(()=>{
    const q=normalize(query)
    if(!q)return options.slice(0,120)
    return options.filter(item=>normalize(item.name).includes(q)).slice(0,120)
  },[options,query])

  useEffect(()=>{
    const close=e=>{if(root.current&&!root.current.contains(e.target)){setOpen(false);setQuery('')}}
    document.addEventListener('pointerdown',close)
    return()=>document.removeEventListener('pointerdown',close)
  },[])

  const choose=item=>{onSelect(item.raw);setOpen(false);setQuery('')}
  return <label className="checkout-field-block address-field" ref={root}>
    <span className="field-instruction">{instruction}</span>
    <div className={`search-select ${open?'is-open':''} ${disabled?'is-disabled':''}`}>
      <button type="button" className="search-select-trigger" disabled={disabled} onClick={()=>{if(!disabled)setOpen(v=>!v)}} aria-haspopup="listbox" aria-expanded={open}>
        <span className={selected?'':'placeholder'}>{selected?.name||placeholder}</span><b aria-hidden="true">⌄</b>
      </button>
      {open&&<div className="search-select-menu">
        <div className="search-select-search"><span aria-hidden="true">⌕</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder={`ابحثي عن ${label}...`} aria-label={`البحث عن ${label}`}/></div>
        <div className="search-select-options" role="listbox">
          {filtered.length?filtered.map(item=><button type="button" role="option" aria-selected={String(item.id)===String(value)} className={String(item.id)===String(value)?'selected':''} key={item.id} onClick={()=>choose(item)}>{item.name}</button>):<p className="search-select-empty">لا توجد نتائج مطابقة.</p>}
        </div>
      </div>}
    </div>
    <input className="address-required-proxy" tabIndex="-1" aria-hidden="true" required value={value||''} onChange={()=>{}} />
  </label>
}

export default function SaudiAddressFields({ cityId, districtId, onCityChange, onDistrictChange }) {
  const districtsForCity=useMemo(()=>cityId
    ? districts.filter(d=>String(d.city_id)===String(cityId)).sort((a,b)=>a.name_ar.localeCompare(b.name_ar,'ar'))
    : [],[cityId])
  const cityOptions=useMemo(()=>checkoutCities.map(city=>({id:city.city_id,name:city.name_ar,raw:city})),[])
  const districtOptions=useMemo(()=>districtsForCity.map(d=>({id:d.district_id,name:d.name_ar,raw:d})),[districtsForCity])

  return <>
    <SearchDropdown label="المدينة" instruction="اختاري مدينة داخل المملكة من القائمة." placeholder="المدينة *" value={cityId} options={cityOptions} onSelect={onCityChange}/>
    <SearchDropdown label="الحي" instruction="اختاري الحي المسجل للمدينة المختارة." placeholder={cityId?'الحي *':'اختاري المدينة أولًا *'} value={districtId} options={districtOptions} disabled={!cityId} onSelect={onDistrictChange}/>
  </>
}
