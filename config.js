// ============================================
// KONFIQURATION FİLESİ - BƏK ETMƏLİ HISSƏ
// ============================================

// WhatsApp nömrəsi (Beynəlxalq formatda)
const CONFIG = {
    WHATSAPP_NUMBER: "994773911300",
    STORE_NAME: "MİNİBAZAR",
    STORE_CURRENCY: "AZN"
};

// Məhsullar Bazası (Asanlıqla redaktə edilir)
const PRODUCTS = [
    {
        id: 1,
        name: "İphone 17 pro",
        price: 3030,
        category: "elektronika",
        img: "https://i.postimg.cc/T3Qc46T3/Gemini-Generated-Image-d1fnxgd1fnxgd1fn.png",
        description: "Son nəsil Apple telefonu"
    },
    {
        id: 2,
        name: "Televizor",
        price: 285,
        category: "elektronika",
        img: "https://i.postimg.cc/HLxg7dS5/Gemini-Generated-Image-3j0myl3j0myl3j0m.png",
        description: "4K Ultra HD Televizor"
    },
    {
        id: 3,
        name: "Zərif don",
        price: 25.00,
        category: "geyim",
        img: "https://i.postimg.cc/g2f0dwzg/Whats-App-Image-2026-07-18-at-22-21-17.jpg",
        description: "Məsir bəzəyə uyğun qadın dostu"
    },
    {
        id: 4,
        name: "Eko dəri çanta",
        price: 35.00,
        category: "çanta",
        img: "https://i.postimg.cc/wvY351nf/Whats-App-Image-2026-07-18-at-22-22-43.jpg",
        description: "Təbii dəriyə qadın çantası"
    },
    {
        id: 5,
        name: "Sifarişlə yığılır",
        price: 0,
        category: "mebel",
        img: "https://i.postimg.cc/d3tsnr61/Whats-App-Image-2026-07-18-at-22-21-53.jpg",
        description: "Xüsusi sifariş üzrə mebel",
        customPrice: true
    }
];

// Kateqoriyalar (Azərbaycan dilində)
const CATEGORIES = [
    { id: "all", label: "Hamısı", icon: "fa-grid" },
    { id: "elektronika", label: "Elektronika", icon: "fa-laptop" },
    { id: "geyim", label: "Geyim", icon: "fa-shirt" },
    { id: "çanta", label: "Çantalar", icon: "fa-bag-shopping" },
    { id: "mebel", label: "Mebel", icon: "fa-couch" }
];
