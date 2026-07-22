// ============================================
// ƏSAS MƏNTIQ FİLESİ
// ============================================

let cart = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let PRODUCTS = [];
let CATEGORIES = [];

// ============ İNİTİALİZASİYA ============

document.addEventListener('DOMContentLoaded', function() {
    // LocalStorage-dan səbəti yüklə
    loadCartFromStorage();

    // Footer-dakı dinamik məlumatları doldur (məhsullardan asılı deyil)
    renderStoreInfo();

    // Scroll ilə "yuxarı qayıt" düyməsini idarə et
    window.addEventListener('scroll', handleScrollForBackToTop);

    // Escape tuşu ilə açıq modalı kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const cartModal = document.getElementById('cart-modal');
            const productModal = document.getElementById('product-modal');
            if (!productModal.classList.contains('hidden')) {
                closeProductModal();
            } else if (!cartModal.classList.contains('hidden')) {
                toggleCartModal();
            }
        }
    });

    // Məhsulları və kateqoriyaları data.json-dan yüklə
    loadStoreData();
});

function loadStoreData() {
    const loadingSpinner = document.getElementById('loading-spinner');
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');

    if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (grid) grid.innerHTML = '';

    // Keş problemlərinin qarşısını almaq üçün hər dəfə təzə versiya çəkirik
    fetch(`data.json?t=${Date.now()}`)
        .then(response => {
            if (!response.ok) throw new Error('Şəbəkə xətası');
            return response.json();
        })
        .then(data => {
            PRODUCTS = data.products || [];
            CATEGORIES = data.categories || [];

            renderCategoryButtons();

            // Skeleton loader-in bir anlıq görünməsi üçün qısa gecikmə
            setTimeout(() => {
                applyFilters();
            }, 400);
        })
        .catch(error => {
            console.warn('Məhsullar yüklənərkən xəta:', error);
            showLoadError();
        });
}

function showLoadError() {
    const loadingSpinner = document.getElementById('loading-spinner');
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');

    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (emptyState) emptyState.classList.add('hidden');
    if (grid) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-triangle-exclamation text-5xl text-amber-400 mb-4"></i>
                <p class="text-gray-600 text-lg mb-4">Məhsullar yüklənə bilmədi.</p>
                <button onclick="loadStoreData()" class="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700 transition">
                    Yenidən cəhd et
                </button>
            </div>
        `;
    }
}

// ============ MAĞAZA MƏLUMATLARI (FOOTER / HERO) ============

function renderStoreInfo() {
    // Hero-dakı pulsuz çatdırılma nişanı
    const badge = document.getElementById('free-delivery-badge');
    if (badge && CONFIG.FREE_DELIVERY_THRESHOLD !== undefined) {
        badge.innerHTML = `<i class="fa-solid fa-truck mr-2"></i>${formatPrice(CONFIG.FREE_DELIVERY_THRESHOLD)} ${CONFIG.STORE_CURRENCY}-dən yuxarı pulsuz çatdırılma`;
    }

    // Footer əlaqə məlumatları
    const phoneEl = document.getElementById('footer-phone');
    if (phoneEl) phoneEl.textContent = formatPhoneDisplay(CONFIG.WHATSAPP_NUMBER);

    const addressEl = document.getElementById('footer-address');
    if (addressEl) addressEl.textContent = CONFIG.STORE_ADDRESS || '';

    const hoursEl = document.getElementById('footer-hours');
    if (hoursEl) hoursEl.textContent = CONFIG.STORE_HOURS || '';

    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Footer sosial linklər
    const igLink = document.getElementById('footer-instagram');
    if (igLink && CONFIG.SOCIAL && CONFIG.SOCIAL.instagram) igLink.href = CONFIG.SOCIAL.instagram;

    const waChannelLink = document.getElementById('footer-whatsapp-channel');
    if (waChannelLink && CONFIG.SOCIAL && CONFIG.SOCIAL.whatsappChannel) waChannelLink.href = CONFIG.SOCIAL.whatsappChannel;
}

function formatPhoneDisplay(number) {
    const cleaned = (number || '').replace(/\D/g, '');
    if (cleaned.length === 12) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
    }
    return `+${cleaned}`;
}

// ============ KATEQORIYA FUNKSIYALARI ============

function renderCategoryButtons() {
    const container = document.getElementById('category-filters');
    container.innerHTML = '';

    CATEGORIES.forEach(category => {
        const button = document.createElement('button');
        button.className = `cat-btn px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition focus:ring-2 focus:outline-none`;
        button.dataset.category = category.id;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', category.id === 'all');

        if (category.id === 'all') {
            button.className += ` bg-indigo-600 text-white shadow-sm focus:ring-indigo-600`;
        } else {
            button.className += ` bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 focus:ring-indigo-600`;
        }

        button.onclick = () => filterCategory(category.id);
        button.innerHTML = `<i class="fa-solid ${category.icon} mr-2"></i>${category.label}`;
        container.appendChild(button);
    });
}

function setActiveCategoryButton(category) {
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-gray-600', 'border', 'border-gray-200');
        btn.setAttribute('aria-selected', 'false');
    });

    const activeBtn = document.querySelector(`[data-category="${category}"]`);
    if (activeBtn) {
        activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
        activeBtn.classList.remove('bg-white', 'text-gray-600', 'border', 'border-gray-200');
        activeBtn.setAttribute('aria-selected', 'true');
    }
}

function filterCategory(category) {
    currentCategory = category;
    setActiveCategoryButton(category);
    applyFilters();
}

// ============ AXTARIŞ FUNKSIYALARI ============

function handleSearchInput(value) {
    currentSearchTerm = value;
    applyFilters();
}

function clearFilters() {
    currentCategory = 'all';
    currentSearchTerm = '';

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    setActiveCategoryButton('all');
    applyFilters();
}

// ============ FİLTRLƏRİ BİRLƏŞDİRƏN FUNKSIYA ============

function applyFilters() {
    let filtered = PRODUCTS;

    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    const term = currentSearchTerm.trim().toLowerCase();
    if (term !== '') {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.description || '').toLowerCase().includes(term)
        );
    }

    displayProducts(filtered);
    updateResultsCount(filtered.length, term !== '');
}

function updateResultsCount(count, isSearching) {
    const resultsEl = document.getElementById('results-count');
    if (!resultsEl) return;

    if (!isSearching) {
        resultsEl.textContent = '';
        return;
    }
    resultsEl.textContent = count === 0 ? '' : `${count} məhsul tapıldı`;
}

// ============ ENDİRİM HESABLAMASI ============

function getDiscountPercent(product) {
    if (!product.oldPrice || product.oldPrice <= product.price) return null;
    return Math.round((1 - (product.price / product.oldPrice)) * 100);
}

// ============ MƏHSULLARI GÖSTƏRƏN FUNKSIYALAR ============

function displayProducts(productsToRender) {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Yüklənmə göstəricisini gizlə
    loadingSpinner.classList.add('hidden');

    if (productsToRender.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');
    grid.innerHTML = '';

    productsToRender.forEach(product => {
        const discountPercent = getDiscountPercent(product);
        const outOfStock = product.inStock === false;

        let priceDisplay;
        if (product.customPrice) {
            priceDisplay = '<span class="text-indigo-600 font-black text-lg">Sorğu ilə</span>';
        } else if (discountPercent) {
            priceDisplay = `
                <div class="flex flex-col">
                    <span class="text-gray-400 text-xs line-through">${formatPrice(product.oldPrice)} ${CONFIG.STORE_CURRENCY}</span>
                    <span class="text-indigo-600 font-black text-lg">${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}</span>
                </div>`;
        } else {
            priceDisplay = `<span class="text-indigo-600 font-black text-lg">${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}</span>`;
        }

        const ratingDisplay = buildRatingMarkup(product, 'text-xs');

        const cartButton = outOfStock
            ? `<button
                    disabled
                    class="bg-gray-200 text-gray-400 p-2 rounded-lg cursor-not-allowed"
                    aria-label="Stokda yoxdur"
                    title="Stokda yoxdur">
                    <i class="fa-solid fa-ban"></i>
                </button>`
            : `<button 
                    onclick="event.stopPropagation(); addToCart(${product.id})" 
                    class="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                    aria-label="${product.name} səbətə əlavə et"
                    title="Səbətə əlavə et">
                    <i class="fa-solid fa-cart-plus"></i>
                </button>`;

        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col group focus-within:ring-2 focus-within:ring-indigo-600';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${product.name} - detallara bax`);
        card.innerHTML = `
            <div class="h-48 overflow-hidden bg-gray-100 relative">
                <img 
                    src="${product.img}" 
                    alt="${product.name}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-300 lazy-image ${outOfStock ? 'grayscale opacity-60' : ''}"
                    loading="lazy">
                <span class="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                    ${product.category.toUpperCase()}
                </span>
                ${discountPercent ? `<span class="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">-${discountPercent}%</span>` : ''}
                ${outOfStock ? `<div class="absolute inset-0 bg-black/40 flex items-center justify-center"><span class="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">Stokda yoxdur</span></div>` : ''}
            </div>
            <div class="p-4 flex flex-col flex-1 justify-between">
                <div>
                    <h4 class="text-gray-800 font-semibold text-sm line-clamp-2">${escapeHtml(product.name)}</h4>
                    <p class="text-gray-500 text-xs mt-1 line-clamp-1">${escapeHtml(product.description || '')}</p>
                    ${ratingDisplay}
                </div>
                <div class="flex justify-between items-center mt-4">
                    ${priceDisplay}
                    ${cartButton}
                </div>
            </div>
        `;

        card.addEventListener('click', () => openProductModal(product.id));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openProductModal(product.id);
            }
        });

        grid.appendChild(card);
    });
}

// ============ REYTİNQ (ULDUZ) GÖSTƏRİCİSİ ============
// Qeyd: yalnız məhsulda real `rating` sahəsi varsa göstərilir - uydurma reytinq əlavə edilmir.

function buildRatingMarkup(product, sizeClass) {
    if (!product.rating) return '';

    const fullStars = Math.round(product.rating);
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < fullStars
            ? '<i class="fa-solid fa-star text-amber-400"></i>'
            : '<i class="fa-regular fa-star text-amber-400"></i>';
    }
    const countText = product.reviewCount ? ` (${product.reviewCount})` : '';
    return `<div class="${sizeClass} mt-1">${stars}<span class="text-gray-400 ml-1">${countText}</span></div>`;
}

// ============ MƏHSUL DETALLARI MODALI ============

function openProductModal(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const outOfStock = product.inStock === false;
    const discountPercent = getDiscountPercent(product);

    document.getElementById('product-modal-img').src = product.img;
    document.getElementById('product-modal-img').alt = product.name;
    document.getElementById('product-modal-category').textContent = product.category.toUpperCase();
    document.getElementById('product-modal-name').textContent = product.name;
    document.getElementById('product-modal-description').textContent = product.description || '';

    const priceEl = document.getElementById('product-modal-price');
    const addBtn = document.getElementById('product-modal-add-btn');

    if (product.customPrice) {
        priceEl.innerHTML = 'Sorğu ilə';
        addBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i><span>WhatsApp ilə soruş</span>';
        addBtn.disabled = false;
        addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else if (outOfStock) {
        priceEl.innerHTML = `${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}`;
        addBtn.innerHTML = '<i class="fa-solid fa-ban"></i><span>Stokda yoxdur</span>';
        addBtn.disabled = true;
        addBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else if (discountPercent) {
        priceEl.innerHTML = `<span class="text-gray-400 text-lg line-through mr-2">${formatPrice(product.oldPrice)} ${CONFIG.STORE_CURRENCY}</span>${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}`;
        addBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i><span>Səbətə əlavə et</span>';
        addBtn.disabled = false;
        addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    } else {
        priceEl.innerHTML = `${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}`;
        addBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i><span>Səbətə əlavə et</span>';
        addBtn.disabled = false;
        addBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    addBtn.onclick = () => {
        addToCart(product.id);
        if (product.inStock !== false) closeProductModal();
    };

    const ratingEl = document.getElementById('product-modal-rating');
    const ratingMarkup = buildRatingMarkup(product, 'text-sm');
    if (ratingMarkup) {
        ratingEl.innerHTML = ratingMarkup;
        ratingEl.classList.remove('hidden');
    } else {
        ratingEl.innerHTML = '';
        ratingEl.classList.add('hidden');
    }

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');

    // Səbət modalı da açıq deyilsə scroll-u bərpa et
    const cartModal = document.getElementById('cart-modal');
    if (cartModal.classList.contains('hidden')) {
        document.body.style.overflow = 'auto';
    }
}

// ============ SƏBƏT FUNKSIYALARI ============

function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);

    if (!product) return;

    if (product.inStock === false) {
        showToast('⚠️ Bu məhsul hazırda stokda yoxdur');
        return;
    }

    // Xüsusi qiymət məhsulları üçün xəbərdarlıq
    if (product.customPrice) {
        showToast('Zəhmət olmasa WhatsApp üzərindən qiymət soruşun');
        return;
    }

    const cartItem = cart.find(item => item.id === id);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCartToStorage();
    updateCartUI();
    showToast(`✅ ${product.name} səbətə əlavə edildi`);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    updateCartUI();
    showToast('❌ Məhsul səbətdən silindi');
}

function updateQuantity(id, newQuantity) {
    const cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        if (newQuantity <= 0) {
            removeFromCart(id);
        } else {
            cartItem.quantity = newQuantity;
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    // Səbət sayaçı
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').innerText = count;

    // Səbət elementləri
    const cartItemsContainer = document.getElementById('cart-items');
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Səbətiniz boşdur.</p>';
        document.getElementById('checkout-btn').disabled = true;
    } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center bg-gray-50 p-4 rounded-xl group';
            itemElement.setAttribute('role', 'listitem');
            itemElement.innerHTML = `
                <div class="flex-1">
                    <h5 class="font-semibold text-gray-800 text-sm">${escapeHtml(item.name)}</h5>
                    <span class="text-xs text-gray-500">${formatPrice(item.price)} × <span id="qty-${item.id}">${item.quantity}</span></span>
                    <span class="text-xs font-bold text-indigo-600 ml-2">Cəmi: ${formatPrice(item.price * item.quantity)}</span>
                </div>
                <div class="flex gap-2 items-center">
                    <div class="flex items-center gap-1 bg-white rounded border border-gray-200">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="px-2 py-1 text-gray-500 hover:text-gray-700 focus:outline-none">−</button>
                        <span class="px-2 text-sm font-semibold">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="px-2 py-1 text-gray-500 hover:text-gray-700 focus:outline-none">+</button>
                    </div>
                    <button 
                        onclick="removeFromCart(${item.id})" 
                        class="text-red-500 hover:text-red-700 font-bold text-sm p-1 rounded hover:bg-red-50 focus:ring-2 focus:ring-red-300 focus:outline-none"
                        aria-label="Sil">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        document.getElementById('checkout-btn').disabled = false;
    }

    // Cəmi qiymət
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').innerText = formatPrice(total);
}

function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    const cartBtn = document.getElementById('cart-toggle-btn');

    modal.classList.toggle('hidden');
    cartBtn.setAttribute('aria-expanded', !modal.classList.contains('hidden'));

    // Modalda olduğu zaman scroll'u deaktiv et
    if (!modal.classList.contains('hidden')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

// ============ WHATSAPP CHECKOUT ============

function checkoutViaWhatsApp() {
    if (cart.length === 0) {
        showToast('⚠️ Səbətiniz boşdur!');
        return;
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutLoading = document.getElementById('checkout-loading');

    // Yüklənmə durumunu göstər
    checkoutBtn.disabled = true;
    checkoutLoading.classList.remove('hidden');

    // Sifarişi hazırla
    let message = `🛒 *YENİ SİFARİŞ - ${CONFIG.STORE_NAME}*\n\n`;
    message += `📋 *SİFARİŞ TƏFSİLATI:*\n`;
    message += '─'.repeat(40) + '\n\n';

    cart.forEach((item, index) => {
        message += `${index + 1}. *${escapeHtml(item.name)}*\n`;
        message += `   Qiymət: ${formatPrice(item.price)}\n`;
        message += `   Miqdar: ${item.quantity} ədəd\n`;
        message += `   Alt cəmi: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += '─'.repeat(40) + '\n';
    message += `💰 *CƏMI MƏBLƏĞ: ${formatPrice(total)} ${CONFIG.STORE_CURRENCY}*\n\n`;
    message += '─'.repeat(40) + '\n';
    message += `⏰ *SƏBƏTİ VAXT:* ${new Date().toLocaleString('az-AZ')}\n\n`;
    message += '✅ Sifarişimi təsdiq etmək istəyirəm.\n';
    message += '📍 Zəhmət olmasa çatdırılma məlumatı verin.\n';
    message += '📞 Danışıqlarımız üçün əlçatan olmağımı xahiş edir.';

    try {
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodedMessage}`;

        // WhatsApp'a yönləndir
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');

            // Səbəti təmizlə (isteğe bağlı - istəməsəniz bu xətti silin)
            // cart = [];
            // saveCartToStorage();
            // updateCartUI();
            // toggleCartModal();

            showToast('✅ WhatsApp açıldı. Sifarişinizi təsdiq edin!');
        }, 500);
    } catch (error) {
        console.error('WhatsApp xətası:', error);
        showToast('❌ Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
        checkoutBtn.disabled = false;
        checkoutLoading.classList.add('hidden');
    }
}

// ============ LocalStorage FUNKSIYALARI ============

function saveCartToStorage() {
    try {
        localStorage.setItem('minibazar_cart', JSON.stringify(cart));
    } catch (error) {
        console.warn('LocalStorage xətası:', error);
    }
}

function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('minibazar_cart');
        if (saved) {
            cart = JSON.parse(saved);
            updateCartUI();
        }
    } catch (error) {
        console.warn('LocalStorage oxuma xətası:', error);
    }
}

// ============ UTILITY FUNKSIYALARI ============

function formatPrice(price) {
    return parseFloat(price || 0).toFixed(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');

    toastText.textContent = message;
    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// ============ YUXARI QAYIT DÜYMƏSİ ============

function handleScrollForBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;

    if (window.scrollY > 400) {
        btn.classList.remove('hidden');
        btn.classList.add('flex');
    } else {
        btn.classList.add('hidden');
        btn.classList.remove('flex');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============ PERFORMANS OPTİMİZASİYASI ============

// Şəkillərin Lazy Loading
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // Artıq yükləniyi üçün
                imageObserver.unobserve(img);
            }
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.lazy-image').forEach(img => {
            imageObserver.observe(img);
        });
    });
}

// ============ KEYBOARD NAVIGATION ============

document.addEventListener('keydown', function(e) {
    // Alt + C: Səbətə git
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        document.getElementById('cart-toggle-btn').click();
    }
});

// ============ PWA YÜKLƏMƏ (INSTALL PROMPT) ============
// Qeyd: bu məntiq YALNIZ burada saxlanılır — index.html-də təkrarlanmır,
// çünki eyni dəyişənin iki `<script>`-də elan olunması SyntaxError yaradırdı.

let deferredPrompt;
const installBtn = document.getElementById('install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Avtomatik göstərilən bannerin qarşısını alırıq
    e.preventDefault();
    // Hadisəni yadda saxlayırıq ki, düyməyə basanda istifadə edək
    deferredPrompt = e;
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

if (installBtn) {
    installBtn.addEventListener('click', () => {
        if (!deferredPrompt) return;

        // Yükləmə pəncərəsini göstər
        deferredPrompt.prompt();

        // İstifadəçinin qərarını gözlə
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('İstifadəçi tətbiqi yüklədi');
            }
            deferredPrompt = null;
            installBtn.style.display = 'none';
        });
    });
}

window.addEventListener('appinstalled', () => {
    if (installBtn) {
        installBtn.style.display = 'none';
    }
    deferredPrompt = null;
});
