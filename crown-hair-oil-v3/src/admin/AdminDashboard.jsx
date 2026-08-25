import './admin.css'

const orders=[
  {id:'CRN-1025',customer:'سارة محمد',city:'الرياض',amount:'119 ر.س',payment:'مدفوع',status:'قيد التجهيز'},
  {id:'CRN-1024',customer:'ريم أحمد',city:'جدة',amount:'238 ر.س',payment:'مدفوع',status:'تم الشحن'},
  {id:'CRN-1023',customer:'نورة علي',city:'الدمام',amount:'119 ر.س',payment:'عند الاستلام',status:'جديد'},
]

export default function AdminDashboard(){
  return <div className="admin-shell" dir="rtl">
    <aside className="admin-side">
      <div className="admin-logo"><span>C</span><b>CROWN<small>ADMIN</small></b></div>
      <nav>
        {['نظرة عامة','الطلبات','المنتجات','المخزون','العملاء','التقييمات','الخصومات','المحتوى','الشحن','الإعدادات'].map((x,i)=><button className={i===0?'active':''} key={x}>{x}</button>)}
      </nav>
      <div className="admin-note">Preview UI<br/><small>يتطلب تسجيل دخول Backend قبل الإنتاج</small></div>
    </aside>
    <main className="admin-main">
      <header className="admin-top"><div><p>CROWN COMMERCE</p><h1>نظرة عامة</h1></div><div className="admin-user"><span>AA</span><div><b>Store Admin</b><small>Administrator</small></div></div></header>
      <section className="admin-alert">هذه لوحة تصميم وتجهيز فقط. لا يوجد Authentication أو تعديل بيانات حقيقية حتى ربط Backend آمن.</section>
      <section className="metric-grid">
        <article><small>طلبات اليوم</small><strong>12</strong><em>+18% من أمس</em></article>
        <article><small>إيرادات اليوم</small><strong>1,785 <i>ر.س</i></strong><em>VAT included</em></article>
        <article><small>قيد التجهيز</small><strong>7</strong><em>تحتاج متابعة</em></article>
        <article><small>مخزون Crown 100ml</small><strong>84</strong><em>مستوى جيد</em></article>
      </section>
      <section className="admin-grid">
        <article className="admin-panel orders-panel">
          <div className="panel-head"><div><small>ORDERS</small><h2>أحدث الطلبات</h2></div><button>عرض الكل</button></div>
          <div className="order-table"><div className="tr head"><span>الطلب</span><span>العميل</span><span>المدينة</span><span>الإجمالي</span><span>الدفع</span><span>الحالة</span></div>{orders.map(o=><div className="tr" key={o.id}><b>{o.id}</b><span>{o.customer}</span><span>{o.city}</span><span>{o.amount}</span><span>{o.payment}</span><mark>{o.status}</mark></div>)}</div>
        </article>
        <article className="admin-panel activity"><div className="panel-head"><div><small>ACTIVITY</small><h2>حالة المتجر</h2></div></div><ul><li><span>●</span><div><b>Payments API</b><small>غير مربوط بعد</small></div></li><li><span>●</span><div><b>Shipping API</b><small>غير مربوط بعد</small></div></li><li className="ok"><span>●</span><div><b>Storefront V3</b><small>جاهز للاختبار</small></div></li><li className="ok"><span>●</span><div><b>CI Build</b><small>يتم التحقق تلقائيًا</small></div></li></ul></article>
      </section>
      <section className="admin-panel product-admin"><div className="panel-head"><div><small>PRODUCT</small><h2>Crown Hair Oil</h2></div><button>تحرير المنتج</button></div><div className="product-fields"><label>السعر<b>119 ر.س</b></label><label>الحجم<b>100 ml</b></label><label>SKU<b>CRN-OIL-100</b></label><label>الحالة<b className="live">نشط</b></label></div><p>بعد ربط Backend ستتم إدارة الاسم والوصف والسعر والمخزون والصور والمكونات وطريقة الاستخدام وSEO من هنا بدون تعديل الكود.</p></section>
    </main>
  </div>
}
