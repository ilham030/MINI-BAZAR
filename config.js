// ============================================
// KONFIQURATION FİLESİ - BƏK ETMƏLİ HISSƏ
// ============================================
// WhatsApp nömrəsi (Beynəlxalq formatda)
const CONFIG = {
    WHATSAPP_NUMBER: "994773911300",
    STORE_NAME: "mini_bazar_imishli",
    STORE_CURRENCY: "AZN",
    STORE_ADDRESS: "İmişli şəhəri",
    STORE_HOURS: "7/24",
    // Sosial media linkləri (Facebook ləğv edildi, WhatsApp kanalı əlavə olundu)
    SOCIAL: {
        instagram: "https://www.instagram.com/mini_bazar_imishli?igsh=MWlsa2QwcTU0dWN5OA==",
        whatsappChannel: "https://whatsapp.com/channel/0029VbD2cPVC1FuKSUxX1y2F"
    }
};

// Məhsullar Bazası
const PRODUCTS = [
    {
        id: 1,
        name: "iPhone 17 Pro",
        price: 3030,
        category: "elektronika",
        img: "https://i.postimg.cc/qMnyZKpq/Chat-GPT-Image-Jul-19-2026-02-51-30-PM.png",
        description: "Premium iPhone 17 Pro (256 GB) - Peşəkarların və yüksək keyfiyyət sevənlərin seçimi. Maksimum performans, unikal dizayn. Əvvəlki qiymət: 3599 AZN. Sərfəli kredit imkanı mövcuddur!",
        rating: 5.0,
        reviewCount: 18
    },
    {
        id: 2,
        name: "iPhone 16",
        price: 2100,
        category: "elektronika",
        img: "https://i.postimg.cc/Hk7jn982/Chat-GPT-Image-Jul-19-2026-02-01-28-PM.png",
        description: "iPhone 16 (sadə) modelində möhtəşəm endirim! Əvvəlki qiymət: 2300 AZN. Kredit imkanı mövcuddur!",
        rating: 5.0,
        reviewCount: 12
    },
    {
        id: 3,
        name: "iPhone 16 Pro",
        price: 2450,
        category: "elektronika",
        img: "https://i.postimg.cc/1RvzH3xS/Chat-GPT-Image-Jul-19-2026-02-31-02-PM.png",
        description: "Premium Titan Dizayn, Peşəkar Kamera Sistemi, A18 Pro Çipi. Məhdud sayda! Kredit şərtləri mövcuddur.",
        rating: 5.0,
        reviewCount: 18
    },
    {
        id: 4,
        name: "iPhone 17",
        price: 2150,
        category: "elektronika",
        img: "https://i.postimg.cc/6QBsgCR0/Chat-GPT-Image-Jul-19-2026-02-34-37-PM.png",
        description: "Ən son texnologiya, mükəmməl dizayn və inanılmaz performans. Əvvəlki qiymət: 2800 AZN. Sərfəli kredit şərtləri ilə mövcud!",
        rating: 5.0,
        reviewCount: 14
    },
    {
        id: 5,
        name: "Stabilizator 5000W",
        price: 350,
        category: "elektronika",
        img: "https://i.postimg.cc/9QCCH3HR/Whats-App-Image-2026-06-17-at-09-04-34.jpg",
        description: "5000W Stabilizator. Bazar qiymətinə uyğun. Garantili məhsul. Kredit mövcuddur.",
        rating: 4.8,
        reviewCount: 9
    },
    {
        id: 6,
        name: "Stabilizator 10000W",
        price: 470,
        category: "elektronika",
        img: "https://i.postimg.cc/9QCCH3HR/Whats-App-Image-2026-06-17-at-09-04-34.jpg",
        description: "10000W Stabilizator. Bazar qiymətinə uyğun. Garantili məhsul. Kredit mövcuddur.",
        rating: 4.9,
        reviewCount: 11
    },
    {
        id: 7,
        name: "Zərif don",
        price: 25.00,
        category: "geyim",
        img: "https://i.postimg.cc/g2f0dwzg/Whats-App-Image-2026-07-18-at-22-21-17.jpg",
        description: "Əlverişli və zərif geyim",
        rating: 4.2,
        reviewCount: 8
    },
    {
        id: 8,
        name: "Premium Eko-Dəri Çanta",
        price: 35.00,
        category: "çanta",
        img: "https://i.postimg.cc/wvY351nf/Whats-App-Image-2026-07-18-at-22-22-43.jpg",
        description: "Həm zərif, həm də premium görünüşü ilə üslubunuzu tamamlayacaq mükəmməl çanta! Yüksək keyfiyyətli materialı və şık dizaynı ilə həm gündəlik istifadə üçün uyğundur.",
        rating: 4.6,
        reviewCount: 20
    },
    {
        id: 9,
        name: "Premium Əl İşi Mebel (2m x 2m)",
        price: 0,
        category: "mebel",
        img: "https://i.postimg.cc/d3tsnr61/Whats-App-Image-2026-07-18-at-22-21-53.jpg",
        description: "Hər bir detalı xüsusi ustalıq və sevgi ilə hazırlanan, evinizə həm rahatlıq, həm də zəriflik qatacaq eksklüziv mebel! Tamamilə əl işi olan bu məhsul, keyfiyyətin işarəsidir.",
        customPrice: true,
        rating: 4.9,
        reviewCount: 42
    }
];

// Kateqoriyalar (Azərbaycan dilində)
const CATEGORIES = [
    { id: "all", label: "Hamısı", icon: "fa-table-cells" },
    { id: "elektronika", label: "Elektronika", icon: "fa-laptop" },
    { id: "geyim", label: "Geyim", icon: "fa-shirt" },
    { id: "çanta", label: "Çantalar", icon: "fa-bag-shopping" },
    { id: "mebel", label: "Mebel", icon: "fa-couch" }
];
