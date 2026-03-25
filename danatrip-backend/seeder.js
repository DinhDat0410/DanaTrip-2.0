const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Place = require('./models/Place');
const Tour = require('./models/Tour');
const Food = require('./models/Food');

// Dữ liệu mẫu (chuyển từ SQLQuery2.sql)
const users = [
  {
    hoTen: 'Admin DANATrip',
    email: 'admin@danatrip.com',
    matKhau: 'admin123',
    vaiTro: 'Admin',
  },
  {
    hoTen: 'Nguyễn Văn A',
    email: 'a@example.com',
    matKhau: 'mk123456',
    vaiTro: 'User',
  },
  {
    hoTen: 'Trần Thị B',
    email: 'b@example.com',
    matKhau: 'mk123456',
    vaiTro: 'User',
  },
];

const places = [
  {
    tenDiaDiem: 'Bà Nà Hills',
    noiDung: 'Khu du lịch nổi tiếng với Cầu Vàng',
    hinhAnhChinh: 'bana.jpg',
    viTri: 'Đà Nẵng',
    hienThi: true,
    diemThamQuan: [
      { tenDiem: 'Cầu Vàng', moTa: 'Cây cầu biểu tượng' },
      { tenDiem: 'Làng Pháp', moTa: 'Kiến trúc châu Âu' },
    ],
  },
  {
    tenDiaDiem: 'Biển Mỹ Khê',
    noiDung: 'Bãi biển đẹp nhất hành tinh',
    hinhAnhChinh: 'mykhe.jpg',
    viTri: 'Đà Nẵng',
    hienThi: true,
  },
  {
    tenDiaDiem: 'Ngũ Hành Sơn',
    noiDung: 'Danh thắng tự nhiên',
    hinhAnhChinh: 'nguhanhson.jpg',
    viTri: 'Đà Nẵng',
    hienThi: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Xóa dữ liệu cũ
    await User.deleteMany();
    await Place.deleteMany();
    await Tour.deleteMany();
    await Food.deleteMany();
    console.log('🗑️  Cleared old data');

    // Import dữ liệu mới
    const createdUsers = await User.create(users);
    console.log(`👤 Created ${createdUsers.length} users`);

    const createdPlaces = await Place.create(places);
    console.log(`📍 Created ${createdPlaces.length} places`);

    // Tạo tour liên kết với place
    const tours = [
      {
        diaDiem: createdPlaces[0]._id,
        tenTour: 'Tour Bà Nà 1 ngày',
        moTaNgan: 'Trải nghiệm cáp treo và Cầu Vàng',
        giaNguoiLon: 850000,
        soCho: 30,
      },
      {
        diaDiem: createdPlaces[1]._id,
        tenTour: 'Tour biển Mỹ Khê',
        moTaNgan: 'Tắm biển và ăn hải sản',
        giaNguoiLon: 500000,
        soCho: 25,
      },
    ];
    const createdTours = await Tour.create(tours);
    console.log(`🗺️  Created ${createdTours.length} tours`);

    console.log('\n✅ Seeding completed!');
    console.log('🔑 Admin account: admin@danatrip.com / admin123');
    process.exit();
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedDB();