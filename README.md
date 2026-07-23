[README.md](https://github.com/user-attachments/files/30301952/README.md)
# 🛍️ MİNİBAZAR - Onlayn Alış-veriş Mağazası

Azərbaycan dilində qurulmuş, WhatsApp ilə inteqre olunmuş **modern, responsiv və erişilebilir** onlayn alış-veriş platforması.

## ✨ Xüsusiyyətlər

### 🎯 Core Funksiyonlar
- ✅ **Məhsul Kataloqu** — 5+ kateqoriyada dinamik məhsullar
- 🛒 **Alış-veriş Səbəti** — Sürüklə-at ilə kəmiyyət tənzimləməsi
- 💾 **LocalStorage** — Səbət avtomatik saxlanılır
- 📱 **WhatsApp Inteqrasiyası** — Birbaşa sifarişləri WhatsApp-a göndər
- 🎨 **Tailwind CSS** — Modern, minimalist dizayn
- ♿ **Erişilebilirlik** — WCAG standartlarına uyğun
- 📱 **Responsiv** — Mobil, tablet, desktop tamamilə uyumlu
- ⚡ **Performans** — Lazy loading, image optimization
- 🌍 **Azərbaycanca** — Tam Azərbaycan dilinə tərcümə
- 🎭 **Toast Notifications** — Fəaliyyətlərin görsəl təsdiqləri

### 🔧 Texniki Xüsusiyyətlər
- **XSS Koruması** — HTML injection əlindən qorunmuş
- **Keyboard Navigation** — Alt+C ilə səbətə sıçrayın
- **Dark Mode Ready** — Gələcəkdə dark mode əlavə etmək mümkün
- **Print Friendly** — Sifarişləri çap etmək mümkün
- **SEO Optimized** — Meta tags, semantic HTML
- **Progressive Enhancement** — JavaScript olmadığında də işləyir

---

## 📁 Fayllar Strukturu

```
MINI-BAZAR/
├── index.html          # HTML strukturu (temiz, semantik)
├── script.js           # Əsas biznes məntiqi
├── config.js           # Məhsullar və konfiquratsiya
├── style.css           # Özel CSS (animasiyalar, ♿ accessibility)
└── README.md           # Bu fajl
```

---

## 🚀 Qurulum

### 1️⃣ Saytı Klonla
```bash
git clone https://github.com/ilham030/MINI-BAZAR.git
cd MINI-BAZAR
```

### 2️⃣ Brauzerində Aç
Fayla sağ klik edin və **"Open with Browser"** seçin, ya da:
```bash
# Python 3 ilə local server başlat
python -m http.server 8000
# Sonra http://localhost:8000 açın
```

### 3️⃣ WhatsApp Nömrəsini Dəyişdir (İsteğe bağlı)
`config.js`-də bu sətri tapın:
```javascript
WHATSAPP_NUMBER: "994773911300"  // 👈 BU HISSƏ
```

Öz WhatsApp nömrənizi yazın (beynəlxalq formatda, ülkə kodu ilə):
```javascript
WHATSAPP_NUMBER: "994501234567"  // Məsələn
```

---

## 📝 Məhsul Əlavə Etmə

`config.js`-də `PRODUCTS` massivini redaktə edin:

```javascript
const PRODUCTS = [
    {
        id: 6,                    // Unikal ID
        name: "Yeni Məhsul",      // Məhsul adı
        price: 99.99,             // Qiymət (AZN)
        category: "elektronika",  // Kateqoriya
        img: "https://...",       // Şəkil URL
        description: "Təsvir",    // Kiçik təsvir
        customPrice: false        // Xüsusi qiymət üçün true
    }
];
```

**Mümkün Kateqoriyalar:**
- `elektronika` — Elektronik əşyalar
- `geyim` — Geyim və ayakkabılar
- `çanta` — Çantalar və aksessuarlar
- `mebel` — Mebel və dekorativ əşyalar

---

## 🎨 Dizayn Özelleştirmə

### Rəngləri Dəyişdir
`style.css`-də başında olan rəng dəyişənləri dəyişdir:
```css
:root {
    --primary-color: #4f46e5;      /* Ana rəng (indigo) */
    --secondary-color: #10b981;    /* Yan rəng (emerald) */
    --danger-color: #ef4444;       /* Xəbərdarlıq (red) */
}
```

### Animasiyaları Deaktiv Et
Erişilebilirlik üçün əgər fərdlərdə motion sickness varsa:
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation: none !important;
        transition: none !important;
    }
}
```

---

## 🔒 Təhlükəsizlik

### Implemented Features ✅
- **XSS Protection** — Bütün user input sanitize edilir
- **HTML Escaping** — `escapeHtml()` funksiyası istifadə olunur
- **Content Security Policy Ready** — CSP headers qura bilərsiniz

### Best Practices
```javascript
// ❌ YARAMAZ
element.innerHTML = userInput;

// ✅ YAXŞI
element.textContent = userInput;
// və ya
escapeHtml(userInput);
```

---

## ♿ Erişilebilirlik (Accessibility)

### Implemented Features
- 🎯 **ARIA Labels** — Ekran okuyucular üçün
- ⌨️ **Keyboard Navigation** — Bütün düymələr Tab ilə erişilir
- 🎨 **High Contrast Mode** — İnat kontrast modu dəstəyi
- 🎭 **Reduced Motion** — Motion sickness qoruması
- 👁️ **Focus Indicators** — Fokus halı açıq-aydın görsənir

### WCAG Compliance
- ✅ Level A
- ✅ Level AA (bəzi elementlərdə)

---

## 📱 Responsiv Breakpoints

```
📱 Mobile:    0-640px   (grid-cols-2)
📱 Tablet:    641-1024px (grid-cols-3)
💻 Desktop:   1025px+   (grid-cols-4)
```

---

## 🎯 LocalStorage

Səbət avtomatik saxlanılır:
```javascript
// Saxlanmış məlumat
localStorage.getItem('minibazar_cart')
// Nəticə: [{"id":1,"name":"...","quantity":2}]
```

Məlumatı təmizləmək:
```javascript
localStorage.removeItem('minibazar_cart')
```

---

## 🐛 Xətaları Aradan Qaldırmaq

### Console-da Debug Etmə
```javascript
// Brauzer konsolunda (F12):
cart                          // Səbətı göstər
localStorage.minibazar_cart   // Saxlanmış məlumatı göstər
PRODUCTS                      // Bütün məhsulları göstər
CONFIG                        // Konfigurasionu göstər
```

### Ümumi Problemlər

| Problem | Həll |
|---------|-----|
| Şəkillər yüklənmir | Şəkil URL-inin doğru olduğunu yoxlayın |
| WhatsApp açılmır | WhatsApp nömrəsini beynəlxalq formatda yazın |
| Səbət boşlanmır | `localStorage.removeItem('minibazar_cart')` işlədin |
| Mobil sesinə sıxışmış | Tailwind breakpoints yoxlayın |

---

## 📊 Performance Tips

- 🖼️ **Image Optimization** — WebP formatında şəkilləri istifadə edin
- 🚀 **Lazy Loading** — `loading="lazy"` atributu istifadə olunur
- 📦 **Code Splitting** — config.js ayrı yüklənir
- 🎨 **CSS Minification** — Production-da minify edin
- ⚡ **JavaScript Bundling** — Webpack/Vite ilə paketləyin

---

## 🌍 Çevrilmə (i18n)

Başqa dildə istifadə etmək üçün:
1. `config.js`-də `CATEGORIES` dəyişdirin
2. `index.html`-də `lang="az"` dəyişdirin
3. Mətnləri çevirin

---

## 📞 WhatsApp Mesaj Şablonu

Sifarış mesajı belədir:
```
🛒 YENİ SİFARİŞ - MİNİBAZAR

📋 SİFARİŞ TƏFSİLATI:
────────────────────────────────

1. İphone 17 pro
   Qiymət: 3030.00 AZN
   Miqdar: 1 ədəd
   Alt cəmi: 3030.00 AZN

────────────────────────────────
💰 CƏMI MƏBLƏĞ: 3030.00 AZN

⏰ SƏBƏTİ VAXT: 18.7.2026 19:11

✅ Sifarişimi təsdiq etmək istəyirəm.
📍 Zəhmət olmasa çatdırılma məlumatı verin.
```

---

## 🔄 Gələcək Xüsusiyyətlər (TODO)

- [ ] Payment integration (Stripe, PayPal)
- [ ] User accounts və order history
- [ ] Product search functionality
- [ ] Admin panel üçün backend
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Dark mode
- [ ] Multi-language support (EN, RU)
- [ ] Product reviews & ratings
- [ ] Wishlist feature

---

## 📄 Lisenziya

Bu layihə **MIT Lisenziyası** altında buraxılmışdır.

---

## 👨‍💻 Mənsəb

Yaradıcı: **ilham030**
GitHub: https://github.com/ilham030

---

## ❓ FAQ

### S: Öz serverimə necə deploy edəm?
**C:** GitHub Pages, Netlify, Vercel və ya hər hansı static hosting istifadə edin. Bütün faylları upload edin.

### S: Verilənləri verilənlər bazasında saxlaya biləm?
**C:** Bəli! `script.js`-də checkout funksiyasında API call əlavə edin:
```javascript
fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify({cart, customer_info})
})
```

### S: Mobil app kimi necə istifadə edəm?
**C:** Web app manifest əlavə edin. Biz hazırladıq:
```json
{
  "name": "MİNİBAZAR",
  "short_name": "BAZAR",
  "icons": [{"src": "/icon.png", "sizes": "192x192"}]
}
```

### S: Xüsusi qiymət məhsulları necə işləyir?
**C:** `config.js`-də `customPrice: true` yazın:
```javascript
{
    name: "Sifarişlə yığılır",
    price: 0,
    customPrice: true  // 👈 BU
}
```
Səbətə əlavə edərkən "Sorğu ilə" göstərəcəkdir.

---

## 🎉 Uğurlar!

Mağazanızı açmaq üçün **sadəcə `index.html`-ni brauzerində açın** — hər şey hazırdır! 🚀

Suallar, tapılan xətalar və təkliflər üçün **Issues** açın!

---

**Last Update:** 18 July 2026
**Version:** 2.0 (Refactored & Enhanced)
