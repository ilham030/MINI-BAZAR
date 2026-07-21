// ============================================
// MİNİBAZAR - TƏHLÜKƏSİZ VƏ DİNAMİK SCRIPT.JS
// ============================================

let cart = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let allProducts = [];

// Fallback konfiqurasiyalar (config.js yoxdursa və ya əskikdirsə xəta verməsin)
if (typeof CONFIG === 'undefined') {
    var CONFIG = {
        STORE_NAME: 'MİNİBAZAR',
        WHATSAPP_NUMBER: '994500000000',
        STORE_CURRENCY: 'AZN',
        STORE_ADDRESS: 'İmişli şəhəri',
        STORE_HOURS: '09:00 - 21:00'
    };
}

if (typeof CATEGORIES === 'undefined') {
    var CATEGORIES = [
        { id: 'all', label: 'Bütün məhsullar', icon: 'fa-border-all' },
        { id: 'erzaq', label: 'Ərzaq', icon: 'fa-basket-shopping' },
        { id: 'meyve', label: 'Meyvə-Tərəvəz', icon: 'fa-apple-whole' }
    ];
}

// ============ İNİTİALİZASİYA ============

document.addEventListener('DOMContentLoaded', function() {
    initProducts();
    loadCartFromStorage();
    renderCategoryButtons();
    renderStoreInfo();

    setTimeout(() => {
        applyFilters();
    }, 200);

    window.addEventListener('scroll', handleScrollForBackToTop);

    // Escape tuşu ilə modalları bağlamaq
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const cartModal = document.getElementById('cart-modal');
            const productModal = document.getElementById('product-modal');
            const adminModal = document.getElementById('admin-modal');
            if (adminModal && !adminModal.classList.contains('hidden')) {
                toggleAdminModal();
            } else if (productModal && !productModal.classList.contains('hidden')) {
                closeProductModal();
            } else if (cartModal && !cartModal.classList.contains('hidden')) {
                toggleCartModal();
            }
        }
    });
});

// ============ MƏHSULLARIN YÜKLƏNMƏSİ ============

function initProducts() {
    const savedCustomProducts = localStorage.getItem('minibazar_custom_products');
    let customProducts = savedCustomProducts ? JSON.parse(savedCustomProducts) : [];
    const baseProducts = typeof PRODUCTS !== 'undefined' ? PRODUCTS : [];
    allProducts = [...baseProducts, ...customProducts];
}

function saveCustomProduct(productData) {
    const savedCustomProducts = localStorage.getItem('minibazar_custom_products');
    let customProducts = savedCustomProducts ? JSON.parse(savedCustomProducts) : [];
    
    customProducts.push(productData);
    localStorage.setItem('minibazar_custom_products', JSON.stringify(customProducts));
    
    initProducts();
    applyFilters();
}

// ============ ADMİN PANEL MODALI ============

function toggleAdminModal() {
    let adminModal = document.getElementById('admin-modal');
    
    if (!adminModal) {
        createAdminModalHTML();
        adminModal = document.getElementById('admin-modal');
    }

    adminModal.classList.toggle('hidden');
    document.body.style.overflow = adminModal.classList.contains('hidden') ? 'auto' : 'hidden';
}

function createAdminModalHTML() {
    const modalHTML = `
    <div id="admin-modal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-gray-800"><i class="fa-solid fa-user-gear mr-2 text-indigo-600"></i>Məhsul Əlavə Et (Admin)</h3>
                <button onclick="toggleAdminModal()" class="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
            </div>
            <form id="add-product-form" onsubmit="handleAddNewProduct(event)" class="space-y-4">
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Məhsulun Adı</label>
                    <input type="text" id="admin-p-name" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-600">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Kateqoriya ID (məs: erzaq, meyve)</label>
                    <input type="text" id="admin-p-category" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-600">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Qiymət (AZN)</label>
                    <input type="number" step="0.01" id="admin-p-price" required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-600">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Şəkil Linki (URL)</label>
                    <input type="url" id="admin-p-img" placeholder="https://..." required class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-600">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Təsvir</label>
                    <textarea id="admin-p-desc" class="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-600" rows="2"></textarea>
                </div>
                <button type="submit" class="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition">
                    Məhsulu Yüklə
                </button>
            </form>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function handleAddNewProduct(e) {
    e.preventDefault();
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('admin-p-name').value,
        category: document.getElementById('admin-p-category').value.toLowerCase().trim(),
        price: parseFloat(document.getElementById('admin-p-price').value),
        img: document.getElementById('admin-p-img').value,
        description: document.getElementById('admin-p-desc').value
    };

    saveCustomProduct(newProduct);
    toggleAdminModal();
    document.getElementById('add-product-form').reset();
    showToast('✅ Məhsul uğurla əlavə edildi!');
}

// ============ STORE INFO ============

function renderStoreInfo() {
    const badge = document.getElementById('free-delivery-badge');
    if (badge) badge.innerHTML = `<i class="fa-solid fa-truck mr-2"></i>Çatdırılma mövcuddur`;

    const phoneEl = document.getElementById('footer-phone');
    if (phoneEl) phoneEl.textContent = formatPhoneDisplay(CONFIG.WHATSAPP_NUMBER);

    const addressEl = document.getElementById('footer-address');
    if (addressEl) addressEl.textContent = CONFIG.STORE_ADDRESS || '';

    const hoursEl = document.getElementById('footer-hours');
    if (hoursEl) hoursEl.textContent = CONFIG.STORE_HOURS || '';

    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const waLink = document.getElementById('footer-whatsapp');
    if (waLink) waLink.href = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`;
}

function formatPhoneDisplay(number) {
    const cleaned = (number || '').replace(/\D/g, '');
    if (cleaned.length === 12) {
        return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
    }
    return `+${cleaned}`;
}

// ============ KATEQORIYA VƏ FİLTRLƏR ============

function renderCategoryButtons() {
    const container = document.getElementById('category-filters');
    if (!container) return;
    container.innerHTML = '';

    CATEGORIES.forEach(category => {
        const button = document.createElement('button');
        button.className = `cat-btn px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition focus:ring-2 focus:outline-none`;
        button.dataset.category = category.id;
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', category.id === 'all');

        if (category.id === 'all') {
            button.className += ` bg-indigo-600 text-white shadow-sm`;
        } else {
            button.className += ` bg-white text-gray-600 border border-gray-200 hover:bg-gray-50`;
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

function applyFilters() {
    let filtered = allProducts;

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

// ============ MƏHSULLARI GÖSTƏRMƏK ============

function displayProducts(productsToRender) {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');
    const loadingSpinner = document.getElementById('loading-spinner');

    if (loadingSpinner) loadingSpinner.classList.add('hidden');
    if (!grid) return;

    if (productsToRender.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    grid.innerHTML = '';

    productsToRender.forEach(product => {
        const priceDisplay = `<span class="text-indigo-600 font-black text-lg">${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}</span>`;

        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col group cursor-pointer';
        card.innerHTML = `
            <div class="h-48 overflow-hidden bg-gray-100 relative">
                <img src="${product.img}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy">
                <span class="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full uppercase font-semibold">
                    ${product.category}
                </span>
            </div>
            <div class="p-4 flex flex-col flex-1 justify-between">
                <div>
                    <h4 class="text-gray-800 font-semibold text-sm line-clamp-2">${escapeHtml(product.name)}</h4>
                    <p class="text-gray-500 text-xs mt-1 line-clamp-1">${escapeHtml(product.description || '')}</p>
                </div>
                <div class="flex justify-between items-center mt-4">
                    ${priceDisplay}
                    <button onclick="event.stopPropagation(); addToCart(${product.id})" class="bg-indigo-600 text-white p-2.5 rounded-lg hover:bg-indigo-700 transition" title="Səbətə əlavə et">
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;

        card.addEventListener('click', () => openProductModal(product.id));
        grid.appendChild(card);
    });
}

// ============ MODALLAR VƏ SƏBƏT ============

function openProductModal(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    document.getElementById('product-modal-img').src = product.img;
    document.getElementById('product-modal-img').alt = product.name;
    document.getElementById('product-modal-category').textContent = product.category.toUpperCase();
    document.getElementById('product-modal-name').textContent = product.name;
    document.getElementById('product-modal-description').textContent = product.description || '';
    document.getElementById('product-modal-price').textContent = `${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}`;

    const addBtn = document.getElementById('product-modal-add-btn');
    addBtn.onclick = () => {
        addToCart(product.id);
        closeProductModal();
    };

    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function addToCart(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

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
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.innerText = count);

    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Səbətiniz boşdur.</p>';
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex justify-between items-center bg-gray-50 p-4 rounded-xl';
            itemElement.innerHTML = `
                <div class="flex-1">
                    <h5 class="font-semibold text-gray-800 text-sm">${escapeHtml(item.name)}</h5>
                    <span class="text-xs text-gray-500">${formatPrice(item.price)} × ${item.quantity}</span>
                    <span class="text-xs font-bold text-indigo-600 ml-2">Cəmi: ${formatPrice(item.price * item.quantity)}</span>
                </div>
                <div class="flex gap-2 items-center">
                    <div class="flex items-center gap-1 bg-white rounded border border-gray-200">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" class="px-2 py-1 text-gray-500">−</button>
                        <span class="px-2 text-sm font-semibold">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" class="px-2 py-1 text-gray-500">+</button>
                    </div>
                    <button onclick="removeFromCart(${item.id})" class="text-red-500 p-1"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalEl = document.getElementById('cart-total');
    if (totalEl) totalEl.innerText = formatPrice(total);
}

function toggleCartModal() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    modal.classList.toggle('hidden');
    document.body.style.overflow = modal.classList.contains('hidden') ? 'auto' : 'hidden';
}

function checkoutViaWhatsApp() {
    if (cart.length === 0) return;
    let message = `🛒 *YENİ SİFARİŞ - ${CONFIG.STORE_NAME}*\n\n`;
    cart.forEach((item, index) => {
        message += `${index + 1}. *${escapeHtml(item.name)}* - ${item.quantity} ədəd (${formatPrice(item.price * item.quantity)} ${CONFIG.STORE_CURRENCY})\n`;
    });
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n💰 *CƏMİ: ${formatPrice(total)} ${CONFIG.STORE_CURRENCY}*`;
    
    window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

function saveCartToStorage() {
    localStorage.setItem('minibazar_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('minibazar_cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

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
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
}

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
