const BENEFITS = [
  { icon: '🌿', title: 'مكونات طبيعية 100٪', desc: 'أرغان، روزماري، وزيت زيتون بكر — بدون سيليكون أو كبريتات.' },
  { icon: '📏', title: 'تطويل وتكثيف', desc: 'يحفّز البصيلات ويقلّل التساقط لنمو أكثر كثافة.' },
  { icon: '✨', title: 'لمعان من أول استخدام', desc: 'لمسة حريرية وبريق طبيعي دون أثر دهني ثقيل.' },
  { icon: '📆', title: 'روتين بسيط', desc: 'مرتان أسبوعياً فقط، ونتائج ملحوظة من أول 4 أسابيع.' },
];

export default function Home({ settings = {}, onShop }) {
  return (
    <div className="screen home-screen">
      <div className="home-hero">
        <img src="assets/hero-light-crop.jpg" alt="زجاجة Crown Hair Oil بين الأعشاب" />
        <div className="home-hero-overlay" />
        <div className="home-hero-content">
          <img className="home-logo" src="assets/logo.jpg" alt="" />
          <p className="home-eyebrow">{settings.tagline || 'مزيج زيوت طبيعية 100٪'}</p>
          <h1>سرّ الشعر الطويل والكثيف</h1>
          <p className="home-sub">زيت واحد مركّز من الأرغان والروزماري وزيت الزيتون، يغذّي شعرك من الجذور.</p>
          <button className="btn btn-primary" onClick={onShop}>تسوّقي الآن</button>
        </div>
      </div>

      <section className="home-section">
        <h2>لماذا Crown؟</h2>
        <div className="benefit-list">
          {BENEFITS.map((b) => (
            <div className="benefit-item" key={b.title}>
              <span className="benefit-icon" aria-hidden="true">{b.icon}</span>
              <div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-section">
        <h2>طريقة الاستخدام</h2>
        <ol className="steps-list">
          <li><b>١</b> قسّمي الشعر لأقسام صغيرة.</li>
          <li><b>٢</b> دلّكي فروة الرأس بالزيت لدقيقتين.</li>
          <li><b>٣</b> مرّري الزيت حتى الأطراف واتركيه قبل الغسل.</li>
        </ol>
      </section>

      <section className="home-cta">
        <img src="assets/hero-dark-crop.jpg" alt="" />
        <div>
          <h2>جرّبي Crown Hair Oil الآن</h2>
          <p>توصيل لجميع مناطق المملكة — شحن مجاني فوق 200 ر.س.</p>
          <button className="btn btn-light" onClick={onShop}>اطلبي زجاجتك</button>
        </div>
      </section>
    </div>
  );
}
