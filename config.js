// ============================================
// KONFIQURATION FİLESİ - BƏK ETMƏLİ HISSƏ
// ============================================
// DİQQƏT: Məhsullar və kateqoriyalar artıq BURADA SAXLANILMIR.
// Onlar "data.json" faylından oxunur (script.js bunu avtomatik edir).
// Admin panelindən əlavə etdiyiniz məhsullar birbaşa data.json-a yazılır,
// ona görə bu faylda ayrıca məhsul massivi saxlamağa ehtiyac yoxdur.
// (Əvvəllər bu faylda həm də sabit PRODUCTS/CATEGORIES massivi var idi —
// elə buna görə admin paneldən etdiyiniz dəyişikliklər saytda görünmürdü:
// sayt data.json əvəzinə bu köhnə sabit siyahını göstərirdi.)

const CONFIG = {
    WHATSAPP_NUMBER: "994773911300",
    STORE_NAME: "mini_bazar_imishli",
    STORE_CURRENCY: "AZN",
    STORE_ADDRESS: "İmişli şəhəri",
    STORE_HOURS: "7/24",
    // FREE_DELIVERY_THRESHOLD: 50, // istəsəniz pulsuz çatdırılma həddini bura yazın
    SOCIAL: {
        instagram: "https://www.instagram.com/mini_bazar_imishli?igsh=MWlsa2QwcTU0dWN5OA==",
        whatsappChannel: "https://whatsapp.com/channel/0029VbD2cPVC1FuKSUxX1y2F"
    },
    // "Ağıllı Köməkçi" widget-inin tez-tez soruşulan sualları və cavabları.
    // Bura yeni sual/cavab əlavə etmək və ya mövcudları redaktə etmək kifayətdir -
    // widget avtomatik yeniləyəcək, JS kodunu dəyişməyə ehtiyac yoxdur.
    FAQ: [
        {
            q: "Çatdırılma necə işləyir?",
            a: "Sifarişinizi təsdiqlədikdən sonra çatdırılma detalları WhatsApp üzərindən sizinlə razılaşdırılır."
        },
        {
            q: "Ödəniş necə edilir?",
            a: "Ödəniş məhsul çatdırılan zaman nağd və ya kartla (razılaşma əsasında) qəbul olunur."
        },
        {
            q: "Geri qaytarma mümkündürmü?",
            a: "Bəli, məhsulda qüsur aşkar olunarsa WhatsApp üzərindən bizimlə əlaqə saxlayın - məsələni birlikdə həll edəcəyik."
        }
        // Qeyd: "İş saatlarınız hansıdır?" sualı script.js tərəfindən STORE_HOURS
        // dəyərindən avtomatik yaradılır, ona görə burada təkrar yazılmır.
    ]
};
