import { cities, districts } from 'saudi-national-address'

const cityIdsWithDistricts = new Set(districts.map(d => d.city_id))
const checkoutCities = cities
  .filter(city => cityIdsWithDistricts.has(city.city_id))
  .sort((a,b) => a.name_ar.localeCompare(b.name_ar, 'ar'))

export default function SaudiAddressFields({ cityId, districtId, onCityChange, onDistrictChange }) {
  const districtsForCity = cityId
    ? districts.filter(d => String(d.city_id) === String(cityId)).sort((a,b) => a.name_ar.localeCompare(b.name_ar, 'ar'))
    : []

  return <>
    <label className="checkout-field-block">
      <span className="field-instruction">اختاري مدينة داخل المملكة من القائمة.</span>
      <select required autoComplete="address-level2" value={cityId || ''} onChange={e => {
        const selected = checkoutCities.find(city => String(city.city_id) === e.target.value)
        onCityChange(selected || null)
      }}>
        <option value="">المدينة *</option>
        {checkoutCities.map(city => <option key={city.city_id} value={city.city_id}>{city.name_ar}</option>)}
      </select>
    </label>

    <label className="checkout-field-block">
      <span className="field-instruction">اختاري الحي المسجل للمدينة المختارة.</span>
      <select required autoComplete="address-level3" value={districtId || ''} disabled={!cityId} onChange={e => {
        const selected = districtsForCity.find(d => String(d.district_id) === e.target.value)
        onDistrictChange(selected || null)
      }}>
        <option value="">{cityId ? 'الحي *' : 'اختاري المدينة أولًا *'}</option>
        {districtsForCity.map(district => <option key={district.district_id} value={district.district_id}>{district.name_ar}</option>)}
      </select>
    </label>
  </>
}
