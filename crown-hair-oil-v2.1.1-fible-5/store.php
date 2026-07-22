<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>المتجر | Crown Hair Oil</title>
<link rel="icon" type="image/jpeg" href="assets/logo.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=Tajawal:wght@400;500;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<script>(function(){var d=document.documentElement;d.dataset.theme=localStorage.getItem("crown_theme")||"light";var l=localStorage.getItem("crown_lang");l=(l==="en"||l==="ar")?l:"ar";d.lang=l;d.dir=l==="ar"?"rtl":"ltr";})();</script>
</head>
<body data-title-key="meta.storeTitle">

<header class="site-header">
  <div class="wrap">
    <a href="index.php" class="brand">
      <img src="assets/logo.jpg" alt="Crown Hair Oil">
      <span class="brand-name">Crown<span>HAIR OIL</span></span>
    </a>
    <nav class="main-nav" id="mainNav">
      <ul>
        <li><a href="index.php" data-i18n="nav.home">الرئيسية</a></li>
        <li><a href="store.php" data-i18n="nav.store">المتجر</a></li>
        <li><a href="#checkout" data-i18n="nav.checkout">الدفع والشحن</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <button class="lang-toggle" id="langToggle" data-i18n-attr="aria-label:a11y.lang;title:a11y.lang">EN</button>
      <button class="theme-toggle" id="themeToggle" data-i18n-attr="aria-label:a11y.theme;title:a11y.theme">🌙</button>
      <button class="cart-pill" id="cartToggle" data-i18n-attr="aria-label:a11y.cart">
        <span data-i18n="header.cart">🛍 السلة</span> <span id="cartCount" class="cart-count">0</span>
      </button>
      <button class="nav-toggle" id="navToggle" data-i18n-attr="aria-label:a11y.menu" aria-expanded="false" aria-controls="mainNav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<!-- CATALOG -->
<section class="section-cream" style="padding-top:56px;">
  <div class="wrap">
    <div class="store-toolbar">
      <h1 data-i18n="store.h1">متجر Crown Hair Oil</h1>
      <div class="tag-filter" id="tagFilter"></div>
    </div>
    <div class="product-grid" id="productGrid"></div>
  </div>
</section>

<!-- REAL RESULTS -->
<section class="section-tint" id="resultsSection" hidden>
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow" data-i18n="results.eyebrow">قبل / بعد</div>
      <h2 data-i18n="results.h2">نتائج حقيقية</h2>
      <p data-i18n="results.p">صور فعلية من عميلاتنا قبل وبعد استخدام الزيت.</p>
    </div>
  </div>
  <div class="results-viewport">
    <div class="results-track" id="resultsTrack"></div>
  </div>
</section>

<!-- CUSTOMER REVIEWS -->
<section class="section-cream" id="reviewsSection" hidden>
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow" data-i18n="reviews.eyebrow">آراء العميلات</div>
      <h2 data-i18n="reviews.h2">تقييمات العملاء</h2>
      <p data-i18n="reviews.p">آراء حقيقية من عميلاتنا بعد التجربة.</p>
    </div>
    <div class="reviews-grid" id="reviewsGrid"></div>
  </div>
</section>

<!-- CHECKOUT -->
<section class="section-tint" id="checkout">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow" data-i18n="checkout.eyebrow">إنهاء الطلب</div>
      <h2 data-i18n="checkout.h2">بيانات التوصيل والدفع</h2>
    </div>

    <div class="checkout-grid">
      <div>
        <form id="checkoutForm">
          <div class="field-row">
            <div class="field">
              <label for="f-name" data-i18n="f.name">الاسم الكامل</label>
              <input id="f-name" type="text" name="name" required placeholder="مثال: سارة العتيبي" data-i18n-ph="f.namePh">
            </div>
            <div class="field">
              <label for="f-phone" data-i18n="f.phone">رقم الجوال</label>
              <input id="f-phone" type="tel" name="phone" required inputmode="tel" pattern="[0-9+\- ]{9,15}" placeholder="05xxxxxxxx">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="f-city" data-i18n="f.city">المدينة</label>
              <input id="f-city" type="text" name="city" required placeholder="الرياض" data-i18n-ph="f.cityPh">
            </div>
            <div class="field">
              <label for="f-address" data-i18n="f.address">الحي / الرمز البريدي</label>
              <input id="f-address" type="text" name="address" required placeholder="حي الياسمين" data-i18n-ph="f.addressPh">
            </div>
          </div>
          <div class="field">
            <label for="f-notes" data-i18n="f.notes">ملاحظات على الطلب (اختياري)</label>
            <textarea id="f-notes" name="notes" rows="3" placeholder="مثال: التوصيل بعد الساعة 5 مساءً" data-i18n-ph="f.notesPh"></textarea>
          </div>

          <div class="field">
            <label data-i18n="f.pay">طريقة الدفع</label>
            <div class="pay-options">
              <label class="pay-option">
                <input type="radio" name="payMethod" value="cod" checked>
                <span><strong data-i18n="pay.codT">الدفع عند الاستلام</strong><span data-i18n="pay.codD">تدفعين نقداً أو بالشبكة عند وصول الطلب لبابك.</span></span>
              </label>
              <label class="pay-option">
                <input type="radio" name="payMethod" value="bank">
                <span><strong data-i18n="pay.bankT">تحويل بنكي</strong><span data-i18n="pay.bankD">سيتم إرسال رقم الحساب لتأكيد الطلب بعد إرساله.</span></span>
              </label>
              <label class="pay-option disabled">
                <input type="radio" name="payMethod" value="card" disabled>
                <span><strong data-i18n="pay.cardT">بطاقة مدى / فيزا — قريباً</strong><span data-i18n="pay.cardD">الدفع الإلكتروني المباشر قيد التفعيل حالياً.</span></span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" data-i18n="checkout.submit">تأكيد الطلب</button>
        </form>

        <div id="orderConfirm" class="order-confirm" hidden>
          <h3 data-i18n="confirm.h3">تم استلام طلبك بنجاح ✓</h3>
          <p><span data-i18n="confirm.pre">رقم الطلب: </span><strong id="orderNumber"></strong><span data-i18n="confirm.post">. سيتم التواصل معك لتأكيد التفاصيل والتوصيل.</span></p>
          <a href="store.php" class="btn btn-ghost btn-sm" data-i18n="confirm.continue">متابعة التسوق</a>
        </div>
      </div>

      <aside class="order-summary">
        <h3 style="margin-bottom:18px;font-size:18px;" data-i18n="summary.h3">ملخص الطلب</h3>
        <div id="checkoutSummary"></div>
        <p style="font-size:12px;margin-top:14px;" data-i18n="summary.note">شحن مجاني للطلبات أكثر من 200 ر.س. الأسعار تشمل ضريبة القيمة المضافة.</p>
      </aside>
    </div>
  </div>
</section>

<footer>
  <div class="wrap footer-bottom" style="border-top:none;padding-top:0;">
    <span data-i18n="footer.rights">© Crown Hair Oil — جميع الحقوق محفوظة</span>
    <span>@CrownHairOil_KSA</span>
  </div>
</footer>

<!-- CART DRAWER -->
<div class="cart-overlay" id="cartOverlay"></div>
<aside class="cart-drawer" id="cartDrawer" data-i18n-attr="aria-label:cart.h3">
  <div class="cart-head">
    <h3 data-i18n="cart.h3">سلة الشراء</h3>
    <button class="cart-close" id="cartClose" data-i18n-attr="aria-label:a11y.cartClose">×</button>
  </div>
  <div class="cart-items" id="cartItems"></div>
  <div class="cart-foot">
    <div class="cart-total-row"><span data-i18n="cart.total">الإجمالي</span><span id="cartTotal">0</span></div>
    <a href="#checkout" class="btn btn-primary btn-block" id="goCheckout" data-i18n="cart.checkout">إتمام الشراء</a>
  </div>
</aside>

<!-- ADMIN -->
<button class="admin-toggle" id="adminToggleBtn" data-i18n-attr="title:admin.toggle;aria-label:admin.toggle">⚙</button>
<div class="admin-panel" id="adminPanel">
  <div class="admin-box">
    <div class="admin-head">
      <h2 style="font-size:22px;" data-i18n="admin.h2">لوحة تحكم المتجر</h2>
      <button class="cart-close" id="adminCloseBtn" data-i18n-attr="aria-label:a11y.adminClose">×</button>
    </div>

    <div id="adminLock" class="lock-screen">
      <p style="margin-bottom:16px;" data-i18n="admin.lockIntro">هذه المنطقة لإدارة المتجر فقط. أدخلي كلمة المرور للاستمرار.</p>
      <form id="adminLockForm">
        <input type="password" id="adminPasswordInput" placeholder="كلمة المرور" required autocomplete="current-password" data-i18n-ph="admin.passPh">
        <button type="submit" class="btn btn-dark" data-i18n="admin.login">دخول</button>
      </form>
    </div>

    <div id="adminContent" hidden>
      <div class="admin-tabs" id="adminTabs">
        <button class="active" data-tab="products" data-i18n="admin.tabProducts">المنتجات</button>
        <button data-tab="orders" data-i18n="admin.tabOrders">الطلبات</button>
        <button data-tab="results" data-i18n="admin.tabResults">النتائج</button>
        <button data-tab="reviews" data-i18n="admin.tabReviews">التقييمات</button>
      </div>

      <div class="admin-pane active" id="pane-products">
        <h3 style="font-size:16px;margin-bottom:14px;" data-i18n="admin.curProducts">المنتجات الحالية</h3>
        <div id="adminProductList"></div>

        <h3 style="font-size:16px;margin:30px 0 14px;" data-i18n="admin.addProduct">إضافة منتج جديد</h3>
        <form id="newProductForm">
          <div class="field">
            <label for="p-name" data-i18n="admin.pName">اسم المنتج</label>
            <input id="p-name" type="text" name="name" required placeholder="مثال: سيروم تساقط الشعر" data-i18n-ph="admin.pNamePh">
          </div>
          <div class="field">
            <label for="p-desc" data-i18n="admin.pDesc">الوصف</label>
            <textarea id="p-desc" name="desc" rows="2" placeholder="وصف قصير يظهر في بطاقة المنتج" data-i18n-ph="admin.pDescPh"></textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="p-price" data-i18n="admin.pPrice">السعر الحالي (ر.س)</label>
              <input id="p-price" type="number" name="price" min="0" step="0.5" required>
            </div>
            <div class="field">
              <label for="p-oldprice" data-i18n="admin.pOld">السعر قبل الخصم (اختياري)</label>
              <input id="p-oldprice" type="number" name="oldPrice" min="0" step="0.5">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="p-stock" data-i18n="admin.pStock">الكمية المتوفرة</label>
              <input id="p-stock" type="number" name="stock" min="0" required>
            </div>
            <div class="field">
              <label for="p-category" data-i18n="admin.pCat">التصنيف</label>
              <input id="p-category" type="text" name="category" placeholder="مثال: زيوت الشعر" data-i18n-ph="admin.pCatPh">
            </div>
          </div>
          <div class="field">
            <label for="p-image" data-i18n="admin.pImage">صورة المنتج</label>
            <input id="p-image" type="file" name="image" accept="image/*">
            <small class="field-hint" data-i18n="admin.imgHint">يتم ضغط الصورة تلقائياً لتناسب التخزين المحلي.</small>
          </div>
          <button type="submit" class="btn btn-primary" data-i18n="admin.saveProduct">حفظ المنتج</button>
        </form>
      </div>

      <div class="admin-pane" id="pane-orders">
        <h3 style="font-size:16px;margin-bottom:14px;" data-i18n="admin.curOrders">الطلبات الواردة</h3>
        <div id="adminOrderList"></div>
      </div>

      <div class="admin-pane" id="pane-results">
        <p class="field-hint" style="margin-bottom:14px;" data-i18n="admin.resultsNote">أضيفي صوراً حقيقية من نتائج عميلاتك (قبل/بعد) وبإذنهنّ. تجنّبي الصور غير الحقيقية حتى لا يكون العرض مضلِّلاً.</p>
        <h3 style="font-size:16px;margin-bottom:14px;" data-i18n="admin.curResults">النتائج الحالية</h3>
        <div id="adminResultList"></div>

        <h3 style="font-size:16px;margin:30px 0 14px;" data-i18n="admin.addResult">إضافة نتيجة جديدة</h3>
        <form id="newResultForm">
          <div class="field-row">
            <div class="field">
              <label for="r-before" data-i18n="admin.rBefore">صورة "قبل"</label>
              <input id="r-before" type="file" name="before" accept="image/*" required>
            </div>
            <div class="field">
              <label for="r-after" data-i18n="admin.rAfter">صورة "بعد"</label>
              <input id="r-after" type="file" name="after" accept="image/*" required>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="r-name" data-i18n="admin.rName">اسم العميلة (اختياري)</label>
              <input id="r-name" type="text" name="name" placeholder="مثال: سارة — الرياض" data-i18n-ph="admin.rNamePh">
            </div>
            <div class="field">
              <label for="r-weeks" data-i18n="admin.rWeeks">عدد الأسابيع</label>
              <input id="r-weeks" type="number" name="weeks" min="0" placeholder="6">
            </div>
          </div>
          <div class="field">
            <label for="r-comment" data-i18n="admin.rComment">تعليق تحت الصورة (اختياري)</label>
            <input id="r-comment" type="text" name="comment" placeholder="مثال: لاحظت فرقاً واضحاً في الكثافة" data-i18n-ph="admin.rCommentPh">
          </div>
          <small class="field-hint" data-i18n="admin.imgsHint">تُضغط الصور تلقائياً لتناسب التخزين المحلي.</small>
          <button type="submit" class="btn btn-primary" style="margin-top:14px;" data-i18n="admin.saveResult">حفظ النتيجة</button>
        </form>
      </div>

      <div class="admin-pane" id="pane-reviews">
        <p class="field-hint" style="margin-bottom:14px;" data-i18n="admin.reviewsNote">أضيفي تقييمات حقيقية من عميلاتك وبإذنهنّ. تجنّبي التقييمات غير الحقيقية حتى لا يكون العرض مضلِّلاً.</p>
        <h3 style="font-size:16px;margin-bottom:14px;" data-i18n="admin.curReviews">التقييمات الحالية</h3>
        <div id="adminReviewList"></div>

        <h3 style="font-size:16px;margin:30px 0 14px;" data-i18n="admin.addReview">إضافة تقييم جديد</h3>
        <form id="newReviewForm">
          <div class="field-row">
            <div class="field">
              <label for="rv-name" data-i18n="admin.rvName">اسم العميلة</label>
              <input id="rv-name" type="text" name="name" placeholder="مثال: نورة" data-i18n-ph="admin.rvNamePh">
            </div>
            <div class="field">
              <label for="rv-rating" data-i18n="admin.rvRating">التقييم</label>
              <select id="rv-rating" name="rating">
                <option value="5">★★★★★ (5)</option>
                <option value="4">★★★★☆ (4)</option>
                <option value="3">★★★☆☆ (3)</option>
                <option value="2">★★☆☆☆ (2)</option>
                <option value="1">★☆☆☆☆ (1)</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label for="rv-comment" data-i18n="admin.rvComment">نص التقييم</label>
            <textarea id="rv-comment" name="comment" rows="3" required placeholder="مثال: منتج ممتاز، لاحظت فرقاً خلال شهر." data-i18n-ph="admin.rvCommentPh"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" data-i18n="admin.saveReview">حفظ التقييم</button>
        </form>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script src="js/i18n.js"></script>
<script src="js/store.js"></script>
</body>
</html>
