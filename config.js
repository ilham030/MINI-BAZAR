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
        img: "https://i.postimg.cc/T3Qc46T3/Gemini-Generated-Image-d1fnxgd1fnxgd1fn.png",
        description: "Peşəkarların və yüksək keyfiyyət sevənlərin seçimi olan iPhone 17 Pro maksimum performans və unikal dizaynı ilə fərqi hiss etdirir. Həm iş, həm də gündəlik istifadə üçün mükəmməl seçimdir. \n\nMəhsulun Üstünlükləri və Şərtlər:\n\n💾 Geniş Yaddaş: 256 GB tutumu ilə bütün xatirələriniz, videolarınız və sənədləriniz üçün geniş yer.\n🛡️ Zəmanətli: Tam qeydiyyatlı və rəsmi zəmanətli orijinal məhsul.\n💳 Sərfəli Kredit: Büdcənizə zərər vurmadan, rahat aylıq ödənişlərlə sahib olmaq imkanı.\n⚡ Qeyd: Nağd alışda xüsusi endirimli qiymət tətbiq olunub!",
        rating: 4.8,
        reviewCount: 15
    },
    {
        id: 2,
        name: "Ficher 32\" Smart Televizor",
        price: 285,
        category: "elektronika",
        img: "https://i.postimg.cc/HLxg7dS5/Gemini-Generated-Image-3j0myl3j0myl3j0m.png", 
        description: "Yüksək keyfiyyət və sərfəli qiyməti bir arada təqdim edən Ficher ağıllı (Smart) televizoru ilə evinizdə real kino mühiti yaradın! Parlaq rənglər və aydın səs sistemi ilə mükəmməl izləmə təcrübəsi. \n\nMəhsulun Üstünlükləri və Şərtlər:\n\n📺 Ekran Ölçüsü: 32\" düym (82 sm) – Kiçik və orta otaqlar, həmçinin mətbəx üçün ideal və kompakt seçim.\n💳 Sərfəli Kredit: Büdcənizə zərər vurmadan, rahat aylıq ödənişlərlə sahib olmaq imkanı.\n✨ Yüksək Keyfiyyət: Canlı rəng ötürülməsi, müasir Smart TV funksiyaları və rəsmi zəmanət.\n⚡ Qeyd: İnanılmaz qiymətlərlə MINI ONLINE SATIŞ-da!",
        rating: 4.5,
        reviewCount: 22
    },
    {
         id: 3,
         name: "Ficher 43\" Smart Televizor",
         price: 385,
         category: "elektronika",
         img: "https://i.postimg.cc/HLxg7dS5/Gemini-Generated-Image-3j0myl3j0myl3j0m.png", 
         description: "Yüksək keyfiyyət və sərfəli qiyməti bir arada təqdim edən Ficher ağıllı (Smart) televizoru ilə evinizdə real kino mühiti yaradın! Parlaq rənglər və aydın səs sistemi ilə mükəmməl izləmə təcrübəsi. \n\nMəhsulun Üstünlükləri və Şərtlər:\n\n📺 Ekran Ölçüsü: 43\" düym (109 sm) – Qonaq və ya yataq otağı üçün mükəmməl balans və zərif dizayn.\n💳 Sərfəli Kredit: Büdcənizə zərər vurmadan, rahat aylıq ödənişlərlə sahib olmaq imkanı.\n✨ Yüksək Keyfiyyət: Canlı rəng ötürülməsi, müasir Smart TV funksiyaları və rəsmi zəmanət.\n⚡ Qeyd: İnanılmaz qiymətlərlə MINI ONLINE SATIŞ-da!",
         rating: 4.7,
         reviewCount: 18
    },
    {
         id: 4,
         name: "Ficher 50\" Smart Televizor",
         price: 535,
         category: "elektronika",
         img: "https://i.postimg.cc/HLxg7dS5/Gemini-Generated-Image-3j0myl3j0myl3j0m.png", 
         description: "Yüksək keyfiyyət və sərfəli qiyməti bir arada təqdim edən Ficher ağıllı (Smart) televizoru ilə evinizdə real kino mühiti yaradın! Parlaq rənglər və aydın səs sistemi ilə mükəmməl izləmə təcrübəsi. \n\nMəhsulun Üstünlükləri və Şərtlər:\n\n📺 Ekran Ölçüsü: 50\" düym (127 sm) – Böyük ekran həvəskarları üçün geniş baxış bucağı və yüksək detallı təsvir.\n💳 Sərfəli Kredit: Büdcənizə zərər vurmadan, rahat aylıq ödənişlərlə sahib olmaq imkanı.\n✨ Yüksək Keyfiyyət: Canlı rəng ötürülməsi, müasir Smart TV funksiyaları və rəsmi zəmanət.\n⚡ Qeyd: İnanılmaz qiymətlərlə MINI ONLINE SATIŞ-da!",
         rating: 4.9,
         reviewCount: 35
    },
    {
         id: 5,
         name: "Ficher 65\" Ultra HD Smart Televizor",
         price: 845,
         category: "elektronika",
         img: "https://i.postimg.cc/HLxg7dS5/Gemini-Generated-Image-3j0myl3j0myl3j0m.png", 
         description: "Yüksək keyfiyyət və sərfəli qiyməti bir arada təqdim edən Ficher ağıllı (Smart) televizoru ilə evinizdə real kino mühiti yaradın! Parlaq rənglər və aydın səs sistemi ilə mükəmməl izləmə təcrübəsi. \n\nMəhsulun Üstünlükləri və Şərtlər:\n\n📺 Ekran Ölçüsü: 65\" düym (165 sm) – Nəhəng ekran zövqü, yüksək Ultra HD (4K) keyfiyyəti və premium dizayn.\n💳 Sərfəli Kredit: Büdcənizə zərər vurmadan, rahat aylıq ödənişlərlə sahib olmaq imkanı.\n✨ Yüksək Keyfiyyət: Canlı rəng ötürülməsi, müasir Smart TV funksiyaları və rəsmi zəmanət.\n⚡ Qeyd: İnanılmaz qiymətlərlə MINI ONLINE SATIŞ-da!",
         rating: 5.0,
         reviewCount: 12
    },
    {
        id: 6,
        name: "Zərif don",
        price: 25.00,
        category: "geyim",
        img: "https://i.postimg.cc/g2f0dwzg/Whats-App-Image-2026-07-18-at-22-21-17.jpg",
        description: "",
        rating: 4.2,
        reviewCount: 8
    },
    {
        id: 7,
        name: "Premium Eko-Dəri Çanta",
        price: 35.00,
        category: "çanta",
        img: "https://i.postimg.cc/wvY351nf/Whats-App-Image-2026-07-18-at-22-22-43.jpg",
        description: "Həm zərif, həm də premium görünüşü ilə üslubunuzu tamamlayacaq mükəmməl çanta! Yüksək keyfiyyətli materialı və şık dizaynı ilə həm gündəlik istifadə, həm də xüsusi günlər üçün ideal seçimdir. Bu qiymətə bu cür yüksək keyfiyyəti qaçırmayın. \n\nMəhsulun Üstünlükləri və Şərtlər:\n\n🌿 Eko Dəri: Uzunömürlü, dözümlü və ekoloji təmiz materialdan hazırlanmışdır.\n🔒 Premium Görünüş: Hər bir detalında zərifliyi əks etdirən və bahalı görünən xüsusi dizayn.\n🎁 Xüsusi Paket: Məhsul öz gözəl paketi (qutusu/torbası) ilə birlikdə göndərilir, bu da onu yaxınlarınız üçün mükəmməl bir hədiyyə seçimi edir.\n⚡ Qeyd: İnanılmaz sərfəli qiymət və yüksək keyfiyyət fərqi ilə MINI ONLINE SATIŞ-da!",
        rating: 4.6,
        reviewCount: 20
    },
    {
        id: 8,
        name: "Premium Əl İşi Mebel (2m x 2m)",
        price: 0,
        category: "mebel",
        img: "https://i.postimg.cc/d3tsnr61/Whats-App-Image-2026-07-18-at-22-21-53.jpg",
        description: "Hər bir detalı xüsusi ustalıq və sevgi ilə hazırlanan, evinizə həm rahatlıq, həm də zəriflik qatacaq eksklüziv mebel! Tamamilə əl işi olan bu məhsul, keyfiyyətli materialları və dayanıqlı strukturu ilə uzunillik istifadə üçün nəzərdə tutulub. \n\nMəhsulun Üstünlükləri və Şərtlər:\n\n🤩 Tamamilə Əl İşidir: Kütləvi istehsal deyil! Hər bir detal ustadlarımızın fərdi yanaşması və yüksək əl əməyi ilə ərsəyə gəlir.\n🛡️ 1 İl Rəsmi Zəmanət: Keyfiyyətimizə tam güvənirik. Mebelin dözümlülüyünə və materialına rəsmi olaraq 1 il tam zəmanət verilir.\n📐 Dəqiq Ölçü: 2m * 2m ölçüləri ilə qonaq və ya istirahət otağınızda maksimum funksionallıq və rahatlıq təmin edir.\n💳 Kredit İmkanı: Nağd alışla yanaşı, büdcənizi yormadan, sizə uyğun sərfəli kredit şərtlərindən də yararlana bilərsiniz.\n⚡ Qeyd: Məhsul fərdi sifariş əsasında, cəmi 15 gün ərzində yüksək keyfiyyətlə hazırlanır. Bugünkü bazar qiymətlərinə tam uyğun, ən optimal təkliflə MINI ONLINE SATIŞ-da!",
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
