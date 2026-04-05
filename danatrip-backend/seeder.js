const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Place = require('./models/Place');
const Tour = require('./models/Tour');
const Food = require('./models/Food');
const Review = require('./models/Review');
const Booking = require('./models/Booking');

// 1. DỮ LIỆU USERS
const users = [
  { hoTen: 'Admin DANATrip', email: 'admin@danatrip.com', matKhau: 'admin123', vaiTro: 'Admin', sdt: '0901234567' },
  { hoTen: 'Nguyễn Văn A', email: 'nguyenvana@example.com', matKhau: 'mk123456', vaiTro: 'User', sdt: '0912345678' },
  { hoTen: 'Trần Thị B', email: 'tranthib@example.com', matKhau: 'mk123456', vaiTro: 'User', sdt: '0987654321' },
];

// 2. DỮ LIỆU PLACES (ĐỊA ĐIỂM)
const places = [
  {
    tenDiaDiem: 'Bà Nà Hills',
    noiDung: 'Khu du lịch sinh thái kết hợp vui chơi giải trí hàng đầu Việt Nam, được mệnh danh là "chốn bồng lai tiên cảnh".',
    hinhAnhChinh: 'https://example.com/bana-main.jpg',
    viTri: 'Thôn An Sơn, xã Hòa Ninh, huyện Hòa Vang, TP Đà Nẵng',
    hienThi: true,
    hinhAnh: [{ urlAnh: 'https://example.com/bana1.jpg' }, { urlAnh: 'https://example.com/bana2.jpg' }],
    diemThamQuan: [
      { tenDiem: 'Cầu Vàng', moTa: 'Cây cầu nổi tiếng với đôi bàn tay khổng lồ.', hinhAnh: 'https://example.com/cauvang.jpg' },
      { tenDiem: 'Làng Pháp', moTa: 'Kiến trúc cổ kính đậm chất châu Âu.' }
    ],
    thongTin: [{ tieuDe: 'Giờ mở cửa', noiDung: '07:00 - 22:00 hàng ngày' }]
  },
  {
    tenDiaDiem: 'Bán đảo Sơn Trà',
    noiDung: 'Lá phổi xanh của thành phố Đà Nẵng với hệ sinh thái đa dạng và cảnh quan tuyệt đẹp.',
    hinhAnhChinh: 'https://example.com/sontra-main.jpg',
    viTri: 'Phường Thọ Quang, quận Sơn Trà, TP Đà Nẵng',
    hienThi: true,
    diemThamQuan: [
      { tenDiem: 'Chùa Linh Ứng', moTa: 'Ngôi chùa có tượng Phật Quan Thế Âm cao nhất Việt Nam.' },
      { tenDiem: 'Đỉnh Bàn Cờ', moTa: 'Nơi ngắm toàn cảnh thành phố Đà Nẵng từ trên cao.' }
    ]
  },
  {
    tenDiaDiem: 'Phố cổ Hội An',
    noiDung: 'Di sản văn hóa thế giới với những ngôi nhà cổ kính, đèn lồng rực rỡ.',
    hinhAnhChinh: 'https://example.com/hoian-main.jpg',
    viTri: 'Thành phố Hội An, tỉnh Quảng Nam',
    hienThi: true
  }
];

// 3. DỮ LIỆU MÓN ĂN (FOOD)
const foods = [
  {
    tenMon: 'Mì Quảng Ếch',
    moTa: 'Đặc sản Đà Nẵng với sợi mì dai ngon và thịt ếch đậm đà.',
    hinhAnh: 'https://example.com/miquang.jpg',
    hienThi: true,
    nguyenLieu: [{ tenNguyenLieu: 'Mì Quảng' }, { tenNguyenLieu: 'Thịt ếch' }, { tenNguyenLieu: 'Rau sống' }, { tenNguyenLieu: 'Đậu phộng' }],
    quyTrinh: [
      { thuTu: 1, moTaBuoc: 'Sơ chế ếch sạch sẽ.', thoiGian: '15 phút' },
      { thuTu: 2, moTaBuoc: 'Xào ếch với gia vị cho thấm.', thoiGian: '20 phút' }
    ],
    quanAn: [
      { tenQuanAn: 'Mì Quảng Ếch Bếp Trang', diaChi: '441 Ông Ích Khiêm, Đà Nẵng', sdt: '0236355555' }
    ]
  },
  {
    tenMon: 'Bánh Tráng Cuốn Thịt Heo',
    moTa: 'Thịt heo luộc thái mỏng cuộn cùng rau sống, chấm mắm nêm đặc trưng.',
    hinhAnh: 'https://example.com/banhtrang.jpg',
    hienThi: true,
    nguyenLieu: [{ tenNguyenLieu: 'Thịt heo ba chỉ' }, { tenNguyenLieu: 'Bánh tráng' }, { tenNguyenLieu: 'Mắm nêm' }, { tenNguyenLieu: 'Rau thơm các loại' }],
    quanAn: [
      { tenQuanAn: 'Quán Trần', diaChi: '04 Lê Duẩn, Đà Nẵng', sdt: '0236111222' }
    ]
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Xóa dữ liệu cũ để tránh trùng lặp
    await User.deleteMany();
    await Place.deleteMany();
    await Tour.deleteMany();
    await Food.deleteMany();
    await Review.deleteMany();
    await Booking.deleteMany();
    console.log('🗑️  Cleared old data');

    // 2. Insert Base Data
    const createdUsers = await User.create(users);
    console.log(`👤 Created ${createdUsers.length} users`);

    const createdPlaces = await Place.create(places);
    console.log(`📍 Created ${createdPlaces.length} places`);

    const createdFoods = await Food.create(foods);
    console.log(`🍲 Created ${createdFoods.length} foods`);

    // 3. Insert Tours (Cần liên kết với Place ObjectId)
    const tours = [
      {
        diaDiem: createdPlaces[0]._id, // Liên kết với Bà Nà Hills
        tenTour: 'Tour Bà Nà 1 ngày trọn gói',
        moTaNgan: 'Trải nghiệm cáp treo kỷ lục và ngắm nhìn Cầu Vàng nổi tiếng.',
        moTaChiTiet: 'Khởi hành lúc 8:00 sáng, di chuyển bằng xe du lịch đời mới. Tặng vé buffet trưa tại nhà hàng Arapang...',
        giaNguoiLon: 1250000,
        giaTreEm: 850000,
        soCho: 30,
        soChoDaDat: 5,
        hienThi: true,
        highlights: [{ noiDung: 'Cáp treo khứ hồi' }, { noiDung: 'Ăn trưa Buffet' }, { noiDung: 'Hướng dẫn viên nhiệt tình' }],
        baoGom: [{ noiDung: 'Xe đưa đón', loai: 'included' }, { noiDung: 'Chi phí cá nhân', loai: 'excluded' }]
      },
      {
        diaDiem: createdPlaces[2]._id, // Liên kết với Hội An
        tenTour: 'Tour Ngũ Hành Sơn - Hội An (Buổi chiều)',
        moTaNgan: 'Khám phá Ngũ Hành Sơn huyền bí và dạo bước tại phố cổ lung linh về đêm.',
        giaNguoiLon: 450000,
        giaTreEm: 225000,
        soCho: 45,
        soChoDaDat: 10,
        hienThi: true,
        tags: ['Văn hóa', 'Ban đêm', 'Giá rẻ']
      }
    ];
    const createdTours = await Tour.create(tours);
    console.log(`🚌 Created ${createdTours.length} tours`);

    // 4. Insert Bookings (Cần User ObjectId và Tour ObjectId)
    const bookings = [
      {
        user: createdUsers[1]._id, // Nguyễn Văn A đặt
        tour: createdTours[0]._id, // Tour Bà Nà
        hoTen: 'Nguyễn Văn A',
        sdt: '0912345678',
        soNguoiLon: 2,
        soTreEm: 1,
        tongTien: 1250000 * 2 + 850000,
        phuongThucThanhToan: 'VNPay',
        trangThai: 'Đã thanh toán',
        ghiChu: 'Có trẻ em đi kèm, chuẩn bị ghế trẻ em trên xe.'
      }
    ];
    const createdBookings = await Booking.create(bookings);
    console.log(`🎫 Created ${createdBookings.length} bookings`);

    // 5. Insert Reviews (User A đánh giá Tour Bà Nà sau khi đi)
    const reviews = [
      {
        tour: createdTours[0]._id,
        user: createdUsers[1]._id,
        sao: 5,
        noiDung: 'Tour rất tuyệt vời, hướng dẫn viên nhiệt tình, buffet trưa ngon miệng. Sẽ ủng hộ lần sau!'
      }
    ];
    const createdReviews = await Review.create(reviews);
    console.log(`⭐ Created ${createdReviews.length} reviews`);

    console.log('🎉 Toàn bộ dữ liệu mẫu đã được nạp thành công!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error with seed data: ${error.message}`);
    process.exit(1);
  }
};

seedDB();