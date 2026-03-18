import { db } from "@workspace/db";
import { categoriesTable, productsTable, reviewsTable } from "@workspace/db";

async function seed() {
  console.log("🌱 Seeding database...");

  const existingCategories = await db.select().from(categoriesTable).limit(1);
  if (existingCategories.length > 0) {
    console.log("Database already seeded, skipping...");
    process.exit(0);
  }

  const categories = await db.insert(categoriesTable).values([
    { name: "Smartphones", nameAr: "الهواتف الذكية", nameFr: "Smartphones", slug: "smartphones", icon: "📱" },
    { name: "Accessoires", nameAr: "الملحقات", nameFr: "Accessoires", slug: "accessoires", icon: "🎧" },
    { name: "Coques & Protection", nameAr: "أغطية الحماية", nameFr: "Coques & Protection", slug: "coques", icon: "🛡️" },
    { name: "Chargeurs", nameAr: "الشواحن", nameFr: "Chargeurs", slug: "chargeurs", icon: "🔋" },
    { name: "Écouteurs", nameAr: "سماعات الأذن", nameFr: "Écouteurs", slug: "ecouteurs", icon: "🎵" },
  ]).returning();

  console.log("✅ Categories created");

  const smartphonesCat = categories[0];
  const accessoiresCat = categories[1];
  const coqueCat = categories[2];
  const chargeurCat = categories[3];
  const ecouteursCat = categories[4];

  const products = await db.insert(productsTable).values([
    {
      name: "iPhone 15 Pro Max 256GB",
      nameAr: "آيفون 15 برو ماكس 256 جيجابايت",
      nameFr: "iPhone 15 Pro Max 256Go",
      description: "Le dernier iPhone Pro Max avec puce A17 Pro, titane naturel, et ProRes vidéo",
      descriptionAr: "أحدث آيفون برو ماكس بشريحة A17 برو، التيتانيوم الطبيعي، وفيديو ProRes",
      descriptionFr: "Le dernier iPhone avec la puce A17 Pro, châssis titane, et fonctionnalités Pro avancées",
      price: "310000",
      originalPrice: "350000",
      images: [
        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90",
        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=800&hei=800&fmt=jpeg&qlt=90"
      ],
      categoryId: smartphonesCat.id,
      stock: 15,
      featured: true,
      onSale: true,
      discount: "11",
      brand: "Apple",
      model: "iPhone 15 Pro Max",
      specs: {
        écran: "6.7 pouces Super Retina XDR",
        processeur: "A17 Pro Bionic",
        ram: "8 Go",
        stockage: "256 Go",
        camera: "48MP + 12MP + 12MP",
        batterie: "4422 mAh",
        os: "iOS 17",
        couleurs: "Titane Naturel, Titane Noir, Titane Blanc, Titane Désert"
      }
    },
    {
      name: "iPhone 15 128GB",
      nameAr: "آيفون 15 128 جيجابايت",
      nameFr: "iPhone 15 128Go",
      description: "iPhone 15 avec Dynamic Island, appareil photo 48MP et USB-C",
      descriptionAr: "آيفون 15 مع Dynamic Island، كاميرا 48 ميغابكسل ومنفذ USB-C",
      descriptionFr: "iPhone 15 standard avec Dynamic Island, caméra 48MP et connecteur USB-C",
      price: "215000",
      originalPrice: null,
      images: [
        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=800&hei=800&fmt=jpeg&qlt=90"
      ],
      categoryId: smartphonesCat.id,
      stock: 22,
      featured: true,
      onSale: false,
      discount: null,
      brand: "Apple",
      model: "iPhone 15",
      specs: {
        écran: "6.1 pouces Super Retina XDR",
        processeur: "A16 Bionic",
        ram: "6 Go",
        stockage: "128 Go",
        camera: "48MP + 12MP",
        batterie: "3877 mAh",
        os: "iOS 17"
      }
    },
    {
      name: "Samsung Galaxy S24 Ultra 256GB",
      nameAr: "سامسونج جالاكسي S24 الترا 256 جيجابايت",
      nameFr: "Samsung Galaxy S24 Ultra 256Go",
      description: "Galaxy S24 Ultra avec S Pen intégré, IA avancée et zoom 100x",
      descriptionAr: "جالاكسي S24 الترا مع قلم S Pen مدمج، ذكاء اصطناعي متقدم وتكبير 100x",
      descriptionFr: "Le summum de Samsung avec S Pen intégré, Galaxy AI et zoom 100x",
      price: "285000",
      originalPrice: "320000",
      images: [
        "https://images.samsung.com/is/image/samsung/p6pim/fr/2401/gallery/fr-galaxy-s24-ultra-s928-sm-s928bztheub-539559167?$720_576_PNG$"
      ],
      categoryId: smartphonesCat.id,
      stock: 10,
      featured: true,
      onSale: true,
      discount: "11",
      brand: "Samsung",
      model: "Galaxy S24 Ultra",
      specs: {
        écran: "6.8 pouces Dynamic AMOLED 2X",
        processeur: "Snapdragon 8 Gen 3",
        ram: "12 Go",
        stockage: "256 Go",
        camera: "200MP + 50MP + 10MP + 12MP",
        batterie: "5000 mAh",
        os: "Android 14, One UI 6.1"
      }
    },
    {
      name: "Samsung Galaxy A55 128GB",
      nameAr: "سامسونج جالاكسي A55 128 جيجابايت",
      nameFr: "Samsung Galaxy A55 128Go",
      description: "Smartphone milieu de gamme performant avec excellent rapport qualité-prix",
      descriptionAr: "هاتف ذكي من الفئة المتوسطة بأداء ممتاز وقيمة رائعة مقابل المال",
      descriptionFr: "Excellent rapport qualité-prix avec design premium et performances solides",
      price: "85000",
      originalPrice: null,
      images: [
        "https://images.samsung.com/is/image/samsung/p6pim/fr/sm-a556bzkfeub/gallery/fr-galaxy-a55-5g-sm-a556-488741-sm-a556bzkfeub-540187735?$720_576_PNG$"
      ],
      categoryId: smartphonesCat.id,
      stock: 35,
      featured: false,
      onSale: false,
      discount: null,
      brand: "Samsung",
      model: "Galaxy A55",
      specs: {
        écran: "6.6 pouces Super AMOLED",
        processeur: "Exynos 1480",
        ram: "8 Go",
        stockage: "128 Go",
        camera: "50MP + 12MP + 5MP",
        batterie: "5000 mAh",
        os: "Android 14, One UI 6.1"
      }
    },
    {
      name: "Xiaomi Redmi Note 13 Pro 256GB",
      nameAr: "شاومي ريدمي نوت 13 برو 256 جيجابايت",
      nameFr: "Xiaomi Redmi Note 13 Pro 256Go",
      description: "Redmi Note 13 Pro avec caméra 200MP et charge rapide 67W",
      descriptionAr: "ريدمي نوت 13 برو مع كاميرا 200 ميغابكسل وشحن سريع 67 واط",
      descriptionFr: "Le meilleur rapport qualité-prix avec caméra 200MP et recharge ultra rapide",
      price: "68000",
      originalPrice: "75000",
      images: [
        "https://i01.appmifile.com/webfile/globalimg/products/m/redmi-note-13-pro-5g/overview-pc-img-2.png"
      ],
      categoryId: smartphonesCat.id,
      stock: 28,
      featured: false,
      onSale: true,
      discount: "9",
      brand: "Xiaomi",
      model: "Redmi Note 13 Pro",
      specs: {
        écran: "6.67 pouces AMOLED",
        processeur: "Dimensity 7200 Ultra",
        ram: "8 Go",
        stockage: "256 Go",
        camera: "200MP + 8MP + 2MP",
        batterie: "5100 mAh",
        os: "Android 13, MIUI 14"
      }
    },
    {
      name: "AirPods Pro 2ème génération",
      nameAr: "إيربودز برو الجيل الثاني",
      nameFr: "AirPods Pro 2ème génération",
      description: "AirPods Pro avec réduction active du bruit, audio adaptatif et résistance à l'eau",
      descriptionAr: "إيربودز برو مع إلغاء الضوضاء النشط، الصوت التكيفي ومقاومة الماء",
      descriptionFr: "La meilleure expérience audio sans fil Apple avec ANC avancé",
      price: "32000",
      originalPrice: "38000",
      images: [
        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MQD83?wid=400&hei=400&fmt=jpeg&qlt=95"
      ],
      categoryId: ecouteursCat.id,
      stock: 42,
      featured: false,
      onSale: true,
      discount: "16",
      brand: "Apple",
      model: "AirPods Pro 2nd Gen",
      specs: {
        type: "In-ear",
        anc: "Oui, actif",
        autonomie: "6h (30h avec boitier)",
        résistance: "IPX4",
        connectivité: "Bluetooth 5.3",
        chip: "H2"
      }
    },
    {
      name: "Coque iPhone 15 Pro Silicone Premium",
      nameAr: "غطاء آيفون 15 برو سيليكون بريميوم",
      nameFr: "Coque iPhone 15 Pro Silicone Premium",
      description: "Coque de protection premium en silicone doux, anti-choc et anti-rayures",
      descriptionAr: "غطاء حماية فاخر من السيليكون الناعم، مضاد للصدمات والخدوش",
      descriptionFr: "Protection optimale avec silicone doux et contours surélevés",
      price: "2500",
      originalPrice: null,
      images: [],
      categoryId: coqueCat.id,
      stock: 100,
      featured: false,
      onSale: false,
      discount: null,
      brand: "Generic",
      model: "iPhone 15 Pro Case",
      specs: { matériau: "Silicone TPU", compatibilité: "iPhone 15 Pro", protection: "Angles renforcés" }
    },
    {
      name: "Chargeur USB-C 20W Apple Original",
      nameAr: "شاحن USB-C 20 واط أبل الأصلي",
      nameFr: "Chargeur USB-C 20W Apple Original",
      description: "Chargeur rapide original Apple 20W avec USB-C pour iPhone et iPad",
      descriptionAr: "شاحن أبل الأصلي 20 واط بمنفذ USB-C لآيفون وآيباد",
      descriptionFr: "Chargeur rapide officiel Apple pour une recharge optimale",
      price: "4500",
      originalPrice: "5500",
      images: [],
      categoryId: chargeurCat.id,
      stock: 60,
      featured: false,
      onSale: true,
      discount: "18",
      brand: "Apple",
      model: "20W USB-C Power Adapter",
      specs: { puissance: "20W", connecteur: "USB-C", compatibilité: "iPhone 8 et plus, iPad", certification: "MFi" }
    },
  ]).returning();

  console.log("✅ Products created:", products.length);

  const iphone15proId = products[0].id;
  const samsungS24Id = products[2].id;

  await db.insert(reviewsTable).values([
    { productId: iphone15proId, customerName: "Mohamed A.", rating: 5, comment: "Les meilleurs produits Apple 💪 Livraison rapide et emballage soigné!", verified: true },
    { productId: iphone15proId, customerName: "Fatima B.", rating: 5, comment: "Bon rapport qualité prix, produit conforme à la description. Je recommande!", verified: true },
    { productId: iphone15proId, customerName: "Karim D.", rating: 5, comment: "Livraison rapide, produit conforme. Très satisfait de mon achat!", verified: true },
    { productId: iphone15proId, customerName: "Amira K.", rating: 5, comment: "Service excellent, je recommande! Le téléphone est magnifique.", verified: true },
    { productId: iphone15proId, customerName: "Youcef M.", rating: 4, comment: "Très bon téléphone, prix correct pour l'Algérie. Livraison en 2 jours.", verified: true },
    { productId: samsungS24Id, customerName: "Sarah L.", rating: 5, comment: "Incroyable ce Samsung! Le S Pen est super pratique. Merci Amiri Phone!", verified: true },
    { productId: samsungS24Id, customerName: "Hamza R.", rating: 5, comment: "Top qualité! Appareil photo exceptionnel. Très recommandé.", verified: true },
    { productId: samsungS24Id, customerName: "Nadia C.", rating: 4, comment: "Bel appareil, bien emballé. Conforme à la description. Satisfaite!", verified: true },
  ]);

  console.log("✅ Reviews created");
  console.log("🎉 Database seeded successfully!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
