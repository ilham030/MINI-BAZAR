// ============================================
// MİNİBAZAR ADMİN PANELİ
// Bu fayl saytın canlı hissəsi ilə əlaqəli DEYİL.
// Sadəcə GitHub reponuza birbaşa qoşularaq data.json
// faylını (məhsullar və kateqoriyalar) yeniləyir.
// ============================================

const REPO_OWNER = 'ilham030';
const REPO_NAME = 'MINI-BAZAR';
const DATA_PATH = 'data.json';
const IMAGES_DIR = 'images/products';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;
const SITE_URL = `https://${REPO_OWNER}.github.io/${REPO_NAME}/`;

const LS_PIN = 'mb_admin_pin_hash';
const LS_TOKEN = 'mb_github_token';

let unlocked = false;
let githubToken = null;
let currentData = { categories: [], products: [] };
let currentSha = null;
let editingProductId = null; // null = yeni məhsul rejimi

// Formadakı şəkillərin siyahısı. Hər element:
//   { type: 'existing', path: '<github yolu>', src: '<göstərmək üçün url>' }
//   { type: 'new', base64: '<prefiksiz base64>', ext: 'jpg', src: '<data url>' }
// Massivdəki İLK element = əsas şəkil (kartlarda görünən).
let formImages = [];

// ============ KÖMƏKÇİ FUNKSİYALAR ============

async function sha256Hex(text) {
    const enc = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(str) {
    return decodeURIComponent(escape(atob(str)));
}

function slugifyCategory(label) {
    return label.trim().toLowerCase();
}

function $(id) { return document.getElementById(id); }

function showScreen(id) {
    ['screen-pin-setup', 'screen-pin-enter', 'screen-token-setup', 'screen-dashboard', 'screen-form'].forEach(s => {
        $(s).classList.toggle('hidden', s !== id);
    });
}

function showToast(message, isError = false) {
    const toast = $('admin-toast');
    const text = $('admin-toast-text');
    text.textContent = message;
    toast.classList.remove('hidden', 'bg-gray-900', 'bg-red-600');
    toast.classList.add(isError ? 'bg-red-600' : 'bg-gray-900');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

function setBusy(button, busy, busyLabel) {
    if (!button) return;
    if (busy) {
        button.dataset.originalHtml = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>${busyLabel || 'Yüklənir...'}`;
    } else {
        button.disabled = false;
        if (button.dataset.originalHtml) button.innerHTML = button.dataset.originalHtml;
    }
}

// ============ PIN KİLİDİ ============
// Qeyd: bu, tam şifrələmə deyil — sadəcə yad birinin telefonunuza/kompüterinizə
// baxanda paneli görməsinin qarşısını alan sadə bir ekran kilididir.
// Əsl təhlükəsizlik GitHub token-inizdədir: onu heç kimlə paylaşmayın.

document.addEventListener('DOMContentLoaded', init);

async function init() {
    $('site-link').href = SITE_URL;

    const savedPinHash = localStorage.getItem(LS_PIN);
    if (!savedPinHash) {
        showScreen('screen-pin-setup');
    } else {
        showScreen('screen-pin-enter');
        $('pin-enter-input').focus();
    }
}

async function submitPinSetup() {
    const pin1 = $('pin-setup-input').value.trim();
    const pin2 = $('pin-setup-confirm').value.trim();
    const errEl = $('pin-setup-error');
    errEl.classList.add('hidden');

    if (pin1.length < 4) {
        errEl.textContent = 'PIN ən azı 4 rəqəm olmalıdır.';
        errEl.classList.remove('hidden');
        return;
    }
    if (pin1 !== pin2) {
        errEl.textContent = 'PIN-lər uyğun gəlmir.';
        errEl.classList.remove('hidden');
        return;
    }

    const hash = await sha256Hex(pin1);
    localStorage.setItem(LS_PIN, hash);
    unlocked = true;
    afterUnlock();
}

async function submitPinEnter() {
    const pin = $('pin-enter-input').value.trim();
    const errEl = $('pin-enter-error');
    errEl.classList.add('hidden');

    const hash = await sha256Hex(pin);
    const saved = localStorage.getItem(LS_PIN);

    if (hash === saved) {
        unlocked = true;
        $('pin-enter-input').value = '';
        afterUnlock();
    } else {
        errEl.textContent = 'PIN yanlışdır.';
        errEl.classList.remove('hidden');
        $('pin-enter-input').value = '';
        $('pin-enter-input').focus();
    }
}

function resetAdminAccess() {
    if (!confirm('PIN və yadda saxlanılan GitHub token bu cihazdan silinəcək. Davam etmək istəyirsiniz?')) return;
    localStorage.removeItem(LS_PIN);
    localStorage.removeItem(LS_TOKEN);
    location.reload();
}

function lockAdmin() {
    unlocked = false;
    githubToken = null;
    $('pin-enter-input').value = '';
    showScreen('screen-pin-enter');
}

function afterUnlock() {
    githubToken = localStorage.getItem(LS_TOKEN);
    if (!githubToken) {
        showScreen('screen-token-setup');
    } else {
        showScreen('screen-dashboard');
        loadProducts();
    }
}

// ============ GITHUB TOKEN QURULUMU ============

async function submitTokenSetup() {
    const token = $('token-input').value.trim();
    const errEl = $('token-setup-error');
    const btn = $('token-submit-btn');
    errEl.classList.add('hidden');

    if (!token) {
        errEl.textContent = 'Zəhmət olmasa tokeni daxil edin.';
        errEl.classList.remove('hidden');
        return;
    }

    setBusy(btn, true, 'Yoxlanılır...');
    try {
        const res = await fetch(API_BASE, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (res.status === 401) {
            errEl.textContent = 'Token etibarsızdır. Zəhmət olmasa yenidən yoxlayın.';
            errEl.classList.remove('hidden');
            return;
        }
        if (!res.ok) {
            errEl.textContent = `Repoya çatmaq mümkün olmadı (${res.status}). Token-in "${REPO_NAME}" repositoriyasına icazəsi olduğunu yoxlayın.`;
            errEl.classList.remove('hidden');
            return;
        }

        localStorage.setItem(LS_TOKEN, token);
        githubToken = token;
        $('token-input').value = '';
        showScreen('screen-dashboard');
        loadProducts();
    } catch (e) {
        errEl.textContent = 'Şəbəkə xətası. İnternet bağlantınızı yoxlayın.';
        errEl.classList.remove('hidden');
    } finally {
        setBusy(btn, false);
    }
}

function changeToken() {
    if (!confirm('Yadda saxlanılan GitHub token silinəcək, yenisini daxil edəcəksiniz. Davam edilsin?')) return;
    localStorage.removeItem(LS_TOKEN);
    githubToken = null;
    showScreen('screen-token-setup');
}

// ============ GITHUB CONTENTS API ============

function ghHeaders() {
    return {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
    };
}

async function githubGetFile(path) {
    const res = await fetch(`${API_BASE}/contents/${path}?t=${Date.now()}`, { headers: ghHeaders() });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub-dan oxuma xətası (${res.status})`);
    const json = await res.json();
    return { content: json.content, sha: json.sha };
}

async function githubPutFile(path, base64Content, message, sha) {
    const body = { message, content: base64Content };
    if (sha) body.sha = sha;

    const res = await fetch(`${API_BASE}/contents/${path}`, {
        method: 'PUT',
        headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (res.status === 401) throw new Error('Token etibarsızdır. Zəhmət olmasa yenidən daxil edin.');
    if (res.status === 403) throw new Error('Bu əməliyyat üçün icazə yoxdur (token-in yazma icazəsini yoxlayın).');
    if (res.status === 409) throw new Error('Fayl bu zaman arasında başqa yerdən dəyişib. Zəhmət olmasa səhifəni yeniləyib yenidən cəhd edin.');
    if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`GitHub yazma xətası (${res.status}) ${errText}`);
    }
    return res.json();
}

// ============ MƏHSUL SİYAHISININ YÜKLƏNMƏSİ ============

async function loadProducts() {
    const listEl = $('product-list');
    listEl.innerHTML = `<div class="text-center py-10 text-gray-400"><i class="fa-solid fa-spinner fa-spin text-3xl mb-2"></i><p>Yüklənir...</p></div>`;

    try {
        const file = await githubGetFile(DATA_PATH);
        if (!file) {
            currentData = { categories: [], products: [] };
            currentSha = null;
        } else {
            currentData = JSON.parse(base64ToUtf8(file.content.replace(/\n/g, '')));
            currentSha = file.sha;
            if (!currentData.categories) currentData.categories = [];
            if (!currentData.products) currentData.products = [];
        }
        renderProductList();
    } catch (e) {
        console.error(e);
        listEl.innerHTML = `<div class="text-center py-10">
            <i class="fa-solid fa-triangle-exclamation text-4xl text-amber-400 mb-3"></i>
            <p class="text-gray-600 mb-3">${e.message || 'Məhsullar yüklənə bilmədi.'}</p>
            <button onclick="loadProducts()" class="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition">Yenidən cəhd et</button>
        </div>`;
    }
}

function renderProductList() {
    const listEl = $('product-list');
    const searchTerm = ($('admin-search').value || '').trim().toLowerCase();

    let products = currentData.products.slice().reverse(); // ən yeni əvvəldə
    if (searchTerm) {
        products = products.filter(p => p.name.toLowerCase().includes(searchTerm));
    }

    if (products.length === 0) {
        listEl.innerHTML = `<div class="text-center py-10 text-gray-400">
            <i class="fa-solid fa-box-open text-4xl mb-3"></i>
            <p>${searchTerm ? 'Nəticə tapılmadı.' : 'Hələ məhsul yoxdur. "Yeni məhsul" düyməsi ilə başlayın.'}</p>
        </div>`;
        return;
    }

    listEl.innerHTML = '';
    products.forEach(p => {
        const cat = currentData.categories.find(c => c.id === p.category);
        const outOfStock = p.inStock === false;
        const row = document.createElement('div');
        row.className = 'flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 shadow-sm';
        row.innerHTML = `
            <img src="${p.img}" alt="" class="w-14 h-14 rounded-lg object-cover bg-gray-100 flex-shrink-0 ${outOfStock ? 'grayscale opacity-60' : ''}">
            <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 text-sm truncate">${escapeHtmlAdmin(p.name)}</p>
                <p class="text-xs text-gray-500">${cat ? escapeHtmlAdmin(cat.label) : p.category} · ${p.customPrice ? 'Sorğu ilə' : formatPriceAdmin(p.price) + ' AZN'}${outOfStock ? ' · <span class="text-red-500 font-medium">Stokda yoxdur</span>' : ''}</p>
            </div>
            <button onclick="openForm(${p.id})" class="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition" aria-label="Redaktə et" title="Redaktə et">
                <i class="fa-solid fa-pen"></i>
            </button>
            <button onclick="deleteProduct(${p.id})" class="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition" aria-label="Sil" title="Sil">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        `;
        listEl.appendChild(row);
    });
}

function formatPriceAdmin(price) {
    return parseFloat(price || 0).toFixed(2);
}

function escapeHtmlAdmin(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function filterAdminList() {
    renderProductList();
}

// ============ FORMA (ƏLAVƏ ET / REDAKTƏ ET) ============

function populateCategorySelect(selectedId) {
    const select = $('form-category');
    select.innerHTML = '';
    currentData.categories.filter(c => c.id !== 'all').forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.label;
        select.appendChild(opt);
    });
    const newOpt = document.createElement('option');
    newOpt.value = '__new__';
    newOpt.textContent = '+ Yeni kateqoriya';
    select.appendChild(newOpt);

    if (selectedId && currentData.categories.some(c => c.id === selectedId)) {
        select.value = selectedId;
    }
    toggleNewCategoryInput();
}

function toggleNewCategoryInput() {
    const isNew = $('form-category').value === '__new__';
    $('form-new-category-wrap').classList.toggle('hidden', !isNew);
}

function openForm(productId) {
    editingProductId = productId || null;
    $('image-file-input').value = '';
    $('form-error').classList.add('hidden');

    const product = productId ? currentData.products.find(p => p.id === productId) : null;

    $('form-title').textContent = product ? 'Məhsulu redaktə et' : 'Yeni məhsul';
    $('form-save-btn-label').textContent = product ? 'Yenilə' : 'Əlavə et';

    $('form-name').value = product ? product.name : '';
    $('form-price').value = product ? product.price : '';
    $('form-old-price').value = product && product.oldPrice ? product.oldPrice : '';
    $('form-description').value = product ? (product.description || '') : '';
    $('form-custom-price').checked = product ? !!product.customPrice : false;
    $('form-in-stock').checked = product ? product.inStock !== false : true;
    $('form-rating').value = product && product.rating ? product.rating : '';
    $('form-review-count').value = product && product.reviewCount ? product.reviewCount : '';
    $('form-new-category').value = '';

    populateCategorySelect(product ? product.category : null);
    togglePriceFields();

    // Mövcud məhsulun şəkillərini formImages massivinə yüklə (yoxdursa boş massiv = yeni məhsul)
    const existingPaths = product ? (Array.isArray(product.images) && product.images.length ? product.images : (product.img ? [product.img] : [])) : [];
    formImages = existingPaths.map(path => ({ type: 'existing', path, src: path }));
    renderFormImageThumbs();

    showScreen('screen-form');
}

function closeForm() {
    showScreen('screen-dashboard');
}

function togglePriceFields() {
    const isCustom = $('form-custom-price').checked;
    $('price-field-wrap').classList.toggle('hidden', isCustom);
}

// ============ ŞƏKİL QALEREYASI (FORMA) ============

function renderFormImageThumbs() {
    const grid = $('image-thumbs-grid');
    if (!grid) return;

    grid.innerHTML = formImages.map((img, i) => `
        <div class="relative rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
            <img src="${img.src}" alt="" class="w-full h-full object-cover">
            ${i === 0 ? '<span class="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">ƏSAS</span>' : ''}
            <button type="button" onclick="removeFormImage(${i})" class="absolute top-1 right-1 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs leading-none hover:bg-red-600 transition" aria-label="Şəkli sil">&times;</button>
            <div class="absolute bottom-1 right-1 flex gap-1">
                ${i > 0 ? `<button type="button" onclick="moveFormImage(${i}, -1)" class="bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] hover:bg-black/80 transition" aria-label="Sola daşı">‹</button>` : ''}
                ${i < formImages.length - 1 ? `<button type="button" onclick="moveFormImage(${i}, 1)" class="bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] hover:bg-black/80 transition" aria-label="Sağa daşı">›</button>` : ''}
            </div>
        </div>
    `).join('');
}

function removeFormImage(index) {
    formImages.splice(index, 1);
    renderFormImageThumbs();
}

function moveFormImage(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= formImages.length) return;
    [formImages[index], formImages[target]] = [formImages[target], formImages[index]];
    renderFormImageThumbs();
}

async function handleImageSelect(input) {
    const files = input.files ? Array.from(input.files) : [];
    if (files.length === 0) return;

    const invalid = files.find(f => !f.type.startsWith('image/'));
    if (invalid) {
        showToast('Zəhmət olmasa yalnız şəkil faylları seçin.', true);
        return;
    }

    try {
        for (const file of files) {
            const { base64, dataUrl } = await resizeImageFile(file, 1280, 0.78);
            formImages.push({ type: 'new', base64, ext: 'jpg', src: dataUrl });
        }
        renderFormImageThumbs();
    } catch (e) {
        console.error(e);
        showToast('Şəkil emal edilərkən xəta baş verdi.', true);
    } finally {
        input.value = '';
    }
}

function resizeImageFile(file, maxDimension, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let { width, height } = img;
                if (width > maxDimension || height > maxDimension) {
                    if (width >= height) {
                        height = Math.round(height * (maxDimension / width));
                        width = maxDimension;
                    } else {
                        width = Math.round(width * (maxDimension / height));
                        height = maxDimension;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve({ base64: dataUrl.split(',')[1], dataUrl });
            };
            img.onerror = () => reject(new Error('Şəkil oxuna bilmədi.'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Fayl oxuna bilmədi.'));
        reader.readAsDataURL(file);
    });
}

async function handleSave() {
    const errEl = $('form-error');
    errEl.classList.add('hidden');

    const name = $('form-name').value.trim();
    const isCustomPrice = $('form-custom-price').checked;
    const priceRaw = $('form-price').value.trim();
    const oldPriceRaw = $('form-old-price').value.trim();
    const description = $('form-description').value.trim();
    const inStock = $('form-in-stock').checked;
    const ratingRaw = $('form-rating').value.trim();
    const reviewCountRaw = $('form-review-count').value.trim();

    let categoryId = $('form-category').value;
    const newCategoryLabel = $('form-new-category').value.trim();

    if (!name) { return showFormError('Məhsulun adını yazın.'); }
    if (categoryId === '__new__' && !newCategoryLabel) { return showFormError('Yeni kateqoriyanın adını yazın.'); }
    if (!isCustomPrice && (!priceRaw || isNaN(parseFloat(priceRaw)) || parseFloat(priceRaw) < 0)) {
        return showFormError('Düzgün qiymət daxil edin (və ya "Qiymət sorğu ilə" seçin).');
    }
    if (formImages.length === 0) {
        return showFormError('Zəhmət olmasa məhsul üçün ən azı bir şəkil seçin.');
    }

    const btn = $('form-save-btn');
    setBusy(btn, true, 'Yadda saxlanılır...');

    try {
        // 1. Ən son data.json-u çək (kimsə başqa cihazdan dəyişiklik edibsə də uyğunlaşsın)
        const file = await githubGetFile(DATA_PATH);
        let data = file ? JSON.parse(base64ToUtf8(file.content.replace(/\n/g, ''))) : { categories: [], products: [] };
        if (!data.categories) data.categories = [];
        if (!data.products) data.products = [];

        // 2. Yeni kateqoriyanı lazım olsa əlavə et
        if (categoryId === '__new__') {
            const newId = slugifyCategory(newCategoryLabel);
            const exists = data.categories.find(c => c.id === newId);
            if (!exists) {
                data.categories.push({ id: newId, label: newCategoryLabel, icon: 'fa-tag' });
            }
            categoryId = newId;
        }

        // 3. Yeni (hələ GitHub-da olmayan) şəkilləri ardıcıl yüklə, mövcud şəkillərin yolunu saxla
        const finalImagePaths = [];
        for (let i = 0; i < formImages.length; i++) {
            const img = formImages[i];
            if (img.type === 'existing') {
                finalImagePaths.push(img.path);
                continue;
            }
            setBusy(btn, true, `Şəkillər yüklənir (${i + 1}/${formImages.length})...`);
            const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${img.ext}`;
            const fullPath = `${IMAGES_DIR}/${filename}`;
            await githubPutFile(fullPath, img.base64, `Admin panel: şəkil əlavə edildi (${name})`, null);
            finalImagePaths.push(fullPath);
        }
        setBusy(btn, true, 'Yadda saxlanılır...');

        // 4. Məhsul obyektini qur
        const productObj = {
            id: editingProductId || (Math.max(0, ...data.products.map(p => p.id)) + 1),
            name,
            price: isCustomPrice ? 0 : parseFloat(priceRaw),
            category: categoryId,
            img: finalImagePaths[0] || '',
            images: finalImagePaths,
            description,
            inStock
        };
        if (isCustomPrice) productObj.customPrice = true;
        if (!isCustomPrice && oldPriceRaw && parseFloat(oldPriceRaw) > 0) productObj.oldPrice = parseFloat(oldPriceRaw);
        if (ratingRaw) productObj.rating = parseFloat(ratingRaw);
        if (reviewCountRaw) productObj.reviewCount = parseInt(reviewCountRaw, 10);

        // 5. Siyahıda yenilə və ya əlavə et
        if (editingProductId) {
            const idx = data.products.findIndex(p => p.id === editingProductId);
            if (idx >= 0) data.products[idx] = productObj;
            else data.products.push(productObj);
        } else {
            data.products.push(productObj);
        }

        // 6. data.json-u GitHub-a yaz
        const newContent = utf8ToBase64(JSON.stringify(data, null, 4));
        const commitMsg = editingProductId
            ? `Admin panel: məhsul yeniləndi (${name})`
            : `Admin panel: yeni məhsul əlavə edildi (${name})`;
        await githubPutFile(DATA_PATH, newContent, commitMsg, file ? file.sha : null);

        currentData = data;
        showToast(editingProductId ? '✅ Məhsul yeniləndi! Saytda görünməsi 30-60 saniyə çəkə bilər.' : '✅ Məhsul əlavə olundu! Saytda görünməsi 30-60 saniyə çəkə bilər.');
        showScreen('screen-dashboard');
        renderProductList();
    } catch (e) {
        console.error(e);
        showFormError(e.message || 'Xəta baş verdi. Yenidən cəhd edin.');
    } finally {
        setBusy(btn, false);
    }
}

function showFormError(msg) {
    const errEl = $('form-error');
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
}

async function deleteProduct(id) {
    const product = currentData.products.find(p => p.id === id);
    if (!product) return;
    if (!confirm(`"${product.name}" məhsulunu silmək istədiyinizə əminsiniz?`)) return;

    try {
        const file = await githubGetFile(DATA_PATH);
        let data = file ? JSON.parse(base64ToUtf8(file.content.replace(/\n/g, ''))) : { categories: [], products: [] };
        data.products = (data.products || []).filter(p => p.id !== id);

        const newContent = utf8ToBase64(JSON.stringify(data, null, 4));
        await githubPutFile(DATA_PATH, newContent, `Admin panel: məhsul silindi (${product.name})`, file ? file.sha : null);

        currentData = data;
        showToast('🗑️ Məhsul silindi.');
        renderProductList();
    } catch (e) {
        console.error(e);
        showToast(e.message || 'Silinərkən xəta baş verdi.', true);
    }
}
