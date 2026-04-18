require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const categories = [
  { name: 'Backpacks', nameAz: 'Çantalar', slug: 'backpacks', icon: '🎒', description: 'School backpacks and bags' },
  { name: 'Notebooks', nameAz: 'Dəftərlər', slug: 'notebooks', icon: '📓', description: 'Notebooks and writing pads' },
  { name: 'Pens & Pencils', nameAz: 'Qələmlər', slug: 'pens-pencils', icon: '✏️', description: 'Pens, pencils, and markers' },
  { name: 'Art Supplies', nameAz: 'Rəsm Ləvazimatları', slug: 'art-supplies', icon: '🎨', description: 'Colors, brushes, and art tools' },
  { name: 'Geometry Sets', nameAz: 'Hendəsi Dəstlər', slug: 'geometry-sets', icon: '📐', description: 'Rulers, compasses, and geometry tools' },
  { name: 'Organizers', nameAz: 'Təşkilatçılar', slug: 'organizers', icon: '📁', description: 'Folders, binders, and organizers' },
];

const products = [
  // Backpacks
  { name: 'Classic School Backpack', nameAz: 'Klassik Məktəb Çantası', description: 'Durable 30L school backpack with multiple compartments and ergonomic design.', descriptionAz: 'Çoxlu bölmələri olan 30L məktəb çantası.', price: 45.99, stock: 50, categorySlug: 'backpacks', featured: true },
  { name: 'Sport Backpack Pro', nameAz: 'İdman Çantası Pro', description: 'Lightweight sport backpack perfect for gym and school.', descriptionAz: 'İdman zalı və məktəb üçün yüngül çanta.', price: 39.99, stock: 35, categorySlug: 'backpacks', featured: true },
  { name: 'Mini Backpack', nameAz: 'Mini Çanta', description: 'Compact 15L backpack for younger students.', descriptionAz: 'Kiçik tələbələr üçün kompakt 15L çanta.', price: 24.99, stock: 40, categorySlug: 'backpacks', featured: false },
  { name: 'Premium Leather Backpack', nameAz: 'Premium Dəri Çanta', description: 'High-quality faux leather backpack for high school students.', descriptionAz: 'Lisey şagirdləri üçün yüksək keyfiyyətli çanta.', price: 65.99, stock: 20, categorySlug: 'backpacks', featured: true },

  // Notebooks
  { name: 'Spiral Notebook A4', nameAz: 'Spiral Dəftər A4', description: '100-page spiral notebook with ruled lines, perfect for all subjects.', descriptionAz: '100 səhifəli spiral dəftər.', price: 3.99, stock: 200, categorySlug: 'notebooks', featured: false },
  { name: 'Hardcover Journal', nameAz: 'Möhkəm Qaplı Jurnal', description: 'Premium hardcover journal with 200 pages, dot grid pattern.', descriptionAz: '200 səhifəli premium jurnal.', price: 8.99, stock: 80, categorySlug: 'notebooks', featured: true },
  { name: 'Mini Notepad Set (5-pack)', nameAz: 'Mini Bloknotlar Dəsti (5-li)', description: 'Set of 5 mini notepads, assorted colors.', descriptionAz: '5 mini bloknotdan ibarət dəst.', price: 6.49, stock: 120, categorySlug: 'notebooks', featured: false },
  { name: 'Graph Paper Notebook', nameAz: 'Kvadratlı Dəftər', description: 'A4 graph paper notebook for math and science.', descriptionAz: 'Riyaziyyat və elm üçün A4 kvadratlı dəftər.', price: 4.99, stock: 150, categorySlug: 'notebooks', featured: false },

  // Pens & Pencils
  { name: 'Ballpoint Pen Set (10-pack)', nameAz: 'Şarli Qələm Dəsti (10-lu)', description: 'Smooth-writing ballpoint pens, assorted colors, comfortable grip.', descriptionAz: 'Müxtəlif rəngli şarli qələmlər.', price: 4.99, stock: 300, categorySlug: 'pens-pencils', featured: false },
  { name: 'HB Pencil Set (12-pack)', nameAz: 'HB Karandaş Dəsti (12-li)', description: 'Professional HB pencils, pre-sharpened, ideal for writing and drawing.', descriptionAz: 'Professional HB karandaşlar.', price: 3.49, stock: 250, categorySlug: 'pens-pencils', featured: false },
  { name: 'Colored Markers (24-pack)', nameAz: 'Rəngli Markerlər (24-lü)', description: '24 vibrant colors, washable, for art and school projects.', descriptionAz: '24 parlaq rəngli, yuyulabilən markerlər.', price: 12.99, stock: 100, categorySlug: 'pens-pencils', featured: true },
  { name: 'Fountain Pen Starter Kit', nameAz: 'Dolma Qələm Başlanğıc Dəsti', description: 'Entry-level fountain pen with 3 ink cartridges included.', descriptionAz: '3 mürəkkəb kartuşu ilə dolma qələm dəsti.', price: 18.99, stock: 45, categorySlug: 'pens-pencils', featured: true },

  // Art Supplies
  { name: 'Watercolor Paint Set (24 colors)', nameAz: 'Akvarel Boya Dəsti (24 rəng)', description: 'Professional watercolor paints with 2 brushes included.', descriptionAz: '2 fırça ilə professional akvarel boyalar.', price: 14.99, stock: 60, categorySlug: 'art-supplies', featured: true },
  { name: 'Sketch Pad A3', nameAz: 'Eskiz Bloku A3', description: '50-page heavy-duty sketch pad for pencil, charcoal, and pastel.', descriptionAz: '50 səhifəli ağır eskiz bloku.', price: 9.99, stock: 70, categorySlug: 'art-supplies', featured: false },
  { name: 'Oil Pastel Set (36 colors)', nameAz: 'Yağlı Pastel Dəsti (36 rəng)', description: 'Vibrant oil pastels for artistic expression, easy blending.', descriptionAz: 'Asanlıqla qarışdırılan yağlı pasteller.', price: 11.99, stock: 55, categorySlug: 'art-supplies', featured: false },

  // Geometry Sets
  { name: 'Complete Geometry Set', nameAz: 'Tam Hendəsi Dəst', description: 'Metal compass, ruler, protractor, and set squares in a case.', descriptionAz: 'Metal sirkül, xətkeş, bucaqlıq dəsti.', price: 8.99, stock: 90, categorySlug: 'geometry-sets', featured: false },
  { name: '30cm Transparent Ruler', nameAz: '30sm Şəffaf Xətkeş', description: 'Durable transparent plastic ruler with metric and inch markings.', descriptionAz: 'Metr və düym işarələri olan şəffaf xətkeş.', price: 1.99, stock: 400, categorySlug: 'geometry-sets', featured: false },
  { name: 'Scientific Calculator', nameAz: 'Elmi Kalkulyator', description: '240-function scientific calculator for high school and university.', descriptionAz: '240 funksiyalı elmi kalkulyator.', price: 22.99, stock: 75, categorySlug: 'geometry-sets', featured: true },

  // Organizers
  { name: 'A4 Zipper Binder', nameAz: 'A4 Fermuarlı Qovluq', description: 'Waterproof binder with 6 dividers and document pockets.', descriptionAz: '6 bölücü ilə su keçirməyən qovluq.', price: 13.99, stock: 65, categorySlug: 'organizers', featured: false },
  { name: 'Desk Organizer Set', nameAz: 'Masa Üstü Təşkilatçı Dəsti', description: '5-piece desk organizer set, pen holder, paper tray, and more.', descriptionAz: '5 hissəli masa üstü dəst.', price: 19.99, stock: 40, categorySlug: 'organizers', featured: true },
  { name: 'Pencil Case (Large)', nameAz: 'Qələmlik (Böyük)', description: 'Large zippered pencil case with multiple compartments.', descriptionAz: 'Çoxlu bölmələri olan böyük qələmlik.', price: 7.99, stock: 120, categorySlug: 'organizers', featured: false },
];

async function seed() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing data');

  // Create categories
  const categoryMap = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
    console.log(`  ✅ Category: ${cat.nameAz}`);
  }

  // Create products
  for (const prod of products) {
    const { categorySlug, ...prodData } = prod;
    await prisma.product.create({
      data: { ...prodData, categoryId: categoryMap[categorySlug] }
    });
    console.log(`  ✅ Product: ${prod.nameAz}`);
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@mekteb.az',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+994501234567'
    }
  });
  console.log(`\n👤 Admin created: admin@mekteb.az / admin123`);

  // Create demo customer
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.create({
    data: {
      name: 'Aynur Həsənova',
      email: 'aynur@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+994557654321',
      address: 'Bakı şəhəri, Nərimanov rayonu'
    }
  });
  await prisma.cart.create({ data: { userId: customer.id } });
  console.log(`👤 Customer created: aynur@example.com / customer123`);

  // Create a sample order
  const allProducts = await prisma.product.findMany({ take: 3 });
  await prisma.order.create({
    data: {
      userId: customer.id,
      totalPrice: 58.97,
      status: 'CONFIRMED',
      customerName: 'Aynur Həsənova',
      customerPhone: '+994557654321',
      address: 'Bakı şəhəri, Nərimanov rayonu, Əliağa Vahid küçəsi 12',
      orderItems: {
        create: allProducts.map(p => ({
          productId: p.id,
          quantity: 1,
          price: p.price
        }))
      }
    }
  });
  console.log('📦 Sample order created');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:    admin@mekteb.az / admin123');
  console.log('  Customer: aynur@example.com / customer123');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
