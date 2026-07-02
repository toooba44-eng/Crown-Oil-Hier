<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>المتجر | Crown Hair Oil</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@500;600;700;800&family=Tajawal:wght@400;500;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="style.css">
</head>
<body>

<header class="site-header">
  <div class="wrap">
    <a href="index.php" class="brand">
      <img src="assets/logo.jpg" alt="Crown Hair Oil">
      <span class="brand-name">Crown<span>HAIR OIL</span></span>
    </a>
    <nav class="main-nav" id="mainNav">
      <ul>
        <li><a href="index.php">الرئيسية</a></li>
        <li><a href="store.php">المتجر</a></li>
        <li><a href="#checkout">الدفع والشحن</a></li>
      </ul>
    </nav>
    <div class="header-actions">
      <button class="cart-pill" id="cartToggle">
        🛍 السلة <span id="cartCount">0</span>
      </button>
      <button class="nav-toggle" id="navToggle" aria-label="فتح القائمة" aria-expanded="false" aria-controls="mainNav">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</header>

<!-- CATALOG -->
<section class="section-cream" style="padding-top:56px;">
  <div class="wrap">
    <div class="store-toolbar">
      <h1>متجر Crown Hair Oil</h1>
      <div class="tag-filter" id="tagFilter"></div>
    </div>
    <div class="product-grid" id="productGrid"></div>
  </div>
</section>

<!-- CHECKOUT -->
<section class="section-tint" id="checkout">
  <div class="wrap">
    <div class="section-head">
      <div class="eyebrow">إنهاء الطلب</div>
      <h2>بيانات التوصيل والدفع</h2>
    </div>

    <div class="checkout-grid">
      <div>
        <form id="checkoutForm">
          <div class="field-row">
            <div class="field">
              <label>الاسم الكامل</label>
              <input type="text" name="name" required placeholder="مثال: سارة العتيبي">
            </div>
            <div class="field">
              <label>رقم الجوال</label>
              <input type="tel" name="phone" required placeholder="05xxxxxxxx">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>المدينة</label>
              <input type="text" name="city" required placeholder="الرياض">
            </div>
            <div class="field">
              <label>الحي / الرمز البريدي</label>
              <input type="text" name="address" required placeholder="حي الياسمين">
            </div>
          </div>
          <div class="field">
            <label>ملاحظات على الطلب (اختياري)</label>
            <textarea name="notes" rows="3" placeholder="مثال: التوصيل بعد الساعة 5 مساءً"></textarea>
          </div>

          <div class="field">
            <label>طريقة الدفع</label>
            <div class="pay-options">
              <label class="pay-option">
                <input type="radio" name="payMethod" value="cod" checked>
                <span><strong>الدفع عند الاستلام</strong><span>تدفعين نقداً أو بالشبكة عند وصول الطلب لبابك.</span></span>
              </label>
              <label class="pay-option">
                <input type="radio" name="payMethod" value="bank">
                <span><strong>تحويل بنكي</strong><span>سيتم إرسال رقم الحساب لتأكيد الطلب بعد إرساله.</span></span>
              </label>
              <label class="pay-option disabled">
                <input type="radio" name="payMethod" value="card" disabled>
                <span><strong>بطاقة مدى / فيزا — قريباً</strong><span>الدفع الإلكتروني المباشر قيد التفعيل حالياً.</span></span>
              </label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block">تأكيد الطلب</button>
        </form>

        <div id="orderConfirm" style="display:none;" class="admin-list-item" style="margin-top:20px;">
          <div class="grow">
            <h3 style="margin-bottom:8px;">تم استلام طلبك بنجاح ✓</h3>
            <p>رقم الطلب: <strong id="orderNumber"></strong>. سيتم التواصل معك لتأكيد التفاصيل والتوصيل.</p>
            <a href="store.php" class="btn btn-ghost btn-sm" style="margin-top:14px;">متابعة التسوق</a>
          </div>
        </div>
      </div>

      <aside class="order-summary">
        <h3 style="margin-bottom:18px;font-size:18px;">ملخص الطلب</h3>
        <div id="checkoutSummary"></div>
        <p style="font-size:12px;margin-top:14px;">شحن مجاني للطلبات أكثر من 200 ر.س. الأسعار تشمل ضريبة القيمة المضافة.</p>
      </aside>
    </div>
  </div>
</section>

<footer>
  <div class="wrap footer-bottom" style="border-top:none;padding-top:0;">
    <span>© Crown Hair Oil — جميع الحقوق محفوظة</span>
    <span>@CrownHairOil_KSA</span>
  </div>
</footer>

<!-- CART DRAWER -->
<div class="cart-overlay" id="cartOverlay"></div>
<aside class="cart-drawer" id="cartDrawer">
  <div class="cart-head">
    <h3>سلة الشراء</h3>
    <button class="cart-close" id="cartClose">×</button>
  </div>
  <div class="cart-items" id="cartItems"></div>
  <div class="cart-foot">
    <div class="cart-total-row"><span>الإجمالي</span><span id="cartTotal">0 ر.س</span></div>
    <a href="store.php#checkout" class="btn btn-primary btn-block" onclick="closeCart()">إتمام الشراء</a>
  </div>
</aside>

<!-- ADMIN -->
<button class="admin-toggle" id="adminToggleBtn" title="لوحة التحكم">⚙</button>
<div class="admin-panel" id="adminPanel">
  <div class="admin-box">
    <div class="admin-head">
      <h2 style="font-size:22px;">لوحة تحكم المتجر</h2>
      <button class="cart-close" id="adminCloseBtn">×</button>
    </div>

    <div id="adminLock" class="lock-screen">
      <p style="margin-bottom:16px;">هذه المنطقة لإدارة المتجر فقط. أدخلي كلمة المرور للاستمرار.</p>
      <form id="adminLockForm">
        <input type="password" id="adminPasswordInput" placeholder="كلمة المرور" required style="width:100%;padding:13px;border:1px solid var(--line);border-radius:4px;margin-bottom:14px;">
        <button type="submit" class="btn btn-dark">دخول</button>
      </form>
    </div>

    <div id="adminContent" style="display:none;">
      <div class="admin-tabs">
        <button class="active" data-tab="products" onclick="switchAdminTab('products')">المنتجات</button>
        <button data-tab="orders" onclick="switchAdminTab('orders')">الطلبات</button>
      </div>

      <div class="admin-pane active" id="pane-products">
        <h3 style="font-size:16px;margin-bottom:14px;">المنتجات الحالية</h3>
        <div id="adminProductList"></div>

        <h3 style="font-size:16px;margin:30px 0 14px;">إضافة منتج جديد</h3>
        <form id="newProductForm">
          <div class="field">
            <label>اسم المنتج</label>
            <input type="text" name="name" required placeholder="مثال: سيروم تساقط الشعر">
          </div>
          <div class="field">
            <label>الوصف</label>
            <textarea name="desc" rows="2" placeholder="وصف قصير يظهر في بطاقة المنتج"></textarea>
          </div>
          <div class="field-row">
            <div class="field">
              <label>السعر الحالي (ر.س)</label>
              <input type="number" name="price" min="0" step="0.5" required>
            </div>
            <div class="field">
              <label>السعر قبل الخصم (اختياري)</label>
              <input type="number" name="oldPrice" min="0" step="0.5">
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>الكمية المتوفرة</label>
              <input type="number" name="stock" min="0" required>
            </div>
            <div class="field">
              <label>التصنيف</label>
              <input type="text" name="category" placeholder="مثال: زيوت الشعر">
            </div>
          </div>
          <div class="field">
            <label>صورة المنتج</label>
            <input type="file" name="image" accept="image/*">
          </div>
          <button type="submit" class="btn btn-primary">حفظ المنتج</button>
        </form>
      </div>

      <div class="admin-pane" id="pane-orders">
        <h3 style="font-size:16px;margin-bottom:14px;">الطلبات الواردة</h3>
        <div id="adminOrderList"></div>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script src="script.js"></script>
<script>
(function(){
  var btn = document.getElementById('navToggle');
  var nav = document.getElementById('mainNav');
  if(!btn || !nav) return;
  btn.addEventListener('click', function(){
    var isOpen = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function(a){
    a.addEventListener('click', function(){
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();
</script>
</body>
</html>
