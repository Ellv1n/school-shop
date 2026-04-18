require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        address TEXT,
        role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) UNIQUE NOT NULL,
        name_az VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        name_az VARCHAR(255) NOT NULL,
        description TEXT,
        description_az TEXT,
        price NUMERIC(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image VARCHAR(500),
        featured BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        category_id UUID REFERENCES categories(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS carts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(cart_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        total_price NUMERIC(10,2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        address TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Tables created');

    // Check if already seeded
    const { rows } = await client.query('SELECT COUNT(*) FROM categories');
    if (parseInt(rows[0].count) > 0) {
      console.log('⏭️  Already seeded, skipping...');
      return;
    }

    console.log('🌱 Seeding data...');

    // Categories
    const categories = [
      { name: 'Backpacks',      nameAz: 'Çantalar',           slug: 'backpacks',     icon: '🎒' },
      { name: 'Notebooks',      nameAz: 'Dəftərlər',          slug: 'notebooks',     icon: '📓' },
      { name: 'Pens & Pencils', nameAz: 'Qələmlər',           slug: 'pens-pencils',  icon: '✏️' },
      { name: 'Art Supplies',   nameAz: 'Rəsm Ləvazimatları', slug: 'art-supplies',  icon: '🎨' },
      { name: 'Geometry Sets',  nameAz: 'Hendəsi Dəstlər',    slug: 'geometry-sets', icon: '📐' },
      { name: 'Organizers',     nameAz: 'Təşkilatçılar',      slug: 'organizers',    icon: '📁' },
    ];

    const catMap = {};
    for (const cat of categories) {
      const id = uuidv4();
      await client.query(
        `INSERT INTO categories (id, name, name_az, slug, icon) VALUES ($1,$2,$3,$4,$5)`,
        [id, cat.name, cat.nameAz, cat.slug, cat.icon]
      );
      catMap[cat.slug] = id;
      console.log(`  ✅ ${cat.nameAz}`);
    }

    // Products
    const products = [
      { name: 'Classic School Backpack', nameAz: 'Klassik Məktəb Çantası',  descAz: '30L məktəb çantası, çoxlu bölmələr.',        price: 45.99, stock: 50,  cat: 'backpacks',     featured: true  },
      { name: 'Sport Backpack Pro',      nameAz: 'İdman Çantası Pro',        descAz: 'Yüngül idman çantası.',                      price: 39.99, stock: 35,  cat: 'backpacks',     featured: true  },
      { name: 'Mini Backpack',           nameAz: 'Mini Çanta',               descAz: 'Kiçik 15L çanta.',                           price: 24.99, stock: 40,  cat: 'backpacks',     featured: false },
      { name: 'Premium Backpack',        nameAz: 'Premium Çanta',            descAz: 'Yüksək keyfiyyətli məktəb çantası.',         price: 65.99, stock: 20,  cat: 'backpacks',     featured: true  },
      { name: 'Spiral Notebook A4',      nameAz: 'Spiral Dəftər A4',         descAz: '100 səhifəli spiral dəftər.',                price: 3.99,  stock: 200, cat: 'notebooks',     featured: false },
      { name: 'Hardcover Journal',       nameAz: 'Möhkəm Qaplı Jurnal',      descAz: '200 səhifəli premium jurnal.',               price: 8.99,  stock: 80,  cat: 'notebooks',     featured: true  },
      { name: 'Graph Paper Notebook',    nameAz: 'Kvadratlı Dəftər',         descAz: 'Riyaziyyat üçün A4 dəftər.',                 price: 4.99,  stock: 150, cat: 'notebooks',     featured: false },
      { name: 'Ballpoint Pen Set 10pk',  nameAz: 'Şarli Qələm Dəsti (10lu)', descAz: 'Müxtəlif rəngli şarli qələmlər.',           price: 4.99,  stock: 300, cat: 'pens-pencils',  featured: false },
      { name: 'HB Pencil Set 12pk',      nameAz: 'HB Karandaş Dəsti (12li)', descAz: 'Professional HB karandaşlar.',              price: 3.49,  stock: 250, cat: 'pens-pencils',  featured: false },
      { name: 'Colored Markers 24pk',    nameAz: 'Rəngli Markerlər (24lü)',   descAz: '24 parlaq rəngli, yuyulabilən markerlər.',  price: 12.99, stock: 100, cat: 'pens-pencils',  featured: true  },
      { name: 'Fountain Pen Kit',        nameAz: 'Dolma Qələm Dəsti',        descAz: '3 mürəkkəb ilə dolma qələm dəsti.',         price: 18.99, stock: 45,  cat: 'pens-pencils',  featured: true  },
      { name: 'Watercolor Paint 24',     nameAz: 'Akvarel Boya Dəsti (24)',   descAz: '24 rəngli akvarel boyalar, 2 fırça.',       price: 14.99, stock: 60,  cat: 'art-supplies',  featured: true  },
      { name: 'Oil Pastel Set 36',       nameAz: 'Yağlı Pastel (36 rəng)',    descAz: '36 rəngli yağlı pasteller.',               price: 11.99, stock: 55,  cat: 'art-supplies',  featured: false },
      { name: 'Complete Geometry Set',   nameAz: 'Tam Hendəsi Dəst',         descAz: 'Sirkül, xətkeş, bucaqlıq dəsti.',           price: 8.99,  stock: 90,  cat: 'geometry-sets', featured: false },
      { name: 'Scientific Calculator',   nameAz: 'Elmi Kalkulyator',         descAz: '240 funksiyalı elmi kalkulyator.',           price: 22.99, stock: 75,  cat: 'geometry-sets', featured: true  },
      { name: '30cm Ruler',              nameAz: '30sm Şəffaf Xətkeş',       descAz: 'Metr və düym işarəli şəffaf xətkeş.',       price: 1.99,  stock: 400, cat: 'geometry-sets', featured: false },
      { name: 'A4 Zipper Binder',        nameAz: 'A4 Fermuarlı Qovluq',      descAz: '6 bölücü ilə su keçirməyən qovluq.',       price: 13.99, stock: 65,  cat: 'organizers',    featured: false },
      { name: 'Desk Organizer Set',      nameAz: 'Masa Üstü Dəst',           descAz: '5 hissəli masa üstü təşkilatçı dəsti.',     price: 19.99, stock: 40,  cat: 'organizers',    featured: true  },
      { name: 'Large Pencil Case',       nameAz: 'Böyük Qələmlik',           descAz: 'Çoxlu bölmələri olan böyük qələmlik.',      price: 7.99,  stock: 120, cat: 'organizers',    featured: false },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (id, name, name_az, description_az, price, stock, category_id, featured)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [uuidv4(), p.name, p.nameAz, p.descAz, p.price, p.stock, catMap[p.cat], p.featured]
      );
      console.log(`  ✅ ${p.nameAz}`);
    }

    // Admin user
    const adminId = uuidv4();
    const adminPw = await bcrypt.hash('admin123', 12);
    await client.query(
      `INSERT INTO users (id, name, email, password, role) VALUES ($1,$2,$3,$4,$5)`,
      [adminId, 'Admin', 'admin@mekteb.az', adminPw, 'ADMIN']
    );

    // Customer user
    const custId = uuidv4();
    const custPw = await bcrypt.hash('customer123', 12);
    await client.query(
      `INSERT INTO users (id, name, email, password, phone, role) VALUES ($1,$2,$3,$4,$5,$6)`,
      [custId, 'Aynur Həsənova', 'aynur@example.com', custPw, '+994557654321', 'CUSTOMER']
    );
    await client.query(
      `INSERT INTO carts (id, user_id) VALUES ($1,$2)`,
      [uuidv4(), custId]
    );

    console.log('\n✅ Seed tamamlandı!');
    console.log('Admin:    admin@mekteb.az / admin123');
    console.log('Müştəri:  aynur@example.com / customer123');

  } catch (err) {
    console.error('❌ Init DB error:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

initDB()
  .then(() => { console.log('✅ Done'); process.exit(0); })
  .catch((e) => { console.error(e); process.exit(1); });
