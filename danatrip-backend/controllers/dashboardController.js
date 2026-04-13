const Booking = require('../models/Booking');
const Tour = require('../models/Tour');
const User = require('../models/User');
const Review = require('../models/Review');
const Contact = require('../models/Contact');
const Visit = require('../models/Visit');

const monthLabels = [
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6',
  'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
];

const getQuarter = (date) => Math.floor(date.getMonth() / 3) + 1;

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isSameDay = (a, b) => startOfDay(a).getTime() === startOfDay(b).getTime();

const sumRevenue = (bookings = []) =>
  bookings
    .filter((booking) => booking.trangThai === 'Đã thanh toán')
    .reduce((sum, booking) => sum + (booking.tongTien || 0), 0);

const buildRevenueSeries = (bookings = []) => {
  const paidBookings = bookings.filter((booking) => booking.trangThai === 'Đã thanh toán');
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQuarter = getQuarter(now);
  const currentMonth = now.getMonth();

  const monthly = Array.from({ length: 12 }, (_, index) => ({
    label: monthLabels[index],
    total: 0,
  }));

  const quarterly = [
    { label: 'Q1', total: 0 },
    { label: 'Q2', total: 0 },
    { label: 'Q3', total: 0 },
    { label: 'Q4', total: 0 },
  ];

  const years = Array.from({ length: 5 }, (_, index) => currentYear - 4 + index);
  const yearly = years.map((year) => ({ label: String(year), total: 0 }));

  paidBookings.forEach((booking) => {
    const createdAt = new Date(booking.createdAt);
    const bookingYear = createdAt.getFullYear();

    if (bookingYear === currentYear) {
      monthly[createdAt.getMonth()].total += booking.tongTien || 0;
      quarterly[getQuarter(createdAt) - 1].total += booking.tongTien || 0;
    }

    const yearEntry = yearly.find((item) => Number(item.label) === bookingYear);
    if (yearEntry) {
      yearEntry.total += booking.tongTien || 0;
    }
  });

  const totals = {
    month: monthly[currentMonth]?.total || 0,
    quarter: quarterly[currentQuarter - 1]?.total || 0,
    year: yearly.find((item) => Number(item.label) === currentYear)?.total || 0,
    lifetime: sumRevenue(bookings),
  };

  return { monthly, quarterly, yearly, totals };
};

const buildPartnerRevenue = (bookings = [], tours = []) => {
  const tourMap = new Map(tours.map((tour) => [String(tour._id), tour]));
  const partnerMap = new Map();

  bookings
    .filter((booking) => booking.trangThai === 'Đã thanh toán')
    .forEach((booking) => {
      const tour = tourMap.get(String(booking.tour));
      const partnerId = tour?.partner?._id ? String(tour.partner._id) : null;
      const partnerName = tour?.partner?.hoTen || 'Chưa gán đối tác';

      if (!partnerMap.has(partnerId || 'unassigned')) {
        partnerMap.set(partnerId || 'unassigned', {
          partnerId,
          partnerName,
          revenue: 0,
          bookings: 0,
          activeTours: 0,
        });
      }

      const row = partnerMap.get(partnerId || 'unassigned');
      row.revenue += booking.tongTien || 0;
      row.bookings += 1;
    });

  tours.forEach((tour) => {
    const partnerId = tour?.partner?._id ? String(tour.partner._id) : null;
    const partnerName = tour?.partner?.hoTen || 'Chưa gán đối tác';
    const key = partnerId || 'unassigned';

    if (!partnerMap.has(key)) {
      partnerMap.set(key, {
        partnerId,
        partnerName,
        revenue: 0,
        bookings: 0,
        activeTours: 0,
      });
    }

    if (tour.trangThai === 'Hoạt động' && tour.hienThi !== false) {
      partnerMap.get(key).activeTours += 1;
    }
  });

  return Array.from(partnerMap.values()).sort((a, b) => b.revenue - a.revenue);
};

exports.getDashboardOverview = async (req, res) => {
  try {
    const isPartner = req.user.vaiTro === 'Partner';
    const tourQuery = isPartner ? { partner: req.user._id } : {};

    const tours = await Tour.find(tourQuery)
      .populate('partner', 'hoTen email')
      .select('tenTour partner trangThai hienThi createdAt');

    const tourIds = tours.map((tour) => tour._id);
    const bookingQuery = isPartner ? { tour: { $in: tourIds } } : {};
    const reviewQuery = isPartner ? { tour: { $in: tourIds } } : {};

    const [bookings, reviews, contacts, users, visits] = await Promise.all([
      Booking.find(bookingQuery).select('tour tongTien trangThai createdAt'),
      Review.find(reviewQuery).select('tour sao createdAt'),
      isPartner ? Promise.resolve([]) : Contact.find().select('trangThai createdAt'),
      isPartner ? Promise.resolve([]) : User.find().select('createdAt'),
      isPartner ? Promise.resolve([]) : Visit.find().select('createdAt path sessionId'),
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = {
      totalRevenue: sumRevenue(bookings),
      totalBookings: bookings.length,
      activeTours: tours.filter((tour) => tour.trangThai === 'Hoạt động' && tour.hienThi !== false).length,
      newUsers: users.filter((user) => new Date(user.createdAt) >= thirtyDaysAgo).length,
      totalContacts: contacts.length,
      totalVisits: visits.length,
      uniqueVisitors: new Set(visits.map((visit) => visit.sessionId).filter(Boolean)).size,
    };

    const bookingStatuses = {
      'Chờ xác nhận': bookings.filter((booking) => booking.trangThai === 'Chờ xác nhận').length,
      'Đã xác nhận': bookings.filter((booking) => booking.trangThai === 'Đã xác nhận').length,
      'Đã thanh toán': bookings.filter((booking) => booking.trangThai === 'Đã thanh toán').length,
      'Đã hủy': bookings.filter((booking) => booking.trangThai === 'Đã hủy').length,
    };

    const reviewCountMap = reviews.reduce((map, review) => {
      const key = String(review.tour);
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});

    const bookingCountMap = bookings.reduce((map, booking) => {
      const key = String(booking.tour);
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});

    const hotTours = tours
      .map((tour) => ({
        id: tour._id,
        tenTour: tour.tenTour,
        partnerName: tour.partner?.hoTen || 'Chưa gán đối tác',
        bookingCount: bookingCountMap[String(tour._id)] || 0,
        reviewCount: reviewCountMap[String(tour._id)] || 0,
        score: (bookingCountMap[String(tour._id)] || 0) * 2 + (reviewCountMap[String(tour._id)] || 0),
      }))
      .sort((a, b) => b.score - a.score || b.bookingCount - a.bookingCount)
      .slice(0, 5);

    const revenue = buildRevenueSeries(bookings);

    const recentContacts = contacts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const recentBookings = bookings
      .map((booking) => {
        const tour = tours.find((item) => String(item._id) === String(booking.tour));
        return {
          ...booking.toObject(),
          tourName: tour?.tenTour || 'Không rõ tour',
          partnerName: tour?.partner?.hoTen || 'Chưa gán đối tác',
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const visitTrend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return {
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        total: visits.filter((visit) => isSameDay(visit.createdAt, date)).length,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        roleScope: isPartner ? 'partner' : 'website-manager',
        stats,
        revenue,
        bookingStatuses,
        hotTours,
        partnerRevenue: isPartner ? [] : buildPartnerRevenue(bookings, tours),
        widgets: {
          contactsToday: contacts.filter((contact) => isSameDay(contact.createdAt, now)).length,
          unhandledContacts: contacts.filter((contact) => contact.trangThai === 'Chưa xử lý').length,
          visitsToday: visits.filter((visit) => isSameDay(visit.createdAt, now)).length,
          visitTrend,
        },
        recentContacts,
        recentBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
