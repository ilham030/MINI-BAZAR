// ============================================
// ƏSAS MƏNTIQ FİLESİ
// ============================================

let PRODUCTS = [];
let CATEGORIES = [];
let cart = [];
let wishlist = []; // yalnız product id-lər saxlanılır
let recentlyViewed = []; // ən son baxılan product id-lər (ən yenisi əvvəldə)
let currentCategory = 'all';
let currentSearchTerm = '';
let currentSort = 'default';

// Məhsul modalının qalereyası üçün vəziyyət
let currentModalProductId = null;
let currentModalImages = [];
let currentModalImageIndex = 0;

const RECENTLY_VIEWED_LIMIT = 12;

// ============ İNİTİALİZASİYA ============

document.addEventListener('DOMContentLoaded', async function() {
    // LocalStorage-dan səbəti, sevimliləri və son baxılanları yüklə
    loadCartFromStorage();
    loadWishlistFromStorage();
    loadRecentlyViewedFromStorage();

    // Footer və hero-dakı dinamik məlumatları doldur
    renderStoreInfo();

    // Ağıllı Köməkçi (FAQ) widget-ini hazırla
    renderHelperFAQ();

    // Scroll ilə "yuxarı qayıt" düyməsini idarə et
    window.addEventListener('scroll', handleScrollForBackToTop);

    // Escape tuşu ilə açıq modalı kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const lightbox = document.getElementById('image-lightbox');
            const cartModal = document.getElementById('cart-modal');
            const wishlistModal = document.getElementById('wishlist-modal');
            const productModal = document.getElementById('product-modal');
            const helperPanel = document.getElementById('helper-panel');
            if (lightbox && !lightbox.classList.contains('hidden')) {
                closeImageLightbox();
            } else if (!productModal.classList.contains('hidden')) {
                closeProductModal();
            } else if (!cartModal.classList.contains('hidden')) {
                toggleCartModal();
            } else if (wishlistModal && !wishlistModal.classList.contains('hidden')) {
                toggleWishlistModal();
            } else if (helperPanel && !helperPanel.classList.contains('hidden')) {
                toggleHelperPanel();
            }
        }
    });

    // Məhsulları və kateqoriyaları data.json-dan yüklə
    await loadStoreData();
});

// ============ MƏHSUL MƏLUMATLARININ YÜKLƏNMƏSİ (data.json) ============
// Admin panelindən edilən bütün əlavələr/redaktələr data.json faylına yazılır.
// Ona görə sayt həmişə bu faylı, HƏM DƏ keşdən keçmədən (cache: 'no-store' +
// timestamp) oxumalıdır ki, admin panelindəki yeniliklər dərhal görünsün.

async function loadStoreData() {
    const grid = document.getElementById('products-grid');
    const loadingSpinner = document.getElementById('loading-spinner');

    try {
        const response = await fetch(`data.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        PRODUCTS = data.products || [];
        CATEGORIES = data.categories || [];

        renderCategoryButtons();
        applyFilters();
        renderRecentlyViewedRow();
    } catch (error) {
        console.error('data.json yüklənərkən xəta:', error);
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        if (grid) {
            grid.innerHTML = '<p class="text-red-500 col-span-full text-center">Məhsullar yüklənərkən xəta baş verdi. Zəhmət olmasa səhifəni yeniləyin.</p>';
        }
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
    const waLink = document.getElementById('footer-whatsapp');
    if (waLink) waLink.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`;

    const igLink = document.getElementById('footer-instagram');
    if (igLink && CONFIG.SOCIAL && CONFIG.SOCIAL.instagram) igLink.href = CONFIG.SOCIAL.instagram;

    const fbLink = document.getElementById('footer-facebook');
    if (fbLink && CONFIG.SOCIAL && CONFIG.SOCIAL.facebook) fbLink.href = CONFIG.SOCIAL.facebook;
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

    filtered = sortProducts(filtered);

    displayProducts(filtered);
    updateResultsCount(filtered.length, term !== '');
}

// ============ SIRALAMA ============

function handleSortChange(value) {
    currentSort = value;
    applyFilters();
}

function sortProducts(products) {
    // Orijinal siyahını dəyişmədən yeni sıralanmış massiv qaytarır
    const list = products.slice();

    switch (currentSort) {
        case 'price-asc':
            return list.sort((a, b) => (a.customPrice ? Infinity : a.price) - (b.customPrice ? Infinity : b.price));
        case 'price-desc':
            return list.sort((a, b) => (b.customPrice ? -Infinity : b.price) - (a.customPrice ? -Infinity : a.price));
        case 'rating':
            return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'newest':
            return list.sort((a, b) => b.id - a.id);
        default:
            return list;
    }
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
        const outOfStock = product.inStock === false;

        const hasDiscount = !product.customPrice && product.oldPrice && product.oldPrice > product.price;
        const priceDisplay = product.customPrice
            ? '<span class="text-indigo-600 font-black text-lg">Sorğu ilə</span>'
            : `<div class="flex flex-col">
                    ${hasDiscount ? `<span class="text-gray-400 text-xs line-through">${formatPrice(product.oldPrice)}</span>` : ''}
                    <span class="text-indigo-600 font-black text-lg">${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}</span>
               </div>`;

        const ratingDisplay = buildRatingMarkup(product, 'text-xs');
        const discountBadge = buildDiscountBadgeMarkup(product);
        const cardImg = getPrimaryImage(product);
        const inWishlist = isInWishlist(product.id);

        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col group focus-within:ring-2 focus-within:ring-indigo-600';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `${product.name} - detallara bax`);
        card.innerHTML = `
            <div class="h-48 overflow-hidden bg-gray-100 relative">
                <img 
                    src="${cardImg}" 
                    alt="${product.name}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-300 lazy-image ${outOfStock ? 'opacity-50' : ''}"
                    loading="lazy">
                <button 
                    onclick="event.stopPropagation(); toggleWishlistItem(${product.id})" 
                    class="wishlist-heart-btn absolute top-2 left-2 bg-white/85 backdrop-blur w-8 h-8 rounded-full flex items-center justify-center hover:bg-white transition z-10 focus:ring-2 focus:ring-rose-400 focus:outline-none"
                    data-product-id="${product.id}"
                    aria-label="Sevimlilərə əlavə et">
                    <i class="${inWishlist ? 'fa-solid text-rose-500' : 'fa-regular text-gray-500'} fa-heart"></i>
                </button>
                <span class="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                    ${product.category.toUpperCase()}
                </span>
                ${discountBadge}
                ${outOfStock ? '<span class="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full">Stokda yoxdur</span>' : ''}
            </div>
            <div class="p-4 flex flex-col flex-1 justify-between">
                <div>
                    <h4 class="text-gray-800 font-semibold text-sm line-clamp-2">${escapeHtml(product.name)}</h4>
                    <p class="text-gray-500 text-xs mt-1 line-clamp-1">${escapeHtml(product.description || '')}</p>
                    ${ratingDisplay}
                </div>
                <div class="flex justify-between items-center mt-4">
                    ${priceDisplay}
                    <button 
                        onclick="event.stopPropagation(); addToCart(${product.id})" 
                        class="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition focus:ring-2 focus:ring-indigo-600 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="${product.name} səbətə əlavə et"
                        title="Səbətə əlavə et"
                        ${outOfStock ? 'disabled' : ''}>
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
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

// ============ ENDİRİM NİŞANI ============

function buildDiscountBadgeMarkup(product) {
    if (product.customPrice || !product.oldPrice || product.oldPrice <= product.price) return '';
    const percent = Math.round((1 - (product.price / product.oldPrice)) * 100);
    if (percent <= 0) return '';
    return `<span class="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">-${percent}%</span>`;
}

// ============ ÇOXLU ŞƏKİL DƏSTƏYİ ============
// Qeyd: `product.images` (massiv) admin paneldən əlavə edilə bilər - varsa istifadə olunur.
// Yoxdursa köhnə tək-şəkilli məhsullar üçün `product.img` geriyə uyğun işləyir.

function getProductImages(product) {
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images;
    }
    return product.img ? [product.img] : [];
}

function getPrimaryImage(product) {
    const images = getProductImages(product);
    return images[0] || '';
}

// ============ MƏHSUL DETALLARI MODALI ============

function openProductModal(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    currentModalProductId = id;
    document.getElementById('product-modal-category').textContent = product.category.toUpperCase();
    document.getElementById('product-modal-name').textContent = product.name;
    document.getElementById('product-modal-description').textContent = product.description || '';

    currentModalImages = getProductImages(product);
    currentModalImageIndex = 0;
    renderModalImage();
    renderModalThumbs();

    // Endirim nişanı
    const discountEl = document.getElementById('product-modal-discount');
    const hasDiscount = !product.customPrice && product.oldPrice && product.oldPrice > product.price;
    if (hasDiscount) {
        const percent = Math.round((1 - (product.price / product.oldPrice)) * 100);
        discountEl.textContent = `-${percent}%`;
        discountEl.classList.remove('hidden');
    } else {
        discountEl.classList.add('hidden');
    }

    const priceEl = document.getElementById('product-modal-price');
    const oldPriceEl = document.getElementById('product-modal-old-price');
    const addBtn = document.getElementById('product-modal-add-btn');

    if (product.customPrice) {
        priceEl.textContent = 'Sorğu ilə';
        oldPriceEl.classList.add('hidden');
        addBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i><span>WhatsApp ilə soruş</span>';
    } else {
        priceEl.textContent = `${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}`;
        if (hasDiscount) {
            oldPriceEl.textContent = `${formatPrice(product.oldPrice)} ${CONFIG.STORE_CURRENCY}`;
            oldPriceEl.classList.remove('hidden');
        } else {
            oldPriceEl.classList.add('hidden');
        }
        addBtn.innerHTML = '<i class="fa-solid fa-cart-plus"></i><span>Səbətə əlavə et</span>';
    }

    addBtn.onclick = () => {
        addToCart(product.id);
        closeProductModal();
    };

    // Sevimlilər ürəyinin vəziyyəti
    updateWishlistIconsForProduct(id);

    const ratingEl = document.getElementById('product-modal-rating');
    const ratingMarkup = buildRatingMarkup(product, 'text-sm');
    if (ratingMarkup) {
        ratingEl.innerHTML = ratingMarkup;
        ratingEl.classList.remove('hidden');
    } else {
        ratingEl.innerHTML = '';
        ratingEl.classList.add('hidden');
    }

    renderRelatedProducts(product);
    addToRecentlyViewed(id);

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');

    // Digər modallar da açıq deyilsə scroll-u bərpa et
    const cartModal = document.getElementById('cart-modal');
    const wishlistModal = document.getElementById('wishlist-modal');
    if (cartModal.classList.contains('hidden') && wishlistModal.classList.contains('hidden')) {
        document.body.style.overflow = 'auto';
    }
}

// ============ MƏHSUL MODALI - ŞƏKİL QALEREYASI ============

function renderModalImage() {
    const imgEl = document.getElementById('product-modal-img');
    if (!imgEl || currentModalImages.length === 0) return;

    imgEl.src = currentModalImages[currentModalImageIndex];
    imgEl.alt = document.getElementById('product-modal-name').textContent || '';

    const prevBtn = document.getElementById('product-modal-prev');
    const nextBtn = document.getElementById('product-modal-next');
    const showNav = currentModalImages.length > 1;
    [prevBtn, nextBtn].forEach(btn => {
        if (!btn) return;
        btn.classList.toggle('hidden', !showNav);
        btn.classList.toggle('flex', showNav);
    });

    // Aktiv thumbnail-i işıqlandır
    document.querySelectorAll('#product-modal-thumbs button').forEach((btn, i) => {
        btn.classList.toggle('ring-2', i === currentModalImageIndex);
        btn.classList.toggle('ring-indigo-600', i === currentModalImageIndex);
        btn.classList.toggle('opacity-60', i !== currentModalImageIndex);
    });
}

function renderModalThumbs() {
    const wrap = document.getElementById('product-modal-thumbs');
    if (!wrap) return;

    if (currentModalImages.length <= 1) {
        wrap.classList.add('hidden');
        wrap.classList.remove('flex');
        wrap.innerHTML = '';
        return;
    }

    wrap.classList.remove('hidden');
    wrap.classList.add('flex');
    wrap.innerHTML = currentModalImages.map((src, i) => `
        <button onclick="selectModalImage(${i})" class="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 transition ${i === currentModalImageIndex ? 'ring-2 ring-indigo-600' : 'opacity-60'}" aria-label="${i + 1}-ci şəkil">
            <img src="${src}" alt="" class="w-full h-full object-cover">
        </button>
    `).join('');
}

function selectModalImage(index) {
    currentModalImageIndex = index;
    renderModalImage();
}

function changeModalImage(direction) {
    if (currentModalImages.length === 0) return;
    currentModalImageIndex = (currentModalImageIndex + direction + currentModalImages.length) % currentModalImages.length;
    renderModalImage();
}

function openImageLightbox() {
    if (currentModalImages.length === 0) return;
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = currentModalImages[currentModalImageIndex];
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
}

function closeImageLightbox() {
    const lightbox = document.getElementById('image-lightbox');
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
}

// ============ OXŞAR MƏHSULLAR ============

function renderRelatedProducts(product) {
    const wrap = document.getElementById('product-modal-related-wrap');
    const container = document.getElementById('product-modal-related');
    if (!wrap || !container) return;

    const related = PRODUCTS
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 8);

    if (related.length === 0) {
        wrap.classList.add('hidden');
        container.innerHTML = '';
        return;
    }

    wrap.classList.remove('hidden');
    container.innerHTML = related.map(p => buildMiniProductCard(p)).join('');
}

// ============ SON BAXDIQLARINIZ ============

function addToRecentlyViewed(id) {
    recentlyViewed = recentlyViewed.filter(pid => pid !== id);
    recentlyViewed.unshift(id);
    recentlyViewed = recentlyViewed.slice(0, RECENTLY_VIEWED_LIMIT);
    saveRecentlyViewedToStorage();
    renderRecentlyViewedRow();
}

function renderRecentlyViewedRow() {
    const section = document.getElementById('recently-viewed-section');
    const grid = document.getElementById('recently-viewed-grid');
    if (!section || !grid) return;

    const products = recentlyViewed
        .map(id => PRODUCTS.find(p => p.id === id))
        .filter(Boolean)
        .slice(0, RECENTLY_VIEWED_LIMIT);

    if (products.length === 0) {
        section.classList.add('hidden');
        grid.innerHTML = '';
        return;
    }

    section.classList.remove('hidden');
    grid.innerHTML = products.map(p => buildMiniProductCard(p)).join('');
}

// Həm "Oxşar məhsullar", həm "Son baxdıqlarınız" üçün ortaq kiçik kart şablonu
function buildMiniProductCard(product) {
    const img = getPrimaryImage(product);
    const priceText = product.customPrice ? 'Sorğu ilə' : `${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}`;
    return `
        <button onclick="openProductModal(${product.id})" class="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-left hover:shadow-md transition focus:ring-2 focus:ring-indigo-600 focus:outline-none">
            <div class="h-24 bg-gray-100 overflow-hidden">
                <img src="${img}" alt="${escapeHtml(product.name)}" class="w-full h-full object-cover" loading="lazy">
            </div>
            <div class="p-2">
                <p class="text-xs font-semibold text-gray-700 line-clamp-2 leading-snug">${escapeHtml(product.name)}</p>
                <p class="text-xs font-bold text-indigo-600 mt-1">${priceText}</p>
            </div>
        </button>
    `;
}

// ============ SƏBƏT FUNKSIYALARI ============

function addToCart(id) {
    const product = PRODUCTS.find(p => p.id === id);

    if (!product) return;

    // Xüsusi qiymət məhsulları üçün xəbərdarlıq
    if (product.customPrice) {
        showToast('Zəhmət olmasa WhatsApp üzərindən qiymət soruşun');
        return;
    }

    if (product.inStock === false) {
        showToast('⚠️ Bu məhsul hazırda stokda yoxdur');
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
    // Səbət sayaçı (mobil və masaüstü versiyaların ikisi də yenilənir)
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count-mobile').innerText = count;
    document.getElementById('cart-count-desktop').innerText = count;

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
                <img src="${getPrimaryImage(item)}" alt="" class="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0">
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

// ============ SEVİMLİLƏR (WISHLIST) FUNKSIYALARI ============

function isInWishlist(id) {
    return wishlist.includes(id);
}

function toggleWishlistItem(id) {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    if (isInWishlist(id)) {
        wishlist = wishlist.filter(pid => pid !== id);
        showToast(`💔 ${product.name} sevimlilərdən silindi`);
    } else {
        wishlist.push(id);
        showToast(`❤️ ${product.name} sevimlilərə əlavə edildi`);
    }

    saveWishlistToStorage();
    updateWishlistIconsForProduct(id);
    updateWishlistCountBadges();

    // Sevimlilər modalı açıqdırsa məzmunu yeniləyək
    const wishlistModal = document.getElementById('wishlist-modal');
    if (wishlistModal && !wishlistModal.classList.contains('hidden')) {
        renderWishlistItems();
    }
}

function updateWishlistIconsForProduct(id) {
    const inList = isInWishlist(id);

    document.querySelectorAll(`.wishlist-heart-btn[data-product-id="${id}"] i`).forEach(icon => {
        icon.classList.toggle('fa-solid', inList);
        icon.classList.toggle('fa-regular', !inList);
        icon.classList.toggle('text-rose-500', inList);
        icon.classList.toggle('text-gray-500', !inList);
    });

    if (currentModalProductId === id) {
        const modalIcon = document.querySelector('#product-modal-wishlist-btn i');
        if (modalIcon) {
            modalIcon.classList.toggle('fa-solid', inList);
            modalIcon.classList.toggle('fa-regular', !inList);
            modalIcon.classList.toggle('text-rose-500', inList);
        }
    }
}

function updateWishlistCountBadges() {
    const count = wishlist.length;
    [document.getElementById('wishlist-count-mobile'), document.getElementById('wishlist-count-desktop')].forEach(badge => {
        if (!badge) return;
        badge.innerText = count;
        badge.classList.toggle('hidden', count === 0);
    });
}

function toggleWishlistModal() {
    const modal = document.getElementById('wishlist-modal');
    const btnMobile = document.getElementById('wishlist-toggle-btn-mobile');
    const btnDesktop = document.getElementById('wishlist-toggle-btn-desktop');

    modal.classList.toggle('hidden');
    const isOpen = !modal.classList.contains('hidden');
    if (btnMobile) btnMobile.setAttribute('aria-expanded', isOpen);
    if (btnDesktop) btnDesktop.setAttribute('aria-expanded', isOpen);

    if (isOpen) {
        renderWishlistItems();
        document.body.style.overflow = 'hidden';
    } else {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal.classList.contains('hidden')) {
            document.body.style.overflow = 'auto';
        }
    }
}

function renderWishlistItems() {
    const container = document.getElementById('wishlist-items');
    if (!container) return;

    const products = wishlist.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

    if (products.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">Sevimlilər siyahınız boşdur.</p>';
        return;
    }

    container.innerHTML = '';
    products.forEach(product => {
        const priceText = product.customPrice ? 'Sorğu ilə' : `${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}`;
        const item = document.createElement('div');
        item.className = 'flex items-center gap-3 bg-gray-50 p-3 rounded-xl group';
        item.setAttribute('role', 'listitem');
        item.innerHTML = `
            <button onclick="closeAndOpenProduct(${product.id})" class="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 focus:ring-2 focus:ring-indigo-600 focus:outline-none" aria-label="${escapeHtml(product.name)} - detallara bax">
                <img src="${getPrimaryImage(product)}" alt="" class="w-full h-full object-cover">
            </button>
            <div class="flex-1 min-w-0 cursor-pointer" onclick="closeAndOpenProduct(${product.id})">
                <h5 class="font-semibold text-gray-800 text-sm truncate">${escapeHtml(product.name)}</h5>
                <span class="text-xs font-bold text-indigo-600">${priceText}</span>
            </div>
            <button 
                onclick="toggleWishlistItem(${product.id})" 
                class="text-rose-500 hover:text-rose-700 p-2 rounded hover:bg-rose-50 focus:ring-2 focus:ring-rose-300 focus:outline-none flex-shrink-0"
                aria-label="Sevimlilərdən sil">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        container.appendChild(item);
    });
}

// Sevimlilər modalından bir məhsula klik edəndə modalı bağlayıb məhsul detallarını açır
function closeAndOpenProduct(id) {
    toggleWishlistModal();
    openProductModal(id);
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

function saveWishlistToStorage() {
    try {
        localStorage.setItem('minibazar_wishlist', JSON.stringify(wishlist));
    } catch (error) {
        console.warn('LocalStorage xətası:', error);
    }
}

function loadWishlistFromStorage() {
    try {
        const saved = localStorage.getItem('minibazar_wishlist');
        if (saved) {
            wishlist = JSON.parse(saved);
            updateWishlistCountBadges();
        }
    } catch (error) {
        console.warn('LocalStorage oxuma xətası:', error);
    }
}

function saveRecentlyViewedToStorage() {
    try {
        localStorage.setItem('minibazar_recently_viewed', JSON.stringify(recentlyViewed));
    } catch (error) {
        console.warn('LocalStorage xətası:', error);
    }
}

function loadRecentlyViewedFromStorage() {
    try {
        const saved = localStorage.getItem('minibazar_recently_viewed');
        if (saved) {
            recentlyViewed = JSON.parse(saved);
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

// ============ AĞILLI KÖMƏKÇİ (TEZ-TEZ SORUŞULAN SUALLAR) ============
// Qeyd: bu, real vaxtda cavab yazan süni intellekt DEYİL - əvvəlcədən
// hazırlanmış (CONFIG.FAQ-dan gələn) sual-cavablarla işləyən sadə bir
// köməkçi widget-idir. Mürəkkəb suallar üçün müştəri birbaşa WhatsApp-a
// yönləndirilir.

function renderHelperFAQ() {
    const body = document.getElementById('helper-body');
    const waLink = document.getElementById('helper-whatsapp-link');
    if (!body) return;

    const faqList = (CONFIG.FAQ || []).slice();
    if (CONFIG.STORE_HOURS) {
        faqList.push({ q: 'İş saatlarınız hansıdır?', a: `İş saatımız: ${CONFIG.STORE_HOURS}.` });
    }

    if (waLink) {
        waLink.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`;
    }

    if (faqList.length === 0) {
        body.innerHTML = '<p class="text-sm text-gray-500">Suallarınız üçün birbaşa WhatsApp-a yazın.</p>';
        return;
    }

    body.innerHTML = faqList.map((item, i) => `
        <div class="border border-gray-100 rounded-xl overflow-hidden">
            <button onclick="toggleFaqAnswer(${i})" class="faq-question w-full text-left px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 transition flex justify-between items-center gap-2">
                <span>${escapeHtml(item.q)}</span>
                <i class="fa-solid fa-chevron-down text-xs text-gray-400 transition-transform"></i>
            </button>
            <div id="faq-answer-${i}" class="hidden px-3 py-2.5 text-sm text-gray-600 bg-white">${escapeHtml(item.a)}</div>
        </div>
    `).join('');
}

function toggleFaqAnswer(index) {
    const answer = document.getElementById(`faq-answer-${index}`);
    if (!answer) return;
    answer.classList.toggle('hidden');
}

function toggleHelperPanel() {
    const panel = document.getElementById('helper-panel');
    const btn = document.getElementById('helper-toggle-btn');
    if (!panel) return;

    panel.classList.toggle('hidden');
    const isOpen = !panel.classList.contains('hidden');
    if (btn) btn.setAttribute('aria-expanded', isOpen);
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
