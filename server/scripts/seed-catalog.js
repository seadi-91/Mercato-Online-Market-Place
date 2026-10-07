const { Client } = require('pg');
const crypto = require('crypto');

async function seed() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'root',
    database: 'mercatox_catalog_db',
  });

  await client.connect();
  console.log('Connected to mercatox_catalog_db');

  const catRes = await client.query('SELECT id, slug, name FROM categories');
  const catMap = {};
  catRes.rows.forEach(r => {
    catMap[r.slug] = r.id;
  });

  const sellerId = '59972f9f-49ec-4592-9113-ba70a0aa3a52';

  const catalogItems = [
    // Smartphones & Mobile
    {
      title: 'Samsung Galaxy S24 Ultra (512GB Titanium Black)',
      categorySlug: 'smartphones-mobile',
      sku: 'ETH-SAM-S24U-BLK',
      retailPrice: 165000,
      wholesalePrice: 152000,
      stockQuantity: 45,
      unit: 'PIECE',
      description: 'Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, 200MP Quad Tele System, 120Hz Dynamic AMOLED 2X, S-Pen included. 100% Escrow protected with 1-year brand warranty.',
      images: [
        'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Apple iPhone 15 Pro Max (256GB Natural Titanium)',
      categorySlug: 'smartphones-mobile',
      sku: 'ETH-APL-15PM-NAT',
      retailPrice: 185000,
      wholesalePrice: 172000,
      stockQuantity: 30,
      unit: 'PIECE',
      description: 'Apple iPhone 15 Pro Max forged in aerospace-grade titanium with A17 Pro chip, 48MP Main camera, 5x optical zoom, and USB-C. Bole Medhanialem verified stock.',
      images: [
        'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Xiaomi Redmi Note 13 Pro+ 5G (512GB / 12GB RAM)',
      categorySlug: 'smartphones-mobile',
      sku: 'ETH-XIA-RN13P-5G',
      retailPrice: 48500,
      wholesalePrice: 43000,
      stockQuantity: 80,
      unit: 'PIECE',
      description: 'Curved 1.5K 120Hz AMOLED display, 200MP OIS camera, 120W HyperCharge fast charging. Excellent performance for everyday commercial use.',
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80',
      ],
    },
    // Computers & Electronics
    {
      title: 'Apple MacBook Pro 16" (M3 Pro 36GB RAM / 512GB SSD)',
      categorySlug: 'computers-electronics',
      sku: 'ETH-MBP-16-M3P',
      retailPrice: 320000,
      wholesalePrice: 298000,
      stockQuantity: 18,
      unit: 'PIECE',
      description: 'Liquid Retina XDR display, M3 Pro chip with 12-core CPU and 18-core GPU, up to 22 hours of battery life. Perfect for creative professionals and software engineers.',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Dell XPS 15 9530 Core i9 13th Gen (32GB RAM / 1TB SSD)',
      categorySlug: 'computers-electronics',
      sku: 'ETH-DEL-XPS15-I9',
      retailPrice: 225000,
      wholesalePrice: 205000,
      stockQuantity: 22,
      unit: 'PIECE',
      description: 'Intel Core i9-13900H, NVIDIA GeForce RTX 4070, 3.5K OLED InfinityEdge touch display. Verified Bole hardware hub import.',
      images: [
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Sony WH-1000XM5 Wireless Noise-Cancelling Headphones',
      categorySlug: 'computers-electronics',
      sku: 'ETH-SNY-WH1000XM5',
      retailPrice: 38500,
      wholesalePrice: 34000,
      stockQuantity: 65,
      unit: 'PIECE',
      description: 'Industry-leading noise cancelation with two processors and 8 microphones, 30-hour battery life with quick charging, hands-free Speak-to-Chat.',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      ],
    },
    // Fashion, Apparel & Shoes
    {
      title: 'Traditional Handwoven Habesha Kemis (Gold Tilf Embroidery)',
      categorySlug: 'fashion-apparel-shoes',
      sku: 'ETH-FSH-KEMIS-TLF',
      retailPrice: 18500,
      wholesalePrice: 14500,
      stockQuantity: 35,
      unit: 'PIECE',
      description: 'Handwoven pure Ethiopian cotton (Shemma) adorned with exquisite gold-threaded Tilf embroidery. Tailored in Shiro Meda artisan district.',
      images: [
        '/images/hero-cultural-fashion.jpg',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Genuine Ethiopian Leather Executive Briefcase (Piazza Craft)',
      categorySlug: 'fashion-apparel-shoes',
      sku: 'ETH-FSH-LTR-BAG01',
      retailPrice: 6800,
      wholesalePrice: 5200,
      stockQuantity: 90,
      unit: 'PIECE',
      description: '100% full-grain Ethiopian Highland sheep leather, brass hardware, padded laptop compartment. Handcrafted in Piazza artisan workshops.',
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Addis Chelsea Leather Boots (Water-Resistant Sole)',
      categorySlug: 'fashion-apparel-shoes',
      sku: 'ETH-FSH-BOOTS-02',
      retailPrice: 7400,
      wholesalePrice: 5800,
      stockQuantity: 50,
      unit: 'PIECE',
      description: 'Premium cowhide leather Chelsea boot with elastic side panels and durable rubber lug sole. Made in Addis Ababa.',
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
      ],
    },
    // Grains, Cereals & Groceries
    {
      title: 'Yirgacheffe Grade 1 Specialty Roasted Coffee Beans (1kg Bag)',
      categorySlug: 'grains-cereals-groceries',
      sku: 'ETH-GRC-YIRGA-1KG',
      retailPrice: 1850,
      wholesalePrice: 1400,
      stockQuantity: 240,
      unit: 'PIECE',
      description: 'Washed single-origin Arabica from Yirgacheffe highlands with delicate floral aroma, citrus notes, and silky body. Freshly roasted in Addis Ababa.',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Organic Ethiopian Magna Teff Flour (25kg Wholesale Sack)',
      categorySlug: 'grains-cereals-groceries',
      sku: 'ETH-GRC-TEFF-25KG',
      retailPrice: 5600,
      wholesalePrice: 4900,
      stockQuantity: 120,
      unit: 'KUNTAL',
      description: 'Export-grade pure white Magna Teff, naturally gluten-free and mineral rich, milled to silky perfection for authentic Injera preparation.',
      images: [
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Mercato Signature Spice Blend - Traditional Berbere (5kg Pack)',
      categorySlug: 'grains-cereals-groceries',
      sku: 'ETH-GRC-BERB-5KG',
      retailPrice: 2400,
      wholesalePrice: 1950,
      stockQuantity: 150,
      unit: 'PIECE',
      description: 'Sun-dried red peppers expertly stone-ground with korarima, ginger, rue, garlic, and wild herbs from the Mercato spice market.',
      images: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
      ],
    },
    // Home, Kitchen & Appliances
    {
      title: 'Traditional Clay Jebena Coffee Ceremony Set with Sini Cups',
      categorySlug: 'home-kitchen-appliances',
      sku: 'ETH-HM-JEBENA-SET',
      retailPrice: 4500,
      wholesalePrice: 3400,
      stockQuantity: 70,
      unit: 'PIECE',
      description: 'Authentic hand-fired clay Jebena kettle accompanied by 6 matching ceramic Sini cups, wooden Rekebot stand, and charcoal incense burner.',
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Philips Digital Airfryer XXL (7.2L Rapid Air Technology)',
      categorySlug: 'home-kitchen-appliances',
      sku: 'ETH-HM-PHL-AFXXL',
      retailPrice: 28500,
      wholesalePrice: 25000,
      stockQuantity: 40,
      unit: 'PIECE',
      description: 'Fat Removal technology extracts excess fat while cooking, smart chef programs for one-touch meals, 7.2L capacity for family gatherings.',
      images: [
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80',
      ],
    },
    // Cosmetics & Skincare
    {
      title: 'Pure Ethiopian Black Cumin (Tikur Azmud) Cold-Pressed Oil (250ml)',
      categorySlug: 'cosmetics-skincare',
      sku: 'ETH-CSM-AZMUD-250',
      retailPrice: 950,
      wholesalePrice: 750,
      stockQuantity: 180,
      unit: 'PIECE',
      description: '100% virgin cold-pressed Nigella Sativa oil renowned for skin rejuvenation, scalp nourishment, and natural therapeutic hydration.',
      images: [
        'https://images.unsplash.com/photo-1608248597359-bb5941604a37?w=800&auto=format&fit=crop&q=80',
      ],
    },
    {
      title: 'Organic Shea & Acacia Honey Hydrating Facial Serum (50ml)',
      categorySlug: 'cosmetics-skincare',
      sku: 'ETH-CSM-HONEY-50ML',
      retailPrice: 1450,
      wholesalePrice: 1100,
      stockQuantity: 110,
      unit: 'PIECE',
      description: 'Infused with raw Ethiopian acacia honey and unrefined shea butter, formulated to restore skin barrier and natural dewy glow.',
      images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
      ],
    },
  ];

  for (const item of catalogItems) {
    const categoryId = catMap[item.categorySlug];
    if (!categoryId) {
      console.log('Category not found for slug:', item.categorySlug);
      continue;
    }

    const check = await client.query('SELECT id FROM products WHERE sku = $1', [item.sku]);
    if (check.rows.length === 0) {
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO products (
          id, "sellerId", title, description, sku, "categoryId", 
          "retailPrice", "wholesalePrice", "minOrderQuantity", unit, 
          "stockQuantity", "lowStockThreshold", images, "isAvailable", "isActive", 
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
        )`,
        [
          id,
          sellerId,
          item.title,
          item.description,
          item.sku,
          categoryId,
          item.retailPrice,
          item.wholesalePrice,
          1,
          item.unit,
          item.stockQuantity,
          10,
          item.images,
          true,
          true,
        ]
      );
      console.log('Inserted:', item.title);
    }
  }

  const finalCount = await client.query('SELECT count(*) FROM products');
  console.log('Done! Total products in mercatox_catalog_db:', finalCount.rows[0].count);

  await client.end();
}

seed().catch(console.error);
