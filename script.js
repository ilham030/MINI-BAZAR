// ============================================
// ƏSAS MƏNTIQ FİLESİ
// ============================================

let cart = [];
let currentCategory = 'all';

// ============ İNİTİALİZASİYA ============

document.addEventListener('DOMContentLoaded', function() {
    // LocalStorage-dan səbəti yüklə
    loadCartFromStorage();
    
    // Kateqoriyaları göstər
    renderCategoryButtons();
    
    // Məhsulları göstər
    displayProducts(PRODUCTS);
    
    // Escape tuşu ilə modali kapat
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('cart-modal');
            if (!modal.classList.contains('hidden')) {
                toggleCartModal();
            }
        }
    });
});

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

function filterCategory(category) {
    currentCategory = category;
    
    // Düymələri güncəllə
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-white', 'text-gray-600', 'border', 'border-gray-200');
        btn.setAttribute('aria-selected', 'false');
    });
    
    document.querySelector(`[data-category="${category}"]`).classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
    document.querySelector(`[data-category="${category}"]`).classList.remove('bg-white', 'text-gray-600', 'border', 'border-gray-200');
    document.querySelector(`[data-category="${category}"]`).setAttribute('aria-selected', 'true');
    
    // Məhsulları süzgəc et
    if (category === 'all') {
        displayProducts(PRODUCTS);
    } else {
        const filtered = PRODUCTS.filter(p => p.category === category);
        displayProducts(filtered);
    }
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
        const priceDisplay = product.customPrice 
            ? '<span class="text-indigo-600 font-black text-lg">Sorğu ilə</span>'
            : `<span class="text-indigo-600 font-black text-lg">${formatPrice(product.price)} ${CONFIG.STORE_CURRENCY}</span>`;
        
        const card = document.createElement('div');
        card.className = 'bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col group focus-within:ring-2 focus-within:ring-indigo-600';
        card.innerHTML = `
            <div class="h-48 overflow-hidden bg-gray-100 relative">
                <img 
                    src="${product.img}" 
                    alt="${product.name}" 
                    class="w-full h-full object-cover group-hover:scale-105 transition duration-300 lazy-image"
                    loading="lazy">
                <span class="absolute top-2 right-2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                    ${product.category.toUpperCase()}
                </span>
            </div>
            <div class="p-4 flex flex-col flex-1 justify-between">
                <div>
                    <h4 class="text-gray-800 font-semibold text-sm line-clamp-2">${escapeHtml(product.name)}</h4>
                    <p class="text-gray-500 text-xs mt-1 line-clamp-1">${escapeHtml(product.description || '')}</p>
                </div>
                <div class="flex justify-between items-center mt-4">
                    ${priceDisplay}
                    <button 
                        onclick="addToCart(${product.id})" 
                        class="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                        aria-label="${product.name} səbətə əlavə et"
                        title="Səbətə əlavə et">
                        <i class="fa-solid fa-cart-plus"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
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
